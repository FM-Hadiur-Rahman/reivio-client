import React, { useEffect, useState } from "react";
import axios from "axios";
import ListingCard from "../components/ListingCard";

const MyWishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/wishlist`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (Array.isArray(res.data)) {
        setWishlist(res.data);
      } else {
        console.warn("⚠️ Unexpected response:", res.data);
        setWishlist([]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch wishlist:", err);
      setWishlist([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-red-600">
        ❤️ My Wishlist
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">⏳ Loading wishlist...</p>
      ) : wishlist.length === 0 ? (
        <p className="text-center text-gray-500">
          No listings in your wishlist yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyWishlistPage;
