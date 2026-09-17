# Current Status

Last updated: 2026-09-17

## Production baseline
Phase 6 is complete and user-verified. Phase 7 establishes the production authoring architecture before Phase 8 landscape regeneration.

Active shared runtime remains `src/index.html`, `src/css/game.css`, `src/js/game-config.js`, `src/js/game-runtime.js`, with semantic assets under `assets/`.

Phase 7 development modules now include mode shell, Asset Navigator, isolated/local design draft, Contextual Inspector, and Landscape Editor. Production remains `src/game.html` with production bootstrap only.

## Migration status
- Phase 0–6: COMPLETE / user verified where applicable
- Phase 7A coordinate and viewport contract: COMPLETE
- Phase 7B canonical configuration schema: COMPLETE / CI accepted
- Phase 7C modular application shell/bootstrap split: COMPLETE / CI accepted
- Phase 7D Design Asset Navigator: COMPLETE / CI accepted
- Phase 7E Contextual Inspector framework: COMPLETE / CI accepted (run #78)
- Phase 7F Landscape editor: IMPLEMENTED / CI acceptance pending
- Phase 7G Hazard editor: NEXT after 7F acceptance

## Coordinate/config authority
Canonical logical viewport: `960 x 540`. Canonical production ground surface: `GROUND_SURFACE_Y = 410`. Canonical asset vocabulary: `SOURCE REGION -> FINE CROP -> SCALE -> POSITION -> GAMEPLAY ANCHOR -> COLLISION`.

Legacy stage `seamY` and landscape offsets remain compatibility/calibration evidence only and are not canonical gameplay-coordinate authority.

## Design persistence and export
All Design-mode SAVE STAGE actions persist only to browser `localStorage` under `cc-world-design-config-v1`. No Design save writes to Git or production configuration. On reload, valid locally saved canonical stage drafts are restored over the compatibility defaults.

Design supports both EXPORT STAGE and EXPORT GAME CONFIG. Full-game export contains schema version, coordinate contract and all current stage drafts in one JSON artifact. Export is independent of local save and includes current unsaved draft values.

## Phase 7F Landscape Editor
`src/js/dev/landscape-editor.js` provides Design-only landscape visibility controls for FAR, CLOUDS, MID, GROUND and guides. Stage selection in the Asset Navigator synchronizes the Design viewport to that stage without changing the parent production configuration.

Landscape Scale, Offset Y and Parallax draft changes are applied live to the isolated iframe runtime for visual authoring. Canonical scale is converted back to the legacy renderer multiplier only at this temporary preview boundary. The parent `GAME_CONFIG` remains unchanged.

Canonical landscape Offset X remains stored in the draft but is not visually applied by the preserved Phase 6 renderer because that renderer has no independent static landscape-X transform. It must not be faked through world-scroll/parallax state. Native canonical Offset X rendering belongs to the later renderer migration; current stage defaults are zero.

FAR/MID/GROUND remain overlapping layers, not fixed bands. 7F does not regenerate or rebalance artwork and does not change gameplay physics, hazards, hitboxes, character grounding, Slide timing, or production assets.

## Known deferred calibration/content work
- landscape FAR/MID/GROUND geometry/alignment regeneration
- final character grounding/positioning after landscape correction
- hazard visual size/position calibration after landscape correction
- hazard/player collision hitbox calibration after landscape correction
- historical Slide 0.75s versus production-spec 0.70s reconciliation
- cold first-load optimization / staged asset loading

## Next production step
After 7F CI acceptance, proceed to Phase 7G Hazard editor. Do not begin Phase 8 landscape regeneration until Phase 7 is accepted.

## Guardrails
- `archive/` and `assets-original/` remain immutable.
- Approved character/hazard/shared assets are not regenerated, resized, normalized, or replaced for convenience.
- Structural changes preserve user-approved Phase 6 behavior unless a separate explicit decision changes gameplay.
- Legacy Phase 6 calibration values remain evidence until replacement assets are authored.
- G1D is Slide, not Duck.
