# Asset commands

Active workflow V3, 2026-09-19. These are commands to the agent working in `claudejones/candcgame`. No user-filled template, separate setup conversation or per-continent installation is needed. The agent resolves commands with `node scripts/assets.mjs ...`; the resolver supplies instructions and file mappings, while the agent performs eligible image generation and connected publication.

## Where to type commands

Type these messages into the conversation with the agent. The user does not need to run terminal commands.

**In a fresh conversation, name the repository in the first message.** Use the copy-ready form `In claudejones/candcgame: ...`. This establishes which project the command applies to. Being in the same ChatGPT project does not replace that explicit repository instruction. The agent follows AGENTS.md automatically; the user does not need to paste the specifications or previous conversation.

**Once that conversation is working in this repository, use the short commands.** Do not repeat the repository prefix on every message. The prefix is conversation context; the agent extracts the command when invoking the local resolver.

| Situation | Exact message to send |
| --- | --- |
| Inspect AF01 readiness in a fresh conversation | `In claudejones/candcgame: status AF01.` |
| Inspect AF01 packet/help in a fresh conversation | `In claudejones/candcgame: help AF01.` |
| Resume AF01 in a fresh conversation | `In claudejones/candcgame: resume AF01.` |
| Start AF01 full-stage production | `In claudejones/candcgame: build stage AF01.` |
| Ask for help in a fresh conversation | `In claudejones/candcgame: help.` |
| Replace NA01 FAR in a fresh conversation | `In claudejones/candcgame: regenerate landscape NA01 FAR.` |
| Ask for available commands in the current repository conversation | `help` |
| See NA01's layer filenames in the current conversation | `help NA01` |
| Resume AF01 work within the current conversation | `resume AF01` |

AF01 is ready for full-stage production: its choices, inspected reference files, shared tooling and landscape-contract adoption are recorded. The user delegated existing calibration review/adjustments to a separate auto-calibration agent and authorized production to proceed. `build stage AF01` starts generation through deployed review; it does not approve artwork or immediately activate an incomplete stage.

## If a conversation reaches its limit

Open one new conversation and send:

```text
In claudejones/candcgame: resume AF01.
```

The agent finds the current GitHub state, the stage's recovery branch and any available working files, then continues the next unfinished operation. If no active work exists, it reports that state. It must inspect the recovery branch even if main's checkpoint still says there is no active work. Completed images are reused; if publication was interrupted, it continues publication; if the stage is awaiting review, it returns the review link. It does not restart the stage or approve it automatically.

The user does not need a long handoff, commit hashes, filenames or the old transcript. Recovery depends on saved work: if the interruption happened before a durable checkpoint and the working files are unavailable, the agent must identify what is missing instead of claiming recovery or silently regenerating it. The recovery rules below remain mandatory.

At an intentional interruption, the agent must save and verify the recovery checkpoint and print the fully completed resume message. At stage closeout, it prints the fully completed next-stage message. No placeholder templates or second setup conversation.

## User commands

The table below uses the short form for a conversation already working in this repository. For the first message in a fresh conversation, add `In claudejones/candcgame:` as shown above. AF01 is the next eligible stage. Later stages retain their own selection/reference gates; the agent resolves those before generation. Legacy landscape commands remain supported for recovery and explicit approved-asset replacement.

| Command | Result |
| --- | --- |
| `help` | Commands, supported families, stage keys and next command |
| `help keys` | All continent/stage/layer keys |
| `help AF01` | AF01 readiness state and focused packet |
| `status AF01` | AF01 approval and recovery checkpoint |
| `build stage AF01` | Generate the complete eligible five-file stage, validate, integrate and publish for one deployed review |
| `resume AF01` | Recover AF01 work, or report no active work |
| `regenerate landscape NA01 FAR` | Explicitly reopen only FAR, replace it and deploy with the existing MID/GROUND |
| `regenerate landscape NA01 MID` | The same operation for MID |
| `revise landscape SA01 MID: remove the monkey; keep the snake` | Edit only the current MID according to the direction, then deploy |
| `verify SA01` | Inspect existing assets, effective configuration and deployed stage |
| `publish SA02` | Publish a completed checkpoint without generating again |
| `approve SA02` | Accept the reviewed deployed revision, close it and print the next command |
| `rollback SA01` | Restore the recorded approved stage through a new commit |

