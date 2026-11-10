// Entry point: parses the deck, builds the stage and header, wires input.
import { next, previous, goTo } from './navigator.js';
import { parseHash, formatHash } from './hash.js';
import { createStore } from './store.js';
import { loadPrefs } from './prefs.js';
import { resolveKey } from './keys.js';
import { parseDeck } from './deck.js';
import { createStage } from './stage.js';
import { createHeader } from './header.js';

const SWIPE_MIN_PX = 50;
const CLICK_IGNORE = 'a, button, input, textarea, select, [data-draggable], ski-compose';

const stepCountsOf = (deck) => deck.slides.map((s) => s.stepEls.length);

// The one place actions change state. Only navigation actions exist so far.
export function dispatch(action, store, deck) {
  const counts = stepCountsOf(deck);
  const { slide, step } = store.get();
  let pos = null;
  switch (action) {
    case 'next': pos = next({ slide, step }, counts); break;
    case 'previous': pos = previous({ slide, step }, counts); break;
    case 'first': pos = goTo(0, counts); break;
    case 'last': pos = goTo(counts.length - 1, counts); break;
    default: return;
  }
  if (pos) store.set(pos);
}

function readStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function showEmpty(doc) {
  const msg = doc.createElement('p');
  msg.className = 'ski-empty';
  msg.textContent = 'This deck has no slides yet.';
  doc.body.appendChild(msg);
}

function wireInput(stage, store, deck) {
  stage.el.addEventListener('click', (e) => {
    if (e.target instanceof Element && e.target.closest(CLICK_IGNORE)) return;
    dispatch('next', store, deck);
  });

  let start = null;
  stage.el.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    start = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  stage.el.addEventListener('touchend', (e) => {
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    start = null;
    if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy)) {
      dispatch(dx < 0 ? 'next' : 'previous', store, deck);
    }
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    const action = resolveKey(e);
    if (!action) return;
    if (['next', 'previous', 'first', 'last'].includes(action)) e.preventDefault();
    dispatch(action, store, deck);
  });
}

function wireHash(store, deck) {
  const counts = stepCountsOf(deck);
  store.subscribe((state, prev) => {
    if (state.slide !== prev.slide) location.hash = formatHash(state.slide);
  });
  window.addEventListener('hashchange', () => {
    const { view, slide } = parseHash(location.hash);
    if (view !== 'deck') return;
    const pos = goTo(slide ?? 0, counts);
    if (pos && pos.slide !== store.get().slide) store.set(pos);
  });
}

export function boot(doc) {
  doc.documentElement.classList.add('ski-on');
  const deck = parseDeck(doc);
  if (deck.slides.length === 0) {
    showEmpty(doc);
    return;
  }

  const storage = readStorage();
  const prefs = storage
    ? loadPrefs(storage, { theme: deck.theme, textScale: 1 })
    : { theme: deck.theme, textScale: 1 };
  const initial = goTo(parseHash(location.hash).slide ?? 0, stepCountsOf(deck));
  const store = createStore({ ...initial, theme: prefs.theme, textScale: prefs.textScale, overlay: null });

  const stage = createStage(deck, store);
  const header = createHeader(deck, store);
  store.subscribe((state, prev) => {
    stage.render(state, prev);
    header.render(state);
  });

  wireInput(stage, store, deck);
  wireHash(store, deck);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => boot(document));
  } else {
    boot(document);
  }
}
