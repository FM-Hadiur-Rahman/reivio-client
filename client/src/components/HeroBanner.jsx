// // HeroBanner.jsx
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Slider from "react-slick";
// import axios from "axios";
// import { useTranslation } from "react-i18next";
// import { motion } from "framer-motion";

// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// const HeroBanner = () => {
//   const [banners, setBanners] = useState([]);
//   const navigate = useNavigate();
//   const { t } = useTranslation();

//   useEffect(() => {
//     axios
//       .get(`${import.meta.env.VITE_API_URL}/api/banners`)
//       .then((res) => setBanners(res.data || []))
//       .catch((err) => console.error("❌ Failed to fetch banners", err));
//   }, []);

//   const settings = {
//     dots: true,
//     infinite: true,
//     autoplay: true,
//     speed: 800,
//     autoplaySpeed: 6000,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     fade: true,
//     arrows: false,
//     pauseOnHover: true,
//   };

//   const slides = banners.length
//     ? banners
//     : [
//         {
//           _id: "fallback",
//           imageUrl:
//             "https://images.pexels.com/photos/2403202/pexels-photo-2403202.jpeg?auto=compress&cs=tinysrgb&w=1600",
//           caption: t("hero.default_caption"),
//         },
//       ];

//   return (
//     <section className="relative rounded-3xl overflow-hidden border border-slate-200/60 shadow-[0_22px_60px_rgba(15,23,42,0.25)] bg-slate-900/90">
//       <Slider {...settings}>
//         {slides.map((banner) => (
//           <div
//             key={banner._id}
//             className="relative h-[380px] sm:h-60 md:h-70 lg:h-75 xl:h-80"
//           >
//             {/* Background image */}
//             <img
//               src={banner.imageUrl}
//               alt={banner.caption}
//               className="w-full h-full object-cover"
//             />

//             {/* Dark gradient overlay */}
//             <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/60 to-slate-900/10" />

//             {/* Content */}
//             <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white px-6 text-center">
//               {/* Logo + tagline */}
//               <div className="mb-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
//                 <div className="h-7 w-7 flex items-center justify-center rounded-full bg-white/20">
//                   <img src="/reivio.png" alt="Reivio" className="h-5 w-5" />
//                 </div>
//                 <div className="text-sm font-medium tracking-wide opacity-90">
//                   Your Home · Your Journey
//                 </div>
//               </div>

//               {/* Main Headline */}
//               <motion.h1
//                 className="text-3xl md:text-5xl font-extrabold drop-shadow-xl leading-snug max-w-3xl"
//                 initial={{ opacity: 0, y: -30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 1 }}
//               >
//                 Experience Bangladesh like never before
//               </motion.h1>

//               {/* Sub tagline */}
//               <motion.p
//                 className="mt-3 text-base md:text-lg opacity-90 max-w-xl leading-relaxed"
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2, duration: 0.8 }}
//               >
//                 Discover unique stays hosted by real people — with verified
//                 identity and secure booking.
//               </motion.p>

//               {/* Buttons */}
//               <motion.div
//                 className="mt-6 flex flex-wrap gap-4 justify-center"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.4, duration: 0.7 }}
//               >
//                 <button
//                   onClick={() => navigate("/listings")}
//                   className="px-6 py-3 rounded-xl bg-white text-gray-800 font-semibold shadow-lg hover:bg-gray-100 transition"
//                 >
//                   🔍 Find Stay
//                 </button>

//                 <button
//                   onClick={() => navigate("/trips")}
//                   className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold shadow-lg hover:scale-[1.03] transition"
//                 >
//                   🚗 Find Ride
//                 </button>

//                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-sm shadow">
//                   🔒 Verified by National ID
//                 </div>
//               </motion.div>
//             </div>
//           </div>
//         ))}
//       </Slider>
//     </section>
//   );
// };

// export default HeroBanner;

// src/components/HeroSection.jsx
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";
import logo from "/reivio.png";

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative bg-slate-950 text-white">
      {/* Background image / gradient */}
      <div className="absolute inset-0">
        <img
          src="/banner1.jpg" // TODO: replace with your best banner
          alt="Reivio hero"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-900/40" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* LEFT: text + CTAs */}
          <div className="max-w-xl space-y-5">
            {/* Brand pill (with your favourite ring style) */}
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/70 px-3 py-2 ring-1 ring-slate-700/80">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-400 to-sky-500 shadow-lg shadow-emerald-400/40">
                <img
                  src={logo}
                  alt="Reivio"
                  className="h-6 w-6 object-contain drop-shadow-sm"
                />
              </div>
              <div className="leading-tight">
                <p className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-300">
                  Reivio
                </p>
                <p className="text-xs text-slate-400">
                  Your Home · Your Journey · One Platform
                </p>
              </div>
            </div>

            <motion.h1
              className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {t("hero.default_caption")}
            </motion.h1>

            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed">
              🛏 {t("hero.stay")} · 🚗 {t("hero.ride")} — Discover unique stays
              and safe rides across Bangladesh, hosted and driven by real
              people, verified by National ID.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/listings")}
                className="inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-semibold shadow-sm hover:shadow-md hover:bg-slate-50 transition"
              >
                🏡 {t("hero.find_stay")}
              </button>
              <button
                onClick={() => navigate("/trips")}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-4 py-2 text-sm font-semibold ring-1 ring-slate-600 hover:bg-slate-800 transition"
              >
                🚗 {t("hero.find_ride")}
              </button>
              <button
                onClick={() => navigate("/register?primaryRole=host")}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition shadow shadow-emerald-500/40"
              >
                🌿 {t("hero.become_host")}
              </button>
            </div>

            {/* Trust chips */}
            <div className="flex flex-wrap gap-2 text-xs mt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-3 py-1 ring-1 ring-slate-700/80">
                🔒 {t("footer.verified_badge")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/60 px-3 py-1 ring-1 ring-teal-600/80">
                💳 {t("secure_payment") || "Secure Payments"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/60 px-3 py-1 ring-1 ring-emerald-500/70">
                🛏 {t("comfortable_stay") || "Comfortable Stays"}
              </span>
            </div>
          </div>

          {/* RIGHT: simple preview / stats (optional) */}
          <div className="hidden lg:flex flex-col gap-3 min-w-[260px]">
            <div className="rounded-3xl bg-white/95 p-4 shadow-xl shadow-slate-900/30">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.18em] mb-1">
                Popular this week
              </p>
              <p className="text-sm text-slate-800">
                Clay houses in Bogura · River-view cottages · Hill stays in
                Bandarban.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 rounded-3xl bg-slate-900/70 px-4 py-3 text-xs">
                <p className="text-slate-300">Hosts onboarded</p>
                <p className="text-lg font-semibold text-white">120+</p>
              </div>
              <div className="flex-1 rounded-3xl bg-slate-900/70 px-4 py-3 text-xs">
                <p className="text-slate-300">Districts covered</p>
                <p className="text-lg font-semibold text-white">40+</p>
              </div>
            </div>
          </div>
        </div>

        {/* SearchBar floating card under hero */}
        <div className="relative mt-6 lg:mt-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-900/20 ring-1 ring-slate-200">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
