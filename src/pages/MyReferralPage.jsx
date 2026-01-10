import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const MyReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [referralCode, setReferralCode] = useState("");
  const [referralRewards, setReferralRewards] = useState(0);

  const token = localStorage.getItem("token");

  const fetchReferrals = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/auth/my-referrals`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReferrals(res.data.referrals);
    } catch (err) {
      toast.error("❌ Failed to load referrals");
    }
  };

  useEffect(() => {
    const fetchUserAndReferrals = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const currentUser = res.data.user;
        setReferralCode(currentUser.referralCode);
        setReferralRewards(currentUser.referralRewards || 0);
      } catch (err) {
        console.warn("Failed to fetch user data");
      }

      fetchReferrals();
    };

    fetchUserAndReferrals();
  }, []);

  const referralLink = `https://banglabnb.com/signup?ref=${referralCode}`;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">🎁 My Referrals</h2>

      {/* Referral Code */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
        <h3 className="text-lg font-semibold mb-1">Your Referral Code</h3>
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            readOnly
            value={referralCode}
            className="px-3 py-2 border rounded w-40 font-mono text-sm"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(referralCode);
              toast.success("✅ Code copied");
            }}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
          >
            Copy
          </button>
        </div>

        {/* Referral Link */}
        <h3 className="text-md font-semibold mb-1">Your Referral Link</h3>
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="px-3 py-2 border rounded w-full text-sm"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(referralLink);
              toast.success("✅ Link copied");
            }}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
          >
            Copy
          </button>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-3 mt-2">
          <a
            href={`https://wa.me/?text=Join BanglaBnB and get rewarded! Use my referral: ${referralLink}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
          >
            WhatsApp
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              referralLink
            )}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            Facebook
          </a>
          <a
            href={`https://www.messenger.com/share?link=${encodeURIComponent(
              referralLink
            )}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          >
            Messenger
          </a>
        </div>

        <p className="text-sm text-gray-500 mt-2">
          Share this link with friends. You’ll earn rewards when they book!
        </p>
      </div>

      {/* Rewards Summary */}
      <h3 className="text-md font-semibold mb-1">Your Earned Rewards</h3>
      <p className="text-green-700 text-sm mb-4">
        🎉 You’ve earned <strong>{referralRewards}</strong> reward
        {referralRewards !== 1 ? "s" : ""} ={" "}
        <strong>৳{referralRewards * 150}</strong>
      </p>

      {/* Referral List */}
      <h3 className="font-semibold mb-2">
        People You Referred ({referrals.length})
      </h3>
      {referrals.length === 0 ? (
        <p className="text-gray-600">You have not referred anyone yet.</p>
      ) : (
        <ul className="space-y-2">
          {referrals.map((r) => (
            <li key={r.email} className="p-3 border rounded bg-white shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-sm text-gray-500">{r.email}</div>
                  <div className="text-xs text-gray-400">
                    Joined:{" "}
                    {r.createdAt && !isNaN(new Date(r.createdAt))
                      ? new Date(r.createdAt).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
                {r.hasBooked && (
                  <span className="text-green-600 text-xs font-semibold border border-green-300 px-2 py-1 rounded">
                    ✅ Rewarded
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyReferrals;
