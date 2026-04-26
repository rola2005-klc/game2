const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

(function testViewportSupportsMobilePhones() {
  assert(html.includes('name="viewport"'));
  assert(html.includes('width=device-width'));
})();

(function testMobileLayoutPrioritizesBoardAndTouchTargets() {
  assert(css.includes('100dvh'), 'mobile page should use dynamic viewport height');
  assert(css.includes('touch-action: manipulation'), 'gems should avoid double-tap zoom delay');
  assert(css.includes('width: min(100%, 430px)'), 'board should never overflow phone width');
  assert(css.includes('grid-template-columns: repeat(8, 1fr)'), 'cells should scale inside the board');
  assert(css.includes('@media (max-width: 700px)'), 'explicit phone breakpoint required');
})();

(function testCuteMotionAndReducedMotionFallbackExist() {
  assert(css.includes('@keyframes floaty'), 'cute floating decoration animation missing');
  assert(css.includes('@keyframes sparkle'), 'match sparkle animation missing');
  assert(css.includes('prefers-reduced-motion'), 'reduced motion fallback missing');
})();

(function testMobileFriendlyFeedbackHooksExist() {
  assert(app.includes('navigator.vibrate'), 'tap/match haptic feedback missing');
  assert(app.includes('comboText'), 'combo text feedback missing');
})();

console.log('Mobile UI tests passed');
