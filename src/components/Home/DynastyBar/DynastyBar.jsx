import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useTranslation } from "react-i18next";
import "./DynastyBar.css";
import { commonsUrl, fallbackImage, eras } from "./timelineData";

const MotionDiv = motion.div;
const MotionH3 = motion.h3;
const MotionP = motion.p;
const MotionImg = motion.img;

function sealText(person) {
  const parts = person.split(/\s|–|\//).filter(Boolean);
  return (parts.at(-1)?.charAt(0) || "V").toUpperCase();
}

function scrollToEra(id) {
  document.getElementById(`dt-${id}`)?.scrollIntoView({ behavior: "smooth" });
}

function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = old; };
  }, [locked]);
}

/* ====== Sub-components ====== */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 28 });
  return <MotionDiv className="dt-progress" style={{ scaleX }} />;
}

function AmbientDrum() {
  return (
    <MotionDiv className="dt-drum" aria-hidden="true"
      animate={{ rotate: 360 }}
      transition={{ duration: 220, ease: "linear", repeat: Infinity }}
    >
      <svg viewBox="0 0 220 220" fill="none">
        <circle cx="110" cy="110" r="103" stroke="#D8B65A" strokeWidth="1"/>
        <circle cx="110" cy="110" r="88" stroke="#D8B65A" strokeWidth="1"/>
        <path d="M110 18L119 91H202L129 113L155 195L110 126L65 195L91 113L18 91H101L110 18Z" stroke="#D8B65A" strokeWidth="1"/>
        <g opacity=".8" stroke="#D8B65A" strokeWidth="1">
          <path d="M110 7v206M7 110h206M37 37l146 146M183 37L37 183"/>
        </g>
        <circle cx="110" cy="110" r="8" fill="#D8B65A"/>
      </svg>
    </MotionDiv>
  );
}

function EraBadge({ activeEra }) {
  if (!activeEra) return null;
  return (
    <MotionDiv className="dt-badge"
      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}>
      {activeEra.short} · {activeEra.period}
    </MotionDiv>
  );
}

/* ====== Era Page (one full viewport per dynasty) ====== */

