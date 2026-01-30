// pages/MyAccountPage.jsx (Premium Teal)
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import PaymentDetailsForm from "../components/PaymentDetailsForm";
import {
  BadgeCheck,
  Camera,
  CreditCard,
  Info,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  User,
  Wallet,
  XCircle,
  Phone,
  Mail,
  IdCard,
  Pencil,
} from "lucide-react";

const badgeFor = (status) => {
  const s = (status || "pending").toLowerCase();
  if (s === "approved")
    return {
      text: "Verified",
      cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      icon: BadgeCheck,
    };
  if (s === "rejected")
    return {
      text: "Rejected",
      cls: "bg-rose-50 text-rose-700 border border-rose-200",
      icon: XCircle,
    };
  return {
    text: "Pending verification",
    cls: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: ShieldCheck,
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
      const res = await api.get("/api/users/me");
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
      const t = setInterval(fetchMe, 1000000); // keep your current interval
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

  const pd = user?.paymentDetails || {};
  const badge = badgeFor(pd.status);
  const BadgeIcon = badge.icon;

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white flex items-center justify-center px-4">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-10 flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-teal-700" size={26} />
          <p className="text-gray-600">Loading profile…</p>
        </div>
      </div>
    );
  }

  const isHostOrDriver = role === "host" || role === "driver";

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
                  <User size={16} />
                  My Account
                </div>

                <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                  Profile & Verification
                </h1>

                <p className="mt-2 max-w-2xl text-gray-600">
                  Manage your account details, verification status, and payout
                  settings.
                </p>
              </div>

              <button
                onClick={fetchMe}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-white font-semibold shadow-sm hover:bg-teal-700"
                title="Refresh profile"
              >
                <RefreshCcw size={18} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Profile */}
          <div className="lg:col-span-6 space-y-6">
            {/* Profile card */}
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Account information
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Your basic account details and role.
                </p>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="text-teal-700" size={26} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xl font-bold text-gray-900 truncate">
                      {user.name || "—"}
                    </div>

                    <div className="mt-2 flex flex-col gap-1 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-teal-700" />
                        <span className="truncate">{user.email || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-teal-700" />
                        <span>{user.phone || "Not added"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Info size={16} className="text-teal-700" />
                        <span>
                          Role:{" "}
                          <span className="font-semibold capitalize text-gray-900">
                            {role}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Small chip */}
                  <div className="shrink-0 inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                    {user.isVerified ? "Email verified" : "Email not verified"}
                  </div>
                </div>
              </div>
            </div>

            {/* Verification card */}
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Verification status
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Complete verification to unlock host/driver features.
                </p>
              </div>

              <div className="p-6 space-y-3 text-sm">
                {/* Email */}
                <div className="rounded-2xl border border-gray-200 p-4 flex items-start gap-3">
                  <div className="rounded-xl bg-teal-50 p-3 border border-teal-100">
                    <Mail className="text-teal-700" size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900">Email</p>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          user.isVerified
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {user.isVerified ? "Verified" : "Not verified"}
                      </span>
                    </div>
                    {!user.isVerified && (
                      <p className="text-xs text-gray-500 mt-1">
                        Please verify your email from inbox.
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="rounded-2xl border border-gray-200 p-4 flex items-start gap-3">
                  <div className="rounded-xl bg-teal-50 p-3 border border-teal-100">
                    <Phone className="text-teal-700" size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900">Phone</p>
                      {user.phoneVerified ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Verified
                        </span>
                      ) : (
                        <Link
                          to="/verify-phone"
                          className="text-xs font-semibold px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 hover:underline"
                        >
                          Not verified — Verify
                        </Link>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Required before booking and payouts.
                    </p>
                  </div>
                </div>

                {/* Identity */}
                <div className="rounded-2xl border border-gray-200 p-4 flex items-start gap-3">
                  <div className="rounded-xl bg-teal-50 p-3 border border-teal-100">
                    <IdCard className="text-teal-700" size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900">Identity</p>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          user.identityVerified
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {user.identityVerified ? "Verified" : "Not verified"}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-3">
                      {user.idDocumentUrl && (
                        <a
                          href={user.idDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-700 font-semibold hover:underline"
                        >
                          View ID
                        </a>
                      )}
                      {user.livePhotoUrl && (
                        <a
                          href={user.livePhotoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-700 font-semibold hover:underline"
                        >
                          View live selfie
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {user.livePhotoUrl && (
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2">
                      Live photo
                    </div>
                    <img
                      src={user.livePhotoUrl}
                      alt="live selfie"
                      className="w-28 h-28 rounded-2xl border object-cover bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Payout */}
          {isHostOrDriver && (
            <div className="lg:col-span-6 space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-teal-600/5 to-cyan-500/5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <CreditCard size={18} className="text-teal-700" />
                        Payout account details
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Add bank or wallet info to receive payouts.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${badge.cls}`}
                      >
                        <BadgeIcon size={14} />
                        {badge.text}
                      </span>

                      <button
                        onClick={fetchMe}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                        title="Refresh"
                      >
                        <RefreshCcw size={16} className="text-teal-700" />
                        Refresh
                      </button>

                      <button
                        onClick={() => setEditing((v) => !v)}
                        className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                      >
                        <Pencil size={16} />
                        {editing ? "Close" : "Edit"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {!editing ? (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-gray-200 p-5">
                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Wallet size={16} className="text-teal-700" />
                          Current payout method
                        </div>

                        <div className="mt-2 text-sm text-gray-700">
                          <span className="font-semibold">Method:</span>{" "}
                          {pd.method ||
                            (pd.walletType ? pd.walletType : pd.bankName) ||
                            "—"}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-200 p-5">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          {/* Bank fields */}
                          {pd.bankName && (
                            <div>
                              <dt className="text-gray-500">Bank</dt>
                              <dd className="font-semibold text-gray-900">
                                {pd.bankName}
                              </dd>
                            </div>
                          )}
                          {pd.branch && (
                            <div>
                              <dt className="text-gray-500">Branch</dt>
                              <dd className="font-semibold text-gray-900">
                                {pd.branch}
                              </dd>
                            </div>
                          )}
                          {pd.accountName && (
                            <div>
                              <dt className="text-gray-500">Account name</dt>
                              <dd className="font-semibold text-gray-900">
                                {pd.accountName}
                              </dd>
                            </div>
                          )}
                          {pd.accountNumber && (
                            <div>
                              <dt className="text-gray-500">Account number</dt>
                              <dd className="font-semibold text-gray-900">
                                {mask(pd.accountNumber)}
                              </dd>
                            </div>
                          )}
                          {pd.routingNumber && (
                            <div>
                              <dt className="text-gray-500">Routing</dt>
                              <dd className="font-semibold text-gray-900">
                                {mask(pd.routingNumber)}
                              </dd>
                            </div>
                          )}

                          {/* Wallet fields */}
                          {pd.walletType && (
                            <div>
                              <dt className="text-gray-500">Wallet</dt>
                              <dd className="font-semibold text-gray-900">
                                {pd.walletType}
                              </dd>
                            </div>
                          )}
                          {pd.walletName && (
                            <div>
                              <dt className="text-gray-500">Wallet name</dt>
                              <dd className="font-semibold text-gray-900">
                                {pd.walletName}
                              </dd>
                            </div>
                          )}
                          {pd.walletNumber && (
                            <div>
                              <dt className="text-gray-500">Wallet number</dt>
                              <dd className="font-semibold text-gray-900">
                                {mask(pd.walletNumber)}
                              </dd>
                            </div>
                          )}

                          {/* Empty fallback */}
                          {!pd.bankName &&
                            !pd.accountNumber &&
                            !pd.walletType &&
                            !pd.walletNumber && (
                              <div className="sm:col-span-2 text-gray-600">
                                No payout details added yet.
                              </div>
                            )}
                        </dl>

                        <div className="pt-4 text-xs text-gray-500 space-y-1">
                          {pd.submittedAt && (
                            <div>
                              Submitted:{" "}
                              {new Date(pd.submittedAt).toLocaleString()}
                            </div>
                          )}
                          {pd.reviewedAt && (
                            <div>
                              Reviewed:{" "}
                              {new Date(pd.reviewedAt).toLocaleString()}
                            </div>
                          )}
                          {pd.status === "rejected" && pd.reviewReason && (
                            <div className="text-rose-600 font-semibold">
                              Reason: {pd.reviewReason}
                            </div>
                          )}
                        </div>
                      </div>

                      {pd.status !== "approved" && (
                        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-900">
                          <div className="flex items-start gap-2">
                            <Info size={16} className="mt-0.5 text-teal-700" />
                            <div>
                              After you submit payout details, verification may
                              take some time. You can refresh here anytime.
                            </div>
                          </div>
                        </div>
                      )}
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
