import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Send, Sparkles } from "lucide-react";
import { BASE_URL } from "~/constants/fe.constant";
import PersonaAvatar from "./PersonaAvatar";

/**
 * PersonaChat (A3) — trò chuyện nhập vai với một nhân vật lịch sử.
 * Stream câu trả lời (SSE) từ BE: POST /graph/persona/:id/chat.
 * Dùng fetch + ReadableStream để hiển thị từng cụm chữ (D1 — streaming UX).
 */
const SUGGESTION_KEYS = ["map.persona.q1", "map.persona.q2", "map.persona.q3"];

export default function PersonaChat({ persona, onClose }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]); // {role, text}
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [mode, setMode] = useState(null); // 'llm' | 'offline'
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function ask(question) {
    const q = (question ?? input).trim();
    if (!q || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }, { role: "persona", text: "" }]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch(`${BASE_URL}/graph/persona/${persona.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
        signal: controller.signal,
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          try {
            const obj = JSON.parse(line.slice(5).trim());
            if (obj.delta) {
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = {
                  role: "persona",
                  text: copy[copy.length - 1].text + obj.delta,
                };
                return copy;
              });
            }
            if (obj.done) setMode(obj.mode);
          } catch {
            /* ignore */
          }
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "persona", text: t("map.persona.errorReply") };
          return copy;
        });
      }
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-museum-gold/25 bg-museum-black shadow-museum-card sm:h-[600px] sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-museum-gold/15 bg-gradient-to-b from-museum-gold/12 to-transparent p-4">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-museum-gold/25">
            <PersonaAvatar id={persona.id} name={persona.name} className="h-full w-full" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-lg font-bold text-museum-ivory">
              {persona.name}
            </h3>
            <p className="flex items-center gap-1.5 text-[11px] text-museum-muted">
              <Sparkles className="h-3 w-3 text-museum-gold-light" />
              {t("map.persona.roleplay")} {mode === "offline" ? t("map.persona.modeGrounded") : mode === "llm" ? t("map.persona.modeLlm") : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-museum-muted transition-colors hover:bg-museum-gold/10 hover:text-museum-parchment"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-museum-gold/15 bg-museum-black/50 p-4 text-sm leading-relaxed text-museum-parchment">
              <p className="mb-2 text-museum-gold-light">{t("map.persona.greeting", { name: persona.name })}</p>
              <p className="text-museum-muted">{persona.summary}</p>
              <p className="mt-2 text-xs text-museum-muted">{t("map.persona.greetingHint")}</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-museum-gold/20 text-museum-ivory"
                    : "border border-museum-gold/15 bg-museum-black/55 text-museum-parchment"
                }`}
              >
                {m.text || <span className="inline-block animate-pulse text-museum-gold-light">▍</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 pb-2">
            {SUGGESTION_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => ask(t(k))}
                className="rounded-full border border-museum-gold/20 bg-museum-black/40 px-2.5 py-1 text-[11px] text-museum-parchment transition-colors hover:border-museum-gold/45"
              >
                {t(k)}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask();
          }}
          className="flex items-center gap-2 border-t border-museum-gold/15 p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("map.persona.inputPlaceholder", { name: persona.name })}
            disabled={streaming}
            className="flex-1 rounded-full border border-museum-gold/25 bg-museum-black/50 px-4 py-2.5 text-sm text-museum-ivory placeholder:text-museum-muted focus:border-museum-gold/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-museum-gold/20 text-museum-gold-light transition-colors hover:bg-museum-gold/30 disabled:opacity-40"
            aria-label={t("chat.send")}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
