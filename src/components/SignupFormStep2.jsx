// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import SelfieCapture from "../components/SelfieCapture"; // ✅ import it

// const SignupFormStep2 = () => {
//   const [idDocument, setIdDocument] = useState(null);
//   const [idBack, setIdBack] = useState(null);

//   // in SignupFormStep2.jsx
//   const [livePhotoFile, setLivePhotoFile] = useState(null);
//   const [livePhotoBase64, setLivePhotoBase64] = useState(null);

//   const [message, setMessage] = useState("");

//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const userId = searchParams.get("userId");
//   const [drivingLicense, setDrivingLicense] = useState(null);
//   const role = searchParams.get("role");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const formData = new FormData();
//     formData.append("userId", userId);
//     formData.append("idDocument", idDocument);
//     formData.append("idBack", idBack); // ✅ NEW
//     if (drivingLicense) {
//       formData.append("drivingLicense", drivingLicense);
//     }

//     if (livePhotoFile) {
//       formData.append("livePhoto", livePhotoFile);
//     } else if (livePhotoBase64) {
//       formData.append("livePhotoBase64", livePhotoBase64);
//     }

//     try {
//       await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/auth/signup/step2`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       localStorage.removeItem("signupUserId");
//       setMessage("✅ Identity verification submitted. Awaiting approval.");
//       navigate("/login");
//     } catch (err) {
//       console.error(err);
//       setMessage("❌ Failed to submit verification.");
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="space-y-4 p-4 bg-white rounded shadow-md max-w-md mx-auto mt-10"
//     >
//       <h2 className="text-xl font-bold text-center mb-2">
//         Step 2: Identity Verification
//       </h2>

//       <label className="block">Upload NID or Passport</label>
//       <input
//         type="file"
//         accept="image/*,application/pdf"
//         onChange={(e) => setIdDocument(e.target.files[0])}
//         required
//       />
//       <label className="block">Upload Back Side of ID</label>
//       <input
//         type="file"
//         accept="image/*,application/pdf"
//         onChange={(e) => setIdBack(e.target.files[0])}
//         required
//       />

//       <label className="block">Upload Live Photo Holding ID (Optional)</label>
//       <input
//         type="file"
//         accept="image/*"
//         onChange={(e) => {
//           setLivePhotoBase64(null);
//           setLivePhotoFile(e.target.files[0]);
//         }}
//       />
//       {role === "driver" && (
//         <>
//           <label className="block">Upload Driving License</label>
//           <input
//             type="file"
//             accept="image/*,application/pdf"
//             onChange={(e) => setDrivingLicense(e.target.files[0])}
//             required
//           />
//         </>
//       )}

//       <p className="text-sm text-gray-500">OR take a live selfie</p>
//       <SelfieCapture
//         onCapture={(img) => {
//           setLivePhotoFile(null); // disable file upload if using camera
//           setLivePhotoBase64(img);
//         }}
//       />

//       <button
//         type="submit"
//         className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
//       >
//         Submit for Review
//       </button>

//       {message && <p className="mt-2 text-center text-red-500">{message}</p>}
//     </form>
//   );
// };

// export default SignupFormStep2;

