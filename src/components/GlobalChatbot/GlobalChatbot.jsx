import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, useReducedMotion } from "motion/react";
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
      className="fixed bottom-5 right-3 z-50 h-[108px] w-[96px] bg-transparent p-0 text-left outline-none transition focus-visible:ring-4 focus-visible:ring-cyan-300/45 sm:bottom-6 sm:right-6 sm:h-[124px] sm:w-[112px]"
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
        className="pointer-events-none absolute bottom-[82px] right-[76px] z-10 w-[min(232px,calc(100vw-8.5rem))] rounded-2xl bg-white/95 px-4 py-3 text-stone-700 shadow-[0_18px_45px_rgba(15,23,42,0.18)] ring-1 ring-stone-200/70 backdrop-blur"
        aria-hidden="true"
      >
        <span className="mb-2 flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#a95620] text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="truncate text-sm font-semibold text-[#7b2f14]">
            {t("chatbot.title")}
          </span>
        </span>
        <span className="block text-sm leading-5">
          {t("chatbot.tagline")}
        </span>
        <span className="mt-1 block text-xs leading-4 text-stone-500">
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
        className="pointer-events-none absolute bottom-[104px] right-[4px] z-30 rounded-full border border-cyan-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-cyan-950 shadow-[0_12px_28px_rgba(15,23,42,0.18)] sm:bottom-[120px]"
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
          className={cn("font-semibold", isUser ? "text-white" : "text-stone-950")}
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
            isUser ? "text-white" : "text-[#8d3d18]",
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
            isUser ? "bg-white/15 text-white" : "bg-stone-100 text-stone-800",
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
            isUser ? "border-white/40 bg-white/10" : "border-[#a95620]/45 bg-[#fff7ed] text-stone-700",
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
        isUser ? "text-white" : "text-stone-900",
      )}
    >
      {elements}
    </div>
  );
};

