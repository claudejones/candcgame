# Current status

Updated 2026-09-20. GitHub is authoritative; resolve live heads before writes. Commands: `node scripts/assets.mjs help`. Workflow: ASSET_COMMAND_WORKFLOW.md. Historical decisions/QA are not startup reading.

## Direct completion update

AF03 has a pinned five-source inventory at `config/asset-finish/af03.json`. `node scripts/assets.mjs finish AF03` bypasses legacy worker recovery. It verifies sources only, not artwork readiness. GROUND/FLYING locators are local and must be preserved remotely before further edits; missing locators block automatic regeneration. No new artwork was produced by this update. See ASSET_FINISH.md.

## Current production and recovery

- NA01–03, SA01–03 and EU01–03 landscapes are approved (27 layers). AF01 is approved, including facing corrections. Exact reviewed revisions/hashes remain in workflow state. Preserve SA01 MID snake/no monkey and NA03 GROUND's 2170×725 exception.
- AF02: five assets plus `config/asset-handoffs/af02.json` published and ready for calibration (source `b5250bfa1f86734d7ed8aef6bb68ddd3eb3f8484`). Imported into editor-next review12. This is not gameplay release or calibration acceptance.
- **AF03 is already in progress on `work/assets/af03`.** Last inspected head `9b02feb184016f57cfcd05de0e5e9505f6eb7f3b`: durable FAR, other jobs unfinished. Main's inactive checkpoint does not cancel that run. Use `resume AF03`, fetch its current recovery head and inspect available bytes before requeue. Do not overwrite that branch or start AF03 from scratch.
- After AF03 asset handoff and the user's advance, Asia begins with `build stage AS01`. Its selections/references require agent preparation; it is not generation-ready merely because the command exists. Themes and uniqueness/scale requirements: `config/remaining-continent-proposal.json` and `docs/REMAINING_CONTINENTS_PLAN.md`.

## Fixed boundaries

Canonical landscape geometry: source width 2172, viewport 960×540, surface Y410, FAR/MID/GROUND offsets 0, multipliers 1.25/1/1, MID/GROUND source anchors 621/393. Registry drives host and renderer. Preserve accepted exceptions and saved unrelated edits. Pending stages stay inactive.

From AF02, asset production delivers five PNGs and a validated v1 handoff; editor-next owns iterative gameplay calibration. The user notifies the Workbench agent, imports, calibrates and saves. Asset readiness, artwork acceptance, calibration and release are distinct. Preserve AF01 settings, genuine runtime fixes, eleven comparison candidates and DEPENDENT_CALIBRATION_QA evidence/tests. Independent legacy tuning is paused.

Workflow optimization: compact operation/worker packets, durable recovery lookup, archived completed-run details, local validation reuse and resumable connected publication. Exact-SHA dev CI → identical-tree main → main CI → Pages and explicit artwork/release acceptance remain. No fixed context/usage percentage is promised. Detailed measurements: `docs/phase8-qa/WORKFLOW_OPTIMIZATION_QA.md`.

Preserve Phase 6 gameplay constants, production/development separation, archive/ and assets-original/. Never commit tmp/ or assets/phase8-candidates/. This workflow change does not generate artwork, activate new stages or approve calibration.
