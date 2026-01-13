// Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Notifications from "./Notifications";
import MyRidesTab from "../components/MyRidesTab";
import ListingCard from "./ListingCard";

import {
  LayoutDashboard,
  Car,
  UserRound,
  Gift,
  Plus,
  MessageSquareText,
  CalendarCheck2,
  Home,
  Mail,
  MapPin,
  FileDown,
  PenSquare,
  Loader2,
} from "lucide-react";

const Dashboard = () => {
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

  const role = user?.primaryRole || user?.role || "user";
  const isHost = role === "host";
  const isGuest = role === "user" || role === "guest";

  const [activeTab, setActiveTab] = useState("dashboard");

  const [listings, setListings] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [chats, setChats] = useState([]);

  const [loadingHost, setLoadingHost] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);

  useEffect(() => {
    if (!user || !token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const loadHost = async () => {
      setLoadingHost(true);
      try {
        const [listingsRes, bookingsRes, chatsRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_API_URL}/api/listings/host/${user._id}`,
            {
              headers,
            }
          ),
          axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/host`, {
            headers,
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/chats`, { headers }),
        ]);

        setListings(Array.isArray(listingsRes.data) ? listingsRes.data : []);

        const future = (bookingsRes.data || []).filter(
          (b) => new Date(b.dateFrom) >= new Date()
        );
        setCheckIns(future);

        setChats(Array.isArray(chatsRes.data) ? chatsRes.data : []);
      } catch (e) {
        console.error(e);
        setListings([]);
        setCheckIns([]);
        setChats([]);
      } finally {
        setLoadingHost(false);
      }
    };

    const loadGuest = async () => {
      setLoadingGuest(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/bookings/my`,
          {
            headers,
          }
        );
        setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
        setBookings([]);
      } finally {
        setLoadingGuest(false);
      }
    };

    if (isHost) loadHost();
    if (isGuest) loadGuest();
  }, [user, token, isHost, isGuest]);

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

            <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
              <LayoutDashboard className="w-4 h-4" />
              {isHost ? "Host View" : "Guest View"}
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

        {/* Rides tab */}
        {activeTab === "rides" && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
            <MyRidesTab />
          </div>
        )}

        {/* Dashboard tab */}
        {activeTab === "dashboard" && (
          <div className="mt-6 space-y-6">
            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickLink
                to="/profile"
                icon={UserRound}
                title="Edit Profile"
                desc="Update your details"
              />
              <QuickLink
                to="/my-referrals"
                icon={Gift}
                title="My Referrals"
                desc="Rewards & invites"
              />

              {isHost && (
                <>
                  <QuickLink
                    to="/host/create"
                    icon={Plus}
                    title="Create Listing"
                    desc="Add a new stay"
                    accent="teal"
                  />
                  <QuickLink
                    to="/dashboard/chats"
                    icon={MessageSquareText}
                    title="Host Chats"
                    desc={`${chats?.length || 0} chats`}
                    accent="slate"
                  />
                </>
              )}
            </div>

            {/* Host section */}
            {isHost && (
              <>
                {/* Upcoming check-ins */}
                <SectionCard
                  title="Upcoming Check-Ins"
                  subtitle="Guests arriving soon"
                  icon={CalendarCheck2}
                  badge={
                    loadingHost ? "Loading" : `${checkIns.length} upcoming`
                  }
                >
                  {loadingHost ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CardSkeleton />
                      <CardSkeleton />
                    </div>
                  ) : checkIns.length === 0 ? (
                    <EmptyState text="No upcoming check-ins." />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {checkIns.map((b) => (
                        <div
                          key={b._id}
                          className="rounded-3xl border border-slate-200 bg-white p-4 hover:shadow-sm transition"
                        >
                          <div className="font-extrabold text-slate-900 text-lg line-clamp-1">
                            {b.listingId?.title}
                          </div>
                          <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                            <CalendarCheck2 className="w-4 h-4 text-teal-700" />
                            {new Date(b.dateFrom).toLocaleDateString()} →{" "}
                            {new Date(b.dateTo).toLocaleDateString()}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            Guest:{" "}
                            <span className="font-semibold">
                              {typeof b.guestId === "object"
                                ? b.guestId.name || b.guestId._id
                                : b.guestId}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>

                {/* Listings */}
                <SectionCard
                  title="Your Listings"
                  subtitle="Manage your stays"
                  icon={Home}
                  badge={
                    loadingHost ? "Loading" : `${listings.length} listings`
                  }
                >
                  {loadingHost ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <ListingSkeleton />
                      <ListingSkeleton />
                      <ListingSkeleton />
                    </div>
                  ) : listings.length === 0 ? (
                    <EmptyState text="You have no listings yet." />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {listings.map((listing) => (
                        <ListingCard key={listing._id} listing={listing} />
                      ))}
                    </div>
                  )}
                </SectionCard>
              </>
            )}

            {/* Guest section */}
            {isGuest && (
              <SectionCard
                title="Your Bookings"
                subtitle="Invoices and reviews after checkout"
                icon={LayoutDashboard}
                badge={loadingGuest ? "Loading" : `${bookings.length} bookings`}
              >
                {loadingGuest ? (
                  <div className="space-y-3">
                    <BookingSkeleton />
                    <BookingSkeleton />
                    <BookingSkeleton />
                  </div>
                ) : bookings.length === 0 ? (
                  <EmptyState text="You haven’t booked any stays yet." />
                ) : (
                  <ul className="space-y-3">
                    {bookings.map((b) => {
                      const canInvoice = b.paymentStatus === "paid";
                      const canReview =
                        new Date(b.dateTo) < new Date() && !b.reviewed;

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
                                <CalendarCheck2 className="w-4 h-4 text-teal-700" />
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
              </SectionCard>
            )}
          </div>
        )}

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

function QuickLink({ to, icon: Icon, title, desc, accent = "white" }) {
  const accents =
    accent === "teal"
      ? "bg-gradient-to-r from-teal-600 to-cyan-500 text-white border-transparent"
      : accent === "slate"
      ? "bg-slate-900 text-white border-transparent"
      : "bg-white text-slate-900 border-slate-200";

  const iconBg =
    accent === "teal"
      ? "bg-white/15 border-white/25"
      : accent === "slate"
      ? "bg-white/10 border-white/20"
      : "bg-teal-50 border-teal-100";

  const iconColor =
    accent === "teal" || accent === "slate" ? "text-white" : "text-teal-700";

  return (
    <Link
      to={to}
      className={`rounded-3xl border shadow-sm hover:shadow-md transition p-4 ${accents}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-extrabold">{title}</div>
          <div
            className={`text-sm mt-1 ${
              accent === "white" ? "text-slate-500" : "text-white/85"
            }`}
          >
            {desc}
          </div>
        </div>

        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${iconBg}`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </Link>
  );
}

function SectionCard({ title, subtitle, icon: Icon, badge, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-5 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
              <Icon className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900">
                {title}
              </div>
              <div className="text-sm text-slate-500">{subtitle}</div>
            </div>
          </div>
        </div>

        <span className="text-xs font-bold px-2 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100 inline-flex items-center gap-2">
          <Loader2
            className={`w-4 h-4 ${badge === "Loading" ? "animate-spin" : ""}`}
          />
          {badge}
        </span>
      </div>

      <div className="px-5 pb-5">{children}</div>

      <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-70" />
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
      {text}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
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

function ListingSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} />
  );
}

export default Dashboard;
