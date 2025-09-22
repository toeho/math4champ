// src/pages/History.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../utils/fetchData";

export default function History() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const data = await fetchData();
      if (data?.history) setHistory(data.history);
    })();
  }, []);

  const handleClick = (chat) => {
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
              <h2 className="font-semibold text-sm">{chat.title}</h2>
              <p className="text-xs text-gray-300 truncate">
                {chat.messages.map((m) => m.text).join(" · ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
