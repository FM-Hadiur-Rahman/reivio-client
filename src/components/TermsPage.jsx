import React, { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Globe,
  Info,
  Search,
  ShieldCheck,
} from "lucide-react";

const terms = [
  {
    en: "1. Account Registration",
    bn: "১। অ্যাকাউন্ট নিবন্ধন",
    details: [
      [
        "Users must be 18 years or older to create an account.",
        "ব্যবহারকারীদের অ্যাকাউন্ট তৈরি করতে হলে ন্যূনতম ১৮ বছর বয়সী হতে হবে।",
      ],
      [
        "All information provided must be accurate.",
        "সব তথ্য সঠিকভাবে প্রদান করতে হবে।",
      ],
    ],
  },
  {
    en: "2. Booking & Payment",
    bn: "২। বুকিং ও পেমেন্ট",
    details: [
      [
        "Bookings are confirmed only after full payment via supported methods (e.g., bKash).",
        "বিকাশসহ অনুমোদিত পদ্ধতিতে সম্পূর্ণ পেমেন্টের পরই বুকিং নিশ্চিত হয়।",
      ],
    ],
  },
  {
    en: "3. Host Responsibilities",
    bn: "৩। হোস্টের দায়িত্ব",
    details: [
      [
        "Hosts must provide accurate information and ensure property cleanliness and safety.",
        "হোস্টদের সঠিক তথ্য দিতে হবে এবং বাড়ির পরিষ্কার-পরিচ্ছন্নতা ও নিরাপত্তা নিশ্চিত করতে হবে।",
      ],
    ],
  },
  {
    en: "4. Guest Responsibilities",
    bn: "৪। অতিথির দায়িত্ব",
    details: [
      [
        "Guests must respect the host’s property and avoid any damage or unlawful activity.",
        "অতিথিদের হোস্টের সম্পত্তির প্রতি সম্মান প্রদর্শন করতে হবে এবং কোনো ক্ষতি বা বেআইনি কাজ থেকে বিরত থাকতে হবে।",
      ],
    ],
  },
  {
    en: "5. Identity Verification",
    bn: "৫। পরিচয় যাচাইকরণ",
    details: [
      [
        "Hosts and guests must verify their identity through NID/passport and photo.",
        "হোস্ট ও অতিথিদের জাতীয় পরিচয়পত্র/পাসপোর্ট ও ছবি দিয়ে পরিচয় যাচাই করতে হবে।",
      ],
    ],
  },
  {
    en: "6. Service Fees",
    bn: "৬। সার্ভিস ফি",
    details: [
      [
        "We charge commission from hosts and service fees from guests, shown clearly before payment.",
        "আমরা হোস্টদের থেকে কমিশন এবং অতিথিদের থেকে সার্ভিস ফি গ্রহণ করি, যা পেমেন্টের আগে পরিষ্কারভাবে প্রদর্শিত হয়।",
      ],
    ],
  },
  {
    en: "7. Cancellations & Refunds",
    bn: "৭। বুকিং বাতিল ও রিফান্ড",
    details: [
      [
        "Cancellation policies vary by listing and may affect refund eligibility.",
        "বুকিং বাতিলের নিয়মাবলি ভিন্ন ভিন্ন লিস্টিং অনুযায়ী নির্ধারিত এবং তা রিফান্ড পাওয়ার যোগ্যতাকে প্রভাবিত করতে পারে।",
      ],
    ],
  },
  {
    en: "8. Liability Disclaimer",
    bn: "৮। দায়দায়িত্ব থেকে অব্যাহতি",
    details: [
      [
        "We are a platform only. We are not responsible for any injury, damage, or unlawful acts during the stay.",
        "আমরা শুধুমাত্র একটি প্ল্যাটফর্ম। অবস্থানের সময় কোনো দুর্ঘটনা, ক্ষতি বা বেআইনি কর্মকাণ্ডের জন্য আমরা দায়ী নই।",
      ],
    ],
  },
  {
    en: "9. Termination",
    bn: "৯। অ্যাকাউন্ট বাতিল",
    details: [
      [
        "We reserve the right to suspend or remove accounts for violations of these terms.",
        "এই শর্তাবলির লঙ্ঘনের জন্য আমরা অ্যাকাউন্ট বাতিল বা স্থগিত করার অধিকার সংরক্ষণ করি।",
      ],
    ],
  },
  {
    en: "10. Privacy & Data",
    bn: "১০। প্রাইভেসি ও ডেটা",
    details: [
      [
        "We use your data to improve our services. We do not sell your data.",
        "আমরা আমাদের সার্ভিস উন্নত করতে আপনার ডেটা ব্যবহার করি। আমরা তা বিক্রি করি না।",
      ],
    ],
  },
  {
    en: "11. Changes to Terms",
    bn: "১১। শর্তাবলির পরিবর্তন",
    details: [
      [
        "BanglaBnB may update these Terms. Continued use means you agree to the changes.",
        "BanglaBnB এই শর্তাবলি পরিবর্তন করতে পারে। ব্যবহার চালিয়ে যাওয়ার অর্থ হল আপনি পরিবর্তনগুলোতে সম্মত।",
      ],
    ],
  },
  {
    en: "12. Governing Law",
    bn: "১২। প্রযোজ্য আইন",
    details: [
      [
        "These terms are governed under the laws of Bangladesh.",
        "এই শর্তাবলি বাংলাদেশের প্রচলিত আইনের অধীনে প্রযোজ্য।",
      ],
    ],
  },
];

