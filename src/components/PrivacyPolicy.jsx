import React, { useMemo, useState } from "react";
import {
  FileText,
  Info,
  Lock,
  Search,
  ShieldCheck,
  Globe,
  Mail,
} from "lucide-react";

const sections = [
  {
    id: "collection",
    enTitle: "Data Collection",
    bnTitle: "ডেটা সংগ্রহ",
    en: [
      "We collect personal information such as your name, email, phone number, and booking history.",
      "We may collect identity verification data (e.g., NID/passport and selfie) to improve safety and prevent fraud.",
      "We may collect approximate location data when you use map-based features (e.g., search or pickup point).",
    ],
    bn: [
      "আমরা আপনার নাম, ইমেইল, ফোন নম্বর এবং বুকিং ইতিহাসের মতো ব্যক্তিগত তথ্য সংগ্রহ করি।",
      "নিরাপত্তা বৃদ্ধি এবং প্রতারণা প্রতিরোধের জন্য আমরা পরিচয় যাচাইকরণের তথ্য (যেমন NID/পাসপোর্ট ও সেলফি) সংগ্রহ করতে পারি।",
      "ম্যাপ-ভিত্তিক ফিচার ব্যবহার করলে (যেমন সার্চ বা পিকআপ পয়েন্ট) আমরা আনুমানিক লোকেশন ডেটা সংগ্রহ করতে পারি।",
    ],
  },
  {
    id: "usage",
    enTitle: "Data Usage",
    bnTitle: "ডেটা ব্যবহার",
    en: [
      "We use your data to provide and improve our services, including bookings, customer support, and account security.",
      "We do not sell your personal data to third parties.",
      "We may use anonymized/aggregated data for analytics and service improvement.",
    ],
    bn: [
      "বুকিং, কাস্টমার সাপোর্ট এবং অ্যাকাউন্ট নিরাপত্তাসহ আমাদের সেবা প্রদান ও উন্নয়নে আমরা আপনার ডেটা ব্যবহার করি।",
      "আমরা আপনার ব্যক্তিগত ডেটা কখনও তৃতীয় পক্ষের কাছে বিক্রি করি না।",
      "সেবা উন্নয়নের জন্য আমরা অজ্ঞাত/সমষ্টিগত (anonymized/aggregated) ডেটা বিশ্লেষণ করতে পারি।",
    ],
  },
  {
    id: "sharing",
    enTitle: "Data Sharing",
    bnTitle: "ডেটা শেয়ারিং",
    en: [
      "We share only necessary information with hosts/guests to complete bookings (e.g., name, contact details when required).",
      "Payment processing partners receive only required payment-related data to process transactions securely.",
      "We may share information when required by law or to prevent harm, fraud, or abuse.",
    ],
    bn: [
      "বুকিং সম্পন্ন করতে প্রয়োজনীয় তথ্যই আমরা হোস্ট/অতিথির সাথে শেয়ার করি (যেমন নাম, প্রয়োজন হলে যোগাযোগ তথ্য)।",
      "পেমেন্ট প্রক্রিয়াকরণ অংশীদাররা কেবল লেনদেন সম্পন্ন করার জন্য প্রয়োজনীয় পেমেন্ট-সম্পর্কিত ডেটা পায়।",
      "আইনগত বাধ্যবাধকতা বা ক্ষতি/প্রতারণা/অপব্যবহার রোধে প্রয়োজন হলে আমরা তথ্য শেয়ার করতে পারি।",
    ],
  },
  {
    id: "security",
    enTitle: "Security",
    bnTitle: "নিরাপত্তা",
    en: [
      "We take reasonable steps to protect your data using access controls and secure storage.",
      "No system is 100% secure. Please keep your password and OTP codes private.",
    ],
    bn: [
      "অ্যাক্সেস কন্ট্রোল ও নিরাপদ স্টোরেজ ব্যবহার করে আপনার ডেটা সুরক্ষায় আমরা যথাযথ ব্যবস্থা গ্রহণ করি।",
      "কোনো সিস্টেমই ১০০% নিরাপদ নয়। অনুগ্রহ করে আপনার পাসওয়ার্ড ও OTP গোপন রাখুন।",
    ],
  },
  {
    id: "rights",
    enTitle: "Your Rights",
    bnTitle: "আপনার অধিকার",
    en: [
      "You may request access, correction, or deletion of your personal data (subject to legal requirements).",
      "You can update profile information from your account settings.",
    ],
    bn: [
      "আপনি আপনার ব্যক্তিগত ডেটা দেখার, সংশোধন করার বা মুছে ফেলার অনুরোধ করতে পারেন (আইনগত শর্তসাপেক্ষে)।",
      "আপনি আপনার অ্যাকাউন্ট সেটিংস থেকে প্রোফাইল তথ্য আপডেট করতে পারবেন।",
    ],
  },
];

