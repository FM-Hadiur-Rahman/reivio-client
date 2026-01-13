// src/pages/AdminPayouts.jsx (Premium)
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const bdt = new Intl.NumberFormat("bn-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const fmtTime = (iso) => {
  try {
    return iso ? new Date(iso).toLocaleString() : "—";
  } catch {
    return "—";
  }
};

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

const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={[
      "rounded-2xl px-4 py-2 text-sm font-semibold transition",
      active
        ? "bg-teal-600 text-white"
        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
    ].join(" ")}
  >
    {children}
  </button>
);

export default function AdminPayouts() {
  const [tab, setTab] = useState("host"); // host | driver
  const [hostPayouts, setHostPayouts] = useState([]);
  const [driverPayouts, setDriverPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const [q, setQ] = useState("");

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
      setErr(e?.response?.data?.message || "Failed to fetch payouts.");
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

  const rowsRaw = tab === "host" ? hostPayouts : driverPayouts;

  const rows = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rowsRaw;

    return rowsRaw.filter((p) => {
      const person = tab === "driver" ? p.driverId : p.hostId;
      const parent = tab === "driver" ? p.tripId : p.bookingId;
      const hay = `${p._id || ""} ${person?.name || ""} ${
        person?.email || ""
      } ${person?.phone || ""} ${parent?._id || ""} ${
        parent?.tran_id || ""
      }`.toLowerCase();
      return hay.includes(qq);
    });
  }, [rowsRaw, q, tab]);

  const total = useMemo(
    () =>
      rows.reduce(
        (sum, p) =>
          sum + Number(p.amount ?? p.hostPayout ?? p.driverPayout ?? 0),
        0
      ),
    [rows]
  );

  const counts = useMemo(() => {
    const hostTotal = hostPayouts.length;
    const driverTotal = driverPayouts.length;
    const hostSum = hostPayouts.reduce(
      (s, p) => s + Number(p.amount ?? p.hostPayout ?? 0),
      0
    );
    const driverSum = driverPayouts.reduce(
      (s, p) => s + Number(p.amount ?? p.driverPayout ?? 0),
      0
    );
    return { hostTotal, driverTotal, hostSum, driverSum };
  }, [hostPayouts, driverPayouts]);

  const markHostAsPaid = async (id) => {
    const ok = window.confirm("Mark this host payout as PAID?");
    if (!ok) return;

    try {
      setProcessingId(id);
      await api.put(`/api/admin/payouts/${id}/mark-paid`);
      setHostPayouts((prev) => prev.filter((p) => p._id !== id));
      toast.success("✅ Host payout marked as paid");
    } catch (e) {
      console.error("❌ Failed to update host payout:", e);
      toast.error(e?.response?.data?.message || "Failed to mark as paid.");
    } finally {
      setProcessingId(null);
    }
  };

  const markDriverAsPaid = async (id) => {
    const ok = window.confirm("Mark this driver payout as PAID?");
    if (!ok) return;

    try {
      setProcessingId(id);
      await api.put(`/api/admin/driver-payouts/${id}/mark-paid`);
      setDriverPayouts((prev) => prev.filter((p) => p._id !== id));
      toast.success("✅ Driver payout marked as paid");
    } catch (e) {
      console.error("❌ Failed to update driver payout:", e);
      toast.error(e?.response?.data?.message || "Failed to mark as paid.");
    } finally {
      setProcessingId(null);
    }
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
              💸 Payouts
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Review pending payouts for hosts and drivers and mark them paid
              after transfer.
            </p>
          </div>

          <button
            onClick={() => refresh(tab)}
            disabled={loading}
            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh ↻"}
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <Stat label="Host pending" value={counts.hostTotal} tone="teal" />
          <Stat label="Host total" value={bdt.format(counts.hostSum)} />
          <Stat
            label="Driver pending"
            value={counts.driverTotal}
            tone="amber"
          />
          <Stat label="Driver total" value={bdt.format(counts.driverSum)} />
        </div>

        {/* Tabs + Search */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3 md:p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex gap-2 flex-wrap">
              <TabBtn active={tab === "host"} onClick={() => setTab("host")}>
                🏠 Host payouts{" "}
                <span className="ml-2 text-xs opacity-80">
                  ({hostPayouts.length})
                </span>
              </TabBtn>
              <TabBtn
                active={tab === "driver"}
                onClick={() => setTab("driver")}
              >
                🚗 Driver payouts{" "}
                <span className="ml-2 text-xs opacity-80">
                  ({driverPayouts.length})
                </span>
              </TabBtn>
              <Link
                to="/admin/payouts/overdue"
                className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition"
              >
                ⏰ Overdue →
              </Link>
            </div>

            <div className="w-full md:max-w-sm">
              <label className="text-xs font-semibold text-slate-600">
                Search
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, email, booking/trip id…"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              />
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">{rows.length}</span>{" "}
            item(s) • Total{" "}
            <span className="font-semibold text-slate-700">
              {bdt.format(total)}
            </span>
          </div>
        </div>

        {/* States */}
        {err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm mb-4 text-red-700">
            {err}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
            Loading payouts…
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-slate-600">
            ✅ No pending payouts.
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                {tab === "host"
                  ? "Pending host payouts"
                  : "Pending driver payouts"}
              </div>
              <div className="text-xs text-slate-500">Sorted by newest</div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white text-slate-600">
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-3 text-left font-semibold">
                      {tab === "driver" ? "Driver" : "Host"}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      {tab === "driver" ? "Trip" : "Booking"}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Method
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {rows.map((p) => {
                    const isDriver = tab === "driver";
                    const person = p[isDriver ? "driverId" : "hostId"];
                    const parent = p[isDriver ? "tripId" : "bookingId"];

                    const amount = Number(
                      p.amount ??
                        (isDriver ? p.driverPayout : p.hostPayout) ??
                        0
                    );
                    const busy = processingId === p._id;

                    return (
                      <tr
                        key={p._id}
                        className="hover:bg-slate-50/70 transition"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {person?.name || "—"}
                          </div>
                          <div className="text-xs text-slate-500 break-all">
                            {person?._id || ""}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="text-slate-900 break-all">
                            {person?.email || "—"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {person?.phone || "—"}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-extrabold text-slate-900">
                            {bdt.format(amount)}
                          </div>
                          <div className="text-xs text-slate-500">
                            status: pending
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {parent?._id
                              ? String(parent._id).slice(0, 10) + "…"
                              : "—"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {fmtTime(parent?.createdAt)}
                          </div>
                          {parent?._id ? (
                            <Link
                              to={
                                isDriver
                                  ? `/admin/trips/${parent._id}`
                                  : `/admin/bookings/${parent._id}`
                              }
                              className="text-xs font-semibold text-teal-700 hover:underline"
                            >
                              View →
                            </Link>
                          ) : null}
                        </td>

                        <td className="px-4 py-3">
                          <Badge tone="slate">
                            {String(p.method || "manual").toUpperCase()}
                          </Badge>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() =>
                              isDriver
                                ? markDriverAsPaid(p._id)
                                : markHostAsPaid(p._id)
                            }
                            disabled={busy}
                            className="rounded-2xl px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition disabled:opacity-60"
                          >
                            {busy ? "Updating…" : "Mark as paid"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot className="bg-slate-50 border-t border-slate-100">
                  <tr>
                    <td
                      className="px-4 py-3 font-semibold text-slate-700"
                      colSpan={2}
                    >
                      Total
                    </td>
                    <td className="px-4 py-3 font-extrabold text-slate-900">
                      {bdt.format(total)}
                    </td>
                    <td className="px-4 py-3" colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
              Tip: Mark as paid only after transfer is completed. Consider
              storing payout reference IDs.
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
