// Persisted viewer preferences. Every storage access is guarded: storage may be
// missing, full or denied, and the deck must still work.

export const PREFS_KEY = 'ski:prefs';
export const TEXT_SCALE = { min: 0.7, max: 1.6, step: 0.1, initial: 1 };

const THEMES = ['light', 'dark'];

function validScale(value) {
  return typeof value === 'number' && Number.isFinite(value)
    && value >= TEXT_SCALE.min && value <= TEXT_SCALE.max;
}

export function loadPrefs(storage, defaults) {
  try {
    const raw = storage.getItem(PREFS_KEY);
    if (raw == null) return { ...defaults };
    const saved = JSON.parse(raw);
    if (saved === null || typeof saved !== 'object') return { ...defaults };
    return {
      theme: THEMES.includes(saved.theme) ? saved.theme : defaults.theme,
      textScale: validScale(saved.textScale) ? saved.textScale : defaults.textScale,
    };
  } catch {
    return { ...defaults };
  }
}

export function savePrefs(storage, prefs) {
  try {
    storage.setItem(PREFS_KEY, JSON.stringify({ theme: prefs.theme, textScale: prefs.textScale }));
  } catch {
    // Storage unavailable; preferences simply do not persist.
  }
}

export function stepTextScale(scale, dir) {
  if (dir === 0) return TEXT_SCALE.initial;
  const next = Math.round((scale + dir * TEXT_SCALE.step) * 10) / 10;
  return Math.min(TEXT_SCALE.max, Math.max(TEXT_SCALE.min, next));
}
