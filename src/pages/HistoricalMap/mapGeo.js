/**
 * GeoJSON phụ trợ cho bản đồ: hai quần đảo Hoàng Sa & Trường Sa (chủ quyền Việt Nam),
 * khung khoanh vùng, và lưới toạ độ (graticule) tạo cảm giác bản đồ atlas cổ.
 *
 * Natural Earth admin0 KHÔNG kèm Hoàng Sa/Trường Sa nên ta bổ sung thủ công.
 * Các điểm đảo được rải tất định (LCG seed cố định) để không nhấp nháy khi re-render.
 */

// Random tất định để rải các đảo nhỏ.
function lcg(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export const ARCHIPELAGOS = [
  {
    id: "hoangsa",
    label: "Quần đảo Hoàng Sa",
    sub: "(Đà Nẵng)",
    center: [112.0, 16.5],
    bbox: [111.1, 15.7, 112.7, 17.2], // [minLng, minLat, maxLng, maxLat]
    count: 34,
    seed: 4111,
  },
  {
    id: "truongsa",
    label: "Quần đảo Trường Sa",
    sub: "(Khánh Hòa)",
    center: [113.6, 9.7],
    bbox: [111.6, 8.0, 115.6, 11.9],
    count: 60,
    seed: 9277,
  },
];

// Tập điểm đảo nhỏ (circle layer — không cần glyphs).
export function buildIslandPoints() {
  const features = [];
  ARCHIPELAGOS.forEach((g) => {
    const rand = lcg(g.seed);
    const [minLng, minLat, maxLng, maxLat] = g.bbox;
    for (let i = 0; i < g.count; i++) {
      const lng = minLng + rand() * (maxLng - minLng);
      const lat = minLat + rand() * (maxLat - minLat);
      features.push({
        type: "Feature",
        properties: { r: 0.8 + rand() * 1.6 },
        geometry: { type: "Point", coordinates: [lng, lat] },
      });
    }
  });
  return { type: "FeatureCollection", features };
}

// Khung khoanh vùng (đường đứt nét) quanh mỗi quần đảo.
export function buildIslandBoxes() {
  const features = ARCHIPELAGOS.map((g) => {
    const [a, b, c, d] = g.bbox;
    const pad = 0.25;
    return {
      type: "Feature",
      properties: { id: g.id },
      geometry: {
        type: "LineString",
        coordinates: [
          [a - pad, b - pad],
          [c + pad, b - pad],
          [c + pad, d + pad],
          [a - pad, d + pad],
          [a - pad, b - pad],
        ],
      },
    };
  });
  return { type: "FeatureCollection", features };
}

// Lưới kinh/vĩ tuyến thưa.
export function buildGraticule() {
  const features = [];
  for (let lng = 100; lng <= 120; lng += 4) {
    features.push({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [lng, 5],
          [lng, 24],
        ],
      },
    });
  }
  for (let lat = 6; lat <= 24; lat += 4) {
    features.push({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [100, lat],
          [120, lat],
        ],
      },
    });
  }
  return { type: "FeatureCollection", features };
}
