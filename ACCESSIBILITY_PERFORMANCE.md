# Accessibility & Performance Optimization

This document outlines the accessibility and performance optimizations implemented in the Math GPT application.

## Accessibility Features

### 1. WCAG AA Compliance

#### Color Contrast
- All text meets WCAG AA color contrast ratio of 4.5:1 minimum
- Large text (18px+ or 14px+ bold) meets 3:1 minimum
- Tested using automated contrast checking utilities

#### Touch Targets
- All interactive elements meet minimum 44x44px touch target size
- Buttons, links, and form inputs are appropriately sized
- Adequate spacing between interactive elements

#### ARIA Labels
- All interactive elements have proper ARIA labels
- Screen reader support with `aria-label`, `aria-labelledby`, and `role` attributes
- Live regions for dynamic content updates (`aria-live="polite"`)
- Proper semantic HTML structure

#### Keyboard Navigation
- All interactive elements are keyboard accessible
- Visible focus indicators with `:focus-visible` pseudo-class
- Tab order follows logical flow
- Enter and Space key support for custom interactive elements

### 2. Reduced Motion Support

#### CSS Media Query
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

#### React Hook
```javascript
import { useReducedMotion } from './hooks/useReducedMotion';

const prefersReducedMotion = useReducedMotion();
const animationClass = prefersReducedMotion ? '' : 'animate-bounce';
```

### 3. Screen Reader Support

#### Screen Reader Only Class
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

#### Announcements
```javascript
import { announceToScreenReader } from './utils/accessibility';

announceToScreenReader('Message sent successfully', 'polite');
```

## Performance Optimizations

### 1. Lazy Loading

#### Images
```javascript
import LazyImage from './components/LazyImage';

<LazyImage 
  src="/path/to/image.jpg" 
  alt="Description" 
  placeholder="data:image/svg+xml,..." 
/>
```

#### Intersection Observer
- Images load only when entering viewport
- 50px root margin for preloading
- Smooth fade-in transition on load

### 2. GPU Acceleration

#### CSS Transforms
All animations use GPU-accelerated properties:
- `transform` instead of `top/left/width/height`
- `opacity` for fade effects
- `will-change` for complex animations

```css
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform, opacity;
}
```

### 3. Animation Performance

#### Optimized Animations
- Animations run at 60fps on target devices
- Reduced complexity on low-end devices
- Automatic detection of device capabilities

```javascript
import { getAnimationSettings } from './utils/performance';

const settings = getAnimationSettings();
// {
//   enableAnimations: true,
//   complexAnimations: false, // on low-end devices
//   animationDuration: 150,
//   particleCount: 10
// }
```

### 4. Offline Support

#### Service Worker
- Caches critical resources
- Serves cached content when offline
- Automatic cache updates

```javascript
import { registerServiceWorker } from './utils/serviceWorker';

registerServiceWorker();
```

#### Network Status Detection
```javascript
import { listenToNetworkStatus } from './utils/serviceWorker';

listenToNetworkStatus(
  () => console.log('Online'),
  () => console.log('Offline')
);
```

### 5. Core Web Vitals

#### Monitoring
```javascript
import { measureWebVitals } from './utils/performance';

measureWebVitals();
// Logs: LCP, FID, CLS
```

#### Target Metrics
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### 6. Image Optimization

#### Automatic Optimization
```javascript
import { optimizeImage } from './utils/performance';

const optimized = await optimizeImage(url, 800, 0.8);
// Resizes to max 800px width, 80% quality
```

### 7. Performance Utilities

#### Debounce & Throttle
```javascript
import { debounce, throttle } from './utils/performance';

const handleSearch = debounce((query) => {
  // Search logic
}, 300);

const handleScroll = throttle(() => {
  // Scroll logic
}, 100);
```

## Testing

### Accessibility Tests

Run automated accessibility tests:
```javascript
import { runAllAccessibilityTests } from './utils/accessibilityTests';

// In browser console:
window.accessibilityTests.runAllAccessibilityTests();
```

Tests include:
- Touch target sizes
- Color contrast ratios
- ARIA labels
- Keyboard navigation
- Reduced motion support

### Performance Tests

Monitor FPS:
```javascript
import { monitorFPS } from './utils/performance';

monitorFPS((fps) => {
  console.log(`Current FPS: ${fps}`);
});
```

Check device capabilities:
```javascript
import { isLowEndDevice } from './utils/performance';

if (isLowEndDevice()) {
  // Reduce animation complexity
}
```

## Browser Support

- **Modern Browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **Older Browsers**: Graceful degradation
- **Mobile**: Optimized for iOS and Android
- **Screen Readers**: NVDA, JAWS, VoiceOver

## Best Practices

### 1. Always Use Semantic HTML
```html
<button> instead of <div onclick="">
<nav> for navigation
<main> for main content
<header>, <footer>, <article>, <section>
```

### 2. Provide Alternative Text
```html
<img src="..." alt="Descriptive text">
<button aria-label="Close dialog">×</button>
```

### 3. Test with Real Users
- Test with keyboard only
- Test with screen readers
- Test on low-end devices
- Test with reduced motion enabled

### 4. Monitor Performance
- Use Lighthouse in Chrome DevTools
- Monitor Core Web Vitals
- Test on 3G connections
- Profile with React DevTools

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web.dev Accessibility](https://web.dev/accessibility/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Core Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/learn/render-and-commit)
