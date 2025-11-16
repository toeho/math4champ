// Lazy loading utilities using Intersection Observer

/**
 * Lazy load images using Intersection Observer
 * @param {string} selector - CSS selector for images to lazy load
 * @param {Object} options - Intersection Observer options
 */
export const lazyLoadImages = (selector = 'img[data-src]', options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
    ...options
  };

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        
        if (src) {
          // Create a new image to preload
          const tempImg = new Image();
          tempImg.onload = () => {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
          };
          tempImg.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            img.classList.add('error');
          };
          tempImg.src = src;
        }
        
        observer.unobserve(img);
      }
    });
  }, defaultOptions);

  // Observe all images matching the selector
  const images = document.querySelectorAll(selector);
  images.forEach(img => imageObserver.observe(img));

  return imageObserver;
};

/**
 * Lazy load components/sections using Intersection Observer
 * @param {string} selector - CSS selector for elements to lazy load
 * @param {Function} callback - Callback function when element is visible
 * @param {Object} options - Intersection Observer options
 */
export const lazyLoadComponent = (selector, callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  };

  const componentObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, defaultOptions);

  const elements = document.querySelectorAll(selector);
  elements.forEach(el => componentObserver.observe(el));

  return componentObserver;
};

/**
 * Preload critical images
 * @param {Array<string>} imageUrls - Array of image URLs to preload
 */
export const preloadImages = (imageUrls) => {
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Create a lazy loading hook for React components
 * @param {Function} importFunc - Dynamic import function
 * @returns {Object} Component and loading state
 */
export const useLazyComponent = (importFunc) => {
  const [Component, setComponent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    importFunc()
      .then(module => {
        setComponent(() => module.default);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { Component, loading, error };
};
