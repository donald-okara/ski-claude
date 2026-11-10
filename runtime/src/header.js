// The header bar: "Section · Label" on the left, "2 / 5" on the right.

export function createHeader(deck, store) {
  const bar = document.createElement('header');
  bar.className = 'ski-header';
  const label = document.createElement('span');
  label.className = 'ski-header-label';
  const position = document.createElement('span');
  position.className = 'ski-header-position';
  bar.append(label, position);
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
