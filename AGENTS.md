# Claude & Constance — operating contract

GitHub (`claudejones/candcgame`) is authoritative. Before changes read this file and `docs/CURRENT_STATUS.md` once. Preserve concurrent work and distinguish specifications, implementation and decision history. Explicit user directions govern scope; identify conflicts with locked requirements before modifying production.

## Asset production

For new stage artwork and the explicitly authorized fresh AF03 run, use `docs/ASSET_COMMAND_WORKFLOW.md`. One agent generates five images sequentially and saves each completed image to Git. Review and refine every image prompt before using it. No worker dispatch, coordinator reconstruction, old-output recovery, gameplay calibration or shared-branch deployment belongs in this flow.

`generate AF03 fresh` is a natural-language agent instruction defined in that document, not a shell subcommand. Start from current main on a new branch; preserve the old AF03 branches and artwork. A fresh run may use the approved brief and reference photographs, never old AF03 generated outputs. If this new run is interrupted, continue its own saved files only; do not restart its completed images.

Existing CLI helpers are utilities, not a mandatory orchestration pipeline. `finish`/legacy recovery is used only when explicitly requested for an old run. For new production, this section and ASSET_COMMAND_WORKFLOW.md take precedence over historical worker/recovery procedures. Status reports must name the branch inspected; old manifest status does not describe the fresh run.

## Scope and safeguards

- `archive/` and `assets-original/` are immutable, including `archive/LAB25Q/CHARACTER_STATE_LAB_25Q_WORLD_VISUAL_OWNERSHIP_QA.html`. Never commit `tmp/` or `assets/phase8-candidates/`.
- Never alter approved images for convenience. Approved-art revisions require explicit scope. Correct configuration defects in configuration. Preserve known-good behavior and incremental migration.
- Internal generation/technical QA for eligible locked briefs needs no separate candidate/prompt approval. Final deployed artwork approval remains explicit. Preserve CI/Pages, release and contract gates; never report unperformed checks as passed.
- From AF02, asset production ends at validated PNGs plus the versioned asset-ready handoff. Anchors, source regions, facing, animation, crops and provisional metadata belong here. Character-relative grounding, flight height, hitbox fairness, timing, difficulty and spawn balancing belong to editor-next. The user notifies the Workbench agent, imports, calibrates and saves. Artwork acceptance, calibration and playable release remain distinct.
- Retain genuine renderer/scheduler fixes and regression tests. Pause independent legacy hazard tuning. Preserve the eleven comparison candidates and calibration evidence; no silent promotion, overwrite or rollback. Coordinate handoff contract changes with the actual importer.
- Update concise CURRENT_STATUS when baseline/next action changes; append durable decisions to DECISION_LOG. Do not erase history or duplicate it in startup packets.

## Execution and output

Asset production uses one agent, one image at a time, without subagents. Keep outputs bounded: concise results, paths and failures; no full state/catalog/API/binary dumps. Read unchanged material once. Each saved image has a path, hash and actual check result. Diagnose a failed image and revise its prompt before one focused retry; if that fails, save progress and report the specific blocker. Never loop or regenerate passing images. Narrowly scoped finishing follows `docs/ASSET_TECHNICAL_FINISHING.md`.

## System changes or concrete rule conflicts

Read applicable full specifications only when changing that system/contract or resolving a conflict:
- World/landscape: WORLD_RENDERING_SPEC, ASSET_PRODUCTION_SPEC, STAGE_MANIFEST; Phase 8 gates: PHASE8_LANDSCAPE_EXECUTION_PLAN.
- Character: CHARACTER_SPEC, GAMEPLAY_SPEC, ASSET_PRODUCTION_SPEC.
- Hazards: HAZARD_SPEC, GAMEPLAY_SPEC, QA_SPEC, ASSET_PRODUCTION_SPEC.
- Gameplay: GAMEPLAY_SPEC, QA_SPEC. UI: UI_UX_SPEC, GAMEPLAY_SPEC.

All are under `docs/`. Focused profiles and their source specs must remain consistent. Temporary QA implementation is not a new production requirement.
