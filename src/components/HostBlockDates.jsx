import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, DateRange } from "react-date-range";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import format from "date-fns/format";
import isWithinInterval from "date-fns/isWithinInterval";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const HostBlockedDates = () => {
  const { id: listingId } = useParams();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [blockedDates, setBlockedDates] = useState([]);
  const [selectedRange, setSelectedRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const fetchBlockedDates = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/listings/${listingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBlockedDates(res.data.blockedDates || []);
    } catch (err) {
      console.error("❌ Failed to load blocked dates", err);
    }
  };

  const handleBlock = async () => {
    const { startDate, endDate } = selectedRange[0];

    if (startDate > endDate) {
      toast.error("Invalid date range.");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/listings/${listingId}/block-dates`,
        { from: startDate, to: endDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Dates blocked successfully!");
      fetchBlockedDates();
    } catch (err) {
      toast.error("❌ Failed to block dates.");
      console.error(err);
    }
  };

  const handleUnblock = async (from, to) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/listings/${listingId}/block-dates`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { from, to },
        }
      );
      toast.success("✅ Unblocked!");
      fetchBlockedDates();
    } catch (err) {
      toast.error("❌ Failed to unblock.");
      console.error(err);
    }
  };

  const isDateBlocked = (date) => {
    return blockedDates.some(({ from, to }) =>
      isWithinInterval(date, {
        start: new Date(from),
        end: new Date(to),
      })
    );
  };

  useEffect(() => {
    if (user?.role === "host") fetchBlockedDates();
  }, []);

  if (user?.role !== "host") {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        🚫 Only hosts can access this page.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        📆 Manage Blocked Dates
      </h2>

      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">
          Select a date range to block
        </h3>
        <DateRange
          ranges={selectedRange}
          onChange={(ranges) => setSelectedRange([ranges.selection])}
          rangeColors={["#9b2c2c"]}
        />
        <button
          onClick={handleBlock}
          className="mt-3 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Block Selected Dates
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">
          Blocked Days (Read-Only View)
        </h3>
        <Calendar
          date={new Date()}
          disabledDay={(date) => !isDateBlocked(date)}
        />
      </div>

      <div>
        <h3 className="text-md font-semibold mb-2">📋 Blocked Date Ranges</h3>
        {blockedDates.length === 0 ? (
          <p className="text-sm text-gray-500">No blocked dates yet.</p>
        ) : (
          <ul className="space-y-2">
            {blockedDates.map((range, index) => (
              <li
                key={index}
                className="flex justify-between items-center border p-2 rounded text-sm"
              >
                <span>
                  {format(new Date(range.from), "PPP")} →{" "}
                  {format(new Date(range.to), "PPP")}
                </span>
                <button
                  onClick={() => handleUnblock(range.from, range.to)}
                  className="text-red-600 hover:underline"
                >
                  ❌ Unblock
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HostBlockedDates;
