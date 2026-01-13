import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";
import { toast } from "react-toastify";

const TabBtn = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={[
      "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition",
      active
        ? "bg-teal-600 text-white"
        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
    ].join(" ")}
  >
    {children}
    <span
      className={[
        "text-xs rounded-full px-2 py-0.5",
        active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700",
      ].join(" ")}
    >
      {count}
    </span>
  </button>
);

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

export default function AdminFlagged() {
  const [flagged, setFlagged] = useState({
    users: [],
    listings: [],
    reviews: [],
  });
  const [tab, setTab] = useState("users"); // users | listings | reviews
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  const fetchFlagged = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/api/admin/flagged");
      setFlagged(res.data || { users: [], listings: [], reviews: [] });
    } catch (e) {
      console.error("❌ Failed to load flagged content:", e);
      setErr(e?.response?.data?.message || "Failed to load flagged content");
      setFlagged({ users: [], listings: [], reviews: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlagged();
  }, []);

  const counts = useMemo(
    () => ({
      users: flagged.users?.length || 0,
      listings: flagged.listings?.length || 0,
      reviews: flagged.reviews?.length || 0,
      all:
        (flagged.users?.length || 0) +
        (flagged.listings?.length || 0) +
        (flagged.reviews?.length || 0),
    }),
    [flagged]
  );

  const currentItems = useMemo(() => {
    const arr = flagged[tab] || [];
    const qq = q.trim().toLowerCase();
    if (!qq) return arr;

    return arr.filter((x) => {
      const text =
        tab === "users"
          ? `${x.name || ""} ${x.email || ""} ${x.reason || ""}`
          : tab === "listings"
          ? `${x.title || ""} ${x.reason || ""} ${x.hostId?.name || ""} ${
              x.hostId?.email || ""
            }`
          : `${x.text || ""} ${x.reason || ""} ${x.userId?.name || ""} ${
              x.userId?.email || ""
            } ${x.listingId?.title || ""}`;

      return text.toLowerCase().includes(qq);
    });
  }, [flagged, tab, q]);

  const removeFlag = async (type, id) => {
    const ok = window.confirm("Remove flag from this item?");
    if (!ok) return;

    try {
      setBusyId(id);
      // ✅ FIX: backend route is /unflag/:type/:id
      await api.put(`/api/admin/unflag/${type}/${id}`, {});
      toast.success("✅ Flag removed");
      await fetchFlagged();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "❌ Failed to remove flag.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
          Loading flagged content…
        </div>
      </AdminLayout>
    );
  }

  if (err) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="font-semibold text-red-800">
            Couldn’t load flagged content
          </div>
          <div className="text-sm text-red-700 mt-1">{err}</div>
          <button
            onClick={fetchFlagged}
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
              Moderation
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              🚩 Flagged Content
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Review items flagged by the system or reports. Remove flags after
              verification.
            </p>
          </div>

          <button
            onClick={fetchFlagged}
            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            Refresh ↻
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Total flagged</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">
              {counts.all}
            </div>
            <div className="mt-2 text-xs text-slate-600">
              All types combined
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Users</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">
              {counts.users}
            </div>
            <div className="mt-2 text-xs text-slate-600">Identity / abuse</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Listings</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">
              {counts.listings}
            </div>
            <div className="mt-2 text-xs text-slate-600">Policy violations</div>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <div className="text-xs text-red-700">Reviews</div>
            <div className="mt-1 text-2xl font-extrabold text-red-900">
              {counts.reviews}
            </div>
            <div className="mt-2 text-xs text-red-800/80">
              Hate / spam / abuse
            </div>
          </div>
        </div>

        {/* Tabs + search */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3 md:p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <TabBtn
                active={tab === "users"}
                onClick={() => setTab("users")}
                count={counts.users}
              >
                👤 Users
              </TabBtn>
              <TabBtn
                active={tab === "listings"}
                onClick={() => setTab("listings")}
                count={counts.listings}
              >
                🏠 Listings
              </TabBtn>
              <TabBtn
                active={tab === "reviews"}
                onClick={() => setTab("reviews")}
                count={counts.reviews}
              >
                ⭐ Reviews
              </TabBtn>
            </div>

            <div className="w-full md:max-w-sm">
              <label className="text-xs font-semibold text-slate-600">
                Search
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, email, title, reason…"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              />
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {currentItems.length}
            </span>{" "}
            item{currentItems.length === 1 ? "" : "s"} in{" "}
            <span className="font-semibold text-slate-700">{tab}</span>.
          </div>
        </div>

        {/* Content */}
        <Card
          title={
            tab === "users"
              ? "Flagged users"
              : tab === "listings"
              ? "Flagged listings"
              : "Flagged reviews"
          }
          subtitle="Use Remove Flag only after confirming the issue is resolved."
          right={
            <span className="text-xs text-slate-500">
              {currentItems.length} item{currentItems.length === 1 ? "" : "s"}
            </span>
          }
        >
          {currentItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
              ✅ No items found for this tab.
            </div>
          ) : (
            <div className="space-y-3">
              {tab === "users" &&
                currentItems.map((u) => (
                  <div
                    key={u._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 truncate">
                        {u.name || "—"}{" "}
                        <span className="text-slate-500 font-normal">
                          {u.email ? `(${u.email})` : ""}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        Reason:{" "}
                        <span className="font-medium">
                          {u.reason || "No reason"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/admin/users/${u._id}`}
                        className="rounded-2xl px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition"
                      >
                        View
                      </Link>
                      <button
                        disabled={busyId === u._id}
                        onClick={() => removeFlag("user", u._id)}
                        className="rounded-2xl px-3 py-2 text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-60"
                      >
                        {busyId === u._id ? "Working…" : "Remove Flag"}
                      </button>
                    </div>
                  </div>
                ))}

              {tab === "listings" &&
                currentItems.map((l) => (
                  <div
                    key={l._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 truncate">
                        {l.title || "—"}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        Host:{" "}
                        <span className="font-medium">
                          {l.hostId?.name || "—"}
                        </span>{" "}
                        <span className="text-slate-500">
                          {l.hostId?.email ? `(${l.hostId.email})` : ""}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        Reason:{" "}
                        <span className="font-medium">
                          {l.reason || "No reason"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/admin/listings/${l._id}`}
                        className="rounded-2xl px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition"
                      >
                        View
                      </Link>
                      <button
                        disabled={busyId === l._id}
                        onClick={() => removeFlag("listing", l._id)}
                        className="rounded-2xl px-3 py-2 text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-60"
                      >
                        {busyId === l._id ? "Working…" : "Remove Flag"}
                      </button>
                    </div>
                  </div>
                ))}

              {tab === "reviews" &&
                currentItems.map((r) => (
                  <div
                    key={r._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50/70 transition flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm text-slate-600">
                          Listing:{" "}
                          <span className="font-semibold text-slate-900">
                            {r.listingId?.title || "—"}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          User:{" "}
                          <span className="font-medium">
                            {r.userId?.name || "Unknown"}
                          </span>{" "}
                          <span className="text-slate-500">
                            {r.userId?.email ? `(${r.userId.email})` : ""}
                          </span>
                        </div>
                      </div>

                      <button
                        disabled={busyId === r._id}
                        onClick={() => removeFlag("review", r._id)}
                        className="shrink-0 rounded-2xl px-3 py-2 text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-60"
                      >
                        {busyId === r._id ? "Working…" : "Remove Flag"}
                      </button>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-800">
                      <div className="text-xs text-slate-500 mb-1">Review</div>
                      <div className="text-sm leading-relaxed">
                        “{r.text || "—"}”
                      </div>
                    </div>

                    <div className="text-sm text-slate-600">
                      Reason:{" "}
                      <span className="font-medium">
                        {r.reason || "No reason"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>

        <div className="mt-6 text-xs text-slate-500">
          Tip: If flags are created automatically, consider storing flag reasons
          and reporter IDs for audit trails.
        </div>
      </div>
    </AdminLayout>
  );
}
