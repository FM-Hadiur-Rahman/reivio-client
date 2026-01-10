// src/pages/AdminTripDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");
const fmtTime = (t) => {
  // supports "HH:mm" or ISO; fallback to raw string
  if (!t) return "—";
  const asDate = new Date(t);
  return isNaN(asDate.getTime())
    ? t
    : asDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const AdminTripDetails = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchTrip = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get(`/api/trips/${id}`); // token auto-injected
      setTrip(res.data || null);
    } catch (e) {
      console.error("Failed to fetch trip", e);
      setErr("Failed to fetch trip.");
      setTrip(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">🚘 Trip Details</h2>
        <button
          onClick={fetchTrip}
          disabled={loading}
          className="text-sm px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-60"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {err && <p className="text-red-600 mb-3">{err}</p>}

      {loading ? (
        <p className="text-gray-600">Loading…</p>
      ) : !trip ? (
        <p className="text-gray-500">❌ Trip not found.</p>
      ) : (
        <div className="bg-white p-4 shadow rounded space-y-2">
          <p>
            <strong>From:</strong> {trip.from || trip.fromText || "—"}
          </p>
          <p>
            <strong>To:</strong> {trip.to || trip.toText || "—"}
          </p>

          {/* If you store coordinates, show quick map links */}
          {(trip.fromCoords?.length === 2 || trip.toCoords?.length === 2) && (
            <p className="text-sm">
              {trip.fromCoords?.length === 2 && (
                <>
                  <strong>From Coords:</strong>{" "}
                  <a
                    className="text-blue-700 underline"
                    href={`https://www.google.com/maps?q=${trip.fromCoords[1]},${trip.fromCoords[0]}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>{" "}
                </>
              )}
              {trip.toCoords?.length === 2 && (
                <>
                  <strong>To Coords:</strong>{" "}
                  <a
                    className="text-blue-700 underline"
                    href={`https://www.google.com/maps?q=${trip.toCoords[1]},${trip.toCoords[0]}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                </>
              )}
            </p>
          )}

          <p>
            <strong>Date:</strong> {fmtDate(trip.date)}
          </p>
          <p>
            <strong>Time:</strong> {fmtTime(trip.time)}
          </p>

          <p>
            <strong>Seats:</strong> {trip.totalSeats ?? "—"}
          </p>
          <p>
            <strong>Available:</strong> {trip.availableSeats ?? "—"}
          </p>

          <p>
            <strong>Fare:</strong> ৳{Number(trip.fare ?? 0).toLocaleString()}
          </p>

          <p>
            <strong>Driver:</strong>{" "}
            {trip.driver?.name ? (
              <>
                {trip.driver.name}{" "}
                <span className="text-gray-600">
                  ({trip.driver.email || "—"})
                </span>
              </>
            ) : (
              "—"
            )}
          </p>

          <p>
            <strong>Vehicle:</strong> {trip.vehicleType || "—"}
            {trip.vehicleNumber ? ` - ${trip.vehicleNumber}` : ""}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {trip.isCancelled ? (
              <span className="text-red-600 font-semibold">❌ Cancelled</span>
            ) : (
              <span className="text-green-700 font-semibold">✅ Active</span>
            )}
          </p>

          {/* Optional quick link to admin trip page in your router */}
          {trip._id && (
            <p className="text-sm">
              <strong>ID:</strong> <span className="font-mono">{trip._id}</span>{" "}
              <Link
                to={`/admin/trips/${trip._id}`}
                className="text-blue-700 underline"
              >
                Permalink
              </Link>
            </p>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminTripDetails;
