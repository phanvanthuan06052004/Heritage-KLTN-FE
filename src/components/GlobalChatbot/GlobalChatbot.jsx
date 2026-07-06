import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Button } from "~/components/common/ui/Button";
import {
  BookOpen,
  Bot,
  ChevronDown,
  FileSearch,
  Layers,
  Loader2,
  Minimize2,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useQueryRAGMutation } from "~/store/apis/chatSlice";
import { cn } from "~/lib/utils";

const SAMPLE_QUESTION_KEYS = [
  "chatbot.q1",
  "chatbot.q2",
  "chatbot.q3",
  "chatbot.q4",
];

const ACTION_TEMPLATES = [
  {
    id: "verify",
    labelKey: "chatbot.verifyLabel",
    promptKey: "chatbot.verifyPrompt",
    icon: FileSearch,
  },
  {
    id: "deeper",
    labelKey: "chatbot.deeperLabel",
    promptKey: "chatbot.deeperPrompt",
    icon: Layers,
  },
  {
    id: "shorter",
    labelKey: "chatbot.shorterLabel",
    promptKey: "chatbot.shorterPrompt",
    icon: Sparkles,
  },
];

const MotionButton = motion.button;
const MotionSpan = motion.span;

const RobotEye = ({ x }) => (
  <mesh position={[x, 0.47, 0.52]}>
    <sphereGeometry args={[0.072, 24, 24]} />
    <meshStandardMaterial
      color="#55f3ff"
      emissive="#1dd8ff"
      emissiveIntensity={1.8}
      roughness={0.18}
    />
  </mesh>
);

