// pages/AdminSettings.jsx (Premium)
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";
import { toast } from "react-toastify";

const Badge = ({ tone = "slate", children }) => {
  const cls =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
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

const Card = ({ title, subtitle, right, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-start justify-between gap-3">
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {subtitle ? (
          <div className="text-xs text-slate-500">{subtitle}</div>
        ) : null}
      </div>
      {right}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export default function AdminSettings() {
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const loadConfig = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/config"); // public
      setMaintenance(Boolean(res.data?.maintenanceMode));
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "Failed to load config.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // ⚠️ Your backend toggle endpoint ignores body and flips mode server-side.
  // So we should call it and then re-fetch /api/config to stay correct.
  const toggleMaintenance = async () => {
    const ok = window.confirm(
      maintenance
        ? "Turn OFF maintenance mode? The app will become available to users."
        : "Turn ON maintenance mode? Users will see a maintenance message."
    );
    if (!ok) return;

    try {
      setSaving(true);
      setErr("");

      await api.patch("/api/admin/toggle-maintenance"); // admin protected

      await loadConfig(); // sync from server
      toast.success(`Maintenance mode is now ${!maintenance ? "ON" : "OFF"}`);
    } catch (e) {
      console.error(e);
      setErr(
        e?.response?.data?.message || "Failed to update maintenance mode."
      );
      toast.error("Failed to update maintenance mode");
    } finally {
      setSaving(false);
    }
  };

  const status = useMemo(() => (maintenance ? "ON" : "OFF"), [maintenance]);

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              System
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              ⚙️ Settings
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Control maintenance mode and system-wide behavior.
            </p>
          </div>

          <button
            onClick={loadConfig}
            disabled={loading || saving}
            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh ↻"}
          </button>
        </div>

        {err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm mb-4 text-red-700">
            {err}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
            Loading settings…
          </div>
        ) : (
          <Card
            title="Maintenance mode"
            subtitle="When enabled, users receive a maintenance message."
            right={
              maintenance ? (
                <Badge tone="red">ON</Badge>
              ) : (
                <Badge tone="green">OFF</Badge>
              )
            }
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-sm text-slate-700">
                  Current status:{" "}
                  <span
                    className={`font-extrabold ${
                      maintenance ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Recommended: enable during deployments or critical incidents.
                </div>

                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <div className="font-semibold text-slate-900 mb-1">
                    What users see
                  </div>
                  <div className="text-slate-600">
                    A 503 response with a maintenance message from your
                    middleware.
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[220px]">
                <button
                  onClick={toggleMaintenance}
                  disabled={saving}
                  className={[
                    "rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60",
                    maintenance
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700",
                  ].join(" ")}
                >
                  {saving ? "Saving…" : maintenance ? "Turn OFF" : "Turn ON"}
                </button>

                <button
                  onClick={loadConfig}
                  disabled={saving}
                  className="rounded-2xl px-4 py-2.5 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition disabled:opacity-60"
                >
                  Re-sync from server
                </button>

                <div className="text-xs text-slate-500">
                  Tip: This endpoint toggles server-side; we re-fetch config to
                  stay consistent.
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
