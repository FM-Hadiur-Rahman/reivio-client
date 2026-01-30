// Home.jsx (Premium Teal / Airbnb-ish + Loading + Empty state + Better pagination)
// Keeps your existing components + hover->map sync behavior intact.
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import ListingCard from "../components/ListingCard";
import MapSection from "../components/MapSection";
import HeroBanner from "../components/HeroBanner";
import Sidebar from "../components/Sidebar";
import { Home as HomeIcon, Info, Loader2 } from "lucide-react";

const Home = () => {
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const listingRefs = useRef({});

  // ✅ Clean old /listings query edge-case
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("guests") === "1" && params.get("page") === "1") {
      window.history.replaceState({}, "", "/listings");
    }
  }, []);

  // Fetch listings by page
  useEffect(() => {
    let alive = true;

    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/listings`,
          {
            params: { page: currentPage, limit: 12 },
          },
        );

        const next = res?.data?.listings || [];
        if (!alive) return;

        setListings(next);
        setFiltered(next);
        setTotalPages(res?.data?.totalPages || 1);
      } catch (err) {
        console.error("❌ Failed to fetch listings", err);
        if (!alive) return;
        setListings([]);
        setFiltered([]);
        setTotalPages(1);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetch();
    return () => {
      alive = false;
    };
  }, [currentPage]);

  // Search + tags filter
  const handleSearch = (query = "", filters = selectedFilters) => {
    const searchText = (query || "").toLowerCase();

    const result = listings.filter((l) => {
      const matchesText = [l.title, l.district, l.division].some((v) =>
        (v || "").toLowerCase().includes(searchText),
      );

      const matchesFilters =
        filters.length === 0 ||
        filters.every((f) =>
          (l.tags || [])
            .map((t) => String(t).toLowerCase())
            .includes(String(f).toLowerCase()),
        );

      return matchesText && matchesFilters;
    });

    setFiltered(result);
  };

  // Premium pagination window: show max 7 buttons with dots
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <HeroBanner />

      {/* Premium marquee */}
      <section className="overflow-hidden border-y border-emerald-200 bg-gradient-to-r from-emerald-50 via-slate-50 to-emerald-50">
        <div className="whitespace-nowrap py-3">
          <div className="inline-flex items-center animate-marquee text-emerald-800 font-medium text-sm sm:text-base tracking-wide px-6 gap-10">
            <span>Where serenity meets simplicity</span>
            <span>Crafted stays inspired by Bangladeshi heritage</span>
            <span>Nature-led living, thoughtfully curated</span>
            <span>Retreat into clay walls and handcrafted spaces</span>
            <span>Experience stillness in its purest form</span>
            <span>Where every stay begins with warmth</span>
            <span>Discover the art of slow travel</span>
            <span>A journey shaped by culture, comfort, and calm</span>
            <span>Welcome to a new chapter of hospitality</span>
          </div>
        </div>
      </section>

      {/* Map section */}
      {!loading && filtered.length > 0 && (
        <MapSection
          items={filtered}
          activeTab="stay"
          hoveredId={hoveredId}
          listingRefs={listingRefs}
        />
      )}

      {/* Main */}
      <div className="px-4 lg:px-10 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 via-cyan-500/10 to-emerald-500/10" />
            <div className="relative p-7 md:p-10">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                    <HomeIcon size={16} />
                    Explore stays
                  </div>

                  <h2 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                    All Listings
                  </h2>

                  <p className="mt-2 text-gray-600">
                    Browse curated stays — hover a listing to highlight its map
                    marker.
                  </p>

                  <div className="mt-4 inline-flex items-center rounded-full bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 text-sm font-semibold">
                    {filtered.length} listing{filtered.length !== 1 ? "s" : ""}{" "}
                    shown
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  Page{" "}
                  <span className="font-semibold text-gray-900">
                    {currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {totalPages}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <Sidebar
              selectedFilters={selectedFilters}
              onFilterChange={(filters) => {
                setSelectedFilters(filters);
                handleSearch("", filters);
              }}
            />

            {/* Listings */}
            <div className="flex-grow">
              <section className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Stays near you
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Use filters to discover unique cultural stays.
                  </p>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-10 flex flex-col items-center justify-center gap-3">
                      <Loader2
                        className="animate-spin text-teal-700"
                        size={26}
                      />
                      <p className="text-gray-600">Loading listings…</p>
                    </div>
                  ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filtered.map((listing) => (
                        <div
                          key={listing._id}
                          ref={(el) => (listingRefs.current[listing._id] = el)}
                          onMouseEnter={() => setHoveredId(listing._id)}
                          onMouseLeave={() => setHoveredId(null)}
                        >
                          <ListingCard listing={listing} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-10 text-center">
                      <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                        <Info className="text-teal-700" size={22} />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-gray-900">
                        No listings found
                      </h3>
                      <p className="mt-1 text-gray-600">
                        Try removing filters or searching a different area.
                      </p>
                    </div>
                  )}

                  {/* Pagination */}
                  {!loading && totalPages > 1 && (
                    <div className="mt-10 flex flex-wrap justify-center items-center gap-2 text-sm">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="rounded-full px-4 py-2 font-semibold bg-white text-teal-700 ring-1 ring-teal-200 shadow-sm hover:bg-teal-50 active:scale-[0.99] disabled:opacity-50 disabled:ring-slate-200 disabled:text-slate-500 disabled:hover:bg-white transition"
                      >
                        ◀ Prev
                      </button>

                      {pageNumbers.map((p, idx) => {
                        if (p === "…") {
                          return (
                            <span
                              key={`dots-${idx}`}
                              className="px-2 text-slate-500"
                            >
                              …
                            </span>
                          );
                        }
                        const page = p;
                        const isActive = currentPage === page;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
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
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="rounded-full px-4 py-2 font-semibold bg-teal-600 text-white shadow-sm hover:bg-teal-700 active:scale-[0.99] disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-500 disabled:hover:bg-slate-200 transition"
                      >
                        Next ▶
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
