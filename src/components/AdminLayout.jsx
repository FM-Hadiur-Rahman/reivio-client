import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FullPageSpinner from "../components/FullPageSpinner";
import { api } from "../services/api";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [q, setQ] = useState("");
  const [stats, setStats] = useState({
    users: 0,
    listings: 0,
    bookings: 0,
    revenue: 0,
  });

  const { loading, logout } = useAuth();
  const user = JSON.parse(localStorage.getItem("user"));
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.roles?.includes("admin"))
    return <Navigate to="/forbidden" replace />;

  // close profile dropdown on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (
        profileOpen &&
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [profileOpen]);

  // fetch quick stats
  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get("/api/admin/stats");
        setStats({
          users: res.data?.users ?? 0,
          listings: res.data?.listings ?? 0,
          bookings: res.data?.bookings ?? 0,
          revenue: res.data?.revenue ?? 0,
        });
      } catch (e) {
        // silent fail (dashboard still usable)
        console.warn("Admin stats failed:", e?.response?.data || e.message);
      }
    };
    run();
  }, []);

  const nav = useMemo(
    () => [
      { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
      { to: "/admin/search", label: "Admin Search", icon: "🔍" },

      { section: "Management" },
      { to: "/admin/users", label: "Users", icon: "👤" },
      { to: "/admin/listings", label: "Listings", icon: "🏠" },
      { to: "/admin/bookings", label: "Bookings", icon: "📅" },
      { to: "/admin/user-breakdown", label: "User Breakdown", icon: "👥" },

      { section: "Verification" },
      { to: "/admin/kyc", label: "KYC Verifications", icon: "🪪" },
      { to: "/admin/role-requests", label: "Role Requests", icon: "✅" },
      { to: "/admin/payment-accounts", label: "Payment Accounts", icon: "💳" },

      { section: "Moderation & Finance" },
      { to: "/admin/flagged", label: "Flagged Content", icon: "🚩" },
      { to: "/admin/revenue", label: "Revenue Analytics", icon: "💰" },
      { to: "/admin/payouts", label: "Payouts", icon: "💸" },
      { to: "/admin/payouts/overdue", label: "Overdue Payouts", icon: "⏰" },
      { to: "/admin/refunds", label: "Refunds", icon: "🧾" },

      { section: "System" },
      { to: "/admin/banners", label: "Banners", icon: "🖼" },
      { to: "/admin/logs", label: "Logs", icon: "📨" },
      { to: "/admin/promocodes", label: "Promocodes", icon: "🏷" },
      { to: "/admin/referrals", label: "Referrals", icon: "📢" },
      { to: "/admin/setting", label: "Settings", icon: "⚙️" },
    ],
    []
  );

  const isActive = (to) => pathname === to || pathname.startsWith(to + "/");

  const NavItem = ({ to, label, icon }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        onClick={() => setSidebarOpen(false)}
        className={[
          "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
          "hover:bg-white/10 hover:translate-x-[2px]",
          active
            ? "bg-teal-500/15 text-teal-200 ring-1 ring-teal-500/25"
            : "text-slate-200",
        ].join(" ")}
      >
        <span
          className={[
            "grid place-items-center w-8 h-8 rounded-lg transition-colors duration-200",
            active ? "bg-teal-500/20" : "bg-white/5 group-hover:bg-white/10",
          ].join(" ")}
        >
          <span className="text-base leading-none">{icon}</span>
        </span>
        <span className="flex-1">{label}</span>
        <span
          className={[
            "h-1.5 w-1.5 rounded-full transition-all duration-200",
            active
              ? "bg-teal-300"
              : "bg-transparent group-hover:bg-teal-400/60",
          ].join(" ")}
        />
      </Link>
    );
  };

  const onSearch = (e) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    setQ("");
    navigate(`/admin/search?query=${encodeURIComponent(query)}`);
  };

  const money = (n) => {
    const val = Number(n || 0);
    return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside
        className={[
          "fixed z-40 inset-y-0 left-0 w-72 transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:inset-0",
          "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950",
          "text-white border-r border-white/10",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="px-5 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[0.7rem] uppercase tracking-widest text-slate-300">
                Admin Panel
              </div>
              <div className="text-2xl font-extrabold leading-tight">
                Reivio<span className="text-teal-300">.</span>
              </div>
              <div className="mt-1 text-xs text-slate-300">
                Verification • Revenue • Moderation
              </div>
            </div>

            {/* Mobile close */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden rounded-lg px-3 py-2 text-slate-200 hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1 text-xs text-teal-200 ring-1 ring-teal-500/20">
            <span className="h-2 w-2 rounded-full bg-teal-300" />
            Admin access granted
          </div>
        </div>

        {/* Nav */}
        <nav className="px-4 py-4 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
          {nav.map((item, idx) => {
            if (item.section) {
              return (
                <div key={idx} className="pt-4 pb-2">
                  <div className="px-2 text-[0.7rem] font-semibold uppercase tracking-wider text-slate-400">
                    {item.section}
                  </div>
                  <div className="mt-2 h-px bg-white/10" />
                </div>
              );
            }
            return (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
              />
            );
          })}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar (Stripe-like) */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="px-4 lg:px-6 py-3 flex items-center gap-3">
            {/* mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-xl px-3 py-2 bg-teal-600 text-white hover:bg-teal-700 transition-colors"
              aria-label="Open menu"
            >
              ☰
            </button>

            {/* page title */}
            <div className="hidden sm:block">
              <div className="text-xs text-slate-500">Admin</div>
              <div className="font-semibold text-slate-800">
                {pathname.replace("/admin/", "").replaceAll("-", " ") ||
                  "dashboard"}
              </div>
            </div>

            {/* Search */}
            <form onSubmit={onSearch} className="flex-1">
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search user email, booking id, transaction…"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none
                             focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-1.5 text-sm bg-slate-900 text-white hover:bg-slate-800"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick chips */}
            <div className="hidden xl:flex items-center gap-2">
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs">
                <div className="text-slate-500">Users</div>
                <div className="font-semibold text-slate-800">
                  {money(stats.users)}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs">
                <div className="text-slate-500">Listings</div>
                <div className="font-semibold text-slate-800">
                  {money(stats.listings)}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs">
                <div className="text-slate-500">Paid bookings</div>
                <div className="font-semibold text-slate-800">
                  {money(stats.bookings)}
                </div>
              </div>
              <div className="rounded-2xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs">
                <div className="text-teal-700">Revenue</div>
                <div className="font-semibold text-teal-900">
                  {money(stats.revenue)}
                </div>
              </div>
            </div>

            {/* User menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2.5 py-2 hover:bg-slate-50"
              >
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="hidden md:flex flex-col items-start leading-tight">
                  <span className="text-sm font-semibold text-slate-800">
                    {user.name}
                  </span>
                  <span className="text-[0.7rem] text-teal-600 font-semibold uppercase">
                    admin
                  </span>
                </div>
                <span className="text-slate-500">▾</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <div className="text-xs text-slate-500">Signed in as</div>
                    <div className="text-sm font-semibold text-slate-800 truncate">
                      {user.email}
                    </div>
                  </div>

                  <Link
                    to="/admin/setting"
                    onClick={() => setProfileOpen(false)}
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    ⚙️ Settings
                  </Link>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                      navigate("/login");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-slate-100"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile quick chips */}
          <div className="xl:hidden px-4 lg:px-6 pb-3">
            <div className="flex gap-2 overflow-x-auto">
              <div className="shrink-0 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs">
                <div className="text-slate-500">Users</div>
                <div className="font-semibold text-slate-800">
                  {money(stats.users)}
                </div>
              </div>
              <div className="shrink-0 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs">
                <div className="text-slate-500">Listings</div>
                <div className="font-semibold text-slate-800">
                  {money(stats.listings)}
                </div>
              </div>
              <div className="shrink-0 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs">
                <div className="text-slate-500">Paid bookings</div>
                <div className="font-semibold text-slate-800">
                  {money(stats.bookings)}
                </div>
              </div>
              <div className="shrink-0 rounded-2xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs">
                <div className="text-teal-700">Revenue</div>
                <div className="font-semibold text-teal-900">
                  {money(stats.revenue)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
