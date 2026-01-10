import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { authHeader } from "../utils/authHeader"; // 🔄 adjust path
export const API = import.meta.env.VITE_API_URL;

const VerifyPhonePage = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const sendOTP = async () => {
    try {
      await axios.post(`${API}/api/auth/send-otp`, { phone }, authHeader());
      setStep(2);
    } catch (err) {
      toast.error("❌ Failed to send OTP");
    }
  };

  const verifyOTP = async () => {
    try {
      await axios.post(`${API}/api/auth/verify-otp`, { otp }, authHeader());
      toast.success("✅ Mobile verified!");
      navigate("/dashboard"); // or go back to previous page
    } catch (err) {
      toast.error("❌ Incorrect OTP or verification failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      {step === 1 ? (
        <>
          <h2 className="text-xl font-bold mb-4">📱 Verify Your Mobile</h2>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter Phone"
            className="w-full border px-3 py-2 rounded mb-4"
          />
          <button
            onClick={sendOTP}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Send Code
          </button>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4">🔐 Enter OTP</h2>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full border px-3 py-2 rounded mb-4"
          />
          <button
            onClick={verifyOTP}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Verify
          </button>
        </>
      )}
    </div>
  );
};

export default VerifyPhonePage;
