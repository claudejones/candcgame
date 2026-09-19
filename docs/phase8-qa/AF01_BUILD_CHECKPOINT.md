# AF01 — current recovery checkpoint

2026-09-19. Original command: `In claudejones/candcgame: build stage AF01.`

The user authorized deterministic technical finishing by answering **yes** during `resume AF01`. All five production assets are now complete and locally integrated. Internal PNG, composite, animation, collision and full-course checks pass. AF01 is not yet user-approved.

Current QA: `docs/phase8-qa/AF01_STAGE_QA.md`. Reproducible measurements: `docs/phase8-qa/AF01_GAMEPLAY_MEASUREMENTS.json`. Production asset hashes and measured metadata: `config/stage-releases.json`. Recovery jobs: `config/asset-workflow-state.json`.

Original selected sources remain immutable under `assets-original/africa/af01/`; their hashes and original image-generation attempts remain in `docs/phase8-qa/af01-production/SELECTED_SOURCES.json` and generation logs. Do not regenerate the completed assets.

Next: finish development Production CI → identical tree on main → main CI → Pages → deployed browser review, then ask for one complete-stage acceptance. If those gates are recorded as complete in workflow state, return the review link instead. Preserve concurrent editor-next/calibration work and the eleven existing comparison candidates. Do not begin AF02 until AF01 is accepted.

Copy-ready continuation: `In claudejones/candcgame: resume AF01.`
