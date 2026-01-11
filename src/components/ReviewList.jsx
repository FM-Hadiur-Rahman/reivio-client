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
      {reviews.map((r) => {
        const name = r.guestId?.name || "Anonymous";
        const initial = (name?.[0] || "A").toUpperCase();
        const rating = Number(r.rating || 0);

        return (
          <div
            key={r._id}
            className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className="h-11 w-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
                    {initial}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900 truncate">
                        {name}
                      </p>

                      {/* Rating chip */}
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        <span className="text-amber-500">★</span>
                        {rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Optional date if exists */}
                    {r.createdAt && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${
                        i < Math.round(rating)
                          ? "text-amber-500"
                          : "text-slate-200"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              <p className="text-slate-700 text-[15px] leading-relaxed whitespace-pre-line">
                {r.text}
              </p>

              {/* Host reply */}
              {r.response ? (
                <div className="mt-4 rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Host reply
                  </p>
                  <p className="mt-1 text-sm text-emerald-900 leading-relaxed whitespace-pre-line">
                    {r.response}
                  </p>
                </div>
              ) : user?.role === "host" ? (
                <div className="mt-4">
                  <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">
                      Reply as host
                    </p>

                    <textarea
                      rows={3}
                      className="
                    w-full rounded-2xl border border-slate-200 bg-white
                    px-3 py-2 text-sm text-slate-800
                    outline-none focus:ring-2 focus:ring-emerald-200
                    placeholder:text-slate-400
                  "
                      placeholder="Write a thoughtful reply..."
                      value={replyText[r._id] || ""}
                      onChange={(e) =>
                        setReplyText({ ...replyText, [r._id]: e.target.value })
                      }
                    />

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">
                        Keep it friendly and helpful.
                      </p>

                      <button
                        onClick={() => handleReply(r._id)}
                        className="
                      inline-flex items-center justify-center
                      rounded-full bg-emerald-600 px-4 py-2
                      text-sm font-semibold text-white
                      hover:bg-emerald-700 active:scale-[0.99] transition
                    "
                      >
                        Send reply
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList;
