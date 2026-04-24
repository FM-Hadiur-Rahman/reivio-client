import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";
import logo from "/reivio.png";
import HeroBannerCarousel from "./HeroBannerCarousel";

import {
  Home,
  CarFront,
  Leaf,
  BedDouble,
  ShieldCheck,
  CreditCard,
  Sparkles,
} from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-teal-50/30 text-slate-900">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-8 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute right-[-40px] top-20 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute bottom-[-80px] left-1/3 h-72 w-72 rounded-full bg-cyan-200/20 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300/50 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 lg:px-8 lg:pt-16 lg:pb-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* LEFT */}
          <div className="relative">
            {/* Brand pill */}
            <motion.div
              className="mb-6 inline-flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-400 to-sky-500 shadow-md">
                <img
                  src={logo}
                  alt="Reivio"
                  className="h-7 w-7 object-contain"
                />
              </div>

              <div className="leading-tight">
                <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-700">
                  Reivio
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                  {t("hero.tagline", "Your Home · Your Journey · One Platform")}
                </p>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              className="max-w-2xl text-4xl font-black leading-[0.95] tracking-[-0.03em] text-slate-950 sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {t(
                "hero.default_caption",
                "Experience Bangladesh like never before",
              )}
            </motion.h1>

            {/* Subheading */}
            <motion.div
              className="mt-5 max-w-xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-800 sm:text-base">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
                  <BedDouble className="h-4 w-4 text-teal-600" />
                  {t("hero.stay", "Stay")}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
                  <CarFront className="h-4 w-4 text-sky-600" />
                  {t("hero.ride", "Ride")}
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                {t(
                  "hero.sub_caption",
                  "Discover unique stays and safe rides across Bangladesh, hosted and driven by real people, verified by National ID.",
                )}
              </p>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              className="mt-7 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <button
                onClick={() => navigate("/listings")}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(20,184,166,0.22)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_18px_36px_rgba(20,184,166,0.28)]"
              >
                <Home className="h-4 w-4" />
                {t("hero.find_stay", "Find Stay")}
              </button>

              <button
                onClick={() => navigate("/trips")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-white hover:shadow-md"
              >
                <CarFront className="h-4 w-4 text-sky-600" />
                {t("hero.find_ride", "Find Ride")}
              </button>

              <button
                onClick={() => navigate("/register?primaryRole=host")}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md"
              >
                <Leaf className="h-4 w-4" />
                {t("hero.become_host", "Become a Host")}
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              className="mt-6 flex flex-wrap gap-2 text-[0.72rem] sm:text-xs"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 font-semibold text-slate-700 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                {t("footer.verified_badge", "Verified by National ID")}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 font-semibold text-slate-700 shadow-sm">
                <CreditCard className="h-3.5 w-3.5 text-sky-500" />
                {t("secure_payment", "Secure Payments")}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 font-semibold text-slate-700 shadow-sm">
                <BedDouble className="h-3.5 w-3.5 text-amber-500" />
                {t("comfortable_stay", "Comfortable Stays")}
              </span>
            </motion.div>
          </div>

          {/* RIGHT */}
          <motion.div
            className="relative w-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-teal-200/20 via-sky-200/10 to-emerald-200/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-xl">
              <HeroBannerCarousel />
            </div>
          </motion.div>
        </div>

        {/* Search bar */}
        <motion.div
          className="mt-10 lg:mt-14"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <div className="mx-auto max-w-6xl">
            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-2 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
              <div className="rounded-[1.6rem] bg-white">
                <SearchBar />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
