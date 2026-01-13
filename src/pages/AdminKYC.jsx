import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";
import { toast } from "react-toastify";

const DocTile = ({ title, url }) => (
  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
    <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
      <div className="text-xs font-semibold text-slate-600">{title}</div>
    </div>
    {url ? (
      <a href={url} target="_blank" rel="noreferrer" className="block">
        <img
          src={url}
          alt={title}
          className="w-full h-36 object-cover hover:opacity-95 transition"
        />
      </a>
    ) : (
      <div className="h-36 grid place-items-center bg-slate-50 text-xs text-slate-500">
        Not uploaded
      </div>
    )}
  </div>
);

const StatCard = ({ label, value, tone = "default" }) => {
  const styles =
    tone === "teal"
      ? "border-teal-200 bg-teal-50 text-teal-900"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-slate-200 bg-white text-slate-900";

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${styles}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
    </div>
  );
};

export default function AdminKYC() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/kyc/pending");
      setPendingUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("❌ Failed to load pending KYC:", e);
      setErr(e?.response?.data?.message || "Failed to load pending KYC");
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return pendingUsers;
    return pendingUsers.filter((u) => {
      const hay = `${u.name || ""} ${u.email || ""} ${
        u.phone || ""
      }`.toLowerCase();
      return hay.includes(qq);
    });
  }, [pendingUsers, q]);

  const handleKycAction = async (userId, action) => {
    if (busyId) return;

    let reason = "";
    if (action === "rejected") {
      reason = window.prompt("Reason for rejection?") || "";
      if (!reason.trim()) return;
    } else {
      const ok = window.confirm("Approve this KYC?");
      if (!ok) return;
    }

    try {
      setBusyId(userId);
      await api.patch(`/api/admin/kyc/${userId}`, {
        status: action,
        reason: action === "rejected" ? reason : "",
      });
      toast.success(
        action === "approved" ? "✅ KYC approved" : "✅ KYC rejected"
      );
      await fetchPending();
    } catch (e) {
      console.error("❌ KYC action failed:", e);
      toast.error(e?.response?.data?.message || "Failed to update KYC status");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
          Loading KYC pending list…
        </div>
      </AdminLayout>
    );
  }

  if (err) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="font-semibold text-red-800">Couldn’t load KYC</div>
          <div className="text-sm text-red-700 mt-1">{err}</div>
          <button
            onClick={fetchPending}
            className="mt-4 rounded-2xl px-4 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Verification
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              🪪 KYC Verifications
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Review submitted ID documents and approve or reject with reason.
            </p>
          </div>

          <button
            onClick={fetchPending}
            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            Refresh ↻
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <StatCard
            label="Pending applications"
            value={pendingUsers.length}
            tone="amber"
          />
          <StatCard
            label="Showing (filtered)"
            value={filtered.length}
            tone="teal"
          />
          <StatCard label="Action" value="Approve / Reject" />
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3 md:p-4 mb-4">
          <label className="text-xs font-semibold text-slate-600">Search</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, phone…"
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
                       outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
          />
          <div className="mt-2 text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {pendingUsers.length}
            </span>
            .
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              ✅ No pending verifications
            </div>
            <div className="text-sm text-slate-600 mt-1">
              Everything is up to date. If you expect requests, check signup
              step2 and kyc.status.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((user) => {
              const working = busyId === user._id;
              return (
                <div
                  key={user._id}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                  {/* Card header */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-slate-900 truncate">
                          {user.name || "—"}
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                          <span className="h-2 w-2 rounded-full bg-amber-500/60" />
                          PENDING
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 truncate">
                        {user.email || "—"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Role:{" "}
                        <span className="font-semibold text-slate-700">
                          {user.primaryRole || "user"}
                        </span>
                        {user.phone ? (
                          <span className="ml-2">• {user.phone}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Docs */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <DocTile title="ID Front" url={user.idDocumentUrl} />
                      <DocTile title="ID Back" url={user.idBackUrl} />
                      <div className="sm:col-span-2">
                        <DocTile title="Live Selfie" url={user.livePhotoUrl} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <button
                        disabled={working}
                        onClick={() => handleKycAction(user._id, "approved")}
                        className="flex-1 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white
                                   bg-teal-600 hover:bg-teal-700 transition disabled:opacity-60"
                      >
                        {working ? "Working…" : "Approve"}
                      </button>
                      <button
                        disabled={working}
                        onClick={() => handleKycAction(user._id, "rejected")}
                        className="flex-1 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white
                                   bg-red-600 hover:bg-red-700 transition disabled:opacity-60"
                      >
                        {working ? "Working…" : "Reject"}
                      </button>
                    </div>

                    <div className="mt-3 text-xs text-slate-500">
                      Tip: Clicking a document opens it in a new tab for zoom.
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
