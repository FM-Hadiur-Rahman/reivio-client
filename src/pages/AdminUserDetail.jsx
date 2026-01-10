// src/pages/AdminUserDetail.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";

const AdminUserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchUser = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get(`/api/admin/users/${id}`); // token auto-attached
      setUser(res.data || null);
    } catch (e) {
      console.error("❌ Failed to fetch user:", e);
      setErr("Failed to fetch user.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading)
    return (
      <AdminLayout>
        <p className="text-gray-600">Loading…</p>
      </AdminLayout>
    );
  if (err || !user)
    return (
      <AdminLayout>
        {err ? (
          <p className="text-red-600">{err}</p>
        ) : (
          <p className="text-gray-500">❌ User not found.</p>
        )}
        <Link
          to="/admin/users"
          className="inline-block mt-4 text-blue-600 hover:underline"
        >
          ← Back to Users
        </Link>
      </AdminLayout>
    );

  const roles =
    Array.isArray(user.roles) && user.roles.length
      ? user.roles.join(", ")
      : user.role || user.primaryRole || "—";

  const kycStatus = (user.kyc?.status || user.kycStatus || "").toLowerCase();
  const kycBadge =
    kycStatus === "approved"
      ? "bg-green-100 text-green-800"
      : kycStatus === "rejected"
      ? "bg-red-100 text-red-800"
      : kycStatus === "pending"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-gray-100 text-gray-700";

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">User Details</h2>
        <button
          onClick={fetchUser}
          disabled={loading}
          className="text-sm px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-2 bg-white p-4 rounded shadow">
        <p>
          <strong>Name:</strong> {user.name || "—"}
        </p>
        <p>
          <strong>Email:</strong> {user.email || "—"}
        </p>
        <p>
          <strong>Roles:</strong> {roles}
        </p>
        <p>
          <strong>Phone:</strong> {user.phone || "—"}
        </p>
        <p>
          <strong>KYC:</strong>{" "}
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${kycBadge}`}
          >
            {kycStatus ? kycStatus.toUpperCase() : "N/A"}
          </span>
          {user.kyc?.rejectionReason && (
            <span className="ml-2 text-sm text-gray-600">
              ({user.kyc.rejectionReason})
            </span>
          )}
        </p>
        <p>
          <strong>ID Verified:</strong> {user.identityVerified ? "✅" : "❌"}
        </p>
        <p>
          <strong>Phone Verified:</strong> {user.phoneVerified ? "✅" : "❌"}
        </p>
        <p>
          <strong>Signup Step:</strong> {user.signupStep ?? "—"}
        </p>
        <p>
          <strong>Referral Code:</strong> {user.referralCode || "—"}
        </p>
        <p>
          <strong>Status:</strong> {user.isDeleted ? "🗑 Deleted" : "✅ Active"}
        </p>

        {/* Optional: Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-sm text-gray-600">
          <p>
            <strong>Created:</strong>{" "}
            {user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}
          </p>
          <p>
            <strong>Updated:</strong>{" "}
            {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "—"}
          </p>
        </div>

        {/* KYC Documents */}
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold">KYC Documents</h3>
          <div className="flex gap-4 flex-wrap">
            {user.idDocumentUrl && (
              <a
                href={user.idDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline"
              >
                🪪 ID Front
              </a>
            )}
            {user.idBackUrl && (
              <a
                href={user.idBackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline"
              >
                🔁 ID Back
              </a>
            )}
            {user.livePhotoUrl && (
              <a
                href={user.livePhotoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline"
              >
                🤳 Live Selfie
              </a>
            )}
            {!user.idDocumentUrl && !user.idBackUrl && !user.livePhotoUrl && (
              <span className="text-gray-500 text-sm">
                No documents uploaded.
              </span>
            )}
          </div>
        </div>
      </div>

      <Link
        to="/admin/users"
        className="inline-block mt-6 text-blue-600 hover:underline"
      >
        ← Back to Users
      </Link>
    </AdminLayout>
  );
};

export default AdminUserDetail;
