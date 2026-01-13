import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { DateRange } from "react-date-range";
import { isWithinInterval } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { toast } from "react-toastify";

import {
  MapPin,
  CalendarRange,
  Banknote,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PenSquare,
  CreditCard,
  Loader2,
  BadgeCheck,
  Info,
} from "lucide-react";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function sameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}
function nightsBetween(from, to) {
  // booking nights: end date is checkout day -> nights = difference in days
  const a = startOfDay(from).getTime();
  const b = startOfDay(to).getTime();
  const diff = Math.round((b - a) / MS_PER_DAY);
  return Math.max(0, diff);
}
function formatBDT(n) {
  try {
    return new Intl.NumberFormat("bn-BD").format(Number(n));
  } catch {
    return String(n);
  }
}

const BookingCard = ({
  booking,
  onCheckIn,
  onCheckOut,
  onLeaveReview,
  onRequestModification,
}) => {
  const [showModifyForm, setShowModifyForm] = useState(false);
  const [newRange, setNewRange] = useState([
    {
      startDate: new Date(booking.dateFrom),
      endDate: new Date(booking.dateTo),
      key: "selection",
    },
  ]);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [rangesLoading, setRangesLoading] = useState(true);

  const [payLoading, setPayLoading] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);

  // ✅ confirm modal for modification
  const [confirmMod, setConfirmMod] = useState({ open: false });

  // ✅ robust token read
  const token = useMemo(() => {
    const direct = localStorage.getItem("token");
    if (direct) return direct;
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      return u?.token || null;
    } catch {
      return null;
    }
  }, []);

  const now = new Date();
  const dateFrom = new Date(booking.dateFrom);
  const dateTo = new Date(booking.dateTo);

  const canCheckIn = now >= dateFrom && !booking.checkInAt;
  const canCheckOut = now >= dateTo && booking.checkInAt && !booking.checkOutAt;
  const canReview = booking.checkOutAt && !booking.hasReviewed;

  const canModify =
    (booking.status === "pending" || booking.status === "confirmed") &&
    !booking.checkInAt &&
    booking.modificationRequest?.status !== "requested";

  useEffect(() => {
    if (!booking?.listingId?._id) return;

    setRangesLoading(true);
    axios
      .get(
        `${import.meta.env.VITE_API_URL}/api/bookings/listing/${
          booking.listingId._id
        }`
      )
      .then((res) => {
        const ranges = (res.data || [])
          .filter((b) => b._id !== booking._id)
          .map((b) => ({
            startDate: new Date(b.dateFrom),
            endDate: new Date(b.dateTo),
          }));
        setBookedRanges(ranges);
      })
      .catch((err) => {
        console.error("❌ Failed to load booked ranges", err);
        setBookedRanges([]);
      })
      .finally(() => setRangesLoading(false));
  }, [booking]);

  const isDateBlocked = (date) => {
    return bookedRanges.some((range) =>
      isWithinInterval(date, { start: range.startDate, end: range.endDate })
    );
  };

  // ----- Modification validation + price diff preview -----
  const pricePerNight = Number(booking.listingId?.price || 0);

  const originalFrom = startOfDay(dateFrom);
  const originalTo = startOfDay(dateTo);

  const selectedFrom = startOfDay(newRange[0].startDate);
  const selectedTo = startOfDay(newRange[0].endDate);

  const originalNights = nightsBetween(originalFrom, originalTo);
  const selectedNights = nightsBetween(selectedFrom, selectedTo);

  const originalSubtotal = originalNights * pricePerNight;
  const newSubtotal = selectedNights * pricePerNight;

  const diff = newSubtotal - originalSubtotal; // + means pay more, - means refund
  const isSameRange =
    sameDay(originalFrom, selectedFrom) && sameDay(originalTo, selectedTo);

  const invalidRange =
    selectedFrom.getTime() > selectedTo.getTime() || selectedNights === 0;

  const canSubmitModification = !rangesLoading && !invalidRange && !isSameRange;

  const openConfirmModification = () => {
    if (!canSubmitModification) {
      if (isSameRange)
        return toast.info("Selected dates are same as your current booking.");
      if (invalidRange)
        return toast.error(
          "Please select a valid date range (minimum 1 night)."
        );
      return toast.error("Please select a valid range.");
    }
    setConfirmMod({ open: true });
  };

  const closeConfirmModification = () => setConfirmMod({ open: false });

  const confirmAndSubmitModification = () => {
    // final safety check
    if (!canSubmitModification) return;

    onRequestModification(booking._id, selectedFrom, selectedTo);
    toast.success("✅ Modification request submitted!");
    setShowModifyForm(false);
    closeConfirmModification();
  };

  // ----- Existing payment / refund actions -----
  const initiateExtraPayment = async (bookingId, amount) => {
    if (!token) return toast.error("Missing token. Please login again.");
    try {
      setPayLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/extra`,
        { bookingId, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.url) window.location.href = res.data.url;
      else toast.error("⚠️ Payment gateway URL missing.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "❌ Failed to initiate extra payment"
      );
      console.error(err);
    } finally {
      setPayLoading(false);
    }
  };

  const handleClaimRefund = async (bookingId) => {
    if (!token) return toast.error("Missing token. Please login again.");
    try {
      setRefundLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/claim-refund`,
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Refund claim submitted");
      window.location.reload();
    } catch (err) {
      console.error("❌ Refund claim failed", err);
      toast.error(err?.response?.data?.message || "Refund claim failed");
    } finally {
      setRefundLoading(false);
    }
  };

  const modStatus = booking.modificationRequest?.status;

  return (
    <>
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-70" />

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {booking.listingId?.title}
              </h3>

              <div className="mt-1 text-sm text-slate-600 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-700" />
                <span className="line-clamp-1">
                  {booking.listingId?.location?.address || "—"}
                </span>
              </div>

              <div className="mt-2 text-sm text-slate-700 flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-teal-700" />
                {dateFrom.toLocaleDateString()}{" "}
                <ArrowRight className="w-4 h-4 text-slate-400" />{" "}
                {dateTo.toLocaleDateString()}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusPill status={booking.status} />
              {booking.checkInAt && (
                <span className="pill pill-teal">
                  <BadgeCheck className="w-4 h-4" />
                  Checked-in
                </span>
              )}
              {booking.checkOutAt && (
                <span className="pill pill-slate">
                  <CheckCircle2 className="w-4 h-4" />
                  Checked-out
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <Banknote className="w-5 h-5 text-teal-700" />
              <span className="font-bold">৳{formatBDT(pricePerNight)}</span>
              <span className="text-slate-500">/ night</span>
            </div>
            {booking.paymentStatus && (
              <span className="text-xs font-extrabold px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                Payment: {booking.paymentStatus}
              </span>
            )}
          </div>

          {/* Modification status banner */}
          {modStatus === "requested" && (
            <Banner type="warn">
              <RotateCcw className="w-5 h-5" />
              <div>
                <div className="font-extrabold">Date change requested</div>
                <div className="text-sm opacity-90">
                  {new Date(
                    booking.modificationRequest.requestedDates.from
                  ).toLocaleDateString()}{" "}
                  →{" "}
                  {new Date(
                    booking.modificationRequest.requestedDates.to
                  ).toLocaleDateString()}
                </div>
              </div>
            </Banner>
          )}
          {modStatus === "accepted" && (
            <Banner type="ok">
              <CheckCircle2 className="w-5 h-5" />
              <div className="font-extrabold">
                Your date change was accepted
              </div>
            </Banner>
          )}
          {modStatus === "rejected" && (
            <Banner type="danger">
              <XCircle className="w-5 h-5" />
              <div className="font-extrabold">
                Your date change was rejected
              </div>
            </Banner>
          )}

          {/* Extra payment / refund (existing) */}
          {booking.extraPayment?.required &&
            booking.extraPayment?.status === "pending" && (
              <Banner type="warn">
                <AlertTriangle className="w-5 h-5" />
                <div className="flex-1">
                  <div className="font-extrabold">Extra payment required</div>
                  <div className="text-sm opacity-90">
                    Please pay ৳{formatBDT(booking.extraPayment.amount)} to
                    confirm the updated booking.
                  </div>
                </div>

                <button
                  onClick={() =>
                    initiateExtraPayment(
                      booking._id,
                      booking.extraPayment.amount
                    )
                  }
                  disabled={payLoading}
                  className="btn-warn"
                  type="button"
                >
                  {payLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Pay Now
                    </>
                  )}
                </button>
              </Banner>
            )}

          {booking.extraPayment?.status === "refund_pending" && (
            <Banner type="ok">
              <CheckCircle2 className="w-5 h-5" />
              <div className="flex-1">
                <div className="font-extrabold">Refund available</div>
                <div className="text-sm opacity-90">
                  You will be refunded ৳
                  {formatBDT(Math.abs(booking.extraPayment.amount))} due to the
                  reduced stay.
                </div>
              </div>
            </Banner>
          )}

          {booking.extraPayment?.status === "refund_pending" &&
            !booking.extraPayment?.refundClaimed && (
              <button
                onClick={() => handleClaimRefund(booking._id)}
                disabled={refundLoading}
                className="btn-teal w-full"
                type="button"
              >
                {refundLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Claim Refund
                  </>
                )}
              </button>
            )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {canModify && (
              <button
                onClick={() => setShowModifyForm((p) => !p)}
                className="btn-purple"
                type="button"
              >
                <PenSquare className="w-4 h-4" />
                Request Date Change
              </button>
            )}

            {canCheckIn && (
              <button
                className="btn-teal"
                onClick={() => onCheckIn(booking._id)}
                type="button"
              >
                <CheckCircle2 className="w-4 h-4" />
                Check In
              </button>
            )}

            {canCheckOut && (
              <button
                className="btn-teal"
                onClick={() => onCheckOut(booking._id)}
                type="button"
              >
                <CheckCircle2 className="w-4 h-4" />
                Check Out
              </button>
            )}

            {canReview && (
              <button
                className="btn-slate"
                onClick={() => onLeaveReview(booking)}
                type="button"
              >
                <PenSquare className="w-4 h-4" />
                Leave Review
              </button>
            )}
          </div>

          {/* Modify form */}
          {canModify && showModifyForm && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-extrabold text-slate-900">
                    Select new date range
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Blocked dates are disabled.
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                  {rangesLoading ? "Loading dates…" : "Ready"}
                </span>
              </div>

              <DateRange
                ranges={newRange}
                onChange={(item) => setNewRange([item.selection])}
                minDate={new Date()}
                disabledDay={isDateBlocked}
                rangeColors={["#14b8a6"]} // teal-500
              />

              {/* ✅ Price difference preview */}
              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-extrabold text-slate-900 flex items-center gap-2">
                      <Info className="w-4 h-4 text-teal-700" />
                      Price preview
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Original:{" "}
                      <span className="font-bold">{originalNights}</span> nights
                      • ৳{formatBDT(originalSubtotal)}
                      <br />
                      New: <span className="font-bold">
                        {selectedNights}
                      </span>{" "}
                      nights • ৳{formatBDT(newSubtotal)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-500">
                      Difference
                    </div>
                    <div
                      className={`text-lg font-extrabold ${
                        diff > 0
                          ? "text-amber-700"
                          : diff < 0
                          ? "text-teal-700"
                          : "text-slate-700"
                      }`}
                    >
                      {diff > 0
                        ? `+৳${formatBDT(diff)}`
                        : diff < 0
                        ? `-৳${formatBDT(Math.abs(diff))}`
                        : "৳0"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {diff > 0
                        ? "Extra payment may be required"
                        : diff < 0
                        ? "Refund may apply"
                        : "No change"}
                    </div>
                  </div>
                </div>

                {/* ✅ Prevent same range */}
                {isSameRange && (
                  <div className="mt-3 text-sm font-bold text-amber-700">
                    Selected dates are the same as your current booking.
                  </div>
                )}
                {invalidRange && (
                  <div className="mt-3 text-sm font-bold text-rose-700">
                    Please select a valid range (minimum 1 night).
                  </div>
                )}
              </div>

              {/* ✅ Confirmation modal trigger (not direct submit) */}
              <button
                onClick={openConfirmModification}
                className="btn-teal w-full mt-3"
                type="button"
                disabled={!canSubmitModification}
                title={
                  isSameRange
                    ? "Select different dates to continue"
                    : invalidRange
                    ? "Select a valid date range"
                    : ""
                }
              >
                <RotateCcw className="w-4 h-4" />
                Review & Submit Request
              </button>
            </div>
          )}
        </div>

        <style>{`
          .pill{
            display:inline-flex; gap:.35rem; align-items:center;
            padding:.35rem .6rem; border-radius:9999px;
            font-weight:900; font-size:.75rem; border:1px solid;
          }
          .pill-teal{ background: rgb(240 253 250); color: rgb(15 118 110); border-color: rgb(204 251 241); }
          .pill-slate{ background: rgb(241 245 249); color: rgb(15 23 42); border-color: rgb(226 232 240); }

          .btn-teal{
            display:inline-flex; gap:.45rem; align-items:center; justify-content:center;
            padding:0.55rem 0.95rem; border-radius:9999px;
            background: rgb(13 148 136); color:white;
            font-weight:900; font-size:0.875rem;
            transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
            box-shadow: 0 1px 2px rgba(0,0,0,.06);
          }
          .btn-teal:hover{ background: rgb(15 118 110); box-shadow: 0 8px 24px rgba(13,148,136,.18); transform: translateY(-1px); }
          .btn-teal:disabled{ opacity:.6; cursor:not-allowed; transform:none; box-shadow:none; }

          .btn-slate{
            display:inline-flex; gap:.45rem; align-items:center; justify-content:center;
            padding:0.55rem 0.95rem; border-radius:9999px;
            background: rgb(241 245 249); color: rgb(15 23 42);
            font-weight:900; font-size:0.875rem;
            border:1px solid rgb(226 232 240);
            transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
          }
          .btn-slate:hover{ background: rgb(226 232 240); box-shadow: 0 8px 24px rgba(2,6,23,.08); transform: translateY(-1px); }

          .btn-purple{
            display:inline-flex; gap:.45rem; align-items:center; justify-content:center;
            padding:0.55rem 0.95rem; border-radius:9999px;
            background: rgb(147 51 234); color:white;
            font-weight:900; font-size:0.875rem;
            transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
            box-shadow: 0 1px 2px rgba(0,0,0,.06);
          }
          .btn-purple:hover{ background: rgb(126 34 206); box-shadow: 0 8px 24px rgba(147,51,234,.18); transform: translateY(-1px); }

          .btn-warn{
            display:inline-flex; gap:.45rem; align-items:center; justify-content:center;
            padding:0.55rem 0.95rem; border-radius:9999px;
            background: rgb(202 138 4); color:white;
            font-weight:900; font-size:0.875rem;
            transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
            box-shadow: 0 1px 2px rgba(0,0,0,.06);
            white-space:nowrap;
          }
          .btn-warn:hover{ background: rgb(161 98 7); box-shadow: 0 8px 24px rgba(202,138,4,.18); transform: translateY(-1px); }
          .btn-warn:disabled{ opacity:.6; cursor:not-allowed; transform:none; box-shadow:none; }
        `}</style>
      </div>

      {/* ✅ Confirmation Modal */}
      {confirmMod.open && (
        <ConfirmModal
          title="Confirm date change request"
          subtitle="Please review changes before submitting."
          onClose={closeConfirmModification}
          onConfirm={confirmAndSubmitModification}
          confirmText="Submit Request"
        >
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <div className="font-extrabold text-slate-900 mb-1">
                New dates
              </div>
              <div className="text-slate-700">
                {selectedFrom.toLocaleDateString()} →{" "}
                {selectedTo.toLocaleDateString()}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm">
              <div className="font-extrabold text-slate-900 mb-1">
                Price impact
              </div>
              <div className="text-slate-700">
                Original: {originalNights} nights • ৳
                {formatBDT(originalSubtotal)} <br />
                New: {selectedNights} nights • ৳{formatBDT(newSubtotal)}
              </div>
              <div className="mt-2 font-extrabold">
                Difference:{" "}
                <span
                  className={
                    diff > 0
                      ? "text-amber-700"
                      : diff < 0
                      ? "text-teal-700"
                      : "text-slate-700"
                  }
                >
                  {diff > 0
                    ? `+৳${formatBDT(diff)}`
                    : diff < 0
                    ? `-৳${formatBDT(Math.abs(diff))}`
                    : "৳0"}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                If host accepts and price changes, extra payment/refund may
                apply.
              </div>
            </div>
          </div>
        </ConfirmModal>
      )}
    </>
  );
};

function StatusPill({ status }) {
  const s = (status || "").toLowerCase();
  const map = {
    pending: { cls: "pill-slate", label: "Pending" },
    confirmed: { cls: "pill-teal", label: "Confirmed" },
    cancelled: { cls: "pill-slate", label: "Cancelled" },
    accepted: { cls: "pill-teal", label: "Accepted" },
    rejected: { cls: "pill-slate", label: "Rejected" },
  };
  const cfg = map[s] || { cls: "pill-slate", label: status || "Status" };
  return <span className={`pill ${cfg.cls}`}>{cfg.label}</span>;
}

function Banner({ type = "ok", children }) {
  const styles =
    type === "warn"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : type === "danger"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : "border-teal-200 bg-teal-50 text-teal-900";

  return (
    <div className={`rounded-2xl border ${styles} p-4 flex items-start gap-3`}>
      {children}
    </div>
  );
}

function ConfirmModal({
  title,
  subtitle,
  children,
  onClose,
  onConfirm,
  confirmText = "Confirm",
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-teal-700" />
            </div>
            <div className="flex-1">
              <div className="text-lg font-extrabold text-slate-900">
                {title}
              </div>
              <div className="text-sm text-slate-600 mt-1">{subtitle}</div>
            </div>
          </div>

          <div className="mt-4">{children}</div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2 font-extrabold hover:bg-slate-200 transition"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-full bg-teal-600 text-white px-4 py-2 font-extrabold hover:bg-teal-700 transition"
            >
              {confirmText}
            </button>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
      </div>
    </div>
  );
}

export default BookingCard;
