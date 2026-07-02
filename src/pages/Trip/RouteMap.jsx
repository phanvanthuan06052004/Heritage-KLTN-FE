import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
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

const valid = (p) =>
  p && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng));
const clean = (points) =>
  (points || []).filter(valid).map((p) => ({ lat: Number(p.lat), lng: Number(p.lng) }));

const lineGeoJSON = (points) => ({
  type: "Feature",
  geometry: {
    type: "LineString",
    coordinates: clean(points).map((p) => [p.lng, p.lat]),
  },
});

/**
 * Bản đồ lộ trình (MapLibre + OpenStreetMap raster — không cần token).
 * mode "live": bám theo điểm hiện tại; mode "view": fit toàn tuyến.
 */
export default function RouteMap({
  points = [],
  moments = [],
  heritages = [],
  ghostPoints = [],
  current = null,
  mode = "view",
  className = "",
}) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const mapRef = useRef(null);
  const meMarkerRef = useRef(null);
  const momentMarkersRef = useRef([]);
  const heritageMarkersRef = useRef([]);
  const readyRef = useRef(false);
  const fittedRef = useRef(false);

  // init
  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const cps = clean(points);
    const gps0 = clean(ghostPoints);
    const first =
      cps[0] || (valid(current) ? current : null) || gps0[0] || { lat: 16.0, lng: 107.5 };
    const map = new maplibregl.Map({
      container: ref.current,
      style: OSM_STYLE,
      center: [first.lng, first.lat],
      zoom: cps.length || valid(current) || gps0.length ? 14 : 5,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.on("load", () => {
      // Tuyến mẫu (ghost) — vẽ TRƯỚC để nằm dưới tuyến thật
      map.addSource("ghost", { type: "geojson", data: lineGeoJSON(ghostPoints) });
      map.addLayer({
        id: "ghost-line",
        type: "line",
        source: "ghost",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#8a6d3f",
          "line-width": 4,
          "line-opacity": 0.55,
          "line-dasharray": [1.5, 1.5],
        },
      });
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
    const ghostSrc = map.getSource("ghost");
    if (ghostSrc) ghostSrc.setData(lineGeoJSON(ghostPoints));

    // marker vị trí hiện tại
    if (valid(current)) {
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
            `${m.photoUrl ? `<img src="${m.photoUrl}" style="width:160px;border-radius:8px;display:block;margin-bottom:4px"/>` : ""}<div style="font:500 12px Inter">${m.note || t("trip.moment")}</div>`,
          );
          return new maplibregl.Marker({ element: el })
            .setLngLat([m.lng, m.lat])
            .setPopup(popup)
            .addTo(map);
        });
    }

    // marker di sản trên tuyến (đền/chùa/chiến tích)
    if (heritages.length !== heritageMarkersRef.current.length) {
      heritageMarkersRef.current.forEach((m) => m.remove());
      heritageMarkersRef.current = heritages
        .filter(valid)
        .map((h) => {
          const el = document.createElement("div");
          el.style.cssText =
            "width:26px;height:26px;border-radius:50%;background:#D8A24A;border:2.5px solid #5e4a2e;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 6px rgba(0,0,0,0.4);cursor:pointer";
          el.innerHTML = '<span style="font-size:13px">🏛️</span>';
          const link = h.slug
            ? `<a href="/heritage/${h.slug}" style="color:#9c6b1f;font-weight:600;text-decoration:underline">${t("trip.viewSiteArrow")}</a>`
            : "";
          const popup = new maplibregl.Popup({ offset: 18 }).setHTML(
            `<div style="font:600 13px Inter;margin-bottom:2px">${h.name}</div>${link}`,
          );
          return new maplibregl.Marker({ element: el })
            .setLngLat([h.lng, h.lat])
            .setPopup(popup)
            .addTo(map);
        });
    }

    // camera
    const cps = clean(points);
    const gps = clean(ghostPoints);
    if (mode === "live" && valid(current)) {
      map.easeTo({ center: [current.lng, current.lat], duration: 600 });
    } else if (mode === "live" && !valid(current) && gps.length > 1 && !fittedRef.current) {
      // follow mode chưa có GPS: fit theo tuyến mẫu để user thấy lộ trình cần đi
      const b = new maplibregl.LngLatBounds();
      gps.forEach((p) => b.extend([p.lng, p.lat]));
      map.fitBounds(b, { padding: 48, duration: 600, maxZoom: 16 });
      fittedRef.current = true;
    } else if (mode === "view" && (cps.length > 1 || gps.length > 1) && !fittedRef.current) {
      const b = new maplibregl.LngLatBounds();
      [...cps, ...gps].forEach((p) => b.extend([p.lng, p.lat]));
      map.fitBounds(b, { padding: 48, duration: 600, maxZoom: 16 });
      fittedRef.current = true;
    }
  };

  useEffect(() => {
    updateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, current, moments, heritages, ghostPoints, mode]);

  return <div ref={ref} className={className} />;
}
