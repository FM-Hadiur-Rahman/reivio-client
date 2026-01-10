import React from "react";

const BookingStatusBadge = ({ status }) => {
  let color = "bg-gray-200 text-gray-700";

  if (status === "confirmed") {
    color = "bg-green-100 text-green-700";
  } else if (status === "cancelled") {
    color = "bg-red-100 text-red-700";
  } else if (status === "pending") {
    color = "bg-yellow-100 text-yellow-700";
  }

  return (
    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${color}`}>
      {status?.toUpperCase()}
    </span>
  );
};

export default BookingStatusBadge;
