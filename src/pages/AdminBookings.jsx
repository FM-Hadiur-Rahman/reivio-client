import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api"; // ✅ central axios instance

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/api/admin/bookings");
        if (mounted) setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("❌ Failed to fetch bookings", e);
        if (mounted)
          setErr(e?.response?.data?.message || "Failed to fetch bookings");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <AdminLayout>Loading…</AdminLayout>;
  if (err)
    return (
      <AdminLayout>
        <div className="text-red-600">{err}</div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-4">📅 All Bookings</h2>

      {bookings.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-gray-600">
          No bookings yet.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm md:text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2 whitespace-nowrap">Guest</th>
                <th className="text-left px-4 py-2 whitespace-nowrap">
                  Listing
                </th>
                <th className="text-left px-4 py-2 whitespace-nowrap">
                  Status
                </th>
                <th className="text-left px-4 py-2 whitespace-nowrap">
                  Check-in
                </th>
                <th className="text-left px-4 py-2 whitespace-nowrap">
                  Check-out
                </th>
                <th className="text-left px-4 py-2 whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {b.guestId?.name || "—"} <br />
                    <span className="text-xs text-gray-500">
                      {b.guestId?.email || ""}
                    </span>
                  </td>
                  <td className="px-4 py-2">{b.listingId?.title || "—"}</td>
                  <td className="px-4 py-2 capitalize">
                    {b.status || b.paymentStatus || "—"}
                  </td>
                  <td className="px-4 py-2">
                    {b.dateFrom
                      ? new Date(b.dateFrom).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {b.dateTo
                      ? new Date(b.dateTo).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      to={`/admin/bookings/${b._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBookings;
