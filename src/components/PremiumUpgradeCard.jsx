import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const PremiumUpgradeCard = ({ isPremium, expiresAt }) => {
  const handleUpgrade = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/premium`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      window.location.href = res.data.url;
    } catch (err) {
      toast.error("❌ Failed to initiate payment");
      console.error(err);
    }
  };

  const isExpiringSoon =
    isPremium && expiresAt && dayjs(expiresAt).diff(dayjs(), "day") <= 30;

  if (isPremium && !isExpiringSoon) {
    return (
      <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-xl shadow text-yellow-800 text-center">
        🌟 You are a <strong>Premium Host</strong>! <br />
        Your premium is active until{" "}
        <strong>{dayjs(expiresAt).format("MMMM D, YYYY")}</strong>.
      </div>
    );
  }

  if (isExpiringSoon) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 p-4 rounded-xl shadow text-yellow-900 text-center">
        ⚠️ Your Premium will expire on{" "}
        <strong>{dayjs(expiresAt).format("MMMM D, YYYY")}</strong>. <br />
        Renew now to maintain your premium visibility!
        <br />
        <button
          onClick={handleUpgrade}
          className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded"
        >
          Renew Premium
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2">🚀 Upgrade to Premium</h2>
      <p className="text-gray-700 mb-4">
        Get a badge, search boost, and exclusive features. Only ৳499/month.
      </p>
      <button
        onClick={handleUpgrade}
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded"
      >
        Upgrade Now
      </button>
    </div>
  );
};

export default PremiumUpgradeCard;