Omitting a layer selects FAR, MID and GROUND. Keys are case-insensitive; `NA1` and `NA-01` resolve to `NA01`. FAR accepts `DISTANT`, `BG_FAR` or `BG_DISTANT`; MID accepts `BG_MID`. Filenames come from the registry, not the user. `NAXX` is notation, not an executable stage key.

| Prefix | Continent | Stage keys | Scope |
| --- | --- | --- | --- |
| NA | North America | NA01, NA02, NA03 | Phase 8 |
| SA | South America | SA01, SA02, SA03 | Phase 8 |
| EU | Europe | EU01, EU02, EU03 | Phase 8 |
| AF | Africa | AF01, AF02, AF03 | AF01 ready; AF02/AF03 references prepared before their stages |
| AS | Asia | AS01, AS02, AS03 | Approved themes; readiness pending |
| OC | Oceania / Australia | OC01, OC02, OC03 | Approved themes; readiness pending; AU is an alias |
| AN | Antarctica | AN01, AN02, AN03 | Approved themes; readiness pending |

Only the existing nine NA/SA/EU stages are authorized for Phase 8 production, and all 27 landscape layers are approved. Reserving keys does not invent future themes or references. Remaining-stage production is authorized using the adopted landscape contract and each stage's readiness packet. AF01 is ready; unresolved choices/references for later stages remain agent work. Approved existing assets stay locked. Character, hazard, object, UI and shared-effect families are discoverable with `help character` etc.; selectors may resolve to a focused readiness packet, while the new-stage runtime/validation tooling is implemented but generation waits only for the selected packet's remaining prerequisites.

## V3 readiness and delegation

`build stage AF01` and equivalent future-stage requests resolve a readiness-aware packet: the packet identifies the stage, proposed theme, missing references, hazards and required gates. Generation proceeds only when the packet reports ready. Existing calibration review is delegated and nonblocking by explicit user direction; new-stage collision/integration checks and deployed acceptance remain required. A complete measured release is still required before gameplay activation. A hazard selector can resolve its proposed identity and focused references for review; it remains blocked from production until those gates pass.

When a later build is eligible, one coordinator may delegate narrowly scoped stage work to at most two workers. The coordinator starts the run with `node scripts/assets.mjs coordinator start <expectedRevision> "<asset command>"`, then starts each pinned job with `coordinator start-job <runId> <jobId> <expectedRevision>`. Workers return an isolated result manifest through `coordinator result <runId> <jobId> <expectedRevision> <result-manifest.json>`; this verifies the owned bytes and immutable local commit evidence only. The coordinator must then fetch the remote ref and run `node scripts/assets.mjs coordinator verify-recovery <runId> <jobId> <expectedRevision> <fetchedRemoteRef>`; only that remote byte match marks the job durable. The coordinator records the selected checkpoint with `coordinator checkpoint <runId> <phase> <expectedRevision> [recoveryRef]`; `ready-to-publish` requires complete matching local outputs; it does not require an extra recovery publication. `awaiting-approval` requires verified durable jobs and the existing deployed review evidence. Workers receive a pinned stage/file packet and actual references, and return outputs in isolated worktrees. The coordinator imports one completed file at a time before result verification, so another worker's in-progress file cannot trigger an unowned-output change. The coordinator owns the shared registry, checkpoints, releases, plan and decision log; no nested continent managers are used. This delegation rule does not claim parallel image throughput or establish a fixed usage budget.

## Africa trial and full-stage integration

The test covers **AF01–AF03**, with shared setup completed once. AF01 is the first deployed acceptance checkpoint, followed by AF02 and AF03. Two workers may handle separate asset groups within one stage. Do not describe this as simultaneous three-stage production. Measure elapsed time, attempts, repeated setup and available usage for each stage and the whole trial; do not promise a subscription percentage.

