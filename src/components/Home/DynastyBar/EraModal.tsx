import { motion } from "motion/react";
import { useEffect } from "react";
import type { Era } from "./timelineData";
import { commonsUrl, fallbackImage } from "./timelineData";

function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, [locked]);
}

export function EraModal({ era, onClose }: { era: Era | null; onClose: () => void }) {
  useScrollLock(Boolean(era));

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!era) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="era-modal-heading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        background: "rgba(0,0,0,.62)",
        backdropFilter: "blur(8px)",
      }}
    >
      <motion.div
        className="relative max-h-[min(82vh,800px)] w-full max-w-[860px] overflow-auto"
        style={{
          background: "linear-gradient(180deg, #f5ebd8, #e8d5b0)",
          color: "var(--dt-ink)",
          borderRadius: 12,
          boxShadow: "0 30px 90px rgba(0,0,0,.45)",
        }}
        initial={{ opacity: 0, y: 26, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.98 }}
        transition={{ duration: 0.26, ease: "easeOut" }}
      >
        <button
          className="absolute top-2.5 right-2.5 z-[5] grid h-[32px] w-[32px] cursor-pointer place-items-center rounded-full border text-sm"
          style={{
            borderColor: "rgba(255,255,255,.22)",
            background: "rgba(0,0,0,.22)",
            color: "#fff",
          }}
          type="button"
          aria-label="Đóng"
          onClick={onClose}
        >
          ×
        </button>

        <div
          className="relative h-[min(34vh,260px)] overflow-hidden"
          style={{ background: "#1a130c" }}
        >
          <img
            src={commonsUrl(era.file, 1400)}
            alt={era.person}
            className="h-full w-full object-cover"
            style={{ filter: "sepia(18%) contrast(1.03)" }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallbackImage(era.short, era.place);
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(180deg, transparent, rgba(0,0,0,.6))",
            }}
          />
          <div className="absolute left-4 right-12 bottom-3 z-[2]" style={{ color: "#fff" }}>
            <small
              className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em]"
              style={{ color: "var(--dt-gold2)" }}
            >
              {era.period}
            </small>
            <h4
              id="era-modal-heading"
              className="text-[clamp(1.3rem,2.6vw,2rem)] font-extrabold leading-[1.05]"
            >
              {era.title}
            </h4>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <p className="mb-3 text-[0.85rem] leading-[1.68]" style={{ color: "#4a3524" }}>
            {era.summary}
          </p>

          <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-3">
            {[
              { label: "Nhân vật", value: era.person },
              { label: "Dấu mốc", value: era.mark },
              { label: "Không gian", value: era.place },
            ].map((f) => (
              <div
                key={f.label}
                className="rounded-xl border p-3"
                style={{
                  background: "rgba(255,255,255,.26)",
                  borderColor: "rgba(157,47,34,.08)",
                }}
              >
                <small
                  className="mb-1 block text-[0.56rem] font-bold uppercase tracking-[0.08em]"
                  style={{ color: "#8a2e22" }}
                >
                  {f.label}
                </small>
                <strong className="text-[0.82rem] leading-snug">{f.value}</strong>
              </div>
            ))}
          </div>

          <p className="mb-3 text-[0.85rem] leading-[1.68]" style={{ color: "#4a3524" }}>
            {era.detail}
          </p>

          {era.events && (
            <div
              className="mb-3 border-t pt-3"
              style={{ borderColor: "rgba(157,47,34,.1)" }}
            >
              <h5 className="mb-2 text-[1rem] font-bold" style={{ color: "#7a2e1f" }}>
                Sự kiện tiêu biểu
              </h5>
              <ul
                className="space-y-1 pl-5 text-[0.82rem] leading-[1.55]"
                style={{ color: "#5a3d2d", listStyleType: "disc" }}
              >
                {era.events.map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>
            </div>
          )}

          <a
            className="dt-btn-sm"
            href={era.source}
            target="_blank"
            rel="noopener noreferrer"
          >
            Nguồn ảnh Wikimedia ↗
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
