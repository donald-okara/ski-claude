// Slide transitions. Classes drive the animation (see ski.css); this module
// adds and removes them and guarantees the end state.
export const TRANSITION_MS = 300;

const KINDS = ['horizontal', 'fade', 'vertical', 'none'];
const NOOP = { finish() {} };

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// direction: 1 forward, -1 back. kind is the already-resolved kind to play.
export function runTransition(fromEl, toEl, kind, direction) {
  if (!KINDS.includes(kind) || kind === 'none' || prefersReducedMotion()) return NOOP;

  const classes = ['ski-t-' + kind];
  if (direction < 0) classes.push('ski-back');
  fromEl.classList.add('ski-leaving', ...classes);
  toEl.classList.add('ski-entering', ...classes);
  void toEl.offsetWidth; // commit the start pose before the end pose is applied
  fromEl.classList.add('ski-run');
  toEl.classList.add('ski-run');

  let done = false;
  let timer = 0;
  function finish() {
    if (done) return;
    done = true;
    clearTimeout(timer);
    toEl.removeEventListener('transitionend', onEnd);
    fromEl.classList.remove('ski-leaving', 'ski-run', ...classes);
    toEl.classList.remove('ski-entering', 'ski-run', ...classes);
  }
  function onEnd(e) {
    if (e.target === toEl) finish();
  }
  toEl.addEventListener('transitionend', onEnd);
  timer = setTimeout(finish, TRANSITION_MS + 50); // a missed event must not strand a slide
  return { finish };
}
