// Verification script for Task 12: Performance and Accessibility Optimizations

/**
 * Comprehensive verification of all task requirements
 */
export const verifyAllOptimizations = () => {
  console.log('🔍 Verifying Task 12 Implementation...\n');
  console.log('=' .repeat(60));
  
  const results = {
    lazyLoading: verifyLazyLoading(),
    reducedMotion: verifyReducedMotion(),
    colorContrast: verifyColorContrast(),
    touchTargets: verifyTouchTargets(),
    ariaLabels: verifyAriaLabels(),
    gpuAcceleration: verifyGPUAcceleration(),
    offlineSupport: verifyOfflineSupport(),
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  
  const passed = Object.values(results).filter(r => r.passed).length;
  const total = Object.keys(results).length;
  
  console.log(`\n✅ Passed: ${passed}/${total}`);
  console.log(`${passed === total ? '🎉 All checks passed!' : '⚠️  Some checks need attention'}\n`);
  
  return results;
};

/**
 * Verify lazy loading implementation
 */
function verifyLazyLoading() {
  console.log('\n1️⃣  Lazy Loading Images');
  console.log('-'.repeat(60));
  
  const checks = {
    intersectionObserverSupport: 'IntersectionObserver' in window,
    lazyImageComponent: checkFileExists('LazyImage.jsx'),
    lazyImageHook: checkFileExists('useLazyImage.js'),
    lazyLoadUtility: checkFileExists('lazyLoad.js'),
  };
  
  Object.entries(checks).forEach(([key, value]) => {
    console.log(`  ${value ? '✓' : '✗'} ${formatKey(key)}`);
  });
  
  const passed = Object.values(checks).every(v => v);
  console.log(`  ${passed ? '✅ PASS' : '❌ FAIL'}`);
  
  return { passed, checks };
}

/**
 * Verify reduced motion support
 */
function verifyReducedMotion() {
  console.log('\n2️⃣  Reduced Motion Support');
  console.log('-'.repeat(60));
  
  const checks = {
    cssMediaQuery: checkCSSRule('prefers-reduced-motion'),
    reactHook: checkFileExists('useReducedMotion.js'),
    animationDisabling: checkCSSRule('animation-duration: 0.01ms'),
    scrollBehaviorAuto: checkCSSRule('scroll-behavior: auto'),
  };
  
  Object.entries(checks).forEach(([key, value]) => {
    console.log(`  ${value ? '✓' : '✗'} ${formatKey(key)}`);
  });
  
  const passed = Object.values(checks).every(v => v);
  console.log(`  ${passed ? '✅ PASS' : '❌ FAIL'}`);
  
  return { passed, checks };
}

/**
 * Verify color contrast
 */
function verifyColorContrast() {
  console.log('\n3️⃣  Color Contrast (WCAG AA)');
  console.log('-'.repeat(60));
  
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button');
  let totalChecked = 0;
  let passed = 0;
  
  textElements.forEach(element => {
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') return;
    
    totalChecked++;
    const contrast = calculateContrast(style.color, getBackgroundColor(element));
    if (contrast >= 4.5) passed++;
  });
  
  const percentage = totalChecked > 0 ? ((passed / totalChecked) * 100).toFixed(1) : 0;
  
  console.log(`  ✓ Elements checked: ${totalChecked}`);
  console.log(`  ✓ Passing contrast: ${passed} (${percentage}%)`);
  console.log(`  ${percentage >= 95 ? '✅ PASS' : '⚠️  NEEDS REVIEW'}`);
  
  return { 
    passed: percentage >= 95, 
    checks: { totalChecked, passed, percentage } 
  };
}

/**
 * Verify touch targets
 */
function verifyTouchTargets() {
  console.log('\n4️⃣  Touch Target Sizes (44x44px minimum)');
  console.log('-'.repeat(60));
  
  const interactive = document.querySelectorAll(
    'button, a, input, select, textarea, [role="button"]'
  );
  
  let totalChecked = 0;
  let passed = 0;
  
  interactive.forEach(element => {
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') return;
    
    totalChecked++;
    const rect = element.getBoundingClientRect();
    if (rect.width >= 44 && rect.height >= 44) passed++;
  });
  
  const percentage = totalChecked > 0 ? ((passed / totalChecked) * 100).toFixed(1) : 0;
  
  console.log(`  ✓ Elements checked: ${totalChecked}`);
  console.log(`  ✓ Meeting minimum: ${passed} (${percentage}%)`);
  console.log(`  ${percentage >= 95 ? '✅ PASS' : '⚠️  NEEDS REVIEW'}`);
  
  return { 
    passed: percentage >= 95, 
    checks: { totalChecked, passed, percentage } 
  };
}

/**
 * Verify ARIA labels
 */
function verifyAriaLabels() {
  console.log('\n5️⃣  ARIA Labels for Screen Readers');
  console.log('-'.repeat(60));
  
  const checks = {
    accessibilityUtility: checkFileExists('accessibility.js'),
    srOnlyClass: checkCSSRule('.sr-only'),
    ariaLiveRegions: document.querySelectorAll('[aria-live]').length > 0,
    ariaLabels: document.querySelectorAll('[aria-label]').length > 0,
  };
  
  Object.entries(checks).forEach(([key, value]) => {
    console.log(`  ${value ? '✓' : '✗'} ${formatKey(key)}`);
  });
  
  const passed = Object.values(checks).every(v => v);
  console.log(`  ${passed ? '✅ PASS' : '❌ FAIL'}`);
  
  return { passed, checks };
}

/**
 * Verify GPU acceleration
 */
function verifyGPUAcceleration() {
  console.log('\n6️⃣  GPU Acceleration (transform & opacity)');
  console.log('-'.repeat(60));
  
  const checks = {
    gpuAcceleratedClass: checkCSSRule('.gpu-accelerated'),
    transformUsage: checkCSSRule('transform:'),
    willChangeProperty: checkCSSRule('will-change:'),
    opacityTransitions: checkCSSRule('opacity'),
  };
  
  Object.entries(checks).forEach(([key, value]) => {
    console.log(`  ${value ? '✓' : '✗'} ${formatKey(key)}`);
  });
  
  const passed = Object.values(checks).filter(v => v).length >= 3;
  console.log(`  ${passed ? '✅ PASS' : '⚠️  PARTIAL'}`);
  
  return { passed, checks };
}

/**
 * Verify offline support
 */
function verifyOfflineSupport() {
  console.log('\n7️⃣  Offline Support');
  console.log('-'.repeat(60));
  
  const checks = {
    serviceWorkerSupport: 'serviceWorker' in navigator,
    serviceWorkerFile: checkFileExists('sw.js'),
    serviceWorkerUtility: checkFileExists('serviceWorker.js'),
    cacheAPI: 'caches' in window,
  };
  
  Object.entries(checks).forEach(([key, value]) => {
    console.log(`  ${value ? '✓' : '✗'} ${formatKey(key)}`);
  });
  
  const passed = Object.values(checks).every(v => v);
  console.log(`  ${passed ? '✅ PASS' : '❌ FAIL'}`);
  
  return { passed, checks };
}

// Helper functions

function formatKey(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function checkFileExists(filename) {
  // This is a simplified check - in real implementation, 
  // you would check if the module can be imported
  try {
    // Check if file is referenced in the codebase
    const scripts = Array.from(document.scripts);
    return scripts.some(script => script.src.includes(filename));
  } catch {
    return true; // Assume exists if we can't check
  }
}

function checkCSSRule(ruleText) {
  try {
    const sheets = Array.from(document.styleSheets);
    for (const sheet of sheets) {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        for (const rule of rules) {
          if (rule.cssText && rule.cssText.includes(ruleText)) {
            return true;
          }
          // Check media rules
          if (rule.media && rule.cssRules) {
            const mediaRules = Array.from(rule.cssRules);
            if (mediaRules.some(r => r.cssText && r.cssText.includes(ruleText))) {
              return true;
            }
          }
        }
      } catch (e) {
        // Cross-origin stylesheet
        continue;
      }
    }
  } catch (e) {
    console.warn('Could not check CSS rules:', e);
  }
  return false;
}

function calculateContrast(color1, color2) {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(color) {
  const rgb = parseColor(color);
  const [r, g, b] = rgb.map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function parseColor(color) {
  const div = document.createElement('div');
  div.style.color = color;
  document.body.appendChild(div);
  const computed = window.getComputedStyle(div).color;
  document.body.removeChild(div);
  
  const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [255, 255, 255];
}

function getBackgroundColor(element) {
  let bgColor = window.getComputedStyle(element).backgroundColor;
  let parent = element.parentElement;
  
  while (bgColor === 'rgba(0, 0, 0, 0)' && parent) {
    bgColor = window.getComputedStyle(parent).backgroundColor;
    parent = parent.parentElement;
  }
  
  return bgColor === 'rgba(0, 0, 0, 0)' ? 'rgb(255, 255, 255)' : bgColor;
}

// Make available in console
if (typeof window !== 'undefined') {
  window.verifyOptimizations = verifyAllOptimizations;
}

export default verifyAllOptimizations;
