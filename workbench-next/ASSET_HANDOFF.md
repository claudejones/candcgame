# Asset production → Workbench handoff

User direction, 2026-09-19: asset creation finishes separately. Claude notifies the Workbench agent when a complete stage set is ready. The Workbench agent integrates those assets, Claude calibrates and saves the project, and then proceeds to the next stage. Do not insert Workbench calibration into asset-generation jobs.

## Keep with asset production

- Research and the agreed stage/character art direction.
- Five final PNGs: FAR, MID, GROUND, a two-ground-hazard atlas and a flying atlas.
- Dimensions, actual transparency, seams, landscape coverage/overlap and zero-offset contract checks; atlas gutters, correct frame order and every constituent creature's animation.
- Explicit source regions, per-frame crops where required, source contact/body anchors, source facing, intended gameplay facing, cache hashes and asset paths. Basic scale/readability and solid-body metadata may be starting suggestions; they are not accepted gameplay calibration.
- Fix defective images. Preserve valid source pixels when a runtime transform solves facing.
- Durable completed files/metadata and an asset-specific QA record. Retain useful findings and regression evidence.

## Move to the calibration/validation workstream

- Iterative grounding/flight-height tuning against the two character references.
- Hitbox fairness, Jump/Slide timing-window optimization, difficulty balancing and spawn-spacing tuning.
- Repeated zero-hit full-course runs used to tune hazards until a difficulty target passes.
- User-specific overrides, approval of optimized proposals and the saved calibration configuration.

Runtime correctness remains engineering work: for example, a scheduler missing spawns, drawing/collision transform disagreement or a source-anchor bug must be fixed and regression-tested. It must not be hidden with calibration values. Actual game release validation/CI is still required before publishing a playable release.

## Separate readiness contracts

Asset-handoff schema v1 now represents truthful asset readiness separately from calibrated/playable release readiness. It requires technical, composition, animation and basic-rendering evidence while both downstream states remain `pending`. The later release validator retains its contacts, collision, finish and signature gates. An asset-ready handoff never activates a stage or labels an unrun gameplay check as passed.

## Workbench importer

`node workbench-next/import-asset-handoff.mjs --bundle FILE --source-root REPOSITORY` consumes asset-handoff schema v1. The source repository bundle remains the provenance record; the Workbench stores byte-identical files at their reserved canonical paths together with the exact SHA-256 hashes and authored starting metadata.

The import is transactional across preview bytes, handoff metadata, the generated asset catalog and project migration. Validation failure leaves all four unchanged. A new stage is registered only in the Workbench Design preview as `asset-ready · calibration pending`. The importer does not change the production stage status, activate the runtime stage or create finish, contact, signature or collision-pass evidence. Its provisional collision values are editable starting values and its generated compatibility finish record is an internal neutral placeholder, never release metadata.

Existing saved projects migrate from their recorded provenance: prior stages and every calibration/lock field are retained, while the newly imported stage receives defaults and empty calibration certificates. Reimporting identical bytes is idempotent. Differing bytes require a separate explicit artwork-refresh migration.

This Workbench increment consumes that shared contract without promoting new art acceptance.

## Facing rule for future stages

Record source facing and gameplay facing separately. Directional creatures/vehicles approaching from the right should face left. Mirror only those whose source requires it. Preserve source pixels, source-space crop coordinates and animation order; reflect the collision X offset and anchor placement with the art. Full atlas stays unmirrored; Frame and Scene show gameplay facing. Objects with no meaningful front do not need automatic flipping.

The AF01 integration audit also found the SA02 llama and EU02 bicycle need mirroring; existing NA/SA/EU birds already face left. Workbench defaults now mirror those two plus AF01's porcupine/roller. A saved per-hazard override is available. Runtime promotion of the additional llama/bicycle settings remains part of the eventual approved Workbench configuration handoff; production main was not retuned by this increment.

## First real handoff — AF02

Review 12 imports `config/asset-handoffs/af02.json` from upstream `bf5d788` using the shared v1 importer. All five hashes and provisional metadata are preserved. Known older project migration routes are retargeted together with the new ten-stage route; AF02 starts with empty calibration certificates. Import updates only the isolated Workbench. Production AF02 activation stays pending. Claude can select Africa → AF02, review/calibrate and Save all / Export all. No AF03 import or asset generation is included.
