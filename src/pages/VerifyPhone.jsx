import axios from "axios";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authHeader } from "../utils/authHeader";
import {
  ArrowLeft,
  CheckCircle2,
  Info,
  Phone,
  ShieldCheck,
} from "lucide-react";

export const API = import.meta.env.VITE_API_URL;

const VerifyPhonePage = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1=phone, 2=otp
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const navigate = useNavigate();

  const canSend = useMemo(
    () => phone.trim().length >= 8 && !sending,
    [phone, sending],
  );
  const canVerify = useMemo(
    () => otp.trim().length >= 4 && !verifying,
    [otp, verifying],
  );

  const sendOTP = async () => {
    if (!phone.trim()) return toast.error("Please enter your phone number.");
    try {
      setSending(true);
      await axios.post(
        `${API}/api/auth/send-otp`,
        { phone: phone.trim() },
        authHeader(),
      );
      toast.success("✅ OTP sent to your phone!");
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "❌ Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp.trim()) return toast.error("Please enter the OTP code.");
    try {
      setVerifying(true);
      await axios.post(
        `${API}/api/auth/verify-otp`,
        { otp: otp.trim() },
        authHeader(),
      );
      toast.success("✅ Mobile verified!");
      navigate("/dashboard"); // or navigate(-1)
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          "❌ Incorrect OTP or verification failed",
      );
    } finally {
      setVerifying(false);
    }
  };

  const resendOTP = async () => {
    // same endpoint again
    await sendOTP();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 via-cyan-500/10 to-emerald-500/10" />
          <div className="relative p-7">
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                <ArrowLeft size={18} className="text-teal-700" />
                Back
              </button>

              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                <ShieldCheck size={16} />
                Account Security
              </div>
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-tight text-gray-900">
              Verify your mobile
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              We’ll send an OTP to confirm it’s really you.
            </p>

            {/* Stepper */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div
                className={[
                  "rounded-2xl border px-4 py-3 text-sm font-semibold",
                  step === 1
                    ? "border-teal-200 bg-teal-50 text-teal-800"
                    : "border-gray-200 bg-white text-gray-700",
                ].join(" ")}
              >
                1) Phone
              </div>
              <div
                className={[
                  "rounded-2xl border px-4 py-3 text-sm font-semibold",
                  step === 2
                    ? "border-teal-200 bg-teal-50 text-teal-800"
                    : "border-gray-200 bg-white text-gray-400",
                ].join(" ")}
              >
                2) OTP
              </div>
            </div>

            {/* Content */}
            <div className="mt-6 space-y-4">
              {step === 1 ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Phone number
                    </label>
                    <div className="relative">
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +8801XXXXXXXXX"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 pl-11 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                      />
                      <Phone
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Use country code (e.g. +880). We won’t share your number.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={sendOTP}
                    disabled={!canSend}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-white font-semibold hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sending ? "Sending..." : "Send Code"}
                    <CheckCircle2 size={18} />
                  </button>

                  <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-900">
                    <div className="flex items-start gap-2">
                      <Info size={16} className="mt-0.5 text-teal-700" />
                      <div>
                        If you don’t receive the code, wait 30–60 seconds and
                        try again.
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      OTP code
                    </label>
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      We sent a code to:{" "}
                      <span className="font-semibold">
                        {phone || "your phone"}
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={verifyOTP}
                    disabled={!canVerify}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {verifying ? "Verifying..." : "Verify"}
                    <CheckCircle2 size={18} />
                  </button>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOtp("");
                        setStep(1);
                      }}
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-800 hover:bg-gray-50"
                    >
                      Change number
                    </button>

                    <button
                      type="button"
                      onClick={resendOTP}
                      disabled={sending || !phone.trim()}
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {sending ? "Resending..." : "Resend code"}
                    </button>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <div className="flex items-start gap-2">
                      <Info size={16} className="mt-0.5 text-amber-700" />
                      <div>
                        Don’t share your OTP with anyone — even support staff.
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          Having trouble? Contact support from the Help page.
        </p>
      </div>
    </div>
  );
};

export default VerifyPhonePage;
