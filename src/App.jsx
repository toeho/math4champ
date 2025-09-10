import Header from "./components/Header";
import ProgressBar from "./components/ProgressBar";
import FeatureGrid from "./components/FeatureGrid";
import ChatSection from "./components/ChatSection";
import BottomNav from "./components/BottomNav";
import Highlights from "./components/Highlights";

export default function App() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-indigo-500 to-purple-600 p-5">
      {/* Main App Container */}
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-5">
        <Header />
        <ProgressBar />
        <FeatureGrid />
        <ChatSection />
        <BottomNav />
      </div>
    </div>
  );
}
