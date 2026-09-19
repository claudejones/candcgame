# QA Specification

## Purpose
QA must verify visual composition, gameplay behavior, collision behavior, calibration, and migration regressions without turning temporary QA controls into production configuration.

## Separate readiness gates

Asset-ready means the five new-stage PNGs, their source/anchor/facing metadata and the recorded technical, composition, animation and basic-rendering checks are complete. It does not activate a playable stage. Verify dimensions/alpha, seams/coverage at zero landscape offsets, source regions, animation, source anchors, believable size and the exact handoff hashes. Preserve artwork acceptance as a user decision.

Calibration happens in editor-next after import: the user reviews and saves grounding, flight height, collision fairness, action timing and difficulty/spawn settings. Playable release still requires the complete release contract and its contact, collision, finish and gameplay validation. Repeated zero-hit full-course runs are not required for an asset-ready handoff. Missing calibration or release checks stay pending; a preview, successful import or CI run cannot satisfy them. Keep renderer/scheduler regression tests and historical calibration evidence, including the eleven comparison candidates.

## Current reference harness
LAB25Q is the current behavioral/visual QA reference baseline.

Established harness capabilities include stage/hazard selection, Run/Jump/Slide controls, individual hazard pass controls, HIGH/LOW flying mode, collision state visualization, world/hazard/character calibration controls, selected-hazard config export, full QA snapshot export, and local checkpoint save/restore.

LAB25Q additionally provides transient FAR/CLOUDS/MID/GROUND layer visibility isolation and a transparent world backing assertion.

## QA-only state
Diagnostic visibility switches and similar test controls must remain transient. Do not serialize them into production world profiles or production configuration.

## Collision visualization
Current QA behavior intentionally latches a collided spawned hazard's bounds red until that exact hazard exits. A subsequent spawn starts green. This is diagnostic visualization and must not change collision detection, timing, or invulnerability behavior.

## World-layer isolation sequence
When diagnosing landscape ownership/coverage:
1. Disable all world layers and verify there is no synthetic continent/stage world color.
2. FAR only: verify complete base scenery/coverage for intended calibration.
3. FAR + CLOUDS: verify shared effect ownership.
4. FAR + CLOUDS + MID: inspect intentional transparency, coverage, overlap and seams.
5. Add GROUND: inspect playable-surface alignment, terrain depth and full composition.

Black/transparent application backing exposed during isolation is a diagnostic missing-coverage signal, not scenery to conceal with a synthetic fill.

## Migration regression rule
During externalization/refactoring, compare each extracted system with the archived LAB25Q behavior before removing/replacing the legacy implementation. No unrelated gameplay changes are allowed during structural migration.
