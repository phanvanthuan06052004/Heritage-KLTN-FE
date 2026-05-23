import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "~/components/common/ui/Button";
import {
  BookOpen,
  Bot,
  ChevronDown,
  FileSearch,
  Layers,
  Loader2,
  MessageCircle,
  Minimize2,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useQueryRAGMutation } from "~/store/apis/chatSlice";
import { cn } from "~/lib/utils";

const sampleQuestions = [
  "Hoàng thành Thăng Long nằm ở đâu?",
  "Địa đạo Củ Chi có giá trị lịch sử gì?",
  "Quần thể Di tích Cố đô Huế được UNESCO công nhận năm nào?",
  "Bạch Đằng gắn với chiến thắng lịch sử nào?",
];

const actionTemplates = [
  {
    id: "verify",
    label: "Kiểm chứng nguồn",
    icon: FileSearch,
    buildPrompt: (message) =>
      `Hãy kiểm chứng câu trả lời này bằng các nguồn trong kho tri thức. Nêu rõ phần nào chắc chắn, phần nào cần thêm tài liệu:\n\n${message.content}`,
  },
  {
    id: "deeper",
    label: "Đào sâu thêm",
    icon: Layers,
    buildPrompt: (message) =>
      `Hãy giải thích sâu hơn câu trả lời này, vẫn chỉ dựa trên kho tri thức hiện có:\n\n${message.content}`,
  },
  {
    id: "shorter",
    label: "Tóm tắt 3 ý",
    icon: Sparkles,
    buildPrompt: (message) =>
      `Tóm tắt câu trả lời này thành 3 ý chính, ngắn gọn và dễ hiểu:\n\n${message.content}`,
  },
];

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

const normalizeResponse = (response) => {
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
      data.answer || "Sorry, I cannot answer this question at the moment.",
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

const ChatHeader = ({ isMinimized, onMinimize, onClose }) => (
  <div className="flex items-center justify-between border-b border-white/10 bg-[#7b2f14] px-4 py-3 text-white shadow-sm">
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/12 ring-1 ring-white/20">
        <Bot className="h-5 w-5" />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#7b2f14]" />
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold">Heritage Assistant</h3>
        {!isMinimized && (
          <p className="truncate text-xs text-white/72">
            Wiki answers with source-aware follow-ups
          </p>
        )}
      </div>
    </div>
    <div className="flex items-center gap-1">
      <button
        className="rounded-md p-2 text-white/75 transition hover:bg-white/12 hover:text-white"
        onClick={onMinimize}
        aria-label={isMinimized ? "Expand" : "Minimize"}
      >
        <Minimize2 className="h-4 w-4" />
      </button>
      <button
        className="rounded-md p-2 text-white/75 transition hover:bg-white/12 hover:text-white"
        onClick={onClose}
        aria-label="Close chatbot"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const SourcePanel = ({ sources = [], mode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleSources = sources.slice(0, isExpanded ? 6 : 2);
  const modeLabel = getModeLabel(mode);

  if (!sources.length) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span>Chưa có nguồn đủ rõ để hiển thị.</span>
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
            Dựa trên {sources.length} trang wiki
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
                  {source.title || "Untitled source"}
                </p>
                <p className="truncate text-stone-500">
                  {source.slug || source.pageType || "wiki-page"}
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
            {isExpanded ? "Thu gọn nguồn" : `Xem thêm ${sources.length - 2} nguồn`}
          </button>
        )}
      </div>
    </div>
  );
};