export default function TermsPage() {
  const [q, setQ] = useState("");
  const [lang, setLang] = useState("both"); // en | bn | both
  const [open, setOpen] = useState(() => new Set()); // expanded sections

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return terms;

    return terms.filter((s) => {
      const hay = [s.en, s.bn, ...s.details.flatMap(([en, bn]) => [en, bn])]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [q]);

  const toggleOpen = (idx) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
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
                  Terms & Conditions
                </div>

                <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                  Terms & Conditions / শর্তাবলী
                </h1>

                <p className="mt-2 max-w-3xl text-gray-600">
                  Please read these terms carefully. By using BanglaBnB, you
                  agree to the rules below.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-sm text-gray-700">
                    <ShieldCheck size={16} className="text-teal-700" />
                    Safety & trust
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-sm text-gray-700">
                    <Globe size={16} className="text-teal-700" />
                    Bangladesh
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-sm text-gray-700">
                    <BookOpen size={16} className="text-teal-700" />
                    {terms.length} sections
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
                    placeholder="Search terms (booking, refund, verification, data...)"
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
                  <span className="font-semibold">Note:</span> This is a general
                  summary. For legal advice, consult a qualified professional.
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
                No matching terms found
              </h3>
              <p className="mt-1 text-gray-600">
                Try a different keyword (e.g., refund, booking, verification).
              </p>
            </div>
          ) : (
            filtered.map((section, idx) => {
              const isOpen = open.has(idx);
              return (
                <div
                  key={`${section.en}-${idx}`}
                  className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleOpen(idx)}
                    className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <div className="text-lg font-bold text-gray-900">
                        {lang !== "bn" && <span>{section.en}</span>}
                        {lang === "both" && (
                          <span className="text-gray-400"> / </span>
                        )}
                        {lang !== "en" && (
                          <span className="font-semibold">{section.bn}</span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {section.details.length} point
                        {section.details.length !== 1 ? "s" : ""}
                      </div>
                    </div>

                    <div
                      className={[
                        "shrink-0 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                        isOpen
                          ? "bg-teal-50 text-teal-700 border-teal-200"
                          : "bg-white text-gray-700 border-gray-200",
                      ].join(" ")}
                    >
                      <CheckCircle2
                        size={14}
                        className={isOpen ? "text-teal-700" : "text-gray-500"}
                      />
                      {isOpen ? "Hide" : "View"}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6">
                      <ul className="space-y-3">
                        {section.details.map(([en, bn], j) => (
                          <li
                            key={j}
                            className="rounded-2xl border border-gray-200 bg-white p-4"
                          >
                            {lang !== "bn" && (
                              <p className="font-semibold text-gray-900">
                                {en}
                              </p>
                            )}
                            {lang === "both" && <div className="h-2" />}
                            {lang !== "en" && (
                              <p className="text-sm text-gray-700">{bn}</p>
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

        {/* Footer note */}
        <div className="mt-10 rounded-3xl border border-teal-100 bg-teal-50 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white border border-teal-100 p-3">
              <ShieldCheck className="text-teal-700" size={20} />
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                Questions about these terms?
              </div>
              <div className="text-sm text-gray-700 mt-1">
                Visit the Help Center or contact support for clarification.
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="/help"
                  className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-3 text-white font-semibold hover:bg-teal-700"
                >
                  Go to Help Center
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
