import React, { useEffect, useState } from "react";
import axios from "axios";

const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/notifications/unread-count`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUnreadCount(res.data.unread || 0);
      } catch (err) {
        console.error("❌ Failed to fetch unread count", err);
      }
    };

    fetchUnread();

    const interval = setInterval(fetchUnread, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button className="text-xl">🔔</button>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
          {unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBadge;
