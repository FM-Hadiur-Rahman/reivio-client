// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import DatePicker from "react-datepicker";
// import { useTranslation } from "react-i18next";
// import i18n from "i18next";
// import "react-datepicker/dist/react-datepicker.css";
// import { divisions } from "../data/districts";
// import {
//   MapPin,
//   Users,
//   Calendar,
//   Search,
//   Tag,
//   SlidersHorizontal,
//   Crosshair,
// } from "lucide-react";

// const SearchBar = () => {
//   const navigate = useNavigate();
//   const { t } = useTranslation();

//   const [division, setDivision] = useState("");
//   const [district, setDistrict] = useState("");
//   const [checkIn, setCheckIn] = useState(null);
//   const [checkOut, setCheckOut] = useState(null);
//   const [guests, setGuests] = useState(1);
//   const [keyword, setKeyword] = useState("");
//   const [tags, setTags] = useState([]);
//   const [sortBy, setSortBy] = useState("");
//   const [useGeo, setUseGeo] = useState(false);
//   const [coords, setCoords] = useState({ lat: null, lng: null });
//   const [radius, setRadius] = useState(10);
//   const [showMobileFilters, setShowMobileFilters] = useState(false);

//   const availableTags = ["AC", "Sea View", "Wifi", "Resort", "Family Friendly"];
//   const districts = division ? divisions[division] : [];

//   const detectLocation = () => {
//     if (!navigator.geolocation) return alert("Geolocation is not supported");
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
//         setUseGeo(true);
//       },
//       () => alert("Failed to detect location")
//     );
//   };

//   const toBanglaNumber = (num) => {
//     const map = {
//       0: "০",
//       1: "১",
//       2: "২",
//       3: "৩",
//       4: "৪",
//       5: "৫",
//       6: "৬",
//       7: "৭",
//       8: "৮",
//       9: "৯",
//     };
//     return num
//       .toString()
//       .split("")
//       .map((d) => map[d] || d)
//       .join("");
//   };

//   const handleSearch = () => {
//     const params = new URLSearchParams();
//     if (district) params.append("location", district);
//     if (checkIn) params.append("from", checkIn.toISOString());
//     if (checkOut) params.append("to", checkOut.toISOString());
//     if (guests && guests !== 1) params.append("guests", guests);
//     if (keyword) params.append("keyword", keyword);
//     if (tags.length > 0) params.append("tags", tags.join(","));
//     if (sortBy) params.append("sortBy", sortBy);
//     if (useGeo && coords.lat && coords.lng) {
//       params.append("lat", coords.lat);
//       params.append("lng", coords.lng);
//       params.append("radius", radius);
//     }
//     params.append("page", 1);
//     navigate(`/listings?${params.toString()}`);
//   };

//   return (
//     <div className="bg-white shadow px-4 py-3 max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
//       {/* Location Dropdowns */}
//       <div className="flex items-center gap-2">
//         <MapPin size={18} />
//         <select
//           value={division}
//           onChange={(e) => {
//             setDivision(e.target.value);
//             setDistrict("");
//           }}
//           className="bg-gray-100 rounded-full px-4 py-2 text-sm"
//         >
//           <option value="">{t("search.select_division")}</option>
//           {Object.keys(divisions).map((d) => (
//             <option key={d} value={d}>
//               {t(`division.${d}`)}
//             </option>
//           ))}
//         </select>
//         <select
//           value={district}
//           onChange={(e) => setDistrict(e.target.value)}
//           className="bg-gray-100 rounded-full px-4 py-2 text-sm"
//         >
//           <option value="">{t("search.select_district")}</option>
//           {districts.map((d) => (
//             <option key={d} value={d}>
//               {t(`district.${d}`)}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Dates */}
//       <div className="flex items-center gap-2">
//         <Calendar size={18} />
//         <DatePicker
//           selected={checkIn}
//           onChange={(date) => setCheckIn(date)}
//           placeholderText={t("search.check_in")}
//           className="bg-gray-100 rounded-full px-4 py-2 text-sm w-28"
//         />
//         <DatePicker
//           selected={checkOut}
//           onChange={(date) => setCheckOut(date)}
//           placeholderText={t("search.check_out")}
//           className="bg-gray-100 rounded-full px-4 py-2 text-sm w-28"
//         />
//       </div>

