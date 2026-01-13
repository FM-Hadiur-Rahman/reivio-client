import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";

const bdt = new Intl.NumberFormat("bn-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const fmtMoney = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return bdt.format(v);
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
      type="button"
      className="ml-2 inline-flex items-center rounded-xl border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
      title="Copy"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const Stat = ({ label, value, tone = "default" }) => {
  const cls =
    tone === "teal"
      ? "border-teal-200 bg-teal-50 text-teal-900"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-slate-200 bg-white text-slate-900";
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${cls}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
    </div>
  );
};

const Section = ({ title, subtitle, right, children }) => (
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

export default function AdminListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchOne = async () => {
    try {
      setLoading(true);
      setErr("");

      // ✅ Prefer admin route (has host populated + includes deleted)
      // If you don't have it yet, keep /api/listings/:id as fallback
      let res;
      try {
        res = await api.get(`/api/admin/listings/${id}`);
      } catch {
        res = await api.get(`/api/listings/${id}`);
      }

      setListing(res.data || null);
    } catch (e) {
      console.error("Failed to fetch listing", e);
      setErr(e?.response?.data?.message || "Failed to fetch listing");
      setListing(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const images = useMemo(
    () =>
      Array.isArray(listing?.images) ? listing.images.filter(Boolean) : [],
    [listing]
  );

  const host = listing?.hostId || {};

  if (loading) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
          Loading listing…
        </div>
      </AdminLayout>
    );
  }

  if (err) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="font-semibold text-red-800">
            Couldn’t load listing
          </div>
          <div className="text-sm text-red-700 mt-1">❌ {err}</div>
          <button
            onClick={fetchOne}
            className="mt-4 rounded-2xl px-4 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!listing) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-600">
          ❌ Listing not found.
        </div>
      </AdminLayout>
    );
  }

  const statusPill = listing.isDeleted
    ? "bg-red-50 text-red-700 ring-red-200"
    : "bg-emerald-50 text-emerald-700 ring-emerald-200";

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Listing
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              🏠 Listing Details
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1",
                  statusPill,
                ].join(" ")}
              >
                <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                {listing.isDeleted ? "DELETED" : "ACTIVE"}
              </span>

              {listing._id && (
                <span className="text-xs text-slate-500">
                  ID:{" "}
                  <span className="font-semibold text-slate-700">
                    {listing._id}
                  </span>
                  <CopyBtn value={listing._id} />
                </span>
              )}
            </div>

            <p className="text-sm text-slate-600 mt-2">
              Review listing info, host details, and gallery.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOne}
              className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              Refresh ↻
            </button>
            <Link
              to={`/listings/${listing._id}`}
              className="rounded-2xl px-4 py-2 text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 transition"
            >
              Open public →
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
          <Stat
            label="Price / night"
            value={fmtMoney(listing.price)}
            tone="teal"
          />
          <Stat label="Max guests" value={listing.maxGuests ?? "—"} />
          <Stat label="Type" value={listing.type || "—"} />
          <Stat
            label="Location"
            value={listing.district || listing.location?.district || "—"}
            tone="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main details */}
          <div className="lg:col-span-2 space-y-4">
            <Section
              title="Listing information"
              subtitle="Core fields and location metadata"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Title</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {listing.title || "—"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Address</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {listing.location?.address || "—"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Division</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {listing.division || listing.location?.division || "—"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">District</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {listing.district || listing.location?.district || "—"}
                  </div>
                </div>

                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Description</div>
                  <div className="text-slate-900 mt-1 leading-relaxed">
                    {listing.description || "—"}
                  </div>
                </div>
              </div>
            </Section>

            <Section
              title="Gallery"
              subtitle={
                images.length
                  ? `${images.length} image(s)`
                  : "No images uploaded"
              }
            >
              {images.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
                  No images available.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {images.map((img, i) => (
                    <a
                      key={i}
                      href={img}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group"
                      title="Open in new tab"
                    >
                      <img
                        src={img}
                        alt={`Listing ${i + 1}`}
                        className="h-40 w-full object-cover group-hover:opacity-95 transition"
                      />
                    </a>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* Side: Host */}
          <div className="space-y-4">
            <Section
              title="Host"
              subtitle="Owner of this listing"
              right={
                host?._id ? (
                  <Link
                    to={`/admin/users/${host._id}`}
                    className="rounded-2xl px-3 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
                  >
                    View user →
                  </Link>
                ) : null
              }
            >
              <div className="flex items-center gap-3">
                <img
                  src={host.avatar || "/default-avatar.png"}
                  alt="Host avatar"
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">
                    {host.name || "—"}
                  </div>
                  <div className="text-sm text-slate-600 truncate">
                    {host.email || "—"}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">Host approved</span>
                  <span className="font-semibold text-slate-900">
                    {host.host?.approved ? "✅ Yes" : "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">KYC</span>
                  <span className="font-semibold text-slate-900">
                    {(host.kyc?.status || "—").toUpperCase?.() || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">Phone</span>
                  <span className="font-semibold text-slate-900">
                    {host.phone || "—"}
                  </span>
                </div>
              </div>
            </Section>

            <div className="text-xs text-slate-500">
              Tip: Use the admin listing route (
              <code>/api/admin/listings/:id</code>) to ensure host is populated
              and deleted listings are accessible.
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
