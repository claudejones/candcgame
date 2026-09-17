# Current Status

Last updated: 2026-09-17

## Production baseline
Phase 6 is complete and user-verified. Phase 7 establishes the production authoring architecture before Phase 8 landscape regeneration.

Active shared Phase 6 runtime source:
- `src/index.html`
- `src/css/game.css`
- `src/js/game-config.js`
- `src/js/game-runtime.js`
- external semantic assets under `assets/`

Phase 7 application entries:
- `src/game.html` — production GAME entry
- `src/dev.html` — development/QA DESIGN / TEST / GAME entry
- `src/js/bootstrap/production-bootstrap.js`
- `src/js/bootstrap/development-bootstrap.js`
- `src/js/dev/mode-shell.js`
- `src/js/config-schema.js`

Phase 7 architecture authority:
- `docs/PHASE7A_COORDINATE_AUDIT.md`
- `docs/PHASE7B_CANONICAL_CONFIG_SCHEMA.md`
- `docs/PHASE7C_BOOTSTRAP_IMPLEMENTATION.md`
- `docs/WORLD_RENDERING_SPEC.md`
- `docs/PHASE7_AUTHORING_ARCHITECTURE_EXECUTION_SPEC.md`

The historical LAB25Q harness remains preserved unchanged under `archive/LAB25Q/` as behavioral/provenance evidence. It is not an active runtime dependency. `assets-original/` remains immutable.

## Migration status
- Phase 0 inventory: COMPLETE
- Phase 1 HTML/CSS/JS extraction: COMPLETE / user verified
- Phase 2 semantic asset mapping: COMPLETE
- Phase 3 asset classification: COMPLETE
- Phase 4 external asset migration: COMPLETE / user verified across all 9 current stages
- Phase 5 configuration extraction: COMPLETE / user verified
- Phase 6 production naming/cleanup: COMPLETE / user verified
- Phase 7A coordinate and viewport contract: COMPLETE
- Phase 7B canonical configuration schema: COMPLETE / CI accepted
- Phase 7C modular application shell/bootstrap split: IMPLEMENTED / CI acceptance pending
- Phase 7D Design Asset Navigator: NEXT after 7C CI acceptance

Production source contains no Base64/data-image assets. Historical migration evidence remains in `archive/` and Git history.

## Phase 7A coordinate authority
Canonical logical viewport: `960 x 540`.
Canonical production ground surface: `GROUND_SURFACE_Y = 410`.
This is the exact 2x mapping of the recovered 480x270 / Y=205 production composition. Browser/device scaling is presentation-only.

Legacy stage `seamY` and landscape offsets remain calibration evidence only. They are not canonical gameplay-coordinate authority.

## Phase 7B configuration architecture
`src/js/config-schema.js` defines and validates the Phase 7B compatibility/canonical view without mutating the live Phase 6 `GAME_CONFIG` or renderer.

The schema separates authored production configuration, legacy Phase 6 compatibility calibration, transient runtime state, and development/QA state. Canonical asset vocabulary is `SOURCE REGION -> FINE CROP -> SCALE -> POSITION -> GAMEPLAY ANCHOR -> COLLISION`.

All canonical character, hazard and finish gameplay anchors resolve from Y=410. Legacy seams/surfaces remain explicitly representable so the nine existing stages can still be regression-tested without artwork changes while later Phase 7 gates migrate the renderer/application shell.

## Phase 7C application boundary
`src/game.html` is the production entry and loads the production bootstrap only. `src/dev.html` is the development/QA entry and loads the development bootstrap plus the development-only mode shell.

Both entries mount the same preserved `src/index.html` runtime host, so 7C does not duplicate renderer/configuration logic. Development mode switching changes shell state without recreating the mounted runtime. Production CI now asserts that the production entry/bootstrap cannot reference the development bootstrap, `src/js/dev/**`, or the mode shell.

This is a transitional host boundary. Legacy QA responsibilities still present inside the preserved Phase 6 runtime are progressively extracted by later Phase 7 gates; final consumer GAME shell/package pruning remains a Phase 7K/7M responsibility.

## Known deferred calibration/content work
- landscape FAR/MID/GROUND geometry/alignment regeneration
- final character grounding/positioning after landscape correction
- hazard visual size/position calibration after landscape correction
- hazard/player collision hitbox calibration after landscape correction
- historical LAB25Q Slide 0.75s versus production-spec 0.70s reconciliation
- cold first-load optimization / staged asset loading

## Next production step
After 7C CI acceptance, proceed to Phase 7D: implement the Design Asset Navigator while keeping selected authoring asset state independent from gameplay/runtime state.

Do not begin Phase 8 landscape regeneration until Phase 7 is accepted.

## Guardrails
- `archive/` and `assets-original/` remain immutable.
- Approved character/hazard/shared assets are not regenerated, resized, normalized, or replaced for convenience.
- Structural changes preserve the user-approved Phase 6 behavior unless a separate explicit decision changes gameplay.
- Legacy Phase 6 calibration values remain evidence until replacement assets are authored.
- G1D is Slide, not Duck.
