// Parses a Document into a Deck. Pure DOM reading, apart from assigning ids
// to sections that lack one.

export const TRANSITIONS = ['horizontal', 'vertical', 'fade', 'none'];
const THEMES = ['light', 'dark'];

function readSettings(doc) {
  const block = doc.getElementById('ski-deck');
  if (!block) {
    console.warn('ski: no #ski-deck settings block found; using defaults.');
    return {};
  }
  try {
    const parsed = JSON.parse(block.textContent);
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  } catch {
    // fall through to the warning below
  }
  console.warn('ski: the #ski-deck settings block is not valid JSON; using defaults.');
  return {};
}

function labelFor(el, index) {
  const explicit = el.getAttribute('data-label');
  if (explicit) return explicit;
  const heading = el.querySelector('h1, h2, h3');
  const text = heading ? heading.textContent.trim() : '';
  return text || `Slide ${index + 1}`;
}

export function parseDeck(doc) {
  const settings = readSettings(doc);
  const transition = TRANSITIONS.includes(settings.transition) ? settings.transition : 'horizontal';
  const sessionMinutes = typeof settings.sessionMinutes === 'number'
    && Number.isFinite(settings.sessionMinutes) && settings.sessionMinutes > 0
    ? settings.sessionMinutes : 30;

  const slides = [];
  let section = '';
  for (const el of Array.from(doc.body.children)) {
    if (el.tagName !== 'SECTION') continue;
    const index = slides.length;
    if (!el.id) el.id = `slide-${index + 1}`;
    section = el.getAttribute('data-section') ?? section;
    const own = el.getAttribute('data-transition');
    slides.push({
      id: el.id,
      label: labelFor(el, index),
      section,
      transition: TRANSITIONS.includes(own) ? own : transition,
      stepEls: Array.from(el.querySelectorAll('[data-step]')),
      el,
    });
  }

  return {
    title: typeof settings.title === 'string' ? settings.title : doc.title,
    sessionMinutes,
    transition,
    theme: THEMES.includes(settings.theme) ? settings.theme : 'light',
    slides,
  };
}