The coordinator handles stage-specific reference retrieval from the catalog's `referenceSources`. The shared landscape contract is adopted; do not repeat the separately assigned existing-calibration review during asset startup. Preserve concurrent calibration/editor changes and use the current shared runtime as the integration baseline. `status` is read-only, not an instruction to perform that setup or evidence that generation is ready. Do not hand it to the user as if it starts production. Actual downloaded image pixels must be inspected and added to the selected job's reference paths before marking `referencesReady`.

For a new complete stage, build all five files and measured metadata. Run `node scripts/validate-stage-assets.cjs AF01` for source/atlas checks. Metadata in `config/stage-releases.json` includes the five path/SHA-256 pairs, three calibrated runtime hazard definitions (sourceAnchor, source region, crop, scale, collision, animation), finish placement, a 75–85s signature and completed technical/composition/contact/animation/collision/finish checks. These values are agent-measured, never a user template or invented defaults. Use `node scripts/integrate-stage.mjs "build stage AF01" <measured-release.json>` with the resolved command; single-cell revisions require the original atlas at HEAD and preserve sibling RGBA/metadata. Then run the existing targeted `check`, inspect the actual scene, publish and request one complete-stage review including hazards. Normal integration still uses one publication snapshot.

On acceptance, update both the new-stage release status and landscape registry, plus the exact five-file approval/checkpoint record. Rollback restores those same files/metadata from the recorded accepted revision; no branch resets. AF02 and AF03 follow AF01 through ordinary filled handoff commands. New stages remain absent from gameplay until their complete measured release is integrated. Source/animation validators do not grant visual acceptance.

## Agent startup and lookup

1. Obtain a current checkout from GitHub. Read `AGENTS.md` and the concise `CURRENT_STATUS.md` once. Verify the current branch/baseline and protect concurrent work.
2. For `help`/`status`, use the resolver directly; no full specification or decision-history preload.
3. For production, read this runbook once and resolve the command. Its packet includes only the selected stage/layer paths, geometry expectations, focused profile, shared art contract and matching prompt sections. Attach and inspect the actual referenced images. Do not dump every continent's prompts, asset inventory, historical decisions or API responses.
4. Proceed to generation once the packet and references are understood. Read a broader specification only when modifying its system, resolving a conflict or diagnosing a concrete failure. Re-read changed material, not unchanged files at every step. Routine startup does not search prior conversations, review Git history or probe terminal authentication. A short chat command resolves instructions; the local resolver does not itself generate or publish images.

The compact landscape profile is the approved operational extraction of the world/asset specifications. Change it and its source specification together when requirements change. Machine geometry and paths live in `config/phase8-landscapes.json`; commands live in `config/asset-commands.json`. Do not copy stage lists into bootstrap code or prompts.

The sync command also versions the script references in the two entry pages from their actual content hashes. These mechanical HTML updates prevent stale registry/renderer scripts after refresh. Include them in the same commit; no hand-written runtime edit is needed for an image replacement.

## Execute the requested scope