const RobotModel = ({ isMotionReduced = false, isWaving = false }) => {
  const groupRef = useRef(null);
  const headRef = useRef(null);
  const armLeftRef = useRef(null);
  const armRightRef = useRef(null);

  useFrame(({ clock }) => {
    if (isMotionReduced || !groupRef.current) return;

    const elapsed = clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(elapsed * 0.75) * 0.18;
    groupRef.current.position.y =
      Math.sin(elapsed * (isWaving ? 3.2 : 1.5)) * (isWaving ? 0.085 : 0.055);

    if (headRef.current) {
      headRef.current.rotation.z = Math.sin(elapsed * (isWaving ? 4.8 : 1.2)) * (isWaving ? 0.08 : 0.035);
    }
    if (armLeftRef.current && armRightRef.current) {
      armLeftRef.current.rotation.z = 0.22 + Math.sin(elapsed * 2.1) * 0.08;
      armRightRef.current.rotation.z = isWaving
        ? -0.92 + Math.sin(elapsed * 9.2) * 0.42
        : -0.22 - Math.sin(elapsed * 2.1) * 0.08;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.03, -0.18, 0]} scale={0.96}>
      <group ref={headRef}>
        <mesh position={[0, 0.48, 0]}>
          <sphereGeometry args={[0.42, 48, 32]} />
          <meshPhysicalMaterial
            color="#f8fbff"
            metalness={0.08}
            roughness={0.18}
            clearcoat={0.85}
            clearcoatRoughness={0.16}
          />
        </mesh>
        <mesh position={[0, 0.43, 0.36]} scale={[1.18, 0.72, 0.18]}>
          <sphereGeometry args={[0.28, 40, 24]} />
          <meshStandardMaterial
            color="#17202a"
            metalness={0.42}
            roughness={0.2}
          />
        </mesh>
        <RobotEye x={-0.14} />
        <RobotEye x={0.14} />
        <mesh position={[0, 0.31, 0.53]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.075, 0.011, 10, 28, Math.PI]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#dffbff"
            emissiveIntensity={0.55}
            roughness={0.2}
          />
        </mesh>
      </group>

      <mesh position={[0, -0.14, 0]} scale={[0.95, 1.12, 0.82]}>
        <sphereGeometry args={[0.36, 44, 28]} />
        <meshPhysicalMaterial
          color="#e9eef4"
          metalness={0.12}
          roughness={0.26}
          clearcoat={0.7}
          clearcoatRoughness={0.22}
        />
      </mesh>
      <mesh position={[0, -0.1, 0.34]}>
        <sphereGeometry args={[0.13, 32, 24]} />
        <meshStandardMaterial
          color="#86ffff"
          emissive="#29f3ee"
          emissiveIntensity={1.75}
          roughness={0.16}
        />
      </mesh>
      <mesh position={[0, -0.1, 0.345]}>
        <torusGeometry args={[0.16, 0.012, 12, 36]} />
        <meshStandardMaterial
          color="#e9ffff"
          emissive="#8ffffa"
          emissiveIntensity={0.55}
          roughness={0.18}
        />
      </mesh>

      <group ref={armLeftRef} position={[-0.36, -0.04, 0.02]}>
        <mesh position={[-0.13, -0.08, 0]} rotation={[0.08, 0.05, -0.38]}>
          <capsuleGeometry args={[0.065, 0.34, 10, 24]} />
          <meshPhysicalMaterial color="#d9e1eb" metalness={0.14} roughness={0.3} />
        </mesh>
      </group>
      <group ref={armRightRef} position={[0.36, -0.04, 0.02]}>
        <mesh position={[0.13, -0.08, 0]} rotation={[0.08, -0.05, 0.38]}>
          <capsuleGeometry args={[0.065, 0.34, 10, 24]} />
          <meshPhysicalMaterial color="#d9e1eb" metalness={0.14} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

const ChatbotLauncher = ({ onClick }) => {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <MotionButton
      type="button"
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.92 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      whileHover={prefersReducedMotion ? undefined : { y: -5, scale: 1.035 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="fixed bottom-4 right-3 z-50 h-[72px] w-[64px] bg-transparent p-0 text-left outline-none transition focus-visible:ring-4 focus-visible:ring-museum-gold-light/45 sm:bottom-5 sm:right-5 sm:h-[84px] sm:w-[72px]"
      aria-label={t("chatbot.fabAria")}
    >
      <MotionSpan
        initial={prefersReducedMotion ? false : { opacity: 0, y: 46, scale: 0.96 }}
        animate={
          prefersReducedMotion
            ? { opacity: [1, 1, 0] }
            : {
                opacity: [0, 1, 1, 0],
                y: [46, 0, 0, 46],
                scale: [0.96, 1, 1, 0.96],
              }
        }
        transition={{
          duration: 7.6,
          times: prefersReducedMotion ? [0, 0.82, 1] : [0, 0.11, 0.82, 1],
          ease: "easeOut",
        }}
        className="pointer-events-none absolute bottom-[66px] right-[64px] z-10 w-[min(200px,calc(100vw-7rem))] rounded-2xl bg-museum-espresso/95 px-3.5 py-2.5 text-museum-ivory shadow-museum-card ring-1 ring-museum-gold/20 backdrop-blur"
        aria-hidden="true"
      >
        <span className="mb-1.5 flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-museum-gold text-museum-black shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="truncate text-sm font-semibold text-museum-gold-light">
            {t("chatbot.title")}
          </span>
        </span>
        <span className="block text-[13px] leading-5">
          {t("chatbot.tagline")}
        </span>
        <span className="mt-1 block text-[11px] leading-4 text-museum-muted">
          {t("chatbot.askHint")}
        </span>
      </MotionSpan>
      <MotionSpan
        initial={false}
        animate={
          isHovered && !prefersReducedMotion
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 8, scale: 0.92 }
        }
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="pointer-events-none absolute bottom-[82px] right-[4px] z-30 rounded-full border border-museum-gold/30 bg-museum-espresso/95 px-2.5 py-1 text-xs font-semibold text-museum-gold-light shadow-museum-card sm:bottom-[94px]"
        aria-hidden="true"
      >
        {t("chatbot.greeting")}
      </MotionSpan>
      <span className="absolute inset-0 z-20 block drop-shadow-[0_20px_28px_rgba(15,23,42,0.34)]">
        <span className="absolute inset-x-5 bottom-2 h-5 rounded-full bg-slate-950/25 blur-md" />
        <Canvas
          camera={{ position: [0, 0.06, 3.25], fov: 32 }}
          dpr={[1, 1.75]}
          gl={{ alpha: true, antialias: true }}
          className="pointer-events-none"
        >
          <ambientLight intensity={1.55} />
          <directionalLight position={[2.4, 3.2, 4]} intensity={2.35} />
          <directionalLight position={[-2.2, 1.7, 2]} intensity={0.9} color="#bdefff" />
          <pointLight position={[0, -0.25, 1.6]} intensity={1.65} color="#4ff7f0" />
          <RobotModel isMotionReduced={prefersReducedMotion} isWaving={isHovered} />
        </Canvas>
      </span>
    </MotionButton>
  );
};

const getTime = () =>
  new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const stripInternalLabels = (text) =>
  String(text || "")
    .replace(/\bWIKI\s*CONTEXT\b/gi, "kho tri thức")
    .replace(/\bRAW\s*EVIDENCE\b/gi, "tài liệu gốc")
    .replace(/\bRAW\s+EVIDENCE\b/gi, "tài liệu gốc")
    .replace(/【E\d+】/g, "")
    .replace(/\[E\d+]/g, "")
    .replace(/\(E\d+\)/g, "")
    .replace(/\bE\d+\s*[-–:]/g, "")
    .replace(/[\u4e00-\u9fff\u3400-\u4dbf\uac00-\ud7af\uFFFD]/g, "")
    .trim();

const cleanSnippet = (text, maxLength = 420) => {
  let cleaned = stripInternalLabels(text)
    .replace(/URL Source:\s*https?:\/\/\S+/gi, "")
    .replace(/Published Time:\s*[^\\n]+?(?=Markdown Content:|$)/gi, "")
    .replace(/Markdown Content:\s*/gi, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, "$1")
    .replace(/\[\[([^\]|]+)\|([^\]]+)]]/g, "$2")
    .replace(/\[\[([^\]]+)]]/g, "$1")
    .replace(/[*_`>#]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  cleaned = cleaned.replace(/^[a-zà-ỹ]{1,4}\s+/u, (prefix) =>
    /^[A-ZÀ-Ỹ]/u.test(cleaned.slice(prefix.length, prefix.length + 1))
      ? ""
      : prefix,
  );

  if (cleaned.length <= maxLength) return cleaned;

  const slice = cleaned.slice(0, maxLength);
  const boundary = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("… "),
    slice.lastIndexOf("; "),
  );
  return `${(boundary > 180 ? slice.slice(0, boundary + 1) : slice).trim()}...`;
};

const getModeLabel = (mode) => {
  if (!mode || mode === "ready") return "";
  if (mode.includes("semantic")) return "semantic";
  if (mode.includes("full_text")) return "full-text";
  if (mode.includes("fallback")) return "fallback";
  if (mode === "error") return "error";
  return mode;
};

const normalizeResponse = (response, cannotAnswerText) => {
  const data = response?.data || response || {};
  const citations = (data.citations || []).map((citation) => ({
    ...citation,
    snippet: cleanSnippet(citation.snippet),
  }));
  const citationSourceIds = new Set(
    citations.map((citation) => citation.sourceId).filter(Boolean),
  );
  const rawSources = (data.rawSources || []).filter(
    (source) => !citationSourceIds.size || citationSourceIds.has(source.sourceId),
  );

  return {
    answer: stripInternalLabels(
      data.answer ||
        cannotAnswerText ||
        "Sorry, I cannot answer this question at the moment.",
    ),
    mode: data.mode || "general",
    sources: data.sources || [],
    wikiLinks: data.wikiLinks || [],
    citations,
    rawSources,
  };
};

const renderInlineMarkdown = (text, isUser = false) => {
  const parts = String(text || "").split(/(\*\*[^*]+\*\*|\[[^\]]+]\([^)]+\)|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (!part) return null;

    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) {
      return (
        <strong
          key={`${part}-${index}`}
          className={cn("font-semibold", isUser ? "text-museum-black" : "text-museum-ivory")}
        >
          {bold[1]}
        </strong>
      );
    }

    const link = part.match(/^\[([^\]]+)]\(([^)]+)\)$/);
    if (link) {
      return (
        <a
          key={`${part}-${index}`}
          href={link[2]}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "font-medium underline underline-offset-2",
            isUser ? "text-museum-black" : "text-museum-seal",
          )}
        >
          {link[1]}
        </a>
      );
    }

    const code = part.match(/^`([^`]+)`$/);
    if (code) {
      return (
        <code
          key={`${part}-${index}`}
          className={cn(
            "rounded px-1 py-0.5 text-[0.85em]",
            isUser ? "bg-museum-black/15 text-museum-black" : "bg-museum-gold/10 text-museum-gold-light",
          )}
        >
          {code[1]}
        </code>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
};

const MarkdownContent = ({ content, isUser = false }) => {
  const lines = String(content || "").split("\n");
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (!listItems.length) return;
    elements.push(
      <ul key={`list-${elements.length}`} className="mb-2 ml-4 list-disc space-y-1">
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`} className="pl-1">
            {renderInlineMarkdown(item, isUser)}
          </li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      return;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      listItems.push(bullet[1]);
      return;
    }

    flushList();

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${index}`} className="mb-1 mt-2.5 text-sm font-semibold leading-5">
          {renderInlineMarkdown(line.replace(/^###\s+/, ""), isUser)}
        </h3>,
      );
      return;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${index}`} className="mb-1.5 mt-3 text-sm font-semibold leading-5">
          {renderInlineMarkdown(line.replace(/^##\s+/, ""), isUser)}
        </h2>,
      );
      return;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={`h1-${index}`} className="mb-2 text-base font-semibold leading-6">
          {renderInlineMarkdown(line.replace(/^#\s+/, ""), isUser)}
        </h1>,
      );
      return;
    }

    if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={`quote-${index}`}
          className={cn(
            "my-2 border-l-2 py-1 pl-3",
            isUser ? "border-museum-black/40 bg-museum-black/10" : "border-museum-seal/45 bg-museum-seal/10 text-museum-parchment",
          )}
        >
          {renderInlineMarkdown(line.replace(/^>\s+/, ""), isUser)}
        </blockquote>,
      );
      return;
    }

    elements.push(
      <p key={`p-${index}`} className="mb-2 last:mb-0">
        {renderInlineMarkdown(line, isUser)}
      </p>,
    );
  });

  flushList();

  return (
    <div
      className={cn(
        "break-words text-sm leading-6",
        isUser ? "text-museum-black" : "text-museum-ivory",
      )}
    >
      {elements}
    </div>
  );
};

const ChatHeader = ({ isMinimized, onMinimize, onClose }) => {
  const { t } = useTranslation();
  return (
  <div className="flex items-center justify-between border-b border-museum-gold/15 bg-museum-seal px-4 py-2.5 text-museum-ivory shadow-sm">
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-museum-ivory/12 ring-1 ring-museum-ivory/20">
        <Bot className="h-4 w-4" />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-museum-jade ring-2 ring-museum-seal" />
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold">{t("chatbot.title")}</h3>
        {!isMinimized && (
          <p className="truncate text-[11px] text-museum-ivory/72">
            {t("chatbot.headerSubtitle")}
          </p>
        )}
      </div>
    </div>
    <div className="flex items-center gap-1">
      <button
        className="rounded-md p-1.5 text-museum-ivory/75 transition hover:bg-museum-ivory/12 hover:text-museum-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light"
        onClick={onMinimize}
        aria-label={isMinimized ? t("chatbot.expand") : t("chatbot.minimize")}
      >
        <Minimize2 className="h-3.5 w-3.5" />
      </button>
      <button
        className="rounded-md p-1.5 text-museum-ivory/75 transition hover:bg-museum-ivory/12 hover:text-museum-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light"
        onClick={onClose}
        aria-label={t("chatbot.close")}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
  );
};

const SourcePanel = ({ sources = [], mode }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleSources = sources.slice(0, isExpanded ? 6 : 2);
  const modeLabel = getModeLabel(mode);

  if (!sources.length) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-museum-gold/20 bg-museum-black/40 px-3 py-2 text-xs text-museum-gold-light">
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span>{t("chatbot.noSources")}</span>
      </div>
    );
  }

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-museum-gold/15 bg-museum-black/50">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-museum-gold/8"
      >
        <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-museum-parchment">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-museum-jade" />
          <span className="truncate">
            {t("chatbot.basedOnWiki", { count: sources.length })}
            {modeLabel ? ` • ${modeLabel}` : ""}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-museum-muted transition-transform",
            isExpanded && "rotate-180",
          )}
        />
      </button>
      <div className="space-y-2 border-t border-museum-gold/15 px-3 py-2">
        {visibleSources.map((source, index) => (
          <div
            key={`${source.slug || source.title}-${index}`}
            className="rounded-md bg-museum-espresso/60 px-2.5 py-2 text-xs shadow-sm ring-1 ring-museum-gold/15"
          >
            <div className="flex items-start gap-2">
              <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-museum-gold-light" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-museum-ivory">
                  {source.title || t("chatbot.untitledSource")}
                </p>
                <p className="truncate text-museum-muted">
                  {source.slug || source.pageType || t("chatbot.wikiPage")}
                </p>
              </div>
              {typeof source.similarity === "number" && (
                <span className="rounded bg-museum-jade/15 px-1.5 py-0.5 text-[10px] font-semibold text-museum-jade-light">
                  {Math.round(source.similarity * 100)}%
                </span>
              )}
            </div>
          </div>
        ))}
        {sources.length > 2 && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-xs font-medium text-museum-gold-light hover:text-museum-gold"
          >
            {isExpanded
              ? t("chatbot.collapseSources")
              : t("chatbot.showMoreSources", { count: sources.length - 2 })}
          </button>
        )}
      </div>
    </div>
  );
};

const EvidencePanel = ({ citations = [], rawSources = [] }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!citations.length && !rawSources.length) {
    return null;
  }

  const visibleCitations = citations.slice(0, isExpanded ? 3 : 1);
  const visibleRawSources = rawSources.slice(0, isExpanded ? 3 : 1);
  const total = citations.length || rawSources.length;

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-museum-jade/25 bg-museum-jade/10 text-xs text-museum-ivory">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-museum-jade/15"
      >
        <span className="flex min-w-0 items-center gap-2 font-semibold text-museum-jade-light">
          <FileSearch className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {t("chatbot.rawDocuments")} {total ? `(${total})` : ""}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-museum-jade-light transition-transform",
            isExpanded && "rotate-180",
          )}
        />
      </button>
      <div className="space-y-2">
        {visibleCitations.map((citation, index) => (
          <div
            key={`${citation.sourceId || citation.title || "citation"}-${index}`}
            className="mx-3 rounded-md bg-museum-espresso/50 px-2.5 py-2 ring-1 ring-museum-jade/20 last:mb-3"
          >
            <p className="font-semibold text-museum-ivory">
              {citation.title || citation.sourceTitle || t("chatbot.citationSource")}
            </p>
            {(citation.page || citation.pageNumber) && (
              <p className="mt-0.5 text-museum-muted">
                {t("chatbot.page", { page: citation.page || citation.pageNumber })}
              </p>
            )}
            {citation.snippet && (
              <p className={cn("mt-1 text-museum-parchment/80", !isExpanded && "line-clamp-2")}>
                {citation.snippet}
              </p>
            )}
          </div>
        ))}

        {visibleRawSources.map((source, index) => (
          <div
            key={`${source.sourceId || source.id || source.title || "raw"}-${index}`}
            className="mx-3 rounded-md bg-museum-espresso/50 px-2.5 py-2 ring-1 ring-museum-jade/20 last:mb-3"
          >
            <p className="font-semibold text-museum-ivory">
              {source.title || source.fileName || t("chatbot.rawSource")}
            </p>
            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 block truncate text-museum-gold-light underline-offset-2 hover:underline"
              >
                {source.url}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const FollowUpActions = ({ message, onAction }) => {
  const { t } = useTranslation();
  return (
  <div className="mt-3 flex flex-wrap gap-2">
    {ACTION_TEMPLATES.map((action) => (
      <button
        key={action.id}
        type="button"
        onClick={() => onAction(action, message)}
        className="inline-flex items-center gap-1.5 rounded-full border border-museum-gold/20 bg-museum-espresso/60 px-2.5 py-1.5 text-xs font-medium text-museum-parchment shadow-sm transition hover:border-museum-gold/40 hover:bg-museum-gold/10 hover:text-museum-gold-light"
      >
        <action.icon className="h-3.5 w-3.5" />
        {t(action.labelKey)}
      </button>
    ))}
  </div>
  );
};

const MessageBubble = ({ message, onAction }) => {
  const isUser = message.sender === "user";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "flex max-w-[92%] items-start gap-2 sm:max-w-[86%] min-w-0",
          isUser && "flex-row-reverse",
        )}
      >
        <div
          className={cn(
            "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            isUser
              ? "bg-museum-gold text-museum-black"
              : "bg-museum-seal text-museum-ivory shadow-sm",
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        <div
          className={cn(
            "message-bubble rounded-2xl px-3.5 py-3 text-sm shadow-sm min-w-0 flex-1",
            isUser
              ? "rounded-tr-md bg-museum-gold text-museum-black"
              : "rounded-tl-md border border-museum-gold/20 bg-museum-black/70 text-museum-ivory",
          )}
        >
          <MarkdownContent content={message.content} isUser={isUser} />

          {!isUser && (
            <>
              {!message.isWelcome && (
                <SourcePanel sources={message.sources} mode={message.mode} />
              )}
              {!message.isWelcome && (
                <EvidencePanel
                  citations={message.citations}
                  rawSources={message.rawSources}
                />
              )}
              {!message.isWelcome && message.mode !== "error" && (
                <FollowUpActions message={message} onAction={onAction} />
              )}
            </>
          )}

          <p
            className={cn(
              "mt-2 text-[11px]",
              isUser ? "text-museum-black/62" : "text-museum-muted",
            )}
          >
            {message.timestamp}
          </p>
        </div>
      </div>
    </div>
  );
};

const WelcomePrompts = ({ onPick }) => {
  const { t } = useTranslation();
  return (
  <div className="rounded-xl border border-museum-gold/15 bg-museum-espresso/40 p-3 shadow-sm">
    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-museum-gold-light">
      <Sparkles className="h-3.5 w-3.5 text-museum-gold" />
      {t("chatbot.startSuggestions")}
    </div>
    <div className="flex flex-wrap gap-2">
      {SAMPLE_QUESTION_KEYS.map((questionKey) => {
        const question = t(questionKey);
        return (
          <button
            key={questionKey}
            type="button"
            onClick={() => onPick(question)}
            className="rounded-full border border-museum-gold/20 bg-museum-espresso/60 px-3 py-2 text-left text-xs text-museum-parchment transition hover:border-museum-gold/40 hover:bg-museum-gold/10 hover:text-museum-gold-light"
          >
            {question}
          </button>
        );
      })}
    </div>
  </div>
  );
};

const TypingIndicator = () => {
  const { t } = useTranslation();
  return (
  <div className="flex justify-start">
    <div className="flex items-start gap-2">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-museum-seal text-museum-ivory">
        <Bot className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-tl-md border border-museum-gold/20 bg-museum-black/70 px-3.5 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-museum-parchment">
          <Loader2 className="h-4 w-4 animate-spin text-museum-gold-light" />
          {t("chatbot.searching")}
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-museum-gold" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-museum-gold [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-museum-gold [animation-delay:300ms]" />
          </span>
        </div>
      </div>
    </div>
  </div>
  );
};

const ChatInput = ({
  value,
  disabled,
  inputRef,
  onChange,
  onSubmit,
  onKeyDown,
}) => {
  const { t } = useTranslation();
  return (
  <div className="border-t border-museum-gold/15 bg-museum-black/60 p-3 text-museum-ivory">
    <div className="flex items-end gap-2 rounded-xl border border-museum-gold/20 bg-museum-charcoal/60 p-2 shadow-inner transition focus-within:border-museum-gold focus-within:ring-2 focus-within:ring-museum-gold/15">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={t("chatbot.inputPlaceholder")}
        rows={1}
        disabled={disabled}
        className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 text-sm leading-5 text-museum-ivory outline-none placeholder:text-museum-muted disabled:cursor-not-allowed disabled:opacity-60"
      />
      <Button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        size="icon"
        className="h-10 w-10 shrink-0 rounded-lg bg-museum-gold text-museum-black hover:bg-museum-gold-light focus-visible:outline-museum-gold-light"
        aria-label={t("chatbot.send")}
      >
        {disabled ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
    <p className="mt-2 text-center text-[10px] leading-4 text-museum-muted">
      {t("chatbot.disclaimer")}
    </p>
  </div>
  );
};

const GlobalChatbot = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [queryRAG] = useQueryRAGMutation();

  const welcomeMessage = useMemo(
    () => ({
      id: "welcome",
      sender: "ai",
      content: t("chatbot.welcomeLong"),
      timestamp: getTime(),
      sources: [],
      mode: "ready",
      isWelcome: true,
    }),
    [t],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 280);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, welcomeMessage]);

  const sendQuestion = async (question, options = {}) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) {
      toast.error(t("chatbot.enterMessage"));
      return;
    }

    const userMessage = {
      id: `${Date.now()}-user`,
      sender: "user",
      content: options.displayText || cleanQuestion,
      timestamp: getTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsSending(true);

    try {
      const response = await queryRAG({
        question: cleanQuestion,
        topK: 5,
        collectionName: "heritage_documents",
      }).unwrap();

      const normalized = normalizeResponse(response, t("chatbot.cannotAnswer"));
      const aiMessage = {
        id: `${Date.now()}-ai`,
        sender: "ai",
        content: normalized.answer,
        timestamp: getTime(),
        mode: normalized.mode,
        sources: normalized.sources,
        wikiLinks: normalized.wikiLinks,
        citations: normalized.citations,
        rawSources: normalized.rawSources,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast.error(t("chatbot.errorResponse"));
      console.error("RAG API Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          sender: "ai",
          content: t("chatbot.errorMessage"),
          timestamp: getTime(),
          sources: [],
          mode: "error",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = () => sendQuestion(inputText);

  const handleFollowUpAction = (action, message) => {
    sendQuestion(t(action.promptKey, { content: message.content }), {
      displayText: t(action.labelKey),
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChatbot = () => {
    setIsOpen((prev) => !prev);
    setIsMinimized(false);
  };

  const hiddenRoutes = [
    "/chat/heritage/",
    "/admin",
    "/login",
    "/register",
    "/explore",
    "/historical-map",
    "/passport/track",
  ];
  if (hiddenRoutes.some((p) => location.pathname.startsWith(p))) {
    return null;
  }

  return (
    <>
      {!isOpen && (
        <ChatbotLauncher onClick={toggleChatbot} />
      )}

      {isOpen && (
        <section
          className={cn(
            "fixed bottom-3 right-3 z-50 overflow-hidden rounded-2xl border border-museum-gold/25 bg-museum-black/98 shadow-[0_12px_56px_rgba(0,0,0,0.55),0_0_0_1px_rgba(216,162,74,0.12)] transition-all duration-300 sm:bottom-4 sm:right-4",
            isMinimized
              ? "h-[56px] w-[min(calc(100vw-2rem),320px)]"
              : "h-[min(580px,calc(100vh-2rem))] w-[min(calc(100vw-2rem),360px)]",
          )}
        >
          <div className="flex h-full flex-col">
            <ChatHeader
              isMinimized={isMinimized}
              onMinimize={() => setIsMinimized((prev) => !prev)}
              onClose={toggleChatbot}
            />

            {!isMinimized && (
              <>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <div className="flex-1 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-museum-gold/25 hover:[&::-webkit-scrollbar-thumb]:bg-museum-gold/40 bg-museum-black px-3 py-4 sm:px-4">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onAction={handleFollowUpAction}
                    />
                  ))}

                  {messages.length === 1 && (
                    <WelcomePrompts onPick={(question) => setInputText(question)} />
                  )}

                  {isSending && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>

                <ChatInput
                  value={inputText}
                  disabled={isSending}
                  inputRef={inputRef}
                  onChange={setInputText}
                  onSubmit={handleSendMessage}
                  onKeyDown={handleKeyDown}
                />
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </>
  );
};

export default GlobalChatbot;
