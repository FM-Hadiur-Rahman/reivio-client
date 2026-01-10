// src/pages/AdminPromocodes.jsx
import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { toast } from "react-toastify";

const AdminPromocodes = () => {
  const [codes, setCodes] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [err, setErr] = useState("");

  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null); // row-level lock

  const [newCode, setNewCode] = useState({
    code: "",
    discount: "",
    type: "flat", // flat | percent
    for: "stay", // stay | ride | combined | all
    expiresAt: "", // yyyy-mm-dd
  });

  const fetchCodes = async () => {
    try {
      setLoadingList(true);
      setErr("");
      const res = await api.get("/api/admin/promocode");
      setCodes(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setErr("Failed to fetch promo codes.");
      setCodes([]);
      toast.error("❌ Failed to fetch promo codes");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const validate = () => {
    const { code, discount, type, for: scope } = newCode;
    if (!code || !discount || !type || !scope) {
      toast.error("Please fill all required fields.");
      return false;
    }
    if (!/^[A-Z0-9_-]{3,32}$/.test(code.toUpperCase())) {
      toast.error("Code must be 3–32 chars (A–Z, 0–9, _ or -).");
      return false;
    }
    const val = Number(discount);
    if (Number.isNaN(val) || val <= 0) {
      toast.error("Discount must be a positive number.");
      return false;
    }
    if (type === "percent" && (val <= 0 || val > 90)) {
      toast.error("Percent discount should be between 1 and 90.");
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    try {
      setCreating(true);

      // Normalize payload; make code uppercase; set expiresAt to end-of-day ISO if provided
      const payload = {
        ...newCode,
        code: newCode.code.toUpperCase().trim(),
        discount: Number(newCode.discount),
        expiresAt: newCode.expiresAt
          ? new Date(`${newCode.expiresAt}T23:59:59.999Z`).toISOString()
          : undefined,
      };

      await api.post("/api/admin/promocode", payload);
      toast.success("✅ Promo code created!");

      setNewCode({
        code: "",
        discount: "",
        type: "flat",
        for: "stay",
        expiresAt: "",
      });
      fetchCodes();
    } catch (e) {
      console.error(e);
      toast.error("❌ Failed to create promo code");
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      setBusyId(id);
      // optimistic toggle
      setCodes((prev) =>
        prev.map((c) => (c._id === id ? { ...c, active: false } : c))
      );
      await api.patch(`/api/admin/promocode/${id}/deactivate`);
      toast.info("🟡 Promo code deactivated");
    } catch (e) {
      console.error(e);
      toast.error("❌ Failed to deactivate promo code");
      // rollback
      setCodes((prev) =>
        prev.map((c) => (c._id === id ? { ...c, active: true } : c))
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this promo code?"))
      return;
    try {
      setBusyId(id);
      // optimistic remove
      const snapshot = codes;
      setCodes((prev) => prev.filter((c) => c._id !== id));

      await api.delete(`/api/admin/promocode/${id}`);
      toast.warn("🗑 Promo code deleted");
    } catch (e) {
      console.error(e);
      toast.error("❌ Failed to delete promo code");
      // reload to recover
      fetchCodes();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">🎁 Promo Code Management</h2>
        <button
          onClick={fetchCodes}
          disabled={loadingList}
          className="text-sm px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-60"
        >
          {loadingList ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Error */}
      {err && <p className="text-red-600 mb-3">{err}</p>}

      {/* Form */}
      <div className="bg-white border p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">➕ Create New Promo Code</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <input
            type="text"
            placeholder="Code"
            value={newCode.code}
            onChange={(e) =>
              setNewCode({ ...newCode, code: e.target.value.toUpperCase() })
            }
            className="border p-2 rounded w-full"
            maxLength={32}
          />
          <input
            type="number"
            placeholder="Discount"
            value={newCode.discount}
            onChange={(e) =>
              setNewCode({ ...newCode, discount: e.target.value })
            }
            className="border p-2 rounded w-full"
            min="1"
            step="1"
          />
          <select
            value={newCode.type}
            onChange={(e) => setNewCode({ ...newCode, type: e.target.value })}
            className="border p-2 rounded w-full"
          >
            <option value="flat">Flat (৳)</option>
            <option value="percent">Percent (%)</option>
          </select>
          <select
            value={newCode.for}
            onChange={(e) => setNewCode({ ...newCode, for: e.target.value })}
            className="border p-2 rounded w-full"
          >
            <option value="stay">Stay</option>
            <option value="ride">Ride</option>
            <option value="combined">Combined</option>
            <option value="all">All</option>
          </select>
          <input
            type="date"
            value={newCode.expiresAt}
            onChange={(e) =>
              setNewCode({ ...newCode, expiresAt: e.target.value })
            }
            className="border p-2 rounded w-full"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            {creating ? "Creating..." : "Create Promo Code"}
          </button>
        </div>
        {newCode.type === "percent" && (
          <p className="text-xs text-gray-500 mt-2">
            Tip: Percent discounts are typically capped (e.g., ≤ 90%).
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Discount</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">For</th>
              <th className="px-4 py-2">Expires</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingList ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : codes.length ? (
              codes.map((c) => (
                <tr key={c._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono">{c.code}</td>
                  <td className="px-4 py-2">
                    {c.type === "percent" ? `${c.discount}%` : `৳${c.discount}`}
                  </td>
                  <td className="px-4 py-2 capitalize">{c.type}</td>
                  <td className="px-4 py-2 capitalize">{c.for}</td>
                  <td className="px-4 py-2">
                    {c.expiresAt
                      ? new Date(c.expiresAt).toISOString().slice(0, 10)
                      : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {c.active ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : (
                      <span className="text-red-500 font-medium">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right space-x-3">
                    {c.active && (
                      <button
                        onClick={() => handleDeactivate(c._id)}
                        className="text-yellow-700 hover:underline disabled:opacity-60"
                        disabled={busyId === c._id}
                      >
                        {busyId === c._id ? "Deactivating…" : "Deactivate"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="text-red-600 hover:underline disabled:opacity-60"
                      disabled={busyId === c._id}
                    >
                      {busyId === c._id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 py-6">
                  No promo codes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPromocodes;
