import React from "react";

const InvoiceDownload = ({ bookingId }) => {
  const handleDownload = () => {
    const token = localStorage.getItem("token");
    const url = `${import.meta.env.VITE_API_URL}/api/invoices/${bookingId}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const urlBlob = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = urlBlob;
        a.download = `invoice-${bookingId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(urlBlob);
      })
      .catch((err) => console.error("Invoice download failed:", err));
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      📥 Download Invoice
    </button>
  );
};

export default InvoiceDownload;
