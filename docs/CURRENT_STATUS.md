# Current Status

Last updated: 2026-09-17

## Production baseline
Phase 6 production naming/cleanup was deployed and user-verified. Phase 7 is now the active production-authoring architecture phase; asset regeneration does not begin until Phase 7 is accepted.

Active application source:
- `src/index.html`
- `src/css/game.css`
- `src/js/game-config.js`
- `src/js/game-runtime.js`
- external semantic assets under `assets/`

The historical LAB25Q harness remains preserved unchanged under `archive/LAB25Q/` as behavioral/provenance evidence. It is not an active runtime dependency. `assets-original/` remains immutable.

## Migration / architecture status
- Phase 0 inventory: COMPLETE
- Phase 1 HTML/CSS/JS extraction: COMPLETE / user verified
- Phase 2 semantic asset mapping: COMPLETE
- Phase 3 asset classification: COMPLETE
- Phase 4 external asset migration: COMPLETE / user verified across all 9 current stages
- Phase 5 configuration extraction: COMPLETE / user verified
- Phase 6 production naming/cleanup: COMPLETE / deployed and user verified
- Phase 7A coordinate and viewport contract: COMPLETE
- Phase 7B canonical configuration schema: NEXT

Production source contains no Base64/data-image assets. Active production filenames/config identity no longer use LAB25Q migration terminology.

## Phase 7A locked coordinate contract
Authoritative documents:
- `docs/WORLD_RENDERING_SPEC.md`
- `docs/PHASE7A_COORDINATE_AUDIT.md`
- `docs/PHASE7_AUTHORING_ARCHITECTURE_EXECUTION_SPEC.md`

Locked production geometry:
- logical viewport: 960x540
- world top/bottom: 0 / 540
- `GROUND_SURFACE_Y = 410`
- terrain/depth below surface: 130 px
- browser/device scaling is presentation-only
- FAR normally starts at Y=0
- FAR/MID/GROUND overlap in one coordinate system and use deliberate overscan
- character feet, hazards and finish marker derive from the canonical surface

The 410 surface is the exact 2x reconciliation of the recovered original 480x270 / baseline-205 composition. Current Phase 6 stage seam/offset values remain compatibility evidence only.

## Phase 7B objective
Create the canonical saved-authoring schema and separate it from transient runtime/QA state. Artwork placement and gameplay anchoring must become separate concepts. Existing nine stages must remain representable through compatibility mapping while the final production model no longer requires stage-specific world seams.

Atlas/sprite-sheet strategy remains. Asset transforms follow SOURCE REGION -> FINE CROP -> SCALE -> POSITION -> COLLISION.

## Known deferred calibration/content work
- Phase 8 landscape FAR/MID/GROUND regeneration against the locked contract
- final character grounding/positioning after landscape correction
- hazard visual size/position calibration after landscape correction
- hazard/player collision hitbox calibration after landscape correction
- historical Slide 0.75s versus production-spec 0.70s reconciliation
- cold first-load optimization / staged asset loading

## Guardrails
- `archive/` and `assets-original/` remain immutable.
- Approved character/hazard/shared assets are not regenerated, resized, normalized, or replaced for convenience.
- Phase 7 structural work preserves approved Phase 6 gameplay unless a separate explicit decision changes it.
- G1D is Slide, not Duck.