function EraPage({ era, index, onOpen, onActive }) {
  const ref = useRef(null);
  const pref = useReducedMotion();

  return (
    <MotionDiv
      ref={ref}
      id={`dt-${era.id}`}
      className="dt-page"
      onViewportEnter={() => onActive(era)}
      viewport={{ amount: .45, margin: "-5% 0px -5% 0px" }}
    >
      <div className="dt-page-card">
        {/* Image panel */}
        <div className="dt-page-img">
          <MotionImg
            src={commonsUrl(era.file, 1000)}
            alt={`${era.person} – ${era.place}`}
            loading="lazy"
            initial={pref ? false : { scale: 1.08 }}
            whileInView={pref ? undefined : { scale: 1 }}
            viewport={{ amount: .3, once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            onError={(e) => { e.currentTarget.src = fallbackImage(era.short, era.place); }}
          />
          <span className="dt-page-img-credit">{era.place}</span>
        </div>

        {/* Text panel */}
        <div className="dt-page-body">
          <div className="dt-page-num">{String(index + 1).padStart(2, "0")}</div>
          <div className="dt-page-period">{era.period}</div>

          <MotionH3
            initial={pref ? false : { opacity: 0, y: 14 }}
            whileInView={pref ? undefined : { opacity: 1, y: 0 }}
            viewport={{ amount: .4, once: true }}
            transition={{ delay: .1, duration: .45 }}
          >
            <span>{era.theme}</span>
            {era.title}
          </MotionH3>

          <MotionP
            className="dt-page-summary"
            initial={pref ? false : { opacity: 0, y: 12 }}
            whileInView={pref ? undefined : { opacity: 1, y: 0 }}
            viewport={{ amount: .4, once: true }}
            transition={{ delay: .18, duration: .4 }}
          >
            {era.summary}
          </MotionP>

          <MotionDiv
            className="dt-page-rep"
            initial={pref ? false : { opacity: 0, y: 10 }}
            whileInView={pref ? undefined : { opacity: 1, y: 0 }}
            viewport={{ amount: .4, once: true }}
            transition={{ delay: .24, duration: .38 }}
          >
            <div className="dt-page-seal">{sealText(era.person)}</div>
            <div>
              <strong>{era.person}</strong>
              <span>{era.role}</span>
            </div>
          </MotionDiv>

          <MotionDiv
            className="dt-page-actions"
            initial={pref ? false : { opacity: 0 }}
            whileInView={pref ? undefined : { opacity: 1 }}
            viewport={{ amount: .4, once: true }}
            transition={{ delay: .3 }}
          >
            <button className="dt-small-btn" type="button" onClick={() => onOpen(index)}>
              Chi tiết
            </button>
            <a className="dt-small-btn" href={era.source} target="_blank" rel="noopener noreferrer">
              Nguồn ảnh
            </a>
          </MotionDiv>

          <div className="dt-page-footer">
            {String(index + 1).padStart(2, "0")} / {String(eras.length).padStart(2, "0")}
          </div>
        </div>
      </div>
    </MotionDiv>
  );
}

/* ====== Modal ====== */

function EraModal({ era, onClose }) {
  useScrollLock(Boolean(era));
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!era) return null;

  return (
    <AnimatePresence>
      <MotionDiv className="dt-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="dt-modal-heading"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <MotionDiv className="dt-modal-card"
          initial={{ opacity: 0, y: 26, scale: .96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: .98 }}
          transition={{ duration: .26, ease: "easeOut" }}
        >
          <button className="dt-modal-close" type="button" aria-label="Đóng" onClick={onClose}>×</button>
          <div className="dt-modal-media">
            <img src={commonsUrl(era.file, 1400)} alt={era.person}
              onError={(e) => { e.currentTarget.src = fallbackImage(era.short, era.place); }}/>
            <div className="dt-modal-title">
              <small>{era.period}</small>
              <h4 id="dt-modal-heading">{era.title}</h4>
            </div>
          </div>
          <div className="dt-modal-body">
            <p>{era.summary}</p>
            <div className="dt-modal-facts">
              <div className="dt-modal-fact"><small>Nhân vật</small><strong>{era.person}</strong></div>
              <div className="dt-modal-fact"><small>Dấu mốc</small><strong>{era.mark}</strong></div>
              <div className="dt-modal-fact"><small>Không gian</small><strong>{era.place}</strong></div>
            </div>
            <p>{era.detail}</p>
            {era.events && (
              <div className="dt-modal-divider">
                <h5>Sự kiện tiêu biểu</h5>
                <ul>{era.events.map((ev, i) => <li key={i}>{ev}</li>)}</ul>
              </div>
            )}
            <a className="dt-small-btn" href={era.source} target="_blank" rel="noopener noreferrer">Nguồn ảnh Wikimedia</a>
          </div>
        </MotionDiv>
      </MotionDiv>
    </AnimatePresence>
  );
}

/* ====== Navigator (pill quick-jump) ====== */

function Navigator({ activeEra, onJump }) {
  return (
    <div className="dt-nav">
      <div className="dt-nav-shell">
        <div className="dt-nav-pills">
          {eras.map((e, i) => (
            <button key={e.id} className={`dt-nav-pill ${activeEra?.id === e.id ? "active" : ""}`}
              type="button" onClick={() => onJump(e.id)}>
              {String(i + 1).padStart(2, "0")} · {e.short}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ====== Main ====== */

export default function DynastyBar() {
  const t = useTranslation().t;
  const [activeEra, setActiveEra] = useState(eras[0]);
  const [selected, setSelected] = useState(null);
  const pref = useReducedMotion();
  const selEra = selected !== null ? eras[selected] : null;

  return (
    <section className="relative overflow-hidden">
      <ScrollProgress />
      <AmbientDrum />
      <EraBadge activeEra={activeEra} />

      {/* Hero page */}
      <div className="dt-hero">
        <div className="dt-hero-inner">
          <MotionDiv className="dt-hero-eyebrow"
            initial={pref ? false : { opacity: 0, y: 10 }}
            animate={pref ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: .6 }}
          >
            {t("home.dynasty.eyebrow")}
          </MotionDiv>
          <MotionH3
            initial={pref ? false : { opacity: 0, y: 16 }}
            animate={pref ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: .7, ease: "easeOut" }}
          >
            <span style={{ display: "block", fontSize: "clamp(1rem,2.5vw,1.4rem)", fontWeight: 600, color: "var(--dt-gold2)", letterSpacing: ".08em", marginBottom: ".3rem", textTransform: "uppercase" }}>
              {t("home.dynasty.eyebrow")}
            </span>
            {t("home.dynasty.title")}
          </MotionH3>
          <MotionP className="dt-hero-sub"
            initial={pref ? false : { opacity: 0, y: 12 }}
            animate={pref ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: .12, duration: .6 }}
          >
            {t("home.dynasty.description")}
          </MotionP>
          <MotionDiv className="dt-hero-actions"
            initial={pref ? false : { opacity: 0 }}
            animate={pref ? undefined : { opacity: 1 }}
            transition={{ delay: .22, duration: .5 }}
          >
            <button type="button" className="dt-btn dt-btn-primary" onClick={() => scrollToEra("hong-bang")}>
              Mở trang đầu ↓
            </button>
            <button type="button" className="dt-btn" onClick={() => setSelected(Math.floor(Math.random() * eras.length))}>
              Thời đại bất kỳ
            </button>
          </MotionDiv>
        </div>
      </div>

      {/* Book pages with scroll-snap */}
      <div className="dt-book">
        {eras.map((era, i) => (
          <EraPage key={era.id} era={era} index={i} onOpen={setSelected} onActive={setActiveEra} />
        ))}

        {/* Quick-jump at bottom */}
        <div className="dt-nav-bottom">
          {eras.map((e, i) => (
            <button key={e.id} className={`dt-nav-pill ${activeEra?.id === e.id ? "active" : ""}`}
              type="button" onClick={() => scrollToEra(e.id)}>
              {String(i + 1).padStart(2, "0")} · {e.short}
            </button>
          ))}
        </div>
      </div>

      <EraModal era={selEra} onClose={() => setSelected(null)} />
    </section>
  );
}
