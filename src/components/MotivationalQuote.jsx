import { useState, useEffect } from 'react';

export default function MotivationalQuote({ onComplete }) {
  const [quote, setQuote] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load quotes directly
    const loadQuote = async () => {
      try {
        console.log('Loading quotes...');
        const response = await fetch('/quotes.json');
        if (!response.ok) {
          throw new Error('Failed to fetch quotes');
        }
        const quotes = await response.json();
        console.log('Quotes loaded:', quotes.length);
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setQuote(randomQuote);
        console.log('Selected quote:', randomQuote);
      } catch (error) {
        console.error('Failed to load quotes:', error);
        // Fallback quote
        setQuote({
          text: "The expert in anything was once a beginner.",
          author: "Helen Hayes"
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuote();
  }, []);

  useEffect(() => {
    // Only start timers when we have a quote
    if (!quote || loading) return;

    console.log('Starting timers for quote display');

    // Start fade out after 3 seconds
    const fadeTimer = setTimeout(() => {
      console.log('Starting fade out');
      setFadeOut(true);
    }, 3000);

    // Complete hide after 3.5 seconds
    const hideTimer = setTimeout(() => {
      console.log('Hiding quote and calling onComplete');
      setIsVisible(false);
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [quote, loading, onComplete]);

  if (!isVisible) return null;

  // Show loading state while quotes are being fetched
  if (loading || !quote) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading inspiration...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed inset-0 z-50 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 
                  flex items-center justify-center transition-opacity duration-500 
                  ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Background animation elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-32 right-16 w-24 h-24 bg-blue-300/10 rounded-full blur-xl animate-bounce"></div>
      <div className="absolute top-1/2 right-32 w-16 h-16 bg-indigo-300/10 rounded-full blur-lg animate-pulse animation-delay-1000"></div>
      
      <div className="max-w-2xl mx-8 text-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 animate-quote-fade-in">
          {/* Quote icon */}
          <div className="mb-6">
            <svg 
              className="w-12 h-12 mx-auto text-white/80 animate-quote-icon-glow" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
          </div>
          
          {/* Quote text */}
          <blockquote className="text-xl md:text-2xl font-light text-white mb-6 leading-relaxed animate-quote-text-reveal">
            "{quote.text}"
          </blockquote>
          
          {/* Author */}
          <cite className="text-blue-200 text-lg font-medium animate-quote-author-slide">
            — {quote.author}
          </cite>
          
          {/* Motivational message */}
          <div className="mt-8 pt-6 border-t border-white/20 animate-quote-author-slide">
            <p className="text-white/90 text-sm font-medium">
              Ready to start your learning journey? 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}