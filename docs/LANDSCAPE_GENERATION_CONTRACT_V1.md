# Unified Landscape Generation Contract V1

Status: ADOPTED FOR REMAINING-STAGE PRODUCTION, 2026-09-19. All 27 registered NA/SA/EU landscape layers passed landscape review and continent regression. The user authorized proceeding while a separate auto-calibration agent reviews existing gameplay calibration. That follow-up is not a generation blocker or an accepted calibration result. Each remaining stage retains its content/reference, integration, collision and deployed approval gates.

## Objective
One renderer geometry and one character foot/running-surface anchor across every stage. Newly standardized landscapes must conform to the contract; runtime stage-specific Y/scale/character-grounding corrections are not the target solution.

## Standard source canvas
- FAR: 2172 × 724 PNG.
- MID: 2172 × 724 PNG with genuine alpha where FAR is intended to show through.
- GROUND: 2172 × 724 PNG with genuine alpha above terrain where appropriate.
- Pixel-art treatment must remain consistent with approved Claude & Constance world art.
- No baked checkerboard, HUD, characters, hazards, controls, finish marker or shared cloud layer.

The 2172 × 724 canvas is deliberately taller than the visible composition requirement. The extra vertical room is authored overscan, not empty accidental padding.

## Functional vertical architecture
Bottom-to-top ownership is:
`CONTROL -> GROUND -> MID -> FAR`, with CLOUD and HUD renderer-owned overlays.

The accepted modular viewport is 960×540 with running surface Y=410. Integrated landscapes use source width 2172, FAR/MID/GROUND offsets zero, FAR scale multiplier 1.25 and MID/GROUND multipliers 1.00. MID source anchor 621 and GROUND source anchor 393 map to the running surface. See the registry and WORLD_RENDERING_SPEC for source-to-runtime mapping.

### FAR contract
- Must be a complete visual foundation across 100% of canvas width.
- No unintended transparent holes anywhere that may become visible through MID.
- Primary horizon/composition may vary by environment, but useful scenery must extend through the full vertical presentation band plus overscan.
- Left/right continuation must survive horizontal scrolling/repetition.
- No clouds when clouds are renderer-owned.

### MID contract
- Canvas remains 2172 × 724 even when much of the upper region is transparent.
- Intentional transparency is allowed so FAR can show through.
- MID visual mass must extend low enough to overlap the GROUND transition zone without requiring runtime vertical rescue.
- Avoid a large fully transparent horizontal band immediately above the terrain transition.
- Important silhouettes must not be clipped by the canvas edges.
- Left/right continuation must survive horizontal scrolling/repetition.

### GROUND contract
- Canvas remains 2172 × 724.
- The playable running surface is authored at one shared normalized source anchor across every GROUND asset.
- Accepted Phase 8 source anchor: Y=393. Do not vary it by stage or compensate for defective artwork with runtime offsets.
- Terrain must provide substantial continuous depth beneath the running surface through the bottom overscan region.
- The region immediately above the running surface may be transparent where MID/FAR should show through.
- Ground must not end early and expose backing below the terrain.
- Left/right continuation must survive scrolling/repetition.

## Required generation margin
Do not compose important scenery exactly against functional boundaries. Give the renderer deliberate play:
- FAR extends behind the entire MID responsibility region.
- MID extends into the GROUND transition region.
- GROUND extends substantially below the visible terrain requirement.
- Decorative silhouettes remain clear of source edges unless intentionally tile-crossing.

## Automated technical acceptance
Every regenerated PNG must be checked before visual approval:
1. Exact dimensions.
2. Alpha bounds and percentage.
3. Row coverage profile.
4. Coverage at functional transition rows.
5. No accidental fully transparent void inside required ownership band.
6. Bottom terrain coverage for GROUND.
7. FAR foundation coverage.
8. Left/right edge continuation/seam evidence.
9. No baked checkerboard/shared overlays.
10. File is genuine PNG alpha when transparency is required.

## Visual acceptance
Technical PASS is necessary but not sufficient. Each stage must be tested as FAR + MID + GROUND inside the rebuilt full LAB25Q-derived harness with:
- real Claude/Constance scale and foot anchoring;
- real HUD;
- real Slide/Pause/Jump control zone;
- cloud overlay when stage contract enables it;
- transparent application backing;
- layer isolation;
- no stage-specific world Y/scale correction.

## Validation sequence
Use ASSET_COMMAND_WORKFLOW and PHASE8_LANDSCAPE_EXECUTION_PLAN for any eligible production work. The complete NA/SA/EU set is approved; do not reopen it or describe SA02 as the next landscape. Use this accepted landscape geometry for eligible remaining-stage production. Existing character/hazard calibration review continues in the separate user-assigned workstream; do not repeat it before generation. Resolve each selected stage's remaining content/reference gates and validate its actual generated hazards before deployed review. Preserve registered approved exceptions, including NA03 GROUND at 2170×725; never resize approved artwork merely to match the generic canvas.
