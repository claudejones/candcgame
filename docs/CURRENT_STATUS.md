# Current status

Updated 2026-09-19. GitHub is authoritative. Historical explanations live in DECISION_LOG; command execution lives in ASSET_COMMAND_WORKFLOW.

- Phases 0–7 are complete; Phase 7 modular Design/Test/Game authoring was user-accepted.
- Phase 8 covers the 27 NA/SA/EU landscape layers only. NA01, NA02, NA03, SA01 and SA02 are approved complete stage sets. North America is closed. SA02 was explicitly approved on 2026-09-19; SA03 is next, followed by the South America regression and Europe.
- Latest approved artwork snapshot before command-workflow setup: main `660aa55e35b378e613e07d8315074552620fcb61`. SA01 MID retains the snake and removes the monkey; SHA-256 `8e5653f5dfc7dea8254521f445e2609eebf3b1e0c683c64e4ffab38755519f03`.
- Approved validation assets remain under `assets/phase8-validation/`; packaged production keeps its legacy assets. No artwork is replaced by the command-workflow setup. NA03 GROUND's approved 2170×725 exception remains unchanged.
- Canonical integrated landscapes: source width 2172, viewport 960×540, ground surface 410, FAR/MID/GROUND offsets 0, scale multipliers 1.25/1/1, MID/GROUND source anchors 621/393. The registry now supplies both the development host and inner renderer. Saved legacy landscape transforms migrate without clearing unrelated authoring work. Pending stages remain legacy until integrated.
- Commands, keys and next prompt: `node scripts/assets.mjs help`. Active work/recovery and approved revision pointers: `config/asset-workflow-state.json`. Paths/status/cache keys: `config/phase8-landscapes.json`. Browser authoring saves remain local and never write Git.
- Publication remains development Production CI → identical tree on main → main CI → automatic Pages → deployed visual review. Technical success does not approve artwork. Platform access prompts and repository artwork acceptance are different gates.

## Next action

In `claudejones/candcgame`: **build landscape SA03**. Follow AGENTS.md. SA02 is closed; its approved reviewed revision is `29176df173eeb78cd0436bfa98a13f22317bb07d`. The three approved images retain their verified hashes and zero offsets.

## Deferred and protected

Character grounding, hazard size/position and collision calibration follow landscape correction. Slide timing reconciliation (.75s current versus .70s historical spec), cold first-load optimization and the remaining four continents are separate future work. Preserve Phase 6 gameplay constants and the production/development boundary. Preserve `archive/` and `assets-original/`; never commit candidate/review directories.
