# Phase 7C — Modular Application Shell / Bootstrap Split

Status: IN PROGRESS

## Purpose
Establish an explicit application boundary so the development/QA experience can host DESIGN / TEST / GAME modes while the eventual packaged production game imports only production-safe code.

## Dependency rule
The dependency direction is one-way:

- production bootstrap -> production core only
- development bootstrap -> production core + development/QA modules
- development/QA modules must never be imported by the production bootstrap

The production bootstrap must not import `src/js/dev/**`, `src/css/mode-shell.css`, authoring inspectors, runtime monitor, test controls, or config export tooling.

## Files introduced in first 7C increment
- `src/js/bootstrap/production-bootstrap.js`
- `src/js/bootstrap/development-bootstrap.js`
- `src/js/dev/mode-shell.js`
- `src/css/mode-shell.css`

`production-bootstrap.js` exposes GAME only. `development-bootstrap.js` owns the development mode state and permits DESIGN / TEST / GAME. `mode-shell.js` is explicitly development-only and provides the visible mode selector with the `PHASE 7C • QA` identifier.

## Shared-renderer rule
Mode switching is shell state, not a second renderer. DESIGN, TEST and GAME must wrap the same game canvas/renderer/configuration. No mode may fork or copy world-rendering logic.

## Migration safety
The current Phase 6 `src/index.html` and `game-runtime.js` remain untouched during the first bootstrap-boundary increment. This avoids introducing a presentation/gameplay regression while the new dependency boundary is established.

The next 7C increment wires a development entry point to the development bootstrap and mode shell, then establishes a production entry point. Production acceptance is not complete until that entry runs without importing development/QA modules.

## 7C acceptance checks
1. Development entry can select DESIGN / TEST / GAME.
2. All modes use the same renderer/configuration instance.
3. Production entry exposes GAME only.
4. Production dependency graph contains no `src/js/dev/**` or other Design/Test modules.
5. Existing Phase 6 gameplay constants and visual calibration are unchanged.
6. Visible development build identifier reads `PHASE 7C • QA`.
7. CI enforces the production/development dependency boundary.

## Packaging consequence
The final game package can omit the entire development/QA module tree rather than merely hiding its UI with CSS. This is the required lightweight production-build behavior.
