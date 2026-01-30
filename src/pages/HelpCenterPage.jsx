import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CreditCard,
  HelpCircle,
  LifeBuoy,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";

const HelpCenterPage = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const topics = useMemo(
    () => [
      {
        key: "booking",
        title: "Booking & Payments",
        desc: "How to book a stay, manage payments, invoices, and reservation status.",
        icon: CreditCard,
        items: [
          { label: "How do I book a stay?", to: "/help/booking" },
          { label: "Payment failed — what now?", to: "/help/payment-failed" },
          { label: "Download invoice", to: "/help/invoices" },
          { label: "Cancel a booking", to: "/help/cancellations" },
        ],
      },
      {
        key: "hosting",
        title: "Hosting Guidelines",
        desc: "Hosting tips, cancellations, payouts, and verification requirements.",
        icon: Store,
        items: [
          { label: "Create a listing", to: "/help/create-listing" },
          { label: "Host cancellation policy", to: "/help/host-cancellations" },
          { label: "Payout setup", to: "/help/payouts" },
          { label: "KYC & identity verification", to: "/help/kyc" },
        ],
      },
      {
        key: "safety",
        title: "Safety & Trust",
        desc: "Verification, reviews, reporting issues, and safety tips for your trip.",
        icon: ShieldCheck,
        items: [
          { label: "Phone verification", to: "/help/phone-verification" },
          { label: "Identity verification", to: "/help/identity" },
          { label: "Report a problem", to: "/help/report" },
          { label: "Reviews & moderation", to: "/help/reviews" },
        ],
      },
    ],
    [],
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return topics;

    return topics
      .map((t) => {
        const items = t.items.filter((i) =>
          i.label.toLowerCase().includes(query),
        );
        const matchTitle =
          t.title.toLowerCase().includes(query) ||
          t.desc.toLowerCase().includes(query);
        return matchTitle ? t : { ...t, items };
      })
      .filter(
        (t) =>
          t.items.length > 0 ||
          t.title.toLowerCase().includes(query) ||
          t.desc.toLowerCase().includes(query),
      );
  }, [q, topics]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 via-cyan-500/10 to-emerald-500/10" />
          <div className="relative p-7 md:p-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                  <Sparkles size={16} />
                  Help Center
                </div>

                <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                  How can we help?
                </h1>

                <p className="mt-2 max-w-2xl text-gray-600">
                  Browse common topics or{" "}
                  <Link
                    to="/contact"
                    className="text-teal-700 font-semibold underline"
                  >
                    contact us
                  </Link>{" "}
                  for additional help.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-white font-semibold shadow-sm hover:bg-teal-700"
                >
                  <LifeBuoy size={18} />
                  Contact Support
                </Link>
              </div>
            </div>

            {/* Search */}
            <div className="mt-6">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search help topics (payments, booking, payouts, verification...)"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-10 py-3 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {[
                  "booking",
                  "payment",
                  "invoice",
                  "payout",
                  "kyc",
                  "verify",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQ(tag)}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {filtered.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.key}
                className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
                      <Icon className="text-teal-700" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-gray-900">
                        {t.title}
                      </h2>
                      <p className="mt-1 text-sm text-gray-600">{t.desc}</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    {t.items.slice(0, 4).map((i) => (
                      <button
                        key={i.to}
                        type="button"
                        onClick={() => navigate(i.to)}
                        className="w-full flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                      >
                        <span className="truncate">{i.label}</span>
                        <ArrowRight size={16} className="text-teal-700" />
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <HelpCircle size={14} className="text-teal-700" />
                      Popular topics
                    </span>
                    <Link
                      to="/contact"
                      className="font-semibold text-teal-700 hover:underline"
                    >
                      Need help?
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom tip */}
        <div className="mt-8 rounded-3xl border border-teal-100 bg-teal-50 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white border border-teal-100 p-3">
              <BookOpen className="text-teal-700" size={20} />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Quick tip</div>
              <div className="text-sm text-gray-700 mt-1">
                For faster support, include your <b>booking ID</b> or{" "}
                <b>trip ID</b> when contacting us.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
