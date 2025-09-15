import { useState } from "react";
import Header from "./components/Header";
import ProgressBar from "./components/ProgressBar";
import FeatureGrid from "./components/FeatureGrid";
import ChatSection from "./components/ChatSection";
import BottomNav from "./components/BottomNav";

export default function App() {
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  return (
    <div
      className="h-screen w-screen bg-gradient-to-b from-indigo-500 to-purple-600 p-2 sm:p-2 flex justify-center items-center"
      onClick={() => setIsChatExpanded(false)} // collapse on background click
    >
      {/* Main App Container */}
      <div
        className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl h-full 
                   bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl 
                   p-3 sm:p-4 md:p-5 flex flex-col"
        onClick={(e) => e.stopPropagation()} // prevent background click
      >
        <Header />
        <ProgressBar />

        {!isChatExpanded && <FeatureGrid />}
        <ChatSection setIsChatExpanded={setIsChatExpanded} isChatExpanded={isChatExpanded} />

        {/* Pass collapse function to BottomNav */}
        <BottomNav setIsChatExpanded={setIsChatExpanded} />
      </div>
    </div>
  );
}
