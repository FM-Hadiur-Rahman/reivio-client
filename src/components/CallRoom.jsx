import { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

export default function CallRoom({ channelName, userId, onClose }) {
  const clientRef = useRef(
    AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }),
  );

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [joined, setJoined] = useState(false);

  useEffect(() => {
    let localAudioTrack;
    let localVideoTrack;

    const startCall = async () => {
      const client = clientRef.current;

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);

        if (mediaType === "video") {
          user.videoTrack.play(remoteVideoRef.current);
        }

        if (mediaType === "audio") {
          user.audioTrack.play();
        }
      });

      await client.join(APP_ID, channelName, null, userId || null);

      localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localVideoTrack = await AgoraRTC.createCameraVideoTrack();

      localVideoTrack.play(localVideoRef.current);

      await client.publish([localAudioTrack, localVideoTrack]);

      setJoined(true);
    };

    startCall();

    return () => {
      const cleanup = async () => {
        localAudioTrack?.close();
        localVideoTrack?.close();
        await clientRef.current.leave();
      };

      cleanup();
    };
  }, [channelName, userId]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white">
      <div className="grid h-full grid-cols-1 gap-4 p-4 md:grid-cols-2">
        <div className="rounded-2xl bg-gray-900 p-3">
          <p className="mb-2 font-bold">You</p>
          <div
            ref={localVideoRef}
            className="h-[400px] w-full rounded-xl bg-gray-800"
          />
        </div>

        <div className="rounded-2xl bg-gray-900 p-3">
          <p className="mb-2 font-bold">Other User</p>
          <div
            ref={remoteVideoRef}
            className="h-[400px] w-full rounded-xl bg-gray-800"
          />
        </div>
      </div>

      <button
        onClick={onClose}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-6 py-3 font-bold text-white"
      >
        End Call
      </button>

      {!joined && (
        <p className="fixed left-1/2 top-6 -translate-x-1/2">Joining call...</p>
      )}
    </div>
  );
}
