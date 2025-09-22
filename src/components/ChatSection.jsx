// src/components/ChatSection.jsx
import { useState, useRef, useEffect } from "react";
import { Image } from "lucide-react";
import { sendToGemini } from "../utils/api";
import { useLanguage } from "./LanguageContext";
import { useHistoryStore } from "./HistoryContext";

export default function ChatSection({
  setIsChatExpanded,
  isChatExpanded,
  loading,
  setLoading,
  loadMessages, // 👈 preload messages from history
}) {
  const { lang } = useLanguage();
  const { addConversation } = useHistoryStore();

  const [messages, setMessages] = useState(
    loadMessages || [
      {
        text:
          lang === "hi"
            ? "नमस्ते! मैं आपके गणित के सवालों की मदद कर सकता हूँ।"
            : "Hello! I can help with your math questions.",
        sender: "bot",
      },
    ]
  );
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);

  // Auto-scroll
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset on language change (if not loading history)
  useEffect(() => {
    if (!loadMessages) {
      setMessages([
        {
          text:
            lang === "hi"
              ? "नमस्ते! मैं आपके गणित के सवालों की मदद कर सकता हूँ।"
              : "Hello! I can help with your math questions.",
          sender: "bot",
        },
      ]);
    }
  }, [lang]);

  // File upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage({ data: reader.result, mime: file.type });
      setMessages((prev) => [
        ...prev,
        { image: reader.result, sender: "user" },
      ]);
    };
    reader.readAsDataURL(file);
  };

  // Send message
  const handleSend = async () => {
    if ((!input.trim() && !image) || loading) return;

    const userMessage = input.trim();

    // Add user message
    if (userMessage) {
      setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    }

    // Reset input
    setInput("");

    try {
      setLoading(true);

      // Send to Gemini
      const response = await sendToGemini(image || userMessage, !!image);
      const reply =
        response.candidates?.[0]?.content?.parts?.[0]?.text ||
        (lang === "hi" ? "कोई उत्तर नहीं मिला।" : "No response received.");

      const newMessages = [
        ...messages,
        userMessage ? { text: userMessage, sender: "user" } : null,
        image ? { image: image.data, sender: "user" } : null,
        { text: reply, sender: "bot" },
      ].filter(Boolean);

      setMessages(newMessages);

      // Save to history after bot reply
      addConversation(newMessages);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: lang === "hi" ? "त्रुटि हुई।" : "An error occurred.",
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
      setImage(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white/10 rounded-xl p-4 mt-2 shadow text-white flex flex-col flex-1 min-h-0">
      <h2 className="text-base font-semibold mb-3 shrink-0">
        {lang === "hi" ? "गणित शिक्षक" : "Math Teacher"}
      </h2>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 text-sm pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`w-fit max-w-[80%] ${
              msg.sender === "user" ? "ml-auto text-right" : "text-left"
            }`}
          >
            {msg.image ? (
              <img
                src={msg.image}
                alt="uploaded"
                className="max-w-[300px] rounded-lg"
              />
            ) : (
              <div
                className={`rounded-xl px-3 py-2 break-words ${
                  msg.sender === "user" ? "bg-green-500 ml-auto" : "bg-white/20"
                }`}
              >
                {msg.text}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="w-full bg-white/20 rounded-full h-2 mt-2">
            <div className="bg-green-500 h-2 rounded-full animate-pulse w-2/3"></div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex items-center mt-3 bg-white/20 rounded-xl px-3 py-2 shrink-0 space-x-2">
        {/* Image upload */}
        <label className="p-1 hover:bg-white/30 rounded-lg cursor-pointer">
          <Image className="text-white" size={22} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>

        {/* Text input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            lang === "hi" ? "अपना सवाल पूछें..." : "Ask your question..."
          }
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/70"
          onFocus={() => setIsChatExpanded(true)}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={loading}
          className="ml-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg text-sm font-semibold"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
