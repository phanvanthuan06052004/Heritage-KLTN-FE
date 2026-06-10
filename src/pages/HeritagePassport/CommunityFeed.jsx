import { Users, ShieldCheck, MapPin } from "lucide-react";
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

export default function CommunityFeed({ heritageId, title = "Cộng đồng đã ghé thăm", limit = 12, showHeritage = false }) {
  const { data: items = [] } = useGetCommunityQuery({ heritageId, limit });

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
          <div key={it.id} className="overflow-hidden rounded-2xl border border-museum-gold/15 bg-museum-black/45">
            <div className="relative h-28 bg-museum-black/50">
              {it.photoUrl ? (
                <img src={it.photoUrl} alt={it.heritageTitle} className="h-full w-full object-cover" />
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
          </div>
        ))}
      </div>
    </div>
  );
}
