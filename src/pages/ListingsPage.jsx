// === ListingsPage.jsx (Premium Teal / Airbnb-ish) ===
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ListingCard from "../components/ListingCard";
import SearchBar from "../components/SearchBar";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Home, Info, Loader2, RefreshCcw } from "lucide-react";

const ListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryObj = useMemo(
    () => Object.fromEntries([...searchParams.entries()]),
    [searchParams],
  );

  const hasFilters = useMemo(
    () => Object.keys(queryObj).length > 0,
    [queryObj],
  );

  const fetchListings = async () => {
    try {
      setLoading(true);

      const url = `${import.meta.env.VITE_API_URL}/api/listings`;
      const res = hasFilters
        ? await axios.get(url, { params: queryObj })
        : await axios.get(url);

      const data = res.data;

      if (Array.isArray(data.listings)) {
        setListings(data.listings);
        setPagination({
          currentPage: data.currentPage || 1,
          totalPages: data.totalPages || 1,
          totalCount: data.totalCount || data.listings.length,
        });
      } else if (Array.isArray(data)) {
        // fallback if backend returns plain array
        setListings(data);
        setPagination({
          currentPage: Number(queryObj.page || 1),
          totalPages: 1,
          totalCount: data.length,
        });
      } else {
        setListings([]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch listings:", err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    params.set("limit", "12");
    navigate(`/listings?${params.toString()}`);
  };

  const totalPages = pagination.totalPages || 1;
  const currentPage = pagination.currentPage || 1;

  // Premium pagination window: show max 7 buttons
  const pageNumbers = useMemo(() => {
    const maxButtons = 7;
    const pages = [];

    if (totalPages <= maxButtons) {
      for (let p = 1; p <= totalPages; p++) pages.push(p);
      return pages;
    }

    const left = Math.max(1, currentPage - 2);
    const right = Math.min(totalPages, currentPage + 2);

    pages.push(1);
    if (left > 2) pages.push("…");

    for (let p = left; p <= right; p++) {
      if (p !== 1 && p !== totalPages) pages.push(p);
    }

    if (right < totalPages - 1) pages.push("…");
    pages.push(totalPages);

    return pages;
  }, [totalPages, currentPage]);

  const clearFilters = () => {
    navigate("/listings");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 py-10 relative">
        {/* Premium background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
          <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />
        </div>

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 via-cyan-500/10 to-emerald-500/10" />
          <div className="relative p-7 md:p-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                  <Home size={16} />
                  Explore Stays
                </div>

                <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                  Listings
                </h1>

                <p className="mt-2 max-w-2xl text-gray-600">
                  Find the perfect stay — filter by location, date and guests.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 text-sm font-semibold">
                    {pagination.totalCount} result
                    {pagination.totalCount !== 1 ? "s" : ""}
                  </span>

                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center rounded-full bg-white text-gray-700 border border-gray-200 px-3 py-1 text-sm font-semibold hover:bg-gray-50"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={fetchListings}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-white font-semibold shadow-sm transition hover:bg-teal-700"
                title="Refresh listings"
              >
                <RefreshCcw size={18} />
                Refresh
              </button>
            </div>

            {/* SearchBar */}
            <div className="mt-6">
              <SearchBar />
            </div>

            {/* Result meta */}
            <p className="text-sm text-gray-600 mt-4">
              Showing page{" "}
              <span className="font-semibold text-gray-900">{currentPage}</span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">{totalPages}</span>{" "}
              ({pagination.totalCount} results)
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          {loading ? (
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-teal-700" size={26} />
              <p className="text-gray-600">Loading listings…</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-10 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                <Info className="text-teal-700" size={22} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No listings match your search
              </h3>
              <p className="mt-1 text-gray-600">
                Try adjusting your filters or clearing them.
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-5 rounded-2xl bg-teal-600 px-5 py-2.5 text-white font-semibold hover:bg-teal-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {listings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-10 flex flex-wrap justify-center items-center gap-2 text-sm">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-full px-4 py-2 font-semibold bg-white text-teal-700 ring-1 ring-teal-200 shadow-sm hover:bg-teal-50 active:scale-[0.99] disabled:opacity-50 disabled:ring-slate-200 disabled:text-slate-500 disabled:hover:bg-white transition"
            >
              ◀ Prev
            </button>

            {pageNumbers.map((p, idx) => {
              if (p === "…") {
                return (
                  <span key={`dots-${idx}`} className="px-2 text-slate-500">
                    …
                  </span>
                );
              }

              const page = p;
              const isActive = currentPage === page;

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`rounded-full px-4 py-2 font-semibold ring-1 shadow-sm transition ${
                    isActive
                      ? "bg-teal-600 text-white ring-teal-600"
                      : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-full px-4 py-2 font-semibold bg-teal-600 text-white shadow-sm hover:bg-teal-700 active:scale-[0.99] disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-500 disabled:hover:bg-slate-200 transition"
            >
              Next ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingsPage;
