// src/pages/AdminRoleRequests.jsx (Premium)
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Badge = ({ tone = "slate", children }) => {
  const cls =
    tone === "teal"
      ? "bg-teal-50 text-teal-700 ring-teal-200"
      : tone === "amber"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : tone === "red"
      ? "bg-red-50 text-red-700 ring-red-200"
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

const Stat = ({ label, value, tone = "default" }) => {
  const cls =
    tone === "teal"
      ? "border-teal-200 bg-teal-50 text-teal-900"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : tone === "red"
      ? "border-red-200 bg-red-50 text-red-900"
      : "border-slate-200 bg-white text-slate-900";
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${cls}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-extrabold">
        {Number(value || 0).toLocaleString()}
      </div>
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

const fmtTime = (iso) => {
  try {
    return iso ? new Date(iso).toLocaleString() : "—";
  } catch {
    return "—";
  }
};

export default function AdminRoleRequests() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // all | host | driver

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/role-requests");
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("❌ Failed to load role requests:", e);
      setErr(e?.response?.data?.message || "Failed to load role requests");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const normalized = useMemo(() => {
    return rows.map((u) => {
      const requestedRole = u.roleRequest?.role || "";
      const requestedAt = u.roleRequest?.requestedAt || null;
      const hay = `${u._id || ""} ${u.name || ""} ${
        u.email || ""
      } ${requestedRole}`.toLowerCase();
      return {
        ...u,
        _requestedRole: requestedRole,
        _requestedAt: requestedAt,
        _hay: hay,
      };
    });
  }, [rows]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return normalized.filter((u) => {
      if (roleFilter !== "all" && u._requestedRole !== roleFilter) return false;
      if (!qq) return true;
      return u._hay.includes(qq);
    });
  }, [normalized, q, roleFilter]);

  const counts = useMemo(() => {
    const total = rows.length;
    const hosts = rows.filter((u) => u.roleRequest?.role === "host").length;
    const drivers = rows.filter((u) => u.roleRequest?.role === "driver").length;
    return { total, hosts, drivers };
  }, [rows]);

  const handleAction = async (userId, status, role) => {
    if (busyId) return;

    let reason = "";
    if (status === "rejected") {
      reason = window.prompt("Reason for rejection?") || "";
      if (!reason.trim()) return;
    } else {
      const ok = window.confirm(
        `Approve ${String(role || "").toUpperCase()} request?`
      );
      if (!ok) return;
    }

    try {
      setBusyId(userId);
      await api.patch(`/api/admin/role-requests/${userId}`, { status, reason });
      toast.success(
        status === "approved" ? "✅ Role approved" : "✅ Role rejected"
      );
      await fetchRequests();
    } catch (e) {
      console.error("❌ Failed to update role request:", e);
      toast.error(
        e?.response?.data?.message || "Failed to update role request"
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Approvals
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              ✅ Role Requests
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Approve or reject first-time Host/Driver role requests.
            </p>
          </div>

          <button
            onClick={fetchRequests}
            disabled={loading}
            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh ↻"}
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <Stat label="Total pending" value={counts.total} tone="amber" />
          <Stat label="Host requests" value={counts.hosts} tone="teal" />
          <Stat label="Driver requests" value={counts.drivers} />
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3 md:p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600">
                Search
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, email, user id…"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              />
            </div>

            <div className="w-full md:w-52">
              <label className="text-xs font-semibold text-slate-600">
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              >
                <option value="all">All</option>
                <option value="host">Host</option>
                <option value="driver">Driver</option>
              </select>
            </div>

            <button
              onClick={() => {
                setQ("");
                setRoleFilter("all");
              }}
              className="md:mt-5 rounded-2xl px-4 py-2.5 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition"
            >
              Clear
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">{rows.length}</span>{" "}
            requests.
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
            Loading role requests…
          </div>
        )}

        {!loading && err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="font-semibold text-red-800">
              Couldn’t load role requests
            </div>
            <div className="text-sm text-red-700 mt-1">{err}</div>
            <button
              onClick={fetchRequests}
              className="mt-4 rounded-2xl px-4 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !err && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-slate-600">
            ✅ No pending role requests.
          </div>
        )}

        {/* Cards */}
        {!loading && !err && filtered.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((u) => {
              const requestedRole = u._requestedRole;
              const requestedAt = fmtTime(u._requestedAt);
              const isBusy = busyId === u._id;

              return (
                <Card
                  key={u._id}
                  title={u.name || "—"}
                  subtitle={u.email || "—"}
                  right={
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="slate">
                        Current: {(u.primaryRole || "user").toUpperCase()}
                      </Badge>
                      <Badge tone="teal">
                        Requested: {(requestedRole || "—").toUpperCase()}
                      </Badge>
                      <Badge tone="amber">
                        KYC: {(u.kyc?.status || "—").toUpperCase()}
                      </Badge>
                    </div>
                  }
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={u.avatar || "/default-avatar.png"}
                      alt="Avatar"
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-500">
                        Requested at:{" "}
                        <span className="font-semibold text-slate-700">
                          {requestedAt}
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-slate-500 break-all">
                        User ID:{" "}
                        <span className="font-semibold text-slate-700">
                          {u._id}
                        </span>
                      </div>

                      <div className="mt-3 flex gap-2 flex-wrap">
                        <Link
                          to={`/admin/users/${u._id}`}
                          className="rounded-2xl px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition"
                        >
                          View user →
                        </Link>

                        {requestedRole === "driver" && (
                          <Link
                            to="/admin/kyc"
                            className="rounded-2xl px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition"
                          >
                            Check KYC →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Driver quick preview */}
                  {requestedRole === "driver" && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
                      <div className="text-xs font-semibold text-slate-600 mb-2">
                        Driver info
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="rounded-xl border border-slate-200 bg-white p-2">
                          <div className="text-xs text-slate-500">License</div>
                          <div className="font-semibold text-slate-900">
                            {u.driver?.licenseNumber || "—"}
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-2">
                          <div className="text-xs text-slate-500">Vehicle</div>
                          <div className="font-semibold text-slate-900">
                            {u.driver?.vehicleType || "—"}
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-2">
                          <div className="text-xs text-slate-500">Seats</div>
                          <div className="font-semibold text-slate-900">
                            {u.driver?.seats ?? "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() =>
                        handleAction(u._id, "approved", requestedRole)
                      }
                      disabled={isBusy}
                      className="flex-1 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition disabled:opacity-60"
                    >
                      {isBusy ? "Working…" : "Approve"}
                    </button>
                    <button
                      onClick={() =>
                        handleAction(u._id, "rejected", requestedRole)
                      }
                      disabled={isBusy}
                      className="flex-1 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-60"
                    >
                      {isBusy ? "Working…" : "Reject"}
                    </button>
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    Approving grants role + marks <b>{requestedRole}</b>{" "}
                    approved in backend.
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-xs text-slate-500">
          Tip: If you want full audit trails, store admin reviewer ID and
          decision timestamps (you already do in roleRequest).
        </div>
      </div>
    </AdminLayout>
  );
}
