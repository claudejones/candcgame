# Current status

Updated 2026-09-19. GitHub is authoritative. Historical explanations live in DECISION_LOG; command execution lives in ASSET_COMMAND_WORKFLOW.

- Phases 0–7 are complete; Phase 7 modular Design/Test/Game authoring was user-accepted.
- Phase 8 landscape acceptance is complete for all 27 NA/SA/EU layers: NA01–NA03, SA01–SA03 and EU01–EU03 are approved. North America, South America and Europe landscape regression gates have passed. EU03 was explicitly approved on 2026-09-19. The user has authorized adoption of the landscape contract for remaining-stage production; existing gameplay calibration review is delegated separately and is not an asset-generation blocker.
- Preserve accepted artwork: SA01 MID retains the snake and removes the monkey (SHA-256 `8e5653f5dfc7dea8254521f445e2609eebf3b1e0c683c64e4ffab38755519f03`); NA03 GROUND retains its approved dimension exception. Exact approval pointers are in the workflow state.
- Approved validation assets remain under `assets/phase8-validation/`; packaged production keeps its legacy assets. No artwork is replaced by the command-workflow setup. NA03 GROUND's approved 2170×725 exception remains unchanged.
- Canonical integrated landscapes: source width 2172, viewport 960×540, ground surface 410, FAR/MID/GROUND offsets 0, scale multipliers 1.25/1/1, MID/GROUND source anchors 621/393. The registry now supplies both the development host and inner renderer. Saved legacy landscape transforms migrate without clearing unrelated authoring work. Pending stages remain legacy until integrated.
- Workflow V3 uses one coordinator and at most two workers, isolated file ownership, per-file recovery evidence and guarded state updates. Help/status and single-image edits remain lightweight; no nested continent managers or additional skill are required. Actual parallel image throughput is not yet measured.
- Commands, keys and next prompt: `node scripts/assets.mjs help`. Active work/recovery and approved revision pointers: `config/asset-workflow-state.json`. Paths/status/cache keys: `config/phase8-landscapes.json`. Browser authoring saves remain local and never write Git.
- Publication remains development Production CI → identical tree on main → main CI → automatic Pages → deployed visual review. Technical success does not approve artwork. Platform access prompts and repository artwork acceptance are different gates.

## Asset-ready / Workbench boundary

From AF02, production ends with five validated PNGs and `config/asset-handoffs/<stage>.json`. The shared validator and editor-next importer consume the same v1 contract. Asset-ready does not activate gameplay or certify calibration. The user notifies the Workbench agent, which imports; the user then calibrates and saves. The strict later contact/collision/finish/signature and gameplay-release gates remain. Do not require repeated zero-hit courses for artwork handoff, and never mark an unperformed check passed. AF01's existing approval/settings/artwork and the eleven calibration comparison candidates remain preserved.

## Next action

**AF02 in progress:** resume command `In claudejones/candcgame: resume AF02.` The reference pack is prepared; FAR and MID were recovered from the previous worker commits and pass their source reviews. GROUND and FLYING remain in production. The saved OBJECT_ATLAS is a recovery candidate with failed source contact/gutter checks, not an asset-ready result; it needs correction. Active run: `af02-20260919204119-fb761a`; recovery branch: `work/assets/af02`. Gameplay activation, calibration and release remain pending.

**AF01 remains approved:** reviewed revision `a09b176dd8531bfb3425c9af534ff197a05a253e`, including the porcupine/roller facing correction. Its exact five PNG hashes, reviewed geometry and approval remain unchanged. Evidence: `docs/phase8-qa/AF01_STAGE_QA.md`.

The Africa trial covers AF01–AF03, one stage at a time. AF01 is the first accepted stage; AF02/AF03 use asset-ready handoffs and subsequent Workbench calibration. Complete the later playable-continent regression when all three calibrated releases are ready; do not claim it at asset closeout. Reference preparation is agent work before each stage. Exact prior approval pointers remain in `config/asset-workflow-state.json`.

Calibration evidence: `docs/phase8-qa/DEPENDENT_CALIBRATION_QA.md` separates retained runtime fixes, eleven comparison candidates and unresolved visual findings; the recorded 10 ms measurement audit and 20 ms regression sampling remain distinct and reproducible. Its separate review is not acceptance and does not block asset generation.

## Deferred and protected

Approved expansion direction: `docs/REMAINING_CONTINENTS_PLAN.md` and `config/remaining-continent-proposal.json` define four continents, 12 stages and five PNG files per stage (FAR/MID/GROUND, two ground hazards in one atlas, one flying atlas). They include the approved focal-point/life/uniqueness/scale rules and bounded execution policy. Africa duplicate/replacement choices are agent-selected and researched; the remaining nine briefs still need selection review. AF01 visual references are ready; AF02/AF03 packs are prepared before their stages. AF03 uses white stork and excludes pigeons. Production is enabled for eligible stage packets: AF01 is approved; later stages retain their own selection/reference gates. No new stage is generated, playable or accepted merely by enabling its production command.

Existing calibration review and adjustments belong to the editor-next auto-calibration workstream. Independent legacy hazard tuning is paused. Preserve the eleven deployed comparison candidates, their evidence and supporting regression tests; no silent promotion, overwrite or rollback. Preserve concurrent changes. New-stage production checks source metadata and basic rendering; editor-next owns iterative grounding/flight height, hitbox fairness, action timing, difficulty and spawn balancing. Slide timing reconciliation (.75s current versus .70s historical spec), cold first-load optimization and the remaining four continents are separate future work. Preserve Phase 6 gameplay constants and the production/development boundary. Preserve `archive/` and `assets-original/`; never commit candidate/review directories.
