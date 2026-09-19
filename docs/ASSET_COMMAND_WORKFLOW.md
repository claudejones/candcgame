# Asset commands

Active workflow, 2026-09-19. These are commands to the agent working in `claudejones/candcgame`. No user-filled template, separate setup conversation or per-continent installation is needed. The agent resolves commands with `node scripts/assets.mjs ...`; the resolver supplies instructions and file mappings, while the agent performs image generation and connected publication.

## User commands

| Command | Result |
| --- | --- |
| `help` | Commands, supported families, stage keys and next command |
| `help keys` | All continent/stage/layer keys |
| `help NA01` | Current state and exact FAR/MID/GROUND filenames |
| `status SA02` | Approval and recovery checkpoint |
| `build landscape SA02` | Generate the missing stage layers, check, replace and deploy for review |
| `generate landscape SA02` | Same workflow as build |
| `build landscape SA` | Resolve the next unfinished South America stage; never silently batch the continent |
| `regenerate landscape NA01 FAR` | Explicitly reopen only FAR, replace it and deploy with the existing MID/GROUND |
| `regenerate landscape NA01 MID` | The same operation for MID |
| `revise landscape SA01 MID: remove the monkey; keep the snake` | Edit only the current MID according to the direction, then deploy |
| `verify SA01` | Inspect existing assets, effective configuration and deployed stage |
| `publish SA02` | Publish a completed checkpoint without generating again |
| `resume SA02` | Recover work and continue the next unfinished operation |
| `approve SA02` | Accept the reviewed deployed revision, close it and print the next command |
| `rollback SA01` | Restore the recorded approved stage through a new commit |

Omitting a layer selects FAR, MID and GROUND. Keys are case-insensitive; `NA1` and `NA-01` resolve to `NA01`. FAR accepts `DISTANT`, `BG_FAR` or `BG_DISTANT`; MID accepts `BG_MID`. Filenames come from the registry, not the user. `NAXX` is notation, not an executable stage key.

| Prefix | Continent | Stage keys | Scope |
| --- | --- | --- | --- |
| NA | North America | NA01, NA02, NA03 | Phase 8 |
| SA | South America | SA01, SA02, SA03 | Phase 8 |
| EU | Europe | EU01, EU02, EU03 | Phase 8 |
| AF | Africa | AF01, AF02, AF03 | Reserved; specifications required |
| AS | Asia | AS01, AS02, AS03 | Reserved; specifications required |
| OC | Oceania / Australia | OC01, OC02, OC03 | Reserved; AU is an alias |
| AN | Antarctica | AN01, AN02, AN03 | Reserved; specifications required |

Only the existing nine NA/SA/EU stages are authorized for Phase 8 production. Reserving keys does not invent future themes or references. Character, hazard, object, UI and shared-effect families are discoverable with `help character` etc.; they require an approved key registry, focused profile and validation before production commands are enabled. Approved existing assets stay locked.

## Agent startup and lookup

1. Obtain a current checkout from GitHub. Read `AGENTS.md` and the concise `CURRENT_STATUS.md` once. Verify the current branch/baseline and protect concurrent work.
2. For `help`/`status`, use the resolver directly; no full specification or decision-history preload.
3. For production, read this runbook once and resolve the command. Its packet includes only the selected stage/layer paths, geometry expectations, focused profile, shared art contract and matching prompt sections. Attach and inspect the actual referenced images. Do not dump every continent's prompts, asset inventory, historical decisions or API responses.
4. Read a broader specification only when modifying its system, resolving a conflict or diagnosing a concrete failure. Re-read changed material, not unchanged files at every step.

The compact landscape profile is the approved operational extraction of the world/asset specifications. Change it and its source specification together when requirements change. Machine geometry and paths live in `config/phase8-landscapes.json`; commands live in `config/asset-commands.json`. Do not copy stage lists into bootstrap code or prompts.

## Execute the requested scope

