// Accessibility testing utilities

/**
 * Test all touch targets meet minimum size (44x44px)
 * @returns {Array} Array of elements that fail the test
 */
export const testTouchTargets = () => {
  const interactiveElements = document.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])'
  );
  
  const failedElements = [];
  
  interactiveElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    // Check if element is visible
    if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
      return;
    }
    
    // Check minimum size
    if (rect.width < 44 || rect.height < 44) {
      failedElements.push({
        element,
        width: rect.width,
        height: rect.height,
        selector: getSelector(element)
      });
    }
  });
  
  return failedElements;
};

/**
 * Test color contrast ratios
 * @returns {Array} Array of elements that fail WCAG AA standards
 */
export const testColorContrast = () => {
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label');
  const failedElements = [];
  
  textElements.forEach(element => {
    const computedStyle = window.getComputedStyle(element);
    
    // Skip if element is not visible
    if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
      return;
    }
    
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;
    
    // Get actual background color (may need to traverse up)
    let bgColor = backgroundColor;
    let parent = element.parentElement;
    while (bgColor === 'rgba(0, 0, 0, 0)' && parent) {
      bgColor = window.getComputedStyle(parent).backgroundColor;
      parent = parent.parentElement;
    }
    
    const contrast = getContrastRatio(color, bgColor);
    
    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
    const fontSize = parseFloat(computedStyle.fontSize);
    const fontWeight = computedStyle.fontWeight;
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && parseInt(fontWeight) >= 700);
    const requiredContrast = isLargeText ? 3 : 4.5;
    
    if (contrast < requiredContrast) {
      failedElements.push({
        element,
        contrast: contrast.toFixed(2),
        required: requiredContrast,
        selector: getSelector(element),
        color,
        backgroundColor: bgColor
      });
    }
  });
  
  return failedElements;
};

/**
 * Test for proper ARIA labels
 * @returns {Array} Array of elements missing ARIA labels
 */
export const testAriaLabels = () => {
  const interactiveElements = document.querySelectorAll(
    'button:not([aria-label]):not([aria-labelledby]), ' +
    'a:not([aria-label]):not([aria-labelledby]), ' +
    'input:not([aria-label]):not([aria-labelledby]):not([id]), ' +
    '[role="button"]:not([aria-label]):not([aria-labelledby])'
  );
  
  const failedElements = [];
  
  interactiveElements.forEach(element => {
    const computedStyle = window.getComputedStyle(element);
    
    // Skip if element is not visible
    if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
      return;
    }
    
    // Check if element has text content
    const hasTextContent = element.textContent.trim().length > 0;
    
    // Check if input has associated label
    const hasLabel = element.tagName === 'INPUT' && 
                     element.id && 
                     document.querySelector(`label[for="${element.id}"]`);
    
    if (!hasTextContent && !hasLabel) {
      failedElements.push({
        element,
        selector: getSelector(element),
        tagName: element.tagName
      });
    }
  });
  
  return failedElements;
};

/**
 * Test keyboard navigation
 * @returns {Object} Test results
 */
export const testKeyboardNavigation = () => {
  const interactiveElements = document.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])'
  );
  
  const results = {
    total: interactiveElements.length,
    focusable: 0,
    nonFocusable: []
  };
  
  interactiveElements.forEach(element => {
    const computedStyle = window.getComputedStyle(element);
    
    // Skip if element is not visible
    if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
      return;
    }
    
    const tabIndex = element.getAttribute('tabindex');
    const isFocusable = tabIndex !== '-1' && !element.disabled;
    
    if (isFocusable) {
      results.focusable++;
    } else {
      results.nonFocusable.push({
        element,
        selector: getSelector(element)
      });
    }
  });
  
  return results;
};

/**
 * Test for reduced motion support
 * @returns {boolean} True if reduced motion is supported
 */
export const testReducedMotionSupport = () => {
  const styles = document.styleSheets;
  let hasReducedMotionRule = false;
  
  for (let i = 0; i < styles.length; i++) {
    try {
      const rules = styles[i].cssRules || styles[i].rules;
      for (let j = 0; j < rules.length; j++) {
        const rule = rules[j];
        if (rule.media && rule.media.mediaText.includes('prefers-reduced-motion')) {
          hasReducedMotionRule = true;
          break;
        }
      }
    } catch (e) {
      // Cross-origin stylesheets may throw errors
      continue;
    }
  }
  
  return hasReducedMotionRule;
};

/**
 * Run all accessibility tests
 * @returns {Object} Complete test results
 */
export const runAllAccessibilityTests = () => {
  console.log('🔍 Running accessibility tests...\n');
  
  const touchTargets = testTouchTargets();
  console.log(`✓ Touch Targets: ${touchTargets.length === 0 ? 'PASS' : 'FAIL'}`);
  if (touchTargets.length > 0) {
    console.log('  Failed elements:', touchTargets);
  }
  
  const colorContrast = testColorContrast();
  console.log(`✓ Color Contrast: ${colorContrast.length === 0 ? 'PASS' : 'FAIL'}`);
  if (colorContrast.length > 0) {
    console.log('  Failed elements:', colorContrast);
  }
  
  const ariaLabels = testAriaLabels();
  console.log(`✓ ARIA Labels: ${ariaLabels.length === 0 ? 'PASS' : 'FAIL'}`);
  if (ariaLabels.length > 0) {
    console.log('  Missing labels:', ariaLabels);
  }
  
  const keyboardNav = testKeyboardNavigation();
  console.log(`✓ Keyboard Navigation: ${keyboardNav.nonFocusable.length === 0 ? 'PASS' : 'FAIL'}`);
  console.log(`  Focusable elements: ${keyboardNav.focusable}/${keyboardNav.total}`);
  
  const reducedMotion = testReducedMotionSupport();
  console.log(`✓ Reduced Motion Support: ${reducedMotion ? 'PASS' : 'FAIL'}`);
  
  return {
    touchTargets,
    colorContrast,
    ariaLabels,
    keyboardNav,
    reducedMotion,
    passed: touchTargets.length === 0 && 
            colorContrast.length === 0 && 
            ariaLabels.length === 0 && 
            keyboardNav.nonFocusable.length === 0 && 
            reducedMotion
  };
};

// Helper functions

function getSelector(element) {
  if (element.id) return `#${element.id}`;
  if (element.className) return `${element.tagName.toLowerCase()}.${element.className.split(' ')[0]}`;
  return element.tagName.toLowerCase();
}

function getContrastRatio(color1, color2) {
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
  return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
}

// Export for use in console
if (typeof window !== 'undefined') {
  window.accessibilityTests = {
    testTouchTargets,
    testColorContrast,
    testAriaLabels,
    testKeyboardNavigation,
    testReducedMotionSupport,
    runAllAccessibilityTests
  };
}
