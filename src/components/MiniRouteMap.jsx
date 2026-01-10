import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MiniRouteMap = ({ from, to, pickup }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!from?.coordinates || !to?.coordinates) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: from.coordinates,
      zoom: 7,
      interactive: true,
    });

    mapRef.current = map;

    // Marker creation helper
    const createMarker = (coords, label, color = "#3b82f6") => {
      const el = document.createElement("div");
      el.className = "marker";
      el.style.backgroundColor = color;
      el.style.width = "12px";
      el.style.height = "12px";
      el.style.borderRadius = "50%";

      const popup = new mapboxgl.Popup({ offset: 25 }).setText(label);
      new mapboxgl.Marker(el).setLngLat(coords).setPopup(popup).addTo(map);
    };

    createMarker(from.coordinates, `🅰️ From: ${from.name}`, "#10b981");
    createMarker(to.coordinates, `🅱️ To: ${to.name}`, "#ef4444");
    if (pickup?.coordinates) {
      createMarker(pickup.coordinates, `📦 Pickup: ${pickup.name}`, "#facc15");
    }

    // Fetch actual route from Mapbox Directions API
    const fetchRoute = async () => {
      const coords = [from.coordinates];
      if (pickup?.coordinates) coords.push(pickup.coordinates);
      coords.push(to.coordinates);

      const coordString = coords.map((c) => c.join(",")).join(";");
      const res = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordString}`,
        {
          params: {
            geometries: "geojson",
            access_token: mapboxgl.accessToken,
          },
        }
      );

      const routeGeoJSON = {
        type: "Feature",
        geometry: res.data.routes[0].geometry,
      };

      map.on("load", () => {
        if (map.getSource("route")) map.removeSource("route");
        if (map.getLayer("route-line")) map.removeLayer("route-line");

        map.addSource("route", {
          type: "geojson",
          data: routeGeoJSON,
        });

        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#3b82f6",
            "line-width": 4,
            "line-opacity": 0.8,
          },
        });

        const bounds = new mapboxgl.LngLatBounds();
        coords.forEach((c) => bounds.extend(c));
        map.fitBounds(bounds, { padding: 40, maxZoom: 12 });
      });
    };

    fetchRoute();

    return () => map.remove();
  }, [from, to, pickup]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-32 rounded-t overflow-hidden"
      style={{ minHeight: "120px" }}
    />
  );
};

export default MiniRouteMap;
