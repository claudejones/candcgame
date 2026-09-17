# Current Status

Last updated: 2026-09-17

## Production baseline
Phase 6 is complete and user-verified. Phase 7 establishes the production authoring architecture before Phase 8 landscape regeneration.

Active shared runtime remains `src/index.html`, `src/css/game.css`, `src/js/game-config.js`, `src/js/game-runtime.js`, with semantic assets under `assets/`.

Phase 7 development modules now include mode shell, Asset Navigator, isolated/local design draft, Contextual Inspector, Landscape Editor, Hazard/Atlas Editor, Character Editor and Runtime Monitor. Production remains `src/game.html` with production bootstrap only.

## Migration status
- Phase 0–6: COMPLETE / user verified where applicable
- Phase 7A coordinate and viewport contract: COMPLETE
- Phase 7B canonical configuration schema: COMPLETE / CI accepted
- Phase 7C modular application shell/bootstrap split: COMPLETE / CI accepted
- Phase 7D Design Asset Navigator: COMPLETE / CI accepted
- Phase 7E Contextual Inspector framework: COMPLETE / CI accepted (run #78)
- Phase 7F Landscape editor: COMPLETE / CI accepted (run #98)
- Phase 7G Hazard/atlas editor: IMPLEMENTED / combined 7G-7I CI checkpoint pending
- Phase 7H Character editor: IMPLEMENTED / combined 7G-7I CI checkpoint pending
- Phase 7I Runtime Monitor: IMPLEMENTED / combined 7G-7I CI checkpoint pending
- Phase 7J + 7K Test/Game runtime modes: NEXT after combined checkpoint acceptance

## Coordinate/config authority
Canonical logical viewport: `960 x 540`. Canonical production ground surface: `GROUND_SURFACE_Y = 410`. Canonical asset vocabulary: `SOURCE REGION -> FINE CROP -> SCALE -> POSITION -> GAMEPLAY ANCHOR -> COLLISION`.

Legacy stage `seamY` and landscape offsets remain compatibility/calibration evidence only and are not canonical gameplay-coordinate authority.

## Design persistence and export
All Design-mode saves persist only to browser `localStorage` under `cc-world-design-config-v1`. No Design save writes to Git or production configuration. Stage authoring uses SAVE STAGE; global character authoring uses SAVE CHARACTER. Valid locally saved canonical drafts are restored on reload.

Design supports EXPORT STAGE and EXPORT GAME CONFIG. Full-game export contains schema version, coordinate contract, global character authoring values and all current stage drafts, including current unsaved values.

## Phase 7F Landscape Editor
Landscape visibility/isolation covers FAR, CLOUDS, MID, GROUND and guides. Scale, Offset Y and Parallax draft changes preview live against the isolated iframe runtime. Canonical Offset X remains saved/exported but is not faked through legacy world scroll.

## Phase 7G Hazard/Atlas Editor
Hazard authoring preserves existing atlas files. The Contextual Inspector exposes source rectangle X/Y/W/H separately from non-negative fine crop L/R/T/B, scale, X/Y placement or ground adjustment, and collision W/H/X/Y. A Full Atlas view renders the complete atlas with the active source rectangle outlined.

The isolated Design iframe receives temporary hazard preview values only. Source rectangle changes therefore allow assets such as the Gaudí Mosaic Bench to reveal artwork beyond the old source boundary without negative crop or splitting the atlas. Collision bounds are enabled in the Design preview. Parent `GAME_CONFIG` remains unchanged.

## Phase 7H Character Editor
Character authoring supports Claude/Constance and Idle/Run/Jump/Slide/Hit/Celebrate state selection. Global character master scale, per-state scale, render offsets and collision geometry are stored in the local Design draft; stage-specific grounding remains stage-scoped.

The selected character/state atlas cell is shown with crop bounds. Existing per-frame crop data, including the approved Constance Slide frame-2 left crop, is preserved. Character crop/collision diagnostics are enabled only in the isolated Design preview; approved atlases are unchanged.

## Phase 7I Runtime Monitor
A collapsible Runtime Monitor observes the shared iframe without writing configuration. It reports build identifier, stage, character/state/frame, canonical/rendered ground information, world/time status, selected hazard/collision status, spawn phase/counts and last runtime event. It is hidden in GAME mode.

## Known deferred calibration/content work
- landscape FAR/MID/GROUND geometry/alignment regeneration
- final character grounding/positioning after landscape correction
- hazard visual size/position calibration after landscape correction
- hazard/player collision hitbox calibration after landscape correction
- historical Slide 0.75s versus production-spec 0.70s reconciliation
- cold first-load optimization / staged asset loading

## Next production step
After the combined 7G-7I CI/regression checkpoint passes, proceed as one execution block with Phase 7J Test mode + Phase 7K Game mode. Then complete 7L persistence/finalization + 7M regression/CI/deployment as the final Phase 7 block.

Do not begin Phase 8 landscape regeneration until Phase 7 is accepted.

## Guardrails
- `archive/` and `assets-original/` remain immutable.
- Approved character/hazard/shared assets are not regenerated, resized, normalized, or replaced for convenience.
- Structural changes preserve user-approved Phase 6 behavior unless a separate explicit decision changes gameplay.
- Legacy Phase 6 calibration values remain evidence until replacement assets are authored.
- G1D is Slide, not Duck.
