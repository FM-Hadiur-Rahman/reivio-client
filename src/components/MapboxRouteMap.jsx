// export default MapboxRouteMap;
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { reverseGeocode } from "../utils/reverseGeocode";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapboxRouteMap = ({
  fromLocation,
  toLocation,
  onSetFrom,
  onSetTo,
  onSetFromText,
  onSetToText,
  onSetPickup,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [markers, setMarkers] = useState({
    from: null,
    to: null,
    pickup: null,
  });
  const [clickStage, setClickStage] = useState(1); // 1 = From, 2 = To, 3 = Pickup

  // 🗺 Init map
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [90.4125, 23.8103],
      zoom: 6,
    });

    map.addControl(new mapboxgl.NavigationControl());
    mapRef.current = map;

    const handleClick = async (e) => {
      const lngLat = [e.lngLat.lng, e.lngLat.lat];
      const address = await reverseGeocode(lngLat);

      if (clickStage === 1) {
        addMarker("from", lngLat, "🟢 From: " + address);
        onSetFrom?.({ type: "Point", coordinates: lngLat, address });
        onSetFromText?.(address);
        setClickStage(2);
      } else if (clickStage === 2) {
        addMarker("to", lngLat, "🔴 To: " + address);
        onSetTo?.({ type: "Point", coordinates: lngLat, address });
        onSetToText?.(address);
        setClickStage(3);
      } else {
        addMarker("pickup", lngLat, "📍 Pickup: " + address);
        onSetPickup?.({ type: "Point", coordinates: lngLat, address });
      }
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
      map.remove();
    };
  }, [clickStage]);

  const addMarker = (type, coordinates, label) => {
    if (markers[type]) markers[type].remove();
    const el = document.createElement("div");
    el.className = "marker-tooltip";
    el.style.backgroundColor =
      type === "from" ? "green" : type === "to" ? "red" : "blue";
    el.style.width = "14px";
    el.style.height = "14px";
    el.style.borderRadius = "50%";

    const marker = new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(label))
      .addTo(mapRef.current);

    marker
      .getElement()
      .addEventListener("mouseenter", () => marker.togglePopup());
    marker
      .getElement()
      .addEventListener("mouseleave", () => marker.togglePopup());

    setMarkers((prev) => ({ ...prev, [type]: marker }));
  };

  // 🛣 Route drawing
  const drawRoute = async () => {
    if (!fromLocation || !toLocation) return;

    try {
      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${fromLocation.coordinates.join(
          ",",
        )};${toLocation.coordinates.join(
          ",",
        )}?geometries=geojson&access_token=${mapboxgl.accessToken}`,
      );
      const data = await res.json();
      const route = data.routes?.[0]?.geometry;
      if (!route) return;

      if (mapRef.current.getSource("route")) {
        mapRef.current.getSource("route").setData(route);
      } else {
        mapRef.current.addSource("route", {
          type: "geojson",
          data: route,
        });

        mapRef.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3b82f6",
            "line-width": 4,
            "line-opacity": 0.9,
          },
        });
      }
    } catch (err) {
      console.error("❌ Route draw failed:", err);
    }
  };

  // 📦 Sync props
  useEffect(() => {
    if (fromLocation)
      addMarker(
        "from",
        fromLocation.coordinates,
        "🟢 From: " + fromLocation.address,
      );
    if (toLocation)
      addMarker("to", toLocation.coordinates, "🔴 To: " + toLocation.address);
    if (fromLocation && toLocation) drawRoute();
  }, [fromLocation, toLocation]);

  // 🔄 Reset
  const resetMap = () => {
    Object.values(markers).forEach((marker) => marker?.remove());
    setMarkers({ from: null, to: null, pickup: null });

    if (mapRef.current.getLayer("route")) {
      mapRef.current.removeLayer("route");
      mapRef.current.removeSource("route");
    }

    onSetFrom?.(null);
    onSetTo?.(null);
    onSetFromText?.("");
    onSetToText?.("");
    onSetPickup?.(null);
    setClickStage(1);
  };

  return (
    <div className="relative">
      <div ref={mapContainerRef} className="h-64 rounded border" />
      <button
        onClick={resetMap}
        className="absolute top-2 right-2 bg-white px-3 py-1 text-sm border rounded shadow"
      >
        🔄 Reset
      </button>
    </div>
  );
};

export default MapboxRouteMap;
