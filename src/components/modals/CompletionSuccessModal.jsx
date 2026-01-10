// CompletionSuccessModal.jsx
import React from "react";

const CompletionSuccessModal = ({ open, onClose, amount }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md text-center">
        <h2 className="text-2xl font-bold mb-3">🎉 Trip Completed</h2>
        <p className="text-lg mb-2">
          You’ve successfully marked the trip as completed.
        </p>
        <p className="text-green-600 font-semibold text-lg">
          Payout: ৳{amount}
        </p>
        <button
          onClick={onClose}
          className="mt-4 bg-green-600 text-white px-5 py-2 rounded"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default CompletionSuccessModal;
