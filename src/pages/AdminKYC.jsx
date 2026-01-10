import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api"; // ✅ central axios instance

const AdminKYC = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchPending = async () => {
    try {
      const res = await api.get("/api/admin/kyc/pending");
      setPendingUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("❌ Failed to load pending KYC:", e);
      setErr(e?.response?.data?.message || "Failed to load pending KYC");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleKycAction = async (userId, action) => {
    const reason =
      action === "rejected" ? window.prompt("Reason for rejection?") : null;

    if (action === "approved") {
      const ok = window.confirm("Approve this KYC?");
      if (!ok) return;
    }
    if (action === "rejected" && !reason) {
      // require a reason for rejections
      return;
    }

    try {
      await api.patch(`/api/admin/kyc/${userId}`, { status: action, reason });
      await fetchPending();
    } catch (e) {
      console.error("❌ KYC action failed:", e);
      alert(e?.response?.data?.message || "Failed to update KYC status");
    }
  };

  if (loading) return <AdminLayout>Loading…</AdminLayout>;
  if (err)
    return (
      <AdminLayout>
        <div className="text-red-600">{err}</div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-4">🪪 Pending KYC Verifications</h2>

      {pendingUsers.length === 0 ? (
        <p className="text-gray-600">No pending verifications.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white p-4 rounded shadow border flex flex-col"
            >
              <h3 className="text-lg font-semibold mb-1">{user.name || "—"}</h3>
              <p className="text-sm text-gray-600">{user.email || "—"}</p>
              <p className="text-sm text-gray-500 mb-3">
                Role: {user.primaryRole || user.role || "—"}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-xs font-medium mb-1">ID (Front)</div>
                  {user.idDocumentUrl ? (
                    <img
                      src={user.idDocumentUrl}
                      alt="ID Front"
                      className="w-48 h-auto rounded shadow"
                    />
                  ) : (
                    <div className="w-48 h-32 grid place-items-center bg-gray-100 rounded text-xs text-gray-500">
                      No front uploaded
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-medium mb-1">ID (Back)</div>
                  {user.idBackUrl ? (
                    <img
                      src={user.idBackUrl}
                      alt="ID Back"
                      className="w-48 h-auto rounded shadow"
                    />
                  ) : (
                    <div className="w-48 h-32 grid place-items-center bg-gray-100 rounded text-xs text-gray-500">
                      No back uploaded
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  <div className="text-xs font-medium mb-1">Live Selfie</div>
                  {user.livePhotoUrl ? (
                    <img
                      src={user.livePhotoUrl}
                      alt="Selfie"
                      className="w-48 h-auto rounded shadow"
                    />
                  ) : (
                    <div className="w-48 h-32 grid place-items-center bg-gray-100 rounded text-xs text-gray-500">
                      No selfie uploaded
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => handleKycAction(user._id, "approved")}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleKycAction(user._id, "rejected")}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminKYC;
