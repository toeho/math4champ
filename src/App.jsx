import Header from "./components/Header";
import ProgressBar from "./components/ProgressBar";
import FeatureGrid from "./components/FeatureGrid";
import ChatSection from "./components/ChatSection";
import BottomNav from "./components/BottomNav";

export default function App() {
  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-b from-indigo-500 to-purple-600 p-1">
      {/* Main App Container */}
      <div className="w-full max-w-sm h-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-3 flex flex-col">
        <Header />
        <ProgressBar />
        <FeatureGrid />
        <ChatSection />
        <BottomNav />
      </div>
    </div>
  );
}
