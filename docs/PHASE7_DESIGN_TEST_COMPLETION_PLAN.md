# Phase 7 Design / Test Completion Plan

Status: ACTIVE EXECUTION PLAN
Date: 2026-09-17

## Purpose
Complete the Phase 7 authoring/QA architecture before Phase 8 by restoring the useful LAB25Q test capabilities in their correct mode and adding reusable per-frame animated-sprite inspection/correction. Do not recreate the old Control Center as one large panel.

## Placement rule
DESIGN answers: **What is this asset/configuration, and how should it be authored?**
TEST answers: **Does the authored configuration behave correctly under controlled gameplay conditions?**
GAME remains player-facing only.

## DESIGN responsibilities
### Landscape
- FAR/MID/GROUND selection and layer isolation.
- Source/transform values: scale, offsets, parallax.
- Canonical surface/grounding guides.
- Stage/global authored configuration.

### Hazard
- Hazard selection through Asset Navigator.
- Full atlas/source-region view.
- Source Region X/Y/W/H.
- Animation metadata: frame count and playback FPS where applicable.
- Active animation frame selection: Previous / Next / direct frame indicator.
- Play/Pause animation preview.
- Per-frame Fine Crop L/R/T/B for animated hazards.
- Whole-asset Fine Crop for non-animated hazards.
- Transform/placement and gameplay anchor.
- Collision geometry.
- Full-atlas highlight for complete source region plus active-frame highlight.
- Scene preview at configured gameplay scale.

Per-frame crop must affect rendering for that frame only. Scale, placement, gameplay anchor and collision remain hazard-level settings.

### Character
- Claude/Constance asset authoring.
- State selection: Idle / Run / Jump / Slide / Hit / Celebrate.
- Individual frame stepping/inspection.
- Per-frame character crop.
- State scale/placement/grounding.
- State-aware collision geometry.
- Asset/crop/collision guides.

### Finish Marker
- Approved asset preview.
- Scale, X offset and ground adjustment.

### Persistence
- REVERT / SAVE STAGE / SAVE CHARACTER / SAVE ALL LOCAL.
- EXPORT STAGE / EXPORT GAME CONFIG / IMPORT GAME CONFIG.
- Browser localStorage only; no Git/source writes from authoring UI.

## TEST responsibilities
TEST is a controlled behavior harness, not a configuration editor.

### Context
- Stage selection.
- Character selection.
- Selected hazard selection for focused passes.

### Character behavior
- Run / Pause / Resume focused preview.
- Select/trigger Run, Idle, Jump, Slide, Hit, Celebrate for behavioral inspection.
- Frame Step while paused for controlled inspection.
- Normal-speed / Slow Motion preview where supported by preserved runtime.

### Hazard behavior
- Selected-hazard Play Pass / Pause Pass / Reset Pass.
- Ground hazards run at authored placement/configuration.
- Flying hazards expose HIGH / LOW test altitude; HIGH validates Slide clearance, LOW validates Jump clearance.
- Selected hazard uses the same current Design draft configuration; no export/reload between Design and Test.

### Full course
- RUN 90-second stage course / PAUSE / RESET.
- Unlimited Lives.

### Diagnostic overlays
- Unified Collision Bounds toggles character + hazard bounds together.
- Ground Guide.
- Runtime Monitor remains observational.

## Explicit exclusions
- TEST does not edit source regions, crop, scale, placement, collision dimensions, grounding or animation configuration.
- DESIGN does not become the 90-second gameplay course harness.
- GAME contains no Design/Test/QA authoring controls.
- Do not restore the monolithic legacy Control Center.

## Animated hazard schema extension
Canonical animated hazards gain:
- `atlas.frames`
- `animation.fps`
- `animation.frameCrops[]`, one `{l,r,t,b}` object per frame.

Compatibility rule:
- Existing hazard-level `crop` remains the default/base crop.
- When `animation.frameCrops[frame]` exists, runtime uses that frame crop for the active animation frame.
- Existing configs without `frameCrops` render identically.
- Import/export/localStorage carry frame crops deterministically.

Render pipeline becomes:
**ATLAS SOURCE REGION -> ACTIVE FRAME -> PER-FRAME CROP -> SCALE -> POSITION -> GAMEPLAY ANCHOR -> COLLISION**

## Execution blocks
### Block D1 — Schema + runtime support
1. Extend canonical hazard schema with animation FPS and frame crops.
2. Preserve compatibility for existing hazard-level crop.
3. Update runtime ObjectQA drawing to resolve crop by active frame.
4. Bridge current draft hazard settings into runtime without changing approved gameplay constants.

### Block D2 — Design animated-sprite editor
1. Add Animation Preview under Full Atlas View for hazards with frames > 1.
2. Previous/Next frame, frame N/N indicator and Play/Pause.
3. Full-atlas active-frame highlight inside overall source-region highlight.
4. Fine Crop controls edit selected frame only for animated hazards.
5. Non-animated hazards retain existing Fine Crop behavior.
6. Scene preview follows selected/playing frame.

### Block T1 — Focused Test harness
1. Add selected Hazard selector synchronized to stage definitions.
2. Add focused Character controls: state selection, Pause/Resume, Step, Slow/Normal.
3. Add selected Hazard Pass: Play/Pause/Reset.
4. Flying hazard only: HIGH/LOW selector.
5. Preserve full-course RUN/PAUSE/RESET and Unlimited Lives.
6. Keep unified collision + ground guide diagnostics.
7. Test reads current Design draft; no persistence mutation.

### Block V — Regression / CI / deploy
1. CI validates per-frame crop schema and runtime selection.
2. CI validates Design/Test production boundary.
3. CI validates TEST hazard pass and HIGH/LOW controls.
4. Preserve 960x540, Y410, characterX220, worldSpeed120, Slide .75 runtime baseline, recovery1.10, invulnerability2.00, flying68/18, maxVisible2, reactionLead2.20 and approved Constance Slide crop.
5. Production CI exact SHA.
6. Deploy exact accepted SHA to Pages.
7. User performs complete Phase 7 Design/Test/Game validation.

## Acceptance criteria
- Animated barrel/bird hazards can be stepped frame-by-frame and played in Design.
- A contaminated frame can be cropped independently without changing neighboring frames.
- Full Atlas View identifies both the animation source and active frame.
- TEST can select a hazard, play/pause/reset a focused pass and select HIGH/LOW for flying hazards.
- TEST can exercise/inspect individual character states and step paused animation.
- TEST can run/pause/reset the full 90-second course.
- Design changes flow directly into Test preview.
- No restored QA capability appears in production GAME.
- CI and exact-SHA Pages deployment pass before user testing.
