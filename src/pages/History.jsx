// src/pages/History.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserChats } from "../utils/fetchData";

export default function History() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      // Assuming userId = 1 for demo (later replace with logged-in user)
      const data = await getUserChats(1);
      setHistory(data);
    })();
  }, []);

  const handleClick = (chat) => {
    // 👇 go back to Home with old chat messages
    navigate("/", { state: { messages: chat.messages } });
  };

  return (
    <div className="flex flex-col h-full text-white">
      <h1 className="text-xl font-bold mb-4">📜 Chat History</h1>
      {history.length === 0 ? (
        <p className="text-gray-300">No past chats yet.</p>
      ) : (
        <div className="space-y-3 overflow-y-auto">
          {history.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleClick(chat)}
              className="bg-white/10 p-3 rounded-xl hover:bg-white/20 cursor-pointer"
            >
              <h2 className="font-semibold text-sm truncate">{chat.title}</h2>
              <p className="text-xs text-gray-300 truncate">
                {chat.messages?.map((m) => m.text || "[Image]").join(" · ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
