import { Link, useNavigate } from "react-router-dom";
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
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/add-role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedUser = res.data;
      updateUser(updatedUser);
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
      const updatedUser = res.data;
      updateUser(updatedUser);
      toast.success(
        `✅ ${t("switch_role")} ➡ ${updatedUser.primaryRole.toUpperCase()}`
      );
      navigate(getDashboardPath(updatedUser.primaryRole));
      setDropdownOpen(false);
      setMobileOpen(false);
    } catch {
      toast.error(t("error.switch_role"));
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
        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center space-x-4 text-gray-700">
          <Link to="/" className="hover:text-green-600">
            🏠 Home
          </Link>
          <Link to="/listings" className="hover:text-green-600">
            🏡 Explore Stays
          </Link>
          <Link to="/trips" className="hover:text-green-600">
            🚗 Find a Ride
          </Link>

          {!isLoggedIn || primaryRole !== "host" ? (
            <Link
              to="/register?primaryRole=host"
              className="hover:text-green-600"
            >
              🌟 Become a Host
            </Link>
          ) : null}
          {!isLoggedIn || primaryRole !== "driver" ? (
            <Link to="/register?role=driver" className="hover:text-green-600">
              🛵 Become a Driver
            </Link>
          ) : null}

          <button
            onClick={toggleLanguage}
            className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
          >
            🌐 {i18n.language === "en" ? "বাংলা" : "EN"}
          </button>

          {isLoggedIn && (
            <Link to="/notifications" className="relative group">
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs font-semibold rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {isLoggedIn ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="hover:text-green-600 font-medium flex items-center space-x-2"
              >
                <img
                  src={safeUser.avatar || "/default-avatar.png"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span>{safeUser.name}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
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
                <div className="absolute right-0 mt-2 min-w-[13rem] bg-white border rounded shadow-lg z-50 animate-dropdown origin-top-right">
                  <div className="px-4 py-2 text-sm font-semibold text-green-700">
                    {primaryRole.toUpperCase()}
                  </div>

                  {/* Add Role options */}
                  {!hasRole("host") && (
                    <button
                      onClick={() => handleAddRole("host")}
                      className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                    >
                      🌟 {t("become_host")}
                    </button>
                  )}
                  {!hasRole("driver") && (
                    <button
                      onClick={() => handleAddRole("driver")}
                      className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                    >
                      🛵 {t("become_driver")}
                    </button>
                  )}
                  {!hasRole("user") && (
                    <button
                      onClick={() => handleAddRole("user")}
                      className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                    >
                      👤 {t("become_user")}
                    </button>
                  )}

                  {/* Switch Role */}
                  {roles.length > 1 && (
                    <div className="px-4 py-2 text-sm text-gray-700">
                      <div className="font-semibold text-gray-800">
                        Switch Role:
                      </div>
                      {roles
                        .filter((r) => r !== primaryRole)
                        .map((role) => (
                          <button
                            key={role}
                            onClick={() => handleRoleSwitch(role)}
                            className="block text-green-600 hover:underline mt-1"
                          >
                            {role === "host" && "🌟 Host"}
                            {role === "driver" && "🛵 Driver"}
                            {role === "user" && "👤 User"}
                          </button>
                        ))}
                    </div>
                  )}

                  <Link
                    to={getDashboardPath()}
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    🏠 {t("dashboard")}
                  </Link>
                  <Link
                    to="/my-account"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    👤 {t("my_account")}
                  </Link>
                  <Link
                    to="/wishlist"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    ❤️ {t("wishlist")}
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    🙍 {t("edit_profile")}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="hover:text-green-600">
                {t("login")}
              </Link>
              <Link to="/register" className="hover:text-green-600">
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

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-40 xl:hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black bg-opacity-30"
          onClick={() => setMobileOpen(false)}
        />
        <div
          ref={mobileMenuRef}
          className={`absolute top-4 right-0 w-2/3 max-w-xs bg-white shadow-xl p-4 rounded-l-lg transform transition-transform duration-300 ease-in-out ${
            mobileOpen
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }`}
          style={{
            height: "fit-content",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <div className="space-y-3">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="block hover:text-green-600"
            >
              🏠 Home
            </Link>
            <Link
              to="/listings"
              onClick={() => setMobileOpen(false)}
              className="block hover:text-green-600"
            >
              🏡 Explore Stays
            </Link>
            <Link
              to="/trips"
              onClick={() => setMobileOpen(false)}
              className="block hover:text-green-600"
            >
              🚗 Find a Ride
            </Link>

            {!isLoggedIn || primaryRole !== "host" ? (
              <Link
                to="/register?primaryRole=host"
                onClick={() => setMobileOpen(false)}
                className="block hover:text-green-600"
              >
                🌟 Become a Host
              </Link>
            ) : null}
            {!isLoggedIn || primaryRole !== "driver" ? (
              <Link
                to="/register?role=driver"
                onClick={() => setMobileOpen(false)}
                className="block hover:text-green-600"
              >
                🛵 Become a Driver
              </Link>
            ) : null}

            <button
              onClick={() => {
                toggleLanguage();
                setMobileOpen(false);
              }}
              className="block text-left hover:text-green-600"
            >
              🌐 {i18n.language === "en" ? "বাংলা" : "EN"}
            </button>

            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block hover:text-green-600"
                >
                  {t("login")}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block hover:text-green-600"
                >
                  {t("register")}
                </Link>
              </>
            ) : (
              <>
                <hr className="my-2" />
                <div className="flex items-center space-x-2 border-b pb-2 mb-2">
                  <img
                    src={safeUser.avatar || "/default-avatar.png"}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-green-700">
                      {safeUser.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {primaryRole.toUpperCase()}
                    </p>
                  </div>
                </div>

                {!hasRole("host") && (
                  <button
                    onClick={() => handleAddRole("host")}
                    className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                  >
                    🌟 {t("become_host")}
                  </button>
                )}
                {!hasRole("driver") && (
                  <button
                    onClick={() => handleAddRole("driver")}
                    className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                  >
                    🛵 {t("become_driver")}
                  </button>
                )}
                {!hasRole("user") && (
                  <button
                    onClick={() => handleAddRole("user")}
                    className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                  >
                    👤 {t("become_user")}
                  </button>
                )}

                {roles.length > 1 && (
                  <div className="px-4 py-2 text-sm text-gray-700">
                    <div className="font-semibold text-gray-800">
                      Switch Role:
                    </div>
                    {roles
                      .filter((r) => r !== primaryRole)
                      .map((role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleSwitch(role)}
                          className="block text-green-600 hover:underline mt-1"
                        >
                          {role === "host" && "🌟 Host"}
                          {role === "driver" && "🛵 Driver"}
                          {role === "user" && "👤 User"}
                        </button>
                      ))}
                  </div>
                )}

                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileOpen(false)}
                  className="block hover:text-green-600"
                >
                  🏠 {t("dashboard")}
                </Link>
                <Link
                  to="/my-account"
                  onClick={() => setMobileOpen(false)}
                  className="block hover:text-green-600"
                >
                  👤 {t("my_account")}
                </Link>
                <Link
                  to="/notifications"
                  onClick={() => setMobileOpen(false)}
                  className="block hover:text-green-600"
                >
                  🔔 {t("notifications")}
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs text-red-600 font-semibold">
                      ({unreadCount})
                    </span>
                  )}
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="block hover:text-green-600"
                >
                  ❤️ {t("wishlist")}
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block hover:text-green-600"
                >
                  🙍 {t("edit_profile")}
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                    navigate("/login");
                  }}
                  className="block text-left w-full text-red-600"
                >
                  {t("logout")}
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
