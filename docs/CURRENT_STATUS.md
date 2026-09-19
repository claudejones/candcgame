# Current status

Updated 2026-09-19. GitHub is authoritative. Historical explanations live in DECISION_LOG; command execution lives in ASSET_COMMAND_WORKFLOW.

- Phases 0–7 are complete; Phase 7 modular Design/Test/Game authoring was user-accepted.
- Phase 8 covers the 27 NA/SA/EU landscape layers only. NA01, NA02, NA03, SA01, SA02, SA03 and EU01 are approved complete stage sets. North America and South America are closed. SA03 was explicitly approved on 2026-09-19 and the South America regression passed; EU01 was explicitly approved on 2026-09-19; EU02 is next.
- Latest approved artwork snapshot before command-workflow setup: main `660aa55e35b378e613e07d8315074552620fcb61`. SA01 MID retains the snake and removes the monkey; SHA-256 `8e5653f5dfc7dea8254521f445e2609eebf3b1e0c683c64e4ffab38755519f03`.
- Approved validation assets remain under `assets/phase8-validation/`; packaged production keeps its legacy assets. No artwork is replaced by the command-workflow setup. NA03 GROUND's approved 2170×725 exception remains unchanged.
- Canonical integrated landscapes: source width 2172, viewport 960×540, ground surface 410, FAR/MID/GROUND offsets 0, scale multipliers 1.25/1/1, MID/GROUND source anchors 621/393. The registry now supplies both the development host and inner renderer. Saved legacy landscape transforms migrate without clearing unrelated authoring work. Pending stages remain legacy until integrated.
- Commands, keys and next prompt: `node scripts/assets.mjs help`. Active work/recovery and approved revision pointers: `config/asset-workflow-state.json`. Paths/status/cache keys: `config/phase8-landscapes.json`. Browser authoring saves remain local and never write Git.
- Publication remains development Production CI → identical tree on main → main CI → automatic Pages → deployed visual review. Technical success does not approve artwork. Platform access prompts and repository artwork acceptance are different gates.

## Next action

EU02 — France / Paris has a complete recovered FAR/MID/GROUND set and is ready for publication and deployed review. The recovered image hashes match the interrupted local checkpoint. Canonical runtime geometry and targeted PNG/composite checks pass. No image was regenerated during recovery. See `docs/phase8-qa/EU02_LANDSCAPE_QA.md` and `config/asset-workflow-state.json`. Resume unfinished publication with `In claudejones/candcgame: resume EU02.` EU03 remains pending; do not begin it before EU02 acceptance.

## Deferred and protected

Character grounding, hazard size/position and collision calibration follow landscape correction. Slide timing reconciliation (.75s current versus .70s historical spec), cold first-load optimization and the remaining four continents are separate future work. Preserve Phase 6 gameplay constants and the production/development boundary. Preserve `archive/` and `assets-original/`; never commit candidate/review directories.
