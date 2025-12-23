import { useState, useEffect } from 'react';

export const useMotivationalQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/quotes.json');
        
        if (!response.ok) {
          throw new Error('Failed to load quotes');
        }
        
        const quotesData = await response.json();
        setQuotes(quotesData);
        setError(null);
      } catch (err) {
        console.error('Error loading quotes:', err);
        setError(err.message);
        // Fallback quotes
        setQuotes([
          {
            text: "The expert in anything was once a beginner.",
            author: "Helen Hayes"
          },
          {
            text: "Education is the most powerful weapon which you can use to change the world.",
            author: "Nelson Mandela"
          },
          {
            text: "The beautiful thing about learning is that no one can take it away from you.",
            author: "B.B. King"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadQuotes();
  }, []);

  const getRandomQuote = () => {
    if (quotes.length === 0) return null;
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const getQuotesByCategory = (category) => {
    // Future enhancement: filter quotes by category if we add categories
    return quotes;
  };

  return {
    quotes,
    loading,
    error,
    getRandomQuote,
    getQuotesByCategory
  };
};