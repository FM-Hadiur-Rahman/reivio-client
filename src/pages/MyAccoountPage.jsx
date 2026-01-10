// pages/MyAccountPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import PaymentDetailsForm from "../components/PaymentDetailsForm";

const badgeFor = (status) => {
  const s = (status || "pending").toLowerCase();
  if (s === "approved")
    return {
      text: "Verified",
      cls: "bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded",
    };
  if (s === "rejected")
    return {
      text: "Rejected",
      cls: "bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded",
    };
  return {
    text: "Pending verification",
    cls: "bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded",
  };
};

const mask = (v) => {
  if (!v) return "—";
  const s = String(v);
  if (s.length <= 4) return "****";
  return `${s.slice(0, 4)}****${s.slice(-2)}`;
};

export default function MyAccountPage() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/users/me"); // keep your route
      const u = res?.data?.user ?? res?.data;
      setUser(u);
      if (u) localStorage.setItem("user", JSON.stringify(u));
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  // Auto-refresh while pending
  useEffect(() => {
    if (!user) return;
    const status = user?.paymentDetails?.status?.toLowerCase();
    if (status === "pending") {
      const t = setInterval(fetchMe, 1000000);
      return () => clearInterval(t);
    }
  }, [user]);

  const role = useMemo(() => {
    return (
      user?.role ||
      user?.primaryRole ||
      (Array.isArray(user?.roles) ? user.roles[0] : "user")
    );
  }, [user]);

  if (loading || !user)
    return <p className="text-center mt-10">Loading profile...</p>;

  const pd = user.paymentDetails || {};
  const badge = badgeFor(pd.status);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        👤 My Account
      </h1>

      <div className="md:flex md:justify-between gap-10">
        {/* LEFT: Account info */}
        <div className="md:w-1/2 space-y-5 bg-gray-50 p-6 rounded border">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            📋 Account Information
          </h2>

          <div>
            <span className="font-medium text-gray-600">Name:</span> {user.name}
          </div>
          <div>
            <span className="font-medium text-gray-600">Email:</span>{" "}
            {user.email}
          </div>
          <div>
            <span className="font-medium text-gray-600">Phone:</span>{" "}
            {user.phone || "Not added"}
          </div>
          <div>
            <span className="font-medium text-gray-600">Role:</span>{" "}
            <span className="capitalize">{role}</span>
          </div>

          <div>
            <span className="font-medium text-gray-600">Email Verified:</span>{" "}
            <span
              className={user.isVerified ? "text-green-600" : "text-red-600"}
            >
              {user.isVerified ? "✅ Yes" : "❌ No"}
            </span>
          </div>

          <div>
            <span className="font-medium text-gray-600">Phone Verified:</span>{" "}
            {user.phoneVerified ? (
              <span className="text-green-600">✅ Verified</span>
            ) : (
              <Link to="/verify-phone" className="text-blue-600 underline">
                🔴 Not Verified — Verify Now
              </Link>
            )}
          </div>

          <div>
            <span className="font-medium text-gray-600">
              Identity Verified:
            </span>{" "}
            <span
              className={
                user.identityVerified ? "text-green-600" : "text-red-600"
              }
            >
              {user.identityVerified ? "✅ Yes" : "❌ No"}
            </span>
          </div>

          {user.avatar && (
            <div>
              <span className="font-medium text-gray-600">Profile Photo:</span>
              <img
                src={user.avatar}
                alt="avatar"
                className="w-24 h-24 rounded-full border mt-2 shadow-sm"
              />
            </div>
          )}

          {user.idDocumentUrl && (
            <div>
              <span className="font-medium text-gray-600">ID Document:</span>
              <a
                href={user.idDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline block mt-1"
              >
                View ID
              </a>
            </div>
          )}

          {user.livePhotoUrl && (
            <div>
              <span className="font-medium text-gray-600">Live Photo:</span>
              <img
                src={user.livePhotoUrl}
                alt="live selfie"
                className="w-24 h-24 rounded border mt-2 shadow-sm"
              />
            </div>
          )}
        </div>

        {/* RIGHT: Payout details */}
        {(role === "host" || role === "driver") && (
          <div className="md:w-1/2 mt-10 md:mt-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-700">
                💳 Payout Account Details
              </h2>
              <div className="flex items-center gap-2">
                <span className={badge.cls}>{badge.text}</span>
                <button
                  onClick={fetchMe}
                  className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200"
                  title="Refresh"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setEditing((v) => !v)}
                  className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  {editing ? "Close" : "Edit"}
                </button>
              </div>
            </div>

            {!editing ? (
              <div className="bg-white rounded border p-4">
                <dl className="space-y-2">
                  <div>
                    <dt className="font-medium inline">Payment Method: </dt>
                    <dd className="inline">
                      {pd.method ||
                        (pd.walletType ? pd.walletType : pd.bankName) ||
                        "—"}
                    </dd>
                  </div>

                  {/* Bank fields */}
                  {(pd.bankName ||
                    pd.accountNumber ||
                    pd.accountName ||
                    pd.routingNumber ||
                    pd.branch) && (
                    <>
                      {pd.bankName && (
                        <div>
                          <dt className="font-medium inline">Bank: </dt>
                          <dd className="inline">{pd.bankName}</dd>
                        </div>
                      )}
                      {pd.branch && (
                        <div>
                          <dt className="font-medium inline">Branch: </dt>
                          <dd className="inline">{pd.branch}</dd>
                        </div>
                      )}
                      {pd.accountName && (
                        <div>
                          <dt className="font-medium inline">Account Name: </dt>
                          <dd className="inline">{pd.accountName}</dd>
                        </div>
                      )}
                      {pd.accountNumber && (
                        <div>
                          <dt className="font-medium inline">Account No: </dt>
                          <dd className="inline">{mask(pd.accountNumber)}</dd>
                        </div>
                      )}
                      {pd.routingNumber && (
                        <div>
                          <dt className="font-medium inline">Routing: </dt>
                          <dd className="inline">{mask(pd.routingNumber)}</dd>
                        </div>
                      )}
                    </>
                  )}

                  {/* Wallet fields */}
                  {(pd.walletType || pd.walletName || pd.walletNumber) && (
                    <>
                      {pd.walletType && (
                        <div>
                          <dt className="font-medium inline">Wallet: </dt>
                          <dd className="inline">{pd.walletType}</dd>
                        </div>
                      )}
                      {pd.walletName && (
                        <div>
                          <dt className="font-medium inline">Wallet Name: </dt>
                          <dd className="inline">{pd.walletName}</dd>
                        </div>
                      )}
                      {pd.walletNumber && (
                        <div>
                          <dt className="font-medium inline">Wallet No: </dt>
                          <dd className="inline">{mask(pd.walletNumber)}</dd>
                        </div>
                      )}
                    </>
                  )}

                  <div className="pt-2 text-sm text-gray-500">
                    {pd.submittedAt && (
                      <div>
                        Submitted: {new Date(pd.submittedAt).toLocaleString()}
                      </div>
                    )}
                    {pd.reviewedAt && (
                      <div>
                        Reviewed: {new Date(pd.reviewedAt).toLocaleString()}
                      </div>
                    )}
                    {pd.status === "rejected" && pd.reviewReason && (
                      <div className="text-rose-600">
                        Reason: {pd.reviewReason}
                      </div>
                    )}
                  </div>
                </dl>
              </div>
            ) : (
              <PaymentDetailsForm
                onSaved={() => {
                  setEditing(false);
                  fetchMe();
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
