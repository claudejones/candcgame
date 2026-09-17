# Current Status

Last updated: 2026-09-17

## Production baseline
Phase 6 is complete and user-verified. Phase 7 establishes the production authoring architecture before Phase 8 landscape regeneration.

Active shared runtime remains `src/index.html`, `src/css/game.css`, `src/js/game-config.js`, `src/js/game-runtime.js`, with semantic assets under `assets/`.

Phase 7 development modules include mode shell, Asset Navigator, isolated/local design draft, Contextual Inspector, Landscape Editor, Hazard/Atlas Editor, Character Editor, Runtime Monitor and focused Test controls. Production remains `src/game.html` with production bootstrap only.

## Migration status
- Phase 0–6: COMPLETE / user verified where applicable
- Phase 7A coordinate and viewport contract: COMPLETE
- Phase 7B canonical configuration schema: COMPLETE / CI accepted
- Phase 7C modular application shell/bootstrap split: COMPLETE / CI accepted
- Phase 7D Design Asset Navigator: COMPLETE / CI accepted
- Phase 7E Contextual Inspector framework: COMPLETE / CI accepted (run #78)
- Phase 7F Landscape editor: COMPLETE / CI accepted (run #98)
- Phase 7G Hazard/atlas editor: COMPLETE / CI accepted (run #122)
- Phase 7H Character editor: COMPLETE / CI accepted (run #122)
- Phase 7I Runtime Monitor: COMPLETE / CI accepted (run #122)
- Phase 7J Test mode: IMPLEMENTED / combined 7J-7K CI acceptance pending
- Phase 7K Game mode: IMPLEMENTED / combined 7J-7K CI acceptance pending

## Coordinate/config authority
Canonical logical viewport: `960 x 540`. Canonical production ground surface: `GROUND_SURFACE_Y = 410`. Canonical asset vocabulary: `SOURCE REGION -> FINE CROP -> SCALE -> POSITION -> GAMEPLAY ANCHOR -> COLLISION`.

Legacy stage `seamY` and landscape offsets remain compatibility/calibration evidence only and are not canonical gameplay-coordinate authority.

## Design persistence and export
All Design-mode saves persist only to browser `localStorage` under `cc-world-design-config-v1`. No Design save writes to Git or production configuration. Stage authoring uses SAVE STAGE; global character authoring uses SAVE CHARACTER. Valid locally saved canonical drafts are restored on reload.

Design supports EXPORT STAGE and EXPORT GAME CONFIG. Full-game export contains schema version, coordinate contract, global character authoring values and all current stage drafts, including current unsaved values.

## Phase 7G-7I accepted block
Production CI run #122 completed successfully against `f9fb15e1b0437639d25bea66fb67d2b0dd736496`. Hazard/atlas editing, character editing and Runtime Monitor therefore pass the combined structural/schema/parity checkpoint.

## Phase 7J Test mode
Development TEST mode now exposes only focused validation controls around the shared runtime: stage, character, Run, Reset, Unlimited Lives, collision bounds and ground guide. It does not expose Design authoring controls. It uses the same iframe renderer/configuration rather than a second gameplay implementation.

## Phase 7K Game mode
Development GAME view remains a clean shared-renderer view with development authoring/test panels hidden. The separate production entry remains `src/game.html`, whose production bootstrap declares GAME as its only mode. Production CI explicitly rejects development/Test module references from `src/game.html` and the production bootstrap.

## Known deferred calibration/content work
- landscape FAR/MID/GROUND geometry/alignment regeneration
- final character grounding/positioning after landscape correction
- hazard visual size/position calibration after landscape correction
- hazard/player collision hitbox calibration after landscape correction
- historical Slide 0.75s versus production-spec 0.70s reconciliation
- cold first-load optimization / staged asset loading

## Next production step
After the combined 7J-7K CI/regression checkpoint passes, complete 7L persistence/finalization + 7M regression/CI/deployment as the final Phase 7 block.

Do not begin Phase 8 landscape regeneration until Phase 7 is accepted.

## Guardrails
- `archive/` and `assets-original/` remain immutable.
- Approved character/hazard/shared assets are not regenerated, resized, normalized, or replaced for convenience.
- Structural changes preserve user-approved Phase 6 behavior unless a separate explicit decision changes gameplay.
- Legacy Phase 6 calibration values remain evidence until replacement assets are authored.
- G1D is Slide, not Duck.
