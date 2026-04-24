import { acceptDirectCall, rejectDirectCall } from "../api/directCallApi";

export default function IncomingCallPopup({ call, onAccept, onReject }) {
  if (!call) return null;

  const callerName = call.callerId?.name || "Someone";
  const isAudio = call.callType === "audio";

  const accept = async () => {
    const { data } = await acceptDirectCall(call._id);
    onAccept(data);
  };

  const reject = async () => {
    await rejectDirectCall(call._id);
    onReject();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] w-80 rounded-3xl border border-teal-200 bg-white p-5 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-2xl">
          {isAudio ? "📞" : "🎥"}
        </div>

        <div>
          <h3 className="font-extrabold text-slate-900">Incoming call</h3>
          <p className="text-sm text-slate-600">{callerName} is calling you</p>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={reject}
          className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white"
        >
          Reject
        </button>

        <button
          onClick={accept}
          className="flex-1 rounded-2xl bg-green-600 px-4 py-3 font-bold text-white"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
