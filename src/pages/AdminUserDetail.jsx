// src/pages/AdminUserDetail.jsx (Premium)
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";
import { toast } from "react-toastify";

const fmtTime = (iso) => {
  try {
    return iso ? new Date(iso).toLocaleString() : "—";
  } catch {
    return "—";
  }
};

const Badge = ({ tone = "slate", children }) => {
  const cls =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "red"
      ? "bg-red-50 text-red-700 ring-red-200"
      : tone === "amber"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : tone === "teal"
      ? "bg-teal-50 text-teal-700 ring-teal-200"
      : "bg-slate-100 text-slate-700 ring-slate-200";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${cls}`}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-60" />
      {children}
    </span>
  );
};

const Card = ({ title, subtitle, right, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-start justify-between gap-3">
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {subtitle ? (
          <div className="text-xs text-slate-500">{subtitle}</div>
        ) : null}
      </div>
      {right}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const Stat = ({ label, value, tone = "default" }) => {
  const cls =
    tone === "teal"
      ? "border-teal-200 bg-teal-50 text-teal-900"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : tone === "red"
      ? "border-red-200 bg-red-50 text-red-900"
      : "border-slate-200 bg-white text-slate-900";
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${cls}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="mt-1 text-xl font-extrabold">{value}</div>
    </div>
  );
};

const CopyBtn = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(value || ""));
      setCopied(true);
      toast.info("Copied");
      setTimeout(() => setCopied(false), 900);
    } catch {}
  };
  return (
    <button
      onClick={onCopy}
      type="button"
      className="rounded-xl border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
      title="Copy"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const DocTile = ({ title, url }) => (
  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
    <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
      <div className="text-xs font-semibold text-slate-600">{title}</div>
    </div>
    {url ? (
      <a href={url} target="_blank" rel="noreferrer" className="block">
        <img
          src={url}
          alt={title}
          className="w-full h-40 object-cover hover:opacity-95 transition"
        />
      </a>
    ) : (
      <div className="h-40 grid place-items-center bg-slate-50 text-xs text-slate-500">
        Not uploaded
      </div>
    )}
  </div>
);

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchUser = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get(`/api/admin/users/${id}`);
      setUser(res.data || null);
    } catch (e) {
      console.error("❌ Failed to fetch user:", e);
      setErr(e?.response?.data?.message || "Failed to fetch user.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const rolesText = useMemo(() => {
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    if (roles.length) return roles.join(", ");
    return user?.role || user?.primaryRole || "—";
  }, [user]);

  const kycStatus = (user?.kyc?.status || user?.kycStatus || "").toLowerCase();
  const kycTone =
    kycStatus === "approved"
      ? "green"
      : kycStatus === "rejected"
      ? "red"
      : kycStatus === "pending"
      ? "amber"
      : "slate";

  const activeTone = user?.isDeleted ? "red" : "green";

  if (loading) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
          Loading user…
        </div>
      </AdminLayout>
    );
  }

  if (err || !user) {
    return (
      <AdminLayout>
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {err ? (
              <div className="text-red-700 font-semibold">{err}</div>
            ) : (
              <div className="text-slate-600">❌ User not found.</div>
            )}

            <Link
              to="/admin/users"
              className="inline-flex items-center mt-4 rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition"
            >
              ← Back to Users
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const pd = user.paymentDetails || {};
  const paymentStatus = (pd.status || "").toLowerCase();

  const paymentTone =
    paymentStatus === "approved"
      ? "green"
      : paymentStatus === "rejected"
      ? "red"
      : paymentStatus === "pending"
      ? "amber"
      : "slate";

  const roleReq = user.roleRequest || null;
  const roleReqTone =
    roleReq?.status === "approved"
      ? "green"
      : roleReq?.status === "rejected"
      ? "red"
      : roleReq?.status === "pending"
      ? "amber"
      : "slate";

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Users
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              👤 User Details
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone={activeTone}>
                {user.isDeleted ? "DELETED" : "ACTIVE"}
              </Badge>
              <Badge tone={kycTone}>
                KYC: {kycStatus ? kycStatus.toUpperCase() : "N/A"}
              </Badge>
              {user.identityVerified ? (
                <Badge tone="teal">ID VERIFIED</Badge>
              ) : (
                <Badge>ID NOT VERIFIED</Badge>
              )}
              {user.phoneVerified ? (
                <Badge tone="teal">PHONE VERIFIED</Badge>
              ) : (
                <Badge>PHONE NOT VERIFIED</Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 mt-2">
              View profile, verification status and uploaded documents.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUser}
              className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              Refresh ↻
            </button>
            <Link
              to="/admin/users"
              className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition"
            >
              ← Back
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <Stat label="Name" value={user.name || "—"} />
          <Stat
            label="Primary role"
            value={(user.primaryRole || "user").toUpperCase()}
            tone="teal"
          />
          <Stat label="Signup step" value={user.signupStep ?? "—"} />
          <Stat
            label="Referral code"
            value={user.referralCode || "—"}
            tone="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Identity */}
          <div className="lg:col-span-2 space-y-4">
            <Card
              title="Profile"
              subtitle="Core identity and account info"
              right={
                <span className="text-xs text-slate-500">
                  ID:{" "}
                  <span className="font-semibold text-slate-700">
                    {user._id}
                  </span>{" "}
                  <CopyBtn value={user._id} />
                </span>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Email</div>
                  <div className="mt-1 font-semibold text-slate-900 break-all">
                    {user.email || "—"} <CopyBtn value={user.email} />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Phone</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {user.phone || "—"}
                  </div>
                </div>

                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Roles</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {rolesText}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Created</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {fmtTime(user.createdAt)}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Updated</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {fmtTime(user.updatedAt)}
                  </div>
                </div>
              </div>

              {/* Role request */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-slate-500">Role Request</div>
                    {roleReq?.role ? (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge tone={roleReqTone}>
                          {(roleReq.status || "pending").toUpperCase()}
                        </Badge>
                        <span className="text-sm font-semibold text-slate-900">
                          Requested: {String(roleReq.role).toUpperCase()}
                        </span>
                        {roleReq.requestedAt ? (
                          <span className="text-xs text-slate-500">
                            at {fmtTime(roleReq.requestedAt)}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mt-1 text-sm text-slate-600">
                        No role request.
                      </div>
                    )}
                  </div>

                  <Link
                    to="/admin/role-requests"
                    className="rounded-2xl px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition"
                  >
                    Open Role Requests →
                  </Link>
                </div>

                {roleReq?.reason ? (
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
                    <div className="text-xs font-semibold text-slate-500 mb-1">
                      Reason
                    </div>
                    {roleReq.reason}
                  </div>
                ) : null}
              </div>
            </Card>

            {/* KYC docs */}
            <Card title="KYC Documents" subtitle="Click to open in a new tab">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DocTile title="ID Front" url={user.idDocumentUrl} />
                <DocTile title="ID Back" url={user.idBackUrl} />
                <div className="sm:col-span-2">
                  <DocTile title="Live Selfie" url={user.livePhotoUrl} />
                </div>
              </div>
            </Card>
          </div>

          {/* Side column */}
          <div className="space-y-4">
            <Card title="Verification" subtitle="KYC + checks">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">KYC status</span>
                  <Badge tone={kycTone}>
                    {kycStatus ? kycStatus.toUpperCase() : "N/A"}
                  </Badge>
                </div>

                {user.kyc?.reason ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
                    <div className="text-xs font-semibold text-slate-500 mb-1">
                      KYC reason
                    </div>
                    {user.kyc.reason}
                  </div>
                ) : null}

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">Identity verified</span>
                  <span className="font-semibold text-slate-900">
                    {user.identityVerified ? "✅" : "❌"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">Phone verified</span>
                  <span className="font-semibold text-slate-900">
                    {user.phoneVerified ? "✅" : "❌"}
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Payment account" subtitle="Payout details status">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">Status</span>
                  <Badge tone={paymentTone}>
                    {paymentStatus ? paymentStatus.toUpperCase() : "—"}
                  </Badge>
                </div>

                {pd.accountType ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs font-semibold text-slate-500 mb-1">
                      Details
                    </div>
                    <div className="text-sm text-slate-800">
                      <div>
                        <b>Type:</b> {pd.accountType}
                      </div>
                      {pd.bankName ? (
                        <div>
                          <b>Bank:</b> {pd.bankName}
                        </div>
                      ) : null}
                      {pd.accountName ? (
                        <div>
                          <b>Name:</b> {pd.accountName}
                        </div>
                      ) : null}
                      {pd.accountNumber ? (
                        <div>
                          <b>Number:</b> {pd.accountNumber}
                        </div>
                      ) : null}
                      {pd.routingNumber ? (
                        <div>
                          <b>Routing:</b> {pd.routingNumber}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">
                    No payment details.
                  </div>
                )}

                <Link
                  to="/admin/payment-accounts"
                  className="rounded-2xl px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition"
                >
                  Open Payment Accounts →
                </Link>
              </div>
            </Card>

            <Card title="Quick actions" subtitle="Navigate to admin pages">
              <div className="flex flex-col gap-2">
                <Link
                  to="/admin/bookings"
                  className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition"
                >
                  View bookings →
                </Link>
                <Link
                  to="/admin/kyc"
                  className="rounded-2xl px-4 py-2 text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 transition"
                >
                  KYC queue →
                </Link>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Tip: Add “impersonate user” later for debugging.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
