# Unified Landscape Generation Contract V1

Status: TEST CONTRACT — validation batch is the 27 regenerated NA/SA/EU landscape layers. Do not use for the remaining 36 until the validation batch passes technical + full-harness visual QA.

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

The exact logical control-zone and running-surface numbers remain subject to the rebuilt LAB25Q full-harness proof. Asset generation therefore uses normalized source-space bands so we can test the geometry without stage-specific offsets.

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
- V1 target source anchor: Y=393. This is inherited from LAB25Q only as the first validation anchor and may be revised once the modular full harness proves the final logical composition.
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
Generate one complete stage set first (FAR -> approval -> MID -> approval -> GROUND -> approval), run technical QA and full-harness composite QA, refine this contract if needed, then continue the other eight existing stages. Only after all nine existing stages pass should this contract be promoted for the remaining 36 landscapes.
