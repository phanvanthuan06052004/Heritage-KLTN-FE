/**
 * Dữ liệu phụ cho "bản đồ cổ": sông chính, nhãn vùng, và ĐƯỜNG TIẾN QUÂN
 * của ba lần kháng chiến chống Nguyên–Mông (toạ độ mang tính minh hoạ, không phải GIS chính xác).
 *
 * kind: 'invade' (giặc tiến) | 'naval' (thuỷ quân giặc) | 'counter' (ta phản công) | 'retreat' (giặc rút/bị mai phục)
 */

// ── Sông chính (polyline xấp xỉ) ──
export const RIVERS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Sông Hồng" },
      geometry: {
        type: "LineString",
        coordinates: [
          [103.95, 22.5], [104.5, 21.95], [105.1, 21.45], [105.5, 21.2],
          [105.84, 21.03], [106.1, 20.7], [106.4, 20.45], [106.55, 20.25],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Sông Bạch Đằng" },
      geometry: {
        type: "LineString",
        coordinates: [[106.55, 20.98], [106.7, 20.94], [106.78, 20.92], [106.9, 20.88]],
      },
    },
    {
      type: "Feature",
      properties: { name: "Sông Cầu" },
      geometry: {
        type: "LineString",
        coordinates: [[105.85, 21.42], [106.0, 21.22], [106.12, 21.08], [106.25, 20.95]],
      },
    },
    {
      type: "Feature",
      properties: { name: "Sông Mã" },
      geometry: {
        type: "LineString",
        coordinates: [[104.6, 20.5], [105.3, 20.0], [105.8, 19.78]],
      },
    },
  ],
};

// ── Nhãn vùng (định vị) ──
export const REGION_LABELS = [
  { label: "BẮC BỘ", center: [104.9, 21.6] },
  { label: "TRUNG BỘ", center: [107.4, 16.2] },
  { label: "NAM BỘ", center: [106.0, 10.2] },
];

// ── Đường tiến quân theo từng lần kháng chiến ──
// yearStart/yearEnd để lọc theo dòng thời gian.
const ROUTES = [
  // Lần 1 (1258): quân Mông Cổ theo sông Hồng từ Vân Nam xuống Thăng Long
  {
    id: "l1_invade", yearStart: 1258, yearEnd: 1258, kind: "invade",
    label: "Quân Mông Cổ tiến (1258)",
    coords: [[104.0, 22.45], [104.7, 21.8], [105.3, 21.35], [105.84, 21.06]],
  },
  {
    id: "l1_counter", yearStart: 1258, yearEnd: 1258, kind: "counter",
    label: "Phản công Đông Bộ Đầu",
    coords: [[105.95, 21.18], [105.9, 21.1], [105.85, 21.04]],
  },
  // Lần 2 (1285): Thoát Hoan từ bắc, Toa Đô từ nam; ta phản công Hàm Tử – Chương Dương
  {
    id: "l2_invade_n", yearStart: 1285, yearEnd: 1285, kind: "invade",
    label: "Thoát Hoan từ Lạng Sơn",
    coords: [[106.75, 21.85], [106.4, 21.5], [106.0, 21.2], [105.84, 21.05]],
  },
  {
    id: "l2_invade_s", yearStart: 1285, yearEnd: 1285, kind: "invade",
    label: "Toa Đô từ phía nam",
    coords: [[108.2, 16.0], [107.2, 17.6], [106.2, 19.0], [105.95, 20.35], [105.9, 20.78]],
  },
  {
    id: "l2_counter", yearStart: 1285, yearEnd: 1285, kind: "counter",
    label: "Phản công Hàm Tử – Chương Dương",
    coords: [[105.97, 20.78], [105.9, 20.84], [105.86, 20.87], [105.84, 21.02]],
  },
  // Lần 3 (1287–1288): bộ binh qua Vạn Kiếp, thuỷ quân qua Vân Đồn, rút về bị mai phục ở Bạch Đằng
  {
    id: "l3_invade_land", yearStart: 1287, yearEnd: 1288, kind: "invade",
    label: "Bộ binh qua Vạn Kiếp",
    coords: [[106.75, 21.85], [106.5, 21.4], [106.36, 21.12], [106.0, 21.06], [105.85, 21.04]],
  },
  {
    id: "l3_invade_naval", yearStart: 1287, yearEnd: 1288, kind: "naval",
    label: "Thuỷ quân qua Vân Đồn",
    coords: [[108.0, 21.5], [107.42, 21.06], [107.0, 20.98], [106.85, 20.95]],
  },
  {
    id: "l3_retreat", yearStart: 1288, yearEnd: 1288, kind: "retreat",
    label: "Giặc rút – mai phục Bạch Đằng",
    coords: [[105.88, 21.04], [106.36, 21.12], [106.6, 20.98], [106.78, 20.92]],
  },
];

export const ROUTE_STYLE = {
  invade: { color: "#9c3b1b", label: "Giặc tiến" },
  naval: { color: "#2f5d7a", label: "Thuỷ quân giặc" },
  counter: { color: "#8a6a1f", label: "Ta phản công" },
  retreat: { color: "#7a2f2f", label: "Giặc rút / mai phục" },
};

/** Lấy GeoJSON các route giao với cửa sổ năm [from,to]; chỉ khi cửa sổ đủ hẹp (1 chiến dịch). */
export function buildRoutes(from, to) {
  // Cửa sổ rộng (toàn bộ) -> không vẽ để khỏi rối.
  if (to - from > 6) return { type: "FeatureCollection", features: [] };
  const feats = ROUTES.filter((r) => r.yearEnd >= from && r.yearStart <= to).map((r) => ({
    type: "Feature",
    properties: { id: r.id, kind: r.kind, label: r.label, color: ROUTE_STYLE[r.kind].color },
    geometry: { type: "LineString", coordinates: r.coords },
  }));
  return { type: "FeatureCollection", features: feats };
}

/** Điểm mũi tên (đầu cuối mỗi route) để đặt symbol arrowhead. */
export function buildRouteHeads(from, to) {
  if (to - from > 6) return { type: "FeatureCollection", features: [] };
  const feats = ROUTES.filter((r) => r.yearEnd >= from && r.yearStart <= to).map((r) => {
    const c = r.coords;
    const a = c[c.length - 2];
    const b = c[c.length - 1];
    const bearing = (Math.atan2(b[0] - a[0], b[1] - a[1]) * 180) / Math.PI;
    return {
      type: "Feature",
      properties: { kind: r.kind, color: ROUTE_STYLE[r.kind].color, bearing },
      geometry: { type: "Point", coordinates: b },
    };
  });
  return { type: "FeatureCollection", features: feats };
}

export function hasRoutes(from, to) {
  return to - from <= 6 && ROUTES.some((r) => r.yearEnd >= from && r.yearStart <= to);
}
