import { motion } from "motion/react";
import type { Era } from "./timelineData";
import { commonsUrl, fallbackImage } from "./timelineData";

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
});

export function EraPage({
  era,
  pageNumber,
  total,
}: {
  era: Era;
  pageNumber: number;
  total: number;
}) {
  return (
    <div
      className="relative grid h-full w-full grid-cols-1 gap-6 px-[clamp(1rem,4vw,2.5rem)] py-[clamp(0.8rem,2.5vw,1.5rem)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-8"
      style={{ color: "var(--dt-ink)" }}
    >
      <motion.figure
        initial={{ opacity: 0, scale: 1.04, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="relative m-0 flex flex-col"
      >
        <div
          className="dt-era-media relative flex-1 overflow-hidden md:sticky md:top-0"
          style={{ minHeight: 280, maxHeight: "calc(100vh - 8rem)" }}
        >
          <motion.img
            src={commonsUrl(era.file, 1200)}
            alt={era.imageCaption || era.place}
            loading="lazy"
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "linear" }}
            className="h-full w-full object-cover"
            style={{ filter: "sepia(0.28) saturate(0.9) contrast(0.98)" }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallbackImage(era.short, era.place);
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, transparent 55%, rgba(58,32,10,0.35) 100%), linear-gradient(180deg, rgba(255,240,200,0.08), rgba(80,40,10,0.18))",
            }}
          />
          <div
            className="absolute right-3 top-3 grid place-items-center text-2xl font-black shadow-[0_6px_16px_rgba(0,0,0,0.35)] rounded-md"
            style={{
              borderStyle: "double",
              borderWidth: 2,
              borderColor: "var(--dt-lacquer)",
              color: "var(--dt-lacquer)",
              background: "rgba(247,232,195,0.92)",
              transform: `rotate(${pageNumber % 2 === 0 ? -5 : 6}deg)`,
              width: 52,
              height: 52,
            }}
          >
            {era.seal}
          </div>
        </div>
        <figcaption
          className="mt-2 text-center text-[0.7rem] italic"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--dt-ink-soft)" }}
        >
          {era.imageCaption || era.place}
        </figcaption>
      </motion.figure>

      <div className="flex min-w-0 flex-col">
        <motion.div {...rise(0.1)} className="mb-3">
          <p
            className="text-[0.7rem] font-bold uppercase tracking-[0.22em]"
            style={{ color: "var(--dt-lacquer)" }}
          >
            {era.theme} · {pageNumber}/{total}
          </p>
          <h2
            className="mt-1 text-[clamp(1.5rem,3vw,2.2rem)] font-extrabold leading-[1.1]"
            style={{ color: "var(--dt-ink)" }}
          >
            {era.title}
          </h2>
          <p
            className="mt-1 text-[0.9rem] italic"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--dt-ink-soft)" }}
          >
            {era.period}
          </p>
        </motion.div>

        <motion.div
          {...rise(0.18)}
          className="mb-4 text-justify text-[clamp(0.85rem,1.1vw,0.96rem)] leading-[1.8]"
          style={{ color: "var(--dt-ink-soft)" }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.26, type: "spring", stiffness: 140, damping: 12 }}
            className="float-left mr-3 mt-1 leading-[0.82] font-black"
            style={{
              fontFamily: "'Noto Serif', Georgia, serif",
              fontSize: "clamp(2.8rem,5vw,3.8rem)",
              color: "var(--dt-lacquer)",
            }}
          >
            {era.drop}
          </motion.span>
          {era.summary.slice(1)}
        </motion.div>

        <motion.div
          {...rise(0.26)}
          className="dt-info-grid grid grid-cols-1 border-y sm:grid-cols-3 mb-4"
          style={{ borderColor: "rgba(42,29,16,0.16)" }}
        >
          {[
            { label: "Kinh đô", value: era.capital },
            { label: "Nhân vật", value: era.figure },
            { label: "Dấu mốc", value: era.milestone },
          ].map((f, i) => (
            <div
              key={f.label}
              className="border-t p-2.5 sm:border-l sm:border-t-0 sm:first:border-l-0"
              style={{
                borderColor: "rgba(42,29,16,0.16)",
                borderTopWidth: i === 0 ? 0 : undefined,
              }}
            >
              <small
                className="mb-1 block text-[0.62rem] font-bold uppercase tracking-[0.14em]"
                style={{ color: "var(--dt-lacquer)" }}
              >
                {f.label}
              </small>
              <strong className="block text-[0.85rem] leading-[1.3]" style={{ color: "var(--dt-ink)" }}>
                {f.value}
              </strong>
            </div>
          ))}
        </motion.div>

        {era.quote && (
          <motion.blockquote
            {...rise(0.34)}
            className="dt-quote-block mb-4 border-l-[3px] pl-4"
          >
            <p
              className="text-[clamp(0.9rem,1.3vw,1.05rem)] italic leading-[1.6]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              « {era.quote} »
            </p>
            {era.quoteAuthor && (
              <cite
                className="mt-1 block text-[0.7rem] font-semibold not-italic"
                style={{ color: "var(--dt-lacquer)" }}
              >
                — {era.quoteAuthor}
              </cite>
            )}
          </motion.blockquote>
        )}

        <motion.p
          {...rise(0.4)}
          className="mb-4 text-[clamp(0.82rem,1vw,0.89rem)] leading-[1.72] text-justify"
          style={{ color: "var(--dt-ink-soft)" }}
        >
          {era.detail.split(".").slice(0, 3).join(".") + "."}
        </motion.p>

        {era.events && era.events.length > 0 && (
          <motion.div
            {...rise(0.46)}
            className="mb-4 border-t pt-3"
            style={{ borderColor: "rgba(42,29,16,0.14)" }}
          >
            <h5
              className="mb-2 text-[0.78rem] font-extrabold uppercase tracking-[0.1em]"
              style={{ color: "var(--dt-lacquer)" }}
            >
              Sự kiện tiêu biểu
            </h5>
            <ul
              className="space-y-1 pl-5 text-[0.78rem] leading-[1.6]"
              style={{ color: "var(--dt-ink-soft)", listStyleType: "disc" }}
            >
              {era.events.slice(0, 5).map((ev, i) => (
                <li key={i}>{ev}</li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div
          {...rise(0.48)}
          className="mt-auto flex items-center justify-center gap-2 pt-2 text-[0.62rem] tracking-[0.08em]"
          style={{ color: "rgba(75,50,30,.35)" }}
        >
          <span className="text-[0.4rem] opacity-40">✦</span>
          {String(pageNumber).padStart(2, "0")} / {String(total).padStart(2, "0")}
          <span className="text-[0.4rem] opacity-40">✦</span>
        </motion.div>
      </div>
    </div>
  );
}
