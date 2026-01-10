import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

const SelfieCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);

  const capture = () => {
    const screenshot = webcamRef.current.getScreenshot();
    setImage(screenshot);
    onCapture(screenshot); // 🔁 pass to parent
  };

  return (
    <div className="my-4">
      <h4 className="font-semibold mb-2">📸 Capture Live Selfie with ID</h4>
      {!image ? (
        <>
          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
          <button
            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
            onClick={capture}
          >
            📸 Capture
          </button>
        </>
      ) : (
        <>
          <img src={image} alt="Captured Selfie" className="w-40 my-2" />
          <button
            onClick={() => setImage(null)}
            className="bg-yellow-600 text-white px-3 py-1 rounded"
          >
            ↩️ Retake
          </button>
        </>
      )}
    </div>
  );
};

export default SelfieCapture;
