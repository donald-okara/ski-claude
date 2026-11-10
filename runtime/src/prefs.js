// Viewer preferences (theme, text size) live in memory only: they last for the
// open page, so each deck and each session starts from the deck's own defaults.

export const TEXT_SCALE = { min: 0.7, max: 1.6, step: 0.1, initial: 1 };

export function stepTextScale(scale, dir) {
  if (dir === 0) return TEXT_SCALE.initial;
  const next = Math.round((scale + dir * TEXT_SCALE.step) * 10) / 10;
  return Math.min(TEXT_SCALE.max, Math.max(TEXT_SCALE.min, next));
}
