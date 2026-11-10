# ski-claude: implementation plan 1 (spike + runtime core)

Nov 10, 2026 · @Donald

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove or rule out Compose Wasm inside a Claude artifact, and ship a presentable ski-claude deck with navigation, steps, header, transitions, theme, text size and a shortcut guide.

**Architecture:** A deck is one `index.html` with a `<section>` per slide. A dependency-free JavaScript runtime, bundled to `ski/ski.js` and `ski/ski.css`, reads those sections and takes over layout and input. All behavior flows through one state store; pure modules hold the logic and thin DOM modules render it.

**Tech stack:** Vanilla JavaScript ES modules, esbuild for the bundle, Node 20+ with `node:test` for unit tests, Playwright for browser tests. Kotlin and Compose Multiplatform appear only in the spike, using the existing [Ski](https://github.com/donald-okara/ski) repo.

**Spec:** [ski-claude: design spec](https://claude.ai/artifact/EQXDYbQSQ5WuvkJfsj5oQd). Task 2 commits a copy to `docs/spec.md`.

**How the spec splits into plans.** Each plan ends with software that works on its own.

| Plan | Covers | Spec milestones |
| --- | --- | --- |
| 1 (this one) | Compose spike, runtime core, sample deck | 1, 2 |
| 2 | Table of contents, notes panel, flashcards, presenter view, timer, sync | 3, 4 |
| 3 | Focusable, draggable box, whiteboard, code viewer | 5, 6 |
| 4 | Compose islands and device mockups, only if the spike passes | 7 |
| 5 | The skill, README, first release | 8 |

**Assumptions made for the spec's open questions.** Say so if any is wrong.

- The code lives in a new standalone repo named `ski-claude`.
- Ski's text-size keys are `Ctrl`/`Cmd` with `+`, `-`, `0`, which a browser reserves for page zoom. ski-claude uses plain `+`, `-`, `0`.
- New keys Ski has no binding for: `G` go-to, `Home` and `End` first and last slide.
- Fullscreen is a header button only in this plan. Ski has no fullscreen key and `F` is taken by flashcards.

## Global constraints

Every task's requirements include these.

- The slide canvas is fixed at 1920×1080 and scaled to fit the viewport.
- The built runtime is exactly two files, `ski/ski.js` and `ski/ski.css`, loaded by relative path.
- The runtime makes no network requests and loads nothing from a CDN.
- The runtime has no dependency on `compose/`. A deck without that folder is complete.
- With the runtime absent, a deck still reads as a document: every section visible, in order.
- Never call `alert`, `confirm`, `prompt`, `window.open`, `window.print`, or start a download.
- Every storage read and write sits in `try`/`catch`. The deck works fully when storage is unavailable.
- The URL hash takes only two forms: `#slide-N` (N counts from 1) and `#presenter`.
- Fullscreen is requested only inside a click handler, and a refusal is caught.
- Keys follow Ski's table: `→` `Space` `Enter` next; `←` `Backspace` previous; `D` theme; `C` shortcut guide; `Esc` dismiss all overlays.
- Keys reserved for later plans do nothing yet: `T`, `F`, `W`, `H`, `↑`, `↓`, `[`, `]`.
- Transitions are `horizontal` (default), `fade`, `vertical`, `none`.
- Node 20 or later. No runtime npm dependencies. Dev dependencies are `esbuild` and `@playwright/test` only.

## Review focus

The spec is silent on these five conditions, and each is likely to bite someone presenting. Each has a test in the task named.

| Condition | Expected behavior | Pinned in |
| --- | --- | --- |
| Typing in an input, textarea, editable element or a Compose demo | Keys go to that element and never navigate; `Esc` still dismisses | Task 5 |
| Arrow keys pressed faster than a transition finishes | Deck ends on the right slide with exactly one slide showing | Task 7 |
| Storage throws or returns garbage | Deck boots with default theme and text size, no error | Task 4 |
| Hash is out of range or malformed (`#slide-999`, `#slide-0`, `#slide-abc`) | Out of range opens the last slide; malformed opens the first | Tasks 3, 6 |
| Deck has no slides, or a slide has no `id` or `data-label` | Empty deck shows "This deck has no slides yet."; missing values get fallbacks | Task 6 |

## File structure

Pure modules hold logic and are unit-tested in Node. DOM modules render and are tested in a browser.

```
package.json
playwright.config.js
runtime/
  build.mjs               esbuild: src -> dist/ski/ski.js + ski.css, copied into examples
  src/
    navigator.js          pure: next / previous / goTo position math
    hash.js               pure: parse and format the URL hash
    layout.js             pure: fitScale
    store.js              state container with subscribe
    prefs.js              pure: load / save theme and text scale, storage-safe
    keys.js               pure: BINDINGS table, key event -> action name
    deck.js               DOM: reads settings and <section>s into a Deck
    stage.js              DOM: shows the active slide, applies steps, scales the canvas
    transitions.js        DOM: animates between two slides
    header.js             DOM: label, section, position, fullscreen button
    overlays.js           DOM: shortcut guide and go-to input
    theme.js              DOM: applies theme and text scale to <html>
    index.js              boot: builds the store, wires every module
    ski.css               layout, theme tokens, transitions
  test/                   node:test files, one per pure module
  e2e/
    serve.mjs             static file server for Playwright
    core.spec.js          boot, navigation, steps, header, hash
    transitions.spec.js
    overlays.spec.js      theme, text size, shortcut guide, go-to
examples/
  basic/index.html        five-slide sample deck
  empty/index.html        deck with no slides
docs/
  spec.md  plan-1.md  spike-compose.md  artifact-check.md
spike/                    throwaway; never imported by runtime/
```

## Task 1: Compose spike

This task produces an answer, not kept code. Everything it builds stays under `spike/` and is labeled throwaway. It does not block Tasks 2 to 9.

**Files:**

- Create: `spike/` (a clone of Ski plus one added Kotlin file and one HTML page)
- Create: `docs/spike-compose.md`

**Interfaces:**

- Consumes: the Ski repo at `https://github.com/donald-okara/ski`, its `webApp` module and `gradle/libs.versions.toml`.
- Produces: `docs/spike-compose.md` with a yes / no and evidence for each of the six spike questions, and a one-line verdict. Plan 4 reads only that file.

Steps:

- [ ] **Step 1: Try the build where this session runs.** Clone Ski into `spike/ski`. Run `java -version`, then `./gradlew :webApp:wasmJsBrowserDistribution`. Record the JDK version and whether Gradle resolved its dependencies. If it fails on network access, record the exact error and repeat this step on Donald's machine. This answers question 6.
- [ ] **Step 2: Measure the bundle.** Find the distribution output under `webApp/build/dist/`. List every file with its size, and the total. Flag any file over 20 MiB or a total over 64 MiB. This answers the size half of question 5.
- [ ] **Step 3: Publish Ski's own web build as an artifact.** Publish the distribution folder unchanged as an artifact titled "ski-claude spike (throwaway)", with its HTML page as `index.html`. Open it in the Claude desktop app and in a browser tab. Record whether the deck draws, the time from open to first frame, and every console error verbatim. A content-security-policy error mentioning WebAssembly is the expected failure. This answers questions 1 and 5.
- [ ] **Step 4: Check input.** In the published artifact, press `→`, `←`, `D` and `T`, and click a button inside a demo slide. Record which inputs reached the deck. This answers question 2.
- [ ] **Step 5: Add mount and unmount.** In `spike/ski/webApp`, add `SpikeMain.kt` exporting `mount(elementId: String)` and `unmount(elementId: String)` to JavaScript. `mount` attaches a Compose viewport showing one animated composable to that element; `unmount` disposes it. Add `spike.html` with two 600×400 containers and buttons: Mount A, Unmount A, Mount B, Unmount B, Resize A to 900×600. Rebuild and publish over the same artifact.
- [ ] **Step 6: Check lifecycle and resize.** Run Mount A then Unmount A ten times. Pass means no console errors and no canvas left in container A afterwards. Then Mount A, Resize A; pass means the composable fills 900×600 without stretching. This answers questions 3 and 4.
- [ ] **Step 7: Write `docs/spike-compose.md`.** One table: question, yes / no, evidence. Then the verdict line: "Compose islands: go" if questions 1 to 4 are all yes, otherwise "Compose islands: no-go" with the failing question.
- [ ] **Step 8: Commit and report.**

```bash
git add docs/spike-compose.md
git commit -m "docs: record Compose-in-artifact spike result"
```

`spike/` is in `.gitignore`. Tell Donald the verdict and ask whether to delete the throwaway artifact.

## Task 2: Project scaffold and navigator

**Files:**

- Create: `package.json`, `.gitignore`, `docs/spec.md`, `docs/plan-1.md`
- Create: `runtime/src/navigator.js`
- Test: `runtime/test/navigator.test.js`

**Interfaces:**

- Consumes: nothing.
- Produces:

```js
// pos: { slide: number, step: number }   both count from 0
// stepCounts: number[]                   reveal steps per slide
next(pos, stepCounts)      // -> pos
previous(pos, stepCounts)  // -> pos
goTo(index, stepCounts)    // -> pos | null
```

Steps:

- [ ] **Step 1: Scaffold.** `git init`. Write `package.json` with `"type": "module"`, `"engines": { "node": ">=20" }` and `"scripts": { "test": "node --test runtime/test" }`. `.gitignore` lists `node_modules`, `dist`, `spike`, `test-results`. Copy the spec and this plan into `docs/`.
- [ ] **Step 2: Write the failing tests** in `runtime/test/navigator.test.js`:

```js
const counts = [0, 2, 0];

test('next reveals steps before leaving the slide', () => {
  assert.deepEqual(next({ slide: 1, step: 0 }, counts), { slide: 1, step: 1 });
  assert.deepEqual(next({ slide: 1, step: 2 }, counts), { slide: 2, step: 0 });
});
test('next stops at the last slide', () => {
  assert.deepEqual(next({ slide: 2, step: 0 }, counts), { slide: 2, step: 0 });
});
test('previous rewinds steps, then lands fully revealed', () => {
  assert.deepEqual(previous({ slide: 1, step: 2 }, counts), { slide: 1, step: 1 });
  assert.deepEqual(previous({ slide: 2, step: 0 }, counts), { slide: 1, step: 2 });
});
test('previous stops at the first slide', () => {
  assert.deepEqual(previous({ slide: 0, step: 0 }, counts), { slide: 0, step: 0 });
});
test('goTo clamps to the deck and resets the step', () => {
  assert.deepEqual(goTo(1, counts), { slide: 1, step: 0 });
  assert.deepEqual(goTo(99, counts), { slide: 2, step: 0 });
  assert.deepEqual(goTo(-5, counts), { slide: 0, step: 0 });
});
test('goTo rejects non-integers', () => {
  assert.equal(goTo(NaN, counts), null);
  assert.equal(goTo(1.5, counts), null);
});
test('an empty deck never moves', () => {
  assert.deepEqual(next({ slide: 0, step: 0 }, []), { slide: 0, step: 0 });
  assert.equal(goTo(0, []), null);
});
```

- [ ] **Step 3: Run** `npm test`. Expected: FAIL, `next` is not defined.
- [ ] **Step 4: Implement** the three functions in `runtime/src/navigator.js`. They return new objects and never mutate `pos`.
- [ ] **Step 5: Run** `npm test`. Expected: 7 passing.
- [ ] **Step 6: Commit.**

```bash
git add package.json .gitignore docs runtime
git commit -m "feat: scaffold project and add navigator"
```

## Task 3: Hash routing and canvas scaling

**Files:**

- Create: `runtime/src/hash.js`, `runtime/src/layout.js`
- Test: `runtime/test/hash.test.js`, `runtime/test/layout.test.js`

**Interfaces:**

- Consumes: nothing.
- Produces:

```js
parseHash(hash)   // string -> { view: 'deck' | 'presenter', slide: number | null }  slide counts from 0
formatHash(slide) // number (from 0) -> '#slide-N' (N from 1)
fitScale(viewportW, viewportH, canvasW = 1920, canvasH = 1080) // -> number
```

`parseHash` does not know the deck length. Callers pass its `slide` through `goTo`, which clamps.

Steps:

- [ ] **Step 1: Write the failing tests.**

```js
test('parseHash reads a slide link', () => {
  assert.deepEqual(parseHash('#slide-7'), { view: 'deck', slide: 6 });
  assert.deepEqual(parseHash('#slide-999'), { view: 'deck', slide: 998 });
});
test('parseHash reads the presenter view', () => {
  assert.deepEqual(parseHash('#presenter'), { view: 'presenter', slide: null });
});
test('parseHash ignores anything else', () => {
  for (const h of ['', '#', '#slide-0', '#slide-abc', '#slide--3', '#slide-2.5', '#settings']) {
    assert.deepEqual(parseHash(h), { view: 'deck', slide: null });
  }
});
test('formatHash counts from 1', () => {
  assert.equal(formatHash(0), '#slide-1');
  assert.equal(formatHash(6), '#slide-7');
});

test('fitScale fits the tighter dimension', () => {
  assert.equal(fitScale(1920, 1080), 1);
  assert.equal(fitScale(960, 1080), 0.5);
  assert.equal(fitScale(3840, 1080), 1);
  assert.equal(fitScale(0, 0), 0);
});
```

- [ ] **Step 2: Run** `npm test`. Expected: FAIL, `parseHash` is not defined.
- [ ] **Step 3: Implement** `parseHash` and `formatHash` in `hash.js`, `fitScale` in `layout.js`.
- [ ] **Step 4: Run** `npm test`. Expected: all passing.
- [ ] **Step 5: Commit.**

```bash
git add runtime
git commit -m "feat: add hash routing and canvas scale math"
```

## Task 4: State store and preferences

**Files:**

- Create: `runtime/src/store.js`, `runtime/src/prefs.js`
- Test: `runtime/test/store.test.js`, `runtime/test/prefs.test.js`

**Interfaces:**

- Consumes: nothing.
- Produces:

```js
// State = { slide, step, theme: 'light' | 'dark', textScale: number,
//           overlay: null | 'shortcuts' | 'goto' }
createStore(initial) // -> { get(), set(patch), subscribe(fn) }
//   set(patch): shallow-merges; calls each fn(state, prev) once, only if a value changed
//   subscribe(fn): returns an unsubscribe function

PREFS_KEY = 'ski:prefs'
TEXT_SCALE = { min: 0.7, max: 1.6, step: 0.1, initial: 1 }
loadPrefs(storage, defaults)  // -> { theme, textScale }
savePrefs(storage, prefs)     // -> void, never throws
stepTextScale(scale, dir)     // dir 1 bigger, -1 smaller, 0 reset -> number, one decimal
```

`storage` is anything with `getItem` and `setItem`, so tests pass a fake and the runtime passes `localStorage`.

Steps:

- [ ] **Step 1: Write the failing tests.**

```js
test('set merges and notifies once with state and prev', () => {
  const store = createStore({ slide: 0, step: 0 });
  const calls = [];
  store.subscribe((s, p) => calls.push([s.slide, p.slide]));
  store.set({ slide: 2 });
  assert.deepEqual(store.get(), { slide: 2, step: 0 });
  assert.deepEqual(calls, [[2, 0]]);
});
test('set with unchanged values does not notify', () => {
  const store = createStore({ slide: 0 });
  let n = 0; store.subscribe(() => n++);
  store.set({ slide: 0 });
  assert.equal(n, 0);
});
test('unsubscribe stops notifications', () => {
  const store = createStore({ slide: 0 });
  let n = 0; const off = store.subscribe(() => n++);
  off(); store.set({ slide: 1 });
  assert.equal(n, 0);
});

const defaults = { theme: 'light', textScale: 1 };
const fake = (value) => ({ getItem: () => value, setItem: () => {} });
const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };

test('loadPrefs reads saved values', () => {
  assert.deepEqual(loadPrefs(fake('{"theme":"dark","textScale":1.3}'), defaults), { theme: 'dark', textScale: 1.3 });
});
test('loadPrefs falls back when storage throws, is empty or holds garbage', () => {
  assert.deepEqual(loadPrefs(broken, defaults), defaults);
  assert.deepEqual(loadPrefs(fake(null), defaults), defaults);
  assert.deepEqual(loadPrefs(fake('not json'), defaults), defaults);
  assert.deepEqual(loadPrefs(fake('{"theme":"pink","textScale":9}'), defaults), defaults);
});
test('savePrefs never throws', () => {
  assert.doesNotThrow(() => savePrefs(broken, defaults));
});
test('stepTextScale steps, clamps and resets', () => {
  assert.equal(stepTextScale(1, 1), 1.1);
  assert.equal(stepTextScale(1.6, 1), 1.6);
  assert.equal(stepTextScale(0.7, -1), 0.7);
  assert.equal(stepTextScale(1.3, 0), 1);
  assert.equal(stepTextScale(1.1, 1), 1.2); // no 1.2000000000000002
});
```

- [ ] **Step 2: Run** `npm test`. Expected: FAIL, `createStore` is not defined.
- [ ] **Step 3: Implement** `store.js` and `prefs.js`. `loadPrefs` validates each field on its own: an invalid theme falls back while a valid text scale is kept.
- [ ] **Step 4: Run** `npm test`. Expected: all passing.
- [ ] **Step 5: Commit.**

```bash
git add runtime
git commit -m "feat: add state store and storage-safe preferences"
```

## Task 5: Key resolver

**Files:**

- Create: `runtime/src/keys.js`
- Test: `runtime/test/keys.test.js`

**Interfaces:**

- Consumes: nothing.
- Produces:

```js
// Action = 'next' | 'previous' | 'first' | 'last' | 'goto' | 'theme'
//        | 'textBigger' | 'textSmaller' | 'textReset' | 'shortcuts' | 'dismiss'
BINDINGS   // [{ keys: string[], action: Action, label: string }]  also drives the shortcut guide
resolveKey(event) // { key, ctrlKey, metaKey, altKey, target } -> Action | null
```

`BINDINGS`, exactly:

| Keys (`event.key`) | Action | Label |
| --- | --- | --- |
| `ArrowRight`, space, `Enter`, `PageDown` | `next` | Next |
| `ArrowLeft`, `Backspace`, `PageUp` | `previous` | Previous |
| `Home` | `first` | First slide |
| `End` | `last` | Last slide |
| `g` | `goto` | Go to slide |
| `d` | `theme` | Light / dark |
| `+`, `=` | `textBigger` | Bigger text |
| `-` | `textSmaller` | Smaller text |
| `0` | `textReset` | Reset text size |
| `c` | `shortcuts` | Shortcut guide |
| `Escape` | `dismiss` | Close overlays |

Rules:

- Letter keys match in either case.
- With `ctrlKey`, `metaKey` or `altKey` held, return `null`, so browser shortcuts such as page zoom are left alone.
- When `target` is an `input`, `textarea`, `select`, an element with `isContentEditable`, or inside a `ski-compose` element, return `null` for everything except `Escape`.
- A `target` without `closest` (the `document` itself) counts as not editable.

Steps:

- [ ] **Step 1: Write the failing tests.**

```js
const body = { tagName: 'BODY', isContentEditable: false, closest: () => null };
const key = (k, extra = {}) => ({ key: k, ctrlKey: false, metaKey: false, altKey: false, target: body, ...extra });

test('every binding resolves to its action', () => {
  for (const b of BINDINGS) for (const k of b.keys) assert.equal(resolveKey(key(k)), b.action);
});
test('letters match in either case', () => {
  assert.equal(resolveKey(key('D')), 'theme');
  assert.equal(resolveKey(key('G')), 'goto');
});
test('modifier keys pass through to the browser', () => {
  assert.equal(resolveKey(key('+', { ctrlKey: true })), null);
  assert.equal(resolveKey(key('0', { metaKey: true })), null);
  assert.equal(resolveKey(key('ArrowRight', { altKey: true })), null);
});
test('reserved and unknown keys do nothing', () => {
  for (const k of ['t', 'f', 'w', 'h', 'ArrowUp', 'ArrowDown', '[', ']', 'x']) assert.equal(resolveKey(key(k)), null);
});
test('typing never navigates, but Escape still dismisses', () => {
  const input = { tagName: 'INPUT', isContentEditable: false, closest: () => null };
  const editable = { tagName: 'DIV', isContentEditable: true, closest: () => null };
  const inDemo = { tagName: 'CANVAS', isContentEditable: false, closest: (s) => (s === 'ski-compose' ? {} : null) };
  for (const target of [input, editable, inDemo]) {
    assert.equal(resolveKey(key(' ', { target })), null);
    assert.equal(resolveKey(key('d', { target })), null);
    assert.equal(resolveKey(key('Escape', { target })), 'dismiss');
  }
});
test('a target without closest is treated as the page', () => {
  assert.equal(resolveKey(key('ArrowRight', { target: {} })), 'next');
});
```

- [ ] **Step 2: Run** `npm test`. Expected: FAIL, `BINDINGS` is not defined.
- [ ] **Step 3: Implement** `BINDINGS` and `resolveKey` in `keys.js`.
- [ ] **Step 4: Run** `npm test`. Expected: all passing.
- [ ] **Step 5: Commit.**

```bash
git add runtime
git commit -m "feat: add key bindings and resolver"
```

## Task 6: Deck parsing, boot, steps, header and the sample deck

This is the first task that runs in a browser. It ends with a deck you can page through, with no animation yet.

**Files:**

- Create: `runtime/src/deck.js`, `stage.js`, `header.js`, `index.js`, `ski.css`
- Create: `runtime/build.mjs`, `playwright.config.js`, `runtime/e2e/serve.mjs`
- Create: `examples/basic/index.html`, `examples/empty/index.html`
- Test: `runtime/e2e/core.spec.js`
- Modify: `package.json` (dev dependencies; scripts `build`, `e2e`)

**Interfaces:**

- Consumes: `next`, `previous`, `goTo` (Task 2); `parseHash`, `formatHash`, `fitScale` (Task 3); `createStore`, `loadPrefs` (Task 4); `resolveKey` (Task 5).
- Produces:

```js
parseDeck(doc) // Document -> Deck
// Deck  = { title, sessionMinutes, transition, theme, slides: Slide[] }
// Slide = { id, label, section, transition, stepEls: Element[], el: HTMLElement }
createStage(deck, store)  // -> { render(state, prev) }
createHeader(deck, store) // -> { render(state) }
boot(doc)                 // wires everything; index.js calls it on DOMContentLoaded
dispatch(action, store, deck) // Action -> void; the one place actions change state
```

DOM contract, which later tasks and plans rely on:

| Selector | Meaning |
| --- | --- |
| `html.ski-on` | Set by `boot`. All runtime CSS is scoped under it |
| `.ski-stage` | The 1920×1080 canvas wrapper, scaled with `transform: scale()` and centered |
| `section.ski-active` | The one slide showing |
| `.ski-step-pending` | A `[data-step]` element not yet revealed (`visibility: hidden`, keeps its space) |
| `.ski-header` | Header bar |
| `.ski-header-label`, `.ski-header-position` | "Section · Label" and "2 / 5" |
| `.ski-fullscreen` | Fullscreen button |
| `.ski-empty` | The empty-deck message |

Parsing rules:

- Settings come from `<script type="application/json" id="ski-deck">`. Keys and defaults: `title` (the document title), `sessionMinutes` (30), `transition` (`horizontal`), `theme` (`light`). Missing block or invalid JSON means all defaults and one `console.warn`.
- Slides are the `<section>` children of `<body>`, in order.
- `id`: the section's own, else `slide-N` is assigned to the element.
- `label`: `data-label`, else the text of the first `h1`, `h2` or `h3`, else `Slide N`.
- `section`: `data-section`, else the previous slide's section, else an empty string.
- `transition`: `data-transition` if it is one of the four kinds, else the deck's.
- `stepEls`: the `[data-step]` descendants in document order.

Behavior:

- `boot` reads the hash once. A `slide` value goes through `goTo`, so `#slide-999` opens the last slide. The `presenter` view is ignored until plan 2.
- When the slide changes, set `location.hash` to `formatHash(slide)`. On `hashchange`, navigate to the parsed slide if it differs.
- A click on the stage dispatches `next`, unless the click landed in an `a`, `button`, `input`, `textarea`, `select`, `[data-draggable]` or `ski-compose`.
- A horizontal swipe over 50 px dispatches `next` (leftward) or `previous` (rightward).
- The stage rescales on window `resize`.
- `<aside>` elements are hidden under `html.ski-on`.
- A deck with no slides shows `.ski-empty` reading "This deck has no slides yet." and binds no keys.
- Without `ski-on`, `ski.css` styles nothing, so the page is a plain document.

Sample decks:

- `examples/basic/index.html` has five slides with these ids, in order: `cover` (`data-section="Intro"`, label from its `h1` "ski-claude"), `steps` (`data-label="Steps"`, two `data-step` paragraphs), `fade` (`data-section="Transitions"`, `data-label="Fade"`, `data-transition="fade"`), `vertical` (`data-label="Vertical"`, `data-transition="vertical"`), `none` (`data-label="None"`, `data-transition="none"`). Each has an `<aside>` note. `cover` contains one `<input>` for the typing test.
- `examples/empty/index.html` has the settings block and no sections.
- Both load `ski/ski.css` and `ski/ski.js` by relative path.

Steps:

- [ ] **Step 1: Build and serve.** `npm install -D esbuild @playwright/test` and `npx playwright install chromium`. `runtime/build.mjs` bundles `runtime/src/index.js` to `dist/ski/ski.js` as a minified IIFE with a banner `/* ski-claude <version from package.json> */`, copies `ski.css` beside it, then copies `dist/ski/` into every `examples/*/`. `serve.mjs` serves the repo root on port 4173. `playwright.config.js` sets `webServer` to `npm run build && node runtime/e2e/serve.mjs`, `baseURL` to `http://localhost:4173`, viewport 1920×1080. Scripts: `"build": "node runtime/build.mjs"`, `"e2e": "playwright test"`.
- [ ] **Step 2: Write the two sample decks** as specified above.
- [ ] **Step 3: Write the failing browser tests** in `runtime/e2e/core.spec.js`. Each test collects console errors and asserts there are none.

```js
test('opens on the first slide', async ({ page }) => {
  await page.goto('/examples/basic/');
  await expect(page.locator('section.ski-active')).toHaveId('cover');
  await expect(page.locator('.ski-header-label')).toHaveText('Intro · ski-claude');
  await expect(page.locator('.ski-header-position')).toHaveText('1 / 5');
  await expect(page.locator('aside').first()).toBeHidden();
});
test('reveals steps before advancing, and rewinds them', async ({ page }) => {
  await page.goto('/examples/basic/#slide-2');
  await expect(page.locator('#steps .ski-step-pending')).toHaveCount(2);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#steps .ski-step-pending')).toHaveCount(1);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('section.ski-active')).toHaveId('fade');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('section.ski-active')).toHaveId('steps');
  await expect(page.locator('#steps .ski-step-pending')).toHaveCount(0);
});
test('section carries forward to later slides', async ({ page }) => {
  await page.goto('/examples/basic/#slide-4');
  await expect(page.locator('.ski-header-label')).toHaveText('Transitions · Vertical');
});
test('hash follows the slide and deep links work', async ({ page }) => {
  await page.goto('/examples/basic/');
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#slide-2$/);
  await page.goto('/examples/basic/#slide-999');
  await expect(page.locator('section.ski-active')).toHaveId('none');
  await page.goto('/examples/basic/#slide-abc');
  await expect(page.locator('section.ski-active')).toHaveId('cover');
});
test('Home and End jump to the ends', async ({ page }) => {
  await page.goto('/examples/basic/');
  await page.keyboard.press('End');
  await expect(page.locator('.ski-header-position')).toHaveText('5 / 5');
  await page.keyboard.press('Home');
  await expect(page.locator('.ski-header-position')).toHaveText('1 / 5');
});
test('typing in an input does not navigate', async ({ page }) => {
  await page.goto('/examples/basic/');
  await page.locator('#cover input').click();
  await page.keyboard.type('a d');
  await expect(page.locator('section.ski-active')).toHaveId('cover');
});
test('stage scales to the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 540 });
  await page.goto('/examples/basic/');
  const scale = await page.locator('.ski-stage').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  expect(scale).toBeCloseTo(0.5, 2);
});
test('empty deck shows a message', async ({ page }) => {
  await page.goto('/examples/empty/');
  await expect(page.locator('.ski-empty')).toHaveText('This deck has no slides yet.');
  await page.keyboard.press('ArrowRight');
});
test('without the runtime the deck is a readable document', async ({ page }) => {
  await page.route('**/ski/ski.js', (route) => route.abort());
  await page.goto('/examples/basic/');
  for (const id of ['cover', 'steps', 'fade', 'vertical', 'none']) await expect(page.locator('#' + id)).toBeVisible();
});
```

- [ ] **Step 4: Run** `npm run e2e`. Expected: FAIL, no `section.ski-active`.
- [ ] **Step 5: Implement** `deck.js`, `stage.js`, `header.js`, `index.js` and `ski.css` to the contract above. The stage switches slides instantly in this task.
- [ ] **Step 6: Run** `npm test && npm run e2e`. Expected: all passing.
- [ ] **Step 7: Commit.**

```bash
git add package.json package-lock.json playwright.config.js runtime examples
git commit -m "feat: boot a deck with navigation, steps and header"
```

## Task 7: Transitions

**Files:**

- Create: `runtime/src/transitions.js`
- Modify: `runtime/src/stage.js` (call `runTransition` on slide change), `runtime/src/ski.css`
- Test: `runtime/e2e/transitions.spec.js`

**Interfaces:**

- Consumes: `Slide.transition`, `section.ski-active` (Task 6).
- Produces:

```js
TRANSITION_MS = 300
runTransition(fromEl, toEl, kind, direction) // kind: one of the four; direction: 1 forward, -1 back
// -> { finish() }   finish() jumps to the end state immediately; safe to call twice
```

Rules:

- Going forward, the kind is the destination slide's. Going back, it is the kind of the slide being left, played in reverse.
- `horizontal` moves both slides along X by one canvas width; `vertical` does the same along Y; `fade` cross-fades; `none` swaps instantly.
- While a transition runs, the two slides carry `ski-leaving` and `ski-entering`. When it ends, neither class remains and only the destination has `ski-active`.
- A navigation that arrives mid-transition calls `finish()` on the running one, then starts its own.
- Under `prefers-reduced-motion: reduce`, every kind behaves as `none`.
- A jump from go-to, `Home`, `End` or a hash change uses `fade`, whatever the slides declare.

Steps:

- [ ] **Step 1: Write the failing tests.**

```js
const settled = async (page, id) => {
  await expect(page.locator('section.ski-active')).toHaveCount(1);
  await expect(page.locator('section.ski-active')).toHaveId(id);
  await expect(page.locator('.ski-entering, .ski-leaving')).toHaveCount(0);
};

test('forward uses the destination kind and settles', async ({ page }) => {
  await page.goto('/examples/basic/#slide-2');
  await settled(page, 'steps');
  await page.goto('/examples/basic/#slide-3');
  await page.keyboard.press('ArrowRight');   // fade -> vertical
  await expect(page.locator('#vertical')).toHaveClass(/ski-entering/);
  await settled(page, 'vertical');
});
test('rapid presses end on the right slide', async ({ page }) => {
  await page.goto('/examples/basic/#slide-3');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await settled(page, 'none');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await settled(page, 'fade');
});
test('none swaps without transition classes', async ({ page }) => {
  await page.goto('/examples/basic/#slide-4');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.ski-entering, .ski-leaving')).toHaveCount(0);
  await settled(page, 'none');
});
test('reduced motion disables every transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/examples/basic/#slide-3');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.ski-entering, .ski-leaving')).toHaveCount(0);
  await settled(page, 'vertical');
});
```

- [ ] **Step 2: Run** `npm run e2e`. Expected: the first test fails, `#vertical` never has `ski-entering`.
- [ ] **Step 3: Implement** `runTransition` with CSS classes and a `transitionend` listener backed by a `TRANSITION_MS + 50` timeout, so a missed event cannot leave a slide stuck. Wire it into `stage.js`.
- [ ] **Step 4: Run** `npm test && npm run e2e`. Expected: all passing, including every Task 6 test.
- [ ] **Step 5: Commit.**

```bash
git add runtime
git commit -m "feat: add slide transitions"
```

## Task 8: Theme, text size, shortcut guide and go-to

**Files:**

- Create: `runtime/src/theme.js`, `runtime/src/overlays.js`
- Modify: `runtime/src/index.js` (`dispatch` handles the remaining actions; saves prefs on change), `runtime/src/header.js` (fullscreen button), `runtime/src/ski.css`
- Test: `runtime/e2e/overlays.spec.js`

**Interfaces:**

- Consumes: `State.theme`, `State.textScale`, `State.overlay`, `savePrefs`, `stepTextScale` (Task 4); `BINDINGS` (Task 5); `dispatch`, `goTo` (Tasks 2, 6).
- Produces:

```js
applyTheme(root, theme, textScale) // sets data-ski-theme and --ski-text-scale on <html>
createOverlays(deck, store)        // -> { render(state) }   draws the shortcut guide and go-to
```

DOM contract:

| Selector | Meaning |
| --- | --- |
| `html[data-ski-theme="light"]`, `[data-ski-theme="dark"]` | Current theme |
| `--ski-text-scale` on `html` | Multiplies every font size on the canvas |
| `.ski-shortcuts` | Shortcut guide; one `.ski-shortcut` row per `BINDINGS` entry, showing its keys and label |
| `.ski-goto`, `.ski-goto input` | Go-to overlay and its number input |

Theme tokens in `ski.css`, overridable by a deck's own stylesheet:

| Token | Light | Dark |
| --- | --- | --- |
| `--ski-bg` | `#FBFBF8` | `#141413` |
| `--ski-fg` | `#1A1A1A` | `#F2F1EC` |
| `--ski-muted` | `#6A7179` | `#9A9A93` |
| `--ski-accent` | `#2F6FED` | `#7AA7FF` |

Font tokens: `--ski-font-heading`, `--ski-font-body`, `--ski-font-mono`, each defaulting to a system font stack.

Behavior:

- Initial theme and text scale come from `loadPrefs(localStorage, { theme: deck.theme, textScale: 1 })`. Every change calls `savePrefs`.
- `theme` toggles light and dark. `textBigger`, `textSmaller`, `textReset` go through `stepTextScale`.
- `shortcuts` toggles the guide. `goto` opens the go-to overlay and focuses its input.
- In go-to, `Enter` with a whole number N navigates to slide N (clamped) and closes. Anything else leaves the overlay open and does nothing.
- `dismiss` closes whichever overlay is open. Only one overlay is open at a time.
- While an overlay is open, navigation actions are ignored.
- The fullscreen button calls `requestFullscreen` on `<html>` inside its click handler, catches a refusal, and toggles off with `exitFullscreen`.

Steps:

- [ ] **Step 1: Write the failing tests.**

```js
test('D toggles the theme and it survives a reload', async ({ page }) => {
  await page.goto('/examples/basic/');
  await expect(page.locator('html')).toHaveAttribute('data-ski-theme', 'light');
  await page.keyboard.press('d');
  await expect(page.locator('html')).toHaveAttribute('data-ski-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-ski-theme', 'dark');
});
test('text size steps, clamps and resets', async ({ page }) => {
  await page.goto('/examples/basic/');
  const scale = () => page.locator('html').evaluate((el) => el.style.getPropertyValue('--ski-text-scale').trim());
  for (let i = 0; i < 3; i++) await page.keyboard.press('+');
  expect(await scale()).toBe('1.3');
  for (let i = 0; i < 10; i++) await page.keyboard.press('+');
  expect(await scale()).toBe('1.6');
  await page.keyboard.press('0');
  expect(await scale()).toBe('1');
});
test('shortcut guide lists every binding and closes on Escape', async ({ page }) => {
  await page.goto('/examples/basic/');
  await page.keyboard.press('c');
  await expect(page.locator('.ski-shortcut')).toHaveCount(11);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('section.ski-active')).toHaveId('cover');
  await page.keyboard.press('Escape');
  await expect(page.locator('.ski-shortcuts')).toBeHidden();
});
test('go-to jumps to a slide', async ({ page }) => {
  await page.goto('/examples/basic/');
  await page.keyboard.press('g');
  await page.keyboard.type('4');
  await page.keyboard.press('Enter');
  await expect(page.locator('section.ski-active')).toHaveId('vertical');
  await expect(page.locator('.ski-goto')).toBeHidden();
});
test('go-to ignores junk and typing there triggers no shortcuts', async ({ page }) => {
  await page.goto('/examples/basic/');
  await page.keyboard.press('g');
  await page.keyboard.type('d');
  await page.keyboard.press('Enter');
  await expect(page.locator('.ski-goto')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-ski-theme', 'light');
  await expect(page.locator('section.ski-active')).toHaveId('cover');
});
test('deck boots with defaults when storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied'); } });
  });
  await page.goto('/examples/basic/');
  await expect(page.locator('html')).toHaveAttribute('data-ski-theme', 'light');
  await page.keyboard.press('d');
  await expect(page.locator('html')).toHaveAttribute('data-ski-theme', 'dark');
});
```

- [ ] **Step 2: Run** `npm run e2e`. Expected: FAIL, `data-ski-theme` is missing.
- [ ] **Step 3: Implement** `theme.js` and `overlays.js`, extend `dispatch`, add the fullscreen button. Reading `window.localStorage` itself goes inside the `try`, since the property access can throw.
- [ ] **Step 4: Run** `npm test && npm run e2e`. Expected: all passing.
- [ ] **Step 5: Commit.**

```bash
git add runtime
git commit -m "feat: add theme, text size, shortcut guide and go-to"
```

## Task 9: Publish the sample deck and run the artifact check

The artifact sandbox cannot be reproduced locally, so this task checks the built deck where it will really run.

**Files:**

- Create: `docs/artifact-check.md`, `README.md`

**Interfaces:**

- Consumes: `examples/basic/` after `npm run build`, which holds `index.html`, `ski/ski.js` and `ski/ski.css`.
- Produces: a published sample deck, and `docs/artifact-check.md`, which plans 2 to 5 read for known sandbox limits.

Steps:

- [ ] **Step 1: Build.** Run `npm test && npm run e2e && npm run build`. Expected: all passing, and `examples/basic/ski/ski.js` exists.
- [ ] **Step 2: Publish.** Publish the three files as a new artifact titled "ski-claude sample deck", keeping the paths `index.html`, `ski/ski.js`, `ski/ski.css`.
- [ ] **Step 3: Run the checklist** twice: in the Claude desktop app with the deck beside the chat, and on the artifact's own page in a browser. Record pass or fail for each line in `docs/artifact-check.md`, with the console error for any failure.
  1. The deck opens on slide 1 with the header showing "1 / 5".
  2. Every key in `BINDINGS` does its action. List any key that never reaches the page.
  3. Clicking the stage advances; clicking the input on the cover does not.
  4. The link ending `#slide-3` opens the Fade slide.
  5. Resizing the panel or window rescales the stage with no clipping.
  6. The theme chosen with `D` survives a reload.
  7. The fullscreen button enters and leaves fullscreen, or fails without an error.
  8. No network request leaves the artifact's own origin.
- [ ] **Step 4: File follow-ups.** For each failed line, add a line under "Known limits" in `docs/artifact-check.md` saying what the runtime should do instead. Fix anything that is a runtime bug and rerun Step 1. A key the host application swallows is a limit, not a bug: note it for the skill's documentation in plan 5.
- [ ] **Step 5: Write `README.md`**: what ski-claude is in two sentences, the slide markup table from the spec, `npm test`, `npm run e2e`, `npm run build`, and a link to the published sample.
- [ ] **Step 6: Commit and tag.**

```bash
git add docs README.md
git commit -m "docs: record artifact check and add README"
git tag v0.1.0
```
