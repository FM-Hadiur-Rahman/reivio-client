import { useEffect, useState } from "react";
import { getMyDirectChats } from "../api/directChatApi";
import { getIncomingCall } from "../api/directCallApi";
import DirectChatBox from "../components/DirectChatBox";
import IncomingCallPopup from "../components/IncomingCallPopup";
import CallRoom from "../components/CallRoom";

export default function DirectChatsPage() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null",
  );

  useEffect(() => {
    const loadChats = async () => {
      try {
        const { data } = await getMyDirectChats();
        setChats(Array.isArray(data) ? data : []);
        setActiveChat(data?.[0] || null);
      } catch (err) {
        console.error("Failed to load direct chats:", err);
      }
    };

    loadChats();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        if (!user?._id) return;
        if (activeCall) return;

        const { data } = await getIncomingCall(user._id);

        if (data?._id) {
          setIncomingCall(data);
        }
      } catch (err) {
        console.warn("Incoming call check failed:", err.response?.data);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeCall, user?._id]);

  return (
    <div className="h-[calc(100vh-100px)] bg-gray-100">
      <div className="flex h-full">
        <div className="w-[300px] border-r bg-white">
          <div className="border-b p-4 text-lg font-bold">💬 Chats</div>

          {chats.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No chats found</div>
          ) : (
            chats.map((chat) => {
              const other = chat.participants?.find((p) => p._id !== user?._id);

              return (
                <button
                  key={chat._id}
                  onClick={() => setActiveChat(chat)}
                  className={`w-full border-b px-4 py-3 text-left hover:bg-gray-50 ${
                    activeChat?._id === chat._id
                      ? "border-l-4 border-teal-500 bg-teal-50"
                      : ""
                  }`}
                >
                  <div className="font-semibold">{other?.name || "User"}</div>
                  <div className="truncate text-xs text-gray-500">
                    {other?.email}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex-1">
          {activeChat ? (
            <DirectChatBox chat={activeChat} user={user} />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Select a chat
            </div>
          )}
        </div>
      </div>

      <IncomingCallPopup
        call={incomingCall}
        onAccept={(call) => {
          setIncomingCall(null);
          setActiveCall(call);
        }}
        onReject={() => setIncomingCall(null)}
      />

      {activeCall && (
        <CallRoom
          channelName={activeCall.channelName}
          userId={user?._id}
          callId={activeCall._id}
          callType={activeCall.callType}
          onClose={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}
