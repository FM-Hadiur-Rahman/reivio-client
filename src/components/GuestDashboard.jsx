import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Notifications from "./Notifications";
import MyRidesTab from "./MyRidesTab";

import {
  LayoutDashboard,
  Car,
  CalendarRange,
  MapPin,
  FileDown,
  PenSquare,
  Loader2,
  Mail,
} from "lucide-react";

const GuestDashboard = () => {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const token = useMemo(() => {
    const direct = localStorage.getItem("token");
    if (direct) return direct;
    return user?.token || null;
  }, [user]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/bookings/my`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
        setErr(e?.response?.data?.message || "Failed to load bookings.");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, token]);

  const now = new Date();

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="rounded-3xl border border-teal-100 bg-white shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Welcome, {user?.name}
              </h2>
              <div className="mt-1 text-sm text-slate-600 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                {user?.email}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
              <LayoutDashboard className="w-4 h-4" />
              Guest Dashboard
            </div>
          </div>

          <div className="mt-4">
            <Notifications />
          </div>

          {/* Tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            <TabButton
              active={activeTab === "dashboard"}
              onClick={() => setActiveTab("dashboard")}
              icon={LayoutDashboard}
              label="Dashboard"
            />
            <TabButton
              active={activeTab === "rides"}
              onClick={() => setActiveTab("rides")}
              icon={Car}
              label="My Rides"
            />
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === "rides" && (
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
              <MyRidesTab />
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-5 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Your Bookings
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    View stays, download invoices, and leave reviews after
                    checkout.
                  </p>
                </div>

                <span className="text-xs font-bold px-2 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                  {loading ? "Loading" : `${bookings.length} bookings`}
                </span>
              </div>

              <div className="px-5 pb-5">
                {loading ? (
                  <div className="space-y-3">
                    <BookingSkeleton />
                    <BookingSkeleton />
                    <BookingSkeleton />
                  </div>
                ) : err ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
                    {err}
                  </div>
                ) : bookings.length === 0 ? (
                  <EmptyState text="You haven’t booked any stays yet." />
                ) : (
                  <ul className="space-y-3">
                    {bookings.map((b) => {
                      const past = new Date(b.dateTo) < now;
                      const canReview = past && !b.reviewed;
                      const canInvoice = b.paymentStatus === "paid";

                      return (
                        <li
                          key={b._id}
                          className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 hover:shadow-sm transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                              <div className="font-extrabold text-slate-900 text-lg">
                                {b.listingId?.title}
                              </div>

                              <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                                <CalendarRange className="w-4 h-4 text-teal-700" />
                                {new Date(b.dateFrom).toLocaleDateString()} →{" "}
                                {new Date(b.dateTo).toLocaleDateString()}
                              </div>

                              <div className="mt-1 text-sm text-slate-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-teal-700" />
                                {b.listingId?.location?.address || "—"}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 sm:justify-end">
                              {canInvoice && (
                                <a
                                  href={`${
                                    import.meta.env.VITE_API_URL
                                  }/api/invoices/${b._id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-slate"
                                >
                                  <FileDown className="w-4 h-4" />
                                  Invoice
                                </a>
                              )}

                              {canReview && (
                                <Link
                                  to={`/bookings/${b._id}/review`}
                                  className="btn-teal"
                                >
                                  <PenSquare className="w-4 h-4" />
                                  Leave Review
                                </Link>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-70" />
            </div>
          )}
        </div>

        {/* Button styles */}
        <style>{`
          .btn-teal{
            display:inline-flex; gap:.45rem; align-items:center; justify-content:center;
            padding:0.55rem 0.95rem; border-radius:9999px;
            background: rgb(13 148 136); color:white;
            font-weight:900; font-size:0.875rem;
            transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
            box-shadow: 0 1px 2px rgba(0,0,0,.06);
          }
          .btn-teal:hover{ background: rgb(15 118 110); box-shadow: 0 8px 24px rgba(13,148,136,.18); transform: translateY(-1px); }

          .btn-slate{
            display:inline-flex; gap:.45rem; align-items:center; justify-content:center;
            padding:0.55rem 0.95rem; border-radius:9999px;
            background: rgb(241 245 249); color: rgb(15 23 42);
            font-weight:900; font-size:0.875rem;
            border:1px solid rgb(226 232 240);
            transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
          }
          .btn-slate:hover{ background: rgb(226 232 240); box-shadow: 0 8px 24px rgba(2,6,23,.08); transform: translateY(-1px); }
        `}</style>
      </div>
    </div>
  );
};

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-extrabold text-sm transition border
        ${
          active
            ? "bg-teal-600 text-white border-teal-600 shadow-sm"
            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
        }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
      {text}
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} />
  );
}

export default GuestDashboard;
