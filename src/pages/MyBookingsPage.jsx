import React, { useEffect, useMemo, useState, Suspense } from "react";
import axios from "axios";
import {
  CalendarDays,
  Home,
  Info,
  Loader2,
  MapPin,
  Receipt,
} from "lucide-react";

const InvoiceDownload = React.lazy(
  () => import("../components/InvoiceDownload"),
);

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const fetchBookings = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/bookings/user`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to fetch bookings:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const statusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "confirmed")
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    if (s === "cancelled")
      return "bg-rose-50 text-rose-700 border border-rose-200";
    return "bg-amber-50 text-amber-700 border border-amber-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 via-cyan-500/10 to-emerald-500/10" />
          <div className="relative p-7 md:p-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                  <Home size={16} />
                  My Bookings
                </div>

                <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                  Your stays
                </h1>

                <p className="mt-2 max-w-2xl text-gray-600">
                  View booking status, dates, and download invoices for paid
                  bookings.
                </p>

                <div className="mt-4 inline-flex items-center rounded-full bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 text-sm font-semibold">
                  {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
                </div>
              </div>

              <button
                onClick={fetchBookings}
                className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-3 text-white font-semibold shadow-sm transition hover:bg-teal-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          {loading ? (
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-teal-700" size={26} />
              <p className="text-gray-600">Loading your bookings…</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-10 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                <Info className="text-teal-700" size={22} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No bookings yet
              </h3>
              <p className="mt-1 text-gray-600">
                Browse listings and book your first stay.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-lg transition"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {booking.listingId?.title || "Untitled Listing"}
                        </h3>

                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={16} className="text-teal-700" />
                          <span className="truncate">
                            {booking.listingId?.location?.address || "Unknown"}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                          booking.status,
                        )}`}
                      >
                        {(booking.status || "pending").toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl border border-gray-200 p-4">
                        <div className="text-gray-500 flex items-center gap-2">
                          <CalendarDays size={16} className="text-teal-700" />
                          Dates
                        </div>
                        <div className="mt-1 font-semibold text-gray-900">
                          {new Date(booking.dateFrom).toLocaleDateString()} →{" "}
                          {new Date(booking.dateTo).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-200 p-4">
                        <div className="text-gray-500 flex items-center gap-2">
                          <Receipt size={16} className="text-teal-700" />
                          Price
                        </div>
                        <div className="mt-1 font-semibold text-gray-900">
                          ৳{booking.listingId?.price || 0} / night
                        </div>
                      </div>
                    </div>

                    {/* Invoice */}
                    {booking.paymentStatus === "paid" && (
                      <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-teal-900">
                            Invoice available
                          </div>
                        </div>

                        <div className="mt-3">
                          <Suspense
                            fallback={
                              <div className="flex items-center gap-2 text-sm text-teal-800">
                                <Loader2 className="animate-spin" size={16} />
                                Loading invoice…
                              </div>
                            }
                          >
                            <InvoiceDownload bookingId={booking._id} />
                          </Suspense>
                        </div>
                      </div>
                    )}

                    {booking.paymentStatus !== "paid" && (
                      <div className="mt-5 text-xs text-gray-500">
                        Invoice appears after payment is completed.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;
