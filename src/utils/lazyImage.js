// Lazy loading utility using Intersection Observer
// Optimizes image loading for better performance

export class LazyImageLoader {
  constructor(options = {}) {
    this.options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01,
      ...options
    };
    
    this.observer = null;
    this.images = new Set();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        this.options
      );
    }
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        this.loadImage(img);
        this.observer.unobserve(img);
        this.images.delete(img);
      }
    });
  }

  loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;

    // Create a new image to preload
    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = src;
      img.classList.add('loaded');
      img.removeAttribute('data-src');
    };
    tempImg.onerror = () => {
      console.error('Failed to load image:', src);
      img.classList.add('error');
    };
    tempImg.src = src;
  }

  observe(img) {
    if (!img || !(img instanceof HTMLImageElement)) return;
    
    // Fallback for browsers without IntersectionObserver
    if (!this.observer) {
      this.loadImage(img);
      return;
    }

    this.images.add(img);
    this.observer.observe(img);
  }

  unobserve(img) {
    if (this.observer && img) {
      this.observer.unobserve(img);
      this.images.delete(img);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.images.clear();
    }
  }
}

// Create singleton instance
export const lazyImageLoader = new LazyImageLoader();
lazyImageLoader.init();

// React hook for lazy loading images
export function useLazyImage(ref) {
  if (ref.current) {
    lazyImageLoader.observe(ref.current);
  }
  
  return () => {
    if (ref.current) {
      lazyImageLoader.unobserve(ref.current);
    }
  };
}
