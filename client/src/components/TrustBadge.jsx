import { useEffect, useState } from "react";

const TrustBadge = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500); // small delay
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="hidden sm:block fixed bottom-6 right-6 z-50">
      <div
        className="
          animate-slide-in
          inline-flex flex-col gap-2
          rounded-2xl bg-slate-900/80 backdrop-blur-md
          px-4 py-3 w-72
          ring-1 ring-emerald-400/70
          shadow-xl shadow-emerald-500/30
          transition-all duration-500
        "
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          {/* Icon bubble */}
          <div
            className="flex h-9 w-9 items-center justify-center rounded-2xl
                          bg-gradient-to-br from-teal-400 via-emerald-400 to-sky-500
                          shadow-md shadow-emerald-400/50"
          >
            <span className="text-base">🔒</span>
          </div>

          <div className="flex-1">
            <p className="text-[0.7rem] font-semibold tracking-[0.22em] uppercase text-emerald-300">
              Reivio Trust
            </p>
            <h4 className="text-sm font-semibold text-slate-50">
              Verified & Trusted Stays
            </h4>
          </div>

          {/* Close */}
          <button
            onClick={() => setVisible(false)}
            className="text-slate-400 hover:text-rose-300 text-lg leading-none"
            aria-label="Close trust badge"
          >
            ×
          </button>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-emerald-300/40 via-teal-300/40 to-sky-300/40" />

        {/* Points */}
        <ul className="space-y-1.5 text-xs text-slate-200">
          <li className="flex items-start gap-1.5">
            <span className="mt-[2px] text-emerald-300">●</span>
            <span>Guests & hosts verified by National ID</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="mt-[2px] text-emerald-300">●</span>
            <span>Secure online payments & protected bookings</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="mt-[2px] text-emerald-300">●</span>
            <span>Carefully reviewed stays for comfort & safety</span>
          </li>
        </ul>

        {/* Tiny glowing status pill */}
        <div className="flex items-center gap-2 pt-1">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
          <span className="text-[0.65rem] text-slate-400">
            Live protection active on your Reivio experience.
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrustBadge;
