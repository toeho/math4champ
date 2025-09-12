import Header from "./components/Header";
import ProgressBar from "./components/ProgressBar";
import FeatureGrid from "./components/FeatureGrid";
import ChatSection from "./components/ChatSection";
import BottomNav from "./components/BottomNav";

export default function App() {
  return (
    <div className="h-screen w-screen bg-gradient-to-b from-indigo-500 to-purple-600 p-2 sm:p-2 flex justify-center items-center">
      {/* Main App Container */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl h-full 
                      bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl 
                      p-3 sm:p-4 md:p-5 flex flex-col">
        <Header />
        <ProgressBar />
        <FeatureGrid />
        {/* 🔹 Flex-1 takes up remaining height */}
        <ChatSection />
        <BottomNav />
      </div>
    </div>
  );
}
