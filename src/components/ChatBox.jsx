// ChatBox.jsx (Premium Teal / modern bubbles + auto-scroll + enter to send + loading)
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Send, Loader2, MessageSquare, ShieldCheck } from "lucide-react";

const ChatBox = ({ chatId, user }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const endRef = useRef(null);

  const token = useMemo(() => localStorage.getItem("token"), []);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!chatId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/messages/${chatId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("❌ Failed to load messages", e);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    const t = text.trim();
    if (!t) return;
    if (!chatId) return;

    try {
      setSending(true);

      // optimistic bubble
      const optimistic = {
        _id: `tmp-${Date.now()}`,
        chatId,
        text: t,
        senderId: user?._id,
        createdAt: new Date().toISOString(),
        __optimistic: true,
      };
      setMessages((prev) => [...prev, optimistic]);
      setText("");

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/messages`,
        { chatId, text: t },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // replace optimistic with real
      setMessages((prev) =>
        prev.map((m) => (m._id === optimistic._id ? res.data : m)),
      );
    } catch (e) {
      console.error("❌ Send failed", e);
      // rollback optimistic
      setMessages((prev) =>
        prev.filter((m) => !String(m._id).startsWith("tmp-")),
      );
      setText((prev) => (prev ? prev : t));
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-teal-600/5 to-cyan-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-teal-700" size={18} />
            <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            <ShieldCheck size={14} />
            Safe messaging
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Don’t share OTPs or sensitive payment info.
        </p>
      </div>

      {/* Messages */}
      <div className="h-72 md:h-80 overflow-y-auto px-4 py-4 bg-gradient-to-b from-white to-teal-50/40">
        {loading ? (
          <div className="h-full flex items-center justify-center gap-2 text-gray-600">
            <Loader2 className="animate-spin text-teal-700" size={18} />
            Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                <MessageSquare className="text-teal-700" size={20} />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">
                No messages yet
              </p>
              <p className="text-sm text-gray-600">
                Say hello to start the conversation.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const mine = msg.senderId === user?._id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[78%]`}>
                    <div
                      className={[
                        "rounded-2xl px-4 py-2 text-sm shadow-sm border",
                        mine
                          ? "bg-teal-600 text-white border-teal-600"
                          : "bg-white text-gray-900 border-gray-200",
                        msg.__optimistic ? "opacity-70" : "",
                      ].join(" ")}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {msg.text}
                      </div>
                    </div>
                    <div
                      className={`mt-1 text-[11px] ${
                        mine
                          ? "text-right text-gray-500"
                          : "text-left text-gray-500"
                      }`}
                    >
                      {mine ? "You" : "Partner"} • {formatTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Type a message… (Enter to send)"
            className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={sending || !text.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-white font-semibold shadow-sm hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
            title="Send"
          >
            {sending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Tip: press <span className="font-semibold">Shift + Enter</span> for a
          new line.
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
