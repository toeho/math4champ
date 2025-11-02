import { useState, useRef, useEffect } from "react";
import { Image } from "lucide-react";
import { sendToGemini } from "../utils/api";
import { useLanguage } from "../hooks/useLanguage";
import { useHistoryStore } from "../hooks/useHistory";
import { useUser } from "../contexts/UserContext";

export default function ChatSection({ setIsChatExpanded, isChatExpanded, loading, setLoading, loadMessages }) {
  const { lang } = useLanguage();
  const { addConversation } = useHistoryStore();
  const { user } = useUser();

  const [messages, setMessages] = useState(
    loadMessages || [
      { text: lang === "hi" ? "नमस्ते! मैं आपके गणित के सवालों की मदद कर सकता हूँ।" : "Hello! I can help with your math questions.", sender: "bot" }
    ]
  );
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);

  // ⏱️ Timer state
  const [timeTaken, setTimeTaken] = useState(0);
  const timerRef = useRef(null);

  // Scroll effect
  const messagesEndRef = useRef(null);
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  // ⏱️ Start timer as soon as chat loads
  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeTaken((prev) => prev + 1);
    }, 1000);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setTimeTaken(0);
    startTimer();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage({ data: reader.result, mime: file.type });
      setMessages((prev) => [...prev, { image: reader.result, sender: "user" }]);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if ((!input.trim() && !image) || loading) return;
    if (!user?.username) {
      console.error("User not logged in");
      return;
    }

    const userMessage = input.trim();
    const userEntries = [];
    if (userMessage) userEntries.push({ text: userMessage, sender: "user" });
    setMessages((prev) => [...prev, ...userEntries]);
    setInput("");

    try {
      setLoading(true);

      // ✅ include timeTaken in payload
      const response = await sendToGemini(
        { text: userMessage || null, image: image || null, time_taken: timeTaken },
        user.username
      );

      const reply =
        response.candidates?.[0]?.content?.parts?.[0]?.text ||
        (lang === "hi" ? "कोई उत्तर नहीं मिला।" : "No response received.");

      setMessages((prev) => [...prev, { text: reply, sender: "bot" }]);
      addConversation([...messages, ...userEntries, { text: reply, sender: "bot" }]);

      resetTimer(); // ⏱️ reset timer after successful send
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { text: lang === "hi" ? "त्रुटि हुई।" : "An error occurred.", sender: "bot" },
      ]);
    } finally {
      setLoading(false);
      setImage(null);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <div className="bg-white/10 rounded-xl p-4 mt-2 shadow text-white flex flex-col flex-1 min-h-0">
      <h2 className="text-base font-semibold mb-3">{lang === "hi" ? "गणित शिक्षक" : "Math Teacher"}</h2>

      {/* Optional: Show live timer */}
      <p className="text-xs text-white/70 mb-2">⏱️ {timeTaken}s since last message</p>

      <div className="flex-1 overflow-y-auto space-y-3 text-sm pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`w-fit max-w-[80%] ${msg.sender === "user" ? "ml-auto text-right" : "text-left"}`}>
            {msg.image ? <img src={msg.image} alt="uploaded" className="max-w-[300px] rounded-lg" /> : <div className={`rounded-xl px-3 py-2 break-words ${msg.sender === "user" ? "bg-green-500 ml-auto" : "bg-white/20"}`}>{msg.text}</div>}
          </div>
        ))}
        {loading && <div className="w-full bg-white/20 rounded-full h-2 mt-2"><div className="bg-green-500 h-2 rounded-full animate-pulse w-2/3"></div></div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center mt-3 bg-white/20 rounded-xl px-3 py-2 shrink-0 space-x-2">
        <label className="p-1 hover:bg-white/30 rounded-lg cursor-pointer"><Image className="text-white" size={22} /><input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} /></label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={lang === "hi" ? "अपना सवाल पूछें..." : "Ask your question..."}
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/70"
          onFocus={() => setIsChatExpanded(true)}
        />
        <button onClick={handleSend} disabled={loading} className="ml-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg text-sm font-semibold">&gt;</button>
      </div>
    </div>
  );
}
