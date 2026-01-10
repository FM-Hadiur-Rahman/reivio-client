import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeartIcon as OutlineHeart } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeart } from "@heroicons/react/24/solid";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const ListingCard = ({ listing }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const { t, i18n } = useTranslation();

  const token = localStorage.getItem("token");
  const images =
    listing.images && listing.images.length > 0
      ? listing.images
      : ["/placeholder-listing.jpg"];

  const toBanglaNumber = (num) =>
    String(num).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

  // Optional: preload wishlist status from higher-level component later
  useEffect(() => {}, []);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const apiUrl = import.meta.env.VITE_API_URL;
    const url = `${apiUrl}/api/wishlist/${isSaved ? "remove" : "add"}/${
      listing._id
    }`;

    try {
      const response = await fetch(url, {
        method: isSaved ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Wishlist update failed");
      setIsSaved((prev) => !prev);
    } catch (err) {
      console.error("❌ Wishlist toggle error:", err.message);
    }
  };

  const goTo = (direction, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => {
      if (direction === "next") {
        return prev === images.length - 1 ? 0 : prev + 1;
      }
      return prev === 0 ? images.length - 1 : prev - 1;
    });
  };

  // basic swipe for mobile
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX == null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) goTo("next");
      else goTo("prev");
    }
    setTouchStartX(null);
  };

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="
        group relative block h-full
        rounded-2xl bg-white/90
        ring-1 ring-slate-200
        shadow-sm
        hover:ring-teal-400/70 hover:shadow-xl
        transition-all duration-300
        overflow-hidden
      "
    >
      {/* IMAGE AREA / CAROUSEL */}
      <div
        className="relative h-56 w-full overflow-hidden bg-slate-100"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentIndex]}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {/* gradient top / bottom */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 via-black/0 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 via-black/0 to-transparent" />

        {/* PREMIUM badge */}
        {listing.host?.premium?.isActive && (
          <div className="absolute top-3 left-3">
            <span
              className="
                inline-flex items-center gap-1
                rounded-full bg-slate-900/80
                px-2.5 py-1 text-[0.65rem] font-semibold
                text-amber-200
                ring-1 ring-amber-300/70
                shadow-md shadow-amber-400/50
              "
            >
              <span>🌟</span>
              <span>Premium Host</span>
            </span>
          </div>
        )}

        {/* Wishlist button */}
        {token && (
          <button
            onClick={toggleWishlist}
            className="
              absolute top-3 right-3 z-10
              flex items-center justify-center
              h-9 w-9 rounded-full
              bg-white/95 backdrop-blur
              ring-1 ring-slate-200
              shadow-md
              hover:bg-slate-50
              transition-all
            "
            title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
          >
            {isSaved ? (
              <SolidHeart className="w-5 h-5 text-rose-500" />
            ) : (
              <OutlineHeart className="w-5 h-5 text-slate-600" />
            )}
          </button>
        )}

        {/* Carousel arrows (only if more than one image) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => goTo("prev", e)}
              className="
                absolute left-2 top-1/2 -translate-y-1/2
                hidden sm:flex items-center justify-center
                h-8 w-8 rounded-full
                bg-slate-900/60 text-slate-100
                ring-1 ring-slate-700/80
                hover:bg-slate-900/80
                transition-all
              "
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => goTo("next", e)}
              className="
                absolute right-2 top-1/2 -translate-y-1/2
                hidden sm:flex items-center justify-center
                h-8 w-8 rounded-full
                bg-slate-900/60 text-slate-100
                ring-1 ring-slate-700/80
                hover:bg-slate-900/80
                transition-all
              "
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>

            {/* dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`
                    h-1.5 rounded-full transition-all
                    ${idx === currentIndex ? "w-4 bg-white" : "w-2 bg-white/60"}
                  `}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-col gap-1 px-4 pt-3 pb-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 line-clamp-1">
            {listing.title}
          </h3>
          {listing.rating && (
            <div className="flex items-center gap-1 text-xs text-slate-700">
              <span>⭐</span>
              <span>{listing.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 line-clamp-1">
          {listing.location?.address}
        </p>

        <div className="mt-1 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">
              ৳
              {i18n.language === "bn"
                ? toBanglaNumber(listing.price)
                : listing.price}
              <span className="text-xs text-slate-500">
                {" "}
                /{t("price_per_night_unit") || "night"}
              </span>
            </span>
            {listing.host?.name && (
              <span className="text-[0.7rem] text-slate-500">
                Hosted by {listing.host.name}
              </span>
            )}
          </div>

          <span className="text-[0.7rem] text-slate-400 group-hover:text-teal-500 transition-colors">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
