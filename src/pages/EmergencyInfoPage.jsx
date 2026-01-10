import React from "react";
import { Link } from "react-router-dom";

const EmergencyInfoPage = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded mt-10">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        🚨 Emergency Help
      </h1>

      <p className="text-gray-700 mb-6">
        In case of emergency, please use the official national helplines or
        contact BanglaBnB support.
      </p>

      <ul className="space-y-3 text-lg text-gray-800">
        <li>
          📞 <strong>Police:</strong>{" "}
          <a href="tel:999" className="text-blue-600 underline">
            999
          </a>
        </li>
        <li>
          🚑 <strong>Ambulance:</strong>{" "}
          <a href="tel:199" className="text-blue-600 underline">
            199
          </a>{" "}
          or{" "}
          <a href="tel:16263" className="text-blue-600 underline">
            16263
          </a>{" "}
          (DGHS)
        </li>
        <li>
          🔥 <strong>Fire Service:</strong>{" "}
          <a href="tel:999" className="text-blue-600 underline">
            999
          </a>
        </li>
        <li>
          🧭 <strong>BanglaBnB Support:</strong>{" "}
          <a href="tel:+8801234567890" className="text-blue-600 underline">
            +8801234567890
          </a>{" "}
          <br />
          💬 or{" "}
          <a
            href="https://wa.me/8801234567890"
            className="text-green-600 underline"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp Us
          </a>
        </li>
        <li>
          🛑 <strong>Report a Safety Issue:</strong>{" "}
          <Link to="/contact" className="text-red-600 underline">
            Submit a Complaint
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default EmergencyInfoPage;
