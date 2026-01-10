import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../services/api";

const AdminListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // row-level lock

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/listings");
      setListings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to fetch listings:", err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      setProcessingId(id);
      await api.patch(`/api/admin/listings/${id}/restore`);
      await fetchListings();
    } catch (err) {
      console.error("❌ Failed to restore listing:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to soft-delete this listing?")) return;
    try {
      setProcessingId(id);
      await api.patch(`/api/admin/listings/${id}/soft-delete`);
      await fetchListings();
    } catch (err) {
      console.error("❌ Failed to soft-delete listing:", err);
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-4">🏠 All Listings</h2>

      {loading ? (
        <p className="text-gray-500">Loading listings…</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm md:text-base">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left whitespace-nowrap">
                    Title
                  </th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">
                    Location
                  </th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">
                    Host
                  </th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map((l) => {
                  const isRowBusy = processingId === l._id;
                  return (
                    <tr
                      key={l._id}
                      className={`hover:bg-gray-50 ${
                        l.isDeleted ? "bg-red-50 text-gray-500" : ""
                      }`}
                    >
                      <td
                        className={`px-4 py-2 ${
                          l.isDeleted ? "line-through" : ""
                        }`}
                      >
                        {l.title}
                      </td>
                      <td className="px-4 py-2">
                        {l.location?.address ||
                          `${l.district || ""} ${l.division || ""}`}
                      </td>
                      <td className="px-4 py-2">
                        {l.hostId?.name}
                        <br />
                        <span className="text-xs text-gray-500">
                          {l.hostId?.email}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {l.isDeleted ? (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            Deleted
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {l.isDeleted ? (
                          <button
                            onClick={() => handleRestore(l._id)}
                            className="text-green-600 hover:underline disabled:opacity-50"
                            disabled={isRowBusy}
                          >
                            {isRowBusy ? "Restoring…" : "Restore"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDelete(l._id)}
                            className="text-red-500 hover:underline disabled:opacity-50"
                            disabled={isRowBusy}
                          >
                            {isRowBusy ? "Deleting…" : "Soft Delete"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {listings.length === 0 && (
            <p className="text-gray-500 italic mt-4">No listings found.</p>
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default AdminListings;
