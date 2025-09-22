// src/pages/Home.jsx
import { useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import ProgressBar from "../components/ProgressBar";
import FeatureGrid from "../components/FeatureGrid";
import ChatSection from "../components/ChatSection";
import BottomNav from "../components/BottomNav";

export default function Home() {
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // 👇 if user navigates from History, preload messages
  const location = useLocation();
  const preloadMessages = location.state?.messages || null;

  return (
    <div
      className="h-screen w-screen bg-gradient-to-b from-indigo-500 to-purple-600 p-2 sm:p-2 flex justify-center items-center"
      onClick={() => setIsChatExpanded(false)}
    >
      <div
        className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl h-full 
                   bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl 
                   p-3 sm:p-4 md:p-5 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top header */}
        <Header />

        {/* Progress bar */}
        <ProgressBar loading={loading} />

        {/* Show features only if chat is not expanded */}
        {!isChatExpanded && <FeatureGrid />}

        {/* Chat Section with preloaded history support */}
        <ChatSection
          setIsChatExpanded={setIsChatExpanded}
          isChatExpanded={isChatExpanded}
          setLoading={setLoading}
          loadMessages={preloadMessages} // 👈 added
        />

        {/* Bottom Navigation */}
        <BottomNav setIsChatExpanded={setIsChatExpanded} />
      </div>
    </div>
  );
}
