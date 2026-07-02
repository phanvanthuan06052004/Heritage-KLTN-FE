/**
 * MOCK DATA cho "Vietnam Historical Universe" — bản đồ lịch sử tương tác.
 *
 * Hình dạng dữ liệu được thiết kế bám sát response dự kiến của Neo4j sau này:
 *   - HISTORICAL_LOCATIONS  ~  GET /graph/map-locations   (điểm trên bản đồ)
 *   - location.neighbors    ~  GET /graph/node/:id/neighbors  (ego-graph 1 hop)
 *
 * Nhờ vậy khi BE nối Neo4j thật, FE chỉ cần thay nguồn data (mock -> RTK Query),
 * không phải sửa UI. Mỗi neighbor là một cạnh: { relation, direction, node }.
 *
 * Nguồn nội dung: battle.md + vietnam-historical-universe.md
 */

// Các loại thực thể + màu sắc bám palette "museum" (gold / jade / terracotta / seal).
export const NODE_TYPE_META = {
  battle: { label: "Trận chiến", icon: "⚔️", color: "#C76A35" }, // terracotta-light
  person: { label: "Nhân vật", icon: "👤", color: "#6FAE8D" }, // jade-light
  dynasty: { label: "Triều đại", icon: "👑", color: "#D8A24A" }, // gold
  heritage: { label: "Di sản", icon: "🏛️", color: "#A78BDB" }, // violet accent
  capital: { label: "Kinh đô", icon: "🏙️", color: "#6FAE8D" },
  enemy: { label: "Đối phương", icon: "🛡️", color: "#8F1D1D" }, // seal
  event: { label: "Sự kiện", icon: "📜", color: "#5A8AC9" },
  artifact: { label: "Di vật / Tác phẩm", icon: "📖", color: "#C9A24A" },
};

export const getTypeMeta = (type) =>
  NODE_TYPE_META[type] || NODE_TYPE_META.heritage;

