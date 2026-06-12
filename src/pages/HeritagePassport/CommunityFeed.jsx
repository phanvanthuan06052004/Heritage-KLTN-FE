import { useState } from "react";
import { Users, ShieldCheck, MapPin, X, Clock } from "lucide-react";
import { useGetCommunityQuery } from "~/store/apis/gamificationApi";

/**
 * CommunityFeed — feed check-in CÔNG KHAI của cộng đồng.
 * - heritageId: nếu có → chỉ hiện check-in tại di tích đó (dùng ở Heritage Detail).
 * - không có → feed toàn cục (dùng ở /passport).
 */
function timeAgo(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return d.toLocaleDateString("vi-VN");
}

function fullDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("vi-VN", {
    hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default function CommunityFeed({ heritageId, title = "Cộng đồng đã ghé thăm", limit = 12, showHeritage = false }) {
  const { data: items = [] } = useGetCommunityQuery({ heritageId, limit });
  const [selected, setSelected] = useState(null);

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-museum-gold/20 bg-museum-black/30 p-5 text-center text-sm text-museum-muted">
        Chưa có ai chia sẻ chuyến ghé thăm công khai. Hãy là người đầu tiên!
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-museum-gold-light">
        <Users className="h-4 w-4" />
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          {title} ({items.length})
        </span>
        <span className="ml-auto h-px flex-1 bg-gradient-to-r from-museum-gold/30 to-transparent" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => setSelected(it)}
            className="group overflow-hidden rounded-2xl border border-museum-gold/15 bg-museum-black/45 text-left transition-all hover:border-museum-gold/45 hover:shadow-museum-card"
          >
            <div className="relative h-28 overflow-hidden bg-museum-black/50">
              {it.photoUrl ? (
                <img src={it.photoUrl} alt={it.heritageTitle} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-museum-gold/40">
                  <MapPin className="h-7 w-7" />
                </div>
              )}
              {it.verified && (
                <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-museum-gold px-1.5 py-0.5 text-[9px] font-bold text-museum-black">
                  <ShieldCheck className="h-3 w-3" /> Đã đến
                </span>
              )}
            </div>
            <div className="p-2.5">
              <div className="flex items-center gap-1.5">
                {it.avatarUrl ? (
                  <img src={it.avatarUrl} alt={it.displayName} className="h-5 w-5 rounded-full object-cover" />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-museum-gold/20 text-[9px] font-bold text-museum-gold-light">
                    {(it.displayName || "?").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="truncate text-xs font-medium text-museum-ivory">{it.displayName}</span>
              </div>
              {showHeritage && it.heritageTitle && (
                <p className="mt-1 truncate text-[11px] text-museum-gold-light/80">{it.heritageTitle}</p>
              )}
              <p className="mt-0.5 text-[10px] text-museum-muted">{timeAgo(it.createdAt)}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Modal chi tiết check-in */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <button
            type="button"
            aria-label="Đóng"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-museum-gold/20 bg-museum-black shadow-museum-card">
            <button
              onClick={() => setSelected(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-museum-black/60 p-1.5 text-museum-parchment backdrop-blur hover:text-museum-gold-light"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative h-56 bg-museum-black/60">
              {selected.photoUrl ? (
                <img src={selected.photoUrl} alt={selected.heritageTitle} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-museum-gold/40">
                  <MapPin className="h-12 w-12" />
                </div>
              )}
              {selected.verified && (
                <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-museum-gold px-2.5 py-1 text-[11px] font-bold text-museum-black">
                  <ShieldCheck className="h-3.5 w-3.5" /> Đã đến tận nơi
                </span>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2.5">
                {selected.avatarUrl ? (
                  <img src={selected.avatarUrl} alt={selected.displayName} className="h-10 w-10 rounded-full object-cover ring-1 ring-museum-gold/30" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-museum-gold/20 text-sm font-bold text-museum-gold-light">
                    {(selected.displayName || "?").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold text-museum-ivory">{selected.displayName}</p>
                  <p className="flex items-center gap-1 text-xs text-museum-muted">
                    <Clock className="h-3 w-3" /> {fullDate(selected.createdAt)}
                  </p>
                </div>
              </div>
              {selected.heritageTitle && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-museum-gold/15 bg-museum-black/50 p-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-museum-gold-light" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-museum-muted">Di tích đã ghé</p>
                    <p className="font-medium text-museum-parchment">{selected.heritageTitle}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