const ChatHeader = ({ isMinimized, onMinimize, onClose }) => {
  const { t } = useTranslation();
  return (
  <div className="flex items-center justify-between border-b border-white/10 bg-[#7b2f14] px-4 py-3 text-white shadow-sm">
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/12 ring-1 ring-white/20">
        <Bot className="h-5 w-5" />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#7b2f14]" />
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold">{t("chatbot.title")}</h3>
        {!isMinimized && (
          <p className="truncate text-xs text-white/72">
            {t("chatbot.headerSubtitle")}
          </p>
        )}
      </div>
    </div>
    <div className="flex items-center gap-1">
      <button
        className="rounded-md p-2 text-white/75 transition hover:bg-white/12 hover:text-white"
        onClick={onMinimize}
        aria-label={isMinimized ? t("chatbot.expand") : t("chatbot.minimize")}
      >
        <Minimize2 className="h-4 w-4" />
      </button>
      <button
        className="rounded-md p-2 text-white/75 transition hover:bg-white/12 hover:text-white"
        onClick={onClose}
        aria-label={t("chatbot.close")}
      >
        <X className="h-4 w-4" />
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
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span>{t("chatbot.noSources")}</span>
      </div>
    );
  }

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-stone-200 bg-stone-50/80">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-stone-100"
      >
        <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-stone-700">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
          <span className="truncate">
            {t("chatbot.basedOnWiki", { count: sources.length })}
            {modeLabel ? ` • ${modeLabel}` : ""}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-stone-500 transition-transform",
            isExpanded && "rotate-180",
          )}
        />
      </button>
      <div className="space-y-2 border-t border-stone-200 px-3 py-2">
        {visibleSources.map((source, index) => (
          <div
            key={`${source.slug || source.title}-${index}`}
            className="rounded-md bg-white px-2.5 py-2 text-xs shadow-sm ring-1 ring-stone-200"
          >
            <div className="flex items-start gap-2">
              <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a95620]" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-stone-800">
                  {source.title || t("chatbot.untitledSource")}
                </p>
                <p className="truncate text-stone-500">
                  {source.slug || source.pageType || t("chatbot.wikiPage")}
                </p>
              </div>
              {typeof source.similarity === "number" && (
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
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
            className="text-xs font-medium text-[#9b461c] hover:text-[#703012]"
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
    <div className="mt-3 overflow-hidden rounded-lg border border-emerald-200 bg-emerald-50/70 text-xs text-emerald-900">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-emerald-100/60"
      >
        <span className="flex min-w-0 items-center gap-2 font-semibold">
          <FileSearch className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {t("chatbot.rawDocuments")} {total ? `(${total})` : ""}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-emerald-700 transition-transform",
            isExpanded && "rotate-180",
          )}
        />
      </button>
      <div className="space-y-2">
        {visibleCitations.map((citation, index) => (
          <div
            key={`${citation.sourceId || citation.title || "citation"}-${index}`}
            className="mx-3 rounded-md bg-white/80 px-2.5 py-2 ring-1 ring-emerald-100 last:mb-3"
          >
            <p className="font-semibold text-emerald-950">
              {citation.title || citation.sourceTitle || t("chatbot.citationSource")}
            </p>
            {(citation.page || citation.pageNumber) && (
              <p className="mt-0.5 text-emerald-700">
                {t("chatbot.page", { page: citation.page || citation.pageNumber })}
              </p>
            )}
            {citation.snippet && (
              <p className={cn("mt-1 text-emerald-800", !isExpanded && "line-clamp-2")}>
                {citation.snippet}
              </p>
            )}
          </div>
        ))}

        {visibleRawSources.map((source, index) => (
          <div
            key={`${source.sourceId || source.id || source.title || "raw"}-${index}`}
            className="mx-3 rounded-md bg-white/80 px-2.5 py-2 ring-1 ring-emerald-100 last:mb-3"
          >
            <p className="font-semibold text-emerald-950">
              {source.title || source.fileName || t("chatbot.rawSource")}
            </p>
            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 block truncate text-emerald-700 underline-offset-2 hover:underline"
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
        className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-sm transition hover:border-[#a95620]/40 hover:bg-[#fff7ed] hover:text-[#7b2f14]"
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
              ? "bg-stone-900 text-white"
              : "bg-[#a95620] text-white shadow-sm",
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        <div
          className={cn(
            "message-bubble rounded-2xl px-3.5 py-3 text-sm shadow-sm min-w-0 flex-1",
            isUser
              ? "rounded-tr-md bg-stone-900 text-white"
              : "rounded-tl-md border border-stone-200 bg-white text-stone-900",
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
              isUser ? "text-white/62" : "text-stone-400",
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
  <div className="rounded-xl border border-stone-200 bg-white/72 p-3 shadow-sm">
    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-stone-600">
      <Sparkles className="h-3.5 w-3.5 text-[#a95620]" />
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
            className="rounded-full border border-stone-200 bg-white px-3 py-2 text-left text-xs text-stone-600 transition hover:border-[#a95620]/40 hover:bg-[#fff7ed] hover:text-[#7b2f14]"
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
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#a95620] text-white">
        <Bot className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-tl-md border border-stone-200 bg-white px-3.5 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <Loader2 className="h-4 w-4 animate-spin text-[#a95620]" />
          {t("chatbot.searching")}
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#a95620]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#a95620] [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#a95620] [animation-delay:300ms]" />
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
  <div className="border-t border-stone-200 bg-white p-3">
    <div className="flex items-end gap-2 rounded-xl border border-stone-200 bg-stone-50 p-2 shadow-inner transition focus-within:border-[#a95620] focus-within:ring-2 focus-within:ring-[#a95620]/15">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={t("chatbot.inputPlaceholder")}
        rows={1}
        disabled={disabled}
        className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-5 text-stone-900 outline-none placeholder:text-stone-400 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <Button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        size="icon"
        className="h-10 w-10 shrink-0 rounded-lg bg-[#a95620] text-white hover:bg-[#7b2f14]"
        aria-label={t("chatbot.send")}
      >
        {disabled ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
    <p className="mt-2 text-center text-[10px] leading-4 text-stone-400">
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

  if (location.pathname.includes("/chat/heritage/")) {
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
            "fixed bottom-4 right-4 z-50 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_24px_80px_rgba(28,25,23,0.24)] transition-all duration-300 sm:bottom-6 sm:right-6",
            isMinimized
              ? "h-[64px] w-[min(calc(100vw-2rem),380px)]"
              : "h-[min(720px,calc(100vh-2rem))] w-[min(calc(100vw-2rem),430px)]",
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
                <div className="flex-1 space-y-4 overflow-y-auto bg-[#f8f5ef] px-3 py-4 sm:px-4">
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
              </>
            )}
          </div>
        </section>
      )}
    </>
  );
};

export default GlobalChatbot;
