import { useState } from "react";
import Header from "../components/Header";
import ProgressBar from "../components/ProgressBar";
import BottomNav from "../components/BottomNav";

export default function MainLayout({ children }) {
  const [loading, setLoading] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

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
        {/* Shared header */}
        <Header />

        {/* Shared progress bar */}
        <ProgressBar loading={loading} />

        {/* Dynamic page content */}
        <div className="flex-1 overflow-y-auto">
          {children({ isChatExpanded, setIsChatExpanded, loading, setLoading })}
        </div>

        {/* Shared bottom nav */}
        <BottomNav setIsChatExpanded={setIsChatExpanded} />
      </div>
    </div>
  );
}
