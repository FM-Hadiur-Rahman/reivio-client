import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api"; // ✅ central axios (auto baseURL + token if present)

const AdminListingDetails = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // If the route is public, this works fine. If you made it protected,
        // the api interceptor will attach the token automatically.
        const res = await api.get(`/api/listings/${id}`);
        if (!mounted) return;
        setListing(res.data || null);
      } catch (e) {
        console.error("Failed to fetch listing", e);
        if (!mounted) return;
        setErr(e?.response?.data?.message || "Failed to fetch listing");
        setListing(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <AdminLayout>Loading…</AdminLayout>;
  if (err)
    return (
      <AdminLayout>
        <p className="text-red-600">❌ {err}</p>
      </AdminLayout>
    );
  if (!listing)
    return (
      <AdminLayout>
        <p className="text-gray-500">❌ Listing not found.</p>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-4">🏠 Listing Details</h2>
      <div className="bg-white p-4 shadow rounded">
        <p>
          <strong>Title:</strong> {listing.title || "—"}
        </p>
        <p>
          <strong>Price:</strong> ৳{listing.price ?? "—"}
        </p>
        <p>
          <strong>Max Guests:</strong> {listing.maxGuests ?? "—"}
        </p>
        <p>
          <strong>Location:</strong> {listing.location?.address || "—"}
        </p>
        <p>
          <strong>Division:</strong> {listing.division || "—"}
        </p>
        <p>
          <strong>District:</strong> {listing.district || "—"}
        </p>
        <p>
          <strong>Host:</strong>{" "}
          {listing.hostId?.name
            ? `${listing.hostId.name} (${listing.hostId.email || "—"})`
            : "—"}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          {listing.isDeleted ? "❌ Deleted" : "✅ Active"}
        </p>

        {Array.isArray(listing.images) && listing.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
            {listing.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Listing ${i + 1}`}
                className="h-40 w-full object-cover rounded"
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminListingDetails;
