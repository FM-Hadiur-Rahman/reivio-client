import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  BedDouble,
  Car,
  Crown,
  Bike,
  Globe2,
  Bell,
  UserPlus2,
  UserRound,
  User,
  LayoutDashboard,
  Heart,
  Settings2,
  LogOut as LogOutIcon,
  X,
} from "lucide-react";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, token, updateUser, logout, loading } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const menuRef = useRef();
  const mobileMenuRef = useRef();
  const hamburgerRef = useRef();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  /* ---------- SAFE FALLBACKS ---------- */
  const safeUser = user ?? {};
  const roles = Array.isArray(safeUser.roles) ? safeUser.roles : [];
  const primaryRole = safeUser.primaryRole || "user";
  const hasRole = (r) => roles.includes(r);
  const isLoggedIn = !!safeUser._id || !!token;

  const getDashboardPath = (role = primaryRole) => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "host") return "/host/dashboard";
    if (role === "driver") return "/dashboard/driver";
    return "/dashboard";
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === "en" ? "bn" : "en";
    i18n.changeLanguage(nextLang);
    localStorage.setItem("lng", nextLang);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem("lng");
    if (savedLang && i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  const handleAddRole = async (role) => {
    try {
      // ✅ Special: becoming driver needs extra info
      if (role === "driver") {
        setDropdownOpen(false);
        setMobileOpen(false);
        navigate("/become-driver"); // new page
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/add-role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateUser(res.data);
      toast.success(`✅ ${t("added_new_role")} ➡ ${role.toUpperCase()}`);
      navigate(getDashboardPath(role));
      setDropdownOpen(false);
      setMobileOpen(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message || t("error.add_role_failed", { role })
      );
    }
  };

  const handleRoleSwitch = async (role) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/auth/switch-role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateUser(res.data);
      toast.success(
        `✅ ${t("switch_role")} ➡ ${res.data.primaryRole.toUpperCase()}`
      );
      navigate(getDashboardPath(res.data.primaryRole));
      setDropdownOpen(false);
      setMobileOpen(false);
    } catch (err) {
      const data = err.response?.data;

      // ✅ If user tries switching to driver but missing driver info → go setup
      if (data?.code === "DRIVER_PROFILE_INCOMPLETE") {
        toast.info("Complete driver profile first");
        setDropdownOpen(false);
        setMobileOpen(false);
        navigate("/become-driver");
        return;
      }

      toast.error(data?.message || t("error.switch_role"));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
      if (
        mobileOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !hamburgerRef.current?.contains(e.target)
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen, mobileOpen]);

  useEffect(() => {
    let timeout;
    const scrollHandler = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsScrolled(window.scrollY > 30), 100);
    };
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/notifications/unread-count`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUnreadCount(res.data.unread || 0);
      } catch (err) {
        console.error("🔔 Failed to fetch unread count", err);
      }
    };
    fetchUnread();
  }, [isLoggedIn, token]);

  if (loading) return null;

  return (
    <header
      className={`sticky top-0 z-50 px-4 py-3 transition-all duration-300 backdrop-blur-md ${
        isScrolled ? "bg-white/80 shadow-sm" : "bg-white"
      }`}
    >
      <div className="w-full max-w-screen-xl mx-auto px-4 flex justify-between items-center">
        {/* Desktop Navigation – premium (right) */}
        <nav className="hidden xl:flex items-center gap-3 text-sm font-medium text-slate-600">
          {/* Main links */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 hover:text-teal-700 transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <Link
            to="/listings"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 hover:text-teal-700 transition-all duration-200"
          >
            <BedDouble className="w-4 h-4" />
            <span>Explore Stays</span>
          </Link>

          <Link
            to="/trips"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 hover:text-teal-700 transition-all duration-200"
          >
            <Car className="w-4 h-4" />
            <span>Find a Ride</span>
          </Link>

          {/* Upsell links */}
          {!isLoggedIn || primaryRole !== "host" ? (
            <Link
              to="/register?primaryRole=host"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-teal-100 bg-teal-50/70 text-teal-700 hover:bg-teal-100 hover:border-teal-300 transition-all duration-200"
            >
              <Crown className="w-4 h-4" />
              <span>Become a Host</span>
            </Link>
          ) : null}

          {!isLoggedIn || primaryRole !== "driver" ? (
            <Link
              to="/register?role=driver"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-100 bg-amber-50/70 text-amber-700 hover:bg-amber-100 hover:border-amber-300 transition-all duration-200"
            >
              <Bike className="w-4 h-4" />
              <span>Become a Driver</span>
            </Link>
          ) : null}

          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200"
          >
            <Globe2 className="w-4 h-4" />
            {i18n.language === "en" ? "বাংলা" : "EN"}
          </button>

          {/* Notifications */}
          {isLoggedIn && (
            <Link
              to="/notifications"
              className="relative ml-1 flex items-center justify-center h-9 w-9 rounded-full hover:bg-slate-100 transition-colors duration-200"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-0.5 bg-red-600 text-white text-[0.65rem] font-semibold rounded-full px-1.5 py-0.5 shadow-sm">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* Auth / profile */}
          {isLoggedIn ? (
            <div className="relative ml-2" ref={menuRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 bg-white/70 hover:bg-teal-50 hover:border-teal-400 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <img
                  src={safeUser.avatar || "/default-avatar.png"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/40"
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-semibold text-slate-700">
                    {safeUser.name}
                  </span>
                  <span className="text-[0.65rem] uppercase tracking-wide text-teal-600">
                    {primaryRole}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 min-w-[15rem] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 animate-dropdown origin-top-right overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="text-[0.7rem] font-semibold text-slate-500 uppercase">
                      Current role
                    </p>
                    <p className="text-sm font-semibold text-teal-700">
                      {primaryRole.toUpperCase()}
                    </p>
                  </div>

                  {/* Add Role options */}
                  <div className="py-1">
                    {!hasRole("host") && (
                      <button
                        onClick={() => handleAddRole("host")}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-teal-50"
                      >
                        <UserPlus2 className="w-4 h-4 text-teal-600" />
                        <span>{t("become_host")}</span>
                      </button>
                    )}
                    {!hasRole("driver") && (
                      <button
                        onClick={() => handleAddRole("driver")}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-teal-50"
                      >
                        <UserRound className="w-4 h-4 text-teal-600" />
                        <span>{t("become_driver")}</span>
                      </button>
                    )}
                    {!hasRole("user") && (
                      <button
                        onClick={() => handleAddRole("user")}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-teal-50"
                      >
                        <User className="w-4 h-4 text-teal-600" />
                        <span>{t("become_user")}</span>
                      </button>
                    )}
                  </div>

                  {/* Switch role section */}
                  {roles.length > 1 && (
                    <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="font-semibold text-slate-700 mb-1">
                        Switch role
                      </div>
                      {roles
                        .filter((r) => r !== primaryRole)
                        .map((role) => (
                          <button
                            key={role}
                            onClick={() => handleRoleSwitch(role)}
                            className="flex items-center gap-1 text-teal-600 hover:underline py-0.5"
                          >
                            <UserRound className="w-3 h-3" />
                            <span className="capitalize">{role}</span>
                          </button>
                        ))}
                    </div>
                  )}

                  {/* Links */}
                  <div className="py-1 text-sm">
                    <Link
                      to={getDashboardPath()}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-500" />
                      <span>{t("dashboard")}</span>
                    </Link>
                    <Link
                      to="/my-account"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>{t("my_account")}</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>{t("wishlist")}</span>
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50"
                    >
                      <Settings2 className="w-4 h-4 text-slate-500" />
                      <span>{t("edit_profile")}</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-slate-100"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    <span>{t("logout")}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-full hover:text-teal-700 hover:bg-slate-100 transition-colors duration-200"
              >
                {t("login")}
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-full bg-teal-600 hover:bg-teal-700 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {t("register")}
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <div className="xl:hidden">
          <button
            ref={hamburgerRef}
            className="hamburger w-8 h-8 flex flex-col justify-center items-center space-y-1"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="w-6 h-0.5 bg-gray-700" />
            <span className="w-6 h-0.5 bg-gray-700" />
            <span className="w-6 h-0.5 bg-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer – premium */}
      <div
        className={`fixed inset-0 z-40 xl:hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />

        {/* Panel */}
        <div
          ref={mobileMenuRef}
          className={`absolute top-0 right-0 h-full w-[78%] max-w-xs bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <img
                src={safeUser.avatar || "/default-avatar.png"}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-slate-800">
                  {isLoggedIn ? safeUser.name : "Welcome to Reivio"}
                </span>
                <span className="text-[0.7rem] text-teal-600 uppercase font-semibold">
                  {isLoggedIn ? primaryRole : "Guest"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div
            className="flex flex-col gap-4 px-3 py-4 overflow-y-auto"
            style={{ maxHeight: "100%" }}
          >
            {/* Navigation */}
            <div>
              <p className="px-2 text-[0.7rem] font-semibold uppercase text-slate-400 mb-1">
                Navigation
              </p>
              <div className="space-y-1">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Home className="w-4 h-4 text-slate-500" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/listings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  <BedDouble className="w-4 h-4 text-slate-500" />
                  <span>Explore Stays</span>
                </Link>
                <Link
                  to="/trips"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Car className="w-4 h-4 text-slate-500" />
                  <span>Find a Ride</span>
                </Link>
                {!isLoggedIn || primaryRole !== "host" ? (
                  <Link
                    to="/register?primaryRole=host"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-teal-700 bg-teal-50 hover:bg-teal-100"
                  >
                    <Crown className="w-4 h-4" />
                    <span>{t("become_host")}</span>
                  </Link>
                ) : null}
                {!isLoggedIn || primaryRole !== "driver" ? (
                  <Link
                    to="/register?role=driver"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-amber-700 bg-amber-50 hover:bg-amber-100"
                  >
                    <Bike className="w-4 h-4" />
                    <span>{t("become_driver")}</span>
                  </Link>
                ) : null}
              </div>
            </div>

            {/* Language */}
            <div>
              <p className="px-2 text-[0.7rem] font-semibold uppercase text-slate-400 mb-1">
                Language
              </p>
              <button
                onClick={() => {
                  toggleLanguage();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
              >
                <Globe2 className="w-4 h-4 text-slate-500" />
                <span>{i18n.language === "en" ? "বাংলা" : "EN"}</span>
              </button>
            </div>

            {/* Auth sections */}
            {!isLoggedIn ? (
              <div>
                <p className="px-2 text-[0.7rem] font-semibold uppercase text-slate-400 mb-1">
                  Account
                </p>
                <div className="space-y-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>{t("login")}</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-white bg-teal-600 hover:bg-teal-700"
                  >
                    <UserPlus2 className="w-4 h-4" />
                    <span>{t("register")}</span>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Role management */}
                <div>
                  <p className="px-2 text-[0.7rem] font-semibold uppercase text-slate-400 mb-1">
                    Roles
                  </p>
                  <div className="space-y-1">
                    {!hasRole("host") && (
                      <button
                        onClick={() => handleAddRole("host")}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
                      >
                        <Crown className="w-4 h-4 text-teal-600" />
                        <span>{t("become_host")}</span>
                      </button>
                    )}
                    {!hasRole("driver") && (
                      <button
                        onClick={() => handleAddRole("driver")}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
                      >
                        <Bike className="w-4 h-4 text-teal-600" />
                        <span>{t("become_driver")}</span>
                      </button>
                    )}
                    {!hasRole("user") && (
                      <button
                        onClick={() => handleAddRole("user")}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
                      >
                        <User className="w-4 h-4 text-teal-600" />
                        <span>{t("become_user")}</span>
                      </button>
                    )}

                    {roles.length > 1 && (
                      <div className="px-2 pt-1 text-[0.7rem] text-slate-500">
                        <span className="font-semibold text-slate-600">
                          Switch role:
                        </span>
                        {roles
                          .filter((r) => r !== primaryRole)
                          .map((role) => (
                            <button
                              key={role}
                              onClick={() => handleRoleSwitch(role)}
                              className="block text-teal-600 hover:underline text-xs mt-0.5"
                            >
                              {role}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Account links */}
                <div>
                  <p className="px-2 text-[0.7rem] font-semibold uppercase text-slate-400 mb-1">
                    Account
                  </p>
                  <div className="space-y-1">
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-500" />
                      <span>{t("dashboard")}</span>
                    </Link>
                    <Link
                      to="/my-account"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>{t("my_account")}</span>
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Bell className="w-4 h-4 text-slate-500" />
                      <span>{t("notifications")}</span>
                      {unreadCount > 0 && (
                        <span className="ml-auto text-[0.7rem] font-semibold text-red-600">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>{t("wishlist")}</span>
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Settings2 className="w-4 h-4 text-slate-500" />
                      <span>{t("edit_profile")}</span>
                    </Link>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                    navigate("/login");
                  }}
                  className="mt-1 flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOutIcon className="w-4 h-4" />
                  <span>{t("logout")}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
