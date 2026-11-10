// The header bar: "Section · Label" on the left, "2 / 5" and the fullscreen button on the right.

export function createHeader(deck, store) {
  const bar = document.createElement('header');
  bar.className = 'ski-header';
  const label = document.createElement('span');
  label.className = 'ski-header-label';
  const position = document.createElement('span');
  position.className = 'ski-header-position';
  const fullscreen = document.createElement('button');
  fullscreen.type = 'button';
  fullscreen.className = 'ski-fullscreen';
  fullscreen.textContent = 'Fullscreen';
  fullscreen.setAttribute('aria-label', 'Toggle fullscreen');
  // Fullscreen may only be requested from a user gesture, and the browser may refuse.
  fullscreen.addEventListener('click', async () => {
    try {
      const change = document.fullscreenElement
        ? document.exitFullscreen()
        : document.documentElement.requestFullscreen();
      // Give focus back at once so a later Space advances the deck instead of re-toggling;
      // the request is already made, and the browser may take a while to settle it.
      fullscreen.blur();
      await change;
    } catch {
      // Refused or unsupported; the deck carries on windowed.
      fullscreen.blur();
    }
  });
  // Without fullscreen support (for example an iframe that disallows it) the button would do nothing.
  fullscreen.hidden = !document.fullscreenEnabled;
  bar.append(label, position, fullscreen);
  document.body.appendChild(bar);

  function render(state) {
    const slide = deck.slides[state.slide];
    if (!slide) return;
    label.textContent = slide.section ? `${slide.section} · ${slide.label}` : slide.label;
    position.textContent = `${state.slide + 1} / ${deck.slides.length}`;
  }

  render(store.get());
  return { render };
}
