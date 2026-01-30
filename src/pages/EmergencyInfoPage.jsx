import React from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BadgeCheck,
  Flame,
  PhoneCall,
  Siren,
  Stethoscope,
  ShieldCheck,
  MessageCircle,
  Info,
} from "lucide-react";

const EmergencyInfoPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600/10 via-amber-500/10 to-red-500/10" />
          <div className="relative p-7 md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700">
              <Siren size={16} />
              Emergency Help
            </div>

            <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Safety first
            </h1>

            <p className="mt-2 text-gray-700">
              If you’re in immediate danger, call national emergency services
              first. You can also contact BanglaBnB support for help.
            </p>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 text-amber-700" />
                <div>
                  <span className="font-semibold">Important:</span> Emergency
                  numbers may vary by region. If these don’t work, contact local
                  authorities immediately.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4">
          {/* Police */}
          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3">
                  <ShieldCheck className="text-rose-700" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Police</h2>
                  <p className="text-sm text-gray-600">Immediate assistance</p>
                </div>
              </div>
              <a
                href="tel:999"
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-white font-semibold hover:bg-rose-700"
              >
                <PhoneCall size={18} />
                Call 999
              </a>
            </div>
          </div>

          {/* Ambulance */}
          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3">
                  <Stethoscope className="text-rose-700" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Ambulance</h2>
                  <p className="text-sm text-gray-600">
                    Medical emergencies (DGHS)
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href="tel:199"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-800 hover:bg-gray-50"
                >
                  <PhoneCall size={18} className="text-rose-700" />
                  Call 199
                </a>
                <a
                  href="tel:16263"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-800 hover:bg-gray-50"
                >
                  <PhoneCall size={18} className="text-rose-700" />
                  Call 16263
                </a>
              </div>
            </div>
          </div>

          {/* Fire */}
          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3">
                  <Flame className="text-rose-700" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Fire Service
                  </h2>
                  <p className="text-sm text-gray-600">Fire & rescue</p>
                </div>
              </div>
              <a
                href="tel:999"
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-white font-semibold hover:bg-rose-700"
              >
                <PhoneCall size={18} />
                Call 999
              </a>
            </div>
          </div>

          {/* BanglaBnB Support */}
          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
                  <BadgeCheck className="text-teal-700" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    BanglaBnB Support
                  </h2>
                  <p className="text-sm text-gray-600">
                    Report issues, get guidance, or request help
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href="tel:+8801234567890"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-800 hover:bg-gray-50"
                >
                  <PhoneCall size={18} className="text-teal-700" />
                  Call Support
                </a>

                <a
                  href="https://wa.me/8801234567890"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-white font-semibold hover:bg-teal-700"
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-900">
              <div className="flex items-start gap-2">
                <Info size={16} className="mt-0.5 text-teal-700" />
                <div>
                  For faster handling, include your <b>booking ID</b> or{" "}
                  <b>trip ID</b> when contacting support.
                </div>
              </div>
            </div>
          </div>

          {/* Report */}
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Report a safety issue
                </h2>
                <p className="text-sm text-gray-700 mt-1">
                  If something feels unsafe, tell us immediately. Our team will
                  review and respond as quickly as possible.
                </p>
              </div>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-3 text-white font-semibold hover:bg-rose-700"
              >
                Submit a complaint
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          BanglaBnB cannot replace emergency services. Always call local
          authorities first in urgent situations.
        </p>
      </div>
    </div>
  );
};

export default EmergencyInfoPage;
