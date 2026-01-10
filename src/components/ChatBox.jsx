// ChatBox.jsx
import { useState, useEffect } from "react";
import axios from "axios";

const ChatBox = ({ chatId, user }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/messages/${chatId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setMessages(res.data));
  }, [chatId]);

  const sendMessage = async () => {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/messages`,
      { chatId, text },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    setMessages((prev) => [...prev, res.data]);
    setText("");
  };

  return (
    <div className="border rounded p-4 bg-white">
      <div className="h-64 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg) => (
          <div key={msg._id} className="text-sm">
            <strong>{msg.senderId === user._id ? "You" : "Partner"}:</strong>{" "}
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-grow border px-2 py-1 rounded"
        />
        <button
          onClick={sendMessage}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};
export default ChatBox;
