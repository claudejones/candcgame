# Current Status

Last updated: 2026-09-16

## Current reference baseline
`CHARACTER_STATE_LAB_25Q_WORLD_VISUAL_OWNERSHIP_QA.html`

LAB25Q is the current reference/test-harness baseline. It introduced transparent board backing and transient FAR/CLOUDS/MID/GROUND isolation controls. It exposed previously hidden world-layer coverage problems. It is not yet the final production architecture.

## Completed content
- Game scope: 7 continents x 3 stages = 21 stages.
- North America stages and South America stages have been integrated and extensively calibrated in the legacy harness.
- Europe EU01 Greece/Santorini, EU02 Paris, EU03 Barcelona assets have been produced and integrated for QA.
- Character state atlases and shared gameplay systems have established approved baselines.
- Persistent-red collision QA behavior is established in the current harness.

## Current workstream
Repository migration and source-of-truth recovery.

The project is moving from a large self-contained HTML test harness with embedded image data to a mobile-first web application with external assets, configuration, source modules, and repository-based specifications.

## Important finding under active review
The original production world specification used a logical 480x270 presentation with `GROUND_BASELINE_Y = 205`, approximately 65 logical pixels below the running surface, wide seamless DISTANT/MID layers, and short repeating GROUND pieces. Later QA integration evolved to a 960x540 harness and 2048x682 authored-world geometry. These are implementation/history facts that must be reconciled deliberately; the later QA geometry must not silently overwrite the intended production specification.

LAB25Q removal of the legacy synthetic board color exposed insufficient authored vertical coverage/overlap in some world assets. Landscape production requirements are being formalized around layer responsibility and adequate independent positioning range.

## Exact next approved step
1. Preserve the supplied LAB25Q baseline and original generated assets without alteration.
2. Inventory supplied assets and map them to stages/systems.
3. Complete repository specifications from established decisions and source evidence.
4. Audit the 27 existing NA/SA/EU landscape assets against the finalized landscape contract.
5. Classify each landscape asset KEEP / REPAIR / REGENERATE before altering any landscape art.
6. Only after preservation/specification/audit, begin incremental migration from embedded assets/configuration to the external production directory structure.

## Do not do yet
- No wholesale LAB25Q rewrite.
- No landscape regeneration until the asset audit is complete.
- No destructive asset cleanup or renaming of originals.
- No canvas-height change as a workaround for incomplete world-layer coverage.
