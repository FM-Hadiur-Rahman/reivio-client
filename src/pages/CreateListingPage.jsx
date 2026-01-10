// // src/pages/CreateListingPage.jsx
// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import AdminLayout from "../components/AdminLayout"; // keep/remove if you wrap pages
// import MapboxAutocomplete from "../components/MapboxAutocomplete";
// import { divisions } from "../data/districts";
// import { api } from "../services/api";
// import { toast } from "react-toastify";

// const MAX_IMAGES = 10;
// const MAX_IMAGE_MB = 5;
// const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

// const CreateListingPage = () => {
//   const [form, setForm] = useState({
//     title: "",
//     price: "",
//     maxGuests: "",
//     division: "",
//     district: "",
//     roomType: "",
//     description: "",
//     houseRules: "",
//     location: null, // { type:'Point', coordinates:[lon,lat], address }
//   });
//   const [images, setImages] = useState([]);
//   const [previews, setPreviews] = useState([]); // object URLs
//   const [uploading, setUploading] = useState(false);
//   const [revgeoBusy, setRevgeoBusy] = useState(false);
//   const navigate = useNavigate();
//   const mountedRef = useRef(true);

//   // fresh snapshot of logged-in user
//   const user = useMemo(() => {
//     try {
//       return JSON.parse(localStorage.getItem("user")) || null;
//     } catch {
//       return null;
//     }
//   }, []);

//   const handleChange = (e) =>
//     setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

//   const extractAdminFromMapbox = useCallback(async (lon, lat) => {
//     try {
//       setRevgeoBusy(true);
//       const res = await fetch(
//         `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?types=place,region&access_token=${
//           import.meta.env.VITE_MAPBOX_TOKEN
//         }`
//       );
//       if (!res.ok) throw new Error(`Mapbox ${res.status}`);
//       const data = await res.json();
//       const features = data?.features ?? [];
//       const district = features.find((f) => f.place_type?.includes("place"));
//       const division = features.find((f) => f.place_type?.includes("region"));
//       setForm((prev) => ({
//         ...prev,
//         division: division?.text || prev.division || "",
//         district: district?.text || prev.district || "",
//       }));
//     } catch (err) {
//       console.warn("❌ Reverse geocoding failed", err);
//       toast.warn("Couldn’t auto-fill division/district. Please set manually.");
//     } finally {
//       setRevgeoBusy(false);
//     }
//   }, []);

//   const handleMapSelect = ({ coordinates, address }) => {
//     setForm((prev) => ({
//       ...prev,
//       location: { type: "Point", coordinates, address },
//     }));
//     extractAdminFromMapbox(coordinates[0], coordinates[1]);
//   };

//   const handleAutoDetect = () => {
//     if (!navigator.geolocation) {
//       toast.warn("Geolocation not supported in this browser.");
//       return;
//     }
//     navigator.geolocation.getCurrentPosition(
//       async (pos) => {
//         const lat = pos.coords.latitude;
//         const lon = pos.coords.longitude;
//         try {
//           const res = await fetch(
//             `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${
//               import.meta.env.VITE_MAPBOX_TOKEN
//             }`
//           );
//           const data = await res.json();
//           const address = data?.features?.[0]?.place_name || "";
//           setForm((prev) => ({
//             ...prev,
//             location: { type: "Point", coordinates: [lon, lat], address },
//           }));
//         } finally {
//           extractAdminFromMapbox(lon, lat);
//         }
//       },
//       () => toast.error("Failed to get current location.")
//     );
//   };

//   // image selection with validation
//   const onPickImages = (files) => {
//     const arr = Array.from(files || []);
//     if (!arr.length) return;
//     if (arr.length + images.length > MAX_IMAGES) {
//       toast.warn(`Max ${MAX_IMAGES} images allowed.`);
//       return;
//     }
//     const bad = arr.find(
//       (f) =>
//         !ALLOWED_TYPES.includes(f.type) || f.size > MAX_IMAGE_MB * 1024 * 1024
//     );
//     if (bad) {
//       toast.error(
//         `Only JPG/PNG/WebP/AVIF up to ${MAX_IMAGE_MB}MB each are allowed.`
//       );
//       return;
//     }
//     const next = [...images, ...arr];
//     setImages(next);

