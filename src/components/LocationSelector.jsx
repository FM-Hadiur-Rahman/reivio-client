import React, { useState } from "react";

const divisionsData = {
  Dhaka: [
    "Dhaka",
    "Faridpur",
    "Gazipur",
    "Gopalganj",
    "Kishoreganj",
    "Madaripur",
    "Manikganj",
    "Munshiganj",
    "Narayanganj",
    "Narsingdi",
    "Rajbari",
    "Shariatpur",
    "Tangail",
  ],
  Chattogram: [
    "Chattogram",
    "Bandarban",
    "Brahmanbaria",
    "Chandpur",
    "Cumilla",
    "Cox's Bazar",
    "Feni",
    "Khagrachari",
    "Lakshmipur",
    "Noakhali",
    "Rangamati",
  ],
  Khulna: [
    "Khulna",
    "Bagerhat",
    "Chuadanga",
    "Jashore",
    "Jhenaidah",
    "Kushtia",
    "Magura",
    "Meherpur",
    "Narail",
    "Satkhira",
  ],
  Rajshahi: [
    "Rajshahi",
    "Bogura",
    "Joypurhat",
    "Naogaon",
    "Natore",
    "Chapai Nawabganj",
    "Pabna",
    "Sirajganj",
  ],
  Barishal: [
    "Barishal",
    "Barguna",
    "Bhola",
    "Jhalokathi",
    "Patuakhali",
    "Pirojpur",
  ],
  Sylhet: ["Sylhet", "Habiganj", "Moulvibazar", "Sunamganj"],
  Rangpur: [
    "Rangpur",
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Thakurgaon",
  ],
  Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
};

const LocationSelector = ({ onChange }) => {
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const handleDivisionChange = (e) => {
    const value = e.target.value;
    setSelectedDivision(value);
    setSelectedDistrict("");
    onChange(value, "");
  };

  const handleDistrictChange = (e) => {
    const value = e.target.value;
    setSelectedDistrict(value);
    onChange(selectedDivision, value);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Division</label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={selectedDivision}
          onChange={handleDivisionChange}
        >
          <option value="">Select Division</option>
          {Object.keys(divisionsData).map((division) => (
            <option key={division} value={division}>
              {division}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">District</label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={selectedDistrict}
          onChange={handleDistrictChange}
          disabled={!selectedDivision}
        >
          <option value="">Select District</option>
          {selectedDivision &&
            divisionsData[selectedDivision].map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

export default LocationSelector;