1. **Resolve once:** confirm the requested stage/layers, current checkpoint and reference files. Existing GitHub reads establish repository access; do not delay generation to rediscover upload methods. Use the established connected route in `GITHUB_WORKFLOW.md` at publication. If an actual access failure occurs, identify that specific blocker and preserve completed work under the recovery rules.
2. **Generate or revise:** one image per call using actual attached references. Replace the selected working asset at its standard validation path. Reuse completed valid work on build/resume. Generate is a build alias; approved targets require explicit regenerate/revise. For a single-layer request, preserve sibling bytes and check the layer against those siblings. Do not change scenery to fix a configuration defect.
3. **Validate:** verify only the changed PNGs locally, inspect their isolation/repeat previews and the complete stage composite. Activate a complete stage by setting its registry state to `integrated`, update only changed image cache keys to the first eight SHA-256 characters, and run `node scripts/sync-landscape-registry.cjs`. Run `node scripts/assets.mjs check SA02` (or `check NA01 MID` for a single-layer revision). This requires active runtime geometry; it cannot pass an unintegrated stage on an idealized preview. During generation, use `validate-phase8-pngs.js --stage sa02 --layer far`; once all files exist, optional `phase8-stage-qa.py sa02 --preview` is explicitly prospective, not runtime evidence. Inspect the generated previews; automated metrics cannot judge art quality.
4. **Stop:** once the specified result passes and has no identified visual defect, publish. Do not keep regenerating acceptable work, re-encode valid images, or repeat unchanged checks without a failure or required gate.
5. **Publish:** follow `GITHUB_WORKFLOW.md`: development CI, same validated tree on main, main CI and automatic Pages. No force updates. Run the existing full suite once on the final local snapshot when code changes; image iterations use targeted local checks and retain full automatic CI. Verify deployed changed bytes/cache URLs and the active stage's real Design/Test/Game and Inspector configuration. All landscape offsets must be zero. Report a short outcome and review URL; omit routine object hashes, polling and transfer narration.
6. **Review:** ask for one deployed FAR/MID/GROUND, Gameplay/Test, Inspector and scrolling review. This user decision is the artwork acceptance gate. Technical pass never self-approves artwork. A revision reopens only the requested scope. Do not seek routine prompt/candidate/Git-process approvals; platform access approval cannot be overridden by this file.
7. **Close:** on explicit user approval, set the stage to approved, record the exact reviewed deployed revision in `approvedRevisions`, clear its active checkpoint, sync the generated registry, and update the concise status and final manifest/QA evidence once. Append the decision log only for new durable decisions. Complete the continent regression after its third stage. Always run `node scripts/assets.mjs handoff` and supply its fully completed next prompt; never ask the user to fill stage IDs, paths or continent fields.

Approval records are repository changes, so the existing automatic CI/Pages gates also run for closeout. They do not reopen artwork acceptance. For an approval-only update, inspect the diff to confirm unchanged image hashes and geometry; allow the automatic gates to complete without repeating generation, composites, browser review or asking the user to approve again. A concrete unexpected change or required continent regression still needs its applicable checks. Report the recorded approval and next command; describe CI details only when a failure needs attention. The generated next command omits the redundant `Follow AGENTS.md` suffix.

## Recovery and rollback

`config/asset-workflow-state.json` is the small machine checkpoint. Before publication, use `node scripts/assets.mjs checkpoint <stage> ready-to-publish "<asset command>"`; use `working` only for an interruption/incomplete set. Store selected scope, original command, hashes, stage metadata and recovery branch. Once deployed, record `awaiting-approval` plus the deployed commit/run URLs before handoff. For a V3 run, use `coordinator requeue <runId> <jobId> <expectedRevision>` only after confirming the prior worker stopped and recovering any existing output; completed files are never requeued. After explicit user acceptance, record the reviewed revision/asset hashes and use `coordinator close <runId> <expectedRevision>` to release the active run. Do not mark a working file durable until its remote commit is verified.

The normal successful path needs no extra recovery commit or deployment: assemble one final integration snapshot, publish it through the existing gates, then record verified recovery/deployment evidence. A local `ready-to-publish` checkpoint is not yet durable. If stopping before development publication, commit only selected finished assets, necessary registry data and the checkpoint to `work/assets/sa02`, non-force, and verify the remote tree. Keep that branch until its work is safely published/abandoned. Never commit `tmp/` or `assets/phase8-candidates/`. Previews are disposable; irreplaceable selected images belong in Git, not only a scratch handoff path. Resume inspects remote heads, this branch and matching file/metadata hashes; it never silently generates a replacement for lost work. Missing bytes are a recovery problem to report.

Rollback restores only the target stage's files and registry record from its recorded approved revision, regenerates the runtime registry, validates, and publishes a new commit through the same gates. Never reset/force either shared branch or revert unrelated work. If the checkpoint lacks an approved revision, identify the last approved snapshot from repository evidence before restoring.

## Documentation and extension discipline

This file is the workflow authority. The Phase 8 execution plan defines scope/gates; the prompt manifest holds art direction; the decision log is history. No new replacement runbook per continent. Remove superseded active instructions when changing the workflow; preserve historical decisions, `archive/`, `assets-original/` and still-used packaged assets. A legacy directory is not automatically disposable.

To enable a future asset family, register approved IDs/references/paths, its source-spec extraction, validators and narrow revision/rollback behavior; add resolver support and tests, then mark it ready. Do not advertise unimplemented generation commands as working. The user still supplies a short family/key command, never technical fields.
