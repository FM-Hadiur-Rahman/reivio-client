// src/pages/AdminUsers.jsx (Premium)
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { toast } from "react-toastify";

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

const fmtRoles = (u) => {
  const roles = Array.isArray(u.roles) ? u.roles : [];
  if (roles.length) return roles.join(", ");
  return u.role || u.primaryRole || "—";
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [busyId, setBusyId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | active | deleted
  const [role, setRole] = useState("all"); // all | user | host | driver | admin

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("❌ Failed to load users:", e);
      setErr(e?.response?.data?.message || "Failed to load users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const rows = useMemo(() => (Array.isArray(users) ? users : []), [users]);

  const counts = useMemo(() => {
    const total = rows.length;
    const deleted = rows.filter((u) => u.isDeleted).length;
    const active = total - deleted;

    const roleCounts = { user: 0, host: 0, driver: 0, admin: 0 };
    rows.forEach((u) => {
      const list = Array.isArray(u.roles)
        ? u.roles
        : [u.primaryRole].filter(Boolean);
      list.forEach((r) => {
        if (roleCounts[r] != null) roleCounts[r] += 1;
      });
    });

    return { total, active, deleted, ...roleCounts };
  }, [rows]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return rows
      .filter((u) => {
        if (status === "active" && u.isDeleted) return false;
        if (status === "deleted" && !u.isDeleted) return false;

        if (role !== "all") {
          const rolesArr = Array.isArray(u.roles) ? u.roles : [];
          const inRole =
            rolesArr.includes(role) ||
            u.primaryRole === role ||
            u.role === role;
          if (!inRole) return false;
        }

        if (!qq) return true;
        const hay = `${u._id || ""} ${u.name || ""} ${u.email || ""} ${
          u.phone || ""
        } ${fmtRoles(u)}`.toLowerCase();
        return hay.includes(qq);
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [rows, q, status, role]);

  const download = async (path, filename, mime) => {
    try {
      setExporting(true);
      const res = await api.get(path, { responseType: "blob" });
      const blob = new Blob([res.data], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Export complete");
    } catch (e) {
      console.error("Export failed", e);
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = () =>
    download("/api/admin/export/users", "users.csv", "text/csv;charset=utf-8");

  const handleExportExcel = () =>
    download(
      "/api/admin/export/users-xlsx",
      "users.xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

  const doSoftDelete = async (id) => {
    const ok = window.confirm("Soft delete this user?");
    if (!ok) return;
    try {
      setBusyId(id);
      await api.patch(`/api/admin/users/${id}/soft-delete`);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isDeleted: true } : u))
      );
      toast.success("User soft-deleted");
    } catch (e) {
      console.error("❌ Failed to delete user:", e);
      toast.error(e?.response?.data?.message || "Failed to delete user.");
    } finally {
      setBusyId(null);
    }
  };

  const doRestore = async (id) => {
    const ok = window.confirm("Restore this user?");
    if (!ok) return;
    try {
      setBusyId(id);
      await api.patch(`/api/admin/users/${id}/restore`);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isDeleted: false } : u))
      );
      toast.success("User restored");
    } catch (e) {
      console.error("❌ Failed to restore user:", e);
      toast.error(e?.response?.data?.message || "Failed to restore user.");
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
              Users
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              👤 Users
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Search, export, soft-delete and restore accounts safely.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={handleExportCSV}
              disabled={exporting || loading}
              className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition disabled:opacity-60"
            >
              ⬇ {exporting ? "Exporting…" : "Export CSV"}
            </button>
            <button
              onClick={handleExportExcel}
              disabled={exporting || loading}
              className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition disabled:opacity-60"
            >
              📊 {exporting ? "Exporting…" : "Export Excel"}
            </button>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
            >
              {loading ? "Refreshing…" : "Refresh ↻"}
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <Stat label="Total" value={counts.total} />
          <Stat label="Active" value={counts.active} tone="teal" />
          <Stat label="Deleted" value={counts.deleted} tone="red" />
          <Stat label="Admins" value={counts.admin} tone="amber" />
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
                placeholder="Search id, name, email, phone, role…"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              />
            </div>

            <div className="w-full md:w-52">
              <label className="text-xs font-semibold text-slate-600">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>

            <div className="w-full md:w-52">
              <label className="text-xs font-semibold text-slate-600">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              >
                <option value="all">All</option>
                <option value="user">User ({counts.user})</option>
                <option value="host">Host ({counts.host})</option>
                <option value="driver">Driver ({counts.driver})</option>
                <option value="admin">Admin ({counts.admin})</option>
              </select>
            </div>

            <button
              onClick={() => {
                setQ("");
                setStatus("all");
                setRole("all");
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
            users.
          </div>
        </div>

        {/* States */}
        {err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm mb-4 text-red-700">
            {err}
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
            Loading users…
          </div>
        )}

        {!loading && !err && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-slate-600">
            No users found.
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                User list
              </div>
              <div className="text-xs text-slate-500">Sorted by newest</div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white text-slate-600">
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-3 text-left font-semibold">User</th>
                    <th className="px-4 py-3 text-left font-semibold">Roles</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Verified
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((u) => {
                    const isRowBusy = busyId === u._id;
                    const roles = fmtRoles(u);

                    return (
                      <tr
                        key={u._id}
                        className={[
                          "hover:bg-slate-50/70 transition",
                          u.isDeleted ? "bg-red-50/40 text-slate-600" : "",
                        ].join(" ")}
                      >
                        <td className="px-4 py-3">
                          <div
                            className={
                              u.isDeleted
                                ? "line-through"
                                : "font-semibold text-slate-900"
                            }
                          >
                            {u.name || "—"}
                          </div>
                          <div className="text-xs text-slate-500 break-all">
                            {u.email || "—"}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="text-slate-900">{roles}</div>
                          <div className="text-xs text-slate-500 break-all">
                            {u._id}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {u.isVerified ? (
                            <Badge tone="teal">EMAIL VERIFIED</Badge>
                          ) : (
                            <Badge>NOT VERIFIED</Badge>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {u.isDeleted ? (
                            <Badge tone="red">DELETED</Badge>
                          ) : (
                            <Badge tone="green">ACTIVE</Badge>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/admin/users/${u._id}`}
                              className="rounded-2xl px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition"
                            >
                              View →
                            </Link>

                            {!u.isDeleted ? (
                              <button
                                onClick={() => doSoftDelete(u._id)}
                                disabled={isRowBusy}
                                className="rounded-2xl px-3 py-2 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                              >
                                {isRowBusy ? "Deleting…" : "Soft delete"}
                              </button>
                            ) : (
                              <button
                                onClick={() => doRestore(u._id)}
                                disabled={isRowBusy}
                                className="rounded-2xl px-3 py-2 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60"
                              >
                                {isRowBusy ? "Restoring…" : "Restore"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
              Tip: Use soft delete for moderation; restore if a user appeals
              successfully.
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
