# World Rendering Specification

Status: production contract under controlled reconciliation from established design requirements and legacy QA implementation.

## 1. Production logical composition
The intended mobile-first stage composition uses a logical 480 x 270 presentation.

Canonical running surface:

`GROUND_BASELINE_Y = 205`

This leaves approximately 65 logical pixels below the running surface for soil, sidewalk depth, streams, ravines, ice cracks, gap interiors, and related terrain depth.

The player's feet align to the ground baseline; the entire sprite cell does not.

## 2. Layer order and ownership
Production world order:

`DISTANT/FAR -> CLOUDS (when enabled) -> MIDGROUND -> GROUND`

No stage-, biome-, or continent-specific synthetic canvas/background color may be used to hide incomplete authored world coverage.

### DISTANT / FAR
- Base visual foundation.
- Must provide valid scenery anywhere intentional MID transparency reveals it.
- Must have sufficient authored vertical coverage/overscan for normal stage Y calibration without exposing the application/board backing.
- Production target presentation geometry established in the original design: approximately 960 x 150 logical-pixel equivalent, typically occupying about Y 35 -> 185.
- Horizontally seamless where repeated.

### MIDGROUND
- Owns the middle depth band and parallax scenery.
- Production target presentation geometry established in the original design: approximately 960 x 125 logical-pixel equivalent, typically occupying about Y 80 -> 205.
- Horizontally seamless where repeated.
- Intentional transparency is allowed and desirable when FAR should show through.
- MID must have enough authored vertical coverage of its own. GROUND must not be pushed excessively upward merely to conceal an undersized MID layer.
- MID requires useful vertical overlap/play with both FAR and GROUND so composition remains balanced during calibration.

### GROUND
- Owns the playable running surface and terrain depth beneath it.
- Original production target: approximately 240 x 65 logical-pixel equivalent; two tiles cover one logical viewport, with extra offscreen tiles drawn by the renderer.
- Running surface begins at the asset's top boundary in the original tile contract and aligns to logical Y=205.
- Left edge must equal right edge for repeating ground.
- Ground/depth artwork must extend far enough below the playable surface that normal positioning cannot expose an unintended void.
- Transparency above terrain is allowed when MID/FAR should remain visible.

## 3. Vertical overlap principle
The world is not three images that merely touch at exact seams. Layers require intentional overlap and calibration room.

- FAR must remain valid behind transparent MID regions.
- MID must extend sufficiently toward the running surface that GROUND can stay at a visually natural depth.
- GROUND must extend sufficiently downward to cover the viewport below the running surface.
- Y-offset controls position correctly authored layers; they are not repair tools for deficient artwork.

## 4. Gap rendering
Normal ground rendering stops across the selected gap interval. A gap-interior asset renders below Y=205. Random gap width is controlled by the renderer and must not require a unique full-background image for each width.

Examples include stream, ravine, water, and fissure interiors.

## 5. Source resolution versus logical presentation
Logical dimensions describe intended presentation. Production PNGs may be authored at exact integer multiples when that preserves cleaner pixel art, provided the renderer consumes them at an exact intended ratio and technical QA confirms geometry.

Do not infer compliance from file dimensions alone. Inspect the generated asset before integration.

## 6. Current legacy QA geometry — implementation, not automatically production authority
LAB25Q currently uses a 960 x 540 QA canvas and an authored-world implementation based on 2048 x 682 sources, with MID source baseline 621 and GROUND source surface 393. This geometry evolved during integration/calibration.

It must remain documented because LAB25Q is the behavioral reference baseline, but it does not silently replace the production logical contract above. Migration must reconcile the two deliberately and preserve approved gameplay appearance/behavior.

## 7. Landscape acceptance criteria
A stage set must be reviewed as FAR + MID + GROUND together.

Before integration:
- correct intended logical/source geometry;
- adequate FAR vertical coverage;
- adequate MID vertical coverage and overlap;
- adequate GROUND depth;
- genuine alpha only where the layer design calls for it;
- seamless horizontal repetition where applicable;
- no shared effects such as clouds baked into stage layers when those effects are renderer-owned;
- no extreme calibration required to conceal missing artwork;
- balanced composition at normal scale;
- no unintended backing visible at any normal calibrated position.

Existing NA/SA/EU landscapes are to be classified KEEP / REPAIR / REGENERATE against this contract before further landscape production.
