import { useState, useRef, useEffect } from "react";
import { Image } from "lucide-react";
import { sendToGemini } from "../utils/api";
import { useLanguage } from "../hooks/useLanguage";
import { useHistoryStore } from "../hooks/useHistory";
import { useUser } from "../contexts/UserContext"; // ✅ import user context

export default function ChatSection({ setIsChatExpanded, isChatExpanded, loading, setLoading, loadMessages }) {
  const { lang } = useLanguage();
  const { addConversation } = useHistoryStore();
  const { user } = useUser(); // ✅ get current logged-in user

  const [messages, setMessages] = useState(
    loadMessages || [
      { text: lang === "hi" ? "नमस्ते! मैं आपके गणित के सवालों की मदद कर सकता हूँ।" : "Hello! I can help with your math questions.", sender: "bot" }
    ]
  );
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);

  const messagesEndRef = useRef(null);
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  useEffect(() => {
    if (!loadMessages) {
      // setMessages([{ text: lang === "hi" ? "नमस्ते! मैं आपके गणित के सवालों की मदद कर सकता हूँ।" : "Hello! I can help with your math questions.", sender: "bot" }]);
      setMessages([
      {
        text:
          lang === "hi"
            ? "मैं आपकी मदद के लिए तैयार हूँ! आप ऐसे सवाल पूछ सकते हैं:\n• समीकरण हल करें\n• स्टेप्स समझाएँ\n• सवाल की फोटो अपलोड करें\n• कोई भी गणित का कॉन्सेप्ट समझें"
            : "I'm ready to help! You can ask things like:\n• Solve equations\n• Show steps\n• Upload a picture of a problem\n• Explain any math concept",
        sender: "bot"
      }
    ]);
    } else {
      setMessages(loadMessages);
    }
  }, [lang, loadMessages]);

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

    // show user message immediately
    const userEntries = [];
    if (userMessage) userEntries.push({ text: userMessage, sender: "user" });
    setMessages((prev) => [...prev, ...userEntries]);
    setInput("");

    try {
      setLoading(true);

      // ✅ send username to backend
      const response = await sendToGemini(
        { text: userMessage || null, image: image || null },
        user.username
      );

      const reply =
        response.candidates?.[0]?.content?.parts?.[0]?.text ||
        (lang === "hi" ? "कोई उत्तर नहीं मिला।" : "No response received.");

      setMessages((prev) => [...prev, { text: reply, sender: "bot" }]);
      addConversation([...messages, ...userEntries, { text: reply, sender: "bot" }]);
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
