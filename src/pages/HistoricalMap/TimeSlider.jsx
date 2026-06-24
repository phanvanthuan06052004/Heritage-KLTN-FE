import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Play, Pause, RotateCcw } from "lucide-react";

/**
 * TimeSlider (A1) — thanh kéo thời gian cho bản đồ lịch sử động.
 * Dual-range [from, to] + các mốc preset cho ba lần kháng chiến.
 * Có nút "tự chạy" (play) để xem dòng chảy thời gian như một thước phim.
 */

const PRESETS = [
  { key: "map.slider.all", from: 1225, to: 1300 },
  { key: "map.slider.war1", from: 1258, to: 1258 },
  { key: "map.slider.war2", from: 1284, to: 1285 },
  { key: "map.slider.war3", from: 1287, to: 1288 },
];

export default function TimeSlider({
  min = 1225,
  max = 1300,
  from,
  to,
  onChange,
  playing,
  onTogglePlay,
}) {
  const { t } = useTranslation();
  const setFrom = useCallback(
    (v) => {
      const nv = Math.min(Number(v), to);
      onChange({ from: nv, to });
    },
    [to, onChange],
  );
  const setTo = useCallback(
    (v) => {
      const nv = Math.max(Number(v), from);
      onChange({ from, to: nv });
    },
    [from, onChange],
  );

  const pct = (v) => ((v - min) / (max - min)) * 100;

  const activePreset = PRESETS.find((p) => p.from === from && p.to === to);

  return (
    <div className="rounded-2xl border border-museum-gold/20 bg-museum-black/55 px-4 py-3.5 sm:px-5">
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-museum-gold-light">
          {t("map.slider.timeline")}
        </span>
        <span className="rounded-full border border-museum-gold/25 bg-museum-black/50 px-2.5 py-0.5 font-mono text-xs text-museum-parchment">
          {from} – {to}
        </span>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onTogglePlay}
            className="flex items-center gap-1.5 rounded-full border border-museum-gold/30 bg-museum-gold/10 px-3 py-1 text-xs font-medium text-museum-gold-light transition-colors hover:bg-museum-gold/20"
            aria-label={playing ? t("map.slider.pause") : t("map.slider.autoplay")}
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {playing ? t("map.slider.stop") : t("map.slider.play")}
          </button>
          <button
            type="button"
            onClick={() => onChange({ from: min, to: max })}
            className="flex items-center gap-1 rounded-full border border-museum-gold/20 px-2.5 py-1 text-xs text-museum-muted transition-colors hover:border-museum-gold/40 hover:text-museum-parchment"
            aria-label={t("map.slider.reset")}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Dual range */}
      <div className="relative h-7">
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-museum-gold/15" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-museum-gold/70 to-museum-gold-light"
          style={{ left: `${pct(from)}%`, right: `${100 - pct(to)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="ts-range"
          aria-label={t("map.slider.yearStart")}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="ts-range"
          aria-label={t("map.slider.yearEnd")}
        />
      </div>

      <div className="mt-1 flex justify-between font-mono text-[10px] text-museum-muted">
        <span>{min}</span>
        <span>{max}</span>
      </div>

      {/* Presets */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => {
          const active = activePreset?.key === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onChange({ from: p.from, to: p.to })}
              className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                active
                  ? "border-museum-gold/60 bg-museum-gold/15 text-museum-gold-light"
                  : "border-museum-gold/20 bg-museum-black/40 text-museum-parchment hover:border-museum-gold/40"
              }`}
            >
              {t(p.key)}
            </button>
          );
        })}
      </div>

      <style>{`
        .ts-range {
          position:absolute; left:0; right:0; top:0; width:100%; height:28px;
          -webkit-appearance:none; appearance:none; background:transparent; pointer-events:none; margin:0;
        }
        .ts-range::-webkit-slider-thumb {
          -webkit-appearance:none; appearance:none; pointer-events:auto;
          width:16px; height:16px; border-radius:50%;
          background:#F2C66D; border:2px solid #071118;
          box-shadow:0 0 0 1px rgba(216,162,74,0.6), 0 2px 6px rgba(0,0,0,0.5);
          cursor:pointer;
        }
        .ts-range::-moz-range-thumb {
          pointer-events:auto; width:16px; height:16px; border-radius:50%;
          background:#F2C66D; border:2px solid #071118;
          box-shadow:0 0 0 1px rgba(216,162,74,0.6); cursor:pointer;
        }
        .ts-range::-moz-range-track { background:transparent; }
      `}</style>
    </div>
  );
}