// Mỗi location = 1 node trung tâm + danh sách neighbor (cạnh đồ thị 1 hop).
export const HISTORICAL_LOCATIONS = [
  {
    id: "bach_dang_1288",
    name: "Sông Bạch Đằng",
    nameEn: "Battle of Bạch Đằng",
    year: "938 · 1288",
    type: "battle",
    lng: 106.78,
    lat: 20.92,
    province: "Quảng Ninh",
    summary:
      "Hai trận thủy chiến lịch sử với chiến thuật cọc gỗ trên lòng sông, đánh tan quân Nam Hán (938) và Nguyên Mông (1288).",
    neighbors: [
      { relation: "COMMANDED", direction: "in", node: { id: "ngo_quyen", name: "Ngô Quyền", type: "person" } },
      { relation: "COMMANDED", direction: "in", node: { id: "tran_hung_dao", name: "Trần Hưng Đạo", type: "person" } },
      { relation: "PART_OF", direction: "out", node: { id: "nha_tran", name: "Nhà Trần", type: "dynasty" } },
      { relation: "DEFEATED", direction: "out", node: { id: "nguyen_mong", name: "Quân Nguyên Mông", type: "enemy" } },
      { relation: "COMMEMORATED_AT", direction: "in", node: { id: "den_kiep_bac", name: "Đền Kiếp Bạc", type: "heritage" } },
    ],
  },
  {
    id: "co_loa",
    name: "Thành Cổ Loa",
    nameEn: "Cổ Loa Citadel",
    year: "TK III TCN",
    type: "heritage",
    lng: 105.876,
    lat: 21.122,
    province: "Hà Nội",
    summary:
      "Tòa thành ốc cổ nhất Việt Nam, kinh đô nhà nước Âu Lạc của An Dương Vương.",
    neighbors: [
      { relation: "BUILT_BY", direction: "out", node: { id: "an_duong_vuong", name: "An Dương Vương", type: "person" } },
      { relation: "CAPITAL_OF", direction: "out", node: { id: "au_lac", name: "Nhà nước Âu Lạc", type: "dynasty" } },
      { relation: "RELATED_TO", direction: "out", node: { id: "no_than", name: "Truyền thuyết Nỏ thần", type: "artifact" } },
    ],
  },
  {
    id: "hoa_lu",
    name: "Cố đô Hoa Lư",
    nameEn: "Hoa Lư Ancient Capital",
    year: "968–1010",
    type: "capital",
    lng: 105.917,
    lat: 20.288,
    province: "Ninh Bình",
    summary: "Kinh đô của nhà Đinh và Tiền Lê, trung tâm quyền lực thế kỷ X.",
    neighbors: [
      { relation: "FOUNDED", direction: "in", node: { id: "dinh_bo_linh", name: "Đinh Bộ Lĩnh", type: "person" } },
      { relation: "RULED", direction: "in", node: { id: "le_hoan", name: "Lê Hoàn", type: "person" } },
      { relation: "CAPITAL_OF", direction: "out", node: { id: "nha_dinh", name: "Nhà Đinh", type: "dynasty" } },
      { relation: "CAPITAL_OF", direction: "out", node: { id: "tien_le", name: "Nhà Tiền Lê", type: "dynasty" } },
    ],
  },
  {
    id: "thang_long",
    name: "Thăng Long – Hà Nội",
    nameEn: "Thăng Long Imperial Citadel",
    year: "1010–nay",
    type: "capital",
    lng: 105.834,
    lat: 21.028,
    province: "Hà Nội",
    summary:
      "Nghìn năm kinh đô Đại Việt, trải qua các triều Lý – Trần – Lê, Di sản Thế giới UNESCO.",
    neighbors: [
      { relation: "FOUNDED", direction: "in", node: { id: "ly_thai_to", name: "Lý Thái Tổ", type: "person" } },
      { relation: "CAPITAL_OF", direction: "out", node: { id: "nha_ly", name: "Nhà Lý", type: "dynasty" } },
      { relation: "CAPITAL_OF", direction: "out", node: { id: "nha_tran", name: "Nhà Trần", type: "dynasty" } },
      { relation: "RECOGNIZED_BY", direction: "out", node: { id: "unesco_tl", name: "UNESCO 2010", type: "event" } },
      { relation: "PART_OF", direction: "in", node: { id: "van_mieu", name: "Văn Miếu", type: "heritage" } },
    ],
  },
  {
    id: "nhu_nguyet_1077",
    name: "Phòng tuyến Như Nguyệt",
    nameEn: "Battle of Như Nguyệt",
    year: "1077",
    type: "battle",
    lng: 106.04,
    lat: 21.18,
    province: "Bắc Ninh",
    summary: "Lý Thường Kiệt đánh bại 10 vạn quân Tống trên phòng tuyến sông Cầu.",
    neighbors: [
      { relation: "COMMANDED", direction: "in", node: { id: "ly_thuong_kiet", name: "Lý Thường Kiệt", type: "person" } },
      { relation: "PART_OF", direction: "out", node: { id: "nha_ly", name: "Nhà Lý", type: "dynasty" } },
      { relation: "DEFEATED", direction: "out", node: { id: "quan_tong", name: "Quân Tống", type: "enemy" } },
      { relation: "RELATED_TO", direction: "out", node: { id: "nam_quoc_son_ha", name: "Nam quốc sơn hà", type: "artifact" } },
    ],
  },
  {
    id: "chi_lang_1427",
    name: "Ải Chi Lăng",
    nameEn: "Battle of Chi Lăng",
    year: "1427",
    type: "battle",
    lng: 106.52,
    lat: 21.69,
    province: "Lạng Sơn",
    summary:
      "Trận then chốt trong khởi nghĩa Lam Sơn, tiêu diệt viện binh Minh, chém Liễu Thăng.",
    neighbors: [
      { relation: "COMMANDED", direction: "in", node: { id: "le_loi", name: "Lê Lợi", type: "person" } },
      { relation: "PARTICIPATED_IN", direction: "in", node: { id: "nguyen_trai", name: "Nguyễn Trãi", type: "person" } },
      { relation: "PART_OF", direction: "out", node: { id: "lam_son", name: "Khởi nghĩa Lam Sơn", type: "event" } },
      { relation: "DEFEATED", direction: "out", node: { id: "quan_minh", name: "Quân Minh", type: "enemy" } },
    ],
  },
  {
    id: "dong_da_1789",
    name: "Gò Đống Đa",
    nameEn: "Battle of Đống Đa",
    year: "1789",
    type: "battle",
    lng: 105.823,
    lat: 21.018,
    province: "Hà Nội",
    summary: "Quang Trung – Nguyễn Huệ đại phá 29 vạn quân Thanh trong dịp Tết Kỷ Dậu.",
    neighbors: [
      { relation: "COMMANDED", direction: "in", node: { id: "quang_trung", name: "Quang Trung", type: "person" } },
      { relation: "PART_OF", direction: "out", node: { id: "tay_son", name: "Nhà Tây Sơn", type: "dynasty" } },
      { relation: "DEFEATED", direction: "out", node: { id: "quan_thanh", name: "Quân Thanh", type: "enemy" } },
      { relation: "COMMEMORATED_AT", direction: "in", node: { id: "go_dong_da_dt", name: "Di tích Gò Đống Đa", type: "heritage" } },
    ],
  },
  {
    id: "rach_gam_1785",
    name: "Rạch Gầm – Xoài Mút",
    nameEn: "Battle of Rạch Gầm–Xoài Mút",
    year: "1785",
    type: "battle",
    lng: 106.32,
    lat: 10.36,
    province: "Tiền Giang",
    summary: "Nguyễn Huệ đánh tan 5 vạn quân Xiêm trên sông Tiền chỉ trong một đêm.",
    neighbors: [
      { relation: "COMMANDED", direction: "in", node: { id: "nguyen_hue", name: "Nguyễn Huệ", type: "person" } },
      { relation: "PART_OF", direction: "out", node: { id: "tay_son", name: "Nhà Tây Sơn", type: "dynasty" } },
      { relation: "DEFEATED", direction: "out", node: { id: "quan_xiem", name: "Quân Xiêm", type: "enemy" } },
    ],
  },
  {
    id: "hue",
    name: "Hoàng Thành Huế",
    nameEn: "Huế Imperial City",
    year: "1802–1945",
    type: "heritage",
    lng: 107.58,
    lat: 16.467,
    province: "Thừa Thiên Huế",
    summary: "Cố đô nhà Nguyễn, kinh đô cuối cùng của chế độ phong kiến, Di sản UNESCO.",
    neighbors: [
      { relation: "BUILT_BY", direction: "out", node: { id: "gia_long", name: "Gia Long", type: "person" } },
      { relation: "CAPITAL_OF", direction: "out", node: { id: "nha_nguyen", name: "Nhà Nguyễn", type: "dynasty" } },
      { relation: "RECOGNIZED_BY", direction: "out", node: { id: "unesco_hue", name: "UNESCO 1993", type: "event" } },
      { relation: "WITNESSED", direction: "out", node: { id: "mau_than_hue", name: "Tết Mậu Thân 1968", type: "battle" } },
    ],
  },
  {
    id: "my_son",
    name: "Thánh địa Mỹ Sơn",
    nameEn: "Mỹ Sơn Sanctuary",
    year: "TK IV–XIV",
    type: "heritage",
    lng: 108.124,
    lat: 15.764,
    province: "Quảng Nam",
    summary: "Quần thể đền tháp Chăm Pa thờ thần Shiva, Di sản Thế giới UNESCO.",
    neighbors: [
      { relation: "BUILT_BY", direction: "out", node: { id: "champa", name: "Vương quốc Chăm Pa", type: "dynasty" } },
      { relation: "RECOGNIZED_BY", direction: "out", node: { id: "unesco_ms", name: "UNESCO 1999", type: "event" } },
      { relation: "DEDICATED_TO", direction: "out", node: { id: "shiva", name: "Thần Shiva", type: "artifact" } },
    ],
  },
  {
    id: "da_nang_1858",
    name: "Trận Đà Nẵng",
    nameEn: "Battle of Đà Nẵng",
    year: "1858",
    type: "battle",
    lng: 108.22,
    lat: 16.067,
    province: "Đà Nẵng",
    summary:
      "Liên quân Pháp – Tây Ban Nha nổ súng tấn công Đà Nẵng, mở đầu cuộc xâm lược của thực dân Pháp.",
    neighbors: [
      { relation: "COMMANDED", direction: "in", node: { id: "nguyen_tri_phuong", name: "Nguyễn Tri Phương", type: "person" } },
      { relation: "PART_OF", direction: "out", node: { id: "nha_nguyen", name: "Nhà Nguyễn", type: "dynasty" } },
      { relation: "OPPOSED", direction: "out", node: { id: "phap", name: "Quân Pháp", type: "enemy" } },
    ],
  },
  {
    id: "dien_bien_1954",
    name: "Điện Biên Phủ",
    nameEn: "Battle of Điện Biên Phủ",
    year: "1954",
    type: "battle",
    lng: 103.016,
    lat: 21.387,
    province: "Điện Biên",
    summary:
      "Chiến dịch 56 ngày đêm tiêu diệt tập đoàn cứ điểm Pháp, kết thúc chiến tranh Đông Dương.",
    neighbors: [
      { relation: "COMMANDED", direction: "in", node: { id: "vo_nguyen_giap", name: "Võ Nguyên Giáp", type: "person" } },
      { relation: "LED_BY", direction: "in", node: { id: "ho_chi_minh", name: "Hồ Chí Minh", type: "person" } },
      { relation: "OPPOSED", direction: "out", node: { id: "navarre", name: "Henri Navarre", type: "enemy" } },
      { relation: "LED_TO", direction: "out", node: { id: "geneve", name: "Hiệp định Genève", type: "event" } },
      { relation: "COMMEMORATED_AT", direction: "in", node: { id: "doi_a1", name: "Đồi A1", type: "heritage" } },
    ],
  },
  {
    id: "quang_tri_1972",
    name: "Thành cổ Quảng Trị",
    nameEn: "Quảng Trị Ancient Citadel",
    year: "1972",
    type: "battle",
    lng: 107.187,
    lat: 16.751,
    province: "Quảng Trị",
    summary: "81 ngày đêm bảo vệ Thành cổ — một trong những trận ác liệt nhất chiến tranh Việt Nam.",
    neighbors: [
      { relation: "PART_OF", direction: "out", node: { id: "vn_war", name: "Chiến tranh Việt Nam", type: "event" } },
      { relation: "RELATED_TO", direction: "out", node: { id: "thanh_co_dt", name: "Di tích Thành cổ", type: "heritage" } },
    ],
  },
  {
    id: "cu_chi",
    name: "Địa đạo Củ Chi",
    nameEn: "Củ Chi Tunnels",
    year: "1948–1975",
    type: "heritage",
    lng: 106.494,
    lat: 11.143,
    province: "TP. Hồ Chí Minh",
    summary: "Hệ thống 250km đường hầm kháng chiến, biểu tượng chiến tranh nhân dân.",
    neighbors: [
      { relation: "USED_BY", direction: "out", node: { id: "mttq", name: "Mặt trận Dân tộc Giải phóng", type: "dynasty" } },
      { relation: "PART_OF", direction: "out", node: { id: "vn_war", name: "Chiến tranh Việt Nam", type: "event" } },
      { relation: "STATUS", direction: "out", node: { id: "ditich_qg", name: "Di tích Quốc gia đặc biệt", type: "event" } },
    ],
  },
  {
    id: "saigon_1975",
    name: "Dinh Độc Lập – Sài Gòn",
    nameEn: "Hồ Chí Minh Campaign",
    year: "1975",
    type: "capital",
    lng: 106.696,
    lat: 10.777,
    province: "TP. Hồ Chí Minh",
    summary:
      "Chiến dịch Hồ Chí Minh kết thúc ngày 30/4/1975, thống nhất đất nước.",
    neighbors: [
      { relation: "COMMANDED", direction: "in", node: { id: "van_tien_dung", name: "Văn Tiến Dũng", type: "person" } },
      { relation: "KEY_DATE", direction: "out", node: { id: "30_4_1975", name: "30/4/1975", type: "event" } },
      { relation: "PART_OF", direction: "out", node: { id: "vn_war", name: "Chiến tranh Việt Nam", type: "event" } },
      { relation: "RELATED_TO", direction: "out", node: { id: "dinh_doc_lap", name: "Dinh Độc Lập", type: "heritage" } },
    ],
  },
];

// Số liệu tổng quan (mock) — hiển thị ở dải thống kê đầu trang.
export const OVERVIEW_STATS = [
  { value: "50+", label: "Trận chiến" },
  { value: "128", label: "Nhân vật" },
  { value: "15", label: "Triều đại" },
  { value: "74", label: "Di sản" },
  { value: "1.240", label: "Quan hệ" },
];
