// Custom hook for lazy loading images with Intersection Observer
import { useState, useEffect, useRef } from 'react';

/**
 * Hook for lazy loading images
 * @param {string} src - Image source URL
 * @param {Object} options - Intersection Observer options
 * @returns {Object} Image ref, loaded state, and error state
 */
export const useLazyImage = (src, options = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) return;

    const defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01,
      ...options
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Create a temporary image to preload
          const tempImg = new Image();
          
          tempImg.onload = () => {
            img.src = src;
            setIsLoaded(true);
          };
          
          tempImg.onerror = (err) => {
            setError(err);
            console.error(`Failed to load image: ${src}`);
          };
          
          tempImg.src = src;
          observer.unobserve(img);
        }
      });
    }, defaultOptions);

    const currentImg = imgRef.current;
    if (currentImg) {
      observer.observe(currentImg);
    }

    return () => {
      if (currentImg) {
        observer.unobserve(currentImg);
      }
    };
  }, [src, options]);

  return { imgRef, isLoaded, error };
};

/**
 * Hook for lazy loading background images
 * @param {string} src - Background image source URL
 * @param {Object} options - Intersection Observer options
 * @returns {Object} Element ref and loaded state
 */
export const useLazyBackgroundImage = (src, options = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    if (!src) return;

    const defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01,
      ...options
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          // Preload the image
          const tempImg = new Image();
          tempImg.onload = () => {
            element.style.backgroundImage = `url(${src})`;
            setIsLoaded(true);
          };
          tempImg.src = src;
          
          observer.unobserve(element);
        }
      });
    }, defaultOptions);

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [src, options]);

  return { elementRef, isLoaded };
};
