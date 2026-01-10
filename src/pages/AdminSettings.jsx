// pages/AdminSettings.jsx
import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";

const AdminSettings = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const loadConfig = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/config"); // token not required
      setMaintenance(Boolean(res.data?.maintenanceMode));
    } catch (e) {
      console.error(e);
      setErr("Failed to load config.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const toggleMaintenance = async () => {
    const next = !maintenance;
    try {
      setSaving(true);
      setErr("");
      // optimistic update
      setMaintenance(next);
      await api.patch("/api/admin/toggle-maintenance", {
        maintenanceMode: next,
      }); // token auto-injected
    } catch (e) {
      console.error(e);
      setErr("Failed to update maintenance mode.");
      // rollback
      setMaintenance(!next);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">⚙️ Admin Settings</h2>

      {err && <p className="text-red-600 mb-3">{err}</p>}

      {loading ? (
        <p className="text-gray-600">Loading settings…</p>
      ) : (
        <div className="flex items-center gap-4">
          <span className="text-lg font-medium">
            Maintenance Mode:{" "}
            <strong className={maintenance ? "text-red-600" : "text-green-600"}>
              {maintenance ? "ON" : "OFF"}
            </strong>
          </span>
          <button
            onClick={toggleMaintenance}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {saving ? "Saving…" : maintenance ? "Turn OFF" : "Turn ON"}
          </button>
          <button
            onClick={loadConfig}
            disabled={loading || saving}
            className="ml-2 text-sm px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSettings;
