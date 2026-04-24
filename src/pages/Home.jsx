// // Home.jsx (Premium Teal / Airbnb-ish + Loading + Empty state + Better pagination)
// // Keeps your existing components + hover->map sync behavior intact.
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import axios from "axios";
// import ListingCard from "../components/ListingCard";
// import MapSection from "../components/MapSection";
// import HeroBanner from "../components/HeroBanner";
// import Sidebar from "../components/Sidebar";
// import { Home as HomeIcon, Info, Loader2 } from "lucide-react";

// const Home = () => {
//   const [listings, setListings] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [selectedFilters, setSelectedFilters] = useState([]);
//   const [hoveredId, setHoveredId] = useState(null);

//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const listingRefs = useRef({});

//   // ✅ Clean old /listings query edge-case
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     if (params.get("guests") === "1" && params.get("page") === "1") {
//       window.history.replaceState({}, "", "/listings");
//     }
//   }, []);

//   // Fetch listings by page
//   useEffect(() => {
//     let alive = true;

//     const fetch = async () => {
//       try {
//         setLoading(true);
//         const res = await axios.get(
//           `${import.meta.env.VITE_API_URL}/api/listings`,
//           {
//             params: { page: currentPage, limit: 12 },
//           },
//         );

//         const next = res?.data?.listings || [];
//         if (!alive) return;

//         setListings(next);
//         setFiltered(next);
//         setTotalPages(res?.data?.totalPages || 1);
//       } catch (err) {
//         console.error("❌ Failed to fetch listings", err);
//         if (!alive) return;
//         setListings([]);
//         setFiltered([]);
//         setTotalPages(1);
//       } finally {
//         if (alive) setLoading(false);
//       }
//     };

//     fetch();
//     return () => {
//       alive = false;
//     };
//   }, [currentPage]);

//   // Search + tags filter
//   const handleSearch = (query = "", filters = selectedFilters) => {
//     const searchText = (query || "").toLowerCase();

//     const result = listings.filter((l) => {
//       const matchesText = [l.title, l.district, l.division].some((v) =>
//         (v || "").toLowerCase().includes(searchText),
//       );

//       const matchesFilters =
//         filters.length === 0 ||
//         filters.every((f) =>
//           (l.tags || [])
//             .map((t) => String(t).toLowerCase())
//             .includes(String(f).toLowerCase()),
//         );

//       return matchesText && matchesFilters;
//     });

//     setFiltered(result);
//   };

//   // Premium pagination window: show max 7 buttons with dots
//   const pageNumbers = useMemo(() => {
//     const maxButtons = 7;
//     const pages = [];
//     if (totalPages <= maxButtons) {
//       for (let p = 1; p <= totalPages; p++) pages.push(p);
//       return pages;
//     }

//     const left = Math.max(1, currentPage - 2);
//     const right = Math.min(totalPages, currentPage + 2);

//     pages.push(1);
//     if (left > 2) pages.push("…");

//     for (let p = left; p <= right; p++) {
//       if (p !== 1 && p !== totalPages) pages.push(p);
//     }

//     if (right < totalPages - 1) pages.push("…");
//     pages.push(totalPages);

//     return pages;
//   }, [totalPages, currentPage]);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
//       <HeroBanner />

//       {/* Premium marquee */}
//       <section className="overflow-hidden border-y border-emerald-200 bg-gradient-to-r from-emerald-50 via-slate-50 to-emerald-50">
//         <div className="whitespace-nowrap py-3">
//           <div className="inline-flex items-center animate-marquee text-emerald-800 font-medium text-sm sm:text-base tracking-wide px-6 gap-10">
//             <span>Where serenity meets simplicity</span>
//             <span>Crafted stays inspired by Bangladeshi heritage</span>
//             <span>Nature-led living, thoughtfully curated</span>
//             <span>Retreat into clay walls and handcrafted spaces</span>
//             <span>Experience stillness in its purest form</span>
//             <span>Where every stay begins with warmth</span>
//             <span>Discover the art of slow travel</span>
//             <span>A journey shaped by culture, comfort, and calm</span>
//             <span>Welcome to a new chapter of hospitality</span>
//           </div>
//         </div>
//       </section>

//       {/* Map section */}
//       {!loading && filtered.length > 0 && (
//         <MapSection
//           items={filtered}
//           activeTab="stay"
//           hoveredId={hoveredId}
//           listingRefs={listingRefs}
//         />
//       )}

//       {/* Main */}
//       <div className="px-4 lg:px-10 py-10">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
//             <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 via-cyan-500/10 to-emerald-500/10" />
//             <div className="relative p-7 md:p-10">
//               <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
//                 <div>
//                   <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
//                     <HomeIcon size={16} />
//                     Explore stays
//                   </div>

//                   <h2 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
//                     All Listings
//                   </h2>

//                   <p className="mt-2 text-gray-600">
//                     Browse curated stays — hover a listing to highlight its map
//                     marker.
//                   </p>

//                   <div className="mt-4 inline-flex items-center rounded-full bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 text-sm font-semibold">
//                     {filtered.length} listing{filtered.length !== 1 ? "s" : ""}{" "}
//                     shown
//                   </div>
//                 </div>

//                 <div className="text-sm text-gray-600">
//                   Page{" "}
//                   <span className="font-semibold text-gray-900">
//                     {currentPage}
//                   </span>{" "}
//                   of{" "}
//                   <span className="font-semibold text-gray-900">
//                     {totalPages}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="mt-8 flex flex-col lg:flex-row gap-6">
//             {/* Sidebar */}
//             <Sidebar
//               selectedFilters={selectedFilters}
//               onFilterChange={(filters) => {
//                 setSelectedFilters(filters);
//                 handleSearch("", filters);
//               }}
//             />

//             {/* Listings */}
//             <div className="flex-grow">
//               <section className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
//                 <div className="px-6 py-5 border-b border-gray-100">
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     Stays near you
//                   </h3>
//                   <p className="text-sm text-gray-600 mt-1">
//                     Use filters to discover unique cultural stays.
//                   </p>
//                 </div>

//                 <div className="p-6">
//                   {loading ? (
//                     <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-10 flex flex-col items-center justify-center gap-3">
//                       <Loader2
//                         className="animate-spin text-teal-700"
//                         size={26}
//                       />
//                       <p className="text-gray-600">Loading listings…</p>
//                     </div>
//                   ) : filtered.length > 0 ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//                       {filtered.map((listing) => (
//                         <div
//                           key={listing._id}
//                           ref={(el) => (listingRefs.current[listing._id] = el)}
//                           onMouseEnter={() => setHoveredId(listing._id)}
//                           onMouseLeave={() => setHoveredId(null)}
//                         >
//                           <ListingCard listing={listing} />
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-10 text-center">
//                       <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
//                         <Info className="text-teal-700" size={22} />
//                       </div>
//                       <h3 className="mt-4 text-lg font-semibold text-gray-900">
//                         No listings found
//                       </h3>
//                       <p className="mt-1 text-gray-600">
//                         Try removing filters or searching a different area.
//                       </p>
//                     </div>
//                   )}

//                   {/* Pagination */}
//                   {!loading && totalPages > 1 && (
//                     <div className="mt-10 flex flex-wrap justify-center items-center gap-2 text-sm">
//                       <button
//                         onClick={() =>
//                           setCurrentPage((prev) => Math.max(prev - 1, 1))
//                         }
//                         disabled={currentPage === 1}
//                         className="rounded-full px-4 py-2 font-semibold bg-white text-teal-700 ring-1 ring-teal-200 shadow-sm hover:bg-teal-50 active:scale-[0.99] disabled:opacity-50 disabled:ring-slate-200 disabled:text-slate-500 disabled:hover:bg-white transition"
//                       >
//                         ◀ Prev
//                       </button>

//                       {pageNumbers.map((p, idx) => {
//                         if (p === "…") {
//                           return (
//                             <span
//                               key={`dots-${idx}`}
//                               className="px-2 text-slate-500"
//                             >
//                               …
//                             </span>
//                           );
//                         }
//                         const page = p;
//                         const isActive = currentPage === page;
//                         return (
//                           <button
//                             key={page}
//                             onClick={() => setCurrentPage(page)}
//                             className={`rounded-full px-4 py-2 font-semibold ring-1 shadow-sm transition ${
//                               isActive
//                                 ? "bg-teal-600 text-white ring-teal-600"
//                                 : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
//                             }`}
//                           >
//                             {page}
//                           </button>
//                         );
//                       })}

//                       <button
//                         onClick={() =>
//                           setCurrentPage((prev) =>
//                             Math.min(prev + 1, totalPages),
//                           )
//                         }
//                         disabled={currentPage === totalPages}
//                         className="rounded-full px-4 py-2 font-semibold bg-teal-600 text-white shadow-sm hover:bg-teal-700 active:scale-[0.99] disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-500 disabled:hover:bg-slate-200 transition"
//                       >
//                         Next ▶
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </section>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import ListingCard from "../components/ListingCard";
import MapSection from "../components/MapSection";
import HeroBanner from "../components/HeroBanner";
import Sidebar from "../components/Sidebar";
import {
  Home as HomeIcon,
  Info,
  Loader2,
  Sparkles,
  Compass,
  MapPinned,
} from "lucide-react";

const Home = () => {
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const listingRefs = useRef({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("guests") === "1" && params.get("page") === "1") {
      window.history.replaceState({}, "", "/listings");
    }
  }, []);

  useEffect(() => {
    let alive = true;

    const fetchListings = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/listings`,
          {
            params: { page: currentPage, limit: 12 },
          },
        );

        if (!alive) return;

        const nextListings = res?.data?.listings || [];
        setListings(nextListings);
        setFiltered(nextListings);
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

    fetchListings();

    return () => {
      alive = false;
    };
  }, [currentPage]);

  const handleSearch = (query = "", filters = selectedFilters) => {
    const searchText = (query || "").toLowerCase();

    const result = listings.filter((listing) => {
      const matchesText = [
        listing.title,
        listing.district,
        listing.division,
      ].some((value) => (value || "").toLowerCase().includes(searchText));

      const matchesFilters =
        filters.length === 0 ||
        filters.every((filterValue) =>
          (listing.tags || [])
            .map((tag) => String(tag).toLowerCase())
            .includes(String(filterValue).toLowerCase()),
        );

      return matchesText && matchesFilters;
    });

    setFiltered(result);
  };

  const pageNumbers = useMemo(() => {
    const maxButtons = 7;
    const pages = [];

    if (totalPages <= maxButtons) {
      for (let page = 1; page <= totalPages; page += 1) pages.push(page);
      return pages;
    }

    const left = Math.max(1, currentPage - 2);
    const right = Math.min(totalPages, currentPage + 2);

    pages.push(1);
    if (left > 2) pages.push("…");

    for (let page = left; page <= right; page += 1) {
      if (page !== 1 && page !== totalPages) pages.push(page);
    }

    if (right < totalPages - 1) pages.push("…");
    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-teal-50/20">
      <HeroBanner />

      {/* Premium brand ribbon */}
      <section className="overflow-hidden border-y border-emerald-100 bg-gradient-to-r from-emerald-50/80 via-white to-cyan-50/80">
        <div className="whitespace-nowrap py-3.5">
          <div className="inline-flex animate-marquee items-center gap-10 px-6 text-sm font-medium tracking-wide text-emerald-900 sm:text-base">
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

      {/* Premium map section */}
      {!loading && filtered.length > 0 && (
        <section className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent" />
          <MapSection
            items={filtered}
            activeTab="stay"
            hoveredId={hoveredId}
            listingRefs={listingRefs}
          />
        </section>
      )}

      <div className="px-4 py-10 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-7xl">
          {/* Premium page intro */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-cyan-400/10 to-emerald-400/10" />
            <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-emerald-300/10 blur-3xl" />

            <div className="relative p-7 md:p-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/90 px-3.5 py-1.5 text-sm font-semibold text-teal-700 shadow-sm">
                    <Sparkles size={16} />
                    Curated stays across Bangladesh
                  </div>

                  <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] text-slate-950 md:text-4xl">
                    Discover premium stays with local soul
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 md:text-base">
                    Browse handpicked homes, resorts, eco retreats, and
                    culturally inspired stays. Hover a listing to highlight its
                    location on the map and explore Bangladesh with confidence.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                      <Compass className="h-3.5 w-3.5 text-teal-600" />
                      Verified hosts
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                      <MapPinned className="h-3.5 w-3.5 text-cyan-600" />
                      Map-linked browsing
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                      <HomeIcon className="h-3.5 w-3.5 text-emerald-600" />
                      Cultural + modern stays
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 md:items-end">
                  <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Results
                    </p>
                    <p className="mt-1 text-xl font-black text-slate-950">
                      {filtered.length}
                    </p>
                    <p className="text-xs text-slate-500">
                      listing{filtered.length !== 1 ? "s" : ""} visible
                    </p>
                  </div>

                  <div className="text-sm text-slate-600">
                    Page{" "}
                    <span className="font-semibold text-slate-900">
                      {currentPage}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-900">
                      {totalPages}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-6 lg:flex-row">
            {/* Sidebar */}
            <div className="lg:w-[290px] xl:w-[320px]">
              <Sidebar
                selectedFilters={selectedFilters}
                onFilterChange={(filters) => {
                  setSelectedFilters(filters);
                  handleSearch("", filters);
                }}
              />
            </div>

            {/* Listings area */}
            <div className="flex-1">
              <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <div className="border-b border-slate-100 bg-gradient-to-r from-white via-slate-50 to-white px-6 py-5">
                  <h3 className="text-lg font-bold tracking-tight text-slate-950">
                    Stays near you
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Use filters to discover unique homes, nature escapes, and
                    locally inspired accommodations.
                  </p>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-10 text-center shadow-sm">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 ring-1 ring-teal-100">
                        <Loader2
                          className="animate-spin text-teal-700"
                          size={28}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          Loading listings
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Fetching the best stays for you...
                        </p>
                      </div>
                    </div>
                  ) : filtered.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filtered.map((listing) => (
                          <div
                            key={listing._id}
                            ref={(el) => {
                              listingRefs.current[listing._id] = el;
                            }}
                            onMouseEnter={() => setHoveredId(listing._id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className="transition-transform duration-200 hover:-translate-y-1"
                          >
                            <ListingCard listing={listing} />
                          </div>
                        ))}
                      </div>

                      {!loading && totalPages > 1 && (
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 text-sm">
                          <button
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            ◀ Prev
                          </button>

                          {pageNumbers.map((page, idx) => {
                            if (page === "…") {
                              return (
                                <span
                                  key={`dots-${idx}`}
                                  className="px-2 text-slate-400"
                                >
                                  …
                                </span>
                              );
                            }

                            const isActive = currentPage === page;

                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`rounded-full px-4 py-2 font-semibold shadow-sm ring-1 transition ${
                                  isActive
                                    ? "bg-gradient-to-r from-teal-600 to-cyan-500 text-white ring-teal-600"
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
                            className="rounded-full bg-gradient-to-r from-teal-600 to-cyan-500 px-4 py-2 font-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                          >
                            Next ▶
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-10 text-center shadow-sm">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50">
                        <Info className="text-teal-700" size={24} />
                      </div>

                      <h3 className="mt-4 text-lg font-bold text-slate-950">
                        No listings found
                      </h3>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                        Try removing some filters, changing the district, or
                        exploring a different area to discover more stays.
                      </p>
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
