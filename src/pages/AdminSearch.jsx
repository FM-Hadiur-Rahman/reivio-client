// src/pages/AdminSearch.jsx (Premium)
import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { toast } from "react-toastify";

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

const Badge = ({ tone = "slate", children }) => {
  const cls =
    tone === "teal"
      ? "bg-teal-50 text-teal-700 ring-teal-200"
      : tone === "amber"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
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

const CopyBtn = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(value || ""));
      setCopied(true);
      toast.info("Copied");
      setTimeout(() => setCopied(false), 900);
    } catch {}
  };
  return (
    <button
      onClick={onCopy}
      type="button"
      className="rounded-xl border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
      title="Copy"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const fmtDate = (iso) => {
  try {
    return iso ? new Date(iso).toLocaleDateString() : "—";
  } catch {
    return "—";
  }
};

export default function AdminSearch() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [results, setResults] = useState(null);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [err, setErr] = useState("");

  const hasResults = !!(
    results?.user ||
    results?.booking ||
    results?.tripReservation
  );

  const doSearch = useCallback(
    async (qOverride) => {
      const q = (qOverride ?? query ?? "").trim();
      if (!q) {
        setResults(null);
        setErr("Please enter a search query.");
        return;
      }

      try {
        setLoading(true);
        setErr("");
        setSearchParams({ query: q });

        const res = await api.get("/api/admin/search", {
          params: { query: q },
        });
        setResults(res.data || null);

        if (
          !res.data ||
          (!res.data.user && !res.data.booking && !res.data.tripReservation)
        ) {
          setErr("No matches found.");
        }
      } catch (e) {
        console.error("Search failed", e);
        setErr(e?.response?.data?.message || "Search error. Please try again.");
        setResults(null);
      } finally {
        setLoading(false);
      }
    },
    [query, setSearchParams]
  );

  useEffect(() => {
    const q = searchParams.get("query");
    if (q && q !== query) {
      setQuery(q);
      // run search on mount if URL has query
      doSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const onKeyDown = (e) => {
    if (e.key === "Enter") doSearch();
  };

  const handleExport = async (type) => {
    const q = (query || "").trim();
    if (!q) return;

    try {
      setExporting(true);
      const res = await api.get("/api/admin/export-search", {
        params: { query: q, type },
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: type === "csv" ? "text/csv;charset=utf-8" : "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      a.download = `admin-search-${ts}.${type}`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${type.toUpperCase()}`);
    } catch (e) {
      console.error("Export failed", e);
      toast.error(
        e?.response?.data?.message || "Export failed. Please try again."
      );
    } finally {
      setExporting(false);
    }
  };

  const summary = useMemo(() => {
    const chips = [];
    if (results?.user) chips.push({ label: "User", tone: "teal" });
    if (results?.booking) chips.push({ label: "Booking", tone: "amber" });
    if (results?.tripReservation)
      chips.push({ label: "Trip Reservation", tone: "slate" });
    return chips;
  }, [results]);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Admin tools
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              🔍 Admin Search
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Search users, bookings, and trip reservations by ID, email, or
              transaction ID.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {summary.map((c, i) => (
                <Badge key={i} tone={c.tone}>
                  {c.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport("csv")}
              disabled={!hasResults || exporting}
              className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition disabled:opacity-60"
            >
              {exporting ? "Exporting…" : "Export CSV"}
            </button>
            <button
              onClick={() => handleExport("pdf")}
              disabled={!hasResults || exporting}
              className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition disabled:opacity-60"
            >
              {exporting ? "Exporting…" : "Export PDF"}
            </button>
          </div>
        </div>

        {/* Search box */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3 md:p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600">
                Search query
              </label>
              <input
                type="text"
                placeholder="User ID, Email, Booking ID, Transaction ID…"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
                           outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <div className="mt-2 text-xs text-slate-500">
                Tip: You can paste SSLCOMMERZ tran_id or extraPayment.tran_id.
              </div>
            </div>

            <button
              onClick={() => doSearch()}
              disabled={loading}
              className="md:mt-5 rounded-2xl px-5 py-2.5 text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-60"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>

          {err && (
            <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {err}
            </div>
          )}
        </div>

        {/* Results */}
        {!loading && results && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User */}
            <Card
              title="👤 User"
              subtitle="Identity, roles, verification"
              right={
                results.user ? (
                  <Badge tone="teal">FOUND</Badge>
                ) : (
                  <Badge>—</Badge>
                )
              }
            >
              {results.user ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-slate-600">Name</div>
                    <div className="font-semibold text-slate-900">
                      {results.user.name || "—"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-slate-600">Email</div>
                    <div className="font-semibold text-slate-900 break-all">
                      {results.user.email || "—"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-slate-600">Role</div>
                    <div className="font-semibold text-slate-900">
                      {results.user.primaryRole || results.user.role || "—"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-slate-600">User ID</div>
                    <div className="font-semibold text-slate-900 break-all">
                      {results.user._id} <CopyBtn value={results.user._id} />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      to={`/admin/users/${results.user._id}`}
                      className="rounded-2xl px-3 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
                    >
                      View user →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-slate-600">No user match.</div>
              )}
            </Card>

            {/* Booking */}
            <Card
              title="📦 Booking"
              subtitle="Payment, listing, guest"
              right={
                results.booking ? (
                  <Badge tone="amber">FOUND</Badge>
                ) : (
                  <Badge>—</Badge>
                )
              }
            >
              {results.booking ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-slate-600">Booking ID</div>
                    <div className="font-semibold text-slate-900 break-all">
                      {results.booking._id}{" "}
                      <CopyBtn value={results.booking._id} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-slate-600">Guest</div>
                    <div className="font-semibold text-slate-900">
                      {results.booking.guestId?.name || "—"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-slate-600">Listing</div>
                    <div className="font-semibold text-slate-900">
                      {results.booking.listingId?.title || "—"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-slate-600">Dates</div>
                    <div className="font-semibold text-slate-900">
                      {fmtDate(results.booking.dateFrom)} →{" "}
                      {fmtDate(results.booking.dateTo)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-slate-600">Payment</div>
                    <div className="font-semibold text-slate-900">
                      {results.booking.paymentStatus || "—"}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      to={`/admin/bookings/${results.booking._id}`}
                      className="rounded-2xl px-3 py-2 text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition"
                    >
                      View booking →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-slate-600">No booking match.</div>
              )}
            </Card>

            {/* Trip */}
            <Card
              title="🚘 Trip reservation"
              subtitle="Reservation + transaction"
              right={
                results.tripReservation ? (
                  <Badge>FOUND</Badge>
                ) : (
                  <Badge>—</Badge>
                )
              }
            >
              {results.tripReservation ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-slate-600">User</div>
                    <div className="font-semibold text-slate-900">
                      {results.tripReservation.userId?.name || "—"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-slate-600">Trip ID</div>
                    <div className="font-semibold text-slate-900 break-all">
                      {results.tripReservation.tripId?._id || "—"}
                      {results.tripReservation.tripId?._id ? (
                        <span className="ml-2">
                          <CopyBtn value={results.tripReservation.tripId._id} />
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-slate-600">Status</div>
                    <div className="font-semibold text-slate-900">
                      {results.tripReservation.status || "—"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-slate-600">Transaction</div>
                    <div className="font-semibold text-slate-900 break-all">
                      {results.tripReservation.tran_id || "—"}
                      {results.tripReservation.tran_id ? (
                        <span className="ml-2">
                          <CopyBtn value={results.tripReservation.tran_id} />
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    {results.tripReservation.tripId?._id ? (
                      <Link
                        to={`/admin/trips/${results.tripReservation.tripId._id}`}
                        className="rounded-2xl px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition"
                      >
                        View trip →
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="text-slate-600">No trip reservation match.</div>
              )}
            </Card>

            {/* No match helper */}
            {!hasResults && (
              <Card title="No matches" subtitle="Try different identifiers">
                <div className="text-sm text-slate-600 space-y-2">
                  <div>Try searching by:</div>
                  <ul className="list-disc ml-5">
                    <li>User email</li>
                    <li>User ID</li>
                    <li>Booking ID</li>
                    <li>SSLCOMMERZ tran_id</li>
                    <li>extraPayment.tran_id</li>
                  </ul>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
