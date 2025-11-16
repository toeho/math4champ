import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserChats } from "../utils/fetchData";
import { useUser } from "../contexts/UserContext";

export default function History() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, loading } = useUser();

  useEffect(() => {
    const loadChats = async () => {
      if (loading) return; // wait for user to load
      if (!user) {
        console.warn("⚠️ No user logged in — skipping chat fetch");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getUserChats(user.username);
        setHistory(data);
      } catch (err) {
        console.error("❌ Failed to load chats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, [user, loading]);

  const handleClick = (chat) => {
    // 👇 navigate back to main chat page with chat history
    navigate("/", { state: { messages: chat.messages || [], session_id: chat.session_id } });
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-white/20 animate-shimmer"
          style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 100%)',
            backgroundSize: '200% 100%',
          }}
        >
          <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-white/20 rounded w-full"></div>
        </div>
      ))}
    </div>
  );

  // Empty state component with animated illustration
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
      <div className="mb-6 animate-float">
        <div className="text-8xl sm:text-9xl mb-4">📚</div>
      </div>
      <h2 className="text-xl sm:text-2xl font-bold mb-2 text-white">
        No Chat History Yet
      </h2>
      <p className="text-gray-300 text-sm sm:text-base mb-6 max-w-md">
        Start a conversation to see your chat history here. Your learning journey begins with a single question!
      </p>
      <button
        onClick={() => navigate("/")}
        className="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:brightness-110 active:scale-95 transition-all shadow-lg"
      >
        Start Chatting
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col h-full text-white p-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">
          📜 Chat History
        </h1>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-white p-3 sm:p-4 animate-page-fade-in">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">
        📜 {user ? `${user.username}'s Chat History` : "Guest Chat History"}
      </h1>

      {isLoading ? (
        <LoadingSkeleton />
      ) : history.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3 overflow-y-auto smooth-scroll flex-1">
          {history.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleClick(chat)}
              className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-white/20 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] group"
              style={{
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-sm sm:text-base truncate mb-1 text-white group-hover:text-blue-300 transition-colors">
                    {chat.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">
                    {chat.messages && chat.messages.length > 0
                      ? chat.messages.map((m) => m.text || "[Image]").join(" · ")
                      : "No messages"}
                  </p>
                </div>
                <div className="flex-shrink-0 text-2xl opacity-70 group-hover:opacity-100 transition-opacity">
                  💬
                </div>
              </div>
              {chat.messages && chat.messages.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-gray-400">
                  <span>{chat.messages.length} messages</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
