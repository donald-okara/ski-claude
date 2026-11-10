# Artifact check

Sample deck: https://claude.ai/artifact/RXyhS9BzRFPMP1a2m65Bek ("ski-claude sample deck", files `index.html`, `ski/ski.js`, `ski/ski.css`). Private to the repo owner until shared.

Runtime version 0.1.0. Bundle sizes: `ski/ski.js` 10,007 bytes, `ski/ski.css` 5,507 bytes.

## Status

Not run in either environment. The check needs a browser signed in to claude.ai, and the automation browser available to the build session was not signed in. Fill in the table by hand or in a session with a signed-in browser. For each failure, record the console error.

## Checklist

| # | Check | Claude desktop app | Browser tab |
| --- | --- | --- | --- |
| 1 | The deck opens on slide 1 with the header showing "1 / 5". | not run | not run |
| 2 | Every key in `BINDINGS` does its action. List any key that never reaches the page. | not run | not run |
| 3 | Clicking the stage advances; clicking the input on the cover does not. | not run | not run |
| 4 | The link ending `#slide-3` opens the Fade slide. | not run | not run |
| 5 | Resizing the panel or window rescales the stage with no clipping. | not run | not run |
| 6 | The theme chosen with `D` survives a reload. | not run | not run |
| 7 | The fullscreen button enters and leaves fullscreen, or fails without an error. | not run | not run |
| 8 | No network request leaves the artifact's own origin. | not run | not run |

## Known limits

None recorded yet.
