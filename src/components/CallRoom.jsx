import { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

export default function CallRoom({
  channelName,
  userId,
  callType = "video",
  onClose,
}) {
  const clientRef = useRef(
    AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }),
  );

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);

  const [status, setStatus] = useState("Connecting...");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const startCall = async () => {
      try {
        if (!APP_ID) {
          throw new Error("VITE_AGORA_APP_ID is missing");
        }

        if (!channelName) {
          throw new Error("channelName is missing");
        }

        const client = clientRef.current;

        const safeChannelName = String(channelName);
        const safeUid = userId
          ? Number(String(userId).replace(/\D/g, "").slice(-6))
          : Math.floor(Math.random() * 1000000);

        client.on("user-published", async (remoteUser, mediaType) => {
          await client.subscribe(remoteUser, mediaType);

          if (mediaType === "video" && remoteUser.videoTrack) {
            remoteUser.videoTrack.play(remoteVideoRef.current);
          }

          if (mediaType === "audio" && remoteUser.audioTrack) {
            remoteUser.audioTrack.play();
          }
        });

        client.on("user-unpublished", () => {
          console.log("Remote user unpublished");
        });

        await client.join(APP_ID, safeChannelName, null, safeUid);

        const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        localAudioTrackRef.current = localAudioTrack;

        if (callType === "video") {
          const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
          localVideoTrackRef.current = localVideoTrack;

          if (localVideoRef.current) {
            localVideoTrack.play(localVideoRef.current);
          }

          await client.publish([localAudioTrack, localVideoTrack]);
        } else {
          await client.publish([localAudioTrack]);
        }

        if (mounted) setStatus("Connected");
      } catch (err) {
        console.error("Agora call error:", err);
        if (mounted) {
          setError(err.message || "Call failed");
          setStatus("Call failed");
        }
      }
    };

    startCall();

    return () => {
      mounted = false;

      const cleanup = async () => {
        try {
          localAudioTrackRef.current?.close();
          localVideoTrackRef.current?.close();
          await clientRef.current.leave();
        } catch (err) {
          console.warn("Agora cleanup error:", err);
        }
      };

      cleanup();
    };
  }, [channelName, userId, callType]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h2 className="font-bold">
            {callType === "audio" ? "Audio Call" : "Video Call"}
          </h2>
          <p className="text-sm text-gray-300">{status}</p>
        </div>

        <button
          onClick={onClose}
          className="rounded-full bg-red-600 px-5 py-2 font-bold text-white hover:bg-red-700"
        >
          End Call
        </button>
      </div>

      {error ? (
        <div className="flex h-[80vh] items-center justify-center text-red-300">
          {error}
        </div>
      ) : callType === "audio" ? (
        <div className="flex h-[80vh] items-center justify-center">
          <div className="rounded-3xl bg-slate-900 p-10 text-center">
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-teal-600 text-4xl">
              📞
            </div>
            <h3 className="text-xl font-bold">Audio call active</h3>
            <p className="mt-2 text-sm text-gray-400">
              Keep this screen open during the call.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid h-[80vh] grid-cols-1 gap-4 p-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-900 p-3">
            <p className="mb-2 text-sm font-bold">You</p>
            <div
              ref={localVideoRef}
              className="h-[420px] w-full rounded-xl bg-black"
            />
          </div>

          <div className="rounded-2xl bg-slate-900 p-3">
            <p className="mb-2 text-sm font-bold">Other User</p>
            <div
              ref={remoteVideoRef}
              className="h-[420px] w-full rounded-xl bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
}
