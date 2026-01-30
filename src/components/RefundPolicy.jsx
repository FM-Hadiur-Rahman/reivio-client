import React, { useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  CreditCard,
  FileText,
  Info,
  Search,
  ShieldCheck,
} from "lucide-react";

const rules = [
  {
    id: "48h",
    titleEn: "Cancel 48+ hours before check-in",
    titleBn: "চেক-ইনের ৪৮ ঘণ্টা বা তার আগে বাতিল",
    refundEn: "Full refund",
    refundBn: "সম্পূর্ণ রিফান্ড",
    noteEn:
      "If you cancel at least 48 hours before check-in time, you get a full refund.",
    noteBn:
      "চেক-ইনের সময়ের অন্তত ৪৮ ঘণ্টা আগে বাতিল করলে আপনি সম্পূর্ণ রিফান্ড পাবেন।",
  },
  {
    id: "24-48h",
    titleEn: "Cancel within 24–48 hours before check-in",
    titleBn: "চেক-ইনের ২৪–৪৮ ঘণ্টার মধ্যে বাতিল",
    refundEn: "50% refund",
    refundBn: "৫০% রিফান্ড",
    noteEn:
      "If you cancel between 24 and 48 hours before check-in, you get a 50% refund.",
    noteBn:
      "চেক-ইনের ২৪ থেকে ৪৮ ঘণ্টার মধ্যে বাতিল করলে আপনি ৫০% রিফান্ড পাবেন।",
  },
  {
    id: "under24h",
    titleEn: "Cancel within 24 hours of check-in",
    titleBn: "চেক-ইনের ২৪ ঘণ্টার মধ্যে বাতিল",
    refundEn: "No refund",
    refundBn: "রিফান্ড নেই",
    noteEn:
      "If you cancel within 24 hours of check-in, the booking is non-refundable.",
    noteBn: "চেক-ইনের ২৪ ঘণ্টার মধ্যে বাতিল করলে বুকিংটি রিফান্ডযোগ্য নয়।",
  },
];

const RefundPolicy = () => {
  const [lang, setLang] = useState("both"); // en | bn | both
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rules;

    return rules.filter((r) => {
      const hay = [
        r.titleEn,
        r.titleBn,
        r.refundEn,
        r.refundBn,
        r.noteEn,
        r.noteBn,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [q]);

  const RefundBadge = ({ type }) => {
    const t = type.toLowerCase();
    const cls =
      t.includes("full") || t.includes("সম্পূর্ণ")
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : t.includes("50") || t.includes("৫০")
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-rose-50 text-rose-700 border-rose-200";

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}
      >
        <BadgeCheck size={14} />
        {type}
      </span>
    );
  };

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
                  <FileText size={16} />
                  Refund Policy
                </div>

                <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                  💸 Refund Policy / রিফান্ড নীতিমালা
                </h1>

                <p className="mt-2 max-w-3xl text-gray-600">
                  Our refund policy ensures fairness for both guests and hosts.
                  Please read the rules below to understand refund eligibility.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-sm text-gray-700">
                    <CalendarDays size={16} className="text-teal-700" />
                    Based on check-in time
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-sm text-gray-700">
                    <CreditCard size={16} className="text-teal-700" />
                    Transparent fees
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-sm text-gray-700">
                    <ShieldCheck size={16} className="text-teal-700" />
                    Fair & consistent
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="w-full md:w-[420px] space-y-3">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                  />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search (48 hours, 50%, refund...)"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-10 py-3 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-1">
                  {[
                    { key: "both", label: "EN + BN" },
                    { key: "en", label: "English" },
                    { key: "bn", label: "বাংলা" },
                  ].map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => setLang(o.key)}
                      className={[
                        "flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition",
                        lang === o.key
                          ? "bg-teal-600 text-white"
                          : "text-gray-700 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-900">
              <div className="flex items-start gap-2">
                <Info size={16} className="mt-0.5 text-teal-700" />
                <div>
                  <span className="font-semibold">Tip:</span> Refund timing is
                  calculated from your listing’s check-in time. Host-specific
                  rules may apply if stated on the listing page.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {filtered.length === 0 ? (
            <div className="md:col-span-3 rounded-3xl border border-gray-200 bg-white shadow-sm p-10 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                <Search className="text-teal-700" size={22} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No matching policy found
              </h3>
              <p className="mt-1 text-gray-600">
                Try searching “48”, “24”, “50%” or “refund”.
              </p>
            </div>
          ) : (
            filtered.map((r) => (
              <div
                key={r.id}
                className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  <div className="text-xs font-semibold text-gray-500">
                    {lang !== "bn" && "Rule"}
                    {lang === "both" && " / "}
                    {lang !== "en" && "নিয়ম"}
                  </div>

                  <h2 className="mt-2 text-lg font-bold text-gray-900">
                    {lang !== "bn" && <span>{r.titleEn}</span>}
                    {lang === "both" && (
                      <span className="text-gray-400"> / </span>
                    )}
                    {lang !== "en" && (
                      <span className="font-semibold">{r.titleBn}</span>
                    )}
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {lang !== "bn" && <RefundBadge type={r.refundEn} />}
                    {lang === "both" && <span className="hidden sm:inline" />}
                    {lang !== "en" && <RefundBadge type={r.refundBn} />}
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    {lang !== "bn" && (
                      <p className="text-gray-700">{r.noteEn}</p>
                    )}
                    {lang === "both" && <div className="h-1" />}
                    {lang !== "en" && (
                      <p className="text-gray-700">{r.noteBn}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 rounded-3xl border border-teal-100 bg-teal-50 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white border border-teal-100 p-3">
              <ShieldCheck className="text-teal-700" size={20} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">
                Need help with a refund?
              </div>
              <div className="text-sm text-gray-700 mt-1">
                Contact support with your booking ID for faster assistance.
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-3 text-white font-semibold hover:bg-teal-700"
                >
                  Contact Support
                </a>
                <a
                  href="/help"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Help Center
                </a>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Refund policy may be updated. Always check the listing’s cancellation
          terms before booking.
        </p>
      </div>
    </div>
  );
};

export default RefundPolicy;