const PrivacyPolicy = () => {
  const [q, setQ] = useState("");
  const [lang, setLang] = useState("both"); // en | bn | both
  const [open, setOpen] = useState(() => new Set(["collection", "usage"]));

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return sections;

    return sections.filter((s) => {
      const hay = [s.enTitle, s.bnTitle, ...s.en, ...s.bn]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [q]);

  const toggle = (id) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
                  Privacy Policy
                </div>

                <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                  🔐 Privacy Policy / প্রাইভেসি নীতিমালা
                </h1>

                <p className="mt-2 max-w-3xl text-gray-600">
                  Your privacy is important to us. This page explains how
                  BanglaBnB collects, uses, shares, and protects your data.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-sm text-gray-700">
                    <ShieldCheck size={16} className="text-teal-700" />
                    Security-first
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-sm text-gray-700">
                    <Lock size={16} className="text-teal-700" />
                    No data selling
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-sm text-gray-700">
                    <Globe size={16} className="text-teal-700" />
                    Bangladesh
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
                    placeholder="Search (booking, verification, delete data...)"
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
                  <span className="font-semibold">Summary:</span> We use your
                  data to run the platform, improve safety, and support bookings
                  — and we do not sell your personal information.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="mt-8 space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-10 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                <Search className="text-teal-700" size={22} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No matching content found
              </h3>
              <p className="mt-1 text-gray-600">
                Try another keyword (e.g., delete, verification, payments).
              </p>
            </div>
          ) : (
            filtered.map((s) => {
              const isOpen = open.has(s.id);
              return (
                <div
                  key={s.id}
                  className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggle(s.id)}
                    className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <div className="text-lg font-bold text-gray-900">
                        {lang !== "bn" && <span>{s.enTitle}</span>}
                        {lang === "both" && (
                          <span className="text-gray-400"> / </span>
                        )}
                        {lang !== "en" && (
                          <span className="font-semibold">{s.bnTitle}</span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {isOpen ? "Hide details" : "View details"}
                      </div>
                    </div>

                    <span
                      className={[
                        "shrink-0 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                        isOpen
                          ? "bg-teal-50 text-teal-700 border-teal-200"
                          : "bg-white text-gray-700 border-gray-200",
                      ].join(" ")}
                    >
                      {isOpen ? "Open" : "Closed"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6">
                      <ul className="space-y-3">
                        {(lang === "bn" ? s.bn : lang === "en" ? s.en : null)
                          ? null
                          : null}
                        {/* Render bilingual bullets */}
                        {(() => {
                          const max = Math.max(s.en.length, s.bn.length);
                          const rows = [];
                          for (let i = 0; i < max; i++) {
                            const en = s.en[i];
                            const bn = s.bn[i];
                            rows.push([en, bn]);
                          }
                          return rows;
                        })().map(([enLine, bnLine], idx) => (
                          <li
                            key={idx}
                            className="rounded-2xl border border-gray-200 bg-white p-4"
                          >
                            {lang !== "bn" && enLine && (
                              <p className="font-semibold text-gray-900">
                                {enLine}
                              </p>
                            )}
                            {lang === "both" && enLine && bnLine && (
                              <div className="h-2" />
                            )}
                            {lang !== "en" && bnLine && (
                              <p className="text-sm text-gray-700">{bnLine}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact */}
        <div className="mt-10 rounded-3xl border border-teal-100 bg-teal-50 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white border border-teal-100 p-3">
              <Mail className="text-teal-700" size={20} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Questions?</div>
              <div className="text-sm text-gray-700 mt-1">
                If you have any questions about privacy or your data, contact
                support.
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
          This privacy policy is a general overview and may be updated from time
          to time.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
