import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapSection = ({
  items = [],
  activeTab = "stay",
  hoveredId,
  listingRefs = {},
}) => {
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !items.length) return;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [90.4125, 23.8103],
      zoom: 6,
    });

    map.addControl(new mapboxgl.FullscreenControl(), "top-right");

    markersRef.current = {};
    const bounds = new mapboxgl.LngLatBounds();

    items.forEach((item) => {
      const { coordinates } = item.location || {};
      if (coordinates?.length === 2) {
        const el = document.createElement("div");
        el.className = "marker";
        el.style.width = "20px";
        el.style.height = "20px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = activeTab === "stay" ? "#3b82f6" : "#10b981";
        el.style.border = "2px solid white";
        el.style.transition = "transform 0.2s";

        const label =
          activeTab === "stay" ? item.title : `${item.from} → ${item.to}`;

        const marker = new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(label))
          .addTo(map);

        el.addEventListener("click", () => {
          const ref = listingRefs.current[item._id];
          if (ref) {
            ref.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });

        bounds.extend(coordinates);
        markersRef.current[item._id] = { marker, element: el };
      }
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 50 });
    }

    mapInstanceRef.current = map;
    return () => map.remove();
  }, [items, activeTab]);

  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, { element }]) => {
      element.style.transform = id === hoveredId ? "scale(1.5)" : "scale(1)";
      element.style.backgroundColor =
        id === hoveredId
          ? "#facc15"
          : activeTab === "stay"
          ? "#3b82f6"
          : "#10b981";
    });
  }, [hoveredId, activeTab]);

  return (
    <section className="bg-white">
      <div className="w-full mx-auto px-0 pb-8">
        <div
          ref={mapRef}
          className="w-full h-64 sm:h-72 lg:h-96 xl:h-[32rem] rounded border border-gray-300"
        />
      </div>
    </section>
  );
};

export default MapSection;
