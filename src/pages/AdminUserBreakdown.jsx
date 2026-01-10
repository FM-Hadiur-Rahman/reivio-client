// src/pages/AdminUserBreakdown.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";

const AdminUserBreakdown = () => {
  const [stats, setStats] = useState({ total: 0, guests: 0, hosts: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/user-breakdown"); // token auto-added
      const d = res.data || {};
      setStats({
        total: Number(d.total ?? 0),
        guests: Number(d.guests ?? 0),
        hosts: Number(d.hosts ?? 0),
      });
    } catch (e) {
      console.error("❌ Failed to load user breakdown", e);
      setErr("Failed to load user breakdown.");
      setStats({ total: 0, guests: 0, hosts: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">👥 User Breakdown</h2>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="text-sm px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-60"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {err && <p className="text-red-600 mb-3">{err}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.total}
          color="text-blue-600"
        />
        <StatCard title="Guests" value={stats.guests} color="text-green-600" />
        <StatCard title="Hosts" value={stats.hosts} color="text-purple-600" />
      </div>

      {!loading && !err && stats.total === 0 && (
        <p className="text-gray-500 italic mt-6">No users yet.</p>
      )}
    </AdminLayout>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className="bg-white rounded shadow p-6 text-center">
    <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
    <p className={`text-3xl font-bold ${color}`}>
      {Number(value).toLocaleString()}
    </p>
  </div>
);

export default AdminUserBreakdown;
