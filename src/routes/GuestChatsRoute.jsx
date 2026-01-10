// 📁 src/routes/GuestChatsRoute.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import ChatBox from "../components/ChatBox";

const GuestChatsRoute = () => {
  const [chats, setChats] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/chats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setChats(res.data))
      .catch((err) => console.error("❌ Error loading guest chats:", err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">💬 Your Chats</h1>
      {chats.length === 0 ? (
        <p className="text-gray-500">You don’t have any chats yet.</p>
      ) : (
        <div className="space-y-6">
          {chats.map((chat) => (
            <div key={chat._id} className="bg-white shadow p-4 rounded">
              <h4 className="font-semibold mb-2">
                Booking ID: {chat.bookingId}
              </h4>
              <ChatBox chatId={chat._id} user={user} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuestChatsRoute;
