// ConfirmTripDeleteModal.jsx
import React from "react";

const ConfirmTripDeleteModal = ({ trip, onClose, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
        <p>
          Do you really want to delete the trip from{" "}
          <strong>{trip.from}</strong> to <strong>{trip.to}</strong>?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn" onClick={onClose}>
            ❌ Cancel
          </button>
          <button className="btn btn-red" onClick={onConfirm}>
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmTripDeleteModal;
