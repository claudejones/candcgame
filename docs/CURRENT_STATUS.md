# Current Status

Last updated: 2026-09-17

## Production baseline
Phase 6 is complete and user-verified. Phase 7 production authoring architecture is implemented through 7M; final CI/deployment acceptance is pending.

Active shared runtime remains `src/index.html`, `src/css/game.css`, `src/js/game-config.js`, `src/js/game-runtime.js`, with semantic assets under `assets/`. Production remains `src/game.html` with production bootstrap only.

## Migration status
- Phase 0–6: COMPLETE / user verified where applicable
- Phase 7A coordinate and viewport contract: COMPLETE
- Phase 7B canonical configuration schema: COMPLETE / CI accepted
- Phase 7C modular application shell/bootstrap split: COMPLETE / CI accepted
- Phase 7D Design Asset Navigator: COMPLETE / CI accepted
- Phase 7E Contextual Inspector: COMPLETE / CI accepted (run #78)
- Phase 7F Landscape editor: COMPLETE / CI accepted (run #98)
- Phase 7G Hazard/atlas editor: COMPLETE / CI accepted (run #122)
- Phase 7H Character editor: COMPLETE / CI accepted (run #122)
- Phase 7I Runtime Monitor: COMPLETE / CI accepted (run #122)
- Phase 7J Test mode: COMPLETE / CI accepted (run #134)
- Phase 7K Game mode: COMPLETE / CI accepted (run #134)
- Phase 7L persistence/import/export finalization: IMPLEMENTED
- Phase 7M final regression/CI/deployment: acceptance correction implemented; CI/deployment/user acceptance pending

Latest Phase 7 acceptance correction adds Design-mode hazard/character guide toggles, clamps Fine Crop inputs to non-negative values, locks paused animated-hazard previews to the explicitly selected frame, adds an enlarged live cropped-frame preview, and makes the animated-preview controls respond before their frame refresh can replace the clicked button. This correction does not alter approved assets, collision geometry or gameplay constants.

## Coordinate/config authority
Canonical logical viewport: `960 x 540`. Canonical production ground surface: `GROUND_SURFACE_Y = 410`. Canonical asset vocabulary: `SOURCE REGION -> FINE CROP -> SCALE -> POSITION -> GAMEPLAY ANCHOR -> COLLISION`.

Legacy stage `seamY` and landscape offsets remain compatibility/calibration evidence only and are not canonical gameplay-coordinate authority.

## Design persistence / portability
All Design saves remain browser-local only under `cc-world-design-config-v1`; browser authoring never writes Git or production source. SAVE STAGE and SAVE CHARACTER remain scoped actions, and SAVE ALL LOCAL persists the complete current authoring draft.

EXPORT STAGE remains available. EXPORT GAME CONFIG creates the complete portable canonical authoring payload. IMPORT GAME CONFIG validates schema version, 960x540 viewport, ground Y=410, all nine current stages and canonical schema invariants before replacing and persisting the local draft. Invalid/incompatible imports are rejected rather than partially applied.

## Mode architecture
DESIGN contains authoring tools. TEST exposes focused stage/character/run/reset/unlimited-lives/collision/ground-guide validation controls. Development GAME hides Design/Test authoring panels around the same renderer. Production `src/game.html` has GAME as its only mode and cannot reference development modules under CI guards.

## Final Phase 7 regression guard
Production CI checks the production/development dependency boundary, syntax for every runtime/dev module, no Base64 runtime assets, canonical 960x540/Y410 authority, all nine stage compatibility mappings, hazard counts, non-negative crop, Gaudí bench source-region baseline, approved Constance Slide crop and preserved Phase 6 gameplay constants (Slide .75, recovery 1.10, invulnerability 2.00, flying 68/18, maxVisible 2, reactionLead 2.20, characterX 220, worldSpeed 120).

## Known deferred calibration/content work
- Phase 8 landscape FAR/MID/GROUND regeneration against the universal production contract
- final character grounding after each corrected landscape
- hazard visual size/position after each corrected landscape
- collision/hitbox calibration after each corrected landscape
- historical Slide 0.75s versus production-spec 0.70s reconciliation
- cold first-load optimization / staged asset loading

## Next production step
Wait for the final 7L-7M CI checkpoint. If successful, verify deployment and user-test the completed Phase 7 Design/Test/Game architecture. Phase 8 landscape regeneration begins only after that acceptance.

## Guardrails
- `archive/` and `assets-original/` remain immutable.
- Approved character/hazard/shared assets are not regenerated, resized, normalized, or replaced for convenience.
- Structural changes preserve user-approved Phase 6 behavior unless a separate explicit decision changes gameplay.
- Legacy Phase 6 calibration values remain evidence until replacement assets are authored.
- G1D is Slide, not Duck.
