import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Calendar, DateRange } from "react-date-range";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import format from "date-fns/format";
import isWithinInterval from "date-fns/isWithinInterval";
import isBefore from "date-fns/isBefore";
import isAfter from "date-fns/isAfter";
import isSameDay from "date-fns/isSameDay";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import {
  CalendarDays,
  Ban,
  ShieldAlert,
  Loader2,
  Trash2,
  Info,
  CheckCircle2,
} from "lucide-react";

const HostBlockedDates = () => {
  const { id: listingId } = useParams();

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  // ✅ robust token read
  const token = useMemo(() => {
    const direct = localStorage.getItem("token");
    if (direct) return direct;
    return storedUser?.token || null;
  }, [storedUser]);

  const isHost =
    storedUser?.role === "host" || storedUser?.primaryRole === "host";

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [blockedDates, setBlockedDates] = useState([]);
  const [confirm, setConfirm] = useState({ open: false, from: null, to: null });

  const [selectedRange, setSelectedRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const fetchBlockedDates = async () => {
    if (!token || !listingId) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/listings/${listingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const list = Array.isArray(res.data?.blockedDates)
        ? res.data.blockedDates
        : [];
      setBlockedDates(list);
    } catch (err) {
      console.error("❌ Failed to load blocked dates", err);
      toast.error("Failed to load blocked dates.");
      setBlockedDates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isHost) fetchBlockedDates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, listingId, token]);

  const isDateBlocked = (date) => {
    return blockedDates.some(({ from, to }) =>
      isWithinInterval(date, {
        start: new Date(from),
        end: new Date(to),
      })
    );
  };

  const overlapsBlocked = (startDate, endDate) => {
    // overlap check: if any blocked range intersects selection
    return blockedDates.some(({ from, to }) => {
      const aStart = new Date(from);
      const aEnd = new Date(to);

      // intersection logic: start <= aEnd && end >= aStart
      return !isAfter(startDate, aEnd) && !isBefore(endDate, aStart);
    });
  };

  const handleBlock = async () => {
    const { startDate, endDate } = selectedRange[0];

    if (!startDate || !endDate) {
      toast.error("Please select a date range.");
      return;
    }

    if (isAfter(startDate, endDate)) {
      toast.error("Invalid date range.");
      return;
    }

    if (overlapsBlocked(startDate, endDate)) {
      toast.error("Selected range overlaps already blocked dates.");
      return;
    }

    if (!token) {
      toast.error("Missing token. Please login again.");
      return;
    }

    try {
      setActionLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/listings/${listingId}/block-dates`,
        { from: startDate, to: endDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Dates blocked successfully!");
      await fetchBlockedDates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "❌ Failed to block dates.");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const openUnblockConfirm = (from, to) => {
    setConfirm({ open: true, from, to });
  };

  const closeUnblockConfirm = () => {
    if (actionLoading) return;
    setConfirm({ open: false, from: null, to: null });
  };

  const handleUnblock = async () => {
    if (!confirm.from || !confirm.to) return;

    try {
      setActionLoading(true);
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/listings/${listingId}/block-dates`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { from: confirm.from, to: confirm.to },
        }
      );
      toast.success("✅ Unblocked!");
      closeUnblockConfirm();
      await fetchBlockedDates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "❌ Failed to unblock.");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isHost) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-rose-200 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-extrabold">Access denied</div>
              <div className="text-sm mt-1 opacity-90">
                Only hosts can access this page.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="rounded-3xl border border-teal-100 bg-white shadow-sm p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Manage Availability
              </h2>
              <p className="text-sm text-slate-500">
                Block dates to prevent bookings for this listing.
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <LegendDot colorClass="bg-slate-200" label="Available" />
            <LegendDot colorClass="bg-teal-500" label="Selected range" />
            <LegendDot colorClass="bg-rose-500" label="Blocked" />
            <div className="ml-auto flex items-center gap-2 text-slate-500">
              <Info className="w-4 h-4" />
              Blocking does not affect existing bookings.
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Block selector */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-extrabold text-slate-900">
                  Select a date range
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  Pick a range to block. Blocked dates are disabled.
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                {loading ? "Loading" : "Ready"}
              </span>
            </div>

            <div className="px-4 pb-4">
              {loading ? (
                <CalendarSkeleton />
              ) : (
                <>
                  <DateRange
                    ranges={selectedRange}
                    onChange={(ranges) => setSelectedRange([ranges.selection])}
                    rangeColors={["#14b8a6"]} // teal-500
                    minDate={new Date()}
                    disabledDay={(date) => isDateBlocked(date)}
                  />

                  <button
                    onClick={handleBlock}
                    disabled={actionLoading || loading}
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-teal-600 text-white font-extrabold px-4 py-2.5 hover:bg-teal-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    type="button"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Blocking...
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4" />
                        Block Selected Dates
                      </>
                    )}
                  </button>

                  {/* Selected preview */}
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    <div className="font-bold text-slate-900 mb-1">
                      Selected range
                    </div>
                    <div>
                      {format(selectedRange[0].startDate, "PPP")} →{" "}
                      {format(selectedRange[0].endDate, "PPP")}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-70" />
          </div>

          {/* Read-only calendar */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="text-lg font-extrabold text-slate-900">
                Blocked days (view)
              </div>
              <div className="text-sm text-slate-500 mt-1">
                Only blocked days are selectable in this view.
              </div>
            </div>

            <div className="px-4 pb-4">
              {loading ? (
                <CalendarSkeleton />
              ) : (
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <Calendar
                    date={new Date()}
                    // Show only blocked days as selectable
                    disabledDay={(date) => !isDateBlocked(date)}
                    // Highlight blocked days (simple visual)
                    dayContentRenderer={(date) => {
                      const blocked = isDateBlocked(date);
                      const today = isSameDay(date, new Date());
                      return (
                        <div
                          className={`w-full h-full flex items-center justify-center rounded-xl
                            ${
                              blocked
                                ? "bg-rose-500 text-white font-extrabold"
                                : ""
                            }
                            ${today && !blocked ? "ring-2 ring-teal-200" : ""}
                          `}
                        >
                          {date.getDate()}
                        </div>
                      );
                    }}
                  />
                </div>
              )}
            </div>

            <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-70" />
          </div>
        </div>

        {/* Blocked ranges list */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-lg font-extrabold text-slate-900">
                Blocked date ranges
              </div>
              <div className="text-sm text-slate-500 mt-1">
                Remove a range to make it bookable again.
              </div>
            </div>

            <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
              {loading ? "…" : `${blockedDates.length} ranges`}
            </span>
          </div>

          <div className="px-5 pb-5">
            {loading ? (
              <ListSkeleton />
            ) : blockedDates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
                No blocked dates yet.
              </div>
            ) : (
              <ul className="space-y-3">
                {blockedDates.map((range, index) => (
                  <li
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:shadow-sm transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                        <Ban className="w-5 h-5 text-rose-700" />
                      </div>

                      <div>
                        <div className="font-extrabold text-slate-900">
                          {format(new Date(range.from), "PPP")} →{" "}
                          {format(new Date(range.to), "PPP")}
                        </div>
                        <div className="text-sm text-slate-500">
                          This range is blocked for booking.
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => openUnblockConfirm(range.from, range.to)}
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-4 py-2 font-extrabold hover:bg-rose-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                      Unblock
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-70" />
        </div>
      </div>

      {/* Confirm Unblock Modal */}
      {confirm.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={closeUnblockConfirm}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                  <Ban className="w-6 h-6 text-rose-700" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-extrabold text-slate-900">
                    Unblock this range?
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    {format(new Date(confirm.from), "PPP")} →{" "}
                    {format(new Date(confirm.to), "PPP")}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeUnblockConfirm}
                  disabled={actionLoading}
                  className="rounded-full bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2 font-extrabold hover:bg-slate-200 transition disabled:opacity-60"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleUnblock}
                  disabled={actionLoading}
                  className="rounded-full bg-rose-600 text-white px-4 py-2 font-extrabold hover:bg-rose-700 transition disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Working...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Yes, Unblock
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-rose-500 to-orange-500" />
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- small components ---------- */

function LegendDot({ colorClass, label }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${colorClass}`} />
      <span className="text-slate-600 font-semibold">{label}</span>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="mt-4 grid grid-cols-7 gap-2">
        {Array.from({ length: 28 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} />
  );
}

export default HostBlockedDates;
