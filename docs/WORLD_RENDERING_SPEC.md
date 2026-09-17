# World Rendering Specification

Status: production contract. The coordinate system and landscape responsibilities below are authoritative for Phase 7 authoring architecture and Phase 8 landscape regeneration.

## 1. Canonical production coordinate system
The production renderer uses one canonical 16:9 logical coordinate system:

- `VIEWPORT_W = 960`
- `VIEWPORT_H = 540`
- `WORLD_TOP = 0`
- `WORLD_BOTTOM = 540`
- `GROUND_SURFACE_Y = fixed production value` — to be locked during Phase 7A from the composition contract before regenerated landscape assets are authored.

The browser/device may scale the viewport responsively, but gameplay geometry is always calculated in canonical 960x540 coordinates. Browser pixels are never gameplay coordinates.

All visual layers occupy and overlap within the same world viewport. FAR, MID and GROUND are layers, not separate screen bands.

Canonical vertical derivation:

```text
Viewport = 960 x 540
World top = 0
World bottom = 540
Ground surface = fixed Y
Character foot = ground surface + character adjustment
Ground hazard foot = ground surface + hazard adjustment
Finish marker foot = ground surface + finish adjustment
```

The fixed ground surface is the primary vertical gameplay anchor. Character grounding, grounded hazards and finish markers derive from it rather than maintaining unrelated stage-specific world baselines.

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
- MID is authored relative to the canonical world coordinate system and the fixed ground-surface contract.
- It includes deliberate vertical overscan above and below its nominal composition area so useful calibration does not reveal voids.
- It has sufficient authored coverage of its own; GROUND must not be pushed upward to repair an undersized MID.
- It is horizontally seamless where repeated.

### GROUND
- GROUND owns the playable running surface and terrain depth below it.
- Every production GROUND asset has an explicit source-space surface anchor that maps deterministically to `GROUND_SURFACE_Y`.
- It contains sufficient artwork below that surface to extend beyond/clamp safely at the viewport bottom.
- It includes useful overlap above/below its nominal composition where appropriate, while preserving transparent regions intended to reveal MID/FAR.
- It is horizontally seamless where repeated.
- Character feet, grounded hazard feet and finish-marker feet derive from the same rendered ground surface.

### Overscan principle
Landscape source artwork may be larger vertically than the visible viewport requirement. The renderer clips excess artwork; it does not stretch it to compensate for missing coverage. Overscan exists to provide safe composition/calibration room, not to create arbitrary per-stage geometry.

The universal contract is therefore:

`correct source anchors + deterministic mapping + controlled offsets + clipping`, not `stage-specific nudging until gaps disappear`.

## 3. Layer order and ownership
Production world order:

`FAR -> CLOUDS (when enabled) -> MID -> GROUND -> GAMEPLAY ENTITIES -> HUD`

No stage-, biome-, or continent-specific synthetic canvas/background color may be used to hide incomplete authored world coverage.

The HUD is screen-space UI. Character, hazards, finish marker and landscape are world/gameplay-space elements. Controls are application UI outside or over the viewport as defined by the active shell.

## 4. Unified asset transform vocabulary
Authoring controls and configuration use a consistent conceptual pipeline:

`SOURCE REGION -> FINE CROP -> SCALE -> POSITION -> COLLISION`

### Source region
Defines which pixels in an atlas belong to an asset:
- `sourceX`
- `sourceY`
- `sourceW`
- `sourceH`

Atlas/sprite-sheet production remains the preferred strategy where multiple related assets or animation frames naturally belong together. The editor must allow the source region to be inspected and adjusted; fine crop must never be expected to reveal pixels outside the selected source region.

### Fine crop
Optional cleanup inside the selected source region:
- `cropL`
- `cropR`
- `cropT`
- `cropB`

Crop values may be edited with precise numeric input and increment/decrement controls. Valid minimum is zero. If crop is already zero, revealing more artwork requires expanding/moving the source region rather than allowing negative crop.

### Scale
Visual size of the selected asset. Design-mode controls provide both direct numeric entry and increment/decrement controls for precision.

### Position
Visual/world placement uses explicit offsets such as `offsetX` and `offsetY`, or domain-specific derived anchors such as ground adjustment. Offsets position correctly authored assets; they do not repair deficient source artwork.

### Collision
Gameplay geometry is distinct from visual crop and positioning. Collision width, height and offsets are configurable independently and can be visualized in Design/Test modes.

## 5. Gap rendering
Normal ground rendering stops across the selected gap interval. A gap-interior asset renders below the canonical ground surface. Random gap width is controlled by the renderer and must not require a unique full-background image for each width.

Examples include stream, ravine, water, and fissure interiors.

## 6. Source resolution versus logical presentation
The canonical runtime coordinate system is 960x540. Production PNGs may be authored at larger source dimensions when useful for pixel-art quality, atlas packing, parallax coverage or overscan, provided each asset defines deterministic source-to-runtime mapping and technical QA confirms geometry.

Do not infer compliance from file dimensions alone. Inspect generated assets before integration.

## 7. Legacy geometry — calibration evidence, not production authority
Earlier design work used a logical 480x270 presentation with `GROUND_BASELINE_Y = 205`. LAB25Q later used a 960x540 QA canvas and 2048x682 authored-world geometry with MID source baseline 621 and GROUND source surface 393.

Phase 6 user calibration further demonstrated that existing landscape artwork requires materially different offsets by stage. Those values are preserved as empirical evidence for the legacy assets, but they are not the universal production landscape specification.

Phase 7A must reconcile composition and lock the canonical 960x540 `GROUND_SURFACE_Y` before Phase 8 landscape regeneration. Once locked, regenerated landscape assets are authored to that contract rather than inheriting legacy stage seam values.

## 8. Design/Test/Game renderer rule
Design, Test and Game modes must consume the same canonical stage configuration and renderer. An asset must not render differently merely because the application shell is in a different mode.

- Design mode adds authoring/navigation/inspection overlays and controls.
- Test mode adds focused QA/runtime diagnostics.
- Game mode contains only production gameplay/UI.

The production packaged game must be lightweight and must not ship Design/Test authoring code or controls. Authoring and QA features are modular dependencies attached by a development/QA bootstrap; the production bootstrap imports only production runtime modules.

## 9. Landscape acceptance criteria
A stage set is reviewed as FAR + MID + GROUND together.

Before integration:
- canonical 960x540 coordinate mapping is honored;
- the fixed production ground surface is honored;
- FAR renders normally from Y=0 and covers the skyline/top responsibility;
- adequate FAR vertical coverage/overscan;
- adequate MID vertical coverage, transparency and overlap;
- adequate GROUND depth below its explicit surface anchor;
- genuine alpha only where layer design calls for it;
- seamless horizontal repetition where applicable;
- no shared effects such as clouds baked into stage layers when those effects are renderer-owned;
- no extreme calibration required to conceal missing artwork;
- balanced composition at normal scale;
- no unintended backing visible at any allowed calibrated position;
- character, grounded hazards and finish marker resolve from the shared ground surface;
- source anchors and runtime mapping are documented and testable.

Existing NA/SA/EU landscape values remain useful reference evidence until their assets are regenerated against this contract.
