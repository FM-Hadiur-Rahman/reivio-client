import React from "react";
import { Link } from "react-router-dom";
import { MailCheck, Info, ArrowLeft } from "lucide-react";

const VerifyNotice = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 via-cyan-500/10 to-emerald-500/10" />
          <div className="relative p-8 md:p-10 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl border border-teal-100 bg-teal-50 flex items-center justify-center">
              <MailCheck className="text-teal-700" size={26} />
            </div>

            <h2 className="mt-5 text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
              Verify your email
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              We’ve sent a verification link to your email address.
              <br />
              Please check your inbox and click the link to activate your
              account.
            </p>

            <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-left">
              <div className="flex items-start gap-2 text-sm text-teal-900">
                <Info size={16} className="mt-0.5 text-teal-700" />
                <div>
                  If you don’t see the email, check <b>Spam</b> /{" "}
                  <b>Promotions</b>, and search for <b>BanglaBnB</b>.
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              {/* Optional: link to a resend page if you have one */}
              <Link
                to="/resend-verification"
                className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-3 text-white font-semibold hover:bg-teal-700"
              >
                Resend email
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50"
              >
                <ArrowLeft size={18} className="text-teal-700" />
                Back to login
              </Link>
            </div>

            <p className="mt-5 text-xs text-gray-500">
              Didn’t receive anything? Make sure your email address is correct.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyNotice;
