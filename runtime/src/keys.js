// Keyboard bindings and resolver. BINDINGS also drives the shortcut guide.
// Keys reserved for later plans (T, F, W, H, ArrowUp, ArrowDown, [, ]) do nothing yet.

export const BINDINGS = [
  { keys: ['ArrowRight', ' ', 'Enter', 'PageDown'], action: 'next', label: 'Next' },
  { keys: ['ArrowLeft', 'Backspace', 'PageUp'], action: 'previous', label: 'Previous' },
  { keys: ['Home'], action: 'first', label: 'First slide' },
  { keys: ['End'], action: 'last', label: 'Last slide' },
  { keys: ['g'], action: 'goto', label: 'Go to slide' },
  { keys: ['d'], action: 'theme', label: 'Light / dark' },
  { keys: ['+', '='], action: 'textBigger', label: 'Bigger text' },
  { keys: ['-'], action: 'textSmaller', label: 'Smaller text' },
  { keys: ['0'], action: 'textReset', label: 'Reset text size' },
  { keys: ['c'], action: 'shortcuts', label: 'Shortcut guide' },
  { keys: ['Escape'], action: 'dismiss', label: 'Close overlays' },
];

const ACTION_BY_KEY = new Map();
for (const { keys, action } of BINDINGS) for (const k of keys) ACTION_BY_KEY.set(k, action);

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isTyping(target) {
  if (!target || typeof target.closest !== 'function') return false;
  return EDITABLE_TAGS.has(target.tagName)
    || target.isContentEditable === true
    || target.closest('ski-compose') != null;
}

// Space and Enter activate these natively, so the deck leaves them alone.
const ACTIVATABLE = 'a[href], button, summary, [role="button"]';
const ACTIVATION_KEYS = new Set([' ', 'Enter']);

function isActivatable(target) {
  return target != null && typeof target.closest === 'function' && target.closest(ACTIVATABLE) != null;
}

export function resolveKey(event) {
  // Some browsers (autofill in Chrome) send keydown events with no key.
  if (typeof event.key !== 'string') return null;
  if (event.ctrlKey || event.metaKey || event.altKey) return null;
  if (ACTIVATION_KEYS.has(event.key) && isActivatable(event.target)) return null;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const action = ACTION_BY_KEY.get(key) ?? null;
  if (action !== 'dismiss' && isTyping(event.target)) return null;
  return action;
}
