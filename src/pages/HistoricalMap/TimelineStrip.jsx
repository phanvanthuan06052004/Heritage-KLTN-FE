import { getTypeMeta } from "./mockData";

/**
 * TimelineStrip (A1) — dải sự kiện theo dòng thời gian.
 * Các sự kiện nằm trong cửa sổ năm [from,to] được làm nổi; click để chọn trên bản đồ.
 */
export default function TimelineStrip({ events = [], from, to, activeId, onSelect }) {
  if (!events.length) return null;

  const inWindow = (e) => {
    const s = e.yearStart ?? e.yearEnd;
    const en = e.yearEnd ?? e.yearStart;
    if (s == null) return true;
    return en >= from && s <= to;
  };

  return (
    <div className="mt-5 rounded-2xl border border-museum-gold/15 bg-museum-black/45 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-museum-gold-light">
          Niên biểu kháng chiến
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-museum-gold/25 to-transparent" />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {events.map((e) => {
          const meta = getTypeMeta(e.type);
          const active = e.id === activeId;
          const lit = inWindow(e);
          const clickable = e.mapPoint;
          return (
            <button
              key={e.id}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onSelect?.(e.id)}
              className={`group relative w-[150px] shrink-0 rounded-xl border px-3 py-2.5 text-left transition-all ${
                active
                  ? "border-museum-gold/60 bg-museum-gold/12"
                  : lit
                    ? "border-museum-gold/25 bg-museum-black/55 hover:border-museum-gold/45"
                    : "border-museum-gold/10 bg-museum-black/30 opacity-45"
              } ${clickable ? "cursor-pointer" : "cursor-default"}`}
            >
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
                <span className="font-mono text-xs font-bold text-museum-gold-light">
                  {e.year}
                </span>
              </span>
              <span className="mt-1 block text-xs font-medium leading-snug text-museum-parchment">
                {e.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
