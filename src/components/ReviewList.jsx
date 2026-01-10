import React, { useEffect, useState } from "react";
import axios from "axios";

const ReviewList = ({ listingId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/reviews/listing/${listingId}`)
      .then((res) => {
        if (Array.isArray(res.data)) setReviews(res.data);
        else {
          console.warn("⚠️ Not an array:", res.data);
          setReviews([]);
        }
      })
      .catch((err) => {
        console.error("❌ Failed to load reviews:", err);
        setReviews([]);
      })
      .finally(() => setLoading(false));
  }, [listingId]);

  const handleReply = async (reviewId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}/reply`,
        { response: replyText[reviewId] },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReplyText({ ...replyText, [reviewId]: "" });

      // Reload reviews
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/reviews/listing/${listingId}`
      );
      setReviews(res.data);
    } catch (err) {
      alert("❌ Failed to reply.");
    }
  };

  if (loading) return <p>Loading reviews...</p>;

  if (reviews.length === 0)
    return (
      <p className="text-gray-600 italic">
        No reviews yet. Be the first to review!
      </p>
    );

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r._id} className="border p-3 rounded">
          <div className="font-semibold">{r.guestId?.name || "Anonymous"}</div>
          <div>Rating: {r.rating} ★</div>
          <p>{r.text}</p>

          {r.response ? (
            <p className="text-sm text-green-700 mt-2">
              💬 Host reply: {r.response}
            </p>
          ) : user?.role === "host" ? (
            <div className="mt-2">
              <textarea
                rows={2}
                className="w-full border p-2 rounded mb-2"
                placeholder="Write a reply..."
                value={replyText[r._id] || ""}
                onChange={(e) =>
                  setReplyText({ ...replyText, [r._id]: e.target.value })
                }
              />
              <button
                onClick={() => handleReply(r._id)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Reply
              </button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
