import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import EarningsChart from "./EarningsChart";
import ReviewsChart from "./ReviewsChart";
import PaymentReminderModal from "./PaymentReminderModal";
import PremiumUpgradeCard from "./PremiumUpgradeCard";
import { toast } from "react-toastify";

// lucide icons
import {
  MessageSquareText,
  Plus,
  ShieldAlert,
  Home,
  CalendarCheck2,
  Star,
  BadgeDollarSign,
  Receipt,
  Landmark,
  Wallet,
  MapPin,
  Pencil,
  CalendarRange,
  Ban,
  Trash2,
  TrendingUp,
  Sparkles,
} from "lucide-react";

const HostDashboard = () => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  // ---- derived flags from user ----
  const kycStatus = (user?.kyc?.status || "").toLowerCase();
  const isApproved = kycStatus === "approved";
  const knowsKyc = user?.kyc?.status != null;

  const [showModal, setShowModal] = useState(false);

  // loading states
  const [meLoading, setMeLoading] = useState(true);
  const [dashLoading, setDashLoading] = useState(true);

  const [listings, setListings] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);

  const [earningsData, setEarningsData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]);

  // New money totals from backend (or fallback computed)
  const [totals, setTotals] = useState({
    revenue: null,
    platformFee: null,
    tax: null,
    hostPayout: null,
  });

  const handleClose = () => {
    setShowModal(false);
    sessionStorage.setItem("hidePaymentModal", "true");
  };

  // Helper
  const token = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"))?.token;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    const t = stored?.token;
    if (!t) {
      setMeLoading(false);
      return;
    }

    setMeLoading(true);

    fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const updatedUser = { ...data.user, token: t };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        if (
          ["host", "driver", "user"].includes(updatedUser.primaryRole) &&
          !updatedUser.paymentDetails?.accountNumber &&
          sessionStorage.getItem("hidePaymentModal") !== "true"
        ) {
          setShowModal(true);
        }
      })
      .catch((e) => console.error("refresh /me failed:", e))
      .finally(() => setMeLoading(false));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const t = JSON.parse(localStorage.getItem("user"))?.token;
        if (!user?._id || !t) return;

        setDashLoading(true);

        // Listings
        const listingsRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/listings/host/${user._id}`,
          { headers: { Authorization: `Bearer ${t}` } }
        );
        const safeListings = Array.isArray(listingsRes.data)
          ? listingsRes.data
          : [];
        setListings(safeListings);

        // Bookings
        const bookingsRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/bookings/host`,
          { headers: { Authorization: `Bearer ${t}` } }
        );
        const future = (bookingsRes.data || []).filter(
          (b) => new Date(b.dateFrom) >= new Date()
        );
        setCheckIns(future);

        // Review count (from listings)
        let reviewCount = 0;
        safeListings.forEach((listing) => {
          if (Array.isArray(listing.reviews))
            reviewCount += listing.reviews.length;
        });
        setTotalReviews(reviewCount);

        // Stats
        const statsRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/stats/host/${user._id}`,
          { headers: { Authorization: `Bearer ${t}` } }
        );

        const earnings = statsRes.data?.earnings || [];
        const reviews = statsRes.data?.reviews || [];

        setEarningsData(Array.isArray(earnings) ? earnings : []);
        setReviewsData(Array.isArray(reviews) ? reviews : []);

        // Totals (preferred from backend)
        const apiTotals = statsRes.data?.totals;

        if (apiTotals) {
          setTotals({
            revenue: apiTotals.revenue ?? null,
            platformFee: apiTotals.platformFee ?? null,
            tax: apiTotals.tax ?? null,
            hostPayout: apiTotals.hostPayout ?? null,
          });
        } else {
          // Fallback: compute from earningsData if your API only returns chart points
          // Try common keys: total/revenue/amount/earning/value
          const sumRevenue = (earnings || []).reduce((acc, row) => {
            const v =
              Number(row?.total) ||
              Number(row?.revenue) ||
              Number(row?.amount) ||
              Number(row?.earning) ||
              Number(row?.value) ||
              0;
            return acc + (Number.isFinite(v) ? v : 0);
          }, 0);

          // If you have known rates in frontend, set them here; otherwise leave as null
          // Example rates (replace with your real rates):
          const PLATFORM_RATE = null; // e.g. 0.1
          const TAX_RATE = null; // e.g. 0.05

          const platformFee =
            PLATFORM_RATE != null
              ? Math.round(sumRevenue * PLATFORM_RATE)
              : null;
          const tax =
            TAX_RATE != null ? Math.round(sumRevenue * TAX_RATE) : null;
          const hostPayout =
            platformFee != null && tax != null
              ? Math.max(0, sumRevenue - platformFee - tax)
              : null;

          setTotals({
            revenue: sumRevenue,
            platformFee,
            tax,
            hostPayout,
          });
        }
      } catch (err) {
        console.error("❌ Dashboard fetch error:", err);
      } finally {
        setDashLoading(false);
      }
    };

    if (user?.primaryRole === "host") fetchData();
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "premium") {
      toast.success("🎉 Premium upgrade successful!");
    }
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/listings/${id}`, {
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("user"))?.token
          }`,
        },
      });
      setListings((prev) => prev.filter((l) => l._id !== id));
      toast.success("✅ Listing deleted!");
    } catch (err) {
      toast.error("❌ Could not delete listing.");
      console.error(err);
    }
  };

  const formatBDT = (n) => {
    if (n == null || Number.isNaN(Number(n))) return "—";
    try {
      return new Intl.NumberFormat("bn-BD").format(Number(n));
    } catch {
      return String(n);
    }
  };

  const showSkeletonHeader = meLoading && !user;

  return (
    <>
      {showModal && <PaymentReminderModal onClose={handleClose} />}

      <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Premium header */}
          <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 text-white shadow-lg">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_10%,white_0,transparent_40%),radial-gradient(circle_at_80%_30%,white_0,transparent_35%)]" />

            <div className="relative p-6 sm:p-8 flex flex-col gap-4 sm:gap-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  {showSkeletonHeader ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-64 bg-white/25" />
                      <Skeleton className="h-4 w-56 bg-white/20" />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-white/90" />
                        Welcome, {user?.name}
                      </h1>
                      <p className="text-white/85 mt-1 text-sm sm:text-base">
                        {user?.email}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/dashboard/host/chats"
                    className="inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 px-4 py-2 text-sm font-semibold transition active:scale-[0.99]"
                  >
                    <MessageSquareText className="w-4 h-4" />
                    Guest Chats
                  </Link>

                  {knowsKyc && !isApproved ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 border border-rose-200/30 px-4 py-2 text-sm font-semibold">
                      <ShieldAlert className="w-4 h-4" />
                      Identity under review — posting disabled
                    </div>
                  ) : (
                    <Link
                      to="/host/create"
                      className="inline-flex items-center gap-2 rounded-full bg-white text-teal-700 hover:bg-teal-50 px-4 py-2 text-sm font-extrabold shadow-sm transition active:scale-[0.99]"
                    >
                      <Plus className="w-4 h-4" />
                      Create New Listing
                    </Link>
                  )}
                </div>
              </div>

              {/* Premium upgrade card */}
              {user?.primaryRole === "host" && (
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
                  <PremiumUpgradeCard
                    isPremium={user?.premium?.isActive}
                    expiresAt={user?.premium?.expiresAt}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {dashLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <StatCard
                  title="Total Listings"
                  value={listings.length}
                  icon={Home}
                />
                <StatCard
                  title="Upcoming Bookings"
                  value={checkIns.length}
                  icon={CalendarCheck2}
                />
                <StatCard
                  title="Total Reviews"
                  value={totalReviews}
                  icon={Star}
                />
              </>
            )}
          </div>

          {/* Money stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {dashLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <MoneyCard
                  title="Total Revenue"
                  value={totals.revenue}
                  icon={BadgeDollarSign}
                  helper="Total paid by guests"
                  formatBDT={formatBDT}
                />
                <MoneyCard
                  title="Platform Fee"
                  value={totals.platformFee}
                  icon={Receipt}
                  helper="Service fee collected"
                  formatBDT={formatBDT}
                />
                <MoneyCard
                  title="Tax"
                  value={totals.tax}
                  icon={Landmark}
                  helper="Government tax portion"
                  formatBDT={formatBDT}
                />
                <MoneyCard
                  title="Host Payout"
                  value={totals.hostPayout}
                  icon={Wallet}
                  helper="Estimated host earnings"
                  formatBDT={formatBDT}
                />
              </>
            )}
          </div>

          {/* Charts */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard
              title="Earnings Overview"
              subtitle="Track your revenue trend"
              icon={TrendingUp}
              loading={dashLoading}
            >
              {dashLoading ? (
                <ChartSkeleton />
              ) : (
                <EarningsChart data={earningsData} />
              )}
            </SectionCard>

            <SectionCard
              title="Reviews Overview"
              subtitle="Monitor feedback trend"
              icon={Star}
              loading={dashLoading}
            >
              {dashLoading ? (
                <ChartSkeleton />
              ) : (
                <ReviewsChart data={reviewsData} />
              )}
            </SectionCard>
          </div>

          {/* Upcoming Check-ins */}
          <div className="mt-10">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <CalendarCheck2 className="w-5 h-5 text-teal-700" />
                  Upcoming Check-Ins
                </h3>
                <p className="text-sm text-slate-500">
                  Guests arriving soon for your listings
                </p>
              </div>
            </div>

            {dashLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ListSkeleton />
                <ListSkeleton />
              </div>
            ) : checkIns.length === 0 ? (
              <EmptyState text="No upcoming check-ins." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {checkIns.map((b) => (
                  <div
                    key={b._id}
                    className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="font-bold text-slate-900 line-clamp-1">
                        {b.listingId?.title}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        📅 {new Date(b.dateFrom).toLocaleDateString()} →{" "}
                        {new Date(b.dateTo).toLocaleDateString()}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        👤 Guest ID: {b.guestId?._id || "Unknown"}
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center rounded-full bg-teal-50 text-teal-700 border border-teal-100 px-2 py-1 font-semibold">
                          Upcoming
                        </span>
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-70 group-hover:opacity-100 transition" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Listings */}
          <div className="mt-10">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Home className="w-5 h-5 text-teal-700" />
                  Your Listings
                </h3>
                <p className="text-sm text-slate-500">
                  Manage listings, bookings, and availability
                </p>
              </div>
            </div>

            {dashLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <ListingSkeleton />
                <ListingSkeleton />
                <ListingSkeleton />
              </div>
            ) : listings.length === 0 ? (
              <EmptyState text="You have no listings yet." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div
                    key={listing._id}
                    className="group rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={listing.images?.[0]}
                        alt={listing.title}
                        className="w-full h-44 object-cover transform group-hover:scale-[1.03] transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-60" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="text-white font-extrabold text-lg line-clamp-1">
                          {listing.title}
                        </div>
                        <div className="text-white/85 text-sm line-clamp-1 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {listing.location?.address}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-teal-700 font-extrabold text-lg">
                          ৳{listing.price}
                          <span className="text-slate-500 font-semibold text-sm">
                            /night
                          </span>
                        </div>
                        {listing?.premium?.isActive && (
                          <span className="text-xs font-extrabold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                            Premium
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex flex-wrap gap-2">
                        <Link
                          to={`/host/edit/${listing._id}`}
                          className="btn-teal"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Link>

                        <Link
                          to={`/host/listings/${listing._id}/bookings`}
                          className="btn-slate"
                        >
                          <CalendarRange className="w-4 h-4" />
                          Bookings
                        </Link>

                        <Link
                          to={`/host/listings/${listing._id}/blocked-dates`}
                          className="btn-purple"
                        >
                          <Ban className="w-4 h-4" />
                          Availability
                        </Link>

                        <button
                          onClick={() => handleDelete(listing._id)}
                          className="btn-danger"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Utility button styles */}
        <style>{`
          .btn-teal{
            display:inline-flex; gap:.45rem; align-items:center; justify-content:center;
            padding:0.5rem 0.85rem; border-radius:9999px;
            background: rgb(13 148 136); color:white;
            font-weight:900; font-size:0.875rem;
            transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
            box-shadow: 0 1px 2px rgba(0,0,0,.06);
          }
          .btn-teal:hover{ background: rgb(15 118 110); box-shadow: 0 8px 24px rgba(13,148,136,.18); transform: translateY(-1px); }

          .btn-slate{
            display:inline-flex; gap:.45rem; align-items:center; justify-content:center;
            padding:0.5rem 0.85rem; border-radius:9999px;
            background: rgb(241 245 249); color: rgb(15 23 42);
            font-weight:900; font-size:0.875rem;
            border:1px solid rgb(226 232 240);
            transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
          }
          .btn-slate:hover{ background: rgb(226 232 240); box-shadow: 0 8px 24px rgba(2,6,23,.08); transform: translateY(-1px); }

          .btn-purple{
            display:inline-flex; gap:.45rem; align-items:center; justify-content:center;
            padding:0.5rem 0.85rem; border-radius:9999px;
            background: rgb(147 51 234); color:white;
            font-weight:900; font-size:0.875rem;
            transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
          }
          .btn-purple:hover{ background: rgb(126 34 206); box-shadow: 0 8px 24px rgba(147,51,234,.18); transform: translateY(-1px); }

          .btn-danger{
            display:inline-flex; gap:.45rem; align-items:center; justify-content:center;
            padding:0.5rem 0.85rem; border-radius:9999px;
            background: rgb(254 242 242); color: rgb(185 28 28);
            font-weight:900; font-size:0.875rem;
            border:1px solid rgb(254 202 202);
            transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
          }
          .btn-danger:hover{ background: rgb(254 226 226); box-shadow: 0 8px 24px rgba(185,28,28,.12); transform: translateY(-1px); }
        `}</style>
      </div>
    </>
  );
};

/* ---------- UI helpers ---------- */

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-500">{title}</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">
            {value}
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
          <Icon className="w-6 h-6 text-teal-700" />
        </div>
      </div>
      <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 opacity-60" />
    </div>
  );
}

function MoneyCard({ title, value, icon: Icon, helper, formatBDT }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-500">{title}</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            ৳{formatBDT(value)}
          </div>
          <div className="text-xs text-slate-500 mt-1">{helper}</div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
          <Icon className="w-6 h-6 text-teal-700" />
        </div>
      </div>
      <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 opacity-60" />
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, children, loading }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Icon className="w-5 h-5 text-teal-700" />
            {title}
          </div>
          <div className="text-sm text-slate-500">{subtitle}</div>
        </div>
        {!loading && (
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
            Live
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
      {text}
    </div>
  );
}

/* ---------- Skeletons ---------- */

function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} />
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-2xl" />
      </div>
      <Skeleton className="mt-4 h-1 w-full rounded-full" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-56 w-full rounded-2xl" />
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <Skeleton className="mt-4 h-6 w-24 rounded-full" />
      <Skeleton className="mt-4 h-1 w-full rounded-full" />
    </div>
  );
}

function ListingSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-6 w-32" />
        <div className="flex flex-wrap gap-2 pt-2">
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-1 w-full rounded-none" />
    </div>
  );
}

export default HostDashboard;
