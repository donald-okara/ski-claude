// Applies the viewer's theme and text size to <html>.

export function applyTheme(root, theme, textScale) {
  root.setAttribute('data-ski-theme', theme);
  root.style.setProperty('--ski-text-scale', String(textScale));
}
