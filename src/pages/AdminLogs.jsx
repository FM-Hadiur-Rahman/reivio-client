import { useEffect, useState } from "react";
import { api } from "../services/api"; // ⬅️ use the central axios client

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/logs"); // token auto-attached
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("❌ Failed to fetch logs", e);
      setErr("Failed to fetch logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">📜 Server Logs</h2>
        <button
          onClick={fetchLogs}
          className="text-sm px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading logs…</p>}
      {err && !loading && <p className="text-red-600">{err}</p>}

      {!loading && !err && (
        <>
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full divide-y divide-gray-200 text-sm md:text-base">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Level</th>
                  <th className="px-4 py-2 text-left">Message</th>
                  <th className="px-4 py-2 text-left">User</th>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="px-4 py-2 font-semibold text-xs whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-white ${
                          log.level === "error"
                            ? "bg-red-500"
                            : log.level === "warn"
                            ? "bg-yellow-500"
                            : "bg-gray-600"
                        }`}
                      >
                        {(log.level || "info").toUpperCase()}
                      </span>
                    </td>
                    <td
                      className="px-4 py-2 max-w-xs truncate"
                      title={log.message}
                    >
                      {log.message || "-"}
                    </td>
                    <td className="px-4 py-2">{log.user?.name || "System"}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2 text-blue-600 break-all">
                      {log.url || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logs.length === 0 && (
            <p className="text-center text-gray-500 italic mt-6">
              No logs found.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default AdminLogs;
