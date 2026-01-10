import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const EarningsChart = ({ data }) => {
  console.log(data);
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-2">📈 Monthly Earnings</h3>

      {Array.isArray(data) && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#10b981" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-500 italic">No earnings data available.</p>
      )}
    </div>
  );
};

export default EarningsChart;
