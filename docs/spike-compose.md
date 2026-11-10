# Compose spike (plan 1, Task 1)

Status: deferred. On 2026-11-10 the owner chose to show Compose as pre-rendered captures (images and clips from a Gradle build) instead of live Wasm, so nothing in v1 waits on this spike. It stays here for a later, optional live-island extra.

Partial result. Question 6 is answered. Questions 1 to 5 need a Wasm production build of Ski, made on the owner's machine with `./gradlew :webApp:wasmJsBrowserDistribution` in https://github.com/donald-okara/ski.

The plan's Task 1 does not number the six questions, so the labels below are taken from the step that says which question it answers.

| # | Question | Answer | Evidence |
| --- | --- | --- | --- |
| 1 | Does Ski's own web build draw inside an artifact (no content-security-policy failure on WebAssembly)? | open | Needs the Wasm build. |
| 2 | Do `→`, `←`, `D`, `T` and clicks inside a demo slide reach the deck? | open | Needs the Wasm build. |
| 3 | Can a Compose viewport be mounted and unmounted ten times with no console errors and no canvas left behind? | open | Needs the Wasm build. |
| 4 | Does a mounted Compose viewport fill a resized container (900x600) without stretching? | open | Needs the Wasm build. |
| 5 | Is the bundle within limits (no file over 20 MiB, total under 64 MiB), and how long to first frame? | open | Needs the Wasm build. |
| 6 | Can the Gradle build run in Claude's cloud workspace? | No | JDK 21 and Gradle 8.14.3 are installed, but the workspace network refuses `repo.maven.apache.org`, `dl.google.com` and `plugins.gradle.org` (HTTP 403 from the egress proxy). Compose demos must be built on the user's own machine. |

Compose islands: deferred, optional (questions 1-5 open)
