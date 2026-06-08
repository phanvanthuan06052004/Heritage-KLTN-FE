/**
 * PersonaAvatar — chân dung hoạt họa "tướng quân / vua / nữ tướng" vẽ bằng SVG.
 *
 * - Cố định theo nhân vật (id): màu giáp + dáng đều suy ra từ id nên luôn nhất quán.
 * - role: 'king' (mũ miện) | 'general' (mũ trụ + chỏm) | mặc định general.
 * - gender: 'male' | 'female' (nữ có tóc xõa hai bên).
 * Không phụ thuộc mạng, không cần ảnh ngoài.
 */

// Vai trò / giới tính của các nhân vật đã biết (mở rộng khi thêm nhân vật mới).
const PERSONA_META = {
  tran_thai_tong: { role: "king" },
  tran_thanh_tong: { role: "king" },
  tran_nhan_tong: { role: "king" },
  tran_hung_dao: { role: "general" },
  tran_quang_khai: { role: "general" },
  tran_nhat_duat: { role: "general" },
  tran_quoc_toan: { role: "general" },
  tran_binh_trong: { role: "general" },
  tran_khanh_du: { role: "general" },
  tran_thu_do: { role: "general" },
  pham_ngu_lao: { role: "general" },
  yet_kieu: { role: "general" },
  da_tuong: { role: "general" },
};

// Bảng màu giáp (chọn tất định theo id để mỗi nhân vật một sắc thái).
const ARMOR_PALETTES = [
  { base: "#8a4b2b", trim: "#E8B84B", deep: "#5d3019" }, // terracotta
  { base: "#2f5d44", trim: "#E8B84B", deep: "#1c3b2a" }, // jade
  { base: "#39506e", trim: "#E8B84B", deep: "#22324a" }, // thép xanh
  { base: "#5a3a6e", trim: "#E8B84B", deep: "#3a2548" }, // tía
  { base: "#7a2f2f", trim: "#E8B84B", deep: "#4d1c1c" }, // huyết dụ
  { base: "#3f5252", trim: "#E8B84B", deep: "#263333" }, // lục thẫm
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < (str || "").length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export default function PersonaAvatar({ id = "", name = "", role, gender = "male", className = "" }) {
  const meta = PERSONA_META[id] || {};
  const r = role || meta.role || "general";
  const g = gender || meta.gender || "male";
  const pal = ARMOR_PALETTES[hash(id || name) % ARMOR_PALETTES.length];
  const uid = `pa-${(id || name || "x").replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={name || "Nhân vật"}>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16242e" />
          <stop offset="100%" stopColor="#0b141a" />
        </linearGradient>
        <linearGradient id={`${uid}-armor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pal.base} />
          <stop offset="100%" stopColor={pal.deep} />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F2C66D" />
          <stop offset="100%" stopColor="#C8912F" />
        </linearGradient>
      </defs>

      {/* Nền */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-bg)`} />
      <circle cx="50" cy="42" r="34" fill="#ffffff" opacity="0.04" />

      {/* Vai giáp + tấm hộ tâm */}
      <path
        d="M12 100 C12 80 28 70 50 70 C72 70 88 80 88 100 Z"
        fill={`url(#${uid}-armor)`}
        stroke={`url(#${uid}-gold)`}
        strokeWidth="1.6"
      />
      {/* Pauldron (giáp vai) */}
      <ellipse cx="22" cy="80" rx="11" ry="9" fill={pal.base} stroke={`url(#${uid}-gold)`} strokeWidth="1.2" />
      <ellipse cx="78" cy="80" rx="11" ry="9" fill={pal.base} stroke={`url(#${uid}-gold)`} strokeWidth="1.2" />
      {/* Cổ áo giáp chữ V + hộ tâm kính */}
      <path d="M40 73 L50 86 L60 73" fill="none" stroke={`url(#${uid}-gold)`} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="50" cy="83" r="2.4" fill={`url(#${uid}-gold)`} />

      {/* Cổ */}
      <rect x="44" y="58" width="12" height="14" rx="3" fill="#caa37a" />

      {/* Tóc nữ (xõa hai bên) nếu là nữ tướng */}
      {g === "female" && (
        <>
          <path d="M30 50 C28 64 33 72 38 74 L38 52 Z" fill="#2a2018" />
          <path d="M70 50 C72 64 67 72 62 74 L62 52 Z" fill="#2a2018" />
        </>
      )}

      {/* Mặt */}
      <ellipse cx="50" cy="48" rx="15" ry="17" fill="#e3b88c" />
      {/* Lông mày + mắt */}
      <rect x="41" y="45" width="6" height="1.6" rx="0.8" fill="#3a2a1d" />
      <rect x="53" y="45" width="6" height="1.6" rx="0.8" fill="#3a2a1d" />
      <circle cx="44" cy="49" r="1.7" fill="#2b211a" />
      <circle cx="56" cy="49" r="1.7" fill="#2b211a" />
      {/* Miệng nghiêm nghị */}
      <rect x="46" y="56" width="8" height="1.6" rx="0.8" fill="#9c6a44" />

      {/* Mũ trụ (chụp đỉnh đầu) */}
      <path
        d="M33 47 C33 27 67 27 67 47 C60 41 40 41 33 47 Z"
        fill={`url(#${uid}-armor)`}
        stroke={`url(#${uid}-gold)`}
        strokeWidth="1.4"
      />
      {/* Vành mũ */}
      <rect x="31" y="44" width="38" height="5.5" rx="2.5" fill={`url(#${uid}-gold)`} />
      <circle cx="50" cy="46.7" r="2.2" fill={pal.deep} stroke={`url(#${uid}-gold)`} strokeWidth="0.8" />

      {/* Đỉnh mũ: vua = mũ miện, tướng = chỏm + chùm lông */}
      {r === "king" ? (
        <path
          d="M38 30 L41 22 L45 28 L50 19 L55 28 L59 22 L62 30 Z"
          fill={`url(#${uid}-gold)`}
          stroke={pal.deep}
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <circle cx="50" cy="29" r="3" fill={`url(#${uid}-gold)`} />
          <path
            d="M50 27 C46 16 54 14 56 8 C52 16 56 22 50 27 Z"
            fill={pal.base}
            stroke={`url(#${uid}-gold)`}
            strokeWidth="0.8"
          />
        </>
      )}
    </svg>
  );
}
