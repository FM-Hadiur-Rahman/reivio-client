import React from "react";
import { Link } from "react-router-dom";

const PaymentFailPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          ❌ Payment Failed
        </h1>
        <p className="text-gray-700 mb-6">
          Unfortunately, your payment was not successful. Please try again or
          contact support.
        </p>
        <Link
          to="/"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailPage;
