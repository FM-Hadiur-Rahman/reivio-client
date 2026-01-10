import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import SelfieCapture from "../components/SelfieCapture"; // ✅ import it

const SignupFormStep2 = () => {
  const [idDocument, setIdDocument] = useState(null);
  const [idBack, setIdBack] = useState(null);

  // in SignupFormStep2.jsx
  const [livePhotoFile, setLivePhotoFile] = useState(null);
  const [livePhotoBase64, setLivePhotoBase64] = useState(null);

  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const [drivingLicense, setDrivingLicense] = useState(null);
  const role = searchParams.get("role");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("idDocument", idDocument);
    formData.append("idBack", idBack); // ✅ NEW
    if (drivingLicense) {
      formData.append("drivingLicense", drivingLicense);
    }

    if (livePhotoFile) {
      formData.append("livePhoto", livePhotoFile);
    } else if (livePhotoBase64) {
      formData.append("livePhotoBase64", livePhotoBase64);
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/signup/step2`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      localStorage.removeItem("signupUserId");
      setMessage("✅ Identity verification submitted. Awaiting approval.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to submit verification.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded shadow-md max-w-md mx-auto mt-10"
    >
      <h2 className="text-xl font-bold text-center mb-2">
        Step 2: Identity Verification
      </h2>

      <label className="block">Upload NID or Passport</label>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => setIdDocument(e.target.files[0])}
        required
      />
      <label className="block">Upload Back Side of ID</label>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => setIdBack(e.target.files[0])}
        required
      />

      <label className="block">Upload Live Photo Holding ID (Optional)</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          setLivePhotoBase64(null);
          setLivePhotoFile(e.target.files[0]);
        }}
      />
      {role === "driver" && (
        <>
          <label className="block">Upload Driving License</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setDrivingLicense(e.target.files[0])}
            required
          />
        </>
      )}

      <p className="text-sm text-gray-500">OR take a live selfie</p>
      <SelfieCapture
        onCapture={(img) => {
          setLivePhotoFile(null); // disable file upload if using camera
          setLivePhotoBase64(img);
        }}
      />

      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
      >
        Submit for Review
      </button>

      {message && <p className="mt-2 text-center text-red-500">{message}</p>}
    </form>
  );
};

export default SignupFormStep2;
