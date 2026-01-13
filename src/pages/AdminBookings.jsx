import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : "—");

const pill = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "paid" || s === "success")
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (s === "pending") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (s === "failed" || s === "cancelled")
    return "bg-red-50 text-red-700 ring-red-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | paid | pending | failed | cancelled

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/bookings");
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("❌ Failed to fetch bookings", e);
      setErr(e?.response?.data?.message || "Failed to fetch bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const normalized = useMemo(() => {
    return bookings.map((b) => {
      const st = (b.paymentStatus || b.status || "unknown").toLowerCase();
      const guestName = b.guestId?.name || "";
      const guestEmail = b.guestId?.email || "";
      const listingTitle = b.listingId?.title || "";
      const id = b._id || "";
      return {
        ...b,
        _st: st,
        _guestName: guestName,
        _guestEmail: guestEmail,
        _listingTitle: listingTitle,
        _idStr: id,
      };
    });
  }, [bookings]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return normalized
      .filter((b) => {
        const okStatus = status === "all" ? true : b._st === status;
        if (!okStatus) return false;
        if (!qq) return true;
        const hay =
          `${b._idStr} ${b._guestName} ${b._guestEmail} ${b._listingTitle}`.toLowerCase();
        return hay.includes(qq);
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [normalized, q, status]);

  const counts = useMemo(() => {
    const c = {
      all: bookings.length,
      paid: 0,
      pending: 0,
      failed: 0,
      cancelled: 0,
    };
    normalized.forEach((b) => {
      if (c[b._st] != null) c[b._st] += 1;
    });
    return c;
  }, [bookings.length, normalized]);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Bookings
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              📅 All Bookings
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Search and filter bookings by guest, listing, or status.
            </p>
          </div>

          <button
            onClick={fetchBookings}
            disabled={loading}
            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh ↻"}
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3 md:p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600">
                Search
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search booking id, guest email, listing title…"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              />
            </div>

            <div className="w-full md:w-64">
              <label className="text-xs font-semibold text-slate-600">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              >
                <option value="all">All ({counts.all})</option>
                <option value="paid">Paid ({counts.paid})</option>
                <option value="pending">Pending ({counts.pending})</option>
                <option value="failed">Failed ({counts.failed})</option>
                <option value="cancelled">
                  Cancelled ({counts.cancelled})
                </option>
              </select>
            </div>

            <button
              onClick={() => {
                setQ("");
                setStatus("all");
              }}
              className="md:mt-5 rounded-2xl px-4 py-2.5 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition"
            >
              Clear
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {bookings.length}
            </span>{" "}
            bookings.
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
            Loading bookings…
          </div>
        )}

        {!loading && err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="font-semibold text-red-800">
              Couldn’t load bookings
            </div>
            <div className="text-sm text-red-700 mt-1">{err}</div>
            <button
              onClick={fetchBookings}
              className="mt-4 rounded-2xl px-4 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !err && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              No bookings found
            </div>
            <div className="text-sm text-slate-600 mt-1">
              Try changing filters or search query.
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && !err && filtered.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Bookings
              </div>
              <div className="text-xs text-slate-500">Sorted by newest</div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white text-slate-600">
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                      Guest
                    </th>
                    <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                      Listing
                    </th>
                    <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                      Check-in
                    </th>
                    <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                      Check-out
                    </th>
                    <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {b.guestId?.name || "—"}
                        </div>
                        <div className="text-xs text-slate-500 break-all">
                          {b.guestId?.email || ""}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {b.listingId?.title || "—"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {b.listingId?.location?.district ||
                            b.listingId?.location?.division ||
                            ""}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={[
                            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1",
                            pill(b.paymentStatus || b.status),
                          ].join(" ")}
                        >
                          <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                          {(
                            b.paymentStatus ||
                            b.status ||
                            "unknown"
                          ).toUpperCase()}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                        {fmtDate(b.dateFrom)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                        {fmtDate(b.dateTo)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/bookings/${b._id}`}
                          className="inline-flex items-center justify-center rounded-2xl px-3 py-2 text-xs font-semibold
                                     bg-teal-600 text-white hover:bg-teal-700 transition"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
              Tip: Add quick actions (refund, payout issued) on the detail page
              for safer operations.
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
