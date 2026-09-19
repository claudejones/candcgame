# Hazard Specification

Status: initial recovery of established hazard production/gameplay rules.

## Stage pacing pattern
Established stage hazard pacing:
- Warmup: 0–10%
- Establish: 10–30%
- Develop: 30–55%
- Pressure: 55–75%
- Signature: 75–85%
- Finish: 85–90%

Established constraints include maximum visible hazards of 2 and reaction lead around 2.2 seconds in the legacy baseline. Stage signatures are intentionally unique; do not rewrite North America signatures during structural migration.

## Hazard classes
Ground hazards may be stationary or moving and are calibrated with visual scale, ground offset, crop/frame settings and collision geometry. Flying hazards support HIGH/LOW placement.

## Source asset policy
Do not normalize hazard canvases merely because sheets have different source dimensions. Repair/regenerate only when source structure prevents clean integration: bad gutters, unstable animation anchors, contaminated crop, unusable frame layout, or incomplete animation.

## Facing at runtime

Source facing and gameplay facing are separate. Preserve the right-facing flying source-art contract. Animals that approach the player from the right must face left in gameplay; a per-hazard `flipX` flag mirrors the selected sprite frame, its source-anchor placement and its collision box together. Keep crop coordinates and collision offsets in source space. Do not reverse animation order or regenerate otherwise valid art for facing alone. The same facing applies in Design, Test, Game and cropped previews; the full-atlas view continues to show the actual source pixels. Existing hazards remain unchanged unless explicitly revised. AF01's porcupine and roller use this correction; its termite mound does not.

## Flying flock contract
Every creature in a multi-creature flock must visibly animate across the complete cycle. Each creature requires explicit pose change, stable body anchor and readable wing silhouette. Maintain stable aggregate collision footprint. Prefer two creatures to a three-creature formation with a static/hidden member.

## Asset handoff and calibration ownership

For remaining-stage production from AF02, the asset agent supplies validated artwork plus source regions, ground/body anchors, crops, source facing, intended gameplay facing, frame order and usable starting scale/body bounds. Inspect basic rendering and believable size against the character reference. These starting values are provisional, not accepted gameplay calibration.

The user notifies the editor-next Workbench agent, which imports the versioned asset-ready handoff. Iterative grounding/flight-height tuning, hitbox fairness, action timing, difficulty and spawn-spacing balancing belong to that calibration phase; the user reviews and saves the result. Artwork acceptance and later playable-release acceptance remain explicit. Preserve genuine renderer/scheduler fixes and regression tests. Do not require repeated zero-hit courses merely to deliver assets, and never mark an unperformed gameplay check as passed.

## Collision QA — calibration and playable release
The QA harness may latch an individual spawned hazard's bounds red after collision until that instance exits. This is diagnostic state only and does not alter collision mechanics.

Calibration must exercise the complete timed Jump or Slide through the full hazard pass for both characters, including HIGH/LOW flying modes and configured speeds. A clear jump apex or an indefinitely held Slide pose does not prove avoidance. Keep the established character reference and movement physics fixed; fit hazard scale and solid-body collision to that reference, then inspect readability at gameplay size. Record measured timing windows as technical evidence, not as user acceptance or a new difficulty setting.

## Migration
Preserve current hazard timing, placement patterns, crop/calibration values, collision geometry and stage signatures while externalizing assets/configuration.
