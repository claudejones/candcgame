# Phase 7C — Modular Application Shell / Bootstrap Split

Status: IMPLEMENTED — CI ACCEPTANCE PENDING

## Purpose
Establish an explicit application boundary so the development/QA experience can host DESIGN / TEST / GAME modes while the production entry imports no Design/Test modules.

## Dependency rule
The dependency direction is one-way:

- production bootstrap -> production runtime host only
- development bootstrap -> production runtime host + development/QA modules
- development/QA modules must never be imported by the production bootstrap or production entry

The production bootstrap must not import `src/js/dev/**`, `src/css/mode-shell.css`, authoring inspectors, runtime monitor, test controls, or config export tooling.

## 7C files
- `src/game.html` — production GAME entry
- `src/dev.html` — development/QA entry
- `src/js/bootstrap/production-bootstrap.js`
- `src/js/bootstrap/development-bootstrap.js`
- `src/js/dev/mode-shell.js`
- `src/css/mode-shell.css`

`production-bootstrap.js` exposes GAME only. `development-bootstrap.js` owns development mode state and permits DESIGN / TEST / GAME. `mode-shell.js` is development-only and provides the visible selector with `PHASE 7C • QA`.

## Shared-renderer rule
`src/index.html` remains the preserved Phase 6 shared runtime host during this migration gate. `src/dev.html` mounts that host once and changes DESIGN / TEST / GAME as shell state; switching modes does not recreate or duplicate the renderer/configuration instance. `src/game.html` mounts the same runtime host through the production bootstrap.

This host boundary is transitional. Later Phase 7 gates progressively move QA/authoring responsibilities out of the legacy runtime host. Phase 7K is still responsible for the final consumer-facing GAME shell and final package verification. 7C does not claim that legacy QA markup inside the preserved Phase 6 runtime has already been removed.

## Migration safety
The Phase 6 `src/index.html`, `game-runtime.js`, gameplay constants, assets and calibration remain unchanged by 7C. The new entries wrap the known-good renderer instead of copying its rendering/gameplay implementation.

## 7C acceptance checks
1. Development entry selects DESIGN / TEST / GAME through one shell state owner.
2. All development modes retain one mounted shared renderer/configuration instance.
3. Production entry exposes GAME only.
4. Production entry/bootstrap contains no dependency on `src/js/dev/**`, `development-bootstrap.js`, or `mode-shell`.
5. Existing Phase 6 gameplay constants and visual calibration remain unchanged.
6. Visible development build identifier reads `PHASE 7C • QA`.
7. Production CI enforces the production/development dependency boundary and syntax checks both bootstraps and the development shell.

## Packaging consequence
The final game package can omit the entire development/QA module tree rather than merely hiding Design/Test UI with CSS. Final package pruning and removal of remaining legacy QA responsibilities from the consumer game are completed at the later Game-mode/package gates, not by weakening the 7C dependency boundary.
