import React, { useState } from "react";
import {
  Mail,
  Phone,
  MessageSquare,
  Clock,
  MapPin,
  Send,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const ContactUsPage = () => {
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // TODO: connect to your API (e.g. /api/contact)
    // For now just simulate
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header / Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 via-cyan-500/10 to-emerald-500/10" />
          <div className="relative p-8 md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
              <Sparkles size={16} />
              Premium Support
            </div>

            <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Contact Us
            </h1>

            <p className="mt-2 max-w-2xl text-gray-600">
              Have a question, feedback, or need help with a booking? Send us a
              message and our team will get back to you as soon as possible.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 border border-gray-200">
                <ShieldCheck className="text-teal-600" size={16} />
                We never share your data
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 border border-gray-200">
                <Clock className="text-teal-600" size={16} />
                Reply within 24h (usually faster)
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Contact Cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-teal-50 p-3 border border-teal-100">
                  <Mail className="text-teal-700" size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">help@banglabnb.com</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Best for account and booking support
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-teal-50 p-3 border border-teal-100">
                  <Phone className="text-teal-700" size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">WhatsApp</p>
                  <p className="text-sm text-gray-600">+880-1XXX-XXXXXX</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Quick questions & urgent issues
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-teal-50 p-3 border border-teal-100">
                  <Clock className="text-teal-700" size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Support Hours</p>
                  <p className="text-sm text-gray-600">9 AM – 8 PM (BDT)</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Outside hours: leave a message anytime
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white p-3 border border-teal-100">
                  <MapPin className="text-teal-700" size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Tip</p>
                  <p className="text-sm text-gray-700">
                    If this is about a booking, include your booking ID to get
                    faster support.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-teal-600/5 to-cyan-500/5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="text-teal-700" size={18} />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Send us a message
                  </h2>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  We’ll respond by email. Please provide accurate contact info.
                </p>
              </div>

              <form onSubmit={onSubmit} className="p-6 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pl-11 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-600">
                      <Sparkles size={18} />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pl-11 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-600">
                      <Mail size={18} />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Tell us what happened…"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100 resize-none"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Please don’t include passwords or sensitive payment details.
                  </p>
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                  <div className="text-xs text-gray-500">
                    By sending, you agree to be contacted about your request.
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-white font-semibold shadow-sm transition hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending..." : "Send Message"}
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>

            {/* Optional footer note */}
            <div className="mt-4 text-xs text-gray-500">
              Prefer WhatsApp? Message us and include your email so we can
              follow up with details.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
