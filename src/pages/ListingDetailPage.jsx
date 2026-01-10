// ListingDetailPage.safe.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BookingForm from "../components/BookingForm";
import ReviewList from "../components/ReviewList";
import RideResults from "../components/RideResults";
import { formatBanglaNumber } from "../utils/formatBanglaNumber";
import { useTranslation } from "react-i18next";
import { CarFront, BedDouble } from "lucide-react";

const ListingDetailPage = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [suggestedTrips, setSuggestedTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [bookingMode, setBookingMode] = useState("stay");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/listings/${id}`)
      .then((res) => setListing(res.data))
      .catch((err) => console.error("Failed to load listing:", err));
  }, [id]);

  useEffect(() => {
    if (!listing?.district) return;

    setLoadingTrips(true);

    const isDev = true;
    if (isDev) {
      const latitude = 23.8103;
      const longitude = 90.4125;

      axios
        .get(
          `${import.meta.env.VITE_API_URL}/api/trips/suggestions?to=${
            listing.district
          }&lat=${latitude}&lng=${longitude}`
        )
        .then((res) => setSuggestedTrips(res.data))
        .catch((err) => console.error("❌ Trip suggestion fetch error", err))
        .finally(() => setLoadingTrips(false));
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          axios
            .get(
              `${import.meta.env.VITE_API_URL}/api/trips/suggestions?to=${
                listing.district
              }&lat=${latitude}&lng=${longitude}`
            )
            .then((res) => setSuggestedTrips(res.data))
            .catch((err) =>
              console.error("❌ Trip suggestion fetch error", err)
            )
            .finally(() => setLoadingTrips(false));
        },
        (err) => {
          console.error("❌ Geolocation failed:", err);
          setLoadingTrips(false);
        }
      );
    }
  }, [listing]);

  if (!listing) return <p className="text-center">{t("loading")}</p>;

  // ---------- Fallback formatted features ----------
  const defaultFeatures = [
    { icon: "🛏️", text: "One double bed + seating area" },
    { icon: "🚿", text: "Attached clean bathroom" },
    { icon: "🍽️", text: "Traditional breakfast (optional)" },
    { icon: "🔥", text: "Clay stove access for light cooking" },
    { icon: "🌿", text: "Peaceful countryside atmosphere" },
  ];

  // use listing.features if it exists & has items, else fallback
  const features =
    Array.isArray(listing.features) && listing.features.length > 0
      ? listing.features
      : defaultFeatures;

  // split houseRules text into bullet list if no structured array
  const houseRulesList =
    Array.isArray(listing.houseRulesList) && listing.houseRulesList.length > 0
      ? listing.houseRulesList
      : listing.houseRules
      ? listing.houseRules
          .split("\n")
          .map((r) => r.trim())
          .filter(Boolean)
      : [];

  const priceDisplay =
    i18n.language === "bn" ? formatBanglaNumber(listing.price) : listing.price;

  const guestDisplay =
    i18n.language === "bn"
      ? formatBanglaNumber(listing.maxGuests)
      : listing.maxGuests;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT: Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* HERO GALLERY */}
        <section
          className="
            relative overflow-hidden rounded-3xl
            bg-slate-100
            ring-1 ring-slate-200
            shadow-sm
          "
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2 h-full">
            {Array.isArray(listing.images) &&
              listing.images.map((url, idx) => (
                <div
                  key={idx}
                  className={`
                    relative overflow-hidden
                    ${
                      idx === 0
                        ? "col-span-2 md:col-span-2 row-span-2 h-64 md:h-80"
                        : "h-32 md:h-40"
                    }
                  `}
                >
                  <img
                    src={url}
                    alt={`Image ${idx + 1}`}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-500 hover:scale-105"
                    onClick={() => setSelectedImage(url)}
                  />

                  {/* dark gradient overlay on first image */}
                  {idx === 0 && (
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 via-black/10 to-transparent" />
                  )}

                  {/* Premium badge on first image */}
                  {idx === 0 && listing.hostId?.premium?.isActive && (
                    <div className="absolute top-3 left-3">
                      <span
                        className="
                          inline-flex items-center gap-1
                          rounded-full bg-slate-900/80
                          px-3 py-1 text-[0.7rem] font-semibold
                          text-amber-200
                          ring-1 ring-amber-300/80
                          shadow-md shadow-amber-400/50
                        "
                      >
                        <span>🌟</span>
                        <span>Premium Stay</span>
                      </span>
                    </div>
                  )}
                </div>
              ))}

            {/* Map always last */}
            <div className="w-full h-40 md:h-52 col-span-2 md:col-span-1 overflow-hidden rounded-b-3xl md:rounded-none md:rounded-r-3xl">
              <iframe
                title="Listing Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${listing.location?.coordinates[1]},${listing.location?.coordinates[0]}&z=15&output=embed`}
              ></iframe>
            </div>
          </div>
        </section>

        {/* TITLE / META / PRICE */}
        <section className="space-y-3">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              {listing.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                📍
                <span>
                  {t(`district.${listing.district}`)},{" "}
                  {t(`division.${listing.division}`)}
                </span>
              </span>
              {listing.location?.address && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                  🏠 <span>{listing.location.address}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-3 pt-2">
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-semibold text-slate-900">
                {t("price_per_night", {
                  price: priceDisplay,
                })}
              </span>
              <span className="text-xs text-slate-500">
                {t("guests_supported", { count: guestDisplay })}
              </span>
            </div>

            {/* Stay / Stay+Ride toggle */}
            <div
              className="
                inline-flex items-center rounded-full bg-slate-100
                ring-1 ring-slate-200 p-1 text-xs md:text-sm
              "
            >
              <button
                onClick={() => setBookingMode("stay")}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full
                  transition-all duration-200
                  ${
                    bookingMode === "stay"
                      ? "bg-emerald-600 text-purple-600 shadow-sm"
                      : "text-slate-600 hover:bg-white"
                  }
                `}
              >
                <BedDouble className="h-4 w-4" /> <span>{t("stay_only")}</span>
              </button>
              <button
                onClick={() => setBookingMode("combined")}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full
                  transition-all duration-200
                  ${
                    bookingMode === "combined"
                      ? "bg-sky-600 text-purple-600 shadow-sm"
                      : "text-slate-600 hover:bg-white"
                  }
                `}
              >
                <BedDouble className="h-4 w-4" />
                <CarFront className="h-4 w-4" />
                <span>{t("stay_and_ride")}</span>
              </button>
            </div>
          </div>
        </section>

        {/* DESCRIPTION */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/70 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📖</span>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
              {t("description")}
            </h2>
          </div>

          <p className="text-slate-700 text-[15px] leading-relaxed mb-4">
            {listing.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {features.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all"
              >
                <span className="text-lg">{item.icon}</span>
                <p className="text-slate-700 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* HOUSE RULES */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm mt-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📜</span>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
              {t("house_rules")}
            </h2>
          </div>

          <ul className="space-y-3 text-slate-700 text-[15px] leading-relaxed mt-2">
            {houseRulesList.map((rule, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 p-2 rounded-md hover:bg-slate-50 transition"
              >
                <span className="text-slate-400 text-lg">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* REVIEWS */}
        <section className="mt-8 space-y-4">
          <ReviewList listingId={listing._id} />
        </section>

        {/* SUGGESTED RIDES */}
        <section className="mt-10 border-t border-slate-200 pt-6">
          {loadingTrips ? (
            <p className="text-center text-gray-500 mt-6">
              {t("loading_rides")}
            </p>
          ) : suggestedTrips.length > 0 ? (
            <>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                {t("suggested_rides")}
              </h3>
              <RideResults
                trips={suggestedTrips}
                selectedTrip={selectedTrip}
                onSelectTrip={(trip) =>
                  setSelectedTrip((prev) =>
                    prev?._id === trip._id ? null : trip
                  )
                }
              />
            </>
          ) : (
            <p className="text-center text-gray-400 mt-6 italic">
              {t("no_rides_found")}
            </p>
          )}
        </section>
      </div>

      {/* RIGHT: BOOKING CARD */}
      <aside
        className="
          bg-white/95 backdrop-blur
          border border-slate-200
          rounded-2xl p-5 md:p-6
          shadow-lg shadow-slate-900/5
          ring-1 ring-slate-200
          h-fit sticky top-24
        "
      >
        <BookingForm
          listingId={listing._id}
          price={listing.price}
          maxGuests={listing.maxGuests}
          blockedDates={listing.blockedDates || []}
          bookingMode={bookingMode}
          selectedTrip={selectedTrip}
        />
      </aside>

      {/* FULLSCREEN IMAGE PREVIEW */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-[90%] md:w-full rounded-3xl overflow-hidden bg-slate-950/90 ring-1 ring-slate-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-4 text-slate-200 text-3xl font-light hover:text-white"
              onClick={() => setSelectedImage(null)}
            >
              &times;
            </button>
            <img
              src={selectedImage}
              alt="Full preview"
              className="w-full h-auto max-h-[80vh] object-contain bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailPage;
