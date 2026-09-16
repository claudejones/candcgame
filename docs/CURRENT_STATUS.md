# Current Status

Last updated: 2026-09-16

## Current reference baseline
`archive/LAB25Q/CHARACTER_STATE_LAB_25Q_WORLD_VISUAL_OWNERSHIP_QA.html`

LAB25Q is the current reference/test-harness baseline. It introduced transparent board backing and transient FAR/CLOUDS/MID/GROUND isolation controls. It exposed previously hidden world-layer coverage problems. It is not yet the final production architecture.

## Preservation checkpoint — COMPLETE
- Exact LAB25Q Git blob preserved under `archive/LAB25Q/`.
- Entire uploaded asset source tree preserved unchanged under `assets-original/current-generated/` using the original Git tree/blob objects.
- Original `/incoming` ingestion remains intact for provenance.
- Inventory recorded in `docs/ASSET_INVENTORY.md`.
- Uploaded collection: 63 files = 1 LAB25Q HTML + 60 PNG game assets + 2 `.DS_Store` metadata files.
- All 27 current NA/SA/EU landscape PNGs are accounted for.

## Landscape audit checkpoint — COMPLETE
Technical audit recorded in `docs/LANDSCAPE_AUDIT.md` using GitHub Actions run `35131578854`.

Current production dispositions:
- KEEP: 21 landscape assets
- REPAIR: 6 landscape assets
- REGENERATE: 0 landscape assets

Repair candidates:
- NA02 MID + GROUND
- EU01 MID + GROUND
- EU02 MID + GROUND

All nine FAR layers are fully opaque foundations and remain KEEP. South America remains intact subject to production-composition visual regression QA. EU03 remains intact unless the production logical harness exposes an actual composition failure.

## Completed content
- Game scope: 7 continents x 3 stages = 21 stages.
- North America stages and South America stages have been integrated and extensively calibrated in the legacy harness.
- Europe EU01 Greece/Santorini, EU02 Paris, EU03 Barcelona assets have been produced and integrated for QA.
- Character state atlases and shared gameplay systems have established approved baselines.
- Persistent-red collision QA behavior is established in the current harness.

## Current workstream
Incremental repository migration from the preserved LAB25Q harness to external production assets/configuration/modules.

The original production world specification uses a logical 480x270 presentation with `GROUND_BASELINE_Y = 205`. Later QA integration used a 960x540 harness and larger authored-world source geometry. The technical audit confirms that file dimensions/source rows alone cannot determine production acceptance; coordinated composition at the canonical logical baseline is the next gate.

## Exact next approved step
1. Establish a production logical world-composition QA harness at 480x270 with `GROUND_BASELINE_Y=205`, transparent backing, FAR/MID/GROUND isolation, and overscan/coverage visualization.
2. Load the 21 KEEP landscape assets as external files without altering their archived originals.
3. Visually regression-test the nine stage sets at the canonical production composition.
4. Confirm or revise the six REPAIR dispositions from actual production composition evidence.
5. Only then repair flagged landscape artwork one file at a time under the approval gate.
6. Continue incremental migration of external configuration/modules after world composition is stable.

## Do not do yet
- No wholesale LAB25Q rewrite.
- No destructive asset cleanup or renaming of originals.
- No canvas-height change as a workaround for incomplete world-layer coverage.
- No landscape regeneration; the audit currently identifies zero REGENERATE assets.
- Do not treat `G1D_DUCK_ATLAS.png` as current production state; G1D is Slide under the current locked specification.
