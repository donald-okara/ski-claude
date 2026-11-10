// The 1920x1080 canvas. Moves the slides into it, scales it to the viewport,
// shows exactly one slide and reveals steps.
import { fitScale } from './layout.js';

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

  function render(state) {
    deck.slides.forEach((slide, i) => {
      slide.el.classList.toggle('ski-active', i === state.slide);
    });
    const active = deck.slides[state.slide];
    if (!active) return;
    active.stepEls.forEach((stepEl, i) => {
      stepEl.classList.toggle('ski-step-pending', i >= state.step);
    });
  }

  render(store.get());
  return { el, render };
}
