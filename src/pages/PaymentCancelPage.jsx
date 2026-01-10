import React from "react";
import { Link } from "react-router-dom";

const PaymentCancelPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-yellow-600 mb-4">
          ⚠️ Payment Cancelled
        </h1>
        <p className="text-gray-700 mb-6">
          You have cancelled the payment. No amount has been charged.
        </p>
        <Link
          to="/"
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
