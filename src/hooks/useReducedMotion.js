// Custom hook for detecting and respecting user's motion preferences
import { useState, useEffect } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 * @returns {boolean} True if user prefers reduced motion
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } 
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
};

/**
 * Hook to get animation class based on motion preference
 * @param {string} animationClass - Animation class to use
 * @param {string} fallbackClass - Fallback class for reduced motion
 * @returns {string} Appropriate class based on preference
 */
export const useAnimationClass = (animationClass, fallbackClass = '') => {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? fallbackClass : animationClass;
};

/**
 * Hook to get animation duration based on motion preference
 * @param {number} duration - Normal animation duration in ms
 * @param {number} reducedDuration - Reduced animation duration in ms
 * @returns {number} Appropriate duration based on preference
 */
export const useAnimationDuration = (duration, reducedDuration = 0) => {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? reducedDuration : duration;
};
