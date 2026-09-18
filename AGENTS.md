# Claude & Constance Around the World — AI Operating Contract

This repository is the primary source of truth for development of the Claude & Constance Around the World game.

## Mandatory startup sequence
Before modifying code, configuration, assets, or specifications, an AI/developer must read:
1. `AGENTS.md`
2. `docs/CURRENT_STATUS.md`
3. The task-specific specifications listed below.

Repository specifications override conversational memory when a documented locked requirement exists. Conversation context may clarify the current request, but it must not silently replace a locked repository requirement. If the current request conflicts with a locked specification, identify the conflict before changing production files.

## Task-specific required reading
- World/stage/landscape work: `docs/WORLD_RENDERING_SPEC.md`, `docs/ASSET_PRODUCTION_SPEC.md`, `docs/STAGE_MANIFEST.md`
- Character work: `docs/CHARACTER_SPEC.md`, `docs/GAMEPLAY_SPEC.md`, `docs/ASSET_PRODUCTION_SPEC.md`
- Hazard work: `docs/HAZARD_SPEC.md`, `docs/GAMEPLAY_SPEC.md`, `docs/QA_SPEC.md`
- Gameplay/system changes: `docs/GAMEPLAY_SPEC.md`, `docs/QA_SPEC.md`
- UI/UX work: `docs/UI_UX_SPEC.md`, `docs/GAMEPLAY_SPEC.md`
- Asset generation/replacement: `docs/ASSET_PRODUCTION_SPEC.md` plus the relevant world/character/hazard specification
- Phase 8 landscape execution and approval gates: `docs/PHASE8_LANDSCAPE_EXECUTION_PLAN.md`

## Authority model
Keep three kinds of truth separate:
- **Specification:** what production must do.
- **Implementation:** what the current code/build actually does.
- **Decision history:** why a requirement or implementation changed.

Do not promote temporary QA implementation details into production requirements without an explicit decision.

## Change discipline
- Preserve the current known-good baseline before migration or refactoring.
- Make incremental changes; do not redesign unrelated systems.
- Never regenerate, resize, rename, crop, normalize, or replace an approved asset merely for convenience.
- Configuration/calibration is for positioning correctly authored assets, not compensating for defective artwork.
- When a QA issue is reported: analyze -> state exact correction -> wait for explicit approval when the workflow calls for an approval gate -> modify -> provide a testable increment -> verify no unrelated regressions.
- For Phase 8 landscapes, use the integrated-stage approval workflow in `docs/PHASE8_LANDSCAPE_EXECUTION_PLAN.md`. Internal layer generation, rejection, regeneration and technical QA do not require separate user approval when the stage specification and references are already locked.
- Update `docs/CURRENT_STATUS.md` when the production baseline or next approved step changes.
- Append important locked decisions to `docs/DECISION_LOG.md`; do not erase historical decisions.

## Current migration rule
The legacy LAB25Q HTML is a reference/test-harness baseline, not permission for a wholesale rewrite. Migration to external assets/modules must preserve behavior and be verified incrementally against the archived baseline.

## Repository safety
`archive/` and `assets-original/` are preservation areas. Files placed there are immutable historical/source artifacts. Production-ready derivatives belong under `assets/` and application code under `src/`.
