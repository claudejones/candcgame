# Approved hazard upgrade integration — September 28, 2026

Source: C_AND_C_HAZARD_UPGRADE.zip, WORKBENCH_REQUEST.md. Starting Site source 96fc87cbeee130d281c6ce8a711fd552aa428182.

## Imported

- 18 original PNG atlases, 27 revised ground-hazard slots. All pre-import hashes matched the package source snapshot. All replacement hashes match the supplied final atlases; no reconciliation or image generation was needed. Dimensions, RGBA format, frame slots and pixels outside revised regions were verified.
- Authoritative tracked art is under dist/assets/worlds. Updated handoff hashes, generated catalog URLs and shared descriptor names. Exact required widened crops applied to OC01 sign and AN02 equipment case.
- Source-pixel collision cores and actual base-contact rows drive shared Design/Game calibration. Perentie, beaver and vizcacha use body cores excluding decorative long tails. Existing rectangle collision conventions remain.
- Existing scales retained for all 27 revised hazards. Ground offsets now align their actual bases to each stage pathway. Superseded collision/ground-offset locks are released only for changed art; other overrides remain. No replacement of the user's full placement reference.
- Exact-provenance save migration refits revised hazards and checks them automatically on startup. Prior save is retained for recovery. Valid certificates for unchanged neighboring slots are refreshed without moving those hazards. Future overrides on the new artwork survive reload/import.
- Characters, landscapes, pathways, difficulty profiles, pacing, flying artwork, controls, boss behavior and finish settings remain unchanged. Seven revised hazards have recalculated derived speeds; global difficulty values remain unchanged.

## Verification

- Calibration fixture: 27 affected hazards, all Easy/Standard/Hard checks pass; both characters. Assertions confirm all unaffected placements, landscape settings, pathways and difficulty profiles retained.
- 63 deterministic stage/difficulty plans, 126 character runs: zero hits, complete at 90 seconds, five difficulty sections, no excessive inter-section/finish gaps, no overlapping or overtaking flyers. Save/import and stage overrides pass.
- Runtime regressions: 126 stage/character/difficulty runs; health, damage recovery, pause, failure, hit-star animation, celebration and detached configuration pass. Original PNG decoding/rendering passes.
- Stage preview event harness: preview/watch/manual play, timeline, combination loops, hold-slide overrides, both characters, finish inspector and Save All pass. This is not a browser layout test.
- 162 scene renders: 27 hazards × Claude/Constance × start/middle/end scenery, using actual 960×540 shared renderer. Verified source crops, base contact, facing and neighboring-slot isolation. Sign and case recognizable; boots retain brown/gold contrast against gray OC03 path.
- Representative 844×390 landscape canvas renders checked for NA01, OC01, OC03 and AN02. Physical-phone controls/layout/performance and subjective game balance remain for user testing; no physical-device certification is claimed.
- Browser save migration, original recovery copy, save/reload idempotence and all current calibration stamps verified. Static module syntax and git diff checks pass.

## Review

Refresh the existing Workbench. Wait for its automatic affected-hazard check to finish. In Design → Stages, select a stage and Preview stage; use collision bounds to inspect the revised cores. Game uses the same migrated configuration. No manual approval of 27 separate optimizations is required.

No blocking asset-production questions. During phone testing, pay attention to AN02 anchor and OC03 boots: their muted tones are closer to the gray pathways than the bright sign/case. Their approved artwork is unchanged; only request stronger contrast if real play shows it is needed.

## Reproduction and rollback

Run from repository root:

- node authoring/hazard-upgrade/calibrate.mjs
- node authoring/hazard-upgrade/visual-qa.mjs
- node authoring/combination-planner-qa.mjs authoring/hazard-upgrade/checked-project.json
- node authoring/play-runtime-qa.mjs
- node authoring/stage-preview-ui-qa.mjs authoring/hazard-upgrade/checked-project.json

before-import.tar.gz and before-project.json retain pre-import artwork/configuration. Restore assets, metadata, migration and collision changes together from the parent commit; do not roll back unrelated work. Normal catalog generation is wrapped by rebuild-catalog.mjs.
