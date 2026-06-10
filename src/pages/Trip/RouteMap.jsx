import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

const lineGeoJSON = (points) => ({
  type: "Feature",
  geometry: {
    type: "LineString",
    coordinates: (points || []).map((p) => [p.lng, p.lat]),
  },
});

/**
 * Bản đồ lộ trình (MapLibre + OpenStreetMap raster — không cần token).
 * mode "live": bám theo điểm hiện tại; mode "view": fit toàn tuyến.
 */
export default function RouteMap({
  points = [],
  moments = [],
  current = null,
  mode = "view",
  className = "",
}) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const meMarkerRef = useRef(null);
  const momentMarkersRef = useRef([]);
  const readyRef = useRef(false);
  const fittedRef = useRef(false);

  // init
  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const first = points[0] || current || { lat: 16.0, lng: 107.5 };
    const map = new maplibregl.Map({
      container: ref.current,
      style: OSM_STYLE,
      center: [first.lng, first.lat],
      zoom: points.length || current ? 15 : 5,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.on("load", () => {
      map.addSource("route", { type: "geojson", data: lineGeoJSON(points) });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#D8A24A", "line-width": 5, "line-opacity": 0.95 },
      });
      readyRef.current = true;
      updateData();
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
      fittedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateData = () => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const src = map.getSource("route");
    if (src) src.setData(lineGeoJSON(points));

    // marker vị trí hiện tại
    if (current) {
      const el = meMarkerRef.current;
      if (!el) {
        const dot = document.createElement("div");
        dot.style.cssText =
          "width:16px;height:16px;border-radius:50%;background:#F2C66D;border:3px solid #5e4a2e;box-shadow:0 0 0 4px rgba(242,198,109,0.35)";
        meMarkerRef.current = new maplibregl.Marker({ element: dot })
          .setLngLat([current.lng, current.lat])
          .addTo(map);
      } else {
        meMarkerRef.current.setLngLat([current.lng, current.lat]);
      }
    }

    // marker khoảnh khắc
    if (moments.length !== momentMarkersRef.current.length) {
      momentMarkersRef.current.forEach((m) => m.remove());
      momentMarkersRef.current = moments
        .filter((m) => m.lat != null && m.lng != null)
        .map((m) => {
          const el = document.createElement("div");
          el.style.cssText =
            "width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#9c2b2b;border:2px solid #f3e6c6;display:flex;align-items:center;justify-content:center";
          el.innerHTML = '<span style="transform:rotate(45deg);font-size:11px">📷</span>';
          const popup = new maplibregl.Popup({ offset: 18 }).setHTML(
            `${m.photoUrl ? `<img src="${m.photoUrl}" style="width:160px;border-radius:8px;display:block;margin-bottom:4px"/>` : ""}<div style="font:500 12px Inter">${m.note || "Khoảnh khắc"}</div>`,
          );
          return new maplibregl.Marker({ element: el })
            .setLngLat([m.lng, m.lat])
            .setPopup(popup)
            .addTo(map);
        });
    }

    // camera
    if (mode === "live" && current) {
      map.easeTo({ center: [current.lng, current.lat], duration: 600 });
    } else if (mode === "view" && points.length > 1 && !fittedRef.current) {
      const b = new maplibregl.LngLatBounds();
      points.forEach((p) => b.extend([p.lng, p.lat]));
      map.fitBounds(b, { padding: 48, duration: 600, maxZoom: 16 });
      fittedRef.current = true;
    }
  };

  useEffect(() => {
    updateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, current, moments, mode]);

  return <div ref={ref} className={className} />;
}
