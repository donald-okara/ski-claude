// Hash routing. parseHash does not know the deck length; callers clamp via goTo.

export function parseHash(hash) {
  if (hash === '#presenter') return { view: 'presenter', slide: null };
  const match = /^#slide-([1-9][0-9]*)$/.exec(hash);
  return { view: 'deck', slide: match ? Number(match[1]) - 1 : null };
}

export function formatHash(slide) {
  return `#slide-${slide + 1}`;
}
