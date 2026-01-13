import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { HeartIcon as OutlineHeart } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeart } from "@heroicons/react/24/solid";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const ListingCard = ({ listing }) => {
  const { t, i18n } = useTranslation();

  const token = useMemo(() => {
    const direct = localStorage.getItem("token");
    if (direct) return direct;
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      return u?.token || null;
    } catch {
      return null;
    }
  }, []);

  const images =
    listing.images && listing.images.length > 0
      ? listing.images
      : ["/placeholder-listing.jpg"];

  const [isSaved, setIsSaved] = useState(
    Boolean(listing?.isWishlisted || listing?.wishlistedByMe)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [imgError, setImgError] = useState(false);

  const toBanglaNumber = (num) =>
    String(num).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

  const displayPrice =
    i18n.language === "bn" ? toBanglaNumber(listing.price) : listing.price;

  // Optional: keep synced if parent passes isWishlisted later
  useEffect(() => {
    if (typeof listing?.isWishlisted === "boolean")
      setIsSaved(listing.isWishlisted);
    if (typeof listing?.wishlistedByMe === "boolean")
      setIsSaved(listing.wishlistedByMe);
  }, [listing?.isWishlisted, listing?.wishlistedByMe]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL;
    const url = `${apiUrl}/api/wishlist/${isSaved ? "remove" : "add"}/${
      listing._id
    }`;

    try {
      const response = await fetch(url, {
        method: isSaved ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
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
    setImgError(false);
    setCurrentIndex((prev) => {
      if (direction === "next")
        return prev === images.length - 1 ? 0 : prev + 1;
      return prev === 0 ? images.length - 1 : prev - 1;
    });
  };

  // basic swipe for mobile
  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStartX == null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 40) diff < 0 ? goTo("next") : goTo("prev");
    setTouchStartX(null);
  };

  const isPremium = Boolean(listing?.host?.premium?.isActive);

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
          src={imgError ? "/placeholder-listing.jpg" : images[currentIndex]}
          alt={listing.title}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {/* gradient top / bottom */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 via-black/0 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 via-black/0 to-transparent" />

        {/* PREMIUM badge */}
        {isPremium && (
          <div className="absolute top-3 left-3">
            <span
              className="
                inline-flex items-center gap-1.5
                rounded-full bg-slate-900/80
                px-2.5 py-1 text-[0.65rem] font-semibold
                text-amber-200
                ring-1 ring-amber-300/70
                shadow-md shadow-amber-400/40
              "
            >
              <ShieldCheckIcon className="w-4 h-4 text-amber-200" />
              <span>{t("premium_host") || "Premium Host"}</span>
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
              active:scale-[0.98]
            "
            title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
            type="button"
          >
            {isSaved ? (
              <SolidHeart className="w-5 h-5 text-rose-500" />
            ) : (
              <OutlineHeart className="w-5 h-5 text-slate-600" />
            )}
          </button>
        )}

        {/* Carousel arrows (show on hover desktop) */}
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
                opacity-0 group-hover:opacity-100
              "
              type="button"
              aria-label="Previous image"
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
                opacity-0 group-hover:opacity-100
              "
              type="button"
              aria-label="Next image"
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
                    setImgError(false);
                    setCurrentIndex(idx);
                  }}
                  type="button"
                  aria-label={`Image ${idx + 1}`}
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

          {typeof listing.rating === "number" && (
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2 py-1 text-xs text-slate-800">
              <StarIcon className="w-4 h-4 text-amber-500" />
              <span className="font-bold">{listing.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 line-clamp-1">
          {listing.location?.address}
        </p>

        <div className="mt-1 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">
              ৳{displayPrice}
              <span className="text-xs text-slate-500">
                {" "}
                /{t("price_per_night_unit") || "night"}
              </span>
            </span>

            {listing.host?.name && (
              <span className="text-[0.7rem] text-slate-500">
                {t("hosted_by") || "Hosted by"} {listing.host.name}
              </span>
            )}
          </div>

          <span className="text-[0.7rem] text-slate-400 group-hover:text-teal-600 transition-colors">
            {t("view_details") || "View details"} →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
