// Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Notifications from "./Notifications";
import MyRidesTab from "../components/MyRidesTab";
import ListingCard from "./ListingCard";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("dashboard");

  const [listings, setListings] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (!user) return;

    if (user.primaryRole === "host") {
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/listings/host/${user._id}`)
        .then((res) => setListings(res.data));

      axios
        .get(`${import.meta.env.VITE_API_URL}/api/bookings/host`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => {
          const future = res.data.filter(
            (b) => new Date(b.dateFrom) >= new Date()
          );
          setCheckIns(future);
        });

      axios
        .get(`${import.meta.env.VITE_API_URL}/api/chats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setChats(res.data));
    }

    if (user.primaryRole === "user" || user.primaryRole === "guest") {
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/bookings/my`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setBookings(res.data));
    }
  }, [user]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h2>
      <p className="mb-4">Email: {user?.email}</p>
      <Notifications />

      {/* 🔀 Tab Nav */}
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

      {/* === Rides Tab === */}
      {activeTab === "rides" && <MyRidesTab />}

      {/* === Main Dashboard === */}
      {activeTab === "dashboard" && (
        <>
          {/* 🎯 Shared Links */}
          <div className="flex gap-6 flex-wrap mb-6">
            <Link
              to="/profile"
              className="text-blue-600 hover:underline text-lg"
            >
              🙍 Edit Profile
            </Link>
            <Link
              to="/my-referrals"
              className="text-blue-600 hover:underline text-lg"
            >
              🎁 My Referrals
            </Link>
            {user.primaryRole === "host" && (
              <>
                <Link
                  to="/host/create"
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  ➕ Create New Listing
                </Link>
                <Link
                  to="/dashboard/chats"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  💬 Host Chats
                </Link>
              </>
            )}
          </div>

          {/* === Host Check-Ins & Listings === */}
          {user.primaryRole === "host" && (
            <>
              {/* 🗓 Upcoming Check-Ins */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">
                  🛎 Upcoming Check-Ins
                </h3>
                {checkIns.length === 0 ? (
                  <p className="text-gray-500">No upcoming check-ins.</p>
                ) : (
                  <ul className="space-y-2">
                    {checkIns.map((b) => (
                      <li
                        key={b._id}
                        className="border p-3 rounded bg-white shadow"
                      >
                        <div className="font-semibold">
                          {b.listingId?.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          🗓 {new Date(b.dateFrom).toLocaleDateString()} →{" "}
                          {new Date(b.dateTo).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          👤 Guest:{" "}
                          {typeof b.guestId === "object"
                            ? b.guestId.name || b.guestId._id
                            : b.guestId}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 🏡 Host Listings */}
              <div>
                <h3 className="text-xl font-semibold mb-2">🏡 Your Listings</h3>
                {listings.length === 0 ? (
                  <p className="text-gray-500">You have no listings yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {listings.map((listing) => (
                      <ListingCard key={listing._id} listing={listing} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* === Guest Bookings === */}
          {(user.primaryRole === "user" || user.primaryRole === "guest") && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-2">🧾 Your Bookings</h3>
              {bookings.length === 0 ? (
                <p className="text-gray-500">
                  You haven’t booked any stays yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {bookings.map((b) => (
                    <li
                      key={b._id}
                      className="border p-4 rounded bg-white shadow"
                    >
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
        </>
      )}
    </div>
  );
};

export default Dashboard;
