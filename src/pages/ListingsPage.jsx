// === ListingsPage.jsx ===
import React, { useEffect, useState } from "react";
import axios from "axios";
import ListingCard from "../components/ListingCard";
import SearchBar from "../components/SearchBar";
import { useSearchParams, useNavigate } from "react-router-dom";

const ListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const queryObj = Object.fromEntries([...searchParams.entries()]);
        const hasFilters = Object.keys(queryObj).length > 0;

        const url = `${import.meta.env.VITE_API_URL}/api/listings`;

        const res = hasFilters
          ? await axios.get(url, { params: queryObj })
          : await axios.get(url); // No filters → load all

        const data = res.data;
        if (Array.isArray(data.listings)) {
          setListings(data.listings);
          setPagination({
            currentPage: data.currentPage || 1,
            totalPages: data.totalPages || 1,
            totalCount: data.totalCount || data.listings.length,
          });
        } else {
          setListings([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch listings:", err);
        setListings([]);
      }
    };

    fetchListings();
  }, [searchParams]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage);
    params.set("limit", 12);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <SearchBar />

      <p className="text-sm text-gray-600 mt-4 text-center md:text-left">
        Showing page {pagination.currentPage} of {pagination.totalPages} (
        {pagination.totalCount} results)
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {listings.length > 0 ? (
          listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))
        ) : (
          <p className="text-center col-span-full text-gray-500">
            No listings match your search.
          </p>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-8 flex flex-wrap justify-center items-center gap-2 text-sm">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className={`px-3 py-1 rounded border ${
              pagination.currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            ⬅ Prev
          </button>

          {Array.from({ length: pagination.totalPages }, (_, idx) => {
            const page = idx + 1;
            const isActive = pagination.currentPage === page;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded border ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className={`px-3 py-1 rounded border ${
              pagination.currentPage === pagination.totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            Next ➡
          </button>
        </div>
      )}
    </div>
  );
};

export default ListingsPage;
