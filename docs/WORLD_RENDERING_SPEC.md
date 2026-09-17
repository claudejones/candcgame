# World Rendering Specification

Status: production contract. The coordinate system and landscape responsibilities below are authoritative for Phase 7 authoring architecture and Phase 8 landscape regeneration.

## 1. Canonical production coordinate system
The production renderer uses one canonical 16:9 logical coordinate system:

- `VIEWPORT_W = 960`
- `VIEWPORT_H = 540`
- `WORLD_TOP = 0`
- `WORLD_BOTTOM = 540`
- `GROUND_SURFACE_Y = 410`
- terrain/depth below the running surface = `130 px`

`GROUND_SURFACE_Y = 410` is the exact 2x reconciliation of the recovered original 480x270 production composition with `GROUND_BASELINE_Y = 205`. It preserves the original composition ratio and doubles the original 65 px below-surface depth to 130 px. It is not an average of legacy stage calibration values. See `PHASE7A_COORDINATE_AUDIT.md`.

The browser/device may scale the viewport responsively, but gameplay geometry is always calculated in canonical 960x540 coordinates. Browser pixels are never gameplay coordinates.

All visual layers occupy and overlap within the same world viewport. FAR, MID and GROUND are layers, not separate screen bands.

Canonical vertical derivation:

```text
Viewport = 960 x 540
World top = 0
World bottom = 540
Ground surface = 410
Character foot = 410 + character adjustment
Ground hazard foot = 410 + hazard adjustment
Flying altitude anchor = 410 - flight clearance
Finish marker foot = 410 + finish adjustment
```

The fixed ground surface is the primary vertical gameplay anchor. Character grounding, grounded/flying hazards and finish markers derive from it rather than maintaining unrelated stage-specific world baselines.

## 2. Production landscape rule
The renderer must not rely on artwork nudges to conceal missing image coverage. Regenerated landscapes are authored with deliberate overscan and overlap so normal calibration never exposes blank canvas.

### FAR
- FAR is the complete visual foundation behind the stage.
- Its normal production render origin is `Y = 0`.
- The authored image must fill the entire visible area for which FAR is responsible, including the skyline at the top of the viewport.
- It must contain sufficient vertical overscan below its nominal visible composition so MID movement/transparent regions cannot expose empty canvas.
- It must provide valid scenery anywhere intentional MID transparency reveals it.
- It is horizontally seamless where repeated.
- A positive FAR Y offset must not be required merely to make the composition fill the screen.

### MID
- MID is an overlapping transparent layer, not a separate screen region.
- Genuine alpha is expected where FAR should remain visible.
- MID is authored relative to the canonical world coordinate system and fixed ground-surface contract.
- It includes deliberate vertical overscan above and below its nominal composition area so useful calibration does not reveal voids.
- It has sufficient authored coverage of its own; GROUND must not be pushed upward to repair an undersized MID.
- It is horizontally seamless where repeated.

### GROUND
- GROUND owns the playable running surface and terrain depth below it.
- Every production GROUND asset has an explicit source-space surface anchor that maps deterministically to `GROUND_SURFACE_Y = 410`.
- It contains sufficient artwork below that surface to extend beyond/clamp safely at the viewport bottom.
- It includes useful overlap above/below its nominal composition where appropriate, while preserving transparent regions intended to reveal MID/FAR.
- It is horizontally seamless where repeated.
- Character feet, grounded hazard feet and finish-marker feet derive from the same canonical surface; visual GROUND offset does not redefine gameplay ground.

### Overscan principle
Landscape source artwork may be larger vertically than the visible viewport requirement. The renderer clips excess artwork; it does not stretch it to compensate for missing coverage. Overscan exists to provide safe composition/calibration room, not to create arbitrary per-stage geometry.

The universal contract is:

`correct source anchors + deterministic mapping + controlled visual offsets + clipping`, not `stage-specific nudging until gaps disappear`.

## 3. Source-to-runtime mapping
Source resolution is independent from logical gameplay resolution.

For a source asset with source-space anchor `sourceAnchorY`, scale `S`, target logical anchor `targetAnchorY`, and permitted visual offset `visualOffsetY`:

`drawY = targetAnchorY - sourceAnchorY * S + visualOffsetY`

For production GROUND:

`groundDrawY = 410 - sourceSurfaceY * S + visualOffsetY`

The gameplay surface remains 410 even if a permitted visual offset is used for artwork composition. Production geometry is authored metadata; alpha-analysis may be used as QA evidence but must not silently become the source of truth.

FAR normally maps its source top to logical Y=0. MID uses an explicit authored source/composition anchor defined by its asset metadata/schema.

## 4. Responsive viewport scaling
The logical viewport never changes from 960x540.

`displayScale = min(availableWidth / 960, availableHeight / 540)`

`displayWidth = 960 * displayScale`

`displayHeight = 540 * displayScale`

The viewport remains 16:9 and is centered in its available region. Pointer/touch coordinates are converted back to logical coordinates before authoring/gameplay use:

