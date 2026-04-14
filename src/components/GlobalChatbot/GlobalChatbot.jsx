import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "~/components/common/ui/Button";
import { Input } from "~/components/common/ui/Input";
import { Loader2, MessageCircle, Send, X, Minimize2 } from "lucide-react";
import { toast } from "react-toastify";
import { useQueryRAGMutation } from "~/store/apis/chatSlice";

const GlobalChatbot = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const [queryRAG] = useQueryRAGMutation();

  // Check if current page is heritage detail page
  const isHeritageDetailPage =
    location.pathname.startsWith("/heritage/") &&
    !location.pathname.includes("/chat/heritage/");

  // Auto close chatbot when navigating to heritage detail
  useEffect(() => {
    if (isHeritageDetailPage) {
      setIsOpen(false);
    }
  }, [isHeritageDetailPage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sample questions
  const sampleQuestions = [
    "What are UNESCO World Heritage Sites in Vietnam?",
    "Tell me about Ha Long Bay",
    "How many provinces are there in Vietnam?",
    "What is special about Hoi An Ancient Town?",
  ];

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initMessage = {
        id: Date.now(),
        sender: "ai",
        content:
          "Hello! How can I help you learn about Vietnamese Heritage today? Feel free to ask me anything!",
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
      // Query RAG system for general questions
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

  // Don't render on heritage detail pages
  if (isHeritageDetailPage) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={toggleChatbot}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-heritage text-white flex items-center justify-center shadow-lg hover:bg-heritage-dark z-50 transition-transform hover:scale-110"
          aria-label="Open Heritage Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 transition-all duration-300 ${
            isMinimized ? "w-[320px] h-[60px]" : "w-[380px] h-[550px]"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-heritage to-heritage-dark text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="text-sm font-semibold">Heritage Assistant</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-1 text-white hover:bg-white/20"
                onClick={toggleMinimize}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 text-white hover:bg-white/20"
                onClick={toggleChatbot}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[400px] bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-lg text-sm shadow-sm ${
                        message.sender === "user"
                          ? "bg-heritage text-white rounded-br-none"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                      }`}
                    >
                      {message.content && (
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      )}

                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Sample Questions - Show only when no messages */}
                {messages.length === 1 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-gray-500 px-1">Try asking:</p>
                    {sampleQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInputText(question)}
                        className="w-full text-left px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg hover:border-heritage hover:bg-heritage-light/20 transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}

                {/* Typing Indicator */}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="max-w-[75%] p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Thinking</span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-heritage rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-heritage rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-heritage rounded-full animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex items-center p-3 border-t border-gray-200 bg-white rounded-b-lg gap-2">
                <Input
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
                  className="p-2 bg-heritage hover:bg-heritage-dark"
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
