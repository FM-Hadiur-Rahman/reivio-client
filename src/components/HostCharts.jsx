import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const HostCharts = () => {
  const [earnings, setEarnings] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      try {
        const [earningsRes, reviewsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/stats/earnings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/stats/reviews`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        console.log("📊 Earnings Response:", earningsRes.data);
        console.log("🌟 Reviews Response:", reviewsRes.data);

        // ✅ Add a check here: Ensure res.data is an array for earnings
        setEarnings(Array.isArray(earningsRes.data) ? earningsRes.data : []);
        // ✅ Add a check here: Ensure res.data is an array for reviews
        setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
      } catch (err) {
        console.error("Error loading chart data:", err);
        // ✅ On error, also ensure states are reset to empty arrays
        setEarnings([]);
        setReviews([]);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Earnings */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">📈 Monthly Earnings</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={earnings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#10b981" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Reviews */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">🌟 Monthly Reviews</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reviews}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HostCharts;
