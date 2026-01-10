// src/pages/AdminUsers.jsx
import React, { useEffect, useState, useMemo } from "react";
import AdminLayout from "../components/AdminLayout";
import { Link } from "react-router-dom";
import { api } from "../services/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/users"); // token auto-attached
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("❌ Failed to load users:", e);
      setErr("Failed to load users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const doSoftDelete = async (id) => {
    if (!confirm("Are you sure you want to soft delete this user?")) return;
    try {
      setBusyId(id);
      await api.patch(`/api/admin/users/${id}/soft-delete`);
      // optimistic update
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isDeleted: true } : u))
      );
    } catch (e) {
      console.error("❌ Failed to delete user:", e);
      alert("Failed to delete user.");
    } finally {
      setBusyId(null);
    }
  };

  const doRestore = async (id) => {
    try {
      setBusyId(id);
      await api.patch(`/api/admin/users/${id}/restore`);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isDeleted: false } : u))
      );
    } catch (e) {
      console.error("❌ Failed to restore user:", e);
      alert("Failed to restore user.");
    } finally {
      setBusyId(null);
    }
  };

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
    } catch (e) {
      console.error("Export failed", e);
      alert("Export failed. Please try again.");
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

  const rows = useMemo(() => (Array.isArray(users) ? users : []), [users]);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">All Users</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={exporting || loading}
            className="px-3 py-1.5 border rounded text-sm hover:bg-gray-100 disabled:opacity-60"
          >
            ⬇ {exporting ? "Exporting…" : "Export CSV"}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting || loading}
            className="px-3 py-1.5 border rounded text-sm hover:bg-gray-100 disabled:opacity-60"
          >
            📊 {exporting ? "Exporting…" : "Export Excel"}
          </button>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {err && <p className="text-red-600 mb-3">{err}</p>}

      {loading ? (
        <p>Loading users…</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Roles</th>
                <th className="px-3 py-2">Verified</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const roles =
                  Array.isArray(u.roles) && u.roles.length
                    ? u.roles.join(", ")
                    : u.role || u.primaryRole || "—";
                return (
                  <tr
                    key={u._id}
                    className={`border-t ${
                      u.isDeleted ? "bg-red-50 text-gray-500" : ""
                    }`}
                  >
                    <td
                      className={`px-3 py-2 ${
                        u.isDeleted ? "line-through" : ""
                      }`}
                    >
                      {u.name || "—"}
                    </td>
                    <td className="px-3 py-2">{u.email || "—"}</td>
                    <td className="px-3 py-2">{roles}</td>
                    <td className="px-3 py-2">{u.isVerified ? "✅" : "❌"}</td>
                    <td className="px-3 py-2">
                      {u.isDeleted ? (
                        <span className="text-red-700 font-medium">
                          Deleted
                        </span>
                      ) : (
                        <span className="text-green-700 font-medium">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 space-x-3 whitespace-nowrap">
                      <Link
                        to={`/admin/users/${u._id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                      {!u.isDeleted ? (
                        <button
                          onClick={() => doSoftDelete(u._id)}
                          className="text-red-600 hover:underline disabled:opacity-60"
                          disabled={busyId === u._id}
                        >
                          {busyId === u._id ? "Deleting…" : "Soft Delete"}
                        </button>
                      ) : (
                        <button
                          onClick={() => doRestore(u._id)}
                          className="text-green-700 hover:underline disabled:opacity-60"
                          disabled={busyId === u._id}
                        >
                          {busyId === u._id ? "Restoring…" : "Restore"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
