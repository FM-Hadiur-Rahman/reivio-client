// import React, { useState } from "react";

// const divisionsData = {
//   Dhaka: [
//     "Dhaka",
//     "Faridpur",
//     "Gazipur",
//     "Gopalganj",
//     "Kishoreganj",
//     "Madaripur",
//     "Manikganj",
//     "Munshiganj",
//     "Narayanganj",
//     "Narsingdi",
//     "Rajbari",
//     "Shariatpur",
//     "Tangail",
//   ],
//   Chattogram: [
//     "Chattogram",
//     "Bandarban",
//     "Brahmanbaria",
//     "Chandpur",
//     "Cumilla",
//     "Cox's Bazar",
//     "Feni",
//     "Khagrachari",
//     "Lakshmipur",
//     "Noakhali",
//     "Rangamati",
//   ],
//   Khulna: [
//     "Khulna",
//     "Bagerhat",
//     "Chuadanga",
//     "Jashore",
//     "Jhenaidah",
//     "Kushtia",
//     "Magura",
//     "Meherpur",
//     "Narail",
//     "Satkhira",
//   ],
//   Rajshahi: [
//     "Rajshahi",
//     "Bogura",
//     "Joypurhat",
//     "Naogaon",
//     "Natore",
//     "Chapai Nawabganj",
//     "Pabna",
//     "Sirajganj",
//   ],
//   Barishal: [
//     "Barishal",
//     "Barguna",
//     "Bhola",
//     "Jhalokathi",
//     "Patuakhali",
//     "Pirojpur",
//   ],
//   Sylhet: ["Sylhet", "Habiganj", "Moulvibazar", "Sunamganj"],
//   Rangpur: [
//     "Rangpur",
//     "Dinajpur",
//     "Gaibandha",
//     "Kurigram",
//     "Lalmonirhat",
//     "Nilphamari",
//     "Panchagarh",
//     "Thakurgaon",
//   ],
//   Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
// };

// const LocationSelector = ({ onChange }) => {
//   const [selectedDivision, setSelectedDivision] = useState("");
//   const [selectedDistrict, setSelectedDistrict] = useState("");

//   const handleDivisionChange = (e) => {
//     const value = e.target.value;
//     setSelectedDivision(value);
//     setSelectedDistrict("");
//     onChange(value, "");
//   };

//   const handleDistrictChange = (e) => {
//     const value = e.target.value;
//     setSelectedDistrict(value);
//     onChange(selectedDivision, value);
//   };

//   return (
//     <div className="p-4 space-y-4">
//       <div>
//         <label className="block text-sm font-medium mb-1">Division</label>
//         <select
//           className="border rounded px-3 py-2 w-full"
//           value={selectedDivision}
//           onChange={handleDivisionChange}
//         >
//           <option value="">Select Division</option>
//           {Object.keys(divisionsData).map((division) => (
//             <option key={division} value={division}>
//               {division}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div>
//         <label className="block text-sm font-medium mb-1">District</label>
//         <select
//           className="border rounded px-3 py-2 w-full"
//           value={selectedDistrict}
//           onChange={handleDistrictChange}
//           disabled={!selectedDivision}
//         >
//           <option value="">Select District</option>
//           {selectedDivision &&
//             divisionsData[selectedDivision].map((district) => (
//               <option key={district} value={district}>
//                 {district}
//               </option>
//             ))}
//         </select>
//       </div>
//     </div>
//   );
// };

// export default LocationSelector;

import React, { useMemo } from "react";

const BD = {
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
    "Bandarban",
    "Brahmanbaria",
    "Chandpur",
    "Chattogram",
    "Cumilla",
    "Cox's Bazar",
    "Feni",
    "Khagrachhari",
    "Lakshmipur",
    "Noakhali",
    "Rangamati",
  ],
  Rajshahi: [
    "Bogura",
    "Chapainawabganj",
    "Joypurhat",
    "Naogaon",
    "Natore",
    "Pabna",
    "Rajshahi",
    "Sirajganj",
  ],
  Khulna: [
    "Bagerhat",
    "Chuadanga",
    "Jashore",
    "Jhenaidah",
    "Khulna",
    "Kushtia",
    "Magura",
    "Meherpur",
    "Narail",
    "Satkhira",
  ],
  Barishal: [
    "Barguna",
    "Barishal",
    "Bhola",
    "Jhalokati",
    "Patuakhali",
    "Pirojpur",
  ],
  Sylhet: ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
  Rangpur: [
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Rangpur",
    "Thakurgaon",
  ],
  Mymensingh: ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"],
};

export default function LocationSelector({
  value = { division: "", district: "" },
  onChange,
}) {
  const divisions = useMemo(() => Object.keys(BD), []);
  const districts = useMemo(() => BD[value.division] || [], [value.division]);

  const handleDivision = (e) => {
    const div = e.target.value;
    // ✅ reset district when division changes
    onChange?.(div, "");
  };

  const handleDistrict = (e) => {
    const dist = e.target.value;
    onChange?.(value.division, dist);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-20">
      <div>
        <select
          value={value.division || ""}
          onChange={handleDivision}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400"
        >
          <option value="">Select division</option>
          {divisions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <select
          value={value.district || ""}
          onChange={handleDistrict}
          disabled={!value.division}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 ${
            !value.division
              ? "border-gray-100 text-gray-400 cursor-not-allowed"
              : "border-gray-200"
          }`}
        >
          <option value="">
            {value.division ? "Select district" : "Select division first"}
          </option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
