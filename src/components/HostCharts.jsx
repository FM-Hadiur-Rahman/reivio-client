import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, Star, AlertTriangle } from "lucide-react";

const HostCharts = () => {
  const [earnings, setEarnings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ✅ robust token read (supports both "token" and stored user JSON)
  const token = useMemo(() => {
    const direct = localStorage.getItem("token");
    if (direct) return direct;

    try {
      const u = JSON.parse(localStorage.getItem("user"));
      return u?.token || null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErr("");

      if (!token) {
        setErr("Missing auth token. Please login again.");
        setLoading(false);
        return;
      }

      try {
        const [earningsRes, reviewsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/stats/earnings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/stats/reviews`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const e = Array.isArray(earningsRes.data) ? earningsRes.data : [];
        const r = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];

        setEarnings(e);
        setReviews(r);
      } catch (e) {
        console.error("Error loading chart data:", e);
        setErr(e?.response?.data?.message || "Failed to load charts.");
        setEarnings([]);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const hasData = earnings.length > 0 || reviews.length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Earnings */}
      <ChartCard
        title="Monthly Earnings"
        subtitle="Revenue trend over time"
        icon={TrendingUp}
        loading={loading}
        error={err}
        empty={!loading && !err && earnings.length === 0}
      >
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={earnings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<PremiumTooltip />} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#0d9488" // teal-600
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Reviews */}
      <ChartCard
        title="Monthly Reviews"
        subtitle="Feedback volume"
        icon={Star}
        loading={loading}
        error={err}
        empty={!loading && !err && reviews.length === 0}
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={reviews}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<PremiumTooltip />} />
            <Bar dataKey="count" fill="#14b8a6" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Optional: global empty section message if both are empty */}
      {!loading && !err && !hasData && (
        <div className="md:col-span-2 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No chart data available yet.
        </div>
      )}
    </div>
  );
};

function ChartCard({
  title,
  subtitle,
  icon: Icon,
  loading,
  error,
  empty,
  children,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                <Icon className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {title}
                </h3>
                <p className="text-sm text-slate-500">{subtitle}</p>
              </div>
            </div>
          </div>

          <span className="text-xs font-bold px-2 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
            {loading ? "Loading" : "Live"}
          </span>
        </div>

        <div className="mt-4">
          {loading ? (
            <ChartSkeleton />
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 mt-0.5" />
              <div>
                <div className="font-extrabold">Could not load chart</div>
                <div className="text-sm opacity-90">{error}</div>
              </div>
            </div>
          ) : empty ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
              No data yet.
            </div>
          ) : (
            children
          )}
        </div>
      </div>

      {/* Premium teal footer accent */}
      <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-70" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-56 w-full rounded-2xl" />
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} />
  );
}

/**
 * Clean tooltip that matches your premium style.
 * Works for both line + bar charts.
 */
function PremiumTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur px-4 py-3 shadow-lg">
      <div className="text-sm font-extrabold text-slate-900">{label}</div>
      <div className="mt-1 space-y-1">
        {payload.map((p, idx) => (
          <div
            key={idx}
            className="text-sm text-slate-700 flex justify-between gap-6"
          >
            <span className="font-semibold">{p.name}</span>
            <span className="font-extrabold">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HostCharts;
