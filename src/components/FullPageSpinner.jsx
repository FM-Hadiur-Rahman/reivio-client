import React from "react";
import logo from "../assets/reivio.png";
import { Loader2, Sparkles } from "lucide-react";

const FullPageSpinner = ({
  message = "Loading Reivio...",
  subtitle = "Please wait a moment",
  brandName = "Reivio",
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-teal-50 via-white to-slate-50 px-4">
      {/* soft blobs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-cyan-200/40 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-2xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-teal-500 to-cyan-500" />

        <div className="p-7 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
            <img
              src={logo}
              alt={`${brandName} Logo`}
              className="w-10 h-10 object-contain"
            />
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-slate-900">
            <Sparkles className="w-5 h-5 text-teal-700" />
            <h2 className="text-lg font-extrabold tracking-tight">
              {brandName}
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-600">{message}</p>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>

          {/* spinner */}
          <div className="mt-6 flex items-center justify-center">
            <div className="relative">
              {/* glow ring */}
              <div className="absolute inset-0 rounded-full bg-teal-200/40 blur-xl" />
              {/* ring */}
              <div className="w-12 h-12 rounded-full border-[3px] border-teal-600/20 border-t-teal-600 animate-spin" />
              {/* inner icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-teal-700 animate-pulse" />
              </div>
            </div>
          </div>

          {/* shimmer bar */}
          <div className="mt-6 h-2 w-full rounded-full bg-slate-200/70 overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-teal-500 to-cyan-500 animate-[shimmer_1.2s_infinite]" />
          </div>

          <p className="mt-3 text-[11px] text-slate-400">
            Secured experience • Smooth loading
          </p>
        </div>

        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-60%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default FullPageSpinner;
