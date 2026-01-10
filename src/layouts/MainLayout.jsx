import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import logo from "../assets/reivio.png";
import TrustBadge from "../components/TrustBadge";
import TawkToWidget from "../components/TawkToWidget";

const MainLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header with shrinking effect */}
      <header
        className={`sticky top-0 z-40 px-6 flex justify-between items-center shadow-md backdrop-blur-md transition-all duration-300 ${
          isScrolled ? "bg-white bg-opacity-95 py-2" : "bg-white-600 py-6"
        }`}
      >
        <Link
          to="/"
          className="group flex items-center gap-2 sm:gap-3 transition-all duration-300"
          title="Go to Home"
        >
          {/* Logo container (premium badge) */}
          <div
            className={`
      flex items-center justify-center rounded-2xl
      bg-gradient-to-br from-teal-400 via-teal-500 to-sky-700
      shadow-sm shadow-teal-500/40 ring-1 ring-teal-300/40
      transition-all duration-300
      ${isScrolled ? "h-9 w-9" : "h-11 w-11 sm:h-12 sm:w-12"}
      group-hover:shadow-md group-hover:shadow-teal-500/60
    `}
          >
            <img
              src={logo}
              alt="Reivio logo"
              className="h-9 w-9 sm:h-9 sm:w-9 object-contain"
            />
          </div>

          {/* Brand text */}
          <div className="hidden sm:flex flex-col leading-tight">
            {/* Brand name */}
            {/* Brand name */}
            <span
              className={`
    font-semibold tracking-[0.18em] uppercase
    transition-all duration-300 
    ${
      isScrolled
        ? "text-xs sm:text-sm text-teal-900"
        : "text-sm sm:text-base text-teal-600"
    }
    group-hover:text-teal-500
  `}
            >
              REIVIO
            </span>

            {/* Main tagline */}
            <span
              className={`
    text-[0.7rem] sm:text-xs text-slate-500
    transition-colors duration-300
    md:inline-block hidden
    group-hover:text-teal-600
  `}
            >
              Your Home · Your Journey · One Platform
            </span>

            {/* Secondary line – only on large screens */}
            <span
              className="
        text-[0.65rem] sm:text-xs text-teal-600
        hidden lg:inline-block
      "
            >
              Discover your next place
            </span>
          </div>
        </Link>

        <Navbar />
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full px-0">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Trust Badge */}
      <TrustBadge />
      {/* <TawkToWidget /> */}
    </div>
  );
};

export default MainLayout;
