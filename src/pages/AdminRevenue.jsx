// src/pages/AdminRevenue.jsx (Premium)
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
import { Link } from "react-router-dom";

const bdt = new Intl.NumberFormat("bn-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const money = (v) => bdt.format(Number(v || 0));

const Stat = ({ label, value, sub, tone = "default" }) => {
  const cls =
    tone === "teal"
      ? "border-teal-200 bg-teal-50"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50"
      : "border-slate-200 bg-white";
  const txt =
    tone === "teal"
      ? "text-teal-900"
      : tone === "amber"
      ? "text-amber-900"
      : "text-slate-900";
  const subTxt =
    tone === "teal"
      ? "text-teal-700"
      : tone === "amber"
      ? "text-amber-700"
      : "text-slate-500";

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${cls}`}>
      <div className={`text-xs uppercase tracking-widest ${subTxt}`}>
        {label}
      </div>
      <div className={`mt-1 text-2xl font-extrabold ${txt}`}>{value}</div>
      {sub ? <div className={`mt-2 text-xs ${subTxt}`}>{sub}</div> : null}
    </div>
  );
};

const Badge = ({ tone = "slate", children }) => {
  const cls =
    tone === "teal"
      ? "bg-teal-50 text-teal-700 ring-teal-200"
      : tone === "amber"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-slate-100 text-slate-700 ring-slate-200";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${cls}`}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-60" />
      {children}
    </span>
  );
};

const Card = ({ title, subtitle, right, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-start justify-between gap-3">
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {subtitle ? (
          <div className="text-xs text-slate-500">{subtitle}</div>
        ) : null}
      </div>
      {right}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const niceTick = (v) => {
  const n = Number(v || 0);
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return `${n}`;
};

export default function AdminRevenue() {
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
      const res = await api.get("/api/admin/revenue");
      setStats(res.data || {});
    } catch (e) {
      console.error("❌ Revenue fetch failed:", e);
      setErr(e?.response?.data?.message || "Failed to load revenue stats.");
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

  // Normalize monthly data (object or array)
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

    arr = arr
      .filter((x) => x.month)
      .sort((a, b) => (a.month > b.month ? 1 : a.month < b.month ? -1 : 0));

    return arr;
  }, [stats]);

  const listings = Array.isArray(stats.topListings) ? stats.topListings : [];
  const hosts = Array.isArray(stats.topHosts) ? stats.topHosts : [];

  const lastMonth = monthlyData[monthlyData.length - 1]?.revenue ?? 0;
  const prevMonth = monthlyData[monthlyData.length - 2]?.revenue ?? 0;
  const mom =
    prevMonth > 0
      ? ((Number(lastMonth) - Number(prevMonth)) / Number(prevMonth)) * 100
      : null;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Finance
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              🧾 Revenue Analytics
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Track total revenue, tax, platform fee and host payouts over time.
            </p>
          </div>

          <button
            onClick={fetchRevenue}
            disabled={loading}
            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh ↻"}
          </button>
        </div>

        {/* Error */}
        {err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm mb-4 text-red-700">
            {err}
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
          <Stat
            label="Total revenue"
            value={money(stats.totalRevenue)}
            sub={
              mom == null ? "—" : `MoM: ${mom > 0 ? "+" : ""}${mom.toFixed(1)}%`
            }
            tone="teal"
          />
          <Stat
            label="Govt tax"
            value={money(stats.totalTax)}
            sub="Collected from paid bookings"
          />
          <Stat
            label="Platform fee"
            value={money(stats.totalPlatformFee)}
            sub="Your platform earnings"
          />
          <Stat
            label="Host payout"
            value={money(stats.totalHostPayout)}
            sub="Net after fee + tax"
            tone="amber"
          />
        </div>

        {/* Chart */}
        <Card
          title="📈 Monthly revenue"
          subtitle={
            monthlyData.length
              ? `Data points: ${monthlyData.length}`
              : "No data yet"
          }
          right={
            mom == null ? (
              <Badge tone="slate">MoM: —</Badge>
            ) : mom >= 0 ? (
              <Badge tone="teal">MoM: +{mom.toFixed(1)}%</Badge>
            ) : (
              <Badge tone="amber">MoM: {mom.toFixed(1)}%</Badge>
            )
          }
        >
          {loading ? (
            <div className="text-slate-600">Loading chart…</div>
          ) : monthlyData.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
              No monthly data available.
            </div>
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={niceTick} />
                  <Tooltip
                    formatter={(value) => money(value)}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Line type="monotone" dataKey="revenue" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <TableCard
            title="🏆 Top listings"
            subtitle="Highest grossing listings"
            rows={listings}
            kind="listing"
          />
          <TableCard
            title="💼 Top hosts"
            subtitle="Highest earning hosts (net)"
            rows={hosts}
            kind="host"
          />
        </div>

        <div className="mt-6 text-xs text-slate-500">
          Tip: You can add a date range filter later by letting the backend
          accept
          <code className="mx-1">from</code> and{" "}
          <code className="mx-1">to</code> query params.
        </div>
      </div>
    </AdminLayout>
  );
}

function TableCard({ title, subtitle, rows, kind }) {
  const list = Array.isArray(rows) ? rows : [];

  return (
    <Card
      title={title}
      subtitle={subtitle}
      right={
        <span className="text-xs text-slate-500">
          {list.length ? `${list.length} items` : "No data"}
        </span>
      }
    >
      {list.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
          No data available.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-600">
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-3 font-semibold">
                  {kind === "listing" ? "Listing" : "Host"}
                </th>
                <th className="text-right py-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((item) => {
                const label = kind === "listing" ? item.title : item.name;
                const total = Number(item.total ?? item.revenue ?? 0);
                const id = item.id || item._id;

                return (
                  <tr key={id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 pr-3">
                      <div className="font-semibold text-slate-900 truncate">
                        {label || "—"}
                      </div>
                      {id ? (
                        <div className="text-xs text-slate-500 break-all">
                          {id}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-2 text-right font-extrabold text-slate-900">
                      {money(total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Optional CTA links if you have these pages */}
      <div className="mt-3 flex items-center gap-2">
        {kind === "listing" ? (
          <Link
            to="/admin/listings"
            className="rounded-2xl px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition"
          >
            View all listings →
          </Link>
        ) : (
          <Link
            to="/admin/users"
            className="rounded-2xl px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition"
          >
            View all users →
          </Link>
        )}
      </div>
    </Card>
  );
}