`logicalX = (clientX - viewportLeft) / displayScale`

`logicalY = (clientY - viewportTop) / displayScale`

CSS/browser dimensions do not alter physics, collision, stage timing or world geometry.

## 5. Layer order and ownership
Production world order:

`FAR -> CLOUDS (when enabled) -> MID -> GROUND -> GAMEPLAY ENTITIES -> HUD`

No stage-, biome-, or continent-specific synthetic canvas/background color may be used to hide incomplete authored world coverage.

The HUD is screen-space UI. Character, hazards, finish marker and landscape are world/gameplay-space elements. Controls are application UI outside or over the viewport as defined by the active shell.

## 6. Unified asset transform vocabulary
Authoring controls and configuration use a consistent conceptual pipeline:

`SOURCE REGION -> FINE CROP -> SCALE -> POSITION -> COLLISION`

### Source region
Defines which pixels in an atlas belong to an asset:
- `sourceX`
- `sourceY`
- `sourceW`
- `sourceH`

Atlas/sprite-sheet production remains preferred where multiple related assets or animation frames naturally belong together. The editor must allow the source region to be inspected and adjusted; fine crop must never be expected to reveal pixels outside the selected source region.

### Fine crop
Optional cleanup inside the selected source region:
- `cropL`
- `cropR`
- `cropT`
- `cropB`

Crop values support precise numeric input and increment/decrement controls. Valid minimum is zero. If crop is already zero, revealing more artwork requires expanding/moving the source region rather than allowing negative crop.

### Scale
Visual size of the selected asset. Design-mode controls provide direct numeric entry and increment/decrement controls.

### Position
Visual/world placement uses explicit offsets or domain-specific derived anchors. Visual offsets position correctly authored assets; they do not redefine the canonical gameplay surface or repair deficient source artwork.

### Collision
Gameplay geometry is distinct from visual crop and positioning. Collision width, height and offsets are configurable independently and can be visualized in Design/Test modes.

## 7. Gap rendering
Normal ground rendering stops across the selected gap interval. A gap-interior asset renders below `GROUND_SURFACE_Y = 410`. Random gap width is controlled by the renderer and must not require a unique full-background image for each width.

Examples include stream, ravine, water, and fissure interiors.

## 8. Source resolution versus logical presentation
The canonical runtime coordinate system is 960x540. Production PNGs may be authored at larger source dimensions when useful for pixel-art quality, atlas packing, parallax coverage or overscan, provided each asset defines deterministic source-to-runtime mapping and technical QA confirms geometry.

Do not infer compliance from file dimensions alone. Inspect generated assets before integration.

## 9. Legacy geometry — calibration evidence, not production authority
Earlier design work used 480x270 with `GROUND_BASELINE_Y = 205`. LAB25Q later used a 960x540 QA canvas and 2048x682 authored-world geometry with MID source baseline 621 and GROUND source surface 393.

The Phase 6 renderer computes the effective surface as `seamY + groundYOffset`; current stage values vary materially because the existing landscapes required compensation. Those values are preserved as empirical compatibility evidence, not the universal production specification.

Phase 7A reconciled the production composition by exact 2x mapping and locked `GROUND_SURFACE_Y = 410`. Phase 7B must separate canonical gameplay anchoring from legacy visual landscape calibration so the current nine stages remain representable while the final schema no longer requires stage-specific world seams.

## 10. Design/Test/Game renderer rule
Design, Test and Game modes consume the same canonical stage configuration and renderer. An asset must not render differently merely because the application shell is in a different mode.

- Design mode adds authoring/navigation/inspection overlays and controls.
- Test mode adds focused QA/runtime diagnostics.
- Game mode contains only production gameplay/UI.

The packaged production game must not ship Design/Test authoring code or controls. Authoring and QA features are modular dependencies attached by a development/QA bootstrap; the production bootstrap imports only production runtime modules.

## 11. Landscape acceptance criteria
A stage set is reviewed as FAR + MID + GROUND together.

Before integration:
- canonical 960x540 coordinate mapping is honored;
- `GROUND_SURFACE_Y = 410` is honored;
- FAR renders normally from Y=0 and covers the skyline/top responsibility;
- adequate FAR vertical coverage/overscan;
- adequate MID vertical coverage, transparency and overlap;
- adequate GROUND depth below its explicit surface anchor through/beyond Y=540;
- genuine alpha only where layer design calls for it;
- seamless horizontal repetition where applicable;
- no shared effects such as clouds baked into stage layers when those effects are renderer-owned;
- no extreme calibration required to conceal missing artwork;
- balanced composition at normal scale;
- no unintended backing visible at any allowed calibrated position;
- character, hazards and finish marker resolve from the shared ground surface;
- visual landscape offsets do not redefine gameplay ground;
- source anchors and runtime mapping are documented and testable.

Existing NA/SA/EU landscape values remain compatibility evidence until their assets are regenerated against this contract.
