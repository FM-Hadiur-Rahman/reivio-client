import { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { endDirectCall } from "../api/directCallApi";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

export default function CallRoom({
  channelName,
  userId,
  callId,
  callType = "video",
  onClose,
}) {
  const clientRef = useRef(
    AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }),
  );

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const localTracksRef = useRef([]);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  const audioOnly = callType === "audio";

  useEffect(() => {
    let mounted = true;

    const startCall = async () => {
      try {
        const client = clientRef.current;

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
          if (remoteVideoRef.current) remoteVideoRef.current.innerHTML = "";
        });

        await client.join(APP_ID, channelName, null, userId || null);

        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

        if (audioOnly) {
          localTracksRef.current = [audioTrack];
          await client.publish([audioTrack]);
        } else {
          const videoTrack = await AgoraRTC.createCameraVideoTrack();
          localTracksRef.current = [audioTrack, videoTrack];

          videoTrack.play(localVideoRef.current);
          await client.publish([audioTrack, videoTrack]);
        }

        if (mounted) setJoined(true);
      } catch (err) {
        console.error("Agora call error:", err);
        if (mounted) setError(err.message || "Call failed");
      }
    };

    startCall();

    return () => {
      mounted = false;

      const cleanup = async () => {
        try {
          localTracksRef.current.forEach((track) => {
            track.stop?.();
            track.close?.();
          });

          await clientRef.current.leave();
        } catch (err) {
          console.error("Call cleanup error:", err);
        }
      };

      cleanup();
    };
  }, [channelName, userId, audioOnly]);

  const handleEnd = async () => {
    try {
      if (callId) await endDirectCall(callId);
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold">
              {audioOnly ? "Audio Call" : "Video Call"}
            </h2>
            <p className="text-sm text-gray-300">
              {joined ? "Connected" : "Connecting..."}
            </p>
          </div>

          <button
            onClick={handleEnd}
            className="rounded-full bg-red-600 px-5 py-2 font-bold text-white"
          >
            End Call
          </button>
        </div>

        {error ? (
          <div className="flex flex-1 items-center justify-center text-red-300">
            {error}
          </div>
        ) : audioOnly ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="rounded-3xl bg-gray-900 p-10 text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-teal-600 text-4xl">
                📞
              </div>
              <h3 className="text-xl font-bold">Audio call active</h3>
              <p className="mt-2 text-sm text-gray-400">
                Keep this screen open during the call.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid flex-1 grid-cols-1 gap-4 p-4 md:grid-cols-2">
            <div className="rounded-2xl bg-gray-900 p-3">
              <p className="mb-2 text-sm font-bold">You</p>
              <div
                ref={localVideoRef}
                className="h-[420px] w-full rounded-xl bg-black"
              />
            </div>

            <div className="rounded-2xl bg-gray-900 p-3">
              <p className="mb-2 text-sm font-bold">Other User</p>
              <div
                ref={remoteVideoRef}
                className="h-[420px] w-full rounded-xl bg-black"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
