import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { eras } from "./timelineData";
import { IntroPage } from "./IntroPage";
import { FinalePage } from "./FinalePage";
import { EraPage } from "./EraPage";
import { ScrollRod } from "./ScrollRod";
import { PaperTexture, GrainOverlay } from "./PaperTexture";
import { ProgressDots } from "./ScrollChrome";
import "./DynastyBar.css";

type PageKind = "intro" | "era" | "finale";
type Page = { kind: PageKind; eraIndex?: number };

const pages: Page[] = [
  { kind: "intro" },
  ...eras.map((_, i) => ({ kind: "era" as const, eraIndex: i })),
  { kind: "finale" },
];

function isScrollActive(rect: DOMRect) {
  const vh = window.innerHeight;
  const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
  if (visible <= 0) return false;
  return visible / vh > 0.65;
}

export default function DynastyScroll() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [inView, setInView] = useState(false);

  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (target: number) => {
      const clamped = Math.max(0, Math.min(pages.length - 1, target));
      if (clamped === index) return;
      setDir(clamped > index ? 1 : -1);
      setIndex(clamped);
    },
    [index],
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  const isAtStart = index === 0;
  const isAtEnd = index === pages.length - 1;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let snapTimer: ReturnType<typeof setTimeout> | null = null;
    let snapCooldown = false;
    let prevRatio = 0;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
      const ratio = visible > 0 ? visible / vh : 0;

      setInView(isScrollActive(rect));

      const entering = ratio > prevRatio;
      prevRatio = ratio;

      if (entering && ratio > 0.25 && ratio < 0.7 && !snapCooldown) {
        if (snapTimer) clearTimeout(snapTimer);
        snapTimer = setTimeout(() => {
          el.scrollIntoView({ block: "center", behavior: "smooth" });
          snapCooldown = true;
          setTimeout(() => { snapCooldown = false; }, 1000);
        }, 200);
      }
    };

    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (snapTimer) clearTimeout(snapTimer);
    };
  }, []);

  useEffect(() => {
    const accum = { val: 0 };
    let last = 0;
    const THRESHOLD = 50;
    const COOLDOWN = 200;

    const onWheel = (e: WheelEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (!isScrollActive(rect)) { accum.val = 0; return; }

      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;

      const goingDown = delta > 0;
      const canConsume = goingDown ? !isAtEnd : !isAtStart;
      if (!canConsume) { accum.val = 0; return; }

      e.preventDefault();
      const now = Date.now();
      if (now - last > COOLDOWN) accum.val = 0;
      last = now;
      accum.val += delta;

      while (accum.val >= THRESHOLD) { accum.val -= THRESHOLD; next(); }
      while (accum.val <= -THRESHOLD) { accum.val += THRESHOLD; prev(); }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [next, prev, isAtStart, isAtEnd]);

  useEffect(() => {
    if (!inView) return;
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault(); next();
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault(); prev();
      } else if (e.key === "Home") go(0);
      else if (e.key === "End") go(pages.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inView, next, prev, go]);

  useEffect(() => {
    if (!inView) return;
    let startY = 0;
    const onTouch = (e: TouchEvent) => { startY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = startY - e.changedTouches[0].clientY;
      if (dy > 50) next();
      else if (dy < -50) prev();
    };
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [inView, next, prev]);

  const current = pages[index];
  const currentEra = current.kind === "era" ? eras[current.eraIndex!] : undefined;

  const flipVariants = reduce
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (d: number) => ({
          y: d > 0 ? "100%" : "-100%",
          rotateX: d > 0 ? -10 : 10,
          opacity: 0,
          transformOrigin: d > 0 ? "top center" : "bottom center",
        }),
        center: {
          y: 0,
          rotateX: 0,
          opacity: 1,
          transformOrigin: "center center",
        },
        exit: (d: number) => ({
          y: d > 0 ? "-100%" : "100%",
          rotateX: d > 0 ? 10 : -10,
          opacity: 0,
          transformOrigin: d > 0 ? "bottom center" : "top center",
        }),
      };

  return (
    <div
      ref={containerRef}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{
        height: "calc(100svh + 30px)",
        background:
          "radial-gradient(circle at 20% 0%, rgba(201,143,74,.15), transparent 42rem), radial-gradient(circle at 85% 18%, rgba(157,47,34,.18), transparent 36rem), linear-gradient(180deg, var(--dt-bg), var(--dt-bg2) 42%, #150b05 100%)",
      }}
    >
      <GrainOverlay />

      <div
        className="relative z-[2] flex h-full w-full items-center justify-center px-3 sm:px-5"
        style={{ perspective: 2600 }}
      >
        <div className="relative flex h-full max-h-[880px] w-full max-w-[1280px] flex-col justify-center py-5">
          <div className="relative z-20 w-full">
            <ScrollRod position="top" />
          </div>

          <div
            className="relative mt-[-13px] flex-1"
            style={{ transformStyle: "preserve-3d" }}
          >
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.div
                key={index}
                custom={dir}
                variants={flipVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  duration: reduce ? 0.2 : 0.45,
                  ease: [0.25, 1, 0.25, 1],
                }}
                drag={reduce || !inView ? false : "y"}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.12}
                onDragEnd={(_, info) => {
                  if (info.offset.y < -55) next();
                  else if (info.offset.y > 55) prev();
                }}
                className="relative h-full w-full overflow-hidden"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0,0,0,.15), transparent 4%, transparent 96%, rgba(0,0,0,.15)), linear-gradient(180deg, var(--dt-paper), var(--dt-paper2))",
                  backfaceVisibility: "hidden",
                  boxShadow:
                    "0 35px 100px rgba(0,0,0,.55), inset 0 0 0 1px rgba(0,0,0,.06), 0 0 0 1px rgba(216,182,90,.06)",
                }}
              >
                <PaperTexture />
                <div className="relative z-[1] h-full w-full overflow-y-auto">
                  {current.kind === "intro" && (
                    <IntroPage
                      onOpen={next}
                      onRandom={() => {
                        const ri = 1 + Math.floor(Math.random() * eras.length);
                        go(ri);
                      }}
                    />
                  )}
                  {current.kind === "era" && (
                    <EraPage
                      era={currentEra!}
                      pageNumber={current.eraIndex! + 1}
                      total={eras.length}
                    />
                  )}
                  {current.kind === "finale" && (
                    <FinalePage onRestart={() => go(0)} />
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative z-20 mt-[-13px] w-full">
            <ScrollRod position="bottom" />
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex flex-col items-center gap-2">
        <ProgressDots total={pages.length} index={index} onGo={go} />
        <p
          className="text-[0.65rem] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "rgba(236,220,180,.52)" }}
        >
          {index + 1} / {pages.length}
        </p>
      </div>
    </div>
  );
}
