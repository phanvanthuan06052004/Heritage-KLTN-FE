import { useState } from "react";
import { dynasties, getTotalDuration } from "./dynastyData";

const TOTAL = getTotalDuration();

const DynastyTooltip = ({ dynasty, isVisible }) => {
  if (!isVisible) return null;
  return (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 min-w-[200px] animate-fade-up"
      style={{ pointerEvents: "none" }}
    >
      <div className="bg-foreground text-background rounded-xl shadow-xl p-4">
        <div className="font-bold text-sm mb-1.5">{dynasty.name}</div>
        <div className="text-[0.7rem] opacity-80 space-y-0.5">
          <p>
            <span className="opacity-60">Thời gian:</span>{" "}
            {dynasty.startYear < 0
              ? `${Math.abs(dynasty.startYear)} TCN`
              : dynasty.startYear}{" "}
            –{" "}
            {dynasty.endYear < 0
              ? `${Math.abs(dynasty.endYear)} TCN`
              : dynasty.endYear}
          </p>
          <p>
            <span className="opacity-60">Kéo dài:</span> {dynasty.duration} năm
          </p>
          <p className="pt-1.5 mt-1.5 border-t border-white/20 text-[0.65rem] leading-relaxed max-w-[200px]">
            <span className="opacity-60">Quân chủ tiêu biểu:</span>{" "}
            <span className="opacity-90">{dynasty.keyRulers}</span>
          </p>
        </div>
      </div>
      {/* Arrow */}
      <div
        className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "6px solid hsl(var(--foreground))",
        }}
      />
    </div>
  );
};

const DynastyBar = () => {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="w-full bg-gradient-to-b from-card to-background py-8 sm:py-12">
      <div className="lcn-container-x">
        {/* Section header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-5 w-1 rounded-full bg-gold" />
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-text3">
            Dòng thời gian các triều đại
          </span>
          <div className="flex-1 h-px bg-border/60" />
          <span className="text-[0.6rem] text-text3/60 font-mono">
            {dynasties.length} triều đại
          </span>
        </div>

        {/* Bar rows */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex w-full h-11 sm:h-12 rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5">
            {dynasties.slice(0, 6).map((d) => {
              const pct = (d.duration / TOTAL) * 100;
              return (
                <div
                  key={d.id}
                  className="relative flex items-center justify-center cursor-pointer transition-all duration-200"
                  style={{
                    width: `${pct}%`,
                    minWidth: pct < 1.5 ? `${pct}%` : "0",
                    backgroundColor: d.color.includes("bg-")
                      ? undefined
                      : undefined,
                  }}
                  onMouseEnter={() => setHoveredId(d.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div
                    className={`absolute inset-0 ${d.color} transition-all duration-300 ${
                      hoveredId === d.id
                        ? "brightness-110 saturate-125 scale-y-[1.08]"
                        : ""
                    }`}
                    style={{ borderRadius: "inherit" }}
                  />
                  <span className="relative z-10 text-[0.55rem] sm:text-[0.65rem] font-bold text-white/90 truncate px-1 drop-shadow-sm">
                    {d.name.length > 8 ? d.name.slice(0, 7) + "…" : d.name}
                  </span>
                  <DynastyTooltip dynasty={d} isVisible={hoveredId === d.id} />
                </div>
              );
            })}
          </div>

          <div className="flex w-full h-11 sm:h-12 rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5">
            {dynasties.slice(6, 12).map((d) => {
              const pct = (d.duration / TOTAL) * 100;
              return (
                <div
                  key={d.id}
                  className="relative flex items-center justify-center cursor-pointer transition-all duration-200"
                  style={{
                    width: `${pct}%`,
                    minWidth: pct < 1.5 ? `${pct}%` : "0",
                  }}
                  onMouseEnter={() => setHoveredId(d.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div
                    className={`absolute inset-0 ${d.color} transition-all duration-300 ${
                      hoveredId === d.id
                        ? "brightness-110 saturate-125 scale-y-[1.08]"
                        : ""
                    }`}
                    style={{ borderRadius: "inherit" }}
                  />
                  <span className="relative z-10 text-[0.55rem] sm:text-[0.65rem] font-bold text-white/90 truncate px-1 drop-shadow-sm">
                    {d.name.length > 8 ? d.name.slice(0, 7) + "…" : d.name}
                  </span>
                  <DynastyTooltip dynasty={d} isVisible={hoveredId === d.id} />
                </div>
              );
            })}
          </div>

          <div className="flex w-full h-11 sm:h-12 rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5">
            {dynasties.slice(12).map((d) => {
              const pct = (d.duration / TOTAL) * 100;
              return (
                <div
                  key={d.id}
                  className="relative flex items-center justify-center cursor-pointer transition-all duration-200"
                  style={{
                    width: `${pct}%`,
                    minWidth: pct < 1.5 ? `${pct}%` : "0",
                  }}
                  onMouseEnter={() => setHoveredId(d.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div
                    className={`absolute inset-0 ${d.color} transition-all duration-300 ${
                      hoveredId === d.id
                        ? "brightness-110 saturate-125 scale-y-[1.08]"
                        : ""
                    }`}
                    style={{ borderRadius: "inherit" }}
                  />
                  <span className="relative z-10 text-[0.55rem] sm:text-[0.65rem] font-bold text-white/90 truncate px-1 drop-shadow-sm">
                    {d.name.length > 8 ? d.name.slice(0, 7) + "…" : d.name}
                  </span>
                  <DynastyTooltip dynasty={d} isVisible={hoveredId === d.id} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend hint */}
        <div className="mt-4 flex items-center justify-center gap-4 text-[0.55rem] text-text3/50 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-amber-800" /> Hồng Bàng
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-red-700" /> Trần
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-blue-600" /> Hậu Lê
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-amber-600" /> Nguyễn
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-stone-500" /> Bắc thuộc
          </span>
        </div>
      </div>
    </div>
  );
};

export default DynastyBar;
