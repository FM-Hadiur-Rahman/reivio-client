// src/pages/AdminUserBreakdown.jsx (Premium)
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";

const Stat = ({ label, value, tone = "default", sub }) => {
  const cls =
    tone === "teal"
      ? "border-teal-200 bg-teal-50 text-teal-900"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : tone === "purple"
      ? "border-purple-200 bg-purple-50 text-purple-900"
      : "border-slate-200 bg-white text-slate-900";

  const subCls =
    tone === "teal"
      ? "text-teal-700"
      : tone === "amber"
      ? "text-amber-700"
      : tone === "purple"
      ? "text-purple-700"
      : "text-slate-500";

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${cls}`}>
      <div className={`text-xs uppercase tracking-widest ${subCls}`}>
        {label}
      </div>
      <div className="mt-1 text-3xl font-extrabold">
        {Number(value || 0).toLocaleString()}
      </div>
      {sub ? <div className={`mt-2 text-xs ${subCls}`}>{sub}</div> : null}
    </div>
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

export default function AdminUserBreakdown() {
  const [stats, setStats] = useState({
    total: 0,
    guests: 0,
    hosts: 0,
    drivers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/user-breakdown");
      const d = res.data || {};
      setStats({
        total: Number(d.total ?? 0),
        guests: Number(d.guests ?? d.users ?? 0),
        hosts: Number(d.hosts ?? 0),
        drivers: Number(d.drivers ?? 0),
      });
    } catch (e) {
      console.error("❌ Failed to load user breakdown", e);
      setErr(e?.response?.data?.message || "Failed to load user breakdown.");
      setStats({ total: 0, guests: 0, hosts: 0, drivers: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const pct = (n) => {
    const t = Number(stats.total || 0);
    if (!t) return "—";
    return `${Math.round((Number(n || 0) / t) * 100)}%`;
  };

  const pieData = useMemo(() => {
    const d = [
      { name: "Guests", value: Number(stats.guests || 0) },
      { name: "Hosts", value: Number(stats.hosts || 0) },
      { name: "Drivers", value: Number(stats.drivers || 0) },
    ].filter((x) => x.value > 0);

    return d.length ? d : [{ name: "No users", value: 1 }];
  }, [stats]);

  // We won't set explicit colors (your preference in other tools doesn't apply here),
  // but recharts requires Cell fill. We'll keep a minimal neutral palette:
  const fills = ["#0ea5e9", "#10b981", "#a855f7", "#94a3b8"];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Users
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              👥 User Breakdown
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              See distribution of guests, hosts and drivers across the platform.
            </p>
          </div>

          <button
            onClick={fetchStats}
            disabled={loading}
            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh ↻"}
          </button>
        </div>

        {/* States */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
            Loading breakdown…
          </div>
        )}

        {!loading && err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="font-semibold text-red-800">
              Couldn’t load breakdown
            </div>
            <div className="text-sm text-red-700 mt-1">{err}</div>
            <button
              onClick={fetchStats}
              className="mt-4 rounded-2xl px-4 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !err && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
              <Stat
                label="Total users"
                value={stats.total}
                sub="All accounts"
              />
              <Stat
                label="Guests"
                value={stats.guests}
                tone="teal"
                sub={pct(stats.guests)}
              />
              <Stat
                label="Hosts"
                value={stats.hosts}
                tone="amber"
                sub={pct(stats.hosts)}
              />
              <Stat
                label="Drivers"
                value={stats.drivers}
                tone="purple"
                sub={pct(stats.drivers)}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Pie chart */}
              <Card
                title="Distribution"
                subtitle="Share of user types"
                right={
                  <span className="text-xs text-slate-500">
                    {stats.total ? "Live" : "—"}
                  </span>
                }
              >
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={55}
                        paddingAngle={2}
                      >
                        {pieData.map((_, idx) => (
                          <Cell
                            key={`cell-${idx}`}
                            fill={fills[idx % fills.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: fills[0] }}
                    />
                    Guests
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: fills[1] }}
                    />
                    Hosts
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: fills[2] }}
                    />
                    Drivers
                  </div>
                </div>
              </Card>

              {/* Insights */}
              <div className="lg:col-span-2 space-y-4">
                <Card
                  title="Insights"
                  subtitle="Quick takeaways for operations"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">
                        Largest group
                      </div>
                      <div className="mt-1 font-semibold text-slate-900">
                        {stats.guests >= stats.hosts &&
                        stats.guests >= stats.drivers
                          ? "Guests"
                          : stats.hosts >= stats.drivers
                          ? "Hosts"
                          : "Drivers"}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Focus onboarding and retention here.
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">Supply side</div>
                      <div className="mt-1 font-semibold text-slate-900">
                        {(
                          Number(stats.hosts || 0) + Number(stats.drivers || 0)
                        ).toLocaleString()}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Hosts + drivers combined.
                      </div>
                    </div>

                    <div className="md:col-span-2 rounded-2xl border border-teal-200 bg-teal-50 p-3">
                      <div className="text-xs text-teal-700">Suggestion</div>
                      <div className="mt-1 text-sm text-teal-900">
                        If hosts are low compared to guests, run a host referral
                        campaign and simplify KYC + role approval.
                      </div>
                    </div>
                  </div>
                </Card>

                {stats.total === 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-slate-600">
                    No users yet.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
