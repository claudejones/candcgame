# LAB25Q Implementation Reconciliation

Date: 2026-09-16
Purpose: separate verified legacy-harness behavior from current production specifications before migration.

## Status labels
- **PRESERVE:** behavior is part of the current approved baseline and must survive migration.
- **QA-ONLY:** useful diagnostic implementation; do not promote into production state/config.
- **LEGACY / RECONCILE:** present in LAB25Q/history but not automatically current product authority.
- **SPEC AUTHORITY:** repository contract controls future production implementation.

## Canvas / world geometry
**LAB25Q implementation fact:** game canvas is 960x540. The current legacy world implementation lineage uses authored source geometry `sourceW=2048`, `sourceH=682`, MID source baseline 621 and GROUND source surface 393.

**Production specification:** intended logical presentation is 480x270 with canonical `GROUND_BASELINE_Y=205` and approximately 65 logical pixels below the running surface.

**Status: LEGACY / RECONCILE.** 960x540 is exactly 2x the intended 480x270 logical viewport, but the later 2048x682 full-world asset contract is a separate evolved authoring model. Do not assume the two asset models are equivalent. The landscape audit and renderer migration must choose a deliberate production consumption model while preserving the approved visual/gameplay result.

## World backing / layer ownership
LAB25Q `.board` backing is transparent. Layer-isolation controls were added to expose FAR/CLOUDS/MID/GROUND ownership and missing coverage.

**Status:** transparent synthetic backing rule = **SPEC AUTHORITY**; layer-isolation switches = **QA-ONLY**.

Production must not restore a continent/stage fill color to conceal missing world art.

## Character action naming
Historical snapshots/assets include `duck`; later harness migration canonicalizes that action/state to `slide`. The source collection contains both `G1D_DUCK_ATLAS.png` and `G1D_SLIDE_ATLAS.png`.

**Status:** Slide = **SPEC AUTHORITY / PRESERVE**. Duck asset = historical preserved source, not current production state. Approved slide duration is 0.70s.

## Collision QA
LAB25Q lineage includes persistent-red bounds for a collided spawned hazard until that exact instance exits, with the next spawn starting green.

**Status: QA-ONLY visualization / PRESERVE in QA.** It must not alter production collision detection, timing or invulnerability.

## Hit recovery
Established harness baseline uses post-hit blinking beginning at the second hit visual frame with approximately 2.0 seconds invulnerability.

**Status: PRESERVE** during structural migration unless explicitly retuned.

## Pause
Established baseline freezes gameplay/hazards/timer/world scrolling, disables jump/slide, switches character to Idle, while the shared cloud effect may continue.

**Status: PRESERVE.**

## Hazard normalization
Legacy hazard source sheets have varied source dimensions and are calibrated through scale, crop/frame, offsets and collision geometry.

**Status: SPEC AUTHORITY.** Do not normalize hazards simply for directory/geometry uniformity. Repair only actual structural defects.

## Campaign mode / progression
Older implementation/history contains Explorer/Adventurer concepts. The later locked product direction is single campaign + Perfect Runs, stage medals, continent passports and a 21-Perfect bonus unlock.

**Status: LEGACY / RECONCILE.** Do not preserve Explorer/Adventurer merely because controls/code remain in LAB25Q. Do not implement the new progression during structural extraction unless progression is the explicitly approved migration task.

## Embedded assets
LAB25Q embeds image data directly in one large HTML file.

**Status: LEGACY architecture.** Final production uses external files. LAB25Q remains immutable as the behavioral/reference baseline.

## Shared assets
Cloud layer and finish marker carry North-America-prefixed source filenames but became reusable shared assets across later continents.

**Status: PRESERVE source names in archive; production copies belong under semantic `assets/shared/` destinations.**

## Migration guardrail
When implementation and specification differ, do not silently copy the legacy behavior into production and do not silently rewrite behavior to match an inferred design. Record the conflict, identify which document/decision is authoritative, and migrate that system in a controlled increment with QA against LAB25Q where applicable.
