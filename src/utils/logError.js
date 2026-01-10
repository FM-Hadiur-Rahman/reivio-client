import axios from "axios";

export const logError = async (error, context = "") => {
  try {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    await axios.post(`${import.meta.env.VITE_API_URL}/api/logs`, {
      message: error?.message || "Unknown error",
      stack: error?.stack || "",
      userId: user._id || "anonymous",
      context,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    if (import.meta.env.MODE === "development") {
      console.error("🛑 Failed to log error:", err);
    }
  }
};
