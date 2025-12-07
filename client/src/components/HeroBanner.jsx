import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";
import logo from "/reivio.png";

import {
  Home,
  CarFront,
  Leaf,
  BedDouble,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-slate-50 text-slate-900">
      {/* soft background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-10 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-16 lg:pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          {/* LEFT: text */}
          <div className="w-full lg:w-1/2">
            {/* Brand pill */}
            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/80 px-3.5 py-2 ring-1 ring-sky-300 mb-5 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-400 to-sky-500">
                <img
                  src={logo}
                  alt="Reivio"
                  className="h-6 w-6 object-contain"
                />
              </div>
              <div className="leading-tight">
                <p className="text-[0.7rem] uppercase tracking-[0.28em] text-slate-700">
                  Reivio
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Leaf className="h-3.5 w-3.5" />
                  {t("hero.tagline", "Your Home · Your Journey · One Platform")}
                </p>
              </div>
            </div>

            {/* Heading */}
            <motion.h1
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {t(
                "hero.default_caption",
                "Experience Bangladesh like never before"
              )}
            </motion.h1>

            {/* Subheading */}
            <p className="mt-4 text-sm sm:text-base text-slate-700 leading-relaxed max-w-xl">
              <span className="inline-flex items-center gap-1 font-semibold mr-2 text-slate-800">
                <BedDouble className="h-4 w-4" />
                {t("hero.stay", "Stay")}
              </span>
              <span className="mr-2 text-slate-400">·</span>
              <span className="inline-flex items-center gap-1 font-semibold mr-2 text-slate-800">
                <CarFront className="h-4 w-4" />
                {t("hero.ride", "Ride")}
              </span>
              <span className="block mt-2">
                {t(
                  "hero.sub_caption",
                  "Discover unique stays and safe rides across Bangladesh, hosted and driven by real people, verified by National ID."
                )}
              </span>
            </p>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/listings")}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-md hover:bg-emerald-600 transition"
              >
                <Home className="h-4 w-4" />
                {t("hero.find_stay", "Find Stay")}
              </button>

              <button
                onClick={() => navigate("/trips")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
              >
                <CarFront className="h-4 w-4" />
                {t("hero.find_ride", "Find Ride")}
              </button>

              <button
                onClick={() => navigate("/register?primaryRole=host")}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black transition"
              >
                <Leaf className="h-4 w-4" />
                {t("hero.become_host", "Become a Host")}
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-5 flex flex-wrap gap-2 text-[0.7rem] sm:text-xs">
              <span className="inline-flex items-center gap-1 rounded-full font-semibold bg-white px-3 py-1 ring-1 ring-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                {t("footer.verified_badge", "Verified by National ID")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full font-semibold bg-white px-3 py-1 ring-1 ring-slate-300">
                <CreditCard className="h-3.5 w-3.5 text-sky-500" />
                {t("secure_payment", "Secure Payments")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full font-semibold bg-white px-3 py-1 ring-1 ring-slate-300">
                <BedDouble className="h-3.5 w-3.5 text-amber-500" />
                {t("comfortable_stay", "Comfortable Stays")}
              </span>
            </div>
          </div>

          {/* RIGHT: image card */}
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative rounded-3xl overflow-hidden bg-slate-900/5 border border-slate-200 shadow-xl"
            >
              <div className="h-64 sm:h-72 lg:h-80">
                <img
                  src="/banner7.jpg"
                  alt="Countryside stays in Bangladesh"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/20 to-transparent" />
              </div>

              {/* label */}
              <div className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] text-slate-700 border border-slate-200">
                Popular this week
              </div>

              {/* stats overlay */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p className="text-xs sm:text-sm text-slate-50 mb-3">
                  Clay houses in Bogura · River-view cottages · Bamboo huts in
                  Sundarbans · Hill stays in Bandarban.
                </p>

                <div className="flex gap-3">
                  <div className="flex-1 rounded-2xl bg-black/55 px-4 py-3 text-xs border border-white/15">
                    <p className="text-slate-200">Hosts onboarded</p>
                    <p className="text-lg font-semibold text-white">120+</p>
                  </div>
                  <div className="flex-1 rounded-2xl bg-black/55 px-4 py-3 text-xs border border-white/15">
                    <p className="text-slate-200">Districts covered</p>
                    <p className="text-lg font-semibold text-white">40+</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Search bar card */}
        <div className="mt-10">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
