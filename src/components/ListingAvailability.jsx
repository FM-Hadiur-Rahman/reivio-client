import BlockedCalendar from "./BlockedCalendar";
import BlockedDatesList from "./BlockedDatesList";
import { useEffect, useState } from "react";
import axios from "axios";

const ListingAvailability = ({ listingId }) => {
  const [blockedRanges, setBlockedRanges] = useState([]);

  useEffect(() => {
    const fetchBlocked = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/listings/${listingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBlockedRanges(res.data.blockedDates || []);
    };
    fetchBlocked();
  }, [listingId]);

  // flatten dates
  const allDates = [];
  for (let r of blockedRanges) {
    let current = new Date(r.from);
    const end = new Date(r.to);
    while (current <= end) {
      allDates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  }

  return (
    <div>
      <BlockedCalendar blockedDates={allDates} />
      <BlockedDatesList ranges={blockedRanges} />
    </div>
  );
};

export default ListingAvailability;
