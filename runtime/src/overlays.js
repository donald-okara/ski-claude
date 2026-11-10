// The shortcut guide and the go-to prompt. Only one is open at a time;
// state.overlay is 'shortcuts', 'goto' or null.
import { BINDINGS } from './keys.js';
import { goTo } from './navigator.js';

const KEY_GLYPHS = { ArrowRight: '→', ArrowLeft: '←', ArrowUp: '↑', ArrowDown: '↓', ' ': 'Space' };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function buildShortcuts() {
  const panel = el('div', 'ski-shortcuts');
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Keyboard shortcuts');
  panel.appendChild(el('h2', 'ski-overlay-title', 'Keyboard shortcuts'));
  for (const { keys, label } of BINDINGS) {
    const row = el('div', 'ski-shortcut');
    const keyCell = el('span', 'ski-shortcut-keys');
    for (const key of keys) keyCell.appendChild(el('kbd', '', KEY_GLYPHS[key] ?? key));
    row.append(keyCell, el('span', 'ski-shortcut-label', label));
    panel.appendChild(row);
  }
  return panel;
}

export function createOverlays(deck, store) {
  const shortcuts = buildShortcuts();

  const goto = el('div', 'ski-goto');
  goto.hidden = true;
  goto.setAttribute('role', 'dialog');
  goto.setAttribute('aria-label', 'Go to slide');
  const input = el('input');
  input.type = 'text';
  input.inputMode = 'numeric';
  input.autocomplete = 'off';
  input.placeholder = `Slide 1–${deck.slides.length}`;
  input.setAttribute('aria-label', 'Slide number');
  goto.append(el('label', 'ski-overlay-title', 'Go to slide'), input);

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const text = input.value.trim();
    if (!/^\d+$/.test(text)) return;
    const pos = goTo(Number(text) - 1, deck.slides.map((s) => s.stepEls.length));
    if (pos) store.set({ ...pos, jump: true, overlay: null });
  });

  document.body.append(shortcuts, goto);

  let openName = null;
  function render(state) {
    const name = state.overlay;
    shortcuts.hidden = name !== 'shortcuts';
    goto.hidden = name !== 'goto';
    if (name === openName) return;
    openName = name;
    if (name === 'goto') {
      input.value = '';
      input.focus();
    } else {
      input.blur();
    }
  }

  render(store.get());
  return { render };
}
