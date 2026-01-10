// src/pages/AdminReferrals.jsx
import { useEffect, useState } from "react";
import { api } from "../services/api"; // ✅ central axios

const AdminReferrals = () => {
  const [referrers, setReferrers] = useState([]);
  const [referred, setReferred] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/referrals"); // token auto-attached
      setReferrers(res.data?.referrers ?? []);
      setReferred(res.data?.referred ?? []);
    } catch (e) {
      console.error("Failed to fetch referral data", e);
      setErr("Failed to fetch referral data.");
      setReferrers([]);
      setReferred([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // optional: toast.success("Copied!");
    } catch {
      // optional: toast.error("Copy failed");
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">📊 Referral Analytics</h2>
        <div className="text-sm text-gray-600 hidden md:block">
          {referrers.length} referrer{referrers.length === 1 ? "" : "s"} •{" "}
          {referred.length} referred
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="text-sm px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-60"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {err && <p className="text-red-600 mb-4">{err}</p>}
      {loading && !err && <p className="text-gray-500">Loading…</p>}

      {!loading && !err && (
        <>
          {/* Top Referrers */}
          <h3 className="text-lg font-semibold mb-3">🏅 Top Referrers</h3>
          <div className="overflow-x-auto bg-white rounded shadow mb-8">
            <table className="min-w-full table-auto text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Referral Code</th>
                  <th className="px-4 py-2">Rewards</th>
                </tr>
              </thead>
              <tbody>
                {referrers.length ? (
                  referrers.map((u) => (
                    <tr key={u._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{u.name}</td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2 font-mono">
                        <span className="mr-2">{u.referralCode}</span>
                        {u.referralCode && (
                          <button
                            onClick={() => copy(u.referralCode)}
                            className="text-xs text-blue-700 hover:underline"
                          >
                            Copy
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-2 font-semibold">
                        {u.referralRewards ?? 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-500 py-4">
                      No referral data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Referred Users */}
          <h3 className="text-lg font-semibold mb-3">👥 Referred Users</h3>
          <ul className="space-y-3">
            {referred.length ? (
              referred.map((r) => (
                <li key={r._id} className="border p-4 rounded bg-white shadow">
                  <p className="font-medium">
                    {r.name} - <span className="text-gray-700">{r.email}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Referred by:{" "}
                    <span className="font-mono">{r.referredBy}</span> • Joined:{" "}
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </li>
              ))
            ) : (
              <li className="text-gray-500 italic">No referred users found.</li>
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default AdminReferrals;
