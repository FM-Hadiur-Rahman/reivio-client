import React from "react";
import logo from "../assets/reivio.png";

const FullPageSpinner = ({ message = "Loading BanglaBnB..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-center">
      <img
        src={logo}
        alt="BanglaBnB Logo"
        className="w-16 h-16 mb-4 animate-pulse"
      />
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
};

export default FullPageSpinner;
