# Sequential asset production

Commands below are instructions to the agent, not terminal commands. This is the active process for new stage artwork, including the user-authorized replacement of AF03. Old coordinator, worker and recovery procedures do not apply.

Start: `In claudejones/candcgame: generate AF03 fresh. Use the sequential process in docs/ASSET_COMMAND_WORKFLOW.md from main.`

## Produce five images

1. **Prepare once.** Read AGENTS.md and CURRENT_STATUS.md, the selected approved stage brief and applicable image rules. Start AF03 from current main on `work/asset-ready/af03-fresh`; if that branch already contains this fresh run, continue it. Preserve old branches. Use reference photographs (the AF03 reference directory may be fetched from the old branch), but do not inspect/recover/reuse old generated AF03 artwork. Resolve missing references or locked selections before generating. Confirm the available Git transfer route can preserve PNG bytes before beginning; do not print binary data.
2. **Prompt, generate, check, save—one image at a time.** Order: FAR, MID, GROUND, OBJECT_ATLAS, FLYING. Before each generation review and refine its prompt using `scripts/asset-prompts.mjs`, its actual references and the relevant source rules. Include the subject, style/palette, composition, required empty space, and that image's geometry. Remove conflicting or unrelated instructions. For atlases describe every cell and pose explicitly; for repeatable layers state the edge and surface requirements. Generate once, inspect visually, and run only applicable PNG/alpha, seam/contact or atlas/animation checks. When it passes, commit that PNG and its compact check/prompt record to the fresh branch and verify the saved blob before proceeding. Never rerun passing images or unrelated software tests.
3. **Handle defects locally.** Name the observed defect. Apply only an allowed technical finish, or revise the prompt to address that defect before one focused retry. Recheck only the affected image. If still blocked, preserve completed images and report the exact failed requirement; do not silently start another retry, worker or recovery search. Reuse completed files from this fresh run after interruption.
4. **Hand off.** Once all five pass, write and validate the existing v1 `config/asset-handoffs/af03.json` with paths, hashes, required provisional source metadata and truthful evidence. Save it on the same branch and verify the remote commit. Return the five-file status and a fully filled Workbench prompt naming that branch and exact commit. Artwork acceptance and gameplay calibration remain with the user/Workbench. Asset-only delivery requires no main promotion, Pages deployment, gameplay tuning or full software test suite.

Use the established binary-safe connected Git route described in the publication section of GITHUB_WORKFLOW.md. Ordinary non-force commits on the fresh branch are sufficient; do not invoke the shared-branch publisher or a coordinator/checkpoint system. A transfer or validation failure is a specific blocker, not a reason to regenerate artwork. Never claim a scratch-only image is saved to Git.

## AF03 brief and outputs

Use the approved AF03 entry in `config/remaining-continent-proposal.json` and relevant production/source contracts. Theme: Marrakesh, rose plaster, ochre stone, muted teal and warm sky. FAR: Koutoubia minaret. MID: medina/souk. GROUND: level warm stone lane. Objects: terracotta storage jar and stationary unlit tagine brazier, one per cell. Flying: one white stork in four distinct wing poses. Preserve specified anchors, transparent gutters, facing and source geometry.

Save under `assets/worlds/africa/`:

- `AF03_BG_DISTANT_MARRAKESH.png`
- `AF03_BG_MID_MARRAKESH.png`
- `AF03_GROUND_MARRAKESH.png`
- `AF03_OBJECT_ATLAS.png`
- `AF03_HAZARD_FLYING.png`

Store a short `docs/asset-runs/af03-fresh.md` with each selected prompt, final file hash and actual check result. This is the only fresh-run progress record; no historical manifest reconciliation is needed. Do not overwrite assets-original/ or archive/.

## Workbench closeout

Fill in the actual source commit before returning this instruction:

> In claudejones/candcgame: import AF03's five assets and config/asset-handoffs/af03.json from branch work/asset-ready/af03-fresh at commit ACTUAL_COMMIT into Workbench. Use the existing importer with that checkout as --source-root, preserve unrelated edits, and continue your calibration workflow.

Do not give the user ACTUAL_COMMIT as a placeholder or claim completion before Git verification. If interrupted, give: `In claudejones/candcgame: continue the fresh AF03 run on work/asset-ready/af03-fresh using docs/ASSET_COMMAND_WORKFLOW.md. Start at the first unfinished image in docs/asset-runs/af03-fresh.md.`

## Following stages

Use the same single-agent sequence for every new five-image stage, with its own branch, paths, prompts and small progress record. Review all five prompts before their respective generations; do not copy an earlier defective prompt unchanged. Prepare missing approved selections/reference photos first. After AF03 handoff, the next generation instruction is `In claudejones/candcgame: build stage AS01 using the sequential process in docs/ASSET_COMMAND_WORKFLOW.md.` It authorizes preparation and then generation when its brief is ready. Advance only when the user requests it.

Legacy help/status/finish/verify/approve/rollback utilities remain available for existing work. Their old worker packets and recovery manifests are not instructions for this new process. Runtime or main-branch integration still follows GITHUB_WORKFLOW.md; asset generation ends at the verified branch handoff.
