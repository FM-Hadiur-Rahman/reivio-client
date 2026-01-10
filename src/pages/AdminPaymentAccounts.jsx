// pages/AdminPaymentAccounts.jsx
import { useEffect, useState } from "react";
import { api } from "../services/api"; // centralized axios instance with auth header
import { toast } from "react-toastify";
import AdminLayout from "../components/AdminLayout";

export default function AdminPaymentAccounts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({}); // { [userId]: true } to disable buttons per row

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/admin/payment-accounts/pending");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load payment accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const verify = async (userId, status) => {
    let reason;
    if (status === "rejected") {
      reason = window.prompt("Reason for rejection (optional):") || "";
    }
    try {
      setBusy((b) => ({ ...b, [userId]: true }));

      // optimistic UI: remove the row immediately
      const prev = rows;
      setRows((r) => r.filter((x) => x._id !== userId));

      await api.patch(`/api/admin/payment-accounts/${userId}/verify`, {
        status,
        reason,
      });

      toast.success(`Payout account ${status}`);
      // (optional) re-sync from server if you prefer:
      // await load();
    } catch (e) {
      console.error(e);
      toast.error("Action failed");
      // rollback
      await load();
    } finally {
      setBusy((b) => {
        const { [userId]: _, ...rest } = b;
        return rest;
      });
    }
  };

  const renderMethod = (pd, bank, wallet) =>
    pd?.method || (bank ? "Bank" : wallet ? "Wallet" : "—");

  const onCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.info("Copied details");
    } catch {
      // no-op
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">💳 Payment Accounts (Pending)</h2>
        <button
          onClick={load}
          className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-500">No pending accounts 🎉</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Bank / Wallet</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const pd = u.paymentDetails ?? {};

                const bank = [
                  pd.bankName && `Bank: ${pd.bankName}`,
                  pd.branch && `Branch: ${pd.branch}`,
                  pd.accountName && `Acc Name: ${pd.accountName}`,
                  pd.accountNumber && `Acc No: ${pd.accountNumber}`,
                  pd.routingNumber && `Routing: ${pd.routingNumber}`,
                ]
                  .filter(Boolean)
                  .join(" • ");

                const wallet = [
                  pd.walletType && `Wallet: ${pd.walletType}`,
                  pd.walletNumber && `Number: ${pd.walletNumber}`,
                  pd.walletName && `Name: ${pd.walletName}`,
                ]
                  .filter(Boolean)
                  .join(" • ");

                const methodLabel = renderMethod(pd, bank, wallet);
                const detailsText = bank || wallet || "—";
                const isBusy = !!busy[u._id];

                return (
                  <tr key={u._id} className="border-t">
                    <td className="px-4 py-3 font-medium">{u.name || "—"}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.phone || "—"}</td>
                    <td className="px-4 py-3">{methodLabel}</td>
                    <td className="px-4 py-3">
                      {detailsText === "—" ? (
                        "—"
                      ) : (
                        <button
                          onClick={() => onCopy(detailsText)}
                          className="underline decoration-dotted"
                          title="Click to copy"
                        >
                          {detailsText}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {pd.submittedAt
                        ? new Date(pd.submittedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap w-56">
                      <div className="flex gap-2">
                        <button
                          onClick={() => verify(u._id, "approved")}
                          disabled={isBusy}
                          className={`px-3 py-1 rounded border border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                          title="Approve payout account"
                        >
                          ✅ {isBusy ? "Saving…" : "Approve"}
                        </button>
                        <button
                          onClick={() => verify(u._id, "rejected")}
                          disabled={isBusy}
                          className={`px-3 py-1 rounded border border-rose-600 text-rose-700 bg-rose-50 hover:bg-rose-100
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                          title="Reject payout account"
                        >
                          ❌ {isBusy ? "Saving…" : "Reject"}
                        </button>
                      </div>
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
}
