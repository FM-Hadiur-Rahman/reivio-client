import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapboxAutocomplete = ({ onSelectLocation }) => {
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // ✅ Initialize Map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [90.4125, 23.8103], // Default to Dhaka
      zoom: 9,
    });

    // ✅ Try to center map to user's location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        mapRef.current.setCenter([longitude, latitude]);
      },
      () => console.warn("📍 Location access denied")
    );

    // ✅ Add geocoder
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
      placeholder: "Search for location...",
    });
    mapRef.current.addControl(geocoder);

    // ✅ Handle result from geocoder
    geocoder.on("result", (e) => {
      const { center, place_name } = e.result;
      updateMarker(center, place_name);
    });

    // ✅ Handle map click
    mapRef.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      updateMarker([lng, lat]);
    });

    // ✅ Update or place marker
    function updateMarker(coords, label = null) {
      if (markerRef.current) markerRef.current.remove();

      markerRef.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat(coords)
        .addTo(mapRef.current);

      const [lng, lat] = coords;

      const updateAddress = async () => {
        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
          );
          const data = await res.json();
          const address = label || data.features?.[0]?.place_name || "";
          if (onSelectLocation) {
            onSelectLocation({ coordinates: [lng, lat], address });
          }
        } catch (err) {
          console.warn("❌ Reverse geocoding failed:", err);
        }
      };

      updateAddress();

      markerRef.current.on("dragend", () => {
        const { lng, lat } = markerRef.current.getLngLat();
        updateAddress(lng, lat);
      });
    }

    return () => {
      mapRef.current?.remove(); // 🧹 Clean up map instance
      mapRef.current = null;
    };
  }, []); // ❗ Removed onSelectLocation to avoid re-running useEffect on every re-render

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[300px] sm:h-[400px] rounded-md overflow-hidden border border-gray-300"
      style={{ minHeight: "300px" }}
      id="map-container"
    />
  );
};

export default React.memo(MapboxAutocomplete);
