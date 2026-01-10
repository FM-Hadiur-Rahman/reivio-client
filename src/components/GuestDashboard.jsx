import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Notifications from "./Notifications";
import MyRidesTab from "./MyRidesTab";

const GuestDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!user) return;
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/bookings/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setBookings(res.data));
  }, [user]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h2>
      <p className="mb-4">Email: {user?.email}</p>
      <Notifications />

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded text-white ${
            activeTab === "dashboard" ? "bg-green-600" : "bg-gray-400"
          }`}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Dashboard
        </button>
        <button
          className={`px-4 py-2 rounded text-white ${
            activeTab === "rides" ? "bg-green-600" : "bg-gray-400"
          }`}
          onClick={() => setActiveTab("rides")}
        >
          🚘 My Rides
        </button>
      </div>

      {activeTab === "rides" && <MyRidesTab />}

      {activeTab === "dashboard" && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2">🧾 Your Bookings</h3>
          {bookings.length === 0 ? (
            <p className="text-gray-500">You haven’t booked any stays yet.</p>
          ) : (
            <ul className="space-y-3">
              {bookings.map((b) => (
                <li key={b._id} className="border p-4 rounded bg-white shadow">
                  <div className="font-semibold">{b.listingId?.title}</div>
                  <div className="text-sm text-gray-600">
                    🗓 {new Date(b.dateFrom).toLocaleDateString()} →{" "}
                    {new Date(b.dateTo).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    📍 {b.listingId?.location?.address}
                  </div>
                  {b.paymentStatus === "paid" && (
                    <a
                      href={`${import.meta.env.VITE_API_URL}/api/invoices/${
                        b._id
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-1"
                    >
                      📄 Download Invoice
                    </a>
                  )}
                  {new Date(b.dateTo) < new Date() && !b.reviewed && (
                    <Link
                      to={`/bookings/${b._id}/review`}
                      className="inline-flex items-center gap-1 text-sm text-green-600 hover:underline mt-1"
                    >
                      ✍️ Leave a Review
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default GuestDashboard;
