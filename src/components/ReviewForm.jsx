import React, { useState } from "react";
import axios from "axios";

const ReviewForm = ({ bookingId, listingId, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/reviews`,
        {
          bookingId,
          listingId,
          rating,
          text,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onSuccess?.(); // reload reviews
    } catch (err) {
      alert("❌ Failed to submit review.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      >
        {[1, 2, 3, 4, 5].map((r) => (
          <option key={r} value={r}>
            {r} ★
          </option>
        ))}
      </select>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border p-2"
        placeholder="Write your review..."
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Post Review
      </button>
    </form>
  );
};

export default ReviewForm;
