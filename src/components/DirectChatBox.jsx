import { useEffect, useRef, useState } from "react";
import { Loader2, Phone, Send, Video } from "lucide-react";
import { getDirectMessages, sendDirectMessage } from "../api/directChatApi";
import { startDirectCall } from "../api/directCallApi";
import CallRoom from "./CallRoom";

export default function DirectChatBox({ chat, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const [activeCall, setActiveCall] = useState(null);

  const endRef = useRef(null);

  const otherUser = chat?.participants?.find((p) => p._id !== user?._id);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data } = await getDirectMessages(chat._id);
      setMessages(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chat?._id) loadMessages();
  }, [chat?._id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const value = text.trim();
    if (!value) return;

    setText("");

    const { data } = await sendDirectMessage(chat._id, value);
    setMessages((prev) => [...prev, data]);
  };
  const startCall = async (callType) => {
    if (!otherUser?._id) return alert("Other user not found.");

    const { data } = await startDirectCall({
      chatId: chat._id,
      callerId: user._id,
      receiverId: otherUser._id,
      callType,
    });

    setActiveCall(data);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b bg-teal-50 px-5 py-4">
        <div>
          <h3 className="text-lg font-bold">Direct Chat</h3>
          <p className="text-sm text-gray-600">
            {otherUser?.name || "Private conversation"}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => startCall("audio")}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 font-bold text-white hover:bg-teal-700"
          >
            <Phone size={16} />
            Audio
          </button>

          <button
            onClick={() => startCall("video")}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
          >
            <Video size={16} />
            Video
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} />
            Loading messages...
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const senderId =
                typeof msg.senderId === "object"
                  ? msg.senderId._id
                  : msg.senderId;

              const mine = senderId === user?._id;

              return (
                <div
                  key={msg._id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                      mine
                        ? "bg-teal-600 text-white"
                        : "border bg-white text-gray-900"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t p-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type message..."
          className="flex-1 rounded-2xl border px-4 py-3 outline-none focus:border-teal-400"
        />

        <button
          onClick={send}
          className="rounded-2xl bg-teal-600 px-4 text-white"
        >
          <Send size={18} />
        </button>
      </div>

      {activeCall && (
        <CallRoom
          channelName={activeCall.channelName}
          userId={user._id}
          callId={activeCall._id}
          callType={activeCall.callType}
          onClose={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}