import React, { useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import SelfieCapture from "../components/SelfieCapture";

const SignupFormStep2 = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userId = searchParams.get("userId");
  const role = (searchParams.get("role") || "").toLowerCase();

  const apiUrl = useMemo(() => import.meta.env.VITE_API_URL, []);

  const [idDocument, setIdDocument] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [drivingLicense, setDrivingLicense] = useState(null);

  const [livePhotoFile, setLivePhotoFile] = useState(null);
  const [livePhotoBase64, setLivePhotoBase64] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalMessage, setGlobalMessage] = useState("");
  const [globalType, setGlobalType] = useState("error"); // "error" | "success"

  const showGlobal = (msg, type = "error") => {
    setGlobalMessage(msg);
    setGlobalType(type);
  };

  const clearFieldError = (key) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  // ---------- Helpers ----------
  const validateFrontend = () => {
    const errs = {};

    if (!userId) errs.userId = "Missing userId. Please restart signup.";
    if (!idDocument) errs.idDocument = "Front side of ID is required.";
    if (!idBack) errs.idBack = "Back side of ID is required.";

    if (role === "driver" && !drivingLicense) {
      errs.drivingLicense = "Driving license is required for drivers.";
    }

    // Live photo is optional (your rule) — no error
    return errs;
  };

  const fileInfo = (file) => {
    if (!file) return null;
    const isImage = file.type?.startsWith("image/");
    const previewUrl = isImage ? URL.createObjectURL(file) : null;
    return { name: file.name, size: file.size, type: file.type, previewUrl };
  };

  const FileCard = ({ label, required, value, onPick, onRemove, errorKey }) => {
    const info = value ? fileInfo(value) : null;

    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-900">
              {label} {required && <span className="text-red-500">*</span>}
            </p>
            <p className="text-xs text-gray-500">
              JPG/PNG/PDF accepted (max reasonable size)
            </p>
          </div>

          {value ? (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Remove
            </button>
          ) : null}
        </div>

        <div className="mt-3">
          {!value ? (
            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
              Upload file
              <input
                type="file"
                className="hidden"
                accept="image/*,application/pdf"
                onChange={(e) => onPick(e.target.files?.[0] || null)}
              />
            </label>
          ) : (
            <div className="flex items-center gap-3">
              {info?.previewUrl ? (
                <img
                  src={info.previewUrl}
                  alt="preview"
                  className="h-14 w-14 rounded-xl object-cover border"
                />
              ) : (
                <div className="h-14 w-14 rounded-xl border flex items-center justify-center text-xs text-gray-500">
                  PDF
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {info?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(info?.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

          {fieldErrors?.[errorKey] ? (
            <p className="mt-2 text-sm text-red-600">{fieldErrors[errorKey]}</p>
          ) : null}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalMessage("");

    const fe = validateFrontend();
    if (Object.keys(fe).length) {
      setFieldErrors(fe);
      showGlobal("Please fix the highlighted fields.");
      return;
    }

    const fd = new FormData();
    fd.append("userId", userId);
    fd.append("idDocument", idDocument);
    fd.append("idBack", idBack);

    if (role === "driver" && drivingLicense)
      fd.append("drivingLicense", drivingLicense);

    // live photo optional: either file OR base64
    if (livePhotoFile) fd.append("livePhoto", livePhotoFile);
    else if (livePhotoBase64) fd.append("livePhotoBase64", livePhotoBase64);

    setIsLoading(true);
    try {
      await axios.post(`${apiUrl}/api/auth/signup/step2`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      localStorage.removeItem("signupUserId");
      showGlobal("✅ Verification submitted. Awaiting approval.", "success");

      // small delay not needed; go immediately
      navigate("/login");
    } catch (err) {
      console.error(err);
      const data = err?.response?.data;

      if (err?.response?.status === 400 && data?.fields) {
        setFieldErrors(data.fields);
        showGlobal(data.message || "Validation failed. Please check fields.");
        return;
      }

      showGlobal(data?.message || "❌ Failed to submit verification.");
    } finally {
      setIsLoading(false);
    }
  };

  const selfieMode = livePhotoBase64
    ? "camera"
    : livePhotoFile
      ? "upload"
      : "none";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-teal-50 to-white px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              Identity Verification
            </h1>
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
              Step 2 of 2
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Upload your documents to keep Reivio safe. This helps prevent fake
            accounts.
          </p>
        </div>

        {/* Global message */}
        {globalMessage ? (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm ${
              globalType === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {globalMessage}
          </div>
        ) : null}

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border bg-white p-5 md:p-6 shadow-sm"
        >
          {/* Progress bar */}
          <div className="mb-6">
            <div className="h-2 w-full rounded-full bg-gray-100">
              <div className="h-2 w-full rounded-full bg-teal-500" />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>Account created</span>
              <span>Verification submitted</span>
            </div>
          </div>

          {/* Missing userId */}
          {fieldErrors.userId ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {fieldErrors.userId}{" "}
              <Link className="underline font-semibold" to="/register">
                Go to signup
              </Link>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileCard
              label="Front side (NID / Passport)"
              required
              value={idDocument}
              errorKey="idDocument"
              onPick={(f) => {
                setIdDocument(f);
                clearFieldError("idDocument");
              }}
              onRemove={() => {
                setIdDocument(null);
                clearFieldError("idDocument");
              }}
            />

            <FileCard
              label="Back side (NID / Passport)"
              required
              value={idBack}
              errorKey="idBack"
              onPick={(f) => {
                setIdBack(f);
                clearFieldError("idBack");
              }}
              onRemove={() => {
                setIdBack(null);
                clearFieldError("idBack");
              }}
            />
          </div>

          {/* Driver license */}
          {role === "driver" ? (
            <div className="mt-4">
              <FileCard
                label="Driving license"
                required
                value={drivingLicense}
                errorKey="drivingLicense"
                onPick={(f) => {
                  setDrivingLicense(f);
                  clearFieldError("drivingLicense");
                }}
                onRemove={() => {
                  setDrivingLicense(null);
                  clearFieldError("drivingLicense");
                }}
              />
            </div>
          ) : null}

          {/* Live photo optional */}
          <div className="mt-6 rounded-2xl border bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">
                  Live photo holding ID{" "}
                  <span className="text-gray-500">(optional)</span>
                </p>
                <p className="text-xs text-gray-600">
                  You can upload a photo or take a selfie using camera.
                </p>
              </div>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold border">
                Mode:{" "}
                {selfieMode === "camera"
                  ? "Camera"
                  : selfieMode === "upload"
                    ? "Upload"
                    : "Not added"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Upload option */}
              <div className="rounded-2xl border bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">
                  Upload photo
                </p>
                <p className="text-xs text-gray-500 mb-3">JPG/PNG</p>

                {!livePhotoFile ? (
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
                    Choose photo
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        setLivePhotoBase64(null);
                        setLivePhotoFile(e.target.files?.[0] || null);
                      }}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm text-gray-900">
                      {livePhotoFile.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => setLivePhotoFile(null)}
                      className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Camera option */}
              <div className="rounded-2xl border bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">
                  Take selfie
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Uses device camera (recommended)
                </p>

                <SelfieCapture
                  onCapture={(img) => {
                    setLivePhotoFile(null);
                    setLivePhotoBase64(img);
                  }}
                />

                {livePhotoBase64 ? (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-green-700 font-semibold">
                      ✅ Selfie captured
                    </p>
                    <button
                      type="button"
                      onClick={() => setLivePhotoBase64(null)}
                      className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col md:flex-row gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:flex-1 rounded-2xl bg-teal-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-60"
            >
              {isLoading ? "Submitting..." : "Submit for review"}
            </button>

            <Link
              to="/login"
              className="w-full md:w-auto rounded-2xl border px-4 py-3 text-center font-semibold text-gray-800 hover:bg-gray-50"
            >
              I’ll do this later
            </Link>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            By submitting, you confirm the documents are genuine. Reviews may
            take time depending on volume.
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupFormStep2;
