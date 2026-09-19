# Phase 8 landscape execution plan

Active, 2026-09-19. Operational steps and command lookup are maintained once in [ASSET_COMMAND_WORKFLOW.md](ASSET_COMMAND_WORKFLOW.md). This plan defines scope and acceptance; it does not duplicate that procedure. It supersedes the historical per-layer approval/pilot process.

## Scope and order

Phase 8 is the existing nine NA/SA/EU stages: 27 FAR/MID/GROUND layers. North America is complete. SA01 is approved; next are SA02, SA03, the South America regression, then EU01–EU03 and the Europe regression. The other four continents/36 landscape layers need approved themes, references and authorization after this validation phase. The command system is project-wide; no repeat setup per continent.

## Authority and approval

GitHub holds the accepted state and rollback history. World/asset specifications define ownership and geometry; `config/phase8-landscapes.json` holds executable paths, geometry, exceptions and stage state. The focused landscape profile and selected prompt sections supply generation context. Immutable sources and archived LAB25Q remain unchanged.

Locked direction authorizes internal FAR/MID/GROUND generation, direct working-file replacement, technical/visual QA and deployment testing. No per-layer prompt or candidate approval is required. Missing material direction, missing/unreliable references or a correction outside existing authority is a real blocker to identify. Approved artwork cannot be reopened without explicit user direction or a concrete defect requiring the applicable approval.

The user accepts one deployed complete stage: FAR/MID/GROUND together, Gameplay/Test, Contextual Inspector previews and horizontal scrolling/repeat. A revision changes only the affected scope. Internal technical checks never constitute visual acceptance. Keep the existing GitHub CI/Pages gates.

## Acceptance and closeout

Require source integrity, layer ownership/alpha, authored overscan, repeat inspection, actual runtime source width/scales/zero offsets, saved-config/reset consistency, and a correctly composed 960×540 scene with running surface at Y=410. Inspect artwork visually; neither PNG dimensions nor composite opacity prove composition quality. Stop optimizing once it meets these requirements.

After explicit approval, record final state/hashes once and provide the automatically resolved next prompt. After the third approved stage of a continent, perform its regression without reopening acceptable art. Phase 8 completes when all nine stage and three continent gates pass, the universal contract is validated in Design/Test/Game without synthetic backing or positional rescue, and required dependent gameplay calibration is resolved. Separate deferred work is not silently added to scope.
