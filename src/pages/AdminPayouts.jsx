// src/pages/AdminPayouts.jsx
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api"; // ✅ central axios client

const bdt = new Intl.NumberFormat("bn-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const AdminPayouts = () => {
  const [tab, setTab] = useState("host"); // 'host' | 'driver'
  const [hostPayouts, setHostPayouts] = useState([]);
  const [driverPayouts, setDriverPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [processingId, setProcessingId] = useState(null); // row-level lock

  const fetchHostPayouts = async () => {
    const res = await api.get("/api/admin/payouts/pending");
    setHostPayouts(Array.isArray(res.data) ? res.data : []);
  };

  const fetchDriverPayouts = async () => {
    const res = await api.get("/api/admin/driver-payouts/pending");
    setDriverPayouts(Array.isArray(res.data) ? res.data : []);
  };

  const refresh = async (which = tab) => {
    try {
      setLoading(true);
      setErr("");
      if (which === "host") await fetchHostPayouts();
      else await fetchDriverPayouts();
    } catch (e) {
      console.error("❌ Failed to fetch payouts:", e);
      setErr("Failed to fetch payouts.");
      if (which === "host") setHostPayouts([]);
      else setDriverPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const markHostAsPaid = async (id) => {
    if (!window.confirm("Mark this host payout as PAID?")) return;
    try {
      setProcessingId(id);
      await api.put(`/api/admin/payouts/${id}/mark-paid`);
      setHostPayouts((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      console.error("❌ Failed to update host payout:", e);
      alert("Failed to mark as paid.");
    } finally {
      setProcessingId(null);
    }
  };

  const markDriverAsPaid = async (id) => {
    if (!window.confirm("Mark this driver payout as PAID?")) return;
    try {
      setProcessingId(id);
      await api.put(`/api/admin/driver-payouts/${id}/mark-paid`);
      setDriverPayouts((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      console.error("❌ Failed to update driver payout:", e);
      alert("Failed to mark as paid.");
    } finally {
      setProcessingId(null);
    }
  };

  const rows = tab === "host" ? hostPayouts : driverPayouts;

  const total = useMemo(
    () =>
      rows.reduce(
        (sum, p) =>
          sum + Number(p.amount ?? p.hostPayout ?? p.driverPayout ?? 0),
        0
      ),
    [rows]
  );

  const renderTable = (data, isDriver = false) => (
    <div className="overflow-x-auto rounded shadow bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm md:text-base">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">
              {isDriver ? "Driver" : "Host"}
            </th>
            <th className="px-4 py-2 text-left">Contact</th>
            <th className="px-4 py-2 text-left">Amount</th>
            <th className="px-4 py-2 text-left">
              {isDriver ? "Trip Date" : "Booking Date"}
            </th>
            <th className="px-4 py-2 text-left">Method</th>
            <th className="px-4 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((p) => {
            const person = p[isDriver ? "driverId" : "hostId"];
            const parent = p[isDriver ? "tripId" : "bookingId"];
            const dateStr = parent?.createdAt
              ? new Date(parent.createdAt).toLocaleDateString()
              : "—";
            const amount = Number(
              p.amount ?? p.hostPayout ?? p.driverPayout ?? 0
            );

            const busy = processingId === p._id;

            return (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-semibold">
                  {person?.name || "N/A"}
                </td>
                <td className="px-4 py-2">
                  <div>{person?.email || "—"}</div>
                  <div className="text-gray-500 text-xs">
                    {person?.phone || "—"}
                  </div>
                </td>
                <td className="px-4 py-2 font-medium text-green-700">
                  {bdt.format(amount)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{dateStr}</td>
                <td className="px-4 py-2 capitalize">{p.method || "manual"}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() =>
                      isDriver ? markDriverAsPaid(p._id) : markHostAsPaid(p._id)
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs md:text-sm disabled:opacity-60"
                    disabled={busy}
                  >
                    {busy ? "Updating…" : "Mark as Paid"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50">
            <td className="px-4 py-2 font-semibold" colSpan={2}>
              Total
            </td>
            <td className="px-4 py-2 font-bold text-green-800">
              {bdt.format(total)}
            </td>
            <td className="px-4 py-2" colSpan={3} />
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("host")}
              className={`px-4 py-2 rounded ${
                tab === "host"
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              🏠 Host Payouts
            </button>
            <button
              onClick={() => setTab("driver")}
              className={`px-4 py-2 rounded ${
                tab === "driver"
                  ? "bg-blue-700 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              🚗 Driver Payouts
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden md:inline">
              {rows.length} item{rows.length === 1 ? "" : "s"} •{" "}
              {bdt.format(total)}
            </span>
            <button
              onClick={() => refresh(tab)}
              className="text-sm px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">
          {tab === "host"
            ? "💸 Pending Host Payouts"
            : "🚕 Pending Driver Payouts"}
        </h2>

        {err && <p className="text-red-600 mb-3">{err}</p>}
        {loading ? (
          <p className="text-gray-600 italic">Loading payouts…</p>
        ) : rows.length === 0 ? (
          <p className="text-gray-500 italic">✅ No pending payouts.</p>
        ) : (
          renderTable(rows, tab === "driver")
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPayouts;
