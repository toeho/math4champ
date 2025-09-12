import { useState, useRef, useEffect } from "react";
import { Image } from "lucide-react"; // for dummy image button
import { sendToGemini } from "../utils/api";
import { useLanguage } from "./LanguageContext";

export default function ChatSection() {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // 🔹 Auto-scroll
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Reset first message when language changes
  useEffect(() => {
    setMessages([
      {
        text:
          lang === "hi"
            ? "नमस्ते! मैं आपके गणित के सवालों की मदद कर सकता हूँ।"
            : "Hello! I can help with your math questions.",
        sender: "bot",
      },
    ]);
  }, [lang]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);

    try {
      const response = await sendToGemini(input);
      const reply =
        response.candidates?.[0]?.content?.parts?.[0]?.text ||
        (lang === "hi" ? "कोई उत्तर नहीं मिला।" : "No response received.");

      setMessages((prev) => [...prev, { text: reply, sender: "bot" }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: lang === "hi" ? "त्रुटि हुई।" : "An error occurred.",
          sender: "bot",
        },
      ]);
    }
    setInput("");
  };

  return (
    <div className="bg-white/10 rounded-xl p-4 mt-2 shadow text-white flex flex-col flex-1 min-h-0">
      {/* Header */}
      <h2 className="text-base font-semibold mb-3 shrink-0">
        {lang === "hi" ? "गणित शिक्षक" : "Math Teacher"}
      </h2>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 text-sm pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-xl px-3 py-2 w-fit break-words max-w-[80%] ${
              msg.sender === "user" ? "bg-green-500 ml-auto" : "bg-white/20"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center mt-3 bg-white/20 rounded-xl px-3 py-2 shrink-0 space-x-2">
        {/* Dummy image upload button */}
        <button
          onClick={() =>
            alert(lang === "hi" ? "छवि अपलोड अभी डमी है।" : "Image upload is dummy for now.")
          }
          className="p-1 hover:bg-white/30 rounded-lg"
        >
          <Image className="text-white" size={22} />
        </button>

        {/* Input field */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={lang === "hi" ? "अपना सवाल पूछें..." : "Ask your question..."}
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/70"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          className="ml-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-semibold"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
