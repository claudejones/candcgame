# Phase 7B — Canonical Configuration Schema

Status: IMPLEMENTED / CI validation pending
Date: 2026-09-17

## Purpose
Phase 7B separates authored production configuration, legacy Phase 6 compatibility evidence, and transient runtime/QA state without changing the visible Phase 6 game. The compatibility adapter in `src/js/config-schema.js` can represent all nine current stages while the renderer remains behavior-preserving until the later renderer/bootstrap gates.

## Coordinate authority
- logical viewport: `960 x 540`
- canonical `GROUND_SURFACE_Y = 410`
- browser/device scaling is presentation-only
- gameplay anchors never derive from a stage seam in the canonical schema

## Configuration ownership classes

### 1. Authored production configuration
Saved/check-in data that defines the game:
- stage identity and labels;
- semantic asset keys;
- landscape source anchors and transforms;
- character state/source/crop/scale/position configuration;
- hazard atlas source regions, crop, scale/position and collision;
- character collision profiles;
- canonical gameplay anchor adjustments;
- finish-marker transform and anchor adjustment;
- gameplay constants such as world speed, jump physics, Slide timing, hit recovery and spawn design.

### 2. Legacy compatibility configuration
Temporary evidence required to reproduce the user-verified Phase 6 presentation until Phase 8 regenerated landscapes replace it:
- stage `seamY`;
- current FAR Y calibration;
- current MID Y/scale/parallax calibration;
- current GROUND Y/scale/parallax calibration;
- stage-specific character grounding values tied to legacy artwork.

These values remain representable but are not production coordinate authority. In particular, `legacyRenderedSurfaceY = seamY + groundYOffset` is recorded only as compatibility evidence.

### 3. Transient runtime state
Never saved as authored configuration:
- active animation frame/timers;
- world scroll/cloud scroll;
- current jump velocity/position;
- active hazards and their live positions;
- lives/hits/cleared counters;
- current collision latch/state;
- spawn plan cursor and elapsed run time;
- pause/failure state;
- current selected stage/character/hazard when used only as session UI state.

### 4. Development/QA state
Excluded from the production authored schema and, ultimately, from the production bootstrap:
- guide visibility;
- crop/collision bounds visibility;
- layer-isolation switches;
- calibration playback controls;
- QA preview X/travel/pass state;
- control-center panel state;
- editor selection, dirty state, draft/revert state;
- runtime-monitor observations.

## Canonical transform vocabulary
All visual assets use the conceptual pipeline:

`SOURCE REGION -> FINE CROP -> SCALE -> POSITION -> GAMEPLAY ANCHOR -> COLLISION`

Domain-specific structures may omit steps that do not apply, but the meaning of a step does not change between asset classes.

### Source region
```text
sourceRegion: { x, y, w, h }
```
Defines the pixels belonging to the selected atlas item/frame. Source-region bounds may be moved or expanded. This is the correct mechanism for revealing artwork outside a currently selected region, including the Gaudí Mosaic Bench case.

### Fine crop
```text
crop: { l, r, t, b }
```
All values are non-negative. Crop only removes pixels inside the source region. Negative crop is invalid and cannot be used to reveal pixels outside the source region.

### Scale and position
```text
transform: { scale, offsetX, offsetY, parallax? }
```
Visual placement only. For production landscapes, a visual offset cannot redefine gameplay ground.

### Gameplay anchor
Grounded entity:
```text
gameplayAnchor: { type: "ground", surfaceY: 410, adjustmentY }
```
Flying entity:
```text
gameplayAnchor: { type: "flight", surfaceY: 410, clearance/altitude policy }
```
Character and finish marker use the same canonical surface authority with their own explicit adjustment.

### Collision
```text
collision: { w, h, x, y }
```
Collision is independent from source region, crop and visual transform.

## Landscape schema
A stage landscape has independent FAR/MID/GROUND records.

FAR:
```text
source: { key }
transform: { scale, offsetX, offsetY, parallax }
```
Production FAR normally maps its authored origin to world Y=0.

MID:
```text
source: { key, anchorY }
transform: { scale, offsetX, offsetY, parallax }
```
MID owns a documented source composition anchor. It overlaps FAR/GROUND in the common world viewport.

GROUND:
```text
source: { key, anchorY }
transform: { scale, offsetX, offsetY, parallax }
gameplay surface authority: 410
```
For regenerated production artwork:
`drawY = 410 - source.anchorY * transform.scale + transform.offsetY`.
The visual offset changes artwork placement only; entity gameplay anchors remain derived from 410.

## Hazard/atlas schema
Each hazard records:
- `name`, `kind`;
- `atlas.key`;
- editable `atlas.sourceRegion`;
- frame count when animated;
- non-negative fine crop;
- visual transform;
- gameplay anchor;
- collision geometry.

The adapter converts existing `rect` definitions directly into editable source regions. Animated legacy definitions using `frameW/frameH` become an initial frame source region without exploding the atlas into individual files.

## Character schema direction
Character configuration retains atlas/state semantics and separates:
- atlas/state source region;
- per-frame crop;
- master/state scale;
- render offset;
- canonical ground adjustment;
- state-aware collision.

The approved atlases and current Phase 6 numeric values are not changed by 7B.

## Compatibility adapter
`window.GAME_SCHEMA.buildCompatibilityView(window.GAME_CONFIG)` converts the current Phase 6 configuration into the Phase 7B conceptual model without mutating `GAME_CONFIG`.

For each current stage it preserves:
- exact semantic landscape asset keys;
- exact current landscape scale/offset/parallax values;
- exact legacy seam and derived legacy surface as compatibility evidence;
- exact hazard atlas/source/crop/scale/ground-adjustment/collision values;
- exact stage character-grounding values;
- exact finish scale/X/ground-adjustment values.

At the same time, every canonical character/hazard/finish gameplay anchor is explicitly rooted at `GROUND_SURFACE_Y = 410`.

The compatibility view is an architectural bridge, not permission to change the live renderer during 7B. Phase 6 remains the visible regression baseline.

## Validation invariants
CI must assert:
- canonical viewport is exactly 960x540;
- canonical ground surface is exactly 410;
- all nine stage profiles exist;
- all nine hazard lists and finish records exist;
- every canonical hazard/character/finish anchor resolves from 410;
- crop values are never negative;
- numeric transform/collision fields are finite;
- current Phase 6 gameplay constants remain guarded;
- no Base64/data URI regression;
- the adapter does not require asset changes.

## 7B acceptance result
The schema can represent landscape, hazard and character transforms with a shared vocabulary while preserving domain-specific behavior. Existing Phase 6 stages remain representable without changing artwork or the live renderer. Legacy seams remain compatibility evidence only; canonical gameplay geometry is explicitly separated and ready for the renderer/bootstrap migration in subsequent Phase 7 gates.
