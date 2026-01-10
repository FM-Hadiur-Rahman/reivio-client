import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "/reivio.png"; // TODO: update path to your Reivio icon

const Footer = () => {
  const { t, i18n } = useTranslation();

  return (
    <footer className="relative mt-24">
      {/* Wave background */}
      <div className="pointer-events-none absolute inset-x-0 -top-16">
        <svg
          className="w-full h-16 text-slate-50"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,192L48,181.3C96,171,192,149,288,149.3C384,149,480,171,576,165.3C672,160,768,128,864,106.7C960,85,1056,75,1152,96C1248,117,1344,171,1392,197.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      {/* Main gradient panel */}
      <div className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50 border-t border-slate-200/80">
        {/* Subtle top highlight line */}
        <div className="h-px w-full bg-gradient-to-r from-teal-400/40 via-emerald-400/50 to-sky-400/40" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
            {/* BRAND */}
            <div className="space-y-5">
              {/* Your fav ring style */}
              <div className="inline-flex items-center gap-3 rounded-2xl bg-slate-900/70 px-3 py-2 ring-1 ring-slate-700/80 mb-3 shadow-lg shadow-slate-900/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-400 to-sky-500 shadow-lg shadow-emerald-400/40">
                  <img
                    src={logo}
                    alt="Reivio"
                    className="h-7 w-7 object-contain drop-shadow-sm"
                  />
                </div>
                <div>
                  <h2 className="text-sm font-semibold tracking-[0.26em] uppercase text-slate-50">
                    Reivio
                  </h2>
                  <p className="text-[0.65rem] text-slate-300">
                    Your Home · Your Journey
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
                {t("footer.description") ||
                  "Discover unique stays and seamless journeys across Bangladesh, hosted by real people."}
              </p>

              {/* Trust badge – ring, but light */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 ring-1 ring-emerald-300/70 text-emerald-700 text-xs font-semibold shadow-sm">
                <span>🔒</span>
                <span>
                  {t("footer.verified_badge") || "Verified by National ID"}
                </span>
              </div>
            </div>

            {/* EXPLORE */}
            <div>
              <h3 className="text-xs font-semibold tracking-[0.22em] uppercase text-slate-500 mb-3">
                {t("footer.explore") || "Explore"}
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link
                    to="/listings"
                    className="hover:text-teal-600 hover:underline underline-offset-4"
                  >
                    {t("footer.find_stay") || "Find a Stay"}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register?primaryRole=host"
                    className="hover:text-teal-600 hover:underline underline-offset-4"
                  >
                    {t("footer.become_host") || "Become a Host"}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help"
                    className="hover:text-teal-600 hover:underline underline-offset-4"
                  >
                    {t("footer.help_center") || "Help Center"}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-teal-600 hover:underline underline-offset-4"
                  >
                    {t("footer.contact_us") || "Contact Us"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* LEGAL */}
            <div>
              <h3 className="text-xs font-semibold tracking-[0.22em] uppercase text-slate-500 mb-3">
                {t("footer.legal") || "Legal"}
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link
                    to="/terms"
                    className="hover:text-teal-600 hover:underline underline-offset-4"
                  >
                    {t("footer.terms") || "Terms & Conditions"}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-teal-600 hover:underline underline-offset-4"
                  >
                    {t("footer.privacy") || "Privacy Policy"}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/refund-policy"
                    className="hover:text-teal-600 hover:underline underline-offset-4"
                  >
                    {t("footer.refund") || "Refund Policy"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* SUPPORT + APPS */}
            <div>
              <h3 className="text-xs font-semibold tracking-[0.22em] uppercase text-slate-500 mb-3">
                {t("footer.support") || "Support"}
              </h3>

              <div className="space-y-1.5 text-sm text-slate-600">
                <p>📧 help@reivio.com</p>
                <p>📱 WhatsApp: +880-1763558585</p>
                <Link
                  to="/emergency"
                  className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold"
                >
                  <span>🚨</span>
                  <span>
                    {t("footer.emergency") || "Emergency Information"}
                  </span>
                </Link>
              </div>

              {/* Language Selector – ring pill */}
              <div className="mt-4">
                <span className="text-xs font-medium text-slate-500">
                  🌍 {t("footer.language") || "Language"}
                </span>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/90 ring-1 ring-slate-200 px-3 py-1.5 ml-2 mt-1 shadow-sm">
                  <select
                    className="bg-transparent text-xs text-slate-700 focus:outline-none"
                    value={i18n.language}
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="bn">বাংলা</option>
                  </select>
                </div>
              </div>

              {/* App badges – light ring variant */}
              <div className="flex flex-wrap gap-3 mt-4">
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 ring-1 ring-slate-200 shadow-sm hover:shadow-md hover:ring-teal-300 transition-all">
                  <span className="text-lg">▶️</span>
                  <div className="text-left leading-tight text-[0.7rem]">
                    <span className="block text-slate-400">Get it on</span>
                    <span className="font-semibold text-slate-800">
                      Google Play
                    </span>
                  </div>
                </button>

                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 ring-1 ring-slate-200 shadow-sm hover:shadow-md hover:ring-teal-300 transition-all">
                  <span className="text-lg"></span>
                  <div className="text-left leading-tight text-[0.7rem]">
                    <span className="block text-slate-400">
                      Download on the
                    </span>
                    <span className="font-semibold text-slate-800">
                      App Store
                    </span>
                  </div>
                </button>
              </div>

              {/* Socials */}
              <div className="flex gap-4 mt-4 text-xl text-slate-400">
                <button className="hover:text-teal-600 transition-colors">
                  📸
                </button>
                <button className="hover:text-teal-600 transition-colors">
                  💬
                </button>
                <button className="hover:text-teal-600 transition-colors">
                  🌐
                </button>
              </div>
            </div>
          </div>

          {/* Bottom line */}
          <div className="mt-12 pt-5 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-500">
            <p>
              © {new Date().getFullYear()} Reivio.{" "}
              {t("footer.rights") || "All rights reserved."}
            </p>
            <p className="text-slate-500">
              Built with <span className="text-rose-500">♥</span> for stays &
              journeys across Bangladesh.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
