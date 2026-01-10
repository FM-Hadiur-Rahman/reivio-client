import axios from "axios";

export const initiateTripPayment = async ({ tripId, seats, token }) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/trip-payment/trip-initiate`,
    { tripId, seats },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data?.url;
};
