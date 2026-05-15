import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "~/components/common/ui/Button";
import { Input } from "~/components/common/ui/Input";
import {
  Loader2,
  MessageCircle,
  Send,
  X,
  Minimize2,
  Bot,
  User,
} from "lucide-react";
import { toast } from "react-toastify";
import { useQueryRAGMutation } from "~/store/apis/chatSlice";
import { cn } from "~/lib/utils";

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

  useEffect(() => {
    if (isHeritageDetailPage) {
      setIsOpen(false);
    }
  }, [isHeritageDetailPage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  const sampleQuestions = [
    "What are UNESCO World Heritage Sites in Vietnam?",
    "Tell me about Ha Long Bay",
    "How many provinces are there in Vietnam?",
    "What is special about Hoi An Ancient Town?",
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initMessage = {
        id: Date.now(),
        sender: "ai",
        content:
          "Hello! I'm your Heritage Assistant. How can I help you learn about Vietnamese Heritage today? Feel free to ask me anything!",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([initMessage]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter a message!");
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "user",
      content: inputText,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const question = inputText;
    setInputText("");
    setIsSending(true);

    try {
      const response = await queryRAG({
        question: question,
        topK: 5,
        collectionName: "heritage_documents",
      }).unwrap();

      const answer =
        response?.data?.answer ||
        "Sorry, I cannot answer this question at the moment.";
      const mode = response?.data?.mode || "general";
      const sources = response?.data?.sources || [];

      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        content: answer,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        mode: mode,
        sources: sources,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast.error("Error receiving AI response!");
      console.error("RAG API Error:", error);

      const errorMessage = {
        id: Date.now() + 1,
        sender: "ai",
        content: "Sorry, an error occurred. Please try again later.",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (isHeritageDetailPage) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={toggleChatbot}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-heritage text-white shadow-lg hover:bg-heritage-dark hover:scale-110 z-50 transition-all"
          aria-label="Open Heritage Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-6 right-6 bg-card rounded-xl shadow-2xl z-50 border border-border transition-all duration-300",
            isMinimized ? "w-[340px] h-[60px]" : "w-[380px] h-[580px]",
          )}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-heritage to-heritage-dark text-white rounded-t-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <Bot className="w-5 h-5" />
              <h3 className="text-sm font-semibold">Heritage Assistant</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={toggleMinimize}
                aria-label={isMinimized ? "Expand" : "Minimize"}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={toggleChatbot}
                aria-label="Close chatbot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[420px] bg-muted/30">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start",
                    )}
                  >
                    <div className="flex items-start gap-2 max-w-[80%]">
                      {message.sender === "ai" && (
                        <div className="w-7 h-7 rounded-full bg-heritage flex items-center justify-center shrink-0 mt-1">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "p-3 rounded-xl text-sm shadow-sm",
                          message.sender === "user"
                            ? "bg-heritage text-white rounded-br-none"
                            : "bg-card text-card-foreground border border-border rounded-bl-none",
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words leading-relaxed">
                          {message.content}
                        </p>
                        {message.sources?.length > 0 && (
                          <div className="mt-2 border-t border-border pt-2">
                            <p className="mb-1 text-xs font-medium text-muted-foreground">
                              Sources
                            </p>
                            <div className="space-y-1">
                              {message.sources.slice(0, 3).map((source) => (
                                <div
                                  key={source.slug || source.title}
                                  className="rounded-md bg-muted/60 px-2 py-1 text-xs text-muted-foreground"
                                >
                                  <span className="font-medium text-foreground">
                                    {source.title}
                                  </span>
                                  {source.slug && (
                                    <span className="block truncate">
                                      {source.slug}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <p
                          className={cn(
                            "text-xs mt-1.5",
                            message.sender === "user"
                              ? "text-white/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {message.timestamp}
                        </p>
                      </div>
                      {message.sender === "user" && (
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                          <User className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Sample Questions */}
                {messages.length === 1 && (
                  <div className="mt-4 space-y-2 px-1">
                    <p className="text-xs text-muted-foreground font-medium">
                      Try asking:
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {sampleQuestions.map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInputText(question)}
                          className="w-full text-left px-3 py-2 text-xs bg-card border border-border rounded-lg hover:border-heritage hover:bg-heritage-light/20 transition-colors text-muted-foreground hover:text-foreground"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Typing Indicator */}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2 max-w-[80%]">
                      <div className="w-7 h-7 rounded-full bg-heritage flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="p-3 rounded-xl bg-card border border-border shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Thinking
                          </span>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-heritage rounded-full animate-bounce" />
                            <div
                              className="w-2 h-2 bg-heritage rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                            <div
                              className="w-2 h-2 bg-heritage rounded-full animate-bounce"
                              style={{ animationDelay: "0.4s" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex items-center p-3 border-t border-border bg-card rounded-b-xl gap-2">
                <Input
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 text-sm"
                  disabled={isSending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending}
                  size="icon"
                  className="bg-heritage hover:bg-heritage-dark shrink-0"
                  aria-label="Send message"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default GlobalChatbot;
