import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * Premium MapboxAutocomplete
 * ✅ Better UI (premium controls + overlay info)
 * ✅ Fixes dragend bug (your previous updateAddress(lng, lat) was wrong)
 * ✅ Doesn't recreate map on re-render
 * ✅ Cleans up map + geocoder + listeners
 * ✅ Debounced reverse geocode to avoid spamming API
 * ✅ Optional props:
 *    - initialCoordinates: [lng, lat]
 *    - initialAddress: string
 *    - fromLocation, toLocation (optional, for context)
 */
const MapboxAutocomplete = ({
  onSelectLocation,
  initialCoordinates,
  initialAddress = "",
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);

  const onSelectRef = useRef(onSelectLocation);
  useEffect(() => {
    onSelectRef.current = onSelectLocation;
  }, [onSelectLocation]);

  const [ready, setReady] = useState(false);
  const [address, setAddress] = useState(initialAddress || "");
  const [busy, setBusy] = useState(false);

  const defaultCenter = useMemo(
    () => initialCoordinates || [90.4125, 23.8103],
    [initialCoordinates],
  );

  // tiny debounce
  const debounceRef = useRef(null);
  const debounce = (fn, ms = 350) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, ms);
  };

  const reverseGeocode = async (lng, lat, label) => {
    try {
      setBusy(true);
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`,
      );
      const data = await res.json();
      const addr = label || data?.features?.[0]?.place_name || "";
      setAddress(addr);

      onSelectRef.current?.({
        coordinates: [lng, lat],
        address: addr,
      });
    } catch (err) {
      console.warn("❌ Reverse geocoding failed:", err);
    } finally {
      setBusy(false);
    }
  };

  const placeOrMoveMarker = (coords, label = "") => {
    const map = mapRef.current;
    if (!map) return;

    const [lng, lat] = coords;

    if (markerRef.current) markerRef.current.remove();

    markerRef.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat([lng, lat])
      .addTo(map);

    // nice fly
    map.flyTo({
      center: [lng, lat],
      zoom: Math.max(map.getZoom(), 11),
      duration: 650,
    });

    // initial reverse geocode (debounced)
    debounce(() => reverseGeocode(lng, lat, label), 250);

    // drag end -> update
    markerRef.current.on("dragend", () => {
      const p = markerRef.current.getLngLat();
      debounce(() => reverseGeocode(p.lng, p.lat, ""), 250);
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: defaultCenter,
      zoom: initialCoordinates ? 12 : 9,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");

    // Geocoder (top-left)
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
      placeholder: "Search location (city, area, place)…",
      countries: "bd",
    });

    geocoderRef.current = geocoder;
    map.addControl(geocoder, "top-left");

    const onGeocoderResult = (e) => {
      const { center, place_name } = e.result || {};
      if (Array.isArray(center) && center.length === 2) {
        placeOrMoveMarker(center, place_name || "");
      }
    };

    geocoder.on("result", onGeocoderResult);

    const onMapClick = (e) => {
      const { lng, lat } = e.lngLat;
      placeOrMoveMarker([lng, lat], "");
    };
    map.on("click", onMapClick);

    map.on("load", () => {
      setReady(true);

      // initial marker if provided
      if (initialCoordinates?.length === 2) {
        placeOrMoveMarker(initialCoordinates, initialAddress || "");
        return;
      }

      // Try GPS centering (optional)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { longitude, latitude } = pos.coords;
            map.flyTo({
              center: [longitude, latitude],
              zoom: 11,
              duration: 650,
            });
          },
          () => {},
        );
      }
    });

    mapRef.current = map;

    return () => {
      try {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }

        if (geocoderRef.current) {
          geocoderRef.current.off("result", onGeocoderResult);
          geocoderRef.current = null;
        }

        map.off("click", onMapClick);
        map.remove();
      } catch {}
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // init once

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        className="
          w-full h-[300px] sm:h-[420px]
          rounded-3xl overflow-hidden border border-slate-200
          shadow-sm
        "
        style={{ minHeight: "300px" }}
      />

      {/* Premium overlay badge */}
      <div className="pointer-events-none absolute top-3 left-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur border border-slate-200 px-3 py-2 shadow-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
          <span className="text-xs font-extrabold text-slate-800">
            Select pickup location
          </span>
          {busy && (
            <span className="text-[11px] font-semibold text-slate-500">
              • resolving…
            </span>
          )}
        </div>
      </div>

      {/* Address preview */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="rounded-2xl bg-white/90 backdrop-blur border border-slate-200 px-4 py-3 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500">
            Selected address
          </div>
          <div className="text-sm font-semibold text-slate-900 truncate">
            {address ||
              (ready ? "Click the map or search above…" : "Loading map…")}
          </div>
        </div>
      </div>

      {/* Tiny CSS for geocoder polish */}
      <style>{`
        .mapboxgl-ctrl-geocoder {
          min-width: 260px;
          border-radius: 16px !important;
          box-shadow: 0 8px 20px rgba(2,6,23,0.10) !important;
          border: 1px solid rgba(226,232,240,1) !important;
          overflow: hidden;
        }
        .mapboxgl-ctrl-geocoder input {
          font-family: ui-sans-serif, system-ui;
        }
      `}</style>
    </div>
  );
};

export default React.memo(MapboxAutocomplete);
