// EditListingPage.jsx - Update Listing (Basic)
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditListingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    image: "",
  });

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/listings/${id}`)
      .then((res) => setForm(res.data));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token"); // ✅ get the token

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/listings/${id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ send auth token
            "Content-Type": "application/json",
          },
        }
      );

      alert("✅ Listing updated!");
      navigate("/host/dashboard");
    } catch (err) {
      console.error("❌ Update failed:", err);
      alert("Failed to update listing. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4">
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        className="w-full p-2 border mb-2"
      />
      <input
        name="location"
        value={form.location?.address}
        onChange={handleChange}
        className="w-full p-2 border mb-2"
      />
      <input
        name="price"
        value={form.price}
        type="number"
        onChange={handleChange}
        className="w-full p-2 border mb-2"
      />
      <input
        name="image"
        value={form.image}
        onChange={handleChange}
        className="w-full p-2 border mb-2"
      />
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Update
      </button>
    </form>
  );
};

export default EditListingPage;
