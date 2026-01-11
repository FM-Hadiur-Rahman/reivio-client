import { useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeroBannerCarousel() {
  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (idx) => {
    if (!banners.length) return;
    setDir(idx > active ? 1 : -1);
    setActive((idx + banners.length) % banners.length);
  };
  const next = () => go(active + 1);
  const prev = () => go(active - 1);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get(`${API}/api/banners`);
      const list = Array.isArray(res.data) ? res.data : res.data?.banners || [];

      // ✅ normalize fields (support different backend field names)
      const normalized = list
        .map((b) => ({
          _id: b._id,
          imageUrl: b.imageUrl || b.image || b.url, // adjust if needed
          caption: b.caption || "",
          link: b.link || "",
        }))
        .filter((b) => !!b.imageUrl);

      setBanners(normalized);
      setActive(0);
    };

    load().catch(() => setBanners([]));
  }, [API]);

  // autoplay
  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => next(), 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, banners.length]);

  // fallback if no banners from API
  const fallback = {
    imageUrl: "/banner7.jpg",
    caption: "Popular this week",
    link: "",
  };

  const current = banners.length ? banners[active] : fallback;

  const onClickBanner = () => {
    if (current?.link) navigate(current.link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1 }}
      className="relative rounded-3xl overflow-hidden bg-slate-900/5 border border-slate-200 shadow-xl"
    >
      <div className="relative h-64 sm:h-72 lg:h-80">
        <AnimatePresence initial={false} custom={dir}>
          <motion.img
            key={current.imageUrl}
            src={current.imageUrl}
            alt={current.caption || "Reivio Banner"}
            className="absolute inset-0 h-full w-full object-cover"
            custom={dir}
            initial={{ x: dir === 1 ? 40 : -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: dir === 1 ? -40 : 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            onClick={onClickBanner}
            style={{ cursor: current?.link ? "pointer" : "default" }}
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/20 to-transparent" />

        {/* label (use caption) */}
        {current.caption ? (
          <div className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] text-slate-700 border border-slate-200">
            {current.caption}
          </div>
        ) : null}

        {/* stats overlay (keep your existing text or dynamic later) */}
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

        {/* controls only if > 1 */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/35 border border-white/15 text-white flex items-center justify-center hover:bg-black/55"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/35 border border-white/15 text-white flex items-center justify-center hover:bg-black/55"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  className={`h-2.5 w-2.5 rounded-full border border-white/30 transition-all ${
                    i === active ? "bg-white" : "bg-white/30"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
