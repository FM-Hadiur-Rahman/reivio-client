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

  // Markers cache: { id: { marker, element, onClick } }
  const markersRef = useRef({});
  const [isMapReady, setIsMapReady] = useState(false);

  // Optional clustering for large lists
  const enableClusters = useMemo(
    () => (items?.length || 0) > 40,
    [items?.length],
  );

  const baseColor = useMemo(
    () => (activeTab === "stay" ? "teal" : "emerald"),
    [activeTab],
  );

  // ---------- helpers ----------
  const markerGradient = useMemo(() => {
    return activeTab === "stay"
      ? "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)" // teal->cyan
      : "linear-gradient(135deg, #10b981 0%, #22c55e 100%)"; // emerald->green
  }, [activeTab]);

  const createMarkerEl = (isHover = false) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "reivio-marker";

    el.style.width = "22px";
    el.style.height = "22px";
    el.style.borderRadius = "9999px";
    el.style.background = markerGradient;

    el.style.border = isHover
      ? "3px solid #facc15"
      : "2px solid rgba(255,255,255,0.95)";
    el.style.boxShadow = isHover
      ? "0 10px 30px rgba(250,204,21,0.25)"
      : "0 8px 20px rgba(2,6,23,0.20)";
    el.style.transform = isHover ? "scale(1.45)" : "scale(1)";
    el.style.transition =
      "transform 160ms ease, box-shadow 160ms ease, border 160ms ease";

    // inner dot
    const inner = document.createElement("div");
    inner.style.width = "8px";
    inner.style.height = "8px";
    inner.style.borderRadius = "9999px";
    inner.style.background = "rgba(255,255,255,0.95)";
    inner.style.position = "relative";
    inner.style.top = "7px";
    inner.style.margin = "auto";
    el.appendChild(inner);

    el.style.cursor = "pointer";
    el.style.outline = "none";
    el.style.display = "inline-block";

    return el;
  };

  const popupHtml = (item) => {
    const title =
      activeTab === "stay"
        ? item?.title || "Listing"
        : `${item?.from || "From"} → ${item?.to || "To"}`;

    const subtitle =
      activeTab === "stay"
        ? `${item?.district || ""}${item?.division ? `, ${item.division}` : ""}`
        : item?.location?.address || "";

    // Keep HTML tiny, safe (no user html)
    return `
      <div style="font-family: ui-sans-serif, system-ui; min-width: 180px;">
        <div style="font-weight: 800; color: #0f172a; font-size: 13px; margin-bottom: 4px;">
          ${title}
        </div>
        <div style="color:#475569; font-size: 12px;">
          ${subtitle || ""}
        </div>
        <div style="margin-top: 8px; font-size: 12px; font-weight: 700; color:#0f766e;">
          Click to scroll
        </div>
      </div>
    `;
  };

  const scrollToCard = (id) => {
    const ref = listingRefs?.current?.[id];
    if (!ref) return;

    // Smooth scroll
    ref.scrollIntoView({ behavior: "smooth", block: "start" });

    // Temporary highlight ring
    ref.classList.add("reivio-card-highlight");
    window.setTimeout(() => {
      ref.classList.remove("reivio-card-highlight");
    }, 1200);
  };

  // ---------- 1) Init map once ----------
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
      "top-right",
    );

    map.on("load", () => setIsMapReady(true));
    mapInstanceRef.current = map;

    // Resize map when container changes size (responsive)
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(mapRef.current);

    return () => {
      try {
        ro.disconnect();

        // cleanup markers
        Object.values(markersRef.current).forEach(
          ({ marker, element, onClick }) => {
            if (element && onClick)
              element.removeEventListener("click", onClick);
            if (marker) marker.remove();
          },
        );
        markersRef.current = {};

        // remove cluster layers if exist
        if (map.getLayer("clusters")) map.removeLayer("clusters");
        if (map.getLayer("cluster-count")) map.removeLayer("cluster-count");
        if (map.getLayer("unclustered-point"))
          map.removeLayer("unclustered-point");
        if (map.getSource("places")) map.removeSource("places");

        map.remove();
      } catch {}
      mapInstanceRef.current = null;
    };
  }, []);

  // ---------- 2) Build markers OR clusters when items/tab changes ----------
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapReady) return;

    // Clean markers
    Object.values(markersRef.current).forEach(
      ({ marker, element, onClick }) => {
        if (element && onClick) element.removeEventListener("click", onClick);
        if (marker) marker.remove();
      },
    );
    markersRef.current = {};

    // Remove cluster layers/source if exists (rebuild fresh)
    if (map.getLayer("clusters")) map.removeLayer("clusters");
    if (map.getLayer("cluster-count")) map.removeLayer("cluster-count");
    if (map.getLayer("unclustered-point")) map.removeLayer("unclustered-point");
    if (map.getSource("places")) map.removeSource("places");

    if (!items?.length) {
      map.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, duration: 650 });
      return;
    }

    // If many points, use clusters (super premium for performance)
    if (enableClusters) {
      const features = items
        .filter(
          (it) =>
            Array.isArray(it?.location?.coordinates) &&
            it.location.coordinates.length === 2,
        )
        .map((it) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: it.location.coordinates },
          properties: {
            id: it._id,
            title: activeTab === "stay" ? it.title : `${it.from} → ${it.to}`,
          },
        }));

      map.addSource("places", {
        type: "geojson",
        data: { type: "FeatureCollection", features },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "places",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": activeTab === "stay" ? "#14b8a6" : "#10b981",
          "circle-opacity": 0.9,
          "circle-radius": ["step", ["get", "point_count"], 18, 20, 24, 50, 30],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "places",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#0f172a",
        },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "places",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": activeTab === "stay" ? "#06b6d4" : "#22c55e",
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // Click cluster => zoom in
      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features?.[0]?.properties?.cluster_id;
        const source = map.getSource("places");
        if (!source || clusterId == null) return;

        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({ center: e.lngLat, zoom });
        });
      });

      // Click single point => scroll to card
      map.on("click", "unclustered-point", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["unclustered-point"],
        });
        const id = features?.[0]?.properties?.id;
        if (id) scrollToCard(id);
      });

      map.on(
        "mouseenter",
        "clusters",
        () => (map.getCanvas().style.cursor = "pointer"),
      );
      map.on(
        "mouseleave",
        "clusters",
        () => (map.getCanvas().style.cursor = ""),
      );
      map.on(
        "mouseenter",
        "unclustered-point",
        () => (map.getCanvas().style.cursor = "pointer"),
      );
      map.on(
        "mouseleave",
        "unclustered-point",
        () => (map.getCanvas().style.cursor = ""),
      );

      // Fit bounds
      const bounds = new mapboxgl.LngLatBounds();
      features.forEach((f) => bounds.extend(f.geometry.coordinates));
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: window.innerWidth < 640 ? 30 : 60,
          maxZoom: 13,
          duration: 650,
        });
      }
      return;
    }

    // Otherwise: marker elements
    const bounds = new mapboxgl.LngLatBounds();
    let validCount = 0;

    items.forEach((item) => {
      const coords = item?.location?.coordinates;
      if (!coords || coords.length !== 2) return;

      const el = createMarkerEl(false);

      const popup = new mapboxgl.Popup({
        offset: 18,
        closeButton: false,
        closeOnClick: false,
      }).setHTML(popupHtml(item));

      const marker = new mapboxgl.Marker(el)
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map);

      const onClick = () => {
        marker.togglePopup();
        scrollToCard(item._id);
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
  }, [
    items,
    activeTab,
    isMapReady,
    listingRefs,
    enableClusters,
    markerGradient,
  ]);

  // ---------- 3) Hover highlight (ONLY change previous+current marker) ----------
  const prevHoveredRef = useRef(null);

  const applyHoverStyle = (id, isHover) => {
    const entry = markersRef.current?.[id];
    if (!entry?.element) return;

    const el = entry.element;
    el.style.transform = isHover ? "scale(1.45)" : "scale(1)";
    el.style.border = isHover
      ? "3px solid #facc15"
      : "2px solid rgba(255,255,255,0.95)";
    el.style.boxShadow = isHover
      ? "0 10px 30px rgba(250,204,21,0.25)"
      : "0 8px 20px rgba(2,6,23,0.20)";
    el.style.background = markerGradient;
  };

  useEffect(() => {
    // Clusters mode: hover highlighting is not applicable to individual markers
    if (enableClusters) return;

    const prev = prevHoveredRef.current;
    if (prev && prev !== hoveredId) applyHoverStyle(prev, false);

    if (hoveredId) applyHoverStyle(hoveredId, true);

    prevHoveredRef.current = hoveredId || null;
  }, [hoveredId, enableClusters, markerGradient]);

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
              {enableClusters && (
                <span className="text-[11px] font-semibold text-slate-500">
                  • clustered
                </span>
              )}
            </div>
          </div>

          {/* Empty overlay */}
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

        {/* Tiny CSS */}
        <style>{`
          .reivio-marker { background: transparent; border: none; padding: 0; }
          .reivio-marker:focus-visible { outline: 3px solid rgba(20,184,166,0.35); outline-offset: 2px; }

          /* card highlight when marker clicked */
          .reivio-card-highlight {
            outline: 4px solid rgba(20,184,166,0.25);
            border-radius: 24px;
            transition: outline 200ms ease;
          }
        `}</style>
      </div>
    </section>
  );
};

export default MapSection;
