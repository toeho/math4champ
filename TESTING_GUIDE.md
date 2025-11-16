# Testing Guide for Task 12 Optimizations

## Quick Start

### 1. Run the Application
```bash
npm run dev
```

### 2. Open Browser Console
Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)

### 3. Run Verification Script
```javascript
// In the browser console:
window.verifyOptimizations();
```

This will check all 7 optimization areas and provide a detailed report.

---

## Detailed Testing

### Accessibility Testing

#### Test 1: Touch Targets
```javascript
window.accessibilityTests.testTouchTargets();
```
**Expected Result:** All interactive elements should be at least 44x44px

#### Test 2: Color Contrast
```javascript
window.accessibilityTests.testColorContrast();
```
**Expected Result:** All text should meet WCAG AA (4.5:1 ratio)

#### Test 3: ARIA Labels
```javascript
window.accessibilityTests.testAriaLabels();
```
**Expected Result:** All interactive elements should have proper labels

#### Test 4: Keyboard Navigation
```javascript
window.accessibilityTests.testKeyboardNavigation();
```
**Expected Result:** All elements should be keyboard accessible

#### Test 5: Run All Tests
```javascript
window.accessibilityTests.runAllAccessibilityTests();
```

---

### Performance Testing

#### Test 1: Monitor FPS
```javascript
import { monitorFPS } from './src/utils/performance';

monitorFPS((fps) => {
  console.log(`Current FPS: ${fps}`);
});
```
**Expected Result:** Should maintain 60fps during animations

#### Test 2: Check Device Capabilities
```javascript
import { isLowEndDevice, getAnimationSettings } from './src/utils/performance';

console.log('Low-end device:', isLowEndDevice());
console.log('Animation settings:', getAnimationSettings());
```

#### Test 3: Measure Core Web Vitals
```javascript
import { measureWebVitals } from './src/utils/performance';

measureWebVitals();
// Check console for LCP, FID, CLS values
```

---

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] Press `Tab` to navigate through all interactive elements
- [ ] Press `Enter` or `Space` to activate buttons
- [ ] Verify visible focus indicators on all elements
- [ ] Check that focus order is logical

#### Screen Reader Testing
**Windows (NVDA):**
1. Download NVDA from https://www.nvaccess.org/
2. Start NVDA
3. Navigate the app with keyboard
4. Verify all elements are announced correctly

**Mac (VoiceOver):**
1. Press `Cmd + F5` to enable VoiceOver
2. Use `Ctrl + Option + Arrow keys` to navigate
3. Verify all elements are announced correctly

#### Reduced Motion Testing
**Windows:**
1. Settings > Ease of Access > Display
2. Enable "Show animations in Windows"
3. Reload the app
4. Verify animations are disabled/reduced

**Mac:**
1. System Preferences > Accessibility > Display
2. Enable "Reduce motion"
3. Reload the app
4. Verify animations are disabled/reduced

**Browser DevTools:**
1. Open DevTools (`F12`)
2. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
3. Type "Emulate CSS prefers-reduced-motion"
4. Select "reduce"
5. Verify animations are disabled

#### Touch Target Testing (Mobile)
1. Open app on mobile device or use DevTools mobile emulation
2. Try tapping all buttons and interactive elements
3. Verify all elements are easy to tap (no mis-taps)
4. Check spacing between elements

#### Offline Testing
1. Open DevTools > Network tab
2. Select "Offline" from throttling dropdown
3. Reload the page
4. Verify cached content loads
5. Try navigating the app

#### Color Contrast Testing
**Chrome DevTools:**
1. Open DevTools > Elements
2. Select any text element
3. Look at Styles panel
4. Check contrast ratio indicator
5. Verify all text meets 4.5:1 minimum

**Online Tool:**
1. Visit https://webaim.org/resources/contrastchecker/
2. Enter foreground and background colors
3. Verify contrast ratio

---

### Lighthouse Audit

#### Run Lighthouse
1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Select:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
4. Click "Generate report"

#### Target Scores
- **Performance:** > 90
- **Accessibility:** 100
- **Best Practices:** > 90
- **SEO:** > 90

#### Core Web Vitals Targets
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

---

### Network Performance Testing

#### Test on Slow Connection
1. Open DevTools > Network tab
2. Select "Slow 3G" from throttling dropdown
3. Reload the page
4. Verify:
   - Critical content loads within 2 seconds
   - Images lazy load as you scroll
   - Animations remain smooth

#### Test Image Lazy Loading
1. Open DevTools > Network tab
2. Filter by "Img"
3. Scroll down the page slowly
4. Verify images load only when entering viewport

---

### Browser Compatibility Testing

Test on the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

### Automated Testing Commands

```bash
# Run all tests (if you have test suite)
npm test

# Run specific test file
npm test -- accessibility.test.js

# Run with coverage
npm test -- --coverage
```

---

## Common Issues & Solutions

### Issue: Touch targets too small
**Solution:** Add `min-w-[44px] min-h-[44px]` classes

### Issue: Low contrast
**Solution:** Use lighter text colors or darker backgrounds

### Issue: Missing ARIA labels
**Solution:** Add `aria-label` attribute to interactive elements

### Issue: Animations not respecting reduced motion
**Solution:** Use `useReducedMotion()` hook or check CSS media query

### Issue: Images not lazy loading
**Solution:** Use `LazyImage` component or `useLazyImage` hook

### Issue: Low FPS
**Solution:** 
- Add `gpu-accelerated` class
- Use `transform` and `opacity` for animations
- Reduce animation complexity on low-end devices

---

## Reporting Issues

If you find any accessibility or performance issues:

1. Run the verification script:
   ```javascript
   window.verifyOptimizations();
   ```

2. Take a screenshot of the console output

3. Note the specific issue:
   - What element is affected?
   - What is the expected behavior?
   - What is the actual behavior?

4. Check if it's a known issue in the implementation docs

---

## Additional Resources

- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Web.dev Accessibility:** https://web.dev/accessibility/
- **Core Web Vitals:** https://web.dev/vitals/
- **Lighthouse Documentation:** https://developers.google.com/web/tools/lighthouse

---

## Success Criteria

✅ All touch targets are at least 44x44px  
✅ All text meets WCAG AA contrast (4.5:1)  
✅ All interactive elements have ARIA labels  
✅ Keyboard navigation works for all features  
✅ Reduced motion is respected  
✅ Animations run at 60fps  
✅ Images lazy load on scroll  
✅ App works offline (cached content)  
✅ Lighthouse Performance > 90  
✅ Lighthouse Accessibility = 100  

---

## Quick Reference

### Console Commands
```javascript
// Verify all optimizations
window.verifyOptimizations();

// Run accessibility tests
window.accessibilityTests.runAllAccessibilityTests();

// Test specific features
window.accessibilityTests.testTouchTargets();
window.accessibilityTests.testColorContrast();
window.accessibilityTests.testAriaLabels();
window.accessibilityTests.testKeyboardNavigation();
```

### DevTools Shortcuts
- **Open DevTools:** `F12` or `Ctrl+Shift+I`
- **Command Menu:** `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
- **Lighthouse:** DevTools > Lighthouse tab
- **Network Throttling:** DevTools > Network tab > Throttling dropdown
- **Mobile Emulation:** DevTools > Toggle device toolbar (`Ctrl+Shift+M`)

---

Happy Testing! 🎉