const EvidencePanel = ({ citations = [], rawSources = [] }) => {
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
            Tài liệu gốc {total ? `(${total})` : ""}
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
              {citation.title || citation.sourceTitle || "Nguồn tài liệu"}
            </p>
            {(citation.page || citation.pageNumber) && (
              <p className="mt-0.5 text-emerald-700">
                Trang {citation.page || citation.pageNumber}
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
              {source.title || source.fileName || "Raw source"}
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

const FollowUpActions = ({ message, onAction }) => (
  <div className="mt-3 flex flex-wrap gap-2">
    {actionTemplates.map((action) => (
      <button
        key={action.id}
        type="button"
        onClick={() => onAction(action, message)}
        className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-sm transition hover:border-[#a95620]/40 hover:bg-[#fff7ed] hover:text-[#7b2f14]"
      >
        <action.icon className="h-3.5 w-3.5" />
        {action.label}
      </button>
    ))}
  </div>
);

const MessageBubble = ({ message, onAction }) => {
  const isUser = message.sender === "user";

  return (
    <div
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "flex max-w-[92%] items-start gap-2 sm:max-w-[86%]",
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
            "rounded-2xl px-3.5 py-3 text-sm shadow-sm",
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

const WelcomePrompts = ({ onPick }) => (
  <div className="rounded-xl border border-stone-200 bg-white/72 p-3 shadow-sm">
    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-stone-600">
      <Sparkles className="h-3.5 w-3.5 text-[#a95620]" />
      Gợi ý bắt đầu
    </div>
    <div className="flex flex-wrap gap-2">
      {sampleQuestions.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onPick(question)}
          className="rounded-full border border-stone-200 bg-white px-3 py-2 text-left text-xs text-stone-600 transition hover:border-[#a95620]/40 hover:bg-[#fff7ed] hover:text-[#7b2f14]"
        >
          {question}
        </button>
      ))}
    </div>
  </div>
);

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="flex items-start gap-2">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#a95620] text-white">
        <Bot className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-tl-md border border-stone-200 bg-white px-3.5 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <Loader2 className="h-4 w-4 animate-spin text-[#a95620]" />
          Đang tìm trong kho tri thức
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#a95620]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#a95620] [animation-delay:120ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#a95620] [animation-delay:240ms]" />
          </span>
        </div>
      </div>
    </div>
  </div>
);

const ChatInput = ({
  value,
  disabled,
  inputRef,
  onChange,
  onSubmit,
  onKeyDown,
}) => (
  <div className="border-t border-stone-200 bg-white p-3">
    <div className="flex items-end gap-2 rounded-xl border border-stone-200 bg-stone-50 p-2 shadow-inner transition focus-within:border-[#a95620] focus-within:ring-2 focus-within:ring-[#a95620]/15">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Hỏi về di tích lịch sử Việt Nam..."
        rows={1}
        disabled={disabled}
        className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-5 text-stone-900 outline-none placeholder:text-stone-400 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <Button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        size="icon"
        className="h-10 w-10 shrink-0 rounded-lg bg-[#a95620] text-white hover:bg-[#7b2f14]"
        aria-label="Send message"
      >
        {disabled ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  </div>
);

const GlobalChatbot = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [queryRAG] = useQueryRAGMutation();

  const isHeritageDetailPage =
    location.pathname.startsWith("/heritage/") &&
    !location.pathname.includes("/chat/heritage/");

  const welcomeMessage = useMemo(
    () => ({
      id: "welcome",
      sender: "ai",
      content:
        "Xin chào, em là Heritage Assistant. Anh có thể hỏi về di tích lịch sử Việt Nam, em sẽ trả lời kèm nguồn wiki và tài liệu gốc để kiểm chứng.",
      timestamp: getTime(),
      sources: [],
      mode: "ready",
      isWelcome: true,
    }),
    [],
  );

  useEffect(() => {
    if (isHeritageDetailPage) {
      setIsOpen(false);
    }
  }, [isHeritageDetailPage]);

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
      toast.error("Please enter a message!");
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

      const normalized = normalizeResponse(response);
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
      toast.error("Error receiving AI response!");
      console.error("RAG API Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          sender: "ai",
          content:
            "Sorry, an error occurred while searching the heritage knowledge base. Please try again later.",
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
    sendQuestion(action.buildPrompt(message), {
      displayText: action.label,
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

  if (isHeritageDetailPage) {
    return null;
  }

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={toggleChatbot}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#a95620] text-white shadow-[0_18px_45px_rgba(123,47,20,0.32)] ring-1 ring-white/30 transition duration-300 hover:-translate-y-1 hover:bg-[#7b2f14] hover:shadow-[0_24px_60px_rgba(123,47,20,0.42)]"
          aria-label="Open Heritage Assistant"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute right-1.5 top-1.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
        </button>
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
