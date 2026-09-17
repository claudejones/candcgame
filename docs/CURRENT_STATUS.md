# Current Status

Last updated: 2026-09-17

## Production baseline
Phase 5 was user-verified in the deployed QA build. Phase 6 establishes production naming and repository cleanup from that approved behavior.

Active application source:
- `src/index.html`
- `src/css/game.css`
- `src/js/game-config.js`
- `src/js/game-runtime.js`
- external semantic assets under `assets/`

The historical LAB25Q harness remains preserved unchanged under `archive/LAB25Q/` as behavioral/provenance evidence. It is not an active runtime dependency. `assets-original/` remains immutable.

## Migration status
- Phase 0 inventory: COMPLETE
- Phase 1 HTML/CSS/JS extraction: COMPLETE / user verified
- Phase 2 semantic asset mapping: COMPLETE
- Phase 3 asset classification: COMPLETE
- Phase 4 external asset migration: COMPLETE / user verified across all 9 current stages
- Phase 5 configuration extraction: COMPLETE / user verified
- Phase 6 production naming/cleanup: IMPLEMENTED / CI and deployed user regression approval pending

Production source contains no Base64/data-image assets. The duplicate `lab25q.js` runtime and completed one-time Phase 0–5 migration workflows have been removed from the active codebase. Historical evidence remains in `archive/` and Git history.

## Phase 6 production identity
Active production filenames no longer use LAB25Q migration terminology. Configuration is exposed as `window.GAME_CONFIG`. The QA UI visibly identifies the build family as `PHASE 6 • QA`.

## Known deferred calibration/content work
- landscape FAR/MID/GROUND geometry/alignment regeneration
- final character grounding/positioning after landscape correction
- hazard visual size/position calibration after landscape correction
- hazard/player collision hitbox calibration after landscape correction
- historical LAB25Q Slide 0.75s versus production-spec 0.70s reconciliation
- cold first-load optimization / staged asset loading

## Next production step after Phase 6 approval
Begin landscape regeneration using the locked universal landscape contract. For each finalized stage, perform final character grounding, hazard size/position, then collision/hitbox calibration.

## Guardrails
- `archive/` and `assets-original/` remain immutable.
- Approved character/hazard/shared assets are not regenerated, resized, normalized, or replaced for convenience.
- Structural changes preserve the user-approved Phase 5 behavior unless a separate explicit decision changes gameplay.
- G1D is Slide, not Duck.
