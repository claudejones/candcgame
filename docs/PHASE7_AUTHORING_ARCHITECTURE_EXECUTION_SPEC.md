# Phase 7 — Production Authoring Architecture Execution Specification

Status: ACTIVE EXECUTION PLAN

Purpose: establish the production coordinate contract, configuration schema and modular Design/Test/Game application architecture before any Phase 8 landscape regeneration.

This document is the step-by-step execution authority for Phase 7. Do not skip ahead to asset regeneration. Each completed subphase must satisfy its acceptance gate before the next begins.

## Non-negotiable principles

1. One canonical renderer and one canonical stage configuration drive Design, Test and Game modes.
2. Gameplay geometry uses a fixed 960x540 logical coordinate system regardless of browser/device display size.
3. The production packaged game is lightweight. Design/Test authoring code is not included in the production bundle.
4. Development/QA functionality is modular and attached through a development bootstrap; production uses a production bootstrap containing only required runtime/game modules.
5. Landscape layers overlap in one coordinate system; they are not separate visual bands.
6. The fixed production ground surface is the shared vertical anchor for character feet, grounded hazards and finish markers.
7. FAR normally begins at Y=0 and owns complete top/skyline coverage. FAR/MID/GROUND are authored with deliberate vertical overscan and overlap.
8. Atlas/sprite-sheet use remains preferred where related assets/frames naturally belong together. Do not explode atlases into unnecessary individual files.
9. Asset authoring follows SOURCE REGION -> FINE CROP -> SCALE -> POSITION -> COLLISION.
10. Numeric authoring controls provide both direct numeric entry and +/- or arrow stepping for precision.
11. Fine crop cannot reveal pixels outside a source region. Source-region bounds themselves must be editable/inspectable.
12. Phase 6 calibration values are preserved as legacy evidence until regenerated assets replace them; do not silently normalize them during Phase 7.
13. No landscape regeneration, gameplay rebalance, hitbox retuning, Slide timing reconciliation or art replacement occurs merely as part of the Phase 7 shell/editor work.

## Target application architecture

### Shared production core
Production-safe modules contain only functionality required to run the game:
- canonical configuration/schema;
- asset registry/loader;
- renderer/world composition;
- character runtime;
- hazard runtime/collision;
- gameplay/stage state;
- HUD/game controls;
- production application bootstrap.

### Development/QA modules
Excluded from the production package:
- Design mode shell;
- Asset Navigator;
- contextual Inspector;
- source-region/atlas editor;
- landscape guides and layer isolation;
- collision/debug overlays not required by production;
- Runtime Monitor;
- Test-mode controls;
- configuration draft/save/export tooling.

### Bootstrap contract
Development/QA bootstrap:
`production core + design/test modules + QA shell`

Production bootstrap:
`production core + game shell only`

CI must verify that the production entry point does not import or package Design/Test modules.

## Mode architecture

### DESIGN mode
Purpose: visually author deterministic configuration.

Primary regions:
- Mode selector/header;
- Asset Navigator;
- canonical 960x540 viewport;
- contextual Inspector;
- collapsible Runtime Monitor;
- draft/save/revert status.

Asset Navigator hierarchy:
- continent;
- stage;
- Landscape: FAR / MID / GROUND / optional cloud/gap assets;
- Hazards: each ground/flying hazard;
- Character;
- Finish marker;
- Stage/global configuration.

The Inspector changes according to selected asset. It does not show every control simultaneously.

Landscape inspector exposes relevant source/render anchors, offsets, scale/parallax, opacity/visibility and guides.

Hazard inspector exposes atlas/source region, fine crop, scale, placement/ground adjustment and collision geometry. A Full Atlas view shows the complete atlas with the active source rectangle outlined so source bounds can be expanded or moved without changing atlas strategy.

Character inspector exposes state, scale, grounding/offsets, source/crop information where applicable and collision geometry.

Every precise numeric control supports typed values plus increment/decrement stepping.

### TEST mode
Purpose: validate configured gameplay, not author it.

Shows the canonical game viewport plus focused controls such as stage/character selection, run/reset, unlimited lives and optional diagnostics (collision bounds, ground surface, spawn events, timing). It does not expose landscape/hazard authoring controls.

### GAME mode
Purpose: production experience.

Shows only production HUD, viewport and player controls. No editor, QA, debug or authoring UI is present or packaged.

## Runtime Monitor
Observation only; never the primary configuration editor.

May report:
- active stage/continent;
- character/state/frame/foot coordinate;
- world scroll/progress;
- active/next hazards;
- spawn timing/phase;
- collision state;
- relevant world anchors;
- build/phase identifier in QA/development.

## Configuration editing model
Design mode uses Draft vs Saved configuration.

- Edits update the viewport immediately in memory.
- Dirty state is visible.
- REVERT restores the last saved configuration.
- SAVE/EXPORT produces deterministic configuration output/delta suitable for repository check-in.
- Runtime observation must not silently mutate saved configuration.

## Phase 7 execution checklist

