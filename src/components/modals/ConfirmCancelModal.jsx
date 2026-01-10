// ConfirmCancelModal.jsx
import React from "react";

const ConfirmCancelModal = ({ trip, onClose, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="text-lg font-bold mb-4">Confirm Cancellation</h2>
        <p>
          Are you sure you want to cancel the trip from{" "}
          <strong>{trip.from}</strong> to <strong>{trip.to}</strong>?
        </p>
        <div className="mt-4 flex gap-2 justify-end">
          <button className="btn" onClick={onClose}>
            ❌ Close
          </button>
          <button className="btn btn-red" onClick={onConfirm}>
            ✅ Confirm Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCancelModal;
