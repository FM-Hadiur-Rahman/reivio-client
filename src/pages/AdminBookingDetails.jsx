import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : "—");

const fmtMoney = (n) => {
  const val = Number(n);
  if (!Number.isFinite(val)) return "—";
  return val.toLocaleString(undefined, {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  });
};

const pill = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "paid" || s === "success")
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (s === "pending") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (s === "failed" || s === "cancelled")
    return "bg-red-50 text-red-700 ring-red-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
};

const Copy = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(value || ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {}
  };

  return (
    <button
      onClick={onCopy}
      className="ml-2 inline-flex items-center rounded-xl border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
      title="Copy"
      type="button"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

export default function AdminBookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchOne = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get(`/api/admin/bookings/${id}`);
      setBooking(res.data || null);
    } catch (e) {
      console.error("Failed to fetch booking", e);
      setErr(e?.response?.data?.message || "Failed to fetch booking");
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const guest = booking?.guestId || {};
  const listing = booking?.listingId || {};

  const nights = useMemo(() => {
    try {
      if (!booking?.dateFrom || !booking?.dateTo) return null;
      const a = new Date(booking.dateFrom).getTime();
      const b = new Date(booking.dateTo).getTime();
      if (!a || !b) return null;
      const n = Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
      return n;
    } catch {
      return null;
    }
  }, [booking]);

  const extraDue = Number(booking?.extraPayment?.dueAmount || 0);
  const paid = Number(booking?.paidAmount || 0);
  const total = paid + (extraDue > 0 ? extraDue : 0);

  if (loading) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
          Loading booking…
        </div>
      </AdminLayout>
    );
  }

  if (err) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="font-semibold text-red-800">
            Couldn’t load booking
          </div>
          <div className="text-sm text-red-700 mt-1">{err}</div>
          <button
            onClick={fetchOne}
            className="mt-4 rounded-2xl px-4 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!booking) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          No booking found.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Booking
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              📦 Booking Detail
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1",
                  pill(booking.paymentStatus),
                ].join(" ")}
              >
                <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                {(booking.paymentStatus || "unknown").toUpperCase()}
              </span>

              {booking.payoutIssued ? (
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-teal-50 text-teal-700 ring-1 ring-teal-200">
                  ✅ Payout issued
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                  ⏳ Payout pending
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOne}
              className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              Refresh ↻
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Amount paid</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">
              {fmtMoney(booking.paidAmount)}
            </div>
            <div className="mt-2 text-xs text-slate-600">
              Tran: {booking.tran_id || booking.transactionId || "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Extra due</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">
              {extraDue > 0 ? fmtMoney(extraDue) : "—"}
            </div>
            <div className="mt-2 text-xs text-slate-600">
              {booking.extraPayment?.paid ? "Extra paid" : "Extra pending"}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Dates</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              {fmtDate(booking.dateFrom)} → {fmtDate(booking.dateTo)}
            </div>
            <div className="mt-2 text-xs text-slate-600">
              Nights: {nights == null ? "—" : nights}
            </div>
          </div>

          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 shadow-sm">
            <div className="text-xs text-teal-700">Total (paid + due)</div>
            <div className="mt-1 text-2xl font-extrabold text-teal-900">
              {fmtMoney(total)}
            </div>
            <div className="mt-2 text-xs text-teal-800/80">Overview only</div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Booking meta */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="text-sm font-semibold text-slate-900">
                Booking information
              </div>
              <div className="text-xs text-slate-500">
                Core identifiers and status fields
              </div>
            </div>

            <div className="p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-slate-600">Booking ID</div>
                <div className="font-semibold text-slate-900 break-all text-right">
                  {booking._id} <Copy value={booking._id} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-slate-600">Payment status</div>
                <div className="font-semibold text-slate-900">
                  {booking.paymentStatus || "—"}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-slate-600">Created</div>
                <div className="font-semibold text-slate-900">
                  {fmtDate(booking.createdAt)}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-slate-600">Transaction</div>
                <div className="font-semibold text-slate-900 break-all text-right">
                  {booking.tran_id || booking.transactionId || "—"}
                  {(booking.tran_id || booking.transactionId) && (
                    <Copy value={booking.tran_id || booking.transactionId} />
                  )}
                </div>
              </div>

              {booking.extraPayment?.tran_id && (
                <div className="flex items-center justify-between gap-3">
                  <div className="text-slate-600">Extra tran</div>
                  <div className="font-semibold text-slate-900 break-all text-right">
                    {booking.extraPayment.tran_id}
                    <Copy value={booking.extraPayment.tran_id} />
                  </div>
                </div>
              )}

              {booking.note && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-slate-600 mb-1">Note</div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-800">
                    {booking.note}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Entities */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="text-sm font-semibold text-slate-900">
                People & listing
              </div>
              <div className="text-xs text-slate-500">
                Guest and listing references
              </div>
            </div>

            <div className="p-4 space-y-4 text-sm">
              {/* Guest */}
              <div className="rounded-2xl border border-slate-200 p-3">
                <div className="text-xs font-semibold text-slate-500 uppercase">
                  Guest
                </div>
                <div className="mt-1 font-semibold text-slate-900">
                  {guest.name || "—"}
                </div>
                <div className="text-xs text-slate-500 break-all">
                  {guest.email || ""}
                </div>

                <div className="mt-3 flex gap-2">
                  <Link
                    to={guest._id ? `/admin/users/${guest._id}` : "#"}
                    className={[
                      "flex-1 text-center rounded-2xl px-3 py-2 text-xs font-semibold transition",
                      guest._id
                        ? "bg-slate-900 text-white hover:bg-slate-800"
                        : "bg-slate-100 text-slate-500 cursor-not-allowed",
                    ].join(" ")}
                  >
                    View user
                  </Link>
                </div>
              </div>

              {/* Listing */}
              <div className="rounded-2xl border border-slate-200 p-3">
                <div className="text-xs font-semibold text-slate-500 uppercase">
                  Listing
                </div>
                <div className="mt-1 font-semibold text-slate-900">
                  {listing.title || "—"}
                </div>
                <div className="text-xs text-slate-500">
                  {listing.location?.district ||
                    listing.location?.division ||
                    ""}
                </div>

                <div className="mt-3 flex gap-2">
                  <Link
                    to={listing._id ? `/admin/listings/${listing._id}` : "#"}
                    className={[
                      "flex-1 text-center rounded-2xl px-3 py-2 text-xs font-semibold transition",
                      listing._id
                        ? "bg-teal-600 text-white hover:bg-teal-700"
                        : "bg-slate-100 text-slate-500 cursor-not-allowed",
                    ].join(" ")}
                  >
                    View listing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions placeholder */}
        <div className="mt-6 text-xs text-slate-500">
          Tip: Add “Mark payout issued” here if you want manual admin
          resolution.
        </div>
      </div>
    </AdminLayout>
  );
}
