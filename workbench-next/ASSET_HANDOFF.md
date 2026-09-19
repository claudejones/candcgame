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

## Update the real workflow contracts together

The upstream workflow still couples a complete asset handoff to calibrated gameplay. `AGENTS.md` (bounded asset delegation), `docs/ASSET_COMMAND_WORKFLOW.md`, `docs/asset-profiles/hazard.md`, `docs/HAZARD_SPEC.md`, `scripts/integrate-stage.mjs`, `src/js/stage-contract.js` and their tests need a coordinated owner update before the next trial. In particular, the current release validator requires `contacts`, `collision` and `finish` checks as well as art checks before activating a stage. A prose-only change is insufficient.

Introduce a truthful asset-ready handoff separately from calibrated/playable release readiness. Do not mark an unrun check as passed or weaken the later gameplay release gate. The Workbench importer must consume that asset-ready handoff when the coordinator establishes its versioned schema. This asset-only import contract is a next integration step, not a feature claimed complete by AF01 import: AF01 already supplies the current complete release contract.

No new master workflow is created by this note. It records the requested correction for the production-workflow owner to apply to the existing authoritative runbook and validators. This Workbench increment does not edit shared production instructions or promote new art acceptance.

## Facing rule for future stages

Record source facing and gameplay facing separately. Directional creatures/vehicles approaching from the right should face left. Mirror only those whose source requires it. Preserve source pixels, source-space crop coordinates and animation order; reflect the collision X offset and anchor placement with the art. Full atlas stays unmirrored; Frame and Scene show gameplay facing. Objects with no meaningful front do not need automatic flipping.

The AF01 integration audit also found the SA02 llama and EU02 bicycle need mirroring; existing NA/SA/EU birds already face left. Workbench defaults now mirror those two plus AF01's porcupine/roller. A saved per-hazard override is available. Runtime promotion of the additional llama/bicycle settings remains part of the eventual approved Workbench configuration handoff; production main was not retuned by this increment.
