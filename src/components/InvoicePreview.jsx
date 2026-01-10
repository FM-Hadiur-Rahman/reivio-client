import React from "react";

const InvoicePreview = ({ bookingId }) => {
  const downloadInvoice = () => {
    window.open(`/api/bookings/${bookingId}/invoice`, "_blank");
  };

  return (
    <div>
      <h3 className="font-semibold mb-2">🧾 Invoice</h3>
      <button
        onClick={downloadInvoice}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Download PDF Invoice
      </button>
    </div>
  );
};

export default InvoicePreview;
