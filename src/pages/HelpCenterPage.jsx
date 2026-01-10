import React from "react";
import { Link } from "react-router-dom";

const HelpCenterPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Help Center</h1>
      <p className="mb-6 text-gray-700">
        Welcome to the BanglaBnB Help Center. Browse the topics below or{" "}
        <Link to="/contact" className="text-green-600 underline">
          contact us
        </Link>{" "}
        for additional help.
      </p>

      <div className="grid gap-6">
        <div className="bg-white shadow p-6 rounded border border-gray-200">
          <h2 className="text-xl font-semibold text-green-700 mb-2">
            Booking & Payments
          </h2>
          <p className="text-gray-600">
            Learn how to book a stay, manage payments, and check your
            reservation status.
          </p>
        </div>

        <div className="bg-white shadow p-6 rounded border border-gray-200">
          <h2 className="text-xl font-semibold text-green-700 mb-2">
            Hosting Guidelines
          </h2>
          <p className="text-gray-600">
            Tips and policies for hosting guests, handling cancellations, and
            getting verified.
          </p>
        </div>

        <div className="bg-white shadow p-6 rounded border border-gray-200">
          <h2 className="text-xl font-semibold text-green-700 mb-2">
            Safety & Trust
          </h2>
          <p className="text-gray-600">
            Understand our verification system, guest/host reviews, and safety
            tips for your trip.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
