> Current scope supersedes older Test/Game notes below: two visible modes, Design and Game. Preserve and reuse Design machines/previews/calibration. Extract only missing approved LAB25Q HUD/controls/assets using the same implementation patterns. No legacy-director replacement. Current matching checked Design sequences can feed manual Game play. See current project WORKBENCH_RUNTIME_STATUS.md before resuming; browser visual approval and standalone build remain pending.

# Resumption checkpoint — September 21, 2026

## Current deliverable

C&C Workbench — Design Preview: https://candc-workbench-next.claudejones.chatgpt.site
Sites project: appgprj_6aadf9bb7cf08191b8dce9d7ada54bba
Last confirmed live version: 32; Review 25 · Playable modes.
Last source commit: d42f45b61529ef1b998fe5e938a65cb445bfa653.

All 21 stages have assets in Workbench. Recent completed changes: AN03 imported, SA03 MID replaced, AF02 MID replaced with herd artwork. Preserve corrected OC01 MID and AF03 MID as well. Later stages have provisional settings; user has not completed configuration review. The first playable milestone is now live: Test and clean Game stage previews share a detached snapshot of the current draft. All21 stages, both characters and three difficulties are available. Test has start/pause/restart, keyboard/touch jump/slide, frame stepping, slow motion, collision outlines and unlimited lives. Game preview has finite lives and hides diagnostics; it has no saved progression or final menus. Build Game remains unimplemented.

Read authoring/docs/WORKBENCH_RUNTIME_STATUS.md first for the current milestone and limitations. New runtime modules: dist/workbench-next/play-runtime.mjs and play-ui.mjs. Tests: authoring/play-runtime-qa.mjs and play-ui-qa.mjs. Automated126 stage/character/difficulty runs, damage/recovery,60/120Hz event parity, unchanged draft exports, real PNG rendering and UI event harness passed. Browser layout and physical mobile review remain pending. No source artwork or defaults changed.

Next: user review of NA01 Design→Test→Design, then progression/UI contract and standalone packaging. Existing finish-marker and stun-stars PNGs are absent from this Site despite catalog entries; restore originals rather than regenerate. Current stage completion uses a text overlay, and hits use the approved character hit poses/blinking without stars. The preview director is deterministic but not the full legacy phased/signature director. Do not claim final gameplay release, optimization acceptance, or GitHub sync.

## Source locations and recovery

Last scratch root: /workspace/scratch/8cc6746c2243 (may be pruned).
- workbench-oc02: Sites Git checkout; dist/ is deployed static runtime, authoring/ holds import helpers, manifests, migrations and QA.
- oc02-editor: reconstructed working editor, not a Git checkout; combines dist/ with authoring/.
- .openai/hosting.json in the Site checkout identifies the project and static directory dist.

For missing scratch source, use current Sites source credentials and clone the existing project's configured repository/branch. Do not create a replacement Site. Reconstruct the temporary editor by copying dist contents and overlaying authoring contents. Credentials belong only in per-command authorization, never files, URLs or skill references. Read current Sites building/hosting instructions; publish using native tools.

GitHub claudejones/candcgame remains the canonical production project; historical branch modular-parity-validation and draft PR #1 require fresh verification if used. Its legacy dev URL is https://claudejones.github.io/candcgame/src/dev.html. Recent Site imports have NOT been synchronized to GitHub. Do not claim Site publication updates GitHub or the standalone production game. Read AGENTS.md and current status/workflow documents before work in that repository. Preserve user-owned archive/LAB25Q/CHARACTER_STATE_LAB_25Q_WORLD_VISUAL_OWNERSHIP_QA.html if present.

## Relevant modules

workbench-next/project.mjs: draft, provenance and migrations.
model.mjs, frame-editor.mjs: descriptors and crop/frame state.
landscape.mjs: stage descriptors and landscape rendering.
scene-model.mjs, calibration-settings.mjs: placement and scene geometry.
runtime-rules.mjs: extracted production movement/intersection rules.
calibration-engine.mjs: solver and Design sequence simulation.
app.mjs, project-ui.mjs, scene-ui.mjs: existing UI.
PLAN.md and AUDIT.md: historical implementation notes; verify current code.

Authoring adds source-files.json, build-catalog.cjs, import-asset-handoff.mjs, imported-handoffs.json, project-migrations.json, config/asset-handoffs and QA scripts. Do not expect authoring-only files in deployed dist.

Packaging note: the installed Sites packaging helper repeatedly produced truncated gzip archives in this environment in earlier turns. An uncompressed Python tar of dist plus dist/.openai/hosting.json was validated and accepted as a bounded fallback. Follow current tool contracts; do not assume future environments share that fault. Never package the source checkout or expose authoring internals as the game build.
