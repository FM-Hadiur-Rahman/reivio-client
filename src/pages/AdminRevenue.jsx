// src/pages/AdminRevenue.jsx
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const bdt = new Intl.NumberFormat("bn-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const AdminRevenue = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTax: 0,
    totalPlatformFee: 0,
    totalHostPayout: 0,
    topListings: [],
    topHosts: [],
    monthly: {},
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/revenue"); // token auto-attached
      setStats(res.data || {});
    } catch (e) {
      console.error("❌ Revenue fetch failed:", e);
      setErr("Failed to load revenue stats.");
      setStats({
        totalRevenue: 0,
        totalTax: 0,
        totalPlatformFee: 0,
        totalHostPayout: 0,
        topListings: [],
        topHosts: [],
        monthly: {},
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  // Normalize monthly data (supports array or keyed object), then sort by month key (YYYY-MM)
  const monthlyData = useMemo(() => {
    const m = stats?.monthly ?? [];
    let arr = Array.isArray(m)
      ? m.map((row) => ({
          month: String(row.month ?? row.label ?? ""),
          revenue: Number(row.revenue ?? row.total ?? 0),
        }))
      : Object.entries(m).map(([month, value]) => ({
          month: String(month),
          revenue: Number(value ?? 0),
        }));

    // Sort by YYYY-MM if possible; otherwise keep insertion order
    arr = arr.sort((a, b) =>
      a.month > b.month ? 1 : a.month < b.month ? -1 : 0
    );
    return arr;
  }, [stats]);

  const listings = Array.isArray(stats.topListings) ? stats.topListings : [];
  const hosts = Array.isArray(stats.topHosts) ? stats.topHosts : [];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">🧾 Revenue Analytics</h2>
        <button
          onClick={fetchRevenue}
          disabled={loading}
          className="text-sm px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-60"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {err && <p className="text-red-600 mb-4">{err}</p>}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={bdt.format(Number(stats.totalRevenue || 0))}
        />
        <StatCard
          title="Govt. Tax"
          value={bdt.format(Number(stats.totalTax || 0))}
        />
        <StatCard
          title="Platform Fee"
          value={bdt.format(Number(stats.totalPlatformFee || 0))}
        />
        <StatCard
          title="Host Payout"
          value={bdt.format(Number(stats.totalHostPayout || 0))}
        />
      </div>

      {/* Monthly Revenue Line Chart */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">📈 Monthly Revenue</h3>
        {loading ? (
          <p className="text-gray-500">Loading chart…</p>
        ) : monthlyData.length === 0 ? (
          <p className="text-gray-500">No monthly data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(v) =>
                  Number(v) >= 100000 ? `${Math.round(v / 1000)}k` : v
                }
              />
              <Tooltip
                formatter={(value) => bdt.format(Number(value))}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Line type="monotone" dataKey="revenue" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Listings and Hosts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TableCard title="🏆 Top Listings" data={listings} type="listing" />
        <TableCard title="💼 Top Hosts" data={hosts} type="host" />
      </div>
    </AdminLayout>
  );
};

// Reusable Stat Card
const StatCard = ({ title, value }) => (
  <div className="bg-white rounded shadow p-4 text-center">
    <h4 className="text-sm text-gray-500">{title}</h4>
    <p className="text-xl font-bold text-gray-800">{value}</p>
  </div>
);

// Reusable Table Card with safe guards
const TableCard = ({ title, data, type }) => (
  <div className="bg-white p-4 rounded shadow">
    <h4 className="text-lg font-semibold mb-4">{title}</h4>
    <ul className="space-y-2">
      {Array.isArray(data) && data.length > 0 ? (
        data.map((item) => {
          const label = type === "listing" ? item.title : item.name;
          const total = Number(item.total ?? item.revenue ?? 0);
          return (
            <li
              key={item.id || item._id}
              className="flex justify-between text-sm"
            >
              <span className="truncate">{label ?? "—"}</span>
              <span className="font-semibold">{bdt.format(total)}</span>
            </li>
          );
        })
      ) : (
        <li className="text-gray-500 text-sm">No data available</li>
      )}
    </ul>
  </div>
);

export default AdminRevenue;
