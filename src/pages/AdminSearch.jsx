// src/pages/AdminSearch.jsx
import React, { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { Link } from "react-router-dom";
import { api } from "../services/api";

const AdminSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [exporting, setExporting] = useState(false);

  const doSearch = useCallback(async () => {
    const q = (query || "").trim();
    if (!q) {
      setResults(null);
      setErr("Please enter a search query.");
      return;
    }
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/search", { params: { query: q } });
      setResults(res.data || null);
      if (
        !res.data ||
        (!res.data.user && !res.data.booking && !res.data.tripReservation)
      ) {
        setErr("No matches found.");
      }
    } catch (e) {
      console.error("Search failed", e);
      setErr("Search error. Please try again.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Optional: run when component mounts with existing query in URL (?q=..)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setQuery(q);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      (async () => await doSearch())();
    }
  }, [doSearch]);

  const onKeyDown = (e) => {
    if (e.key === "Enter") doSearch();
  };

  const handleExport = async (type) => {
    const q = (query || "").trim();
    if (!q) return;
    try {
      setExporting(true);
      // Secure: keep token in header; get a blob and download
      const res = await api.get("/api/admin/export-search", {
        params: { query: q, type },
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: type === "csv" ? "text/csv;charset=utf-8" : "application/pdf",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      a.download = `admin-search-${ts}.${type}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-4">🔍 Admin Search</h2>

      <div className="flex gap-4 mb-3">
        <input
          type="text"
          placeholder="User ID, Email, Booking ID, Listing Title, Transaction ID..."
          className="border px-4 py-2 w-full rounded"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          onClick={doSearch}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {results && (
        <div className="mb-4 flex gap-4">
          <button
            onClick={() => handleExport("csv")}
            className="btn btn-outline"
            disabled={exporting}
          >
            ⬇ {exporting ? "Exporting…" : "Export CSV"}
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="btn btn-outline"
            disabled={exporting}
          >
            🧾 {exporting ? "Exporting…" : "Export PDF"}
          </button>
        </div>
      )}

      {err && <p className="text-red-600 mb-3">{err}</p>}

      {results?.user && (
        <div className="bg-white shadow p-4 rounded mb-4">
          <h3 className="font-semibold">👤 User Info</h3>
          <p>
            <b>Name:</b> {results.user.name || "—"}
          </p>
          <p>
            <b>Email:</b> {results.user.email || "—"}
          </p>
          <p>
            <b>Role:</b> {results.user.role || "—"}
          </p>
          <p>
            <b>ID:</b> {results.user._id}
          </p>
          <Link
            to={`/admin/users/${results.user._id}`}
            className="text-blue-600 underline"
          >
            View full user page
          </Link>
        </div>
      )}

      {results?.booking && (
        <div className="bg-white shadow p-4 rounded mb-4">
          <h3 className="font-semibold">📦 Booking Info</h3>
          <p>
            <b>ID:</b> {results.booking._id}
          </p>
          <p>
            <b>Guest:</b> {results.booking.guestId?.name || "—"}
          </p>
          <p>
            <b>Listing:</b> {results.booking.listingId?.title || "—"}
          </p>
          <p>
            <b>Dates:</b> {results.booking.dateFrom || "—"} →{" "}
            {results.booking.dateTo || "—"}
          </p>
          <p>
            <b>Status:</b> {results.booking.paymentStatus || "—"}
          </p>
          <Link
            to={`/admin/bookings/${results.booking._id}`}
            className="text-blue-600 underline"
          >
            View full booking page
          </Link>
        </div>
      )}

      {results?.tripReservation && (
        <div className="bg-white shadow p-4 rounded">
          <h3 className="font-semibold">🚘 Trip Reservation</h3>
          <p>
            <b>User:</b> {results.tripReservation.userId?.name || "—"}
          </p>
          <p>
            <b>Trip ID:</b> {results.tripReservation.tripId?._id || "—"}
          </p>
          <p>
            <b>Status:</b> {results.tripReservation.status || "—"}
          </p>
          <p>
            <b>Transaction:</b> {results.tripReservation.tran_id || "—"}
          </p>
          <Link
            to={`/admin/trips/${results.tripReservation.tripId?._id}`}
            className="text-blue-600 underline"
          >
            View full trip page
          </Link>
        </div>
      )}

      {results &&
        !results.user &&
        !results.booking &&
        !results.tripReservation && (
          <p className="text-red-500">❌ No matches found.</p>
        )}
    </AdminLayout>
  );
};

export default AdminSearch;
