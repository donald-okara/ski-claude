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
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // Refused or unsupported; the deck carries on windowed.
    }
  });
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