//       {/* Guests */}
//       <div className="flex items-center gap-2">
//         <Users size={18} />
//         <input
//           type="text"
//           inputMode="numeric"
//           pattern="[0-9]*"
//           value={i18n.language === "bn" ? toBanglaNumber(guests) : guests}
//           onChange={(e) => {
//             const raw = e.target.value.replace(/[^\d]/g, "");
//             setGuests(Number(raw));
//           }}
//           className="bg-gray-100 rounded-full px-4 py-2 text-sm w-16"
//         />
//       </div>

//       {/* Keyword */}
//       <input
//         type="text"
//         value={keyword}
//         onChange={(e) => setKeyword(e.target.value)}
//         placeholder={t("search.add_keyword")}
//         className="bg-gray-100 rounded-full px-4 py-2 text-sm"
//       />

//       {/* Mobile drawer toggle */}
//       <button
//         className="lg:hidden flex items-center gap-1 px-4 py-2 rounded-full bg-gray-100 text-sm"
//         onClick={() => setShowMobileFilters(true)}
//       >
//         <SlidersHorizontal size={16} /> {t("search.filters")}
//       </button>

//       {/* Tags (desktop) */}
//       <div className="hidden lg:flex items-center gap-2">
//         <Tag size={18} />
//         {availableTags.map((tag) => (
//           <label key={tag} className="text-xs flex gap-1 items-center">
//             <input
//               type="checkbox"
//               value={tag}
//               checked={tags.includes(tag)}
//               onChange={() =>
//                 setTags((prev) =>
//                   prev.includes(tag)
//                     ? prev.filter((t) => t !== tag)
//                     : [...prev, tag]
//                 )
//               }
//               className="accent-rose-500"
//             />
//             {tag}
//           </label>
//         ))}
//       </div>

//       {/* Sort */}
//       <select
//         value={sortBy}
//         onChange={(e) => setSortBy(e.target.value)}
//         className="bg-gray-100 rounded-full px-4 py-2 text-sm"
//       >
//         <option value="">{t("search.default_sort")}</option>
//         <option value="priceAsc">{t("search.price_low_high")}</option>
//         <option value="priceDesc">{t("search.price_high_low")}</option>
//         <option value="rating">{t("search.rating")}</option>
//         <option value="popular">{t("search.popular")}</option>
//       </select>

//       {/* Use My Location */}
//       <button
//         onClick={detectLocation}
//         className="flex items-center gap-1 text-sm px-3 py-2 rounded-full bg-gray-100"
//       >
//         <Crosshair size={14} /> {t("search.use_location")}
//       </button>
//       {useGeo && (
//         <input
//           type="number"
//           min={1}
//           value={radius}
//           onChange={(e) => setRadius(Number(e.target.value))}
//           placeholder="Radius (km)"
//           className="bg-gray-100 rounded-full px-4 py-2 text-sm w-24"
//         />
//       )}

//       {/* Search Button */}
//       <button
//         onClick={handleSearch}
//         className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-5 py-2 flex items-center gap-2 text-sm font-medium"
//       >
//         <Search size={16} /> {t("search.search_btn")}
//       </button>

//       {/* Mobile Filter Drawer */}
//       {showMobileFilters && (
//         <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-end lg:hidden">
//           <div className="bg-white w-full rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto shadow-xl">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold">{t("search.filters")}</h2>
//               <button
//                 onClick={() => setShowMobileFilters(false)}
//                 className="text-gray-500 text-sm"
//               >
//                 ✖ Close
//               </button>
//             </div>

