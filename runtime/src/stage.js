// The 1920x1080 canvas. Moves the slides into it, scales it to the viewport,
// shows exactly one slide and reveals steps.
import { fitScale } from './layout.js';
import { runTransition } from './transitions.js';

export function createStage(deck, store) {
  const doc = document;
  const el = doc.createElement('div');
  el.className = 'ski-stage';
  for (const slide of deck.slides) el.appendChild(slide.el);
  doc.body.appendChild(el);

  function rescale() {
    el.style.setProperty('--ski-scale', String(fitScale(window.innerWidth, window.innerHeight)));
  }
  window.addEventListener('resize', rescale);
  rescale();

  let running = null;

  // The kind to play for a slide change: jumps always fade; stepping forward
  // uses the destination's kind, stepping back the kind of the slide left.
  function kindFor(state, prev) {
    if (state.jump) return 'fade';
    const forward = state.slide > prev.slide;
    return (forward ? deck.slides[state.slide] : deck.slides[prev.slide]).transition;
  }

  function render(state, prev) {
    const changed = prev && prev.slide !== state.slide;
    if (changed && running) running.finish();
    deck.slides.forEach((slide, i) => {
      slide.el.classList.toggle('ski-active', i === state.slide);
    });
    const active = deck.slides[state.slide];
    if (!active) return;
    if (changed) {
      running = runTransition(
        deck.slides[prev.slide].el, active.el, kindFor(state, prev), state.slide > prev.slide ? 1 : -1,
      );
    }
    active.stepEls.forEach((stepEl, i) => {
      stepEl.classList.toggle('ski-step-pending', i >= state.step);
    });
  }

  render(store.get());
  return { el, render };
}
