# Claude & Constance — operating contract

GitHub (`claudejones/candcgame`) is authoritative. Before changes read this file and `docs/CURRENT_STATUS.md` once. Preserve concurrent work and distinguish specifications, implementation and decision history. Explicit user directions govern scope; identify conflicts with locked requirements before modifying production.

## Routine asset commands

Resolve `help`, `status`, `build`, `generate`, `regenerate`, `revise`, `verify`, `publish`, `resume`, `approve`, `rollback` with `node scripts/assets.mjs <command>`. Read `docs/ASSET_COMMAND_WORKFLOW.md` once for production. This replaces the full-spec startup list below for routine commands. Read only the selected operation/file rules and actual reference images. Resume/status/publication must not preload generation profiles or old runs. Use the known connected publication route; do not probe terminal credentials or search chat history during ordinary startup.

At every stage/continent closeout run `node scripts/assets.mjs handoff` and provide the next fully completed command. The user supplies no workflow fields and need not append “Follow AGENTS.md.” Setup applies across continents. Git is durable; scratch is not. Resume must inspect the stage recovery branch, even when main says no active work. Never regenerate recoverable completed bytes.

## Scope and safeguards

- `archive/` and `assets-original/` are immutable, including `archive/LAB25Q/CHARACTER_STATE_LAB_25Q_WORLD_VISUAL_OWNERSHIP_QA.html`. Never commit `tmp/` or `assets/phase8-candidates/`.
- Never alter approved images for convenience. Approved-art revisions require explicit scope. Correct configuration defects in configuration. Preserve known-good behavior and incremental migration.
- Internal generation/technical QA for eligible locked briefs needs no separate candidate/prompt approval. Final deployed artwork approval remains explicit. Preserve CI/Pages, release and contract gates; never report unperformed checks as passed.
- From AF02, asset production ends at validated PNGs plus the versioned asset-ready handoff. Anchors, source regions, facing, animation, crops and provisional metadata belong here. Character-relative grounding, flight height, hitbox fairness, timing, difficulty and spawn balancing belong to editor-next. The user notifies the Workbench agent, imports, calibrates and saves. Artwork acceptance, calibration and playable release remain distinct.
- Retain genuine renderer/scheduler fixes and regression tests. Pause independent legacy hazard tuning. Preserve the eleven comparison candidates and calibration evidence; no silent promotion, overwrite or rollback. Coordinate handoff contract changes with the actual importer.
- Update concise CURRENT_STATUS when baseline/next action changes; append durable decisions to DECISION_LOG. Do not erase history or duplicate it in startup packets.

## Delegation and output

One coordinator, at most two focused workers, no nested managers. Use fresh scoped context and actual references. Prefer `gpt-5.6-sol` medium for production, `gpt-5.6-luna` for narrow support when available. Workers own isolated outputs; coordinator owns shared registry/state/integration/publication. Help/status and single-image edits stay single-agent. Operation details: `docs/ASSET_EXECUTION_REFERENCE.md` (selected section only).

Keep outputs bounded: concise results, paths and failures; no full state/catalog/API/binary dumps. Read unchanged material once. Reuse validated unchanged local work; CI is independent. Measure attempts, output size and recovery reuse; do not claim a fixed context capacity or subscription usage percentage. Diagnose repeated defects before another generation; narrowly scoped finishing follows `docs/ASSET_TECHNICAL_FINISHING.md`.

## System changes or concrete rule conflicts

Read applicable full specifications only when changing that system/contract or resolving a conflict:
- World/landscape: WORLD_RENDERING_SPEC, ASSET_PRODUCTION_SPEC, STAGE_MANIFEST; Phase 8 gates: PHASE8_LANDSCAPE_EXECUTION_PLAN.
- Character: CHARACTER_SPEC, GAMEPLAY_SPEC, ASSET_PRODUCTION_SPEC.
- Hazards: HAZARD_SPEC, GAMEPLAY_SPEC, QA_SPEC, ASSET_PRODUCTION_SPEC.
- Gameplay: GAMEPLAY_SPEC, QA_SPEC. UI: UI_UX_SPEC, GAMEPLAY_SPEC.

All are under `docs/`. Focused profiles and their source specs must remain consistent. Temporary QA implementation is not a new production requirement.
