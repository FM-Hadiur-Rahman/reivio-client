// src/pages/AdminPromocodes.jsx (Premium)
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
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
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
    </div>
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
    } catch {}
  };
  return (
    <button
      onClick={onCopy}
      type="button"
      className="inline-flex items-center rounded-xl border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
      title="Copy"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const isoDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "—");

export default function AdminPromocodes() {
  const [codes, setCodes] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [err, setErr] = useState("");

  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive

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
      setErr(e?.response?.data?.message || "Failed to fetch promo codes.");
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
    if (!/^[A-Z0-9_-]{3,32}$/.test(code.toUpperCase().trim())) {
      toast.error("Code must be 3–32 chars (A–Z, 0–9, _ or -).");
      return false;
    }
    const val = Number(discount);
    if (Number.isNaN(val) || val <= 0) {
      toast.error("Discount must be a positive number.");
      return false;
    }
    if (type === "percent" && (val < 1 || val > 90)) {
      toast.error("Percent discount should be between 1 and 90.");
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    try {
      setCreating(true);

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
      toast.error(
        e?.response?.data?.message || "❌ Failed to create promo code"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (id) => {
    const ok = window.confirm("Deactivate this promo code?");
    if (!ok) return;

    try {
      setBusyId(id);
      setCodes((prev) =>
        prev.map((c) => (c._id === id ? { ...c, active: false } : c))
      );
      await api.patch(`/api/admin/promocode/${id}/deactivate`);
      toast.info("🟡 Promo code deactivated");
    } catch (e) {
      console.error(e);
      toast.error(
        e?.response?.data?.message || "❌ Failed to deactivate promo code"
      );
      fetchCodes();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this promo code permanently?");
    if (!ok) return;

    try {
      setBusyId(id);
      setCodes((prev) => prev.filter((c) => c._id !== id));
      await api.delete(`/api/admin/promocode/${id}`);
      toast.warn("🗑 Promo code deleted");
    } catch (e) {
      console.error(e);
      toast.error(
        e?.response?.data?.message || "❌ Failed to delete promo code"
      );
      fetchCodes();
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => {
    const total = codes.length;
    const active = codes.filter((c) => c.active).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [codes]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return codes
      .filter((c) => {
        if (statusFilter === "active" && !c.active) return false;
        if (statusFilter === "inactive" && c.active) return false;
        if (!qq) return true;
        const hay = `${c.code || ""} ${c.type || ""} ${c.for || ""} ${
          c.discount || ""
        }`.toLowerCase();
        return hay.includes(qq);
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [codes, q, statusFilter]);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Marketing
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              🏷 Promocodes
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Create discount codes for stays, rides, or combined bookings.
              Deactivate when needed.
            </p>
          </div>

          <button
            onClick={fetchCodes}
            disabled={loadingList}
            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
          >
            {loadingList ? "Refreshing…" : "Refresh ↻"}
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <Stat label="Total codes" value={counts.total} />
          <Stat label="Active" value={counts.active} tone="teal" />
          <Stat label="Inactive" value={counts.inactive} tone="amber" />
        </div>

        {/* Error */}
        {err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm mb-4 text-red-700">
            {err}
          </div>
        )}

        {/* Create + List */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Create form */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="text-sm font-semibold text-slate-900">
              ➕ Create promo code
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Codes are uppercase. Percent discounts should be capped.
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Code
                </label>
                <input
                  type="text"
                  value={newCode.code}
                  onChange={(e) =>
                    setNewCode({
                      ...newCode,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900
                             outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                  placeholder="WELCOME10"
                  maxLength={32}
                />
                <div className="mt-2 flex items-center gap-2">
                  <CopyBtn value={newCode.code.toUpperCase().trim()} />
                  <span className="text-xs text-slate-500">
                    Copy typed code
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Discount
                  </label>
                  <input
                    type="number"
                    value={newCode.discount}
                    onChange={(e) =>
                      setNewCode({ ...newCode, discount: e.target.value })
                    }
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900
                               outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                    min="1"
                    step="1"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Type
                  </label>
                  <select
                    value={newCode.type}
                    onChange={(e) =>
                      setNewCode({ ...newCode, type: e.target.value })
                    }
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900
                               outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                  >
                    <option value="flat">Flat (৳)</option>
                    <option value="percent">Percent (%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Scope
                  </label>
                  <select
                    value={newCode.for}
                    onChange={(e) =>
                      setNewCode({ ...newCode, for: e.target.value })
                    }
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900
                               outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                  >
                    <option value="stay">Stay</option>
                    <option value="ride">Ride</option>
                    <option value="combined">Combined</option>
                    <option value="all">All</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Expires
                  </label>
                  <input
                    type="date"
                    value={newCode.expiresAt}
                    onChange={(e) =>
                      setNewCode({ ...newCode, expiresAt: e.target.value })
                    }
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900
                               outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                  />
                </div>
              </div>

              {newCode.type === "percent" ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  Tip: Percent discounts are typically capped (e.g., ≤ 90%).
                </div>
              ) : null}

              <button
                onClick={handleCreate}
                disabled={creating}
                className="w-full rounded-2xl px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition disabled:opacity-60"
              >
                {creating ? "Creating…" : "Create promo code"}
              </button>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Promo codes
                </div>
                <div className="text-xs text-slate-500">
                  Showing {filtered.length} of {codes.length}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search code…"
                  className="w-full md:w-64 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm
                             outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-44 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm
                             outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white text-slate-600">
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-3 text-left font-semibold">Code</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Discount
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Scope</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Expires
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
                  {loadingList ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-slate-600">
                        Loading…
                      </td>
                    </tr>
                  ) : filtered.length ? (
                    filtered.map((c) => {
                      const isBusy = busyId === c._id;
                      const discountLabel =
                        c.type === "percent"
                          ? `${c.discount}%`
                          : `৳${c.discount}`;

                      return (
                        <tr
                          key={c._id}
                          className="hover:bg-slate-50/70 transition"
                        >
                          <td className="px-4 py-3">
                            <div className="font-mono font-semibold text-slate-900">
                              {c.code}
                            </div>
                            <div className="mt-1 flex gap-2">
                              <CopyBtn value={c.code} />
                              <span className="text-xs text-slate-500">
                                Copy
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">
                              {discountLabel}
                            </div>
                            <div className="text-xs text-slate-500 capitalize">
                              {c.type}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <Badge tone={c.for === "all" ? "teal" : "slate"}>
                              {String(c.for || "—").toUpperCase()}
                            </Badge>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                            {c.expiresAt ? isoDate(c.expiresAt) : "—"}
                          </td>

                          <td className="px-4 py-3">
                            {c.active ? (
                              <Badge tone="green">ACTIVE</Badge>
                            ) : (
                              <Badge tone="red">INACTIVE</Badge>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-2">
                              {c.active ? (
                                <button
                                  onClick={() => handleDeactivate(c._id)}
                                  disabled={isBusy}
                                  className="rounded-2xl px-3 py-2 text-xs font-semibold border border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100 transition disabled:opacity-60"
                                >
                                  {isBusy ? "…" : "Deactivate"}
                                </button>
                              ) : (
                                <span className="text-xs text-slate-500">
                                  —
                                </span>
                              )}

                              <button
                                onClick={() => handleDelete(c._id)}
                                disabled={isBusy}
                                className="rounded-2xl px-3 py-2 text-xs font-semibold border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition disabled:opacity-60"
                              >
                                {isBusy ? "…" : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        No promo codes found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
              Tip: Deactivate codes instead of deleting if you want audit
              history.
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
