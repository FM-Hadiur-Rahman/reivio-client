import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";

const bdt = new Intl.NumberFormat("bn-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const fmtDate = (d) => {
  try {
    return d ? new Date(d).toLocaleDateString() : "—";
  } catch {
    return "—";
  }
};

const daysBetween = (a, b = new Date()) => {
  if (!a) return null;
  const t1 = new Date(a).getTime();
  const t2 = new Date(b).getTime();
  if (Number.isNaN(t1) || Number.isNaN(t2)) return null;
  return Math.max(0, Math.floor((t2 - t1) / (1000 * 60 * 60 * 24)));
};

export default function AdminOverduePayouts() {
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [minAmount, setMinAmount] = useState("");

  const fetchOverdue = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/payouts/overdue");
      setOverdue(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("❌ Failed to fetch overdue payouts:", e);
      setErr(e?.response?.data?.message || "Failed to fetch overdue payouts.");
      setOverdue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const normalized = useMemo(() => {
    return overdue.map((b) => {
      const amt = Number(b.amount ?? b.hostPayout ?? b.paidAmount ?? 0);
      const days = daysBetween(b.checkInAt);
      const guestName = b.guestId?.name || "";
      const listingTitle = b.listingId?.title || "";
      const id = b._id || "";
      return {
        ...b,
        _amt: amt,
        _days: days,
        _guestName: guestName,
        _listingTitle: listingTitle,
        _idStr: id,
      };
    });
  }, [overdue]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const min = minAmount === "" ? null : Number(minAmount);

    return normalized.filter((b) => {
      const hay =
        `${b._idStr} ${b._guestName} ${b._listingTitle}`.toLowerCase();
      const okQ = !qq || hay.includes(qq);
      const okMin = min == null || (Number.isFinite(min) && b._amt >= min);
      return okQ && okMin;
    });
  }, [normalized, q, minAmount]);

  const totalOverdue = useMemo(
    () => filtered.reduce((sum, x) => sum + Number(x._amt || 0), 0),
    [filtered]
  );

  const maxDays = useMemo(() => {
    const vals = filtered
      .map((x) => x._days)
      .filter((x) => typeof x === "number");
    return vals.length ? Math.max(...vals) : 0;
  }, [filtered]);

  const highRiskCount = useMemo(
    () => filtered.filter((x) => (x._days ?? 0) >= 7).length,
    [filtered]
  );

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Payout Operations
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              ⏰ Overdue Payouts
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Bookings past the payout cutoff that haven’t been issued yet.
            </p>
          </div>

          <button
            onClick={fetchOverdue}
            disabled={loading}
            className={[
              "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition",
              "bg-slate-900 text-white hover:bg-slate-800",
              "disabled:opacity-60 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            {loading ? "Refreshing…" : "Refresh"}
            <span className="text-white/70">↻</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Overdue items</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">
              {loading ? "—" : filtered.length}
            </div>
            <div className="mt-2 inline-flex items-center gap-2 text-xs text-slate-600">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Needs review
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Total overdue value</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">
              {loading ? "—" : bdt.format(totalOverdue)}
            </div>
            <div className="mt-2 text-xs text-slate-600">
              Sum of booking payout amounts (based on your backend fields)
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">High risk (≥ 7 days)</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">
              {loading ? "—" : highRiskCount}
            </div>
            <div className="mt-2 text-xs text-slate-600">
              Escalate to finance if repeated.
            </div>
          </div>

          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 shadow-sm">
            <div className="text-xs text-teal-700">Max overdue age</div>
            <div className="mt-1 text-2xl font-extrabold text-teal-900">
              {loading ? "—" : `${maxDays}d`}
            </div>
            <div className="mt-2 text-xs text-teal-800/80">
              Based on check-in date.
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3 md:p-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600">
                Search
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search booking id, guest name, listing title…"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none
                           focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              />
            </div>

            <div className="w-full md:w-56">
              <label className="text-xs font-semibold text-slate-600">
                Min amount (BDT)
              </label>
              <input
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                inputMode="numeric"
                placeholder="e.g. 5000"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none
                           focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              />
            </div>

            <button
              onClick={() => {
                setQ("");
                setMinAmount("");
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
            <span className="font-semibold text-slate-700">
              {overdue.length}
            </span>{" "}
            overdue bookings.
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
            Loading overdue payouts…
          </div>
        )}

        {!loading && err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="font-semibold text-red-800">
              Something went wrong
            </div>
            <div className="text-sm text-red-700 mt-1">{err}</div>
            <button
              onClick={fetchOverdue}
              className="mt-4 rounded-2xl px-4 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !err && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              ✅ No overdue payouts found
            </div>
            <div className="text-sm text-slate-600 mt-1">
              Everything looks good. If you expect overdue items, check payout
              cutoff logic.
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && !err && filtered.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Overdue bookings
              </div>
              <div className="text-xs text-slate-500">
                Total:{" "}
                <span className="font-semibold text-slate-800">
                  {bdt.format(totalOverdue)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">
                      Booking
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Guest</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Listing
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Check-in
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Age</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((b) => {
                    const days = b._days ?? 0;
                    const risk = days >= 7 ? "high" : days >= 3 ? "med" : "low";

                    const badge =
                      risk === "high"
                        ? "bg-red-50 text-red-700 ring-red-200"
                        : risk === "med"
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : "bg-emerald-50 text-emerald-700 ring-emerald-200";

                    return (
                      <tr
                        key={b._id}
                        className="hover:bg-slate-50/70 transition"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {String(b._id).slice(0, 10)}…
                          </div>
                          <div className="text-xs text-slate-500 break-all">
                            {b._id}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {b.guestId?.name || "—"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {b.guestId?.email || ""}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {b.listingId?.title || "—"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {b.listingId?.location?.district ||
                              b.listingId?.location?.division ||
                              ""}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                          {fmtDate(b.checkInAt)}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={[
                              "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                              badge,
                            ].join(" ")}
                          >
                            <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                            {days} day{days === 1 ? "" : "s"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="font-extrabold text-slate-900">
                            {bdt.format(Number(b._amt))}
                          </div>
                          <div className="text-xs text-slate-500">
                            {b.paidAmount != null
                              ? "paidAmount"
                              : b.hostPayout != null
                              ? "hostPayout"
                              : "amount"}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot className="bg-slate-50">
                  <tr>
                    <td
                      className="px-4 py-3 font-semibold text-slate-700"
                      colSpan={5}
                    >
                      Total
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-slate-900">
                      {bdt.format(totalOverdue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
