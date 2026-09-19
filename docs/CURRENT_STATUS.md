# Current status

Updated 2026-09-19. GitHub is authoritative. Historical explanations live in DECISION_LOG; command execution lives in ASSET_COMMAND_WORKFLOW.

- Phases 0–7 are complete; Phase 7 modular Design/Test/Game authoring was user-accepted.
- Phase 8 landscape acceptance is complete for all 27 NA/SA/EU layers: NA01–NA03, SA01–SA03 and EU01–EU03 are approved. North America, South America and Europe landscape regression gates have passed. EU03 was explicitly approved on 2026-09-19. Required dependent calibration and full contract promotion are still pending.
- Latest approved artwork snapshot before command-workflow setup: main `660aa55e35b378e613e07d8315074552620fcb61`. SA01 MID retains the snake and removes the monkey; SHA-256 `8e5653f5dfc7dea8254521f445e2609eebf3b1e0c683c64e4ffab38755519f03`.
- Approved validation assets remain under `assets/phase8-validation/`; packaged production keeps its legacy assets. No artwork is replaced by the command-workflow setup. NA03 GROUND's approved 2170×725 exception remains unchanged.
- Canonical integrated landscapes: source width 2172, viewport 960×540, ground surface 410, FAR/MID/GROUND offsets 0, scale multipliers 1.25/1/1, MID/GROUND source anchors 621/393. The registry now supplies both the development host and inner renderer. Saved legacy landscape transforms migrate without clearing unrelated authoring work. Pending stages remain legacy until integrated.
- Commands, keys and next prompt: `node scripts/assets.mjs help`. Active work/recovery and approved revision pointers: `config/asset-workflow-state.json`. Paths/status/cache keys: `config/phase8-landscapes.json`. Browser authoring saves remain local and never write Git.
- Publication remains development Production CI → identical tree on main → main CI → automatic Pages → deployed visual review. Technical success does not approve artwork. Platform access prompts and repository artwork acceptance are different gates.

## Next action

EU03 — Spain / Barcelona is approved at reviewed artwork revision `94f94669bd2773b2ef9881c59e4adb710aeced60`; the active checkpoint is closed. Europe regression passed with unchanged approved hashes and canonical geometry. Evidence: `docs/phase8-qa/EU03_LANDSCAPE_QA.md`; exact approval pointers: `config/asset-workflow-state.json`.

All registered landscape production is accepted. Complete the required dependent gameplay calibration/contract-promotion scope and define/approve the next production scope before generating additional assets. The remaining four-continent proposal still requires selection review and approval; no new stage is authorized by EU03 approval. `node scripts/assets.mjs handoff` reports the end of the registered landscape sequence.

## Deferred and protected

Parallel planning: the user authorized mapping the remaining four continents and their complete stage sets (three landscapes, two ground hazards and one flying hazard per stage). `docs/REMAINING_CONTINENTS_PLAN.md` and `config/remaining-continent-proposal.json` contain the 12-stage proposal and shared implementation handoff. Themes/atlas contract await approval; expanded commands and production remain disabled. User direction now requires a recognizable FAR focal point, a locally fitting MID sign of life, distinct campaign elements/hazards and believable gameplay-scale readability. AF03 pigeons are rejected; the initial lineup needs a duplicate/scale review before generation. This planning does not reopen approved landscapes or imply full Phase 8 completion.

Character grounding, hazard size/position and collision calibration follow landscape correction. Slide timing reconciliation (.75s current versus .70s historical spec), cold first-load optimization and the remaining four continents are separate future work. Preserve Phase 6 gameplay constants and the production/development boundary. Preserve `archive/` and `assets-original/`; never commit candidate/review directories.
