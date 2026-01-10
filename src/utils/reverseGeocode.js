// utils/reverseGeocode.js
export const reverseGeocode = async ([lng, lat]) => {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.features?.[0]?.place_name || "Unknown location";
  } catch (err) {
    console.error("Reverse geocode failed", err);
    return "Unknown location";
  }
};
