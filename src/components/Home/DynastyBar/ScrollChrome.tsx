import { motion } from "motion/react";

export function ProgressDots({
  total,
  index,
  onGo,
}: {
  total: number;
  index: number;
  onGo: (i: number) => void;
}) {
  return (
    <div
      className="pointer-events-auto flex items-center gap-2 rounded-full border px-3 py-2 backdrop-blur-md"
      style={{
        borderColor: "rgba(216,182,90,.26)",
        background: "rgba(13,16,18,.6)",
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const active = i === index;
        return (
          <button
            key={i}
            aria-label={`Đi tới trang ${i + 1}`}
            onClick={() => onGo(i)}
            className="relative h-2 w-2 cursor-pointer rounded-full transition-transform"
            style={{
              background: active ? "var(--dt-gold2)" : "rgba(236,220,180,.26)",
              transform: active ? "scale(1.4)" : undefined,
              boxShadow: active ? "0 0 10px rgba(255,240,163,.55)" : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

export function NavArrow({
  dir,
  onClick,
  disabled,
}: {
  dir: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.08, x: dir === "left" ? -3 : 3 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "Trang trước" : "Trang sau"}
      className="pointer-events-auto grid h-12 w-12 cursor-pointer place-items-center rounded-full border backdrop-blur-md disabled:opacity-25"
      style={{
        borderColor: "rgba(216,182,90,.36)",
        background: "rgba(13,16,18,.65)",
        color: "var(--dt-gold2)",
      }}
    >
      {dir === "left" ? "←" : "→"}
    </motion.button>
  );
}

export function EraBadge({ label, visible }: { label: string; visible: boolean }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -8 }}
      transition={{ duration: 0.35 }}
      className="pointer-events-none fixed left-1/2 top-4 z-30 -translate-x-1/2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] backdrop-blur-md"
      style={{
        borderColor: "rgba(216,182,90,.36)",
        background: "rgba(20,11,7,.65)",
        color: "var(--dt-gold2)",
      }}
    >
      <span
        className="mr-2 inline-block h-[6px] w-[6px] -translate-y-[1px] rounded-full align-middle"
        style={{
          background: "var(--dt-lacquer)",
          boxShadow: "0 0 10px var(--dt-lacquer)",
        }}
      />
      {label}
    </motion.div>
  );
}
