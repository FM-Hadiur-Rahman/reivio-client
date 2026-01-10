import React from "react";
import { Link } from "react-router-dom";

const PaymentReminderModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-3 text-red-600">
          💳 Payment Information Needed
        </h2>
        <p className="mb-4 text-gray-700">
          To ensure smooth payouts or refunds, please complete your payment
          details now.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100"
          >
            Not Now
          </button>
          <Link
            to="/my-account"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            👉 Update Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentReminderModal;
