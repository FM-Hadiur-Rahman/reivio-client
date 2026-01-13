// src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";
import { Link } from "react-router-dom";
import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";

const money = (n) => Number(n || 0).toLocaleString();

const StatCard = ({ label, value, icon, tone = "default", to, right }) => {
  const base =
    "rounded-2xl border p-4 shadow-sm transition hover:shadow-md hover:-translate-y-[1px]";
  const cls =
    tone === "teal"
      ? "border-teal-200 bg-teal-50"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50"
      : tone === "purple"
      ? "border-purple-200 bg-purple-50"
      : tone === "red"
      ? "border-red-200 bg-red-50"
      : "border-slate-200 bg-white";

  const content = (
    <div className={`${base} ${cls}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-widest text-slate-600">
            {label}
          </div>
          <div className="mt-1 text-3xl font-extrabold text-slate-900 truncate">
            {value}
          </div>
        </div>
        <div className="text-2xl shrink-0">{icon}</div>
      </div>

      {right ? <div className="mt-3">{right}</div> : null}

      {to ? (
        <div className="mt-3 text-xs font-semibold text-teal-700">
          View details →
        </div>
      ) : null}
    </div>
  );

  return to ? (
    <Link to={to} className="block">
      {content}
    </Link>
  ) : (
    content
  );
};

const MiniPill = ({ tone = "slate", children }) => {
  const cls =
    tone === "teal"
      ? "bg-teal-600 text-white"
      : tone === "amber"
      ? "bg-amber-600 text-white"
      : "bg-slate-900 text-white";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}
    >
      {children}
    </span>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    guests: 0,
    hosts: 0,
    drivers: 0,
    listings: 0,
    bookings: 0,
    revenue: 0,
  });

  const [approvals, setApprovals] = useState({
    kycPending: 0,
    rolePending: 0,
    payoutAccountsPending: 0,
  });

  const [spark, setSpark] = useState([]); // monthly revenue points

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);
      setErr("");

      // 1) main stats
      const s = await api.get("/api/admin/stats");
      const d = s.data || {};
      setStats({
        users: Number(d.users ?? 0),
        guests: Number(d.guests ?? d.users ?? 0),
        hosts: Number(d.hosts ?? 0),
        drivers: Number(d.drivers ?? d.driver ?? 0),
        listings: Number(d.listings ?? 0),
        bookings: Number(d.bookings ?? 0),
        revenue: Number(d.revenue ?? 0),
      });

      // 2) pending approvals (parallel)
      const [kycRes, roleRes, payRes] = await Promise.allSettled([
        api.get("/api/admin/kyc/pending"),
        api.get("/api/admin/role-requests"),
        api.get("/api/admin/payment-accounts/pending"),
      ]);

      const kycPending =
        kycRes.status === "fulfilled" && Array.isArray(kycRes.value.data)
          ? kycRes.value.data.length
          : 0;

      const rolePending =
        roleRes.status === "fulfilled" && Array.isArray(roleRes.value.data)
          ? roleRes.value.data.length
          : 0;

      const payoutAccountsPending =
        payRes.status === "fulfilled" && Array.isArray(payRes.value.data)
          ? payRes.value.data.length
          : 0;

      setApprovals({ kycPending, rolePending, payoutAccountsPending });

      // 3) sparkline data (monthly revenue)
      // Uses /api/admin/revenue which already contains monthly object.
      const revRes = await api.get("/api/admin/revenue");
      const monthly = revRes.data?.monthly ?? {};
      const arr = Object.entries(monthly)
        .map(([month, value]) => ({
          month,
          revenue: Number(value ?? 0),
        }))
        .sort((a, b) => (a.month > b.month ? 1 : -1));

      // keep last 10 points for sparkline
      setSpark(arr.slice(-10));
    } catch (e) {
      console.error("❌ Admin dashboard fetch failed:", e);
      setErr(e?.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const kpi = useMemo(() => {
    const supply = Number(stats.hosts || 0) + Number(stats.drivers || 0);
    const pendingAll =
      Number(approvals.kycPending || 0) +
      Number(approvals.rolePending || 0) +
      Number(approvals.payoutAccountsPending || 0);
    return { supply, pendingAll };
  }, [stats.hosts, stats.drivers, approvals]);

  const sparkDelta = useMemo(() => {
    if (spark.length < 2) return null;
    const last = spark[spark.length - 1].revenue;
    const prev = spark[spark.length - 2].revenue;
    if (!prev) return null;
    const pct = ((last - prev) / prev) * 100;
    return pct;
  }, [spark]);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Overview
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              📊 Admin Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Stats, approvals, and quick access for daily operations.
            </p>
          </div>

          <button
            onClick={fetchAll}
            disabled={loading}
            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh ↻"}
          </button>
        </div>

        {/* States */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
            Loading dashboard…
          </div>
        ) : err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="font-semibold text-red-800">
              Couldn’t load dashboard
            </div>
            <div className="text-sm text-red-700 mt-1">{err}</div>
            <button
              onClick={fetchAll}
              className="mt-4 rounded-2xl px-4 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Main cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <StatCard
                label="Total users"
                value={stats.users.toLocaleString()}
                icon="👥"
                to="/admin/users"
              />

              <StatCard
                label="Guests"
                value={stats.guests.toLocaleString()}
                icon="🧍"
                tone="teal"
              />

              <StatCard
                label="Hosts"
                value={stats.hosts.toLocaleString()}
                icon="👑"
                tone="amber"
                to="/admin/users"
              />

              <StatCard
                label="Drivers"
                value={stats.drivers.toLocaleString()}
                icon="🚗"
                tone="purple"
                to="/admin/users"
              />

              <StatCard
                label="Listings"
                value={stats.listings.toLocaleString()}
                icon="🏠"
                to="/admin/listings"
              />

              <StatCard
                label="Paid bookings"
                value={stats.bookings.toLocaleString()}
                icon="📅"
                to="/admin/bookings"
              />

              {/* Revenue + Sparkline */}
              <StatCard
                label="Revenue"
                value={`৳ ${money(stats.revenue)}`}
                icon="💸"
                tone="teal"
                to="/admin/revenue"
                right={
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-600">
                      Trend{" "}
                      {sparkDelta == null ? (
                        <MiniPill>—</MiniPill>
                      ) : sparkDelta >= 0 ? (
                        <MiniPill tone="teal">
                          +{sparkDelta.toFixed(1)}%
                        </MiniPill>
                      ) : (
                        <MiniPill tone="amber">
                          {sparkDelta.toFixed(1)}%
                        </MiniPill>
                      )}
                    </div>

                    <div className="h-10 w-28">
                      {spark.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={spark}>
                            <Tooltip
                              formatter={(v) => `৳ ${money(v)}`}
                              labelFormatter={(l) => `Month: ${l}`}
                            />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full grid place-items-center text-xs text-slate-400">
                          —
                        </div>
                      )}
                    </div>
                  </div>
                }
              />

              {/* Pending approvals */}
              <StatCard
                label="Pending approvals"
                value={kpi.pendingAll.toLocaleString()}
                icon="✅"
                tone={kpi.pendingAll > 0 ? "amber" : "default"}
                to="/admin/role-requests"
                right={
                  <div className="flex flex-wrap gap-2">
                    <Link to="/admin/kyc">
                      <MiniPill tone="amber">
                        KYC {approvals.kycPending}
                      </MiniPill>
                    </Link>
                    <Link to="/admin/role-requests">
                      <MiniPill tone="teal">
                        Roles {approvals.rolePending}
                      </MiniPill>
                    </Link>
                    <Link to="/admin/payment-accounts">
                      <MiniPill>
                        Payout {approvals.payoutAccountsPending}
                      </MiniPill>
                    </Link>
                  </div>
                }
              />
            </div>

            {/* Quick actions */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  ⚡ Quick approvals
                </div>
                <div className="text-xs text-slate-500">Clear queues fast</div>

                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    to="/admin/role-requests"
                    className="rounded-2xl px-4 py-2 text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 transition"
                  >
                    ✅ Role requests ({approvals.rolePending}) →
                  </Link>
                  <Link
                    to="/admin/kyc"
                    className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition"
                  >
                    🪪 KYC ({approvals.kycPending}) →
                  </Link>
                  <Link
                    to="/admin/payment-accounts"
                    className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition"
                  >
                    💳 Payment accounts ({approvals.payoutAccountsPending}) →
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  🔍 Admin search
                </div>
                <div className="text-xs text-slate-500">
                  Find user/booking/trip fast
                </div>

                <div className="mt-4">
                  <Link
                    to="/admin/search"
                    className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition w-full"
                  >
                    Open Search →
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  🧾 Finance
                </div>
                <div className="text-xs text-slate-500">
                  Payouts and refund operations
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    to="/admin/payouts"
                    className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition"
                  >
                    💸 Payouts →
                  </Link>
                  <Link
                    to="/admin/payouts/overdue"
                    className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition"
                  >
                    ⏰ Overdue payouts →
                  </Link>
                  <Link
                    to="/admin/refunds"
                    className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition"
                  >
                    💸 Refund requests →
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
