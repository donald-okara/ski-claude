# ski-claude

ski-claude is a dependency-free JavaScript runtime that turns a plain HTML file into a slide deck. It is built to run inside Claude artifacts, and the same file stays a readable document when the runtime is absent.

Version 0.1.0. The plan for this release is in [docs/plan-1.md](docs/plan-1.md).

Sample deck: https://claude.ai/artifact/RXyhS9BzRFPMP1a2m65Bek (private to the repo owner until shared).

## Slide markup

A deck is an HTML file with one top-level `<section>` per slide, `ski/ski.css` in the head and `ski/ski.js` at the end of the body. See `examples/basic/index.html`.

| Markup | Effect |
| --- | --- |
| `<section>` (direct child of `<body>`) | One slide. A slide with no `id` gets `slide-N`, where N is its position. |
| `data-label="Name"` | Name shown for the slide. Without it, the first `h1`, `h2` or `h3` text is used, then `Slide N`. |
| `data-section="Name"` | Starts a section. It applies to this slide and the ones after it until the next `data-section`. |
| `data-transition="fade"` | Transition into this slide: `horizontal`, `vertical`, `fade` or `none`. Overrides the deck default. |
| `data-step` | On an element inside a slide. Steps are revealed one per forward key press. |
| `<aside>` | Speaker note. Hidden while presenting. |

Links to `#slide-3` (slide number) and `#<slide id>` (for example `#vertical`) both open that slide; the runtime itself writes `#slide-N` as you move. A malformed `#slide-...` opens the first slide, and any other hash (an unknown anchor, `#presenter`) leaves the current slide alone.

### Deck settings

An optional JSON block sets deck-wide values:

```html
<script type="application/json" id="ski-deck">
  { "title": "My deck", "sessionMinutes": 10, "transition": "fade", "theme": "dark" }
</script>
```

- `title`: deck title. Defaults to the page title.
- `sessionMinutes`: positive number, default 30.
- `transition`: default transition, one of `horizontal` (default), `vertical`, `fade`, `none`.
- `theme`: `light` (default) or `dark`. This is the deck's starting theme.

Theme and text size are never saved. Changing them with `D`, `+`, `-` or `0` lasts until the page is reloaded, and each deck starts from its own settings. The notes panel is always dark, whatever the slide theme.

The block is optional: a deck without it works with the defaults and logs one console warning. Invalid JSON also logs a warning and falls back to the defaults.

## Keys

| Key | Action |
| --- | --- |
| Right arrow, Space, Enter, Page Down | Next |
| Left arrow, Backspace, Page Up | Previous |
| Home / End | First / last slide |
| G | Go to slide |
| D | Switch light and dark theme |
| + or = / - / 0 | Bigger text / smaller text / reset text size |
| C | Shortcut guide |
| Escape | Close overlays |

Keys are ignored while typing in an input, textarea, select or editable element. Keys combined with Ctrl, Cmd or Alt are not handled.

## Theme tokens

The runtime defines CSS custom properties on `html.ski-on` at zero specificity, so a deck stylesheet overrides them with a plain `:root` rule:

```css
:root { --ski-accent: rgb(255, 0, 0); --ski-font-body: Georgia, serif; }
```

Tokens: `--ski-font-heading`, `--ski-font-body`, `--ski-font-mono`, and for each theme `--ski-bg`, `--ski-fg`, `--ski-muted`, `--ski-accent`. `--ski-text-scale` is not overridable by a deck: the runtime sets it inline and it is controlled with `+`, `-` and `0`. `examples/tokens/index.html` is a working example.

## Commands

```
npm test           # unit tests
npm run e2e        # Playwright browser tests
npm run build      # bundle to dist/ski/ and copy it into every examples/*/ski/
```

`npm run e2e` needs a local Chromium. Install it once with `npx playwright install chromium`.

Current state: 27 unit tests and 29 end-to-end tests pass. The bundle is `ski/ski.js` 10,434 bytes and `ski/ski.css` 5,507 bytes.

## Artifact check

The deck has not yet been checked inside Claude's artifact sandbox. See [docs/artifact-check.md](docs/artifact-check.md). The Compose spike is only partly answered: see [docs/spike-compose.md](docs/spike-compose.md).

## Not yet built

- Table of contents
- Notes panel
- Presenter view
- Focusable spotlight, draggable box and whiteboard overlays (the shortcut guide and go-to overlays are built)
- Code viewer
- Compose demos