1. **Preflight once:** resolve sources, existing accepted assets and a usable publication/CI route before generating. Normal authenticated Git is preferred. If unavailable, establish the supported binary-safe connector route once. Never put encoded PNGs into conversation text. Do not begin expensive generation when no durable transfer route exists.
2. **Generate or revise:** one image per call using actual attached references. Replace the selected working asset at its standard validation path. Reuse completed valid work on build/resume. Generate is a build alias; approved targets require explicit regenerate/revise. For a single-layer request, preserve sibling bytes and check the layer against those siblings. Do not change scenery to fix a configuration defect.
3. **Validate:** verify only the changed PNGs locally, inspect their isolation/repeat previews and the complete stage composite. Activate a complete stage by setting its registry state to `integrated`, update only changed image cache keys to the first eight SHA-256 characters, and run `node scripts/sync-landscape-registry.cjs`. Run `node scripts/assets.mjs check SA02` (or `check NA01 MID` for a single-layer revision). This requires active runtime geometry; it cannot pass an unintegrated stage on an idealized preview. During generation, use `validate-phase8-pngs.js --stage sa02 --layer far`; once all files exist, optional `phase8-stage-qa.py sa02 --preview` is explicitly prospective, not runtime evidence. Inspect the generated previews; automated metrics cannot judge art quality.
4. **Stop:** once the specified result passes and has no identified visual defect, publish. Do not keep regenerating acceptable work, re-encode valid images, or repeat unchanged checks without a failure or required gate.
5. **Publish:** follow `GITHUB_WORKFLOW.md`: development CI, same validated tree on main, main CI and automatic Pages. No force updates. Run the existing full suite once on the final local snapshot when code changes; image iterations use targeted local checks and retain full automatic CI. Verify deployed changed bytes/cache URLs and the active stage's real Design/Test/Game and Inspector configuration. All landscape offsets must be zero. Report a short outcome and review URL; omit routine object hashes, polling and transfer narration.
6. **Review:** ask for one deployed FAR/MID/GROUND, Gameplay/Test, Inspector and scrolling review. This user decision is the artwork acceptance gate. Technical pass never self-approves artwork. A revision reopens only the requested scope. Do not seek routine prompt/candidate/Git-process approvals; platform access approval cannot be overridden by this file.
7. **Close:** on explicit user approval, set the stage to approved, record the exact reviewed deployed revision in `approvedRevisions`, clear its active checkpoint, sync the generated registry, and update the concise status and final manifest/QA evidence once. Append the decision log only for new durable decisions. Complete the continent regression after its third stage. Always run `node scripts/assets.mjs handoff` and supply its fully completed next prompt; never ask the user to fill stage IDs, paths or continent fields.

## Recovery and rollback

`config/asset-workflow-state.json` is the small machine checkpoint. Before publication, use `node scripts/assets.mjs checkpoint SA02 ready-to-publish "build landscape SA02"`; use `working` only for an interruption/incomplete set. Store selected scope, original command, hashes, stage metadata and recovery branch. Once deployed, record `awaiting-approval` plus the deployed commit/run URLs before handoff. Do not mark a working file durable until its remote commit is verified.

The normal successful path needs no extra recovery deployment. If stopping before development publication, commit only selected finished assets, necessary registry data and the checkpoint to `work/assets/sa02`, non-force, and verify the remote tree. Keep that branch until its work is safely published/abandoned. Never commit `tmp/` or `assets/phase8-candidates/`. Previews are disposable; irreplaceable selected images belong in Git, not only a scratch handoff path. Resume inspects remote heads, this branch and matching file/metadata hashes; it never silently generates a replacement for lost work. Missing bytes are a recovery problem to report.

Rollback restores only the target stage's files and registry record from its recorded approved revision, regenerates the runtime registry, validates, and publishes a new commit through the same gates. Never reset/force either shared branch or revert unrelated work. If the checkpoint lacks an approved revision, identify the last approved snapshot from repository evidence before restoring.

## Documentation and extension discipline

This file is the workflow authority. The Phase 8 execution plan defines scope/gates; the prompt manifest holds art direction; the decision log is history. No new replacement runbook per continent. Remove superseded active instructions when changing the workflow; preserve historical decisions, `archive/`, `assets-original/` and still-used packaged assets. A legacy directory is not automatically disposable.

To enable a future asset family, register approved IDs/references/paths, its source-spec extraction, validators and narrow revision/rollback behavior; add resolver support and tests, then mark it ready. Do not advertise unimplemented generation commands as working. The user still supplies a short family/key command, never technical fields.
