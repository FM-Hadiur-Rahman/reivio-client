import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api"; // ✅ central axios instance

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : "—");
const fmtMoney = (n) =>
  typeof n === "number"
    ? n.toLocaleString(undefined, {
        style: "currency",
        currency: "BDT",
        maximumFractionDigits: 0,
      })
    : "—";

const AdminBookingDetail = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/api/admin/bookings/${id}`);
        if (mounted) setBooking(res.data);
      } catch (e) {
        console.error("Failed to fetch booking", e);
        if (mounted)
          setErr(e?.response?.data?.message || "Failed to fetch booking");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <AdminLayout>Loading…</AdminLayout>;
  if (err)
    return (
      <AdminLayout>
        <div className="text-red-600">{err}</div>
      </AdminLayout>
    );
  if (!booking) return <AdminLayout>No booking found.</AdminLayout>;

  const guest = booking.guestId || {};
  const listing = booking.listingId || {};

  return (
    <AdminLayout>
      <h2 className="text-xl font-bold mb-4">📦 Booking Detail</h2>
      <div className="space-y-1">
        <p>
          <b>ID:</b> {booking._id}
        </p>
        <p>
          <b>Guest:</b> {guest.name || "—"}{" "}
          {guest.email ? `(${guest.email})` : ""}
        </p>
        <p>
          <b>Listing:</b> {listing.title || "—"}
        </p>
        <p>
          <b>Dates:</b> {fmtDate(booking.dateFrom)} → {fmtDate(booking.dateTo)}
        </p>
        <p>
          <b>Status:</b> {booking.paymentStatus || "—"}
        </p>
        <p>
          <b>Amount Paid:</b> {fmtMoney(booking.paidAmount)}
        </p>
        {booking.extraPayment?.dueAmount > 0 && (
          <p>
            <b>Extra Due:</b> {fmtMoney(booking.extraPayment.dueAmount)}
          </p>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBookingDetail;
