// src/pages/AdminReferrals.jsx (Premium)
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Stat = ({ label, value, tone = "default" }) => {
  const cls =
    tone === "teal"
      ? "border-teal-200 bg-teal-50 text-teal-900"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-slate-200 bg-white text-slate-900";
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${cls}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
    </div>
  );
};

const Badge = ({ tone = "slate", children }) => {
  const cls =
    tone === "teal"
      ? "bg-teal-50 text-teal-700 ring-teal-200"
      : tone === "amber"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : tone === "green"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
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

const CopyBtn = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(value || ""));
      setCopied(true);
      toast.info("Copied");
      setTimeout(() => setCopied(false), 900);
    } catch {
      toast.error("Copy failed");
    }
  };
  return (
    <button
      onClick={onCopy}
      type="button"
      className="rounded-xl border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const fmtDate = (iso) => {
  try {
    return iso ? new Date(iso).toLocaleDateString() : "—";
  } catch {
    return "—";
  }
};

export default function AdminReferrals() {
  const [referrers, setReferrers] = useState([]);
  const [referred, setReferred] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [tab, setTab] = useState("referrers"); // referrers | referred
  const [q, setQ] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/referrals");
      setReferrers(
        Array.isArray(res.data?.referrers) ? res.data.referrers : []
      );
      setReferred(Array.isArray(res.data?.referred) ? res.data.referred : []);
    } catch (e) {
      console.error("Failed to fetch referral data", e);
      setErr(e?.response?.data?.message || "Failed to fetch referral data.");
      setReferrers([]);
      setReferred([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalReferrers = referrers.length;
    const totalReferred = referred.length;
    const totalRewards = referrers.reduce(
      (s, r) => s + Number(r.referralRewards || 0),
      0
    );
    const topReward = referrers.reduce(
      (m, r) => Math.max(m, Number(r.referralRewards || 0)),
      0
    );
    return { totalReferrers, totalReferred, totalRewards, topReward };
  }, [referrers, referred]);

  const filteredReferrers = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return referrers;
    return referrers.filter((u) => {
      const hay = `${u.name || ""} ${u.email || ""} ${
        u.referralCode || ""
      }`.toLowerCase();
      return hay.includes(qq);
    });
  }, [referrers, q]);

  const filteredReferred = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return referred;
    return referred.filter((r) => {
      const hay = `${r.name || ""} ${r.email || ""} ${
        r.referredBy || ""
      }`.toLowerCase();
      return hay.includes(qq);
    });
  }, [referred, q]);

  const TopTab = ({ id, label, count }) => {
    const active = tab === id;
    return (
      <button
        onClick={() => setTab(id)}
        className={[
          "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition",
          active
            ? "bg-teal-600 text-white"
            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
        ].join(" ")}
      >
        {label}
        <span
          className={
            active ? "text-white/80 text-xs" : "text-slate-500 text-xs"
          }
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Growth
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              📢 Referral Analytics
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Track referrers, referred users, and reward performance.
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh ↻"}
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <Stat label="Referrers" value={stats.totalReferrers} />
          <Stat
            label="Referred users"
            value={stats.totalReferred}
            tone="teal"
          />
          <Stat label="Total rewards" value={stats.totalRewards} />
          <Stat label="Top reward" value={stats.topReward} tone="amber" />
        </div>

        {/* Filters + Tabs */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3 md:p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <TopTab
                id="referrers"
                label="🏅 Top Referrers"
                count={filteredReferrers.length}
              />
              <TopTab
                id="referred"
                label="👥 Referred Users"
                count={filteredReferred.length}
              />
            </div>

            <div className="w-full md:max-w-sm">
              <label className="text-xs font-semibold text-slate-600">
                Search
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={
                  tab === "referrers"
                    ? "Search name, email, code…"
                    : "Search name, email, ref code…"
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              />
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {tab === "referrers"
                ? filteredReferrers.length
                : filteredReferred.length}
            </span>{" "}
            result(s).
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
            Loading referral data…
          </div>
        )}

        {!loading && err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="font-semibold text-red-800">
              Couldn’t load referrals
            </div>
            <div className="text-sm text-red-700 mt-1">{err}</div>
            <button
              onClick={fetchData}
              className="mt-4 rounded-2xl px-4 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !err && (
          <>
            {/* Referrers table */}
            {tab === "referrers" && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    Top referrers
                  </div>
                  <div className="text-xs text-slate-500">
                    Tip: Click Copy to share codes.
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-white text-slate-600">
                      <tr className="border-b border-slate-100">
                        <th className="px-4 py-3 text-left font-semibold">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Referral code
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Rewards
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredReferrers.length ? (
                        filteredReferrers
                          .slice()
                          .sort(
                            (a, b) =>
                              Number(b.referralRewards || 0) -
                              Number(a.referralRewards || 0)
                          )
                          .map((u) => (
                            <tr
                              key={u._id}
                              className="hover:bg-slate-50/70 transition"
                            >
                              <td className="px-4 py-3">
                                <div className="font-semibold text-slate-900">
                                  {u.name || "—"}
                                </div>
                                <div className="text-xs text-slate-500 break-all">
                                  {u._id}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-700 break-all">
                                {u.email || "—"}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-semibold text-slate-900">
                                    {u.referralCode || "—"}
                                  </span>
                                  {u.referralCode ? (
                                    <CopyBtn value={u.referralCode} />
                                  ) : null}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge
                                  tone={
                                    Number(u.referralRewards || 0) > 0
                                      ? "green"
                                      : "slate"
                                  }
                                >
                                  {u.referralRewards ?? 0}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Link
                                  to={`/admin/users/${u._id}`}
                                  className="rounded-2xl px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition"
                                >
                                  View user →
                                </Link>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-10 text-center text-slate-500"
                          >
                            No referrer data found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Referred list */}
            {tab === "referred" && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    Referred users
                  </div>
                  <div className="text-xs text-slate-500">
                    Tip: Filter by referral code to audit campaigns.
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {filteredReferred.length ? (
                    filteredReferred
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt || 0) -
                          new Date(a.createdAt || 0)
                      )
                      .map((r) => (
                        <div
                          key={r._id}
                          className="p-4 hover:bg-slate-50/70 transition"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900">
                                {r.name || "—"}{" "}
                                <span className="text-slate-500 font-normal">
                                  {r.email ? `(${r.email})` : ""}
                                </span>
                              </div>
                              <div className="text-sm text-slate-600 mt-1">
                                Referred by:{" "}
                                <span className="font-mono font-semibold text-slate-800">
                                  {r.referredBy || "—"}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                Joined: {fmtDate(r.createdAt)}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {r.referredBy ? (
                                <CopyBtn value={r.referredBy} />
                              ) : null}
                              <Link
                                to={`/admin/users/${r._id}`}
                                className="rounded-2xl px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition"
                              >
                                View user →
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="p-8 text-slate-600">
                      No referred users found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-6 text-xs text-slate-500">
          Tip: Consider storing the referral landing URL and campaign source to
          measure performance.
        </div>
      </div>
    </AdminLayout>
  );
}
