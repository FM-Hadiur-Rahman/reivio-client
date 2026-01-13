// pages/AdminPaymentAccounts.jsx (Premium)
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const CopyBtn = ({ value, label = "Copy" }) => {
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
      type="button"
      onClick={onCopy}
      className="inline-flex items-center rounded-xl border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
      title="Copy"
    >
      {copied ? "Copied" : label}
    </button>
  );
};

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

const Badge = ({ children, tone = "slate" }) => {
  const cls =
    tone === "teal"
      ? "bg-teal-50 text-teal-700 ring-teal-200"
      : tone === "amber"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : tone === "red"
      ? "bg-red-50 text-red-700 ring-red-200"
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

const fmtTime = (iso) => {
  try {
    return iso ? new Date(iso).toLocaleString() : "—";
  } catch {
    return "—";
  }
};

// IMPORTANT: Your backend schema uses paymentDetails.accountType/accountNumber/accountName/bankName/routingNumber
const buildDetails = (pd = {}) => {
  const type = pd.accountType || "—";
  const isBank = type === "bank";

  const parts = isBank
    ? [
        pd.bankName && `Bank: ${pd.bankName}`,
        pd.accountName && `Name: ${pd.accountName}`,
        pd.accountNumber && `Acc: ${pd.accountNumber}`,
        pd.routingNumber && `Routing: ${pd.routingNumber}`,
      ]
    : [
        pd.accountType && `Type: ${pd.accountType}`,
        pd.accountName && `Name: ${pd.accountName}`,
        pd.accountNumber && `Number: ${pd.accountNumber}`,
      ];

  return {
    type,
    isBank,
    text: parts.filter(Boolean).join(" • ") || "—",
  };
};

export default function AdminPaymentAccounts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState({}); // { [userId]: true }

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | bank | bkash | nagad | rocket

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const { data } = await api.get("/api/admin/payment-accounts/pending");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "Failed to load payment accounts");
      toast.error("Failed to load payment accounts");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const total = rows.length;
    const bank = rows.filter(
      (u) => u.paymentDetails?.accountType === "bank"
    ).length;
    const wallet = total - bank;
    return { total, bank, wallet };
  }, [rows]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return rows.filter((u) => {
      const pd = u.paymentDetails || {};
      const { text } = buildDetails(pd);

      if (typeFilter !== "all" && pd.accountType !== typeFilter) return false;

      if (!qq) return true;

      const hay = `${u.name || ""} ${u.email || ""} ${u.phone || ""} ${
        pd.accountType || ""
      } ${text}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [rows, q, typeFilter]);

  const verify = async (userId, status, userLabel) => {
    let reason = "";
    if (status === "rejected") {
      reason = window.prompt("Reason for rejection (optional):") || "";
    } else {
      const ok = window.confirm(
        `Approve payout account for ${userLabel || "this user"}?`
      );
      if (!ok) return;
    }

    try {
      setBusy((b) => ({ ...b, [userId]: true }));

      // optimistic remove
      const prev = rows;
      setRows((r) => r.filter((x) => x._id !== userId));

      await api.patch(`/api/admin/payment-accounts/${userId}/verify`, {
        status,
        reason,
      });

      toast.success(`Payout account ${status}`);
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Action failed");
      await load(); // rollback to real state
    } finally {
      setBusy((b) => {
        const { [userId]: _, ...rest } = b;
        return rest;
      });
    }
  };

  const onCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(String(text || ""));
      toast.info("Copied details");
    } catch {}
  };

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
              💳 Payment Accounts
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Review host/driver payout accounts. Approve only after verifying
              details.
            </p>
          </div>

          <button
            onClick={load}
            disabled={loading}
            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh ↻"}
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <Stat label="Pending accounts" value={counts.total} tone="amber" />
          <Stat label="Bank accounts" value={counts.bank} />
          <Stat label="Wallet accounts" value={counts.wallet} tone="teal" />
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
                placeholder="Search name, email, phone, account…"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              />
            </div>

            <div className="w-full md:w-56">
              <label className="text-xs font-semibold text-slate-600">
                Account type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              >
                <option value="all">All</option>
                <option value="bank">Bank</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="rocket">Rocket</option>
              </select>
            </div>

            <button
              onClick={() => {
                setQ("");
                setTypeFilter("all");
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
            pending accounts.
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
            Loading payment accounts…
          </div>
        )}

        {!loading && err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="font-semibold text-red-800">
              Couldn’t load accounts
            </div>
            <div className="text-sm text-red-700 mt-1">{err}</div>
            <button
              onClick={load}
              className="mt-4 rounded-2xl px-4 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !err && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              No pending accounts 🎉
            </div>
            <div className="text-sm text-slate-600 mt-1">
              Everything is verified, or adjust filters.
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && !err && filtered.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Pending accounts
              </div>
              <div className="text-xs text-slate-500">
                Tip: Click details to copy.
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white text-slate-600">
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-3 text-left font-semibold">User</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Details
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Added</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((u) => {
                    const pd = u.paymentDetails || {};
                    const { type, isBank, text } = buildDetails(pd);
                    const isBusy = !!busy[u._id];

                    return (
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

                        <td className="px-4 py-3">
                          <div className="text-slate-900 break-all">
                            {u.email || "—"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {u.phone || "—"}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <Badge tone={isBank ? "teal" : "amber"}>
                            {type === "bank"
                              ? "BANK"
                              : String(type || "—").toUpperCase()}
                          </Badge>
                        </td>

                        <td className="px-4 py-3">
                          {text === "—" ? (
                            <span className="text-slate-500">—</span>
                          ) : (
                            <button
                              onClick={() => onCopy(text)}
                              className="text-left underline decoration-dotted text-slate-900 hover:text-teal-700 transition"
                              title="Click to copy details"
                            >
                              <span className="line-clamp-2">{text}</span>
                            </button>
                          )}
                          <div className="mt-2 flex gap-2">
                            <CopyBtn value={text} label="Copy details" />
                            {pd.accountNumber ? (
                              <CopyBtn
                                value={pd.accountNumber}
                                label="Copy number"
                              />
                            ) : null}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                          {fmtTime(pd.addedAt || pd.submittedAt)}
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/admin/users/${u._id}`}
                              className="rounded-2xl px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition"
                              title="View user"
                            >
                              View
                            </Link>

                            <button
                              onClick={() => verify(u._id, "approved", u.name)}
                              disabled={isBusy}
                              className="rounded-2xl px-3 py-2 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60"
                              title="Approve payout account"
                            >
                              {isBusy ? "Saving…" : "Approve"}
                            </button>

                            <button
                              onClick={() => verify(u._id, "rejected", u.name)}
                              disabled={isBusy}
                              className="rounded-2xl px-3 py-2 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                              title="Reject payout account"
                            >
                              {isBusy ? "Saving…" : "Reject"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
              Tip: Approve only if the payout number/name matches the user’s
              verified identity.
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
