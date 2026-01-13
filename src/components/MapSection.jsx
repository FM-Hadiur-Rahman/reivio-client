import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const DEFAULT_CENTER = [90.4125, 23.8103]; // Dhaka
const DEFAULT_ZOOM = 6;

const MapSection = ({
  items = [],
  activeTab = "stay",
  hoveredId,
  listingRefs = { current: {} }, // expects ref object
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({}); // {id: { marker, element, onClick }}
  const [isMapReady, setIsMapReady] = useState(false);

  const baseColor = useMemo(
    () => (activeTab === "stay" ? "teal" : "emerald"),
    [activeTab]
  );

  // 1) Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    map.addControl(new mapboxgl.FullscreenControl(), "top-right");
    map.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );

    map.on("load", () => setIsMapReady(true));

    mapInstanceRef.current = map;

    return () => {
      try {
        // cleanup markers
        Object.values(markersRef.current).forEach(
          ({ marker, element, onClick }) => {
            if (element && onClick)
              element.removeEventListener("click", onClick);
            if (marker) marker.remove();
          }
        );
        markersRef.current = {};
        map.remove();
      } catch {}
      mapInstanceRef.current = null;
    };
  }, []);

  // helper: create premium marker element
  const createMarkerEl = (tab, isHover = false) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "reivio-marker";
    el.style.width = "22px";
    el.style.height = "22px";
    el.style.borderRadius = "9999px";
    el.style.border = isHover
      ? "3px solid #facc15"
      : "2px solid rgba(255,255,255,0.95)";
    el.style.boxShadow = isHover
      ? "0 10px 30px rgba(250,204,21,0.25)"
      : "0 8px 20px rgba(2,6,23,0.20)";
    el.style.transform = isHover ? "scale(1.45)" : "scale(1)";
    el.style.transition =
      "transform 160ms ease, box-shadow 160ms ease, border 160ms ease";

    // gradient fill
    if (tab === "stay") {
      el.style.background = "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)"; // teal->cyan
    } else {
      el.style.background = "linear-gradient(135deg, #10b981 0%, #22c55e 100%)"; // emerald->green
    }

    // little inner dot
    const inner = document.createElement("div");
    inner.style.width = "8px";
    inner.style.height = "8px";
    inner.style.borderRadius = "9999px";
    inner.style.background = "rgba(255,255,255,0.95)";
    inner.style.margin = "auto";
    inner.style.position = "relative";
    inner.style.top = "7px";
    el.appendChild(inner);

    // accessibility
    el.style.cursor = "pointer";
    el.style.outline = "none";
    el.style.display = "inline-block";

    return el;
  };

  // 2) Rebuild markers when items/tab changes (map stays)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapReady) return;

    // remove existing markers + listeners
    Object.values(markersRef.current).forEach(
      ({ marker, element, onClick }) => {
        if (element && onClick) element.removeEventListener("click", onClick);
        if (marker) marker.remove();
      }
    );
    markersRef.current = {};

    if (!items?.length) return;

    const bounds = new mapboxgl.LngLatBounds();
    let validCount = 0;

    items.forEach((item) => {
      const coords = item?.location?.coordinates;
      if (!coords || coords.length !== 2) return;

      const label =
        activeTab === "stay" ? item.title : `${item.from} → ${item.to}`;

      const el = createMarkerEl(activeTab, false);

      const popup = new mapboxgl.Popup({
        offset: 22,
        closeButton: false,
        closeOnClick: false,
      }).setText(label);

      const marker = new mapboxgl.Marker(el)
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map);

      const onClick = () => {
        // open popup
        marker.togglePopup();

        // scroll to corresponding card
        const ref = listingRefs?.current?.[item._id];
        if (ref) {
          ref.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      };

      el.addEventListener("click", onClick);

      markersRef.current[item._id] = { marker, element: el, onClick };
      bounds.extend(coords);
      validCount += 1;
    });

    if (validCount > 0 && !bounds.isEmpty()) {
      map.fitBounds(bounds, {
        padding: window.innerWidth < 640 ? 30 : 60,
        maxZoom: 13,
        duration: 650,
      });
    } else {
      map.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, duration: 650 });
    }
  }, [items, activeTab, isMapReady, listingRefs]);

  // 3) Hover highlight (scale + gold ring)
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, { element }]) => {
      const isHover = id === hoveredId;
      element.style.transform = isHover ? "scale(1.45)" : "scale(1)";
      element.style.border = isHover
        ? "3px solid #facc15"
        : "2px solid rgba(255,255,255,0.95)";
      element.style.boxShadow = isHover
        ? "0 10px 30px rgba(250,204,21,0.25)"
        : "0 8px 20px rgba(2,6,23,0.20)";

      // base color remains same
      element.style.background =
        activeTab === "stay"
          ? "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)"
          : "linear-gradient(135deg, #10b981 0%, #22c55e 100%)";
    });
  }, [hoveredId, activeTab]);

  return (
    <section className="bg-white">
      <div className="w-full mx-auto px-0 pb-8">
        <div className="relative">
          <div
            ref={mapRef}
            className="
              w-full h-64 sm:h-72 lg:h-96 xl:h-[32rem]
              rounded-3xl border border-slate-200
              shadow-sm overflow-hidden
            "
          />

          {/* Premium overlay badge */}
          <div className="pointer-events-none absolute top-3 left-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur border border-slate-200 px-3 py-2 shadow-sm">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  baseColor === "teal" ? "bg-teal-500" : "bg-emerald-500"
                }`}
              />
              <span className="text-xs font-extrabold text-slate-800">
                {activeTab === "stay" ? "Stays map" : "Rides map"}
              </span>
            </div>
          </div>

          {/* Loading / empty overlay */}
          {!items?.length && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/85 backdrop-blur px-6 py-8 text-center text-slate-600 shadow-sm">
                <div className="text-lg font-extrabold text-slate-900">
                  No locations to show
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  Try adjusting filters or search again.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* tiny css to ensure marker button has no default styles */}
        <style>{`
          .reivio-marker { background: transparent; border: none; padding: 0; }
          .reivio-marker:focus-visible { outline: 3px solid rgba(20,184,166,0.35); outline-offset: 2px; }
        `}</style>
      </div>
    </section>
  );
};

export default MapSection;
