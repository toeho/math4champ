import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import ProgressBar from "../components/ProgressBar";
import FeatureGrid from "../components/FeatureGrid";
import ChatSection from "../components/ChatSection";
import BottomNav from "../components/BottomNav";
import MotivationalQuote from "../components/MotivationalQuote";

export default function Home() {
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialTopic, setInitialTopic] = useState(null);
  const [showQuote, setShowQuote] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const location = useLocation();
  const preloadMessages = location.state?.messages || null;
  const preloadSessionId = location.state?.session_id || null;

  useEffect(() => {
    // Check if this is the first load of the app
    const hasShownQuote = sessionStorage.getItem('hasShownQuote');
    console.log('hasShownQuote:', hasShownQuote);
    console.log('showQuote:', showQuote, 'isFirstLoad:', isFirstLoad);
    
    if (hasShownQuote) {
      setShowQuote(false);
      setIsFirstLoad(false);
    }
    
    // For debugging - uncomment the line below to always show the quote
    sessionStorage.removeItem('hasShownQuote');
  }, []);

  const handleTopicClick = (topic) => {
    setInitialTopic(topic);
    setIsChatExpanded(true);
  };

  const handleQuoteComplete = () => {
    console.log('Quote completed, hiding quote');
    setShowQuote(false);
    setIsFirstLoad(false);
    sessionStorage.setItem('hasShownQuote', 'true');
  };

  return (
    <>
      {/* Show motivational quote on first load */}
      {showQuote && isFirstLoad && (
        <MotivationalQuote onComplete={handleQuoteComplete} />
      )}
      
      {/* Debug info - remove this later */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/50 text-white p-2 rounded text-xs z-50">
          showQuote: {showQuote.toString()}, isFirstLoad: {isFirstLoad.toString()}
        </div>
      )}
      
      <div
        className="h-screen w-screen bg-gradient-to-b from-blue-600 to-indigo-700 p-2 flex justify-center items-center relative overflow-hidden"
        onClick={() => setIsChatExpanded(false)}
      >
      {/* Ambient floating elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl animate-ambient-float"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl animate-ambient-float animation-delay-1000"></div>
      <div className="absolute top-1/3 right-10 w-16 h-16 bg-indigo-400/10 rounded-full blur-xl animate-ambient-float animation-delay-500"></div>
      
      <div
        className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl h-full 
                   bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl 
                   p-4 flex flex-col relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Header />
        <ProgressBar loading={loading} />

        {/* Content area with proper overflow handling */}
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
          {!isChatExpanded && <FeatureGrid onTopicClick={handleTopicClick} />}

          <ChatSection
            setIsChatExpanded={setIsChatExpanded}
            isChatExpanded={isChatExpanded}
            setLoading={setLoading}
            loading={loading}
            loadMessages={preloadMessages}
            preloadSessionId={preloadSessionId}
            initialTopic={initialTopic}
          />
        </div>

        <BottomNav setIsChatExpanded={setIsChatExpanded} />
      </div>
    </div>
    </>
  );
}
