import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";
import { toast } from "react-toastify";

const pill = (level) => {
  const l = String(level || "info").toLowerCase();
  if (l === "error") return "bg-red-50 text-red-700 ring-red-200";
  if (l === "warn" || l === "warning")
    return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
};

const fmtTime = (iso) => {
  try {
    return iso ? new Date(iso).toLocaleString() : "—";
  } catch {
    return "—";
  }
};

const CopyBtn = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(value || ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {}
  };
  return (
    <button
      onClick={onCopy}
      className="ml-2 inline-flex items-center rounded-xl border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
      type="button"
      title="Copy"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [level, setLevel] = useState("all"); // all | error | warn | info
  const [expanded, setExpanded] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/logs");
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("❌ Failed to fetch logs", e);
      setErr(e?.response?.data?.message || "Failed to fetch logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const counts = useMemo(() => {
    const c = { all: logs.length, error: 0, warn: 0, info: 0 };
    logs.forEach((l) => {
      const k = String(l.level || "info").toLowerCase();
      if (k === "error") c.error += 1;
      else if (k === "warn" || k === "warning") c.warn += 1;
      else c.info += 1;
    });
    return c;
  }, [logs]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return logs
      .filter((l) => {
        const lv = String(l.level || "info").toLowerCase();
        if (level !== "all") {
          if (level === "warn") {
            if (!(lv === "warn" || lv === "warning")) return false;
          } else if (lv !== level) return false;
        }
        if (!qq) return true;
        const hay = `${l.message || ""} ${l.url || ""} ${l.user?.name || ""} ${
          l.user?.email || ""
        } ${l.level || ""}`.toLowerCase();
        return hay.includes(qq);
      })
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  }, [logs, q, level]);

  const exportJson = async () => {
    try {
      const blob = new Blob([JSON.stringify(filtered, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admin-logs-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported JSON");
    } catch {
      toast.error("Failed to export");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              System
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              📨 Logs
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Review application logs. Filter by level and search
              message/url/user.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportJson}
              className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition"
              disabled={loading || filtered.length === 0}
              title="Export filtered logs"
            >
              Export JSON
            </button>

            <button
              onClick={fetchLogs}
              className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh ↻"}
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Total</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">
              {counts.all}
            </div>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <div className="text-xs text-red-700">Errors</div>
            <div className="mt-1 text-2xl font-extrabold text-red-900">
              {counts.error}
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="text-xs text-amber-700">Warnings</div>
            <div className="mt-1 text-2xl font-extrabold text-amber-900">
              {counts.warn}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Info</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">
              {counts.info}
            </div>
          </div>
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
                placeholder="Search message, url, user name/email…"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              />
            </div>

            <div className="w-full md:w-56">
              <label className="text-xs font-semibold text-slate-600">
                Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              >
                <option value="all">All ({counts.all})</option>
                <option value="error">Error ({counts.error})</option>
                <option value="warn">Warn ({counts.warn})</option>
                <option value="info">Info ({counts.info})</option>
              </select>
            </div>

            <button
              onClick={() => {
                setQ("");
                setLevel("all");
                setExpanded(null);
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
            <span className="font-semibold text-slate-700">{logs.length}</span>{" "}
            logs.
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
            Loading logs…
          </div>
        )}

        {!loading && err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="font-semibold text-red-800">Couldn’t load logs</div>
            <div className="text-sm text-red-700 mt-1">{err}</div>
            <button
              onClick={fetchLogs}
              className="mt-4 rounded-2xl px-4 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !err && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              No logs found
            </div>
            <div className="text-sm text-slate-600 mt-1">
              Try changing the filter or search term.
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && !err && filtered.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Logs</div>
              <div className="text-xs text-slate-500">Sorted by newest</div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white text-slate-600">
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                      Level
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Message
                    </th>
                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                      User
                    </th>
                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">URL</th>
                    <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((log) => {
                    const isOpen = expanded === log._id;
                    const lv = String(log.level || "info").toUpperCase();
                    return (
                      <React.Fragment key={log._id}>
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={[
                                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1",
                                pill(log.level),
                              ].join(" ")}
                            >
                              <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                              {lv}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900 line-clamp-1">
                              {log.message || "—"}
                            </div>
                            {log.stack && (
                              <div className="text-xs text-slate-500">
                                stack captured
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-semibold text-slate-900">
                              {log.user?.name || "System"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {log.user?.email || ""}
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                            {fmtTime(log.timestamp)}
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-slate-900 break-all line-clamp-1">
                              {log.url || "—"}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button
                              onClick={() =>
                                setExpanded(isOpen ? null : log._id)
                              }
                              className="rounded-2xl px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition"
                            >
                              {isOpen ? "Hide" : "Details"}
                            </button>
                          </td>
                        </tr>

                        {isOpen && (
                          <tr className="bg-slate-50">
                            <td colSpan={6} className="px-4 py-4">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                  <div className="text-xs font-semibold text-slate-600">
                                    Message
                                  </div>
                                  <div className="mt-1 text-sm text-slate-900 whitespace-pre-wrap break-words">
                                    {log.message || "—"}
                                  </div>
                                  <div className="mt-2">
                                    <CopyBtn value={log.message} />
                                  </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                  <div className="text-xs font-semibold text-slate-600">
                                    URL
                                  </div>
                                  <div className="mt-1 text-sm text-slate-900 whitespace-pre-wrap break-words">
                                    {log.url || "—"}
                                  </div>
                                  <div className="mt-2">
                                    <CopyBtn value={log.url} />
                                  </div>
                                </div>

                                {log.stack && (
                                  <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-3">
                                    <div className="text-xs font-semibold text-slate-600">
                                      Stack trace
                                    </div>
                                    <pre className="mt-2 text-xs text-slate-900 whitespace-pre-wrap break-words">
                                      {log.stack}
                                    </pre>
                                    <div className="mt-2">
                                      <CopyBtn value={log.stack} />
                                    </div>
                                  </div>
                                )}

                                <div className="lg:col-span-2 text-xs text-slate-500">
                                  ID:{" "}
                                  <span className="font-semibold text-slate-700">
                                    {log._id}
                                  </span>
                                  <CopyBtn value={log._id} />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
              Tip: For production incidents, filter by <b>Error</b> and search
              by endpoint or user email.
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