//     // previews
//     const newPrevs = arr.map((f) => URL.createObjectURL(f));
//     setPreviews((p) => [...p, ...newPrevs]);
//   };

//   const removeImage = (idx) => {
//     setImages((prev) => prev.filter((_, i) => i !== idx));
//     setPreviews((prev) => {
//       // revoke object URL
//       URL.revokeObjectURL(prev[idx]);
//       return prev.filter((_, i) => i !== idx);
//     });
//   };

//   // unload protection while uploading
//   useEffect(() => {
//     mountedRef.current = true;
//     const beforeUnload = (e) => {
//       if (uploading) {
//         e.preventDefault();
//         e.returnValue = "";
//       }
//     };
//     window.addEventListener("beforeunload", beforeUnload);
//     return () => {
//       mountedRef.current = false;
//       window.removeEventListener("beforeunload", beforeUnload);
//       previews.forEach((u) => URL.revokeObjectURL(u));
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [uploading]);

//   const token = useMemo(() => localStorage.getItem("token"), []);

//   const missingFlags = useMemo(() => {
//     if (!user) return [];
//     const out = [];
//     if (!(user.roles || []).includes("host")) out.push("Switch to Host");
//     if ((user?.kyc?.status || "").toLowerCase() !== "approved")
//       out.push("KYC approval");
//     if (!user?.identityVerified) out.push("ID + live selfie");
//     if (!user?.phoneVerified) out.push("Mobile verification");
//     if (!user?.paymentDetails?.verified) out.push("Payout method");
//     return out;
//   }, [user]);

//   const canSubmit =
//     !uploading &&
//     !!token &&
//     form.title.trim() &&
//     form.price &&
//     form.maxGuests &&
//     form.division &&
//     form.district &&
//     form.roomType &&
//     form.location &&
//     images.length > 0 &&
//     missingFlags.length === 0;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!token) {
//       toast.info("Please log in first.");
//       navigate("/login");
//       return;
//     }
//     if (!form.location)
//       return toast.warn("Please select a location on the map.");
//     if (!form.division || !form.district)
//       return toast.warn("Please select Division and District.");
//     if (images.length === 0)
//       return toast.warn("Please add at least one image.");
//     if (missingFlags.length > 0) {
//       toast.error(`Complete account setup: ${missingFlags.join(", ")}`);
//       return;
//     }

//     try {
//       setUploading(true);
//       const fd = new FormData();
//       images.forEach((img) => fd.append("images", img));
//       Object.entries({
//         title: form.title.trim(),
//         price: form.price,
//         maxGuests: form.maxGuests,
//         division: form.division,
//         district: form.district,
//         roomType: form.roomType,
//         description: form.description || "",
//         houseRules: form.houseRules || "",
//         location: JSON.stringify(form.location),
//       }).forEach(([k, v]) => fd.append(k, v));

//       await api.post("/api/listings", fd, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       toast.success("✅ Listing created!");
//       navigate("/host/dashboard");
//     } catch (err) {
//       const msg = err?.response?.data?.message || "Failed to create listing.";
//       toast.error(`❌ ${msg}`);
//       // Smart redirects by server message
//       const m = msg.toLowerCase();
//       if (m.includes("host")) navigate("/profile?tab=roles");
//       else if (m.includes("kyc")) navigate("/kyc");
//       else if (m.includes("upload id")) navigate("/verify-identity");
//       else if (m.includes("mobile") || m.includes("verify your mobile"))
//         navigate("/verify-phone");
//       else if (m.includes("payout")) navigate("/payout-setup");
//       console.error(err);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       encType="multipart/form-data"
//       className="max-w-3xl mx-auto p-4 bg-white shadow rounded space-y-4"
//     >
//       <h2 className="text-2xl font-bold text-center">🏠 Create New Listing</h2>

