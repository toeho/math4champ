import { useState, useRef, useEffect } from "react";
import { Image } from "lucide-react";
import { sendToGemini } from "../utils/api";
import { useLanguage } from "./LanguageContext";

export default function ChatSection({ setIsChatExpanded }) {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null); // 🔹 store uploaded image

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

  // 🔹 Handle file input
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result); // base64 data URL
      setMessages((prev) => [
        ...prev,
        { text: lang === "hi" ? "📷 छवि चुनी गई" : "📷 Image selected", sender: "user" },
      ]);
    };
    reader.readAsDataURL(file);
  };

  // 🔹 Send text or image
  const handleSend = async () => {
    if (!input.trim() && !image) return;

    // show user message (text or image)
    if (input) {
      setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    }
    if (image) {
      setMessages((prev) => [...prev, { text: "📷", image, sender: "user" }]);
    }

    try {
      const response = await sendToGemini(image || input, !!image);
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

    // reset input + image
    setInput("");
    setImage(null);
  };

  // 🔹 handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
            {msg.image ? (
              <img src={msg.image} alt="uploaded" className="max-w-[150px] rounded-md" />
            ) : (
              msg.text
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center mt-3 bg-white/20 rounded-xl px-3 py-2 shrink-0 space-x-2">
        {/* Image upload */}
        <label className="p-1 hover:bg-white/30 rounded-lg cursor-pointer">
          <Image className="text-white" size={22} />
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>

        {/* Input field */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown} // ✅ send on Enter
          placeholder={lang === "hi" ? "अपना सवाल पूछें..." : "Ask your question..."}
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/70"
          onFocus={() => setIsChatExpanded(true)}
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
