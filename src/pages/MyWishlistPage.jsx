import React, { useEffect, useState } from "react";
import axios from "axios";
import ListingCard from "../components/ListingCard";
import { Heart, Info, Loader2, RefreshCcw } from "lucide-react";

const MyWishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/wishlist`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (Array.isArray(res.data)) setWishlist(res.data);
      else {
        console.warn("⚠️ Unexpected response:", res.data);
        setWishlist([]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch wishlist:", err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 via-cyan-500/10 to-emerald-500/10" />
          <div className="relative p-7 md:p-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                  <Heart size={16} />
                  My Wishlist
                </div>

                <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                  Saved listings
                </h1>

                <p className="mt-2 max-w-2xl text-gray-600">
                  Keep your favorite stays here and come back anytime.
                </p>

                <div className="mt-4 inline-flex items-center rounded-full bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 text-sm font-semibold">
                  {wishlist.length} saved
                </div>
              </div>

              <button
                onClick={fetchWishlist}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-white font-semibold shadow-sm transition hover:bg-teal-700"
              >
                <RefreshCcw size={18} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          {loading ? (
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-teal-700" size={26} />
              <p className="text-gray-600">Loading wishlist…</p>
            </div>
          ) : wishlist.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-10 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                <Info className="text-teal-700" size={22} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No listings saved yet
              </h3>
              <p className="mt-1 text-gray-600">
                Browse stays and tap the heart icon to save your favorites.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {wishlist.map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyWishlistPage;
