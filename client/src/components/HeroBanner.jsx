import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";
import logo from "/reivio.png";

// lucide-react icons
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
    <section className="relative text-white overflow-hidden bg-slate-950">
      {/* Background image + strong gradient */}
      <div className="absolute inset-0 -z-20">
        <img
          src="/banner7.jpg"
          alt="Reivio hero"
          className="w-full h-full object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/75 to-slate-900/55" />
      </div>

      {/* Soft vignette */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black/30 via-transparent to-black/5" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
          {/* LEFT: text + CTAs */}
          <div className="max-w-xl">
            {/* Glass card behind hero text */}
            <div className="space-y-5 rounded-3xl bg-slate-950/70 px-5 py-6 sm:px-7 sm:py-7 border border-white/10 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.85)]">
              {/* Brand pill */}
              <div className="inline-flex items-center gap-3 rounded-2xl bg-slate-900/70 px-3.5 py-2 ring-1 ring-white/10">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-400 to-sky-500 shadow-lg shadow-emerald-400/40">
                  <img
                    src={logo}
                    alt="Reivio"
                    className="h-6 w-6 object-contain drop-shadow-sm"
                  />
                </div>
                <div className="leading-tight">
                  <p className="text-[0.7rem] uppercase tracking-[0.28em] text-slate-200">
                    Reivio
                  </p>
                  <p className="text-xs text-slate-300 flex items-center gap-1">
                    <Leaf className="h-3.5 w-3.5" />
                    {t(
                      "hero.tagline",
                      "Your Home · Your Journey · One Platform"
                    )}
                  </p>
                </div>
              </div>

              {/* Heading */}
              <motion.h1
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight drop-shadow-[0_6px_18px_rgba(0,0,0,0.9)]"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {t(
                  "hero.default_caption",
                  "Experience Bangladesh like never before"
                )}
              </motion.h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base text-slate-100/95 leading-relaxed drop-shadow-[0_4px_14px_rgba(0,0,0,1)] flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <BedDouble className="h-4 w-4" />
                  {t("hero.stay", "Stay")}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <CarFront className="h-4 w-4" />
                  {t("hero.ride", "Ride")}
                </span>
                <span>—</span>
                <span className="inline">
                  {t(
                    "hero.sub_caption",
                    "Discover unique stays and safe rides across Bangladesh, hosted and driven by real people, verified by National ID."
                  )}
                </span>
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-1">
                {/* Find Stay */}
                <button
                  onClick={() => navigate("/listings")}
                  className="inline-flex items-center gap-2 rounded-full bg-transparent text-slate-900 px-5 py-2.5 text-sm font-bold shadow-lg shadow-black/40 ring-1 ring-slate-200 hover:bg-slate-100 hover:shadow-xl transition"
                >
                  <Home className="h-4 w-4" />
                  {t("hero.find_stay", "Find Stay")}
                </button>

                {/* Find Ride */}
                <button
                  onClick={() => navigate("/trips")}
                  className="inline-flex items-center gap-2 rounded-full bg-transparent text-white border border-white/35 px-5 py-2.5 text-sm font-bold hover:bg-white/10 transition"
                >
                  <CarFront className="h-4 w-4" />
                  {t("hero.find_ride", "Find Ride")}
                </button>

                {/* Become a Host */}
                <button
                  onClick={() => navigate("/register?primaryRole=host")}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.7)] hover:bg-emerald-400 transition"
                >
                  <Leaf className="h-4 w-4" />
                  {t("hero.become_host", "Become a Host")}
                </button>
              </div>

              {/* Trust chips */}
              <div className="mt-2 flex flex-wrap gap-2 text-[0.7rem] sm:text-xs">
                <span className="inline-flex items-center gap-1 rounded-full font-bold bg-slate-900/80 px-3 py-1 ring-1 ring-slate-700/80">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t("footer.verified_badge", "Verified by National ID")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full font-bold  bg-slate-900/70 px-3 py-1 ring-1 ring-teal-500/80">
                  <CreditCard className="h-3.5 w-3.5" />
                  {t("secure_payment", "Secure Payments")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full font-bold  bg-slate-900/70 px-3 py-1 ring-1 ring-emerald-500/70">
                  <BedDouble className="h-3.5 w-3.5" />
                  {t("comfortable_stay", "Comfortable Stays")}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: preview / stats */}
          <div className="hidden lg:flex flex-col gap-3 min-w-[260px]">
            <div className="rounded-3xl bg-white/95 p-4 shadow-2xl shadow-slate-900/40 backdrop-blur-sm">
              <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Popular this week
              </p>
              <p className="text-sm text-slate-800">
                Clay houses in Bogura · River-view cottages · Bamboo huts in
                Sundarbans · Hill stays in Bandarban.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 rounded-3xl bg-slate-900/85 px-4 py-3 text-xs shadow-lg shadow-black/50">
                <p className="text-slate-300">Hosts onboarded</p>
                <p className="text-lg font-semibold text-white">120+</p>
              </div>
              <div className="flex-1 rounded-3xl bg-slate-900/85 px-4 py-3 text-xs shadow-lg shadow-black/50">
                <p className="text-slate-300">Districts covered</p>
                <p className="text-lg font-semibold text-white">40+</p>
              </div>
            </div>
          </div>
        </div>

        {/* SearchBar floating card */}
        <div className="relative mt-8 lg:mt-10">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-slate-900/40 ring-1 ring-slate-200">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
