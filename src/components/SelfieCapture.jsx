import React, { useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";

const SelfieCapture = ({
  onCapture,
  title = "Take a live selfie (optional)",
  subtitle = "Hold your ID next to your face and keep it readable.",
}) => {
  const webcamRef = useRef(null);

  const [image, setImage] = useState(null); // base64
  const [cameraError, setCameraError] = useState("");
  const [permissionState, setPermissionState] = useState("idle");
  // "idle" | "ready" | "blocked"

  // Front camera default (best for selfie)
  const [facingMode, setFacingMode] = useState("user"); // "user" | "environment"

  const videoConstraints = useMemo(
    () => ({
      facingMode,
      width: { ideal: 720 },
      height: { ideal: 960 },
    }),
    [facingMode],
  );

  const capture = () => {
    setCameraError("");
    const shot = webcamRef.current?.getScreenshot();
    if (!shot) {
      setCameraError("Could not capture image. Please try again.");
      return;
    }
    setImage(shot);
  };

  const confirm = () => {
    if (!image) return;
    onCapture(image);
  };

  const retake = () => {
    setImage(null);
    onCapture(null); // optional: lets parent clear state
  };

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>

        {/* Flip camera (if device supports) */}
        <button
          type="button"
          onClick={() =>
            setFacingMode((p) => (p === "user" ? "environment" : "user"))
          }
          className="rounded-xl border px-3 py-1.5 text-xs font-semibold hover:bg-gray-50"
        >
          Flip
        </button>
      </div>

      <div className="mt-4">
        {/* Preview / Camera */}
        <div className="relative overflow-hidden rounded-2xl border bg-gray-50">
          {!image ? (
            <>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                screenshotQuality={0.92}
                videoConstraints={videoConstraints}
                onUserMedia={() => {
                  setPermissionState("ready");
                  setCameraError("");
                }}
                onUserMediaError={(err) => {
                  console.error("Webcam error:", err);
                  setPermissionState("blocked");
                  setCameraError(
                    "Camera permission blocked. Please allow camera access in your browser settings.",
                  );
                }}
                className="h-72 w-full object-cover md:h-80"
              />

              {/* subtle overlay helper */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-2xl border border-white/60 bg-black/20 px-3 py-2 text-xs font-semibold text-white">
                  Keep face + ID visible
                </div>
              </div>
            </>
          ) : (
            <img
              src={image}
              alt="Selfie preview"
              className="h-72 w-full object-cover md:h-80"
            />
          )}
        </div>

        {/* Errors */}
        {cameraError ? (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {cameraError}
          </div>
        ) : null}

        {/* Buttons */}
        <div className="mt-4 flex flex-col gap-2 md:flex-row">
          {!image ? (
            <button
              type="button"
              onClick={capture}
              disabled={permissionState === "blocked"}
              className="w-full rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
            >
              📸 Capture selfie
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={confirm}
                className="w-full rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700"
              >
                ✅ Use this photo
              </button>
              <button
                type="button"
                onClick={retake}
                className="w-full rounded-2xl border px-4 py-3 text-sm font-semibold hover:bg-gray-50"
              >
                ↩️ Retake
              </button>
            </>
          )}
        </div>

        {/* Tiny helper */}
        <p className="mt-3 text-xs text-gray-500">
          Tip: Use good lighting. Make sure your ID text is readable.
        </p>
      </div>
    </div>
  );
};

export default SelfieCapture;
