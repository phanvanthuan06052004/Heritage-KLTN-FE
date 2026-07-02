import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getTypeMeta } from "./mockData";
import {
  ARCHIPELAGOS,
  buildIslandPoints,
  buildIslandBoxes,
  buildGraticule,
} from "./mapGeo";
import {
  RIVERS,
  REGION_LABELS,
  buildRoutes,
  buildRouteHeads,
} from "./campaignRoutes";

/**
 * VietnamHistoryMap — "bản đồ cổ" (parchment) cho Vietnam Historical Universe.
 * - Nền giấy da sepia, đất tô màu cổ + bờ biển mực, sông chính, nhãn vùng.
 * - Marker dạng triện (click mở popup thẻ thông tin).
 * - Đường tiến quân theo chiến dịch (animated "marching ants") theo cửa sổ năm `range`.
 * - La bàn + khung trang trí + vân giấy.
 */

const VIETNAM_BOUNDS = [
  [101.0, 6.3],
  [118.2, 23.8],
];

// chuỗi dash animate (marching ants) để thể hiện hướng tiến quân
const DASH_SEQ = [
  [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, 0.5],
  [3, 4, 0], [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2],
  [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5],
];

export default function VietnamHistoryMap({ locations = [], activeId, onSelect, range }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerObjsRef = useRef({});
  const popupRef = useRef(null);
  const loadedRef = useRef(false);
  const rafRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const locationsRef = useRef(locations);
  locationsRef.current = locations;
  const rangeRef = useRef(range);
  rangeRef.current = range;

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [{ id: "bg", type: "background", paint: { "background-color": "#e8dab4" } }],
      },
      center: [108.5, 15.2],
      zoom: 4.4,
      attributionControl: false,
      dragRotate: false,
      maxZoom: 9,
      minZoom: 3.5,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      // Lưới toạ độ (mực nhạt)
      map.addSource("graticule", { type: "geojson", data: buildGraticule() });
      map.addLayer({
        id: "graticule",
        type: "line",
        source: "graticule",
        paint: { "line-color": "#6b5836", "line-opacity": 0.13, "line-width": 0.5 },
      });

      // Lãnh thổ Việt Nam — đất giấy da + bờ biển mực
      map.addSource("vietnam", { type: "geojson", data: "/geo/vietnam.geojson" });
      map.addLayer({
        id: "vn-halo",
        type: "line",
        source: "vietnam",
        paint: { "line-color": "#8a6d3f", "line-width": 8, "line-blur": 9, "line-opacity": 0.3 },
      });
      map.addLayer({
        id: "vn-fill",
        type: "fill",
        source: "vietnam",
        paint: { "fill-color": "#cdb78a", "fill-opacity": 0.92 },
      });
      map.addLayer({
        id: "vn-line",
        type: "line",
        source: "vietnam",
        paint: { "line-color": "#5e4a2e", "line-width": 1.4, "line-opacity": 0.85 },
      });

      // Sông chính
      map.addSource("rivers", { type: "geojson", data: RIVERS });
      map.addLayer({
        id: "rivers",
        type: "line",
        source: "rivers",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#3f637a",
          "line-opacity": 0.6,
          "line-width": ["interpolate", ["linear"], ["zoom"], 4, 0.6, 7, 2.4],
        },
      });

      // Khung + cụm đảo Hoàng Sa / Trường Sa (sepia)
      map.addSource("island-boxes", { type: "geojson", data: buildIslandBoxes() });
      map.addLayer({
        id: "island-boxes",
        type: "line",
        source: "island-boxes",
        paint: { "line-color": "#6b5836", "line-opacity": 0.5, "line-width": 1, "line-dasharray": [2.5, 2.5] },
      });
      map.addSource("islands", { type: "geojson", data: buildIslandPoints() });
      map.addLayer({
        id: "islands-dots",
        type: "circle",
        source: "islands",
        paint: { "circle-radius": ["get", "r"], "circle-color": "#6b5836", "circle-opacity": 0.8 },
      });

      // Đường tiến quân (chiến dịch)
      const r = rangeRef.current || {};
      map.addSource("routes", { type: "geojson", data: buildRoutes(r.from ?? 1225, r.to ?? 1300) });
      map.addLayer({
        id: "routes-glow",
        type: "line",
        source: "routes",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": ["get", "color"], "line-width": 7, "line-blur": 6, "line-opacity": 0.25 },
      });
      map.addLayer({
        id: "routes-line",
        type: "line",
        source: "routes",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": ["get", "color"], "line-width": 2.6, "line-dasharray": [0, 4, 3] },
      });
      map.addSource("route-heads", { type: "geojson", data: buildRouteHeads(r.from ?? 1225, r.to ?? 1300) });
      map.addLayer({
        id: "route-heads",
        type: "circle",
        source: "route-heads",
        paint: {
          "circle-radius": 5,
          "circle-color": ["get", "color"],
          "circle-stroke-color": "#f3e6c6",
          "circle-stroke-width": 1.5,
        },
      });

      map.fitBounds(VIETNAM_BOUNDS, { padding: 30, duration: 0 });
      addAnnotations(map);
      syncMarkers(locationsRef.current);
      loadedRef.current = true;
      applyActive(activeId);
      animateRoutes();
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
      markerObjsRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate dash (marching ants) cho đường tiến quân
  function animateRoutes() {
    let step = 0;
    let last = 0;
    const tick = (ts) => {
      if (!mapRef.current || !mapRef.current.getLayer("routes-line")) return;
      if (ts - last > 70) {
        last = ts;
        step = (step + 1) % DASH_SEQ.length;
        try {
          mapRef.current.setPaintProperty("routes-line", "line-dasharray", DASH_SEQ[step]);
        } catch { /* layer chưa sẵn */ }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function addAnnotations(map) {
    ARCHIPELAGOS.forEach((g) => {
      const el = document.createElement("div");
      el.className = "vh-island-label";
      el.innerHTML = `<span class="vh-island-name">${g.label}</span><span class="vh-island-sub">${g.sub}</span>`;
      new maplibregl.Marker({ element: el, anchor: "top" }).setLngLat(g.center).addTo(map);
    });
    REGION_LABELS.forEach((rg) => {
      const el = document.createElement("div");
      el.className = "vh-region-label";
      el.textContent = rg.label;
      new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat(rg.center).addTo(map);
    });
    const sea = document.createElement("div");
    sea.className = "vh-sea-label";
    sea.textContent = "BIỂN ĐÔNG";
    new maplibregl.Marker({ element: sea, anchor: "center" }).setLngLat([110.6, 13.6]).addTo(map);
  }

  function openPopup(loc) {
    const map = mapRef.current;
    if (!map) return;
    const meta = getTypeMeta(loc.type);
    popupRef.current?.remove();
    const html = `
      <div class="vh-pop">
        <span class="vh-pop-type" style="color:${meta.color};border-color:${meta.color}66;background:${meta.color}1f">${meta.label}</span>
        <h4 class="vh-pop-title">${loc.name}</h4>
        <div class="vh-pop-meta">${loc.year ? `<span>${loc.year}</span>` : ""}${loc.province ? `<span>· ${loc.province}</span>` : ""}</div>
        <p class="vh-pop-sum">${(loc.summary || "").slice(0, 130)}${(loc.summary || "").length > 130 ? "…" : ""}</p>
      </div>`;
    popupRef.current = new maplibregl.Popup({ offset: 16, closeButton: false, maxWidth: "260px" })
      .setLngLat([loc.lng, loc.lat])
      .setHTML(html)
      .addTo(map);
  }

  function syncMarkers(list) {
    const map = mapRef.current;
    if (!map) return;
    const nextIds = new Set(list.map((l) => l.id));
    Object.entries(markerObjsRef.current).forEach(([id, obj]) => {
      if (!nextIds.has(id)) {
        obj.marker.remove();
        delete markerObjsRef.current[id];
      }
    });
    list.forEach((loc) => {
      if (
        typeof loc.lng !== "number" || typeof loc.lat !== "number" ||
        Math.abs(loc.lat) > 90 || Math.abs(loc.lng) > 180
      ) return;
      if (markerObjsRef.current[loc.id]) {
        markerObjsRef.current[loc.id].location = loc;
        return;
      }
      const meta = getTypeMeta(loc.type);
      const el = document.createElement("button");
      el.type = "button";
      el.className = "vh-seal vh-enter";
      el.setAttribute("aria-label", loc.name);
      el.style.setProperty("--c", meta.color);
      el.innerHTML = `<span class="vh-seal-dot"></span><span class="vh-seal-label">${loc.name}</span>`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current?.(loc.id);
        openPopup(loc);
      });
      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([loc.lng, loc.lat])
        .addTo(map);
      markerObjsRef.current[loc.id] = { marker, el, location: loc };
    });
  }

  function applyActive(id) {
    Object.entries(markerObjsRef.current).forEach(([locId, { el }]) => {
      el.classList.toggle("is-active", locId === id);
    });
    const active = markerObjsRef.current[id]?.location;
    if (active && mapRef.current) {
      mapRef.current.flyTo({ center: [active.lng, active.lat], zoom: 6.6, speed: 0.8, essential: true });
    }
  }

  // Cập nhật markers khi danh sách đổi
  useEffect(() => {
    if (loadedRef.current) {
      syncMarkers(locations);
      applyActive(activeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  useEffect(() => {
    if (loadedRef.current) applyActive(activeId);
  }, [activeId]);

  // Cập nhật đường tiến quân khi đổi cửa sổ năm
  useEffect(() => {
    const map = mapRef.current;
    if (!loadedRef.current || !map || !range) return;
    map.getSource("routes")?.setData(buildRoutes(range.from, range.to));
    map.getSource("route-heads")?.setData(buildRouteHeads(range.from, range.to));
  }, [range]);

  return (
    <div className="relative h-full w-full">
      {/* Vân giấy + vignette */}
      <div className="vh-paper pointer-events-none absolute inset-0 z-[1]" />
      <div className="pointer-events-none absolute inset-0 z-[1] rounded-[1.5rem] shadow-[inset_0_0_90px_18px_rgba(94,74,46,0.35)]" />

      {/* Khung trang trí */}
      <div className="pointer-events-none absolute inset-2.5 z-[2] rounded-[1.2rem] border-2 border-[#8a6d3f]/45" />
      <div className="pointer-events-none absolute inset-3.5 z-[2] rounded-[1rem] border border-[#8a6d3f]/25" />

      {/* La bàn cổ */}
      <div className="pointer-events-none absolute bottom-5 right-5 z-[3] opacity-80">
        <svg width="64" height="64" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="rgba(243,230,198,0.7)" stroke="#5e4a2e" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="#8a6d3f" strokeWidth="0.6" />
          <polygon points="50,8 56,50 50,46 44,50" fill="#9c3b1b" />
          <polygon points="50,92 56,50 50,54 44,50" fill="#5e4a2e" />
          <polygon points="8,50 50,44 46,50 50,56" fill="#5e4a2e" />
          <polygon points="92,50 50,44 54,50 50,56" fill="#5e4a2e" />
          <text x="50" y="20" textAnchor="middle" fontSize="9" fontWeight="700" fill="#5e4a2e" fontFamily="Georgia,serif">B</text>
          <text x="50" y="88" textAnchor="middle" fontSize="8" fill="#5e4a2e" fontFamily="Georgia,serif">N</text>
          <text x="12" y="53" textAnchor="middle" fontSize="8" fill="#5e4a2e" fontFamily="Georgia,serif">T</text>
          <text x="88" y="53" textAnchor="middle" fontSize="8" fill="#5e4a2e" fontFamily="Georgia,serif">Đ</text>
        </svg>
      </div>

      <style>{`
        .vh-paper {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
          mix-blend-mode: multiply; opacity: 0.14;
        }
        .vh-seal { display:flex; flex-direction:column; align-items:center; gap:3px; background:none; border:none; padding:0; cursor:pointer; }
        .vh-enter .vh-seal-dot { animation: vhEnter .4s ease-out; }
        @keyframes vhEnter { from { transform: scale(0); opacity:0; } to { transform: scale(1); opacity:1; } }
        .vh-seal-dot {
          width:13px; height:13px; border-radius:50%;
          background: var(--c);
          border:2px solid #f3e6c6;
          box-shadow: 0 0 0 1.5px #5e4a2e, 0 1px 4px rgba(94,74,46,0.6);
          transition: transform .2s ease;
        }
        .vh-seal:hover { z-index:5; }
        .vh-seal:hover .vh-seal-dot { transform: scale(1.3); }
        .vh-seal-label {
          margin-top:2px; padding:1px 6px; border-radius:4px;
          font-family: Georgia, 'Times New Roman', serif; font-size:10px; font-weight:600; color:#4a3a1f;
          background:rgba(243,230,198,0.92); border:1px solid rgba(94,74,46,0.4);
          white-space:nowrap; pointer-events:none;
          opacity:0; transform: translateY(-2px); transition: opacity .18s, transform .18s;
        }
        .vh-seal:hover .vh-seal-label { opacity:1; transform: translateY(0); }
        .vh-seal.is-active { z-index:6; }
        .vh-seal.is-active .vh-seal-dot {
          width:18px; height:18px;
          box-shadow: 0 0 0 3px rgba(156,59,27,0.3), 0 0 14px var(--c);
          animation: vhPulse 1.7s ease-in-out infinite;
        }
        .vh-seal.is-active .vh-seal-label { opacity:1; transform: translateY(0); }
        @keyframes vhPulse {
          0%,100% { box-shadow:0 0 0 3px rgba(156,59,27,0.3), 0 0 14px var(--c); }
          50% { box-shadow:0 0 0 7px rgba(156,59,27,0.08), 0 0 22px var(--c); }
        }
        .vh-region-label {
          font-family: Georgia, serif; font-size:11px; font-weight:700; letter-spacing:.28em;
          color:rgba(94,74,46,0.5); pointer-events:none; white-space:nowrap;
        }
        .vh-island-label { display:flex; flex-direction:column; align-items:center; line-height:1.15; pointer-events:none; text-align:center; }
        .vh-island-name { font-family:Georgia,serif; font-size:10px; font-weight:700; color:#5e4a2e; white-space:nowrap; }
        .vh-island-sub { font-size:8px; color:rgba(94,74,46,0.7); }
        .vh-sea-label {
          font-family: Georgia, serif; font-size:16px; font-weight:600; letter-spacing:.42em;
          color:rgba(63,99,122,0.4); pointer-events:none; white-space:nowrap; transform: rotate(-12deg);
        }
        .maplibregl-ctrl-group {
          border:1px solid rgba(94,74,46,0.35) !important; background: rgba(243,230,198,0.9) !important;
          box-shadow: 0 6px 18px rgba(94,74,46,0.25) !important;
        }
        .maplibregl-ctrl-group button + button { border-top:1px solid rgba(94,74,46,0.25) !important; }
        .maplibregl-popup-content {
          background:#f3e6c6 !important; border:1px solid rgba(94,74,46,0.45) !important;
          border-radius:12px !important; box-shadow:0 10px 30px rgba(94,74,46,0.4) !important; padding:12px 14px !important;
        }
        .maplibregl-popup-tip { border-top-color:#f3e6c6 !important; border-bottom-color:#f3e6c6 !important; }
        .vh-pop-type { display:inline-block; padding:1px 8px; border-radius:999px; border:1px solid; font-size:10px; font-weight:700; text-transform:uppercase; }
        .vh-pop-title { margin:6px 0 2px; font-family:Georgia,serif; font-size:16px; font-weight:700; color:#3a2a14; }
        .vh-pop-meta { font-family:monospace; font-size:11px; color:#6b5836; display:flex; gap:6px; }
        .vh-pop-sum { margin-top:6px; font-size:12px; line-height:1.5; color:#4a3a1f; }
      `}</style>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
