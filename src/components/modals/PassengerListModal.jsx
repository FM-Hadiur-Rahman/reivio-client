// PassengerListModal.jsx
import React from "react";

const PassengerListModal = ({ trip, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-lg">
        <h2 className="text-lg font-bold mb-4">👥 Passengers List</h2>
        {trip.passengers?.length ? (
          <ul className="space-y-2">
            {trip.passengers.map((p, i) => (
              <li key={i} className="border-b pb-2">
                <p>
                  <strong>Name:</strong> {p.name || "N/A"}
                </p>
                <p>
                  <strong>Seats:</strong> {p.seats}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      p.status === "cancelled"
                        ? "text-red-500"
                        : "text-green-600"
                    }
                  >
                    {p.status}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No passengers found.</p>
        )}
        <div className="mt-4 text-right">
          <button className="btn" onClick={onClose}>
            ❌ Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassengerListModal;
