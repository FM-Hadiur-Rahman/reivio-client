import { useSearchParams, useNavigate } from "react-router-dom";
import ReviewForm from "../components/ReviewForm";
import { useEffect } from "react";

const ReviewPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get("booking");
  const listingId = searchParams.get("listing");

  useEffect(() => {
    // Optionally scroll to top
    window.scrollTo(0, 0);
  }, []);

  if (!bookingId || !listingId) {
    return (
      <p className="text-red-600 p-4">
        ❌ Missing booking or listing ID in the URL.
      </p>
    );
  }

  const handleSuccess = () => {
    alert("✅ Review submitted successfully!");
    navigate("/dashboard/bookings");
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">✍️ Leave a Review</h1>
      <ReviewForm
        bookingId={bookingId}
        listingId={listingId}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default ReviewPage;
