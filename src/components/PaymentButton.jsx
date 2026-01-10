import axios from "axios";

function PaymentButton({ booking }) {
  const handlePayment = async () => {
    try {
      const res = await axios.post("/api/payment/initiate", {
        amount: booking.total,
        bookingId: booking._id,
        customer: {
          name: booking.user.name,
          email: booking.user.email,
          address: booking.user.address,
          phone: booking.user.phone,
        },
      });

      if (res.data.url) {
        window.location.href = res.data.url; // redirect to SSLCOMMERZ
      } else {
        alert("Failed to initiate payment.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Error occurred during payment.");
    }
  };

  return <button onClick={handlePayment}>Pay Now</button>;
}

export default PaymentButton;
