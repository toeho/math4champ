// Performance monitoring and optimization utilities

// Measure Core Web Vitals
export function measureWebVitals() {
  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
            console.log('CLS:', clsScore);
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('Performance monitoring not supported:', e);
    }
  }
}

// Debounce function for performance optimization
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll/resize events
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Request Animation Frame wrapper for smooth animations
export function rafThrottle(callback) {
  let requestId = null;
  let lastArgs;

  const later = (context) => () => {
    requestId = null;
    callback.apply(context, lastArgs);
  };

  const throttled = function (...args) {
    lastArgs = args;
    if (requestId === null) {
      requestId = requestAnimationFrame(later(this));
    }
  };

  throttled.cancel = () => {
    cancelAnimationFrame(requestId);
    requestId = null;
  };

  return throttled;
}

// GPU acceleration helper
export function enableGPUAcceleration(element) {
  if (element) {
    element.style.transform = 'translateZ(0)';
    element.style.willChange = 'transform, opacity';
  }
}

// Optimize animations for 60fps
export function optimizeAnimation(element, property = 'transform') {
  if (!element) return;
  
  // Use transform and opacity for GPU acceleration
  element.style.willChange = property;
  
  // Clean up after animation
  const cleanup = () => {
    element.style.willChange = 'auto';
  };
  
  element.addEventListener('animationend', cleanup, { once: true });
  element.addEventListener('transitionend', cleanup, { once: true });
  
  return cleanup;
}

// Check if device is low-end
export function isLowEndDevice() {
  // Check for hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 2;
  
  // Check for device memory (if available)
  const memory = navigator.deviceMemory || 4;
  
  // Check for connection speed
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const effectiveType = connection?.effectiveType || '4g';
  
  return cores <= 2 || memory <= 2 || effectiveType === 'slow-2g' || effectiveType === '2g';
}

// Reduce animations for low-end devices
export function shouldReduceAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLowEnd = isLowEndDevice();
  
  return prefersReduced || isLowEnd;
}

// Measure frame rate
export function measureFPS(duration = 1000) {
  return new Promise((resolve) => {
    let frames = 0;
    let lastTime = performance.now();
    
    function countFrame() {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + duration) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        resolve(fps);
      } else {
        requestAnimationFrame(countFrame);
      }
    }
    
    requestAnimationFrame(countFrame);
  });
}

// Preload critical resources
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Batch DOM updates
export function batchDOMUpdates(updates) {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}
