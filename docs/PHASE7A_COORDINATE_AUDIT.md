# Phase 7A — Coordinate and Ground-Surface Audit

Status: COMPLETE / production contract locked
Date: 2026-09-17

This audit records the current Phase 6 coordinate dependencies and the Phase 7A production mathematics. It is the evidence behind the canonical coordinate contract in `WORLD_RENDERING_SPEC.md`.

## 1. Canonical production geometry

The production logical viewport is fixed at 960 x 540.

- `VIEWPORT_W = 960`
- `VIEWPORT_H = 540`
- `WORLD_TOP = 0`
- `WORLD_BOTTOM = 540`
- `GROUND_SURFACE_Y = 410`
- depth below running surface = `540 - 410 = 130 px`

The value 410 is not an average of the current stage calibrations. It is the exact 2x mapping of the recovered original production composition: 480 x 270 with `GROUND_BASELINE_Y = 205` and 65 px below the surface. Doubling the logical coordinate system gives 960 x 540, surface 410, and 130 px below the surface. This preserves the original vertical composition ratio exactly: `205 / 270 = 410 / 540 = 0.759259...`.

Current Phase 6 stage values cluster around this area but vary because legacy landscape artwork required compensating offsets. They are evidence, not authority.

## 2. Current Phase 6 seam math

Current landscape rendering uses:

`baseScale = viewportW / sourceW = 960 / 2048 = 0.46875`

MID:
`midY = seamY - midBaselineSourceY * midScale + midYOffset`

GROUND:
`groundY = seamY - groundSurfaceSourceY * groundScale + groundYOffset`

Rendered ground surface:
`renderedSurfaceY = groundY + groundSurfaceSourceY * groundScale`

Therefore the source-anchor terms cancel and current effective surface is simply:

`renderedSurfaceY = seamY + groundYOffset`

This is the key legacy coupling Phase 7B must remove from the canonical model.

Current effective surfaces from checked-in Phase 6 configuration:

| Stage | seamY | groundYOffset | effective surface |
| --- | ---: | ---: | ---: |
| NA01 | 408 | 0 | 408 |
| NA02 | 428 | -43 | 385 |
| NA03 | 407 | 0 | 407 |
| SA01 | 408 | -8 | 400 |
| SA02 | 420 | -26 | 394 |
| SA03 | 408 | -30 | 378 |
| EU01 | 408 | 0 | 408 |
| EU02 | 408 | 0 | 408 |
| EU03 | 408 | 0 | 408 |

These values demonstrate that `seamY` is not currently a universal gameplay surface and `groundYOffset` is doing two jobs: artwork placement and gameplay-surface movement. The production model separates those responsibilities.

## 3. Runtime dependency inventory

### Scene / landscape renderer
Current dependencies:
- `CONFIG.canvas.w/h`
- `worldContract.sourceW/sourceH`
- `worldContract.midBaselineSourceY`
- `worldContract.groundSurfaceSourceY`
- per-stage `seamY`
- per-stage `farY`, `farScale`
- per-stage `midYOffset`, `midScale`, `midParallax`
- per-stage `groundYOffset`, `groundScale`, `groundParallax`
- cloud Y/scale/opacity

The Scene computes and stores `lastRenderedSurfaceY`. Phase 7B must make the canonical surface explicit rather than deriving gameplay geometry from a stage artwork seam.

### Character
Current character foot math recomputes the legacy ground equation independently:

`footY = renderedSurfaceY + worldContract.footOffset[character] + stage.characterGrounding[character]`

Production target:

`characterFootY = GROUND_SURFACE_Y + characterAdjustment`

Character adjustment may preserve sprite-specific foot-anchor correction, but landscape artwork offsets must not move gameplay ground.

### Ground hazards
Both QA preview and spawned gameplay hazards use `ObjectQA.surfaceY()`, then:

`groundHazardFootY = surfaceY + hazard.groundOffset`

Production target:

`groundHazardFootY = GROUND_SURFACE_Y + hazardAdjustment`

