// src/pages/AdminTripDetails.jsx (Premium)
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";
import { toast } from "react-toastify";

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

const fmtTime = (t) => {
  if (!t) return "—";
  const asDate = new Date(t);
  return Number.isNaN(asDate.getTime())
    ? String(t)
    : asDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const Badge = ({ tone = "slate", children }) => {
  const cls =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "red"
      ? "bg-red-50 text-red-700 ring-red-200"
      : tone === "amber"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : tone === "teal"
      ? "bg-teal-50 text-teal-700 ring-teal-200"
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

const mapLink = (coords) => {
  if (!Array.isArray(coords) || coords.length !== 2) return null;
  const [lng, lat] = coords;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
};

export default function AdminTripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchTrip = async () => {
    try {
      setLoading(true);
      setErr("");

      // Prefer admin route if you have it; fallback to public route.
      let res;
      try {
        res = await api.get(`/api/admin/trips/${id}`);
      } catch {
        res = await api.get(`/api/trips/${id}`);
      }

      setTrip(res.data || null);
    } catch (e) {
      console.error("Failed to fetch trip", e);
      setErr(e?.response?.data?.message || "Failed to fetch trip.");
      setTrip(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fromText = trip?.fromText || trip?.from || "—";
  const toText = trip?.toText || trip?.to || "—";

  const fromUrl = useMemo(() => mapLink(trip?.fromCoords), [trip?.fromCoords]);
  const toUrl = useMemo(() => mapLink(trip?.toCoords), [trip?.toCoords]);

  const seatsTotal = trip?.totalSeats ?? trip?.seats ?? "—";
  const seatsAvail = trip?.availableSeats ?? "—";
  const fare = Number(trip?.fare ?? 0);

  const status = trip?.isCancelled ? "CANCELLED" : "ACTIVE";

  if (loading) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
          Loading trip…
        </div>
      </AdminLayout>
    );
  }

  if (err) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="font-semibold text-red-800">Couldn’t load trip</div>
          <div className="text-sm text-red-700 mt-1">{err}</div>
          <button
            onClick={fetchTrip}
            className="mt-4 rounded-2xl px-4 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!trip) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
          ❌ Trip not found.
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
              Trips
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              🚘 Trip Details
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {trip.isCancelled ? (
                <Badge tone="red">CANCELLED</Badge>
              ) : (
                <Badge tone="green">ACTIVE</Badge>
              )}
              <Badge tone="teal">
                {String(trip.vehicleType || "—").toUpperCase()}
              </Badge>
              <span className="text-xs text-slate-500">
                ID:{" "}
                <span className="font-semibold text-slate-700">{trip._id}</span>{" "}
                <CopyBtn value={trip._id} />
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              Review route, driver, seat availability and fare. Open coordinates
              in Maps.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTrip}
              disabled={loading}
              className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
            >
              Refresh ↻
            </button>
            <Link
              to={`/trips/${trip._id}`}
              className="rounded-2xl px-4 py-2 text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 transition"
            >
              Open public →
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
          <Stat label="Fare" value={bdt.format(fare)} tone="teal" />
          <Stat label="Seats (total)" value={seatsTotal} />
          <Stat label="Available" value={seatsAvail} tone="amber" />
          <Stat label="Date" value={fmtDate(trip.date)} />
        </div>

        {/* Main sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Route */}
          <div className="lg:col-span-2 space-y-4">
            <Card
              title="Route"
              subtitle="From → To and optional map links"
              right={
                trip.isCancelled ? (
                  <Badge tone="red">{status}</Badge>
                ) : (
                  <Badge tone="green">{status}</Badge>
                )
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">From</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {fromText}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {fromUrl ? (
                      <a
                        href={fromUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-white transition"
                      >
                        Open map →
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">No coords</span>
                    )}
                    {trip.fromCoords?.length === 2 ? (
                      <CopyBtn
                        value={`${trip.fromCoords[1]},${trip.fromCoords[0]}`}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">To</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {toText}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {toUrl ? (
                      <a
                        href={toUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-white transition"
                      >
                        Open map →
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">No coords</span>
                    )}
                    {trip.toCoords?.length === 2 ? (
                      <CopyBtn
                        value={`${trip.toCoords[1]},${trip.toCoords[0]}`}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Schedule</div>
                  <div className="mt-1 text-slate-900">
                    <span className="font-semibold">{fmtDate(trip.date)}</span>{" "}
                    <span className="text-slate-500">at</span>{" "}
                    <span className="font-semibold">{fmtTime(trip.time)}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Vehicle" subtitle="Vehicle info from trip record">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Vehicle type</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {trip.vehicleType || "—"}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Vehicle number</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {trip.vehicleNumber || "—"}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Driver */}
          <div className="space-y-4">
            <Card
              title="Driver"
              subtitle="Trip owner"
              right={
                trip.driver?._id ? (
                  <Link
                    to={`/admin/users/${trip.driver._id}`}
                    className="rounded-2xl px-3 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
                  >
                    View user →
                  </Link>
                ) : null
              }
            >
              <div className="flex items-center gap-3">
                <img
                  src={trip.driver?.avatar || "/default-avatar.png"}
                  alt="Driver avatar"
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">
                    {trip.driver?.name || "—"}
                  </div>
                  <div className="text-sm text-slate-600 truncate">
                    {trip.driver?.email || "—"}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">Driver approved</span>
                  <span className="font-semibold text-slate-900">
                    {trip.driver?.driver?.approved ? "✅ Yes" : "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">KYC</span>
                  <span className="font-semibold text-slate-900">
                    {(trip.driver?.kyc?.status || "—").toUpperCase?.() || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">Phone</span>
                  <span className="font-semibold text-slate-900">
                    {trip.driver?.phone || "—"}
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Quick links" subtitle="Admin + public routes">
              <div className="flex flex-col gap-2">
                <Link
                  to={`/admin/trips/${trip._id}`}
                  className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition"
                >
                  Admin permalink →
                </Link>
                <Link
                  to={`/trips/${trip._id}`}
                  className="rounded-2xl px-4 py-2 text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 transition"
                >
                  Public trip page →
                </Link>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Tip: Use the admin route (<code>/api/admin/trips/:id</code>) to
                ensure driver is populated.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
