import { useState, useEffect, useRef } from "react";
import { Button } from "~/components/common/ui/Button";
import { Input } from "~/components/common/ui/Input";
import { Loader2, Paperclip, Send } from "lucide-react";
import { toast } from "react-toastify";
import {
  useQueryRAGMutation,
  useUploadDocumentMutation,
} from "~/store/apis/chatSlice";
import { TypingIndicator } from "~/pages/ChatHeritagePage/TypingIndicator";

const HeritageChat = ({ heritageId, heritageName, landmarkData }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Use RAG API instead of old Gemini API
  const [queryRAG] = useQueryRAGMutation();
  const [uploadDocument] = useUploadDocumentMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const initMessage = {
      id: Date.now(),
      sender: "ai",
      content: `Hello! I can help you learn about ${heritageName}. Ask me anything!`,
      timestamp: new Date().toLocaleTimeString("vi-VN"),
    };
    setMessages([initMessage]);
  }, [heritageName]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter a message!");
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "user",
      content: inputText,
      timestamp: new Date().toLocaleTimeString("vi-VN"),
    };

    setMessages((prev) => [...prev, userMessage]);
    const question = inputText;
    setInputText("");
    setIsSending(true);

    try {
      // Build context-aware question for RAG
      const contextualQuestion = `${question}`;
      console.log("heritageData in chat:", heritageId);
      // Query RAG system
      const response = await queryRAG({
        question: contextualQuestion,
        heritageId: heritageId,
        topK: 5,
        collectionName: "heritage_documents",
      }).unwrap();

      // Extract answer from RAG response
      const answer =
        response?.data?.answer || "Sorry, I cannot answer this question.";
      const mode = response?.data?.mode || "general";
      const sources = response?.data?.sources || [];

      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        content: answer,
        timestamp: new Date().toLocaleTimeString("vi-VN"),
        mode: mode,
        sources: sources,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast.error("Error receiving AI response!");
      console.error("RAG API Error:", error);

      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        sender: "ai",
        content: "Sorry, an error occurred. Please try again later.",
        timestamp: new Date().toLocaleTimeString("vi-VN"),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    const maxSize = 10 * 1024 * 1024;
    for (const file of files) {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} exceeds 10MB!`);
        continue;
      }

      setIsUploading(true);
      try {
        const result = await uploadDocument(file).unwrap();
        const fileMessage = {
          id: Date.now(),
          sender: "user",
          file: {
            name: file.name,
            url: result.file_id
              ? `/files/${result.file_id}`
              : URL.createObjectURL(file),
            type: file.type,
          },
          timestamp: new Date().toLocaleTimeString("vi-VN"),
        };

        setMessages((prev) => [...prev, fileMessage]);
        toast.success(`Uploaded ${file.name}!`);

        const aiMessage = {
          id: Date.now() + 1,
          sender: "ai",
          content: `Received file ${file.name}. You can ask me about the content of this file!`,
          timestamp: new Date().toLocaleTimeString("vi-VN"),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}!`);
        console.error("Upload Error:", error);
      } finally {
        setIsUploading(false);
      }
    }

    fileInputRef.current.value = "";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[400px] w-[300px] bg-white rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-2 rounded-lg text-sm ${
                  message.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {message.content && <p>{message.content}</p>}
                {message.file && (
                  <div>
                    {message.file.type.startsWith("image/") ? (
                      <img
                        src={message.file.url}
                        alt={message.file.name}
                        className="max-w-[150px] rounded"
                      />
                    ) : (
                      <a
                        href={message.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {message.file.name}
                      </a>
                    )}
                  </div>
                )}
                <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
              </div>
            </div>
          ))
        )}
        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-gray-200 text-black">
              <div className="flex items-center gap-2">
                <span className="text-sm">AI is processing your question</span>
                <div className="flex gap-1">
                  <div className="typing-dot"></div>
                  <div
                    className="typing-dot"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="typing-dot"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center p-3 border-t border-gray-200 gap-2">
        <Button
          className="p-1"
          onClick={() => fileInputRef.current.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
        />
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Your question..."
          className="flex-1 text-sm"
          disabled={isSending}
        />
        <Button
          onClick={handleSendMessage}
          disabled={isUploading || isSending}
          className="p-1"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default HeritageChat;