//       {/* Host readiness banner */}
//       {user && (
//         <div className="text-sm rounded border p-3">
//           <div className="font-medium mb-1">Account status</div>
//           <ul className="list-disc ml-5 space-y-1">
//             <li
//               className={
//                 user?.kyc?.status === "approved"
//                   ? "text-green-700"
//                   : "text-red-700"
//               }
//             >
//               KYC: {user?.kyc?.status || "unknown"}{" "}
//               {user?.kyc?.status !== "approved" && (
//                 <Link to="/kyc" className="text-blue-600 underline ml-1">
//                   Fix
//                 </Link>
//               )}
//             </li>
//             <li
//               className={
//                 user?.identityVerified ? "text-green-700" : "text-red-700"
//               }
//             >
//               Identity: {user?.identityVerified ? "verified" : "not verified"}{" "}
//               {!user?.identityVerified && (
//                 <Link
//                   to="/verify-identity"
//                   className="text-blue-600 underline ml-1"
//                 >
//                   Verify
//                 </Link>
//               )}
//             </li>
//             <li
//               className={
//                 user?.phoneVerified ? "text-green-700" : "text-red-700"
//               }
//             >
//               Mobile: {user?.phoneVerified ? "verified" : "not verified"}{" "}
//               {!user?.phoneVerified && (
//                 <Link
//                   to="/verify-phone"
//                   className="text-blue-600 underline ml-1"
//                 >
//                   Verify
//                 </Link>
//               )}
//             </li>
//             <li
//               className={
//                 user?.paymentDetails?.verified
//                   ? "text-green-700"
//                   : "text-red-700"
//               }
//             >
//               Payout:{" "}
//               {user?.paymentDetails?.verified ? "verified" : "not verified"}{" "}
//               {!user?.paymentDetails?.verified && (
//                 <Link
//                   to="/payment-details"
//                   className="text-blue-600 underline ml-1"
//                 >
//                   Add
//                 </Link>
//               )}
//             </li>
//           </ul>
//           {missingFlags.length > 0 && (
//             <div className="text-red-700 mt-2">
//               🔒 You can’t publish yet. Missing: {missingFlags.join(", ")}.
//             </div>
//           )}
//         </div>
//       )}

//       <input
//         name="title"
//         placeholder="Listing Title"
//         value={form.title}
//         onChange={handleChange}
//         className="w-full p-2 border rounded"
//         required
//       />

//       {/* Division & District */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <select
//           name="division"
//           onChange={handleChange}
//           value={form.division}
//           className="w-full p-2 border rounded"
//           required
//         >
//           <option value="">Select Division</option>
//           {Object.keys(divisions).map((div) => (
//             <option key={div} value={div}>
//               {div}
//             </option>
//           ))}
//         </select>

//         <select
//           name="district"
//           onChange={handleChange}
//           value={form.district}
//           className="w-full p-2 border rounded"
//           required
//         >
//           <option value="">Select District</option>
//           {(divisions[form.division] || []).map((d) => (
//             <option key={d} value={d}>
//               {d}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Room Type */}
//       <select
//         name="roomType"
//         value={form.roomType}
//         onChange={handleChange}
//         className="w-full p-2 border rounded"
//         required
//       >
//         <option value="">Select Room Type</option>
//         <option value="Hotel">Hotel</option>
//         <option value="Resort">Resort</option>
//         <option value="Guest House">Guest House</option>
//         <option value="Personal Property">Personal Property</option>
//         <option value="Other">Other</option>
//       </select>

//       <textarea
//         name="description"
//         placeholder="e.g. A cozy cottage near the tea gardens of Sylhet with free breakfast and Wi-Fi."
//         value={form.description}
//         onChange={handleChange}
//         className="w-full p-2 border rounded"
//         rows={4}
//       />

//       <textarea
//         name="houseRules"
//         placeholder="e.g. No smoking, Check-out by 11am, No loud music after 10pm"
//         value={form.houseRules}
//         onChange={handleChange}
//         className="w-full p-2 border rounded"
//         rows={3}
//       />

//       {/* Price, Guests, Auto Detect */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <input
//           name="price"
//           type="number"
//           placeholder="Price per night (BDT)"
//           value={form.price}
//           onChange={handleChange}
//           className="w-full p-2 border rounded"
//           min={1}
//           required
//         />
//         <input
//           name="maxGuests"
//           type="number"
//           placeholder="Max Guests"
//           value={form.maxGuests}
//           onChange={handleChange}
//           className="w-full p-2 border rounded"
//           min={1}
//           required
//         />
//         <button
//           type="button"
//           onClick={handleAutoDetect}
//           className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2"
//           disabled={revgeoBusy}
//         >
//           {revgeoBusy ? "📍 Detecting…" : "📍 Auto-detect Location"}
//         </button>
//       </div>

