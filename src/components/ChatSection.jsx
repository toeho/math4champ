import { useState, useRef, useEffect } from "react";
import { Image } from "lucide-react";
import { sendToGemini, setSessionId ,sendCheckRequest} from "../utils/api";
import { useLanguage } from "../hooks/useLanguage";
import { useHistoryStore } from "../hooks/useHistory";
import { useUser } from "../contexts/UserContext";
import SuccessAnimation from "./SuccessAnimation";

export default function ChatSection({
  setIsChatExpanded,
  isChatExpanded,
  loading,
  setLoading,
  loadMessages,
  preloadSessionId = null,
  initialTopic, // 👈 new prop
}) {
  const { lang } = useLanguage();
  const { addConversation } = useHistoryStore();
  const { user } = useUser();

  // Teacher expression logic based on message content
  const getTeacherExpression = (text) => {
    if (!text) return "neutral";
    const lowerText = text.toLowerCase();
    if (lowerText.includes("correct") || lowerText.includes("great") || lowerText.includes("excellent") || lowerText.includes("perfect")) {
      return "celebrating";
    }
    if (lowerText.includes("?") || lowerText.includes("let me") || lowerText.includes("thinking")) {
      return "thinking";
    }
    if (lowerText.includes("good") || lowerText.includes("nice") || lowerText.includes("well done")) {
      return "happy";
    }
    return "neutral";
  };

  // Check if message contains encouragement
  const isEncouragementMessage = (text) => {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return lowerText.includes("great") || lowerText.includes("excellent") || 
           lowerText.includes("good job") || lowerText.includes("well done") ||
           lowerText.includes("keep going") || lowerText.includes("you can do it") ||
           lowerText.includes("nice work") || lowerText.includes("awesome");
  };

  // Teacher avatar component
  const TeacherAvatar = ({ expression }) => {
    const expressions = {
      neutral: "🧑‍🏫",
      thinking: "🤔",
      happy: "😊",
      celebrating: "🎉"
    };
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-xl border-2 border-white shadow-lg animate-bounce-in flex-shrink-0">
        {expressions[expression] || expressions.neutral}
      </div>
    );
  };

  // Student avatar component
  const StudentAvatar = () => {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-xl border-2 border-white shadow-lg flex-shrink-0">
        👤
      </div>
    );
  };

  // Typing indicator component
  const TypingIndicator = () => {
    return (
      <div className="flex gap-2 items-end animate-slide-in-left">
        <TeacherAvatar expression="thinking" />
        <div className="bg-white/20 backdrop-blur rounded-2xl rounded-bl-sm shadow-md px-4 py-3 flex gap-1">
          <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce-dots"></div>
          <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce-dots" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce-dots" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    );
  };

  // Confetti component
  const Confetti = () => {
    const confettiColors = ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-red-400'];
    const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));

    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className={`absolute w-2 h-2 ${piece.color} animate-confetti`}
            style={{
              left: `${piece.left}%`,
              top: '-10px',
              animationDelay: `${piece.delay}s`,
            }}
          />
        ))}
      </div>
    );
  };

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
  const [timeTaken, setTimeTaken] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  // If Home passes a preloadSessionId (from history click), set it so subsequent sends use it
  useEffect(() => {
    if (preloadSessionId) {
      try {
        setSessionId(preloadSessionId);
        console.log("🔁 Restored session id:", preloadSessionId);
      } catch (e) {
        console.warn("Could not set preload session id", e);
      }
    }
  }, [preloadSessionId]);

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

  // 👇 Auto-start chat when user clicks a topic
  useEffect(() => {
    if (initialTopic) {
      const topicMessage = {
        text: lang === "hi"
          ? `${initialTopic} पर बात शुरू करें।`
          : `Let's start learning about ${initialTopic}.`,
        sender: "user",
      };
      handleSend(topicMessage.text);
    }
  }, [initialTopic,lang]);

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
  const handleCheck = async () => {
  const userMessage = input.trim();
  if (!userMessage || loading) return;

  const newUserMsg = { text: userMessage, sender: "user" };
  setMessages((prev) => [...prev, newUserMsg]);
  setInput("");

  try {
    setLoading(true);
    const response = await sendCheckRequest(
      { text: userMessage, image: image || null, time_taken: timeTaken },
      user.username
    );

    const reply = response.bot_message || "No response received.";

    setMessages((prev) => [...prev, { text: reply, sender: "bot" }]);
    addConversation([...messages, newUserMsg, { text: reply, sender: "bot" }]);

    resetTimer();
  } catch (error) {
    console.error(error);
    setMessages((prev) => [
      ...prev,
      { text: "An error occurred while checking.", sender: "bot" },
    ]);
  } finally {
    setLoading(false);
    setImage(null);
  }
};


  const handleSend = async (forcedMessage = null) => {
    const userMessage = forcedMessage || input.trim();
    if ((!userMessage && !image) || loading) return;
    if (!user?.username) {
      console.error("User not logged in");
      return;
    }

    const newUserMsg = { text: userMessage, sender: "user" };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");

    try {
      setLoading(true);
      const response = await sendToGemini(
        { text: userMessage, image: image || null, time_taken: timeTaken },
        user.username
      );

      const reply =
        response.candidates?.[0]?.content?.parts?.[0]?.text ||
        (lang === "hi" ? "कोई उत्तर नहीं मिला।" : "No response received.");

      setMessages((prev) => [...prev, { text: reply, sender: "bot" }]);
      addConversation([...messages, newUserMsg, { text: reply, sender: "bot" }]);

      // Trigger confetti and success animation for correct answers or celebrations
      const lowerReply = reply.toLowerCase();
      if (lowerReply.includes("correct") || lowerReply.includes("excellent") || 
          lowerReply.includes("perfect") || lowerReply.includes("great job") ||
          lowerReply.includes("well done")) {
        setShowConfetti(true);
        setShowSuccessAnimation(true);
        setTimeout(() => {
          setShowConfetti(false);
          setShowSuccessAnimation(false);
        }, 3000);
      }

      resetTimer();
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mt-2 shadow-xl text-white flex flex-col flex-1 min-h-[200px] max-h-[70vh] transition-all duration-300 ease-smooth">
      <h2 className="text-base font-semibold mb-3">
        {lang === "hi" ? "गणित शिक्षक" : "Math Teacher"}
      </h2>

      <p className="text-xs text-white/70 mb-2">⏱️ {timeTaken}s since last message</p>

      <div 
        className="flex-1 overflow-y-auto space-y-3 text-sm pr-1 scroll-smooth" 
        style={{ WebkitOverflowScrolling: 'touch' }}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 items-end ${
              msg.sender === "user" 
                ? "flex-row-reverse animate-slide-in-right" 
                : "flex-row animate-slide-in-left"
            }`}
          >
            {/* Avatar */}
            {msg.sender === "user" ? (
              <StudentAvatar />
            ) : (
              <TeacherAvatar expression={getTeacherExpression(msg.text)} />
            )}
            
            {/* Message Content */}
            <div className={`max-w-[80%] ${msg.sender === "user" ? "text-right" : "text-left"}`}>
              {msg.image ? (
                <img 
                  src={msg.image} 
                  alt="uploaded" 
                  loading="lazy"
                  decoding="async"
                  className="max-w-[300px] rounded-lg shadow-lg" 
                />
              ) : (
                <div className="relative">
                  <div
                    className={`px-4 py-2 break-words ${
                      msg.sender === "user" 
                        ? "bg-gradient-to-r from-green-400 to-green-600 rounded-2xl rounded-br-sm shadow-lg" 
                        : "bg-white/20 backdrop-blur rounded-2xl rounded-bl-sm shadow-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {/* Animated emoji for encouragement messages */}
                  {msg.sender === "bot" && isEncouragementMessage(msg.text) && (
                    <div className="absolute -top-2 -right-2 text-2xl animate-emoji-bounce">
                      {msg.text.toLowerCase().includes("excellent") || msg.text.toLowerCase().includes("perfect") ? "🌟" : "👍"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Confetti effect */}
      {showConfetti && <Confetti />}
      
      {/* Success animation */}
      {showSuccessAnimation && <SuccessAnimation onComplete={() => setShowSuccessAnimation(false)} />}

      <div className="flex items-center mt-3 bg-white/20 rounded-xl px-3 py-2 shrink-0 space-x-2 min-h-[48px] transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-400 focus-within:shadow-glow-blue">
        <label className="p-2 hover:bg-white/30 rounded-lg cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <Image className="text-white" size={20} aria-hidden="true" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            aria-label={lang === "hi" ? "छवि अपलोड करें" : "Upload image"}
          />
        </label>
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
          aria-label={lang === "hi" ? "गणित का सवाल पूछें" : "Ask a math question"}
        />
        <button
  onClick={() => handleSend()}
  disabled={loading}
  className="ml-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-glow-green flex items-center justify-center min-w-[44px] min-h-[44px]"
>
  {loading ? (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  ) : (
    <span>&gt;</span>
  )}
</button>

{/* NEW CHECK BUTTON */}
<button
  onClick={() => handleCheck()}
  disabled={loading}
  className="ml-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-glow-blue flex items-center justify-center min-w-[44px] min-h-[44px]"
>
  ✔
</button>

      </div>
    </div>
  );
}