//             {/* Tags */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-2">
//                 {t("search.tags")}
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {availableTags.map((tag) => (
//                   <label key={tag} className="flex items-center gap-1 text-sm">
//                     <input
//                       type="checkbox"
//                       value={tag}
//                       checked={tags.includes(tag)}
//                       onChange={() =>
//                         setTags((prev) =>
//                           prev.includes(tag)
//                             ? prev.filter((t) => t !== tag)
//                             : [...prev, tag]
//                         )
//                       }
//                       className="accent-rose-500"
//                     />
//                     {tag}
//                   </label>
//                 ))}
//               </div>
//             </div>

//             {/* Keyword */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-1">
//                 {t("search.keyword")}
//               </label>
//               <input
//                 type="text"
//                 value={keyword}
//                 onChange={(e) => setKeyword(e.target.value)}
//                 placeholder={t("search.add_keyword")}
//                 className="w-full border rounded px-3 py-2 text-sm"
//               />
//             </div>

//             {/* Sort By */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-1">
//                 {t("search.sort_by")}
//               </label>
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="w-full border rounded px-3 py-2 text-sm"
//               >
//                 <option value="">{t("search.default_sort")}</option>
//                 <option value="priceAsc">{t("search.price_low_high")}</option>
//                 <option value="priceDesc">{t("search.price_high_low")}</option>
//                 <option value="rating">{t("search.rating")}</option>
//                 <option value="popular">{t("search.popular")}</option>
//               </select>
//             </div>

//             {/* Radius + Use My Location */}
//             <div className="mb-4">
//               <button
//                 onClick={detectLocation}
//                 className="bg-blue-500 text-white px-4 py-1 rounded text-sm mb-2"
//               >
//                 📍 {t("search.use_my_location")}
//               </button>
//               {useGeo && (
//                 <div className="flex items-center gap-2">
//                   <label className="text-sm">Radius (km):</label>
//                   <input
//                     type="number"
//                     min="1"
//                     value={radius}
//                     onChange={(e) => setRadius(Number(e.target.value))}
//                     className="w-20 border rounded px-2 py-1 text-sm"
//                   />
//                 </div>
//               )}
//             </div>

//             {/* Apply Button */}
//             <button
//               onClick={() => {
//                 setShowMobileFilters(false);
//                 handleSearch();
//               }}
//               className="bg-rose-500 w-full text-white py-2 rounded font-semibold"
//             >
//               {t("search.search_btn")}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SearchBar;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import "react-datepicker/dist/react-datepicker.css";
import { divisions } from "../data/districts";
import {
  MapPin,
  Users,
  Calendar,
  Search,
  Tag,
  SlidersHorizontal,
  Crosshair,
  X,
} from "lucide-react";

const SearchBar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [tags, setTags] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [useGeo, setUseGeo] = useState(false);
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [radius, setRadius] = useState(10);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const availableTags = ["AC", "Sea View", "Wifi", "Resort", "Family Friendly"];
  const districts = division ? divisions[division] : [];

  // Small helper so we don't see raw i18n keys if missing
  const safeT = (key, fallback) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation is not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setUseGeo(true);
      },
      () => alert("Failed to detect location")
    );
  };

  const toBanglaNumber = (num) => {
    const map = {
      0: "০",
      1: "১",
      2: "২",
      3: "৩",
      4: "৪",
      5: "৫",
      6: "৬",
      7: "৭",
      8: "৮",
      9: "৯",
    };
    return num
      .toString()
      .split("")
      .map((d) => map[d] || d)
      .join("");
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (district) params.append("location", district);
    if (checkIn) params.append("from", checkIn.toISOString());
    if (checkOut) params.append("to", checkOut.toISOString());
    if (guests && guests !== 1) params.append("guests", guests);
    if (keyword) params.append("keyword", keyword);
    if (tags.length > 0) params.append("tags", tags.join(","));
    if (sortBy) params.append("sortBy", sortBy);
    if (useGeo && coords.lat && coords.lng) {
      params.append("lat", coords.lat);
      params.append("lng", coords.lng);
      params.append("radius", radius);
    }
    params.append("page", 1);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <>
      {/* CARD WRAPPER */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/95 backdrop-blur border border-slate-100 rounded-[26px] px-4 sm:px-5 py-3 sm:py-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          {/* ROW 1 – MAIN STRIP */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Location segment */}
            <div className="flex items-center gap-2 flex-[1.4] min-w-[220px] bg-slate-50 rounded-full px-3 sm:px-4 py-2 border border-slate-100 hover:border-teal-500/70 transition-colors">
              <MapPin size={18} className="text-slate-500 hidden sm:block" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 w-full">
                <select
                  value={division}
                  onChange={(e) => {
                    setDivision(e.target.value);
                    setDistrict("");
                  }}
                  className="bg-transparent outline-none text-xs sm:text-sm flex-1"
                >
                  <option value="">
                    {safeT("search.select_division", "Select Division")}
                  </option>
                  {Object.keys(divisions).map((d) => (
                    <option key={d} value={d}>
                      {t(`division.${d}`)}
                    </option>
                  ))}
                </select>
                <span className="hidden sm:inline h-4 w-px bg-slate-200" />
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="bg-transparent outline-none text-xs sm:text-sm flex-1"
                >
                  <option value="">
                    {safeT("search.select_district", "Select District")}
                  </option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {t(`district.${d}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date segment */}
            <div className="flex items-center gap-2 flex-[1.1] min-w-[200px] bg-slate-50 rounded-full px-3 sm:px-4 py-2 border border-slate-100 hover:border-teal-500/70 transition-colors">
              <Calendar size={18} className="text-slate-500 hidden sm:block" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 w-full">
                <DatePicker
                  selected={checkIn}
                  onChange={(date) => setCheckIn(date)}
                  placeholderText={safeT("search.check_in", "Check-In")}
                  className="bg-transparent outline-none text-xs sm:text-sm w-full sm:w-24"
                />
                <span className="hidden sm:inline h-4 w-px bg-slate-200" />
                <DatePicker
                  selected={checkOut}
                  onChange={(date) => setCheckOut(date)}
                  placeholderText={safeT("search.check_out", "Check-Out")}
                  className="bg-transparent outline-none text-xs sm:text-sm w-full sm:w-24"
                />
              </div>
            </div>

            {/* Guests segment */}
            <div className="flex items-center gap-2 flex-[0.65] min-w-[140px] bg-slate-50 rounded-full px-3 sm:px-4 py-2 border border-slate-100 hover:border-teal-500/70 transition-colors">
              <Users size={18} className="text-slate-500 hidden sm:block" />
              <div className="flex items-center justify-between w-full">
                <span className="text-[0.7rem] sm:text-xs font-semibold tracking-wide uppercase text-slate-400">
                  {safeT("search.guests", "Guests")}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={
                    i18n.language === "bn" ? toBanglaNumber(guests) : guests
                  }
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, "");
                    setGuests(Number(raw || 1));
                  }}
                  className="bg-transparent outline-none text-sm w-10 text-right"
                />
              </div>
            </div>

            {/* Search button segment */}
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 via-teal-500 to-emerald-400 text-white rounded-full px-4 sm:px-6 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:brightness-105 transition-all flex-[0.6] min-w-[120px]"
            >
              <Search size={16} />
              <span>{safeT("search.search_btn", "Search")}</span>
            </button>
          </div>

          {/* ROW 2 – ADVANCED OPTIONS */}
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-[0.8rem] text-slate-500">
            {/* Keyword */}
            <div className="flex items-center flex-1 min-w-[180px] bg-slate-50 rounded-full px-3 py-1.5 border border-slate-100 hover:border-teal-400 transition-colors">
              <Search size={14} className="mr-1.5 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={safeT("search.add_keyword", "Add keyword")}
                className="bg-transparent outline-none w-full"
              />
            </div>

            {/* Tags (desktop) */}
            <div className="hidden lg:flex items-center gap-2 flex-[1.2]">
              <Tag size={14} className="text-slate-400" />
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag]
                      )
                    }
                    className={`px-3 py-1 rounded-full border text-[0.7rem] ${
                      tags.includes(tag)
                        ? "bg-teal-50 border-teal-400 text-teal-700"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-300"
                    } transition-colors`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile filters button */}
            <button
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[0.75rem]"
              onClick={() => setShowMobileFilters(true)}
            >
              <SlidersHorizontal size={14} />
              {safeT("search.filters", "Filters")}
            </button>

            {/* Sort */}
            <div className="flex items-center bg-slate-50 rounded-full px-3 py-1.5 border border-slate-100">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none text-[0.75rem]"
              >
                <option value="">
                  {safeT("search.default_sort", "Recommended")}
                </option>
                <option value="priceAsc">
                  {safeT("search.price_low_high", "Price: Low → High")}
                </option>
                <option value="priceDesc">
                  {safeT("search.price_high_low", "Price: High → Low")}
                </option>
                <option value="rating">
                  {safeT("search.rating", "Top rated")}
                </option>
                <option value="popular">
                  {safeT("search.popular", "Most popular")}
                </option>
              </select>
            </div>

            {/* Geo radius */}
            <div className="flex items-center gap-2">
              <button
                onClick={detectLocation}
                className="inline-flex items-center gap-1.5 text-[0.75rem] px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-slate-600 transition-colors"
              >
                <Crosshair size={13} />
                {safeT("search.use_location", "Use my location")}
              </button>
              {useGeo && (
                <input
                  type="number"
                  min={1}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  placeholder="10km"
                  className="bg-slate-50 rounded-full px-3 py-1.5 text-[0.75rem] border border-slate-100 w-20 outline-none"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE FILTER SHEET (same logic, nicer header) */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-end lg:hidden">
          <div className="bg-white w-full rounded-t-3xl p-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold">
                {safeT("search.filters", "Filters")}
              </h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                {safeT("search.tags", "Tags")}
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag]
                      )
                    }
                    className={`px-3 py-1 rounded-full text-xs border ${
                      tags.includes(tag)
                        ? "bg-teal-50 border-teal-400 text-teal-700"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-300"
                    } transition-colors`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyword */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {safeT("search.keyword", "Keyword")}
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={safeT("search.add_keyword", "Add keyword")}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {/* Sort By */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {safeT("search.sort_by", "Sort by")}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="">
                  {safeT("search.default_sort", "Recommended")}
                </option>
                <option value="priceAsc">
                  {safeT("search.price_low_high", "Price: Low → High")}
                </option>
                <option value="priceDesc">
                  {safeT("search.price_high_low", "Price: High → Low")}
                </option>
                <option value="rating">
                  {safeT("search.rating", "Top rated")}
                </option>
                <option value="popular">
                  {safeT("search.popular", "Most popular")}
                </option>
              </select>
            </div>

            {/* Radius + Use My Location */}
            <div className="mb-6">
              <button
                onClick={detectLocation}
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-full text-sm mb-2 shadow-sm hover:bg-teal-700 transition-colors"
              >
                <Crosshair size={14} />
                {safeT("search.use_my_location", "Use my location")}
              </button>
              {useGeo && (
                <div className="flex items-center gap-2 mt-2">
                  <label className="text-sm text-slate-700">Radius (km):</label>
                  <input
                    type="number"
                    min="1"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              )}
            </div>

            {/* Apply Button */}
            <button
              onClick={() => {
                setShowMobileFilters(false);
                handleSearch();
              }}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-full font-semibold text-sm shadow-sm hover:shadow-md transition-all"
            >
              {safeT("search.search_btn", "Search")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;