//       <label className="block font-medium mt-4 mb-1">🗺 Select on Map</label>
//       <MapboxAutocomplete
//         onSelectLocation={handleMapSelect}
//         formLocation={form.location}
//       />
//       {form.location?.address && (
//         <p className="text-sm text-gray-600 mt-1">
//           📌 Selected Location: {form.location.address}
//         </p>
//       )}

//       {/* Upload Images */}
//       <div>
//         <input
//           name="images"
//           type="file"
//           accept={ALLOWED_TYPES.join(",")}
//           multiple
//           onChange={(e) => onPickImages(e.target.files)}
//           className="w-full mt-2"
//           required
//         />
//         <p className="text-xs text-gray-500 mt-1">
//           Up to {MAX_IMAGES} images. JPG/PNG/WebP/AVIF, max {MAX_IMAGE_MB}MB
//           each.
//         </p>
//       </div>

//       {previews.length > 0 && (
//         <div className="flex gap-2 flex-wrap mt-2">
//           {previews.map((src, i) => (
//             <div key={i} className="relative">
//               <img
//                 src={src}
//                 className="w-20 h-20 object-cover rounded border"
//                 alt="Preview"
//               />
//               <button
//                 type="button"
//                 onClick={() => removeImage(i)}
//                 className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-6 h-6 leading-6 text-center"
//                 aria-label="Remove"
//               >
//                 ×
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       {uploading && (
//         <p className="text-sm text-blue-600">
//           Uploading… Don’t close this tab.
//         </p>
//       )}

//       <button
//         type="submit"
//         className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded w-full disabled:opacity-60"
//         disabled={!canSubmit}
//         title={
//           !canSubmit ? "Complete form & account checks to enable" : undefined
//         }
//       >
//         {uploading ? "Uploading…" : "✅ Submit Listing"}
//       </button>
//     </form>
//   );
// };

// export default CreateListingPage;

// src/pages/CreateListingPage.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import MapboxAutocomplete from "../components/MapboxAutocomplete";
import { divisions } from "../data/districts";
import { api } from "../services/api";
import { toast } from "react-toastify";

const MAX_IMAGES = 10;
const MAX_IMAGE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export default function CreateListingPage() {
  const [form, setForm] = useState({
    title: "",
    price: "",
    maxGuests: "",
    division: "",
    district: "",
    roomType: "",
    description: "",
    houseRules: "",
    location: null,
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [revgeoBusy, setRevgeoBusy] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();
  const mountedRef = useRef(true);
  const token = useMemo(() => localStorage.getItem("token"), []);

  // 🔄 Always fetch fresh profile (keeps localStorage in sync)
  const refreshMe = useCallback(async () => {
    try {
      const res = await api.get("/api/users/me");
      const u = res?.data?.user ?? res?.data;
      if (u) {
        setUser(u);
        localStorage.setItem("user", JSON.stringify(u));
      }
    } catch (e) {
      console.warn("Failed to refresh user", e);
    }
  }, []);

  useEffect(() => {
    refreshMe();
    const onFocus = () => refreshMe(); // update when returning to tab
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshMe]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const extractAdminFromMapbox = useCallback(async (lon, lat) => {
    try {
      setRevgeoBusy(true);
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?types=place,region&access_token=${
          import.meta.env.VITE_MAPBOX_TOKEN
        }`
      );
      if (!res.ok) throw new Error(`Mapbox ${res.status}`);
      const data = await res.json();
      const features = data?.features ?? [];
      const district = features.find((f) => f.place_type?.includes("place"));
      const division = features.find((f) => f.place_type?.includes("region"));
      setForm((prev) => ({
        ...prev,
        division: division?.text || prev.division || "",
        district: district?.text || prev.district || "",
      }));
    } catch (err) {
      console.warn("❌ Reverse geocoding failed", err);
      toast.warn("Couldn’t auto-fill division/district. Please set manually.");
    } finally {
      setRevgeoBusy(false);
    }
  }, []);

  const handleMapSelect = ({ coordinates, address }) => {
    setForm((prev) => ({
      ...prev,
      location: { type: "Point", coordinates, address },
    }));
    extractAdminFromMapbox(coordinates[0], coordinates[1]);
  };

  const handleAutoDetect = () => {
    if (!navigator.geolocation) return toast.warn("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${
              import.meta.env.VITE_MAPBOX_TOKEN
            }`
          );
          const data = await res.json();
          const address = data?.features?.[0]?.place_name || "";
          setForm((prev) => ({
            ...prev,
            location: { type: "Point", coordinates: [lon, lat], address },
          }));
        } finally {
          extractAdminFromMapbox(lon, lat);
        }
      },
      () => toast.error("Failed to get current location.")
    );
  };

  const onPickImages = (files) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;
    if (arr.length + images.length > MAX_IMAGES)
      return toast.warn(`Max ${MAX_IMAGES} images allowed.`);
    const bad = arr.find(
      (f) =>
        !ALLOWED_TYPES.includes(f.type) || f.size > MAX_IMAGE_MB * 1024 * 1024
    );
    if (bad)
      return toast.error(
        `Only JPG/PNG/WebP/AVIF up to ${MAX_IMAGE_MB}MB each are allowed.`
      );
    setImages((prev) => [...prev, ...arr]);
    setPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  useEffect(() => {
    mountedRef.current = true;
    const beforeUnload = (e) => {
      if (uploading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      mountedRef.current = false;
      window.removeEventListener("beforeunload", beforeUnload);
      previews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [uploading, previews]);

  // ✅ Consider either verified flag OR approved status
  const payoutVerified = Boolean(
    user?.paymentDetails?.verified ||
      (user?.paymentDetails?.status || "").toLowerCase() === "approved"
  );

  const missingFlags = useMemo(() => {
    if (!user) return [];
    const out = [];
    if (!(user.roles || []).includes("host")) out.push("Switch to Host");
    if ((user?.kyc?.status || "").toLowerCase() !== "approved")
      out.push("KYC approval");
    if (!user?.identityVerified) out.push("ID + live selfie");
    if (!user?.phoneVerified) out.push("Mobile verification");
    if (!payoutVerified) out.push("Payout method");
    return out;
  }, [user, payoutVerified]);

  const canSubmit =
    !uploading &&
    !!token &&
    form.title.trim() &&
    form.price &&
    form.maxGuests &&
    form.division &&
    form.district &&
    form.roomType &&
    form.location &&
    images.length > 0 &&
    missingFlags.length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.info("Please log in first.");
      navigate("/login");
      return;
    }
    if (!form.location)
      return toast.warn("Please select a location on the map.");
    if (!form.division || !form.district)
      return toast.warn("Please select Division and District.");
    if (images.length === 0)
      return toast.warn("Please add at least one image.");
    if (missingFlags.length > 0)
      return toast.error(`Complete account setup: ${missingFlags.join(", ")}`);

    try {
      setUploading(true);
      const fd = new FormData();
      images.forEach((img) => fd.append("images", img));
      Object.entries({
        title: form.title.trim(),
        price: form.price,
        maxGuests: form.maxGuests,
        division: form.division,
        district: form.district,
        roomType: form.roomType,
        description: form.description || "",
        houseRules: form.houseRules || "",
        location: JSON.stringify(form.location),
      }).forEach(([k, v]) => fd.append(k, v));

      await api.post("/api/listings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("✅ Listing created!");
      navigate("/host/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create listing.";
      toast.error(`❌ ${msg}`);
      const m = msg.toLowerCase();
      if (m.includes("host")) navigate("/profile?tab=roles");
      else if (m.includes("kyc")) navigate("/kyc");
      else if (m.includes("upload id")) navigate("/verify-identity");
      else if (m.includes("mobile")) navigate("/verify-phone");
      else if (m.includes("payout")) navigate("/payment-details");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="max-w-3xl mx-auto p-4 bg-white shadow rounded space-y-4"
    >
      <h2 className="text-2xl font-bold text-center">🏠 Create New Listing</h2>

      {user && (
        <div className="text-sm rounded border p-3">
          <div className="font-medium mb-1">Account status</div>
          <ul className="list-disc ml-5 space-y-1">
            <li
              className={
                user?.kyc?.status === "approved"
                  ? "text-green-700"
                  : "text-red-700"
              }
            >
              KYC: {user?.kyc?.status || "unknown"}{" "}
              {user?.kyc?.status !== "approved" && (
                <Link to="/kyc" className="text-blue-600 underline ml-1">
                  Fix
                </Link>
              )}
            </li>
            <li
              className={
                user?.identityVerified ? "text-green-700" : "text-red-700"
              }
            >
              Identity: {user?.identityVerified ? "verified" : "not verified"}{" "}
              {!user?.identityVerified && (
                <Link
                  to="/verify-identity"
                  className="text-blue-600 underline ml-1"
                >
                  Verify
                </Link>
              )}
            </li>
            <li
              className={
                user?.phoneVerified ? "text-green-700" : "text-red-700"
              }
            >
              Mobile: {user?.phoneVerified ? "verified" : "not verified"}{" "}
              {!user?.phoneVerified && (
                <Link
                  to="/verify-phone"
                  className="text-blue-600 underline ml-1"
                >
                  Verify
                </Link>
              )}
            </li>
            <li className={payoutVerified ? "text-green-700" : "text-red-700"}>
              Payout: {payoutVerified ? "verified" : "not verified"}{" "}
              {!payoutVerified && (
                <Link
                  to="/payment-details"
                  className="text-blue-600 underline ml-1"
                >
                  Add
                </Link>
              )}
            </li>
          </ul>
          {missingFlags.length > 0 && (
            <div className="text-red-700 mt-2">
              🔒 You can’t publish yet. Missing: {missingFlags.join(", ")}.
              <button
                onClick={refreshMe}
                type="button"
                className="ml-2 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      )}

      <input
        name="title"
        placeholder="Listing Title"
        value={form.title}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          name="division"
          onChange={handleChange}
          value={form.division}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Division</option>
          {Object.keys(divisions).map((div) => (
            <option key={div} value={div}>
              {div}
            </option>
          ))}
        </select>
        <select
          name="district"
          onChange={handleChange}
          value={form.district}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select District</option>
          {(divisions[form.division] || []).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <select
        name="roomType"
        value={form.roomType}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      >
        <option value="">Select Room Type</option>
        <option value="Hotel">Hotel</option>
        <option value="Resort">Resort</option>
        <option value="Guest House">Guest House</option>
        <option value="Personal Property">Personal Property</option>
        <option value="Other">Other</option>
      </select>

      <textarea
        name="description"
        placeholder="e.g. A cozy cottage…"
        value={form.description}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        rows={4}
      />
      <textarea
        name="houseRules"
        placeholder="e.g. No smoking…"
        value={form.houseRules}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          name="price"
          type="number"
          placeholder="Price per night (BDT)"
          value={form.price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          min={1}
          required
        />
        <input
          name="maxGuests"
          type="number"
          placeholder="Max Guests"
          value={form.maxGuests}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          min={1}
          required
        />
        <button
          type="button"
          onClick={handleAutoDetect}
          className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2"
          disabled={revgeoBusy}
        >
          {revgeoBusy ? "📍 Detecting…" : "📍 Auto-detect Location"}
        </button>
      </div>

      <label className="block font-medium mt-4 mb-1">🗺 Select on Map</label>
      <MapboxAutocomplete
        onSelectLocation={handleMapSelect}
        formLocation={form.location}
      />
      {form.location?.address && (
        <p className="text-sm text-gray-600 mt-1">
          📌 Selected Location: {form.location.address}
        </p>
      )}

      <div>
        <input
          name="images"
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          onChange={(e) => onPickImages(e.target.files)}
          className="w-full mt-2"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Up to {MAX_IMAGES} images. JPG/PNG/WebP/AVIF, max {MAX_IMAGE_MB}MB
          each.
        </p>
      </div>

      {previews.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {previews.map((src, i) => (
            <div key={i} className="relative">
              <img
                src={src}
                className="w-20 h-20 object-cover rounded border"
                alt="Preview"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-6 h-6 leading-6 text-center"
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <p className="text-sm text-blue-600">
          Uploading… Don’t close this tab.
        </p>
      )}

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded w-full disabled:opacity-60"
        disabled={!canSubmit}
        title={
          !canSubmit ? "Complete form & account checks to enable" : undefined
        }
      >
        {uploading ? "Uploading…" : "✅ Submit Listing"}
      </button>
    </form>
  );
}
