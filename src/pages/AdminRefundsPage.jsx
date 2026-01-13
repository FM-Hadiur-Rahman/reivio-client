// src/pages/AdminRefundsPage.jsx (Premium)
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const bdt = new Intl.NumberFormat("bn-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const fmtTime = (iso) => {
  try {
    return iso ? new Date(iso).toLocaleString() : "—";
  } catch {
    return "—";
  }
};

const Badge = ({ tone = "slate", children }) => {
  const cls =
    tone === "amber"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : tone === "green"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "red"
      ? "bg-red-50 text-red-700 ring-red-200"
      : "bg-slate-100 text-slate-700 ring-slate-200";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${cls}`}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-60" />
      {children}
    </span>
  );
};

const Stat = ({ label, value, tone = "default" }) => {
  const cls =
    tone === "teal"
      ? "border-teal-200 bg-teal-50 text-teal-900"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : tone === "red"
      ? "border-red-200 bg-red-50 text-red-900"
      : "border-slate-200 bg-white text-slate-900";
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${cls}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
    </div>
  );
};

const CopyBtn = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(value || ""));
      setCopied(true);
      toast.info("Copied");
      setTimeout(() => setCopied(false), 900);
    } catch {}
  };
  return (
    <button
      onClick={onCopy}
      type="button"
      className="rounded-xl border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
      title="Copy"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | refunded | other

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/refund-requests");
      setRefunds(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("❌ Failed to load refunds", e);
      setErr(e?.response?.data?.message || "Failed to load refunds.");
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const normalized = useMemo(() => {
    return refunds.map((b) => {
      const amount = Math.abs(
        Number(
          b?.extraPayment?.amount ??
            b?.refundAmount ??
            b?.extraPayment?.dueAmount ??
            0
        )
      );
      const status = (b?.extraPayment?.status || b?.refundStatus || "pending")
        .toString()
        .toLowerCase();
      const guestName = b.guestId?.name || "";
      const guestEmail = b.guestId?.email || "";
      const title = b.listingId?.title || "";
      const reason = b.extraPayment?.reason || b.refundReason || "";
      return {
        ...b,
        _amount: amount || 0,
        _status: status,
        _guestName: guestName,
        _guestEmail: guestEmail,
        _title: title,
        _reason: reason,
      };
    });
  }, [refunds]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return normalized
      .filter((b) => {
        if (statusFilter !== "all") {
          if (statusFilter === "other") {
            if (b._status === "pending" || b._status === "refunded")
              return false;
          } else if (b._status !== statusFilter) return false;
        }

        if (!qq) return true;

        const hay = `${b._id || ""} ${b._guestName} ${b._guestEmail} ${
          b._title
        } ${b._reason}`.toLowerCase();
        return hay.includes(qq);
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [normalized, q, statusFilter]);

  const totals = useMemo(() => {
    const count = filtered.length;
    const totalAmount = filtered.reduce(
      (s, b) => s + Number(b._amount || 0),
      0
    );
    const pendingCount = filtered.filter((b) => b._status === "pending").length;
    const refundedCount = filtered.filter(
      (b) => b._status === "refunded"
    ).length;
    return { count, totalAmount, pendingCount, refundedCount };
  }, [filtered]);

  const statusTone = (s) => {
    if (s === "pending") return "amber";
    if (s === "refunded") return "green";
    if (s === "failed" || s === "rejected") return "red";
    return "slate";
  };

  const markAsRefunded = async (bookingId) => {
    const ok = window.confirm("Mark this booking as refunded?");
    if (!ok) return;

    try {
      setBusyId(bookingId);

      // optimistic remove
      setRefunds((prev) => prev.filter((b) => b._id !== bookingId));

      await api.patch(`/api/admin/mark-refunded/${bookingId}`);
      toast.success("✅ Marked as refunded");
    } catch (e) {
      console.error("❌ Refund marking failed", e);
      toast.error(e?.response?.data?.message || "Failed to mark as refunded.");
      await fetchRefunds();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Finance
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              💸 Refund Requests
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Review refund requests and mark them as refunded after completing
              payment reversal.
            </p>
          </div>

          <button
            onClick={fetchRefunds}
            disabled={loading}
            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh ↻"}
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <Stat label="Requests (filtered)" value={totals.count} tone="amber" />
          <Stat label="Total amount" value={bdt.format(totals.totalAmount)} />
          <Stat label="Pending" value={totals.pendingCount} tone="amber" />
          <Stat label="Refunded" value={totals.refundedCount} tone="teal" />
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
                placeholder="Search booking id, guest email, listing, reason…"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              />
            </div>

            <div className="w-full md:w-56">
              <label className="text-xs font-semibold text-slate-600">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button
              onClick={() => {
                setQ("");
                setStatusFilter("all");
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
              {refunds.length}
            </span>{" "}
            requests.
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
            Loading refund requests…
          </div>
        )}

        {!loading && err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="font-semibold text-red-800">
              Couldn’t load refunds
            </div>
            <div className="text-sm text-red-700 mt-1">{err}</div>
            <button
              onClick={fetchRefunds}
              className="mt-4 rounded-2xl px-4 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !err && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              ✅ No refund requests found
            </div>
            <div className="text-sm text-slate-600 mt-1">
              Everything is up to date. Adjust filters if you expect pending
              items.
            </div>
          </div>
        )}

        {/* List */}
        {!loading && !err && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((b) => {
              const isBusy = busyId === b._id;
              const st = b._status;

              return (
                <div
                  key={b._id}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-semibold text-slate-900">
                          {b.guestId?.name || "—"}
                        </div>
                        <span className="text-slate-500 text-sm">
                          {b.guestId?.email ? `(${b.guestId.email})` : ""}
                        </span>
                        <Badge tone={statusTone(st)}>{st.toUpperCase()}</Badge>
                      </div>

                      <div className="mt-2 text-sm text-slate-700">
                        <span className="text-slate-500">Listing:</span>{" "}
                        <span className="font-semibold">
                          {b.listingId?.title || "—"}
                        </span>
                      </div>

                      <div className="mt-1 text-sm text-slate-700">
                        <span className="text-slate-500">Booking:</span>{" "}
                        <span className="font-mono font-semibold">{b._id}</span>{" "}
                        <CopyBtn value={b._id} />
                        <Link
                          to={`/admin/bookings/${b._id}`}
                          className="ml-2 text-xs font-semibold text-teal-700 hover:underline"
                        >
                          View →
                        </Link>
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        Created: {fmtTime(b.createdAt)}
                      </div>

                      {b._reason ? (
                        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
                          <div className="text-xs font-semibold text-slate-500 mb-1">
                            Reason
                          </div>
                          {b._reason}
                        </div>
                      ) : null}
                    </div>

                    <div className="md:text-right">
                      <div className="text-xs text-slate-500">Amount</div>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {bdt.format(b._amount)}
                      </div>

                      <div className="mt-3 flex md:justify-end gap-2">
                        <button
                          onClick={() => markAsRefunded(b._id)}
                          disabled={isBusy}
                          className="rounded-2xl px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition disabled:opacity-60"
                        >
                          {isBusy ? "Updating…" : "✅ Mark as Refunded"}
                        </button>
                      </div>

                      <div className="mt-2 text-xs text-slate-500">
                        Only click after payout reversal is done.
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
