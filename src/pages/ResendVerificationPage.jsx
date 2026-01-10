import { useState } from "react";
import axios from "axios";

const ResendVerification = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleResend = async (e) => {
    e.preventDefault();
    setMessage("Sending...");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/resend-verification`,
        { email }
      );
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <form onSubmit={handleResend} className="max-w-sm mx-auto mt-10 space-y-4">
      <input
        type="email"
        className="border p-2 w-full"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Resend Verification
      </button>
      <div className="mt-4 text-center text-sm text-gray-700">{message}</div>
    </form>
  );
};

export default ResendVerification;
