import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const EditProfilePage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || "",
    avatar: user.avatar || "",
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanValue = name === "phone" ? value.replace(/\s+/g, "") : value;
    setForm({ ...form, [name]: cleanValue });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "banglabnb_unsigned"); // replace with your actual preset

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dkftfpn0d/image/upload", // your Cloudinary cloud name
        formData
      );
      setForm((prev) => ({ ...prev, avatar: res.data.secure_url }));
    } catch (err) {
      console.error("Cloudinary Upload Failed:", err);
      alert("❌ Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const filteredPayload = {};
    Object.entries(form).forEach(([key, value]) => {
      if (value.trim() !== "") {
        filteredPayload[key] = value.trim();
      }
    });

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/users/me`,
        filteredPayload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // ✅ Only store token if returned
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("✅ Profile updated!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update profile.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

      <div className="text-center mb-4">
        <img
          src={form.avatar || "/default-avatar.png"}
          alt="Avatar"
          className="w-24 h-24 rounded-full mx-auto object-cover"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mt-2"
        />
        {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
      </div>

      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full border px-3 py-2 rounded"
        />

        <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Save Changes
        </button>
      </form>

      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
};

export default EditProfilePage;
