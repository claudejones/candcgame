# QA Specification

## Purpose
QA must verify visual composition, gameplay behavior, collision behavior, calibration, and migration regressions without turning temporary QA controls into production configuration.

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
