// src/pages/AdminRefundsPage.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";

const bdt = new Intl.NumberFormat("bn-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const AdminRefundsPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/refund-requests"); // token auto-attached
      setRefunds(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("❌ Failed to load refunds", e);
      setErr("Failed to load refunds.");
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const markAsRefunded = async (bookingId) => {
    if (!window.confirm("Mark this booking as refunded?")) return;
    try {
      setBusyId(bookingId);
      // optimistic remove
      const snapshot = refunds;
      setRefunds((prev) => prev.filter((b) => b._id !== bookingId));

      await api.patch(`/api/admin/mark-refunded/${bookingId}`);
      // success: keep optimistic state
    } catch (e) {
      console.error("❌ Refund marking failed", e);
      alert("Failed to mark as refunded.");
      // rollback
      await fetchRefunds();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">💸 Pending Refund Requests</h1>
          <button
            onClick={fetchRefunds}
            disabled={loading}
            className="text-sm px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {err && <p className="text-red-600 mb-3">{err}</p>}

        {loading ? (
          <p className="text-gray-600 italic">Loading refunds…</p>
        ) : refunds.length === 0 ? (
          <p className="text-gray-500 italic">✅ No refund requests found.</p>
        ) : (
          <div className="grid gap-4">
            {refunds.map((booking) => {
              const amount =
                Math.abs(
                  Number(
                    booking?.extraPayment?.amount ?? booking?.refundAmount ?? 0
                  )
                ) || 0;
              const status = (
                booking?.extraPayment?.status ||
                booking?.refundStatus ||
                "N/A"
              )
                .toString()
                .toLowerCase();

              return (
                <div
                  key={booking._id}
                  className="p-4 border rounded bg-white shadow-sm hover:shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p>
                        <strong>👤 Guest:</strong>{" "}
                        {booking.guestId?.name || "—"} (
                        {booking.guestId?.email || "—"})
                      </p>
                      <p>
                        <strong>🏡 Listing:</strong>{" "}
                        {booking.listingId?.title || "—"}
                      </p>
                      <p>
                        <strong>🧾 Booking ID:</strong>{" "}
                        <span className="font-mono">{booking._id}</span>
                      </p>
                      <p>
                        <strong>📅 Created:</strong>{" "}
                        {booking.createdAt
                          ? new Date(booking.createdAt).toLocaleString()
                          : "—"}
                      </p>
                      {booking.extraPayment?.reason && (
                        <p className="text-sm text-gray-600">
                          <strong>📝 Reason:</strong>{" "}
                          {booking.extraPayment.reason}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-700">
                        {bdt.format(amount)}
                      </p>
                      <p className="mt-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : status === "refunded"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {status.toUpperCase()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={() => markAsRefunded(booking._id)}
                      disabled={busyId === booking._id}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded disabled:opacity-60"
                    >
                      {busyId === booking._id
                        ? "Updating…"
                        : "✅ Mark as Refunded"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRefundsPage;