### 7A — Coordinate and viewport contract
- [ ] Inventory every current coordinate/baseline/seam dependency in production runtime/config.
- [ ] Reconcile legacy 480x270 composition and current 960x540 implementation.
- [ ] Lock canonical `GROUND_SURFACE_Y` for 960x540.
- [ ] Define source-to-runtime mapping and clipping/overscan behavior.
- [ ] Define responsive viewport scaling rule without changing logical gameplay geometry.
- [ ] Add automated assertions for canonical viewport and ground-surface invariants.

Acceptance gate: one documented mathematical coordinate contract can determine the base Y of GROUND, character feet, grounded hazards and finish marker without stage-specific world seams.

### 7B — Canonical configuration schema
- [ ] Inventory current `GAME_CONFIG` fields and classify global/stage/asset/runtime/QA state.
- [ ] Separate saved authoring configuration from transient runtime state.
- [ ] Define normalized landscape configuration.
- [ ] Define normalized atlas/source-region configuration.
- [ ] Define fine crop configuration.
- [ ] Define scale/position configuration.
- [ ] Define collision configuration.
- [ ] Preserve atlas/sprite-sheet asset strategy.
- [ ] Add compatibility adapter where needed so Phase 6 behavior remains testable during migration.
- [ ] Add schema validation/invariant checks.

Acceptance gate: the same conceptual transform vocabulary can represent landscape, hazard and character assets without destroying domain-specific requirements, and existing Phase 6 stages can be represented without art changes.

### 7C — Modular application shell / bootstrap split
- [ ] Establish production bootstrap.
- [ ] Establish development/QA bootstrap.
- [ ] Ensure Design/Test code is absent from production dependency graph/package.
- [ ] Implement mode shell and mode routing without duplicating renderer.
- [ ] Preserve visible QA build identifier.

Acceptance gate: production entry runs without loading authoring/test modules; development entry can switch Design/Test/Game views around the same renderer/config.

### 7D — Design Asset Navigator
- [ ] Implement continent/stage navigation.
- [ ] Implement Landscape/Hazard/Character/Finish/Stage categories.
- [ ] Maintain selected-asset state independently of gameplay state.

### 7E — Contextual Inspector framework
- [ ] Reusable numeric field with typed input and step controls.
- [ ] Contextual control sections by asset type.
- [ ] Draft/dirty/revert/save/export infrastructure.

### 7F — Landscape editor
- [ ] FAR/MID/GROUND selection and isolation.
- [ ] Ground-surface and source-anchor guides.
- [ ] Offset/scale/parallax controls where contract permits.
- [ ] Overscan/source-bound visualization.
- [ ] Prevent calibration controls from masking contract violations.

### 7G — Hazard/atlas editor
- [ ] Preserve atlas files.
- [ ] Full Atlas view.
- [ ] Editable source rectangle X/Y/W/H.
- [ ] Fine crop L/R/T/B with zero minimum.
- [ ] Precise scale and position/ground adjustment.
- [ ] Collision W/H/X/Y visualization/editing.
- [ ] Resolve Gaudi Mosaic Bench inability to reveal full source artwork through source-region editing rather than negative crop.

### 7H — Character editor
- [ ] Character/state selection.
- [ ] Scale and grounding/offset controls.
- [ ] State/source crop visualization where needed.
- [ ] Collision visualization/editing.

### 7I — Runtime Monitor
- [ ] Collapsible observer panel.
- [ ] Character/world/hazard/collision/build state.
- [ ] No saved-config mutation from monitor.

### 7J — Test mode
- [ ] Focused run/reset/stage/character controls.
- [ ] Optional diagnostic overlays.
- [ ] No authoring controls.

### 7K — Game mode
- [ ] Production HUD/viewport/player controls only.
- [ ] Verify no Design/Test UI or code dependency in production build.

### 7L — Config persistence/export
- [ ] Deterministic save/export format.
- [ ] Stage-scoped changes are explicit.
- [ ] Global changes are explicit.
- [ ] Revert/dirty behavior verified.

### 7M — Regression, CI and deployment
- [ ] Syntax/module checks.
- [ ] Config/schema checks.
- [ ] No Base64/data URI regression.
- [ ] Production bundle excludes Design/Test modules.
- [ ] Critical Phase 6 gameplay constants remain unchanged unless separately approved.
- [ ] Representative all-continent runtime regression.
- [ ] Exact validated SHA deployed to QA.
- [ ] User acceptance test.

## Phase 7B expected output
At completion of 7B, the visible game should still behave like the approved Phase 6 build. 7B is primarily a data-contract milestone, not the finished editor UI.

Repository output will include:
- a documented canonical configuration schema;
- clear separation of authored/saved configuration from runtime/QA state;
- normalized structures for landscape transforms, atlas source regions, fine crop, scale/position and collision;
- compatibility mapping for the current nine stages so no artwork must change yet;
- schema/invariant checks suitable for CI;
- preserved Phase 6 calibration snapshot/evidence;
- no atlas explosion into individual files.

The richer visual Design/Test/Game shell begins in 7C. Asset Navigator and contextual editing arrive in 7D/7E, landscape editing in 7F and full atlas/source-region hazard editing in 7G.

## Phase 8 dependency
Do not regenerate FAR/MID/GROUND until Phase 7 is accepted. Phase 8 landscape prompts/specifications must reference `docs/WORLD_RENDERING_SPEC.md`, including the canonical viewport, locked ground surface, layer ownership, source anchors, overscan and overlap requirements.
