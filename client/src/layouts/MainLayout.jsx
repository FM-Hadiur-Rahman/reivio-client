import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import logo from "../assets/reivio.PNG";
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
          className="flex items-center space-x-2 transition-all duration-300"
          title="Go to Home"
        >
          <img
            src={logo}
            alt="Reivio Logo"
            className={`object-contain transition-all duration-300 ${
              isScrolled ? "w-10 h-10" : "w-18 h-16"
            }`}
          />
          <span
            className={`font-bold transition-all duration-300 ${
              isScrolled ? "text-base" : "text-xl"
            } hidden sm:inline-block`}
          >
            <span className="text-green-600">REIVIO</span>
          </span>
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
