import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import BookingCard from "../components/BookingCard";
import { authHeader } from "../utils/authHeader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Filter,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";

const DashboardBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all"); // all | upcoming | active | past

  const navigate = useNavigate();

  const fetchBookings = () => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/bookings/user`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        if (Array.isArray(res.data)) setBookings(res.data);
        else setBookings([]);
      })
      .catch((err) => {
        console.error("❌ Failed to load bookings", err);
        setBookings([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleRequestModification = async (id, from, to) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/bookings/${id}/request-modification`,
        { from: from.toISOString(), to: to.toISOString() },
        authHeader(),
      );
      toast.success("📅 Modification request sent");
      fetchBookings();
    } catch (err) {
      toast.error("❌ Failed to send request");
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/bookings/${id}/checkin`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      setBookings((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, checkInAt: new Date().toISOString() } : b,
        ),
      );

      toast.success("✅ Checked in successfully!");
    } catch (err) {
      toast.error("Check-in failed");
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/bookings/${id}/checkout`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      setBookings((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, checkOutAt: new Date().toISOString() } : b,
        ),
      );

      toast.success("✅ Checked out successfully!");
    } catch (err) {
      console.error("❌ Check-out failed", err);
      toast.error("Check-out failed");
    }
  };

  const handleLeaveReview = (booking) => {
    navigate(
      `/dashboard/reviews?booking=${booking._id}&listing=${booking.listingId._id}`,
    );
  };

  // ---------- Premium UI helpers ----------
  const now = Date.now();

  const normalizedBookings = useMemo(() => {
    return Array.isArray(bookings) ? bookings : [];
  }, [bookings]);

  const computedStats = useMemo(() => {
    const upcoming = normalizedBookings.filter((b) => {
      const from = new Date(
        b?.dateFrom ||
          b?.from ||
          b?.startDate ||
          b?.fromDate ||
          b?.checkInDate ||
          b?.checkIn ||
          b?.from,
      ).getTime();
      // Fallback if your schema is dateFrom/dateTo:
      const dateFrom = new Date(b?.dateFrom || b?.from).getTime();
      return !isNaN(dateFrom) ? dateFrom > now : false;
    }).length;

    const active = normalizedBookings.filter((b) => {
      const df = new Date(b?.dateFrom || b?.from).getTime();
      const dt = new Date(b?.dateTo || b?.to).getTime();
      if (isNaN(df) || isNaN(dt)) return false;
      return df <= now && now <= dt && !b?.checkOutAt;
    }).length;

    const past = normalizedBookings.filter((b) => {
      const dt = new Date(b?.dateTo || b?.to).getTime();
      return !isNaN(dt) ? dt < now : false;
    }).length;

    return { total: normalizedBookings.length, upcoming, active, past };
  }, [normalizedBookings, now]);

  const filteredBookings = useMemo(() => {
    const q = query.trim().toLowerCase();

    const byQuery = normalizedBookings.filter((b) => {
      const title =
        b?.listingId?.title || b?.listingId?.name || b?.listingTitle || "";
      const district = b?.listingId?.district || "";
      const division = b?.listingId?.division || "";
      const id = b?._id || "";

      const hay = `${title} ${district} ${division} ${id}`.toLowerCase();
      return q ? hay.includes(q) : true;
    });

    const byStatus = byQuery.filter((b) => {
      const df = new Date(b?.dateFrom || b?.from).getTime();
      const dt = new Date(b?.dateTo || b?.to).getTime();

      if (status === "all") return true;
      if (isNaN(df) || isNaN(dt)) return status === "all";

      const isPast = dt < now;
      const isUpcoming = df > now;
      const isActive = df <= now && now <= dt && !b?.checkOutAt;

      if (status === "past") return isPast;
      if (status === "upcoming") return isUpcoming;
      if (status === "active") return isActive;

      return true;
    });

    return byStatus;
  }, [normalizedBookings, query, status, now]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 via-cyan-500/10 to-emerald-500/10" />
          <div className="relative p-7 md:p-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                  <Sparkles size={16} />
                  Guest Dashboard
                </div>
                <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                  My Bookings
                </h1>
                <p className="mt-2 max-w-2xl text-gray-600">
                  View your stays, check in/out, request changes, and leave
                  reviews.
                </p>
              </div>

              {/* Stats chips */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-sm text-gray-700">
                  Total:{" "}
                  <span className="font-semibold">{computedStats.total}</span>
                </div>
                <div className="rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-sm text-gray-700">
                  Upcoming:{" "}
                  <span className="font-semibold">
                    {computedStats.upcoming}
                  </span>
                </div>
                <div className="rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-sm text-gray-700">
                  Active:{" "}
                  <span className="font-semibold">{computedStats.active}</span>
                </div>
                <div className="rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-sm text-gray-700">
                  Past:{" "}
                  <span className="font-semibold">{computedStats.past}</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-600"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by listing title, district, or booking id…"
                  className="w-full rounded-xl border border-gray-200 bg-white px-10 py-3 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Filter
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-600"
                  />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="appearance-none rounded-xl border border-gray-200 bg-white px-10 py-3 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                  >
                    <option value="all">All</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="past">Past</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={fetchBookings}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-white font-semibold shadow-sm transition hover:bg-teal-700"
                >
                  <CalendarDays size={18} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          {loading ? (
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-teal-700" size={26} />
              <p className="text-gray-600">Loading bookings…</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-10 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                <CheckCircle2 className="text-teal-700" size={22} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No bookings found
              </h3>
              <p className="mt-1 text-gray-600">
                {query || status !== "all"
                  ? "Try adjusting your search or filter."
                  : "You have no bookings yet. Start exploring stays to book your first trip."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onCheckIn={handleCheckIn}
                  onCheckOut={handleCheckOut}
                  onLeaveReview={handleLeaveReview}
                  onRequestModification={handleRequestModification}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardBookings;
