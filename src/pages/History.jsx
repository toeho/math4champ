import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserChats } from "../utils/fetchData";
import { useUser } from "../contexts/UserContext";

export default function History() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();
  const { user, loading } = useUser();

  useEffect(() => {
    const loadChats = async () => {
      if (loading) return; // wait for user to load
      if (!user) {
        console.warn("⚠️ No user logged in — skipping chat fetch");
        return;
      }

      try {
        const data = await getUserChats(user.username);
        setHistory(data);
      } catch (err) {
        console.error("❌ Failed to load chats:", err);
      }
    };

    loadChats();
  }, [user, loading]);

  const handleClick = (chat) => {
    // 👇 navigate back to main chat page with chat history
    navigate("/", { state: { messages: chat.messages || [] } });
  };

  if (loading) {
    return <p className="text-gray-300">Loading user...</p>;
  }

  return (
    <div className="flex flex-col h-full text-white p-4">
      <h1 className="text-xl font-bold mb-4">
        📜 {user ? `${user.username}'s Chat History` : "Guest Chat History"}
      </h1>

      {history.length === 0 ? (
        <p className="text-gray-300">No past chats yet.</p>
      ) : (
        <div className="space-y-3 overflow-y-auto">
          {history.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleClick(chat)}
              className="bg-white/10 p-3 rounded-xl hover:bg-white/20 cursor-pointer transition-colors"
            >
              <h2 className="font-semibold text-sm truncate">{chat.title}</h2>
              <p className="text-xs text-gray-300 truncate">
                {chat.messages && chat.messages.length > 0
                  ? chat.messages.map((m) => m.text || "[Image]").join(" · ")
                  : "No messages"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
