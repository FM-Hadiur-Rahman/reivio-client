import React, { useEffect, useMemo, useState } from "react";
import { api } from "../services/api"; // ✅ central axios

const bdt = new Intl.NumberFormat("bn-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const AdminOverduePayouts = () => {
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchOverdue = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/payouts/overdue"); // token auto-added
      setOverdue(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("❌ Failed to fetch overdue payouts:", e);
      setErr("Failed to fetch overdue payouts.");
      setOverdue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const totalOverdue = useMemo(
    () =>
      overdue.reduce(
        (sum, x) =>
          sum +
          Number(
            // pick your field; falls back to paidAmount like your snippet
            x.amount ?? x.hostPayout ?? x.paidAmount ?? 0
          ),
        0
      ),
    [overdue]
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold">⏰ Overdue Payouts</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 hidden md:inline">
            {overdue.length} item{overdue.length === 1 ? "" : "s"} •{" "}
            {bdt.format(totalOverdue)}
          </span>
          <button
            onClick={fetchOverdue}
            className="text-sm px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {loading && <p className="text-gray-500">Loading overdue payouts…</p>}
      {err && !loading && <p className="text-red-600">{err}</p>}

      {!loading && !err && (
        <>
          {overdue.length === 0 ? (
            <p className="text-gray-500 italic">✅ No overdue payouts!</p>
          ) : (
            <div className="overflow-x-auto bg-white rounded shadow">
              <table className="min-w-full divide-y divide-gray-200 text-sm md:text-base">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Booking ID</th>
                    <th className="px-4 py-2 text-left">Guest</th>
                    <th className="px-4 py-2 text-left">Listing</th>
                    <th className="px-4 py-2 text-left">Check-in</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {overdue.map((b) => {
                    const amt = b.amount ?? b.hostPayout ?? b.paidAmount ?? 0;
                    return (
                      <tr key={b._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-blue-700 break-all">
                          {b._id}
                        </td>
                        <td className="px-4 py-2">{b.guestId?.name || "—"}</td>
                        <td className="px-4 py-2">
                          {b.listingId?.title || "—"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {b.checkInAt
                            ? new Date(b.checkInAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-2 font-semibold text-green-700">
                          {bdt.format(Number(amt))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 font-semibold" colSpan={4}>
                      Total
                    </td>
                    <td className="px-4 py-2 font-bold text-green-800">
                      {bdt.format(totalOverdue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOverduePayouts;
