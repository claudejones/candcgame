# AF01 — current recovery checkpoint

2026-09-19. Original command: `In claudejones/candcgame: build stage AF01.`

The user authorized deterministic technical finishing by answering **yes** during `resume AF01`. All five production assets are complete and deployed at `9f0b5e381667c89d714f72a859adc435920bea4a`. Internal PNG, composite, animation, collision and full-course checks pass. Development/main Production CI, exact-SHA Pages deployment, deployed asset-byte verification and live browser review also pass. AF01 is not yet user-approved.

Current QA: `docs/phase8-qa/AF01_STAGE_QA.md`. Reproducible measurements: `docs/phase8-qa/AF01_GAMEPLAY_MEASUREMENTS.json`. Production asset hashes and measured metadata: `config/stage-releases.json`. Recovery jobs: `config/asset-workflow-state.json`.

Original selected sources remain immutable under `assets-original/africa/af01/`; their hashes and original image-generation attempts remain in `docs/phase8-qa/af01-production/SELECTED_SOURCES.json` and generation logs. Do not regenerate the completed assets.

Next: return the deployed review link, https://claudejones.github.io/candcgame/src/dev.html, and ask for one complete-stage acceptance. Select Africa → Tanzania — Serengeti savannah. The exact successful runs are recorded in `AF01_STAGE_QA.md` and workflow state. The final evidence checkpoint is on `work/assets/af01`; the deployed runtime remains the validated commit above. Preserve concurrent editor-next/calibration work and the eleven existing comparison candidates. Do not begin AF02 until AF01 is accepted.

Copy-ready continuation: `In claudejones/candcgame: resume AF01.`

After review: `In claudejones/candcgame: approve AF01.`
