import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../context/AuthContext"; // ✅

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    guests: 0,
    hosts: 0,
    listings: 0,
    bookings: 0,
    revenue: 0,
  });
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // const token = JSON.parse(localStorage.getItem("user"))?.token;

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("📊 Admin stats response:", res.data);
        setStats(res.data);
      } catch (err) {
        console.error("❌ Failed to load admin stats:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">📊 Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold">👥 Total Users</h2>
          <p className="text-3xl">{stats.users ?? 0}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold">🧍 Guests</h2>
          <p className="text-3xl">{stats.guests ?? 0}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold">👨‍💼 Hosts</h2>
          <p className="text-3xl">{stats.hosts ?? 0}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold">👨‍💼 Driver</h2>
          <p className="text-3xl">{stats.driver ?? 0}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold">🏠 Listings</h2>
          <p className="text-3xl">{stats.listings ?? 0}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold">📅 Bookings</h2>
          <p className="text-3xl">{stats.bookings ?? 0}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold">💸 Total Revenue</h2>
          <p className="text-3xl">৳ {stats.revenue?.toLocaleString() ?? 0}</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
