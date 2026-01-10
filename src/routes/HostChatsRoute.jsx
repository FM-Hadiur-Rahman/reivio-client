// 📁 src/routes/HostChatsRoute.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import ChatBox from "../components/ChatBox";

const HostChatsRoute = () => {
  const [chats, setChats] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/chats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setChats(res.data))
      .catch((err) => console.error("❌ Error loading host chats:", err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">💬 Guest Chats</h1>
      {chats.length === 0 ? (
        <p className="text-gray-500">No chats available.</p>
      ) : (
        <div className="space-y-6">
          {chats.map((chat) => {
            const other = chat.participants.find((p) => p._id !== user._id);
            return (
              <div key={chat._id} className="bg-white shadow p-4 rounded">
                <h4 className="font-semibold mb-2">
                  Guest: {other?.name || "Unknown"}
                </h4>
                <ChatBox chatId={chat._id} user={user} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HostChatsRoute;
