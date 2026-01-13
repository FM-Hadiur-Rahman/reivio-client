import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";
import { toast } from "react-toastify";

const pill = (deleted) =>
  deleted
    ? "bg-red-50 text-red-700 ring-red-200"
    : "bg-emerald-50 text-emerald-700 ring-emerald-200";

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | active | deleted

  const fetchListings = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/listings");
      setListings(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("❌ Failed to fetch listings:", e);
      setErr(e?.response?.data?.message || "Failed to fetch listings");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const counts = useMemo(() => {
    const total = listings.length;
    const deleted = listings.filter((l) => l.isDeleted).length;
    const active = total - deleted;
    return { total, active, deleted };
  }, [listings]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return listings
      .filter((l) => {
        if (status === "active" && l.isDeleted) return false;
        if (status === "deleted" && !l.isDeleted) return false;
        if (!qq) return true;

        const hay = `${l._id || ""} ${l.title || ""} ${
          l.location?.address || ""
        } ${l.district || ""} ${l.division || ""} ${l.hostId?.name || ""} ${
          l.hostId?.email || ""
        }`.toLowerCase();

        return hay.includes(qq);
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [listings, q, status]);

  const handleRestore = async (id) => {
    const ok = window.confirm("Restore this listing?");
    if (!ok) return;

    try {
      setProcessingId(id);
      await api.patch(`/api/admin/listings/${id}/restore`);
      toast.success("✅ Listing restored");
      await fetchListings();
    } catch (e) {
      console.error("❌ Failed to restore listing:", e);
      toast.error(e?.response?.data?.message || "Failed to restore listing");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Soft-delete this listing?");
    if (!ok) return;

    try {
      setProcessingId(id);
      await api.patch(`/api/admin/listings/${id}/soft-delete`);
      toast.success("🗑 Listing soft-deleted");
      await fetchListings();
    } catch (e) {
      console.error("❌ Failed to soft-delete listing:", e);
      toast.error(
        e?.response?.data?.message || "Failed to soft-delete listing"
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Listings
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              🏠 All Listings
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Search listings, review hosts, and soft-delete/restore safely.
            </p>
          </div>

          <button
            onClick={fetchListings}
            disabled={loading}
            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh ↻"}
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Total listings</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">
              {counts.total}
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <div className="text-xs text-emerald-700">Active</div>
            <div className="mt-1 text-2xl font-extrabold text-emerald-900">
              {counts.active}
            </div>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <div className="text-xs text-red-700">Deleted</div>
            <div className="mt-1 text-2xl font-extrabold text-red-900">
              {counts.deleted}
            </div>
          </div>
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
                placeholder="Search title, address, host name/email…"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              />
            </div>

            <div className="w-full md:w-56">
              <label className="text-xs font-semibold text-slate-600">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              >
                <option value="all">All ({counts.total})</option>
                <option value="active">Active ({counts.active})</option>
                <option value="deleted">Deleted ({counts.deleted})</option>
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
              {listings.length}
            </span>{" "}
            listings.
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
            Loading listings…
          </div>
        )}

        {!loading && err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="font-semibold text-red-800">
              Couldn’t load listings
            </div>
            <div className="text-sm text-red-700 mt-1">{err}</div>
            <button
              onClick={fetchListings}
              className="mt-4 rounded-2xl px-4 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !err && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              No listings found
            </div>
            <div className="text-sm text-slate-600 mt-1">
              Try a different search or status filter.
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && !err && filtered.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Listings
              </div>
              <div className="text-xs text-slate-500">Sorted by newest</div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white text-slate-600">
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                      Host
                    </th>
                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((l) => {
                    const isRowBusy = processingId === l._id;
                    return (
                      <tr
                        key={l._id}
                        className={[
                          "hover:bg-slate-50/70 transition",
                          l.isDeleted ? "bg-red-50/40 text-slate-600" : "",
                        ].join(" ")}
                      >
                        <td className="px-4 py-3">
                          <div
                            className={
                              l.isDeleted
                                ? "line-through"
                                : "font-semibold text-slate-900"
                            }
                          >
                            {l.title || "—"}
                          </div>
                          <div className="text-xs text-slate-500 break-all">
                            {l._id}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="text-slate-900">
                            {l.location?.address ||
                              `${l.district || ""} ${l.division || ""}` ||
                              "—"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {l.district || l.location?.district || ""}{" "}
                            {l.division || l.location?.division || ""}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {l.hostId?.name || "—"}
                          </div>
                          <div className="text-xs text-slate-500 break-all">
                            {l.hostId?.email || ""}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={[
                              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1",
                              pill(l.isDeleted),
                            ].join(" ")}
                          >
                            <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                            {l.isDeleted ? "DELETED" : "ACTIVE"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/admin/listings/${l._id}`}
                              className="rounded-2xl px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition"
                            >
                              View
                            </Link>

                            {l.isDeleted ? (
                              <button
                                onClick={() => handleRestore(l._id)}
                                disabled={isRowBusy}
                                className="rounded-2xl px-3 py-2 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60"
                              >
                                {isRowBusy ? "Restoring…" : "Restore"}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDelete(l._id)}
                                disabled={isRowBusy}
                                className="rounded-2xl px-3 py-2 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                              >
                                {isRowBusy ? "Deleting…" : "Soft delete"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
              Tip: Use soft delete for moderation; restore if the issue is
              resolved.
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