### Flying hazards
Flying hazard altitude is also relative to `surfaceY()`:

`flightAnchorY = surfaceY - HIGH/LOW clearance`

Production target keeps this relationship, but uses canonical `GROUND_SURFACE_Y`.

### Collision
Character collision derives from rendered character geometry and foot position. Hazard collision derives from visual hazard anchor plus collision width/height/offset. Therefore collision indirectly depends on the current stage surface through character/hazard placement.

### Finish marker
Finish geometry currently uses:

`finishFootY = ObjectQA.surfaceY() + finish.groundOffset`

Production target:

`finishFootY = GROUND_SURFACE_Y + finishAdjustment`

### QA controls / persistence
Current QA controls directly mutate stage seam/landscape offsets and per-hazard ground offsets. Snapshot/export includes legacy world profiles and QA preview fallback ground offset. Phase 7B must classify these as authored landscape transform, gameplay anchor adjustment, or transient QA state rather than keeping the current mixed model.

### Fallback coupling
`ObjectQA.surfaceY()` currently falls back to `worldProfiles[activeWorld].seamY` if Scene has not rendered. This fallback must disappear from the production coordinate model.

## 4. Production source-to-runtime mapping

Landscape source resolution is independent from logical gameplay resolution.

For a source asset with a documented source-space anchor `sourceAnchorY` and render scale `S`:

`drawY = targetAnchorY - sourceAnchorY * S + visualOffsetY`

For production GROUND:

`targetAnchorY = GROUND_SURFACE_Y = 410`

so:

`groundDrawY = 410 - sourceSurfaceY * S + visualOffsetY`

`visualOffsetY` may move artwork only when explicitly permitted by the authoring contract. It must not change character/hazard/finish gameplay anchors.

MID uses its own documented composition/source anchor and target anchor. FAR normally starts at Y=0. No alpha-analysis result becomes production geometry authority; source anchors are authored metadata.

## 5. Clipping and overscan

The canvas is the clipping boundary. Source artwork may extend above Y=0 or below Y=540 after transformation. Excess is clipped naturally by the renderer.

Required principles:
- FAR normally begins at Y=0 and must cover the top/skyline.
- FAR must remain valid behind intentional MID transparency.
- MID has authored vertical overscan and overlap.
- GROUND has sufficient source depth below its surface anchor to cover through/beyond Y=540.
- no synthetic stage backing is used to conceal incomplete coverage.
- offsets position valid artwork; they are not gap-repair tools.

## 6. Responsive display rule

All gameplay and authoring geometry remains 960 x 540 logical pixels.

Presentation scale:

`displayScale = min(availableWidth / 960, availableHeight / 540)`

Displayed size:

`displayWidth = 960 * displayScale`
`displayHeight = 540 * displayScale`

The viewport remains 16:9 and is centered in its available region. Pointer/touch coordinates are converted back to logical coordinates:

`logicalX = (clientX - viewportLeft) / displayScale`
`logicalY = (clientY - viewportTop) / displayScale`

CSS/browser dimensions never alter world physics, collision, stage timing, ground surface, hazard positions, or character coordinates.

## 7. Phase 7B migration rule

Do not immediately force the existing nine legacy landscapes to render with all visual offsets removed. Their current values preserve the user-verified Phase 6 appearance and remain compatibility evidence.

Phase 7B must introduce the canonical schema and a compatibility representation/adapter so:
- canonical gameplay surface is 410;
- legacy visual landscape calibration can remain representable until Phase 8 regeneration;
- artwork placement and gameplay anchoring become separate concepts;
- no stage-specific `seamY` is required by the final production model.

## 8. Acceptance result

Phase 7A acceptance gate is satisfied mathematically:

- GROUND base anchor: `GROUND_SURFACE_Y = 410`
- Character foot: `410 + characterAdjustment`
- Ground hazard foot: `410 + hazardAdjustment`
- Flying altitude anchor: `410 - flightClearance`
- Finish marker foot: `410 + finishAdjustment`

No stage-specific world seam is required by the canonical model.
