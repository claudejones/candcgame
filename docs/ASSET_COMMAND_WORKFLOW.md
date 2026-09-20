# Asset commands

GitHub repository: `claudejones/candcgame`. Type commands to the agent, not a terminal. In a fresh conversation prefix the first command with `In claudejones/candcgame:`. Within that conversation use the short form. The agent reads AGENTS.md automatically; never append `Follow AGENTS.md`, fill templates or paste prior chats.

| Command | Result |
| --- | --- |
| `help` / `help keys` | Commands / all supported stage and layer keys |
| `help AS01` | Selected stage and readiness |
| `status AF03` | Current checkpoint and recovery state |
| `build stage AS01` | Resolve missing selections/references, then build five assets and an asset-ready handoff when eligible |
| `finish AF03` | Direct single-agent completion from the selected source manifest; see ASSET_FINISH.md |
| `resume AF03` | Inspect durable recovery state and continue unfinished work; never restart completed images |
| `regenerate landscape NA01 FAR` | Replace only the explicitly requested approved layer |
| `revise landscape SA01 MID: keep the snake; remove the monkey` | Edit only that layer to direction |
| `verify SA01` | Verify the selected existing assets/configuration |
| `publish AF03` | Continue publication without generation |
| `approve SA02` | Record explicit acceptance of the reviewed deployed revision |
| `rollback SA01` | Restore the recorded approved stage through a new guarded commit |

Supported keys: NA01–03 North America; SA01–03 South America; EU01–03 Europe; AF01–03 Africa; AS01–03 Asia; OC01–03 Oceania/Australia (AU alias); AN01–03 Antarctica. Keys are case-insensitive; NA1/NA-01 mean NA01. FAR/DISTANT/BG_FAR/BG_DISTANT and MID/BG_MID are aliases. Omit a landscape layer for FAR+MID+GROUND. Discover other families with `help character`, `help hazard`, etc.; discoverability does not grant readiness or generation authority.

For `finish`, the direct ASSET_FINISH.md procedure takes precedence over worker dispatch and shared-branch publication below.

## Agent execution

1. Read AGENTS.md and CURRENT_STATUS.md once; obtain current GitHub state. Run `node scripts/assets.mjs <command>`. Use its operation-specific output. Help/status/resume/publication do not preload generation profiles, stage catalogs or historical runs.
2. Generate only after resolving selected rules and inspecting actual references. Use `node scripts/assets.mjs detail AF03 MID` (with the selected stage/file) to obtain a worker brief. Workers receive only that brief and reference pixels. Do not dump coordinator state. Use at most two workers, no nested managers, and one coordinator for shared files/publication. Single-image edits remain single-agent.
3. Inspect changed images and a composite at canonical geometry. Validate source metadata and basic rendering. Stop at a valid result; investigate a repeated defect before another generation. Technical finishing policy: `docs/ASSET_TECHNICAL_FINISHING.md` (only when needed).
4. New stages from AF02 end with five PNGs and `config/asset-handoffs/<stage>.json`, ready for Workbench calibration. No gameplay activation, character-relative tuning, difficulty balancing or repeated zero-hit course is required. Existing playable revisions retain integrated-stage review. Procedure: the selected section in `ASSET_EXECUTION_REFERENCE.md`.
5. Publish through `GITHUB_WORKFLOW.md` and the connected publisher. Reuse unchanged local validations; automatic CI remains independent. Preserve exact-SHA development CI, identical-tree main promotion, main CI and Pages. Report failures, not routine transfer narration.
6. Return the Workbench handoff or live review link. Asset readiness, artwork acceptance, calibration and release are separate. On closeout run `node scripts/assets.mjs handoff`; print its fully completed next action. Advance to the next stage only when authorized. Never substitute a placeholder prompt.

## Resume and interruption

In a new conversation, `In claudejones/candcgame: resume AF03.` is sufficient. Inspect `work/assets/af03` even if main reports no active run. Resolve divergent heads before writing. Recover verified completed files; unavailable bytes are a recovery blocker, not permission to regenerate. No conversational transcript is required.

Before an intentional stop, persist completed selected files and a compact checkpoint to the recovery branch, verify remote bytes, and give the fully completed resume command. Scratch-only state is not durable. Normal successful publication needs no extra recovery deployment. Detailed coordinator CAS/result/checkpoint commands are in `ASSET_EXECUTION_REFERENCE.md`, read only for that operation.

## Authority and extension

This file defines routing. Focused profiles extract source specifications; change both together when requirements change. Paths/geometry live in the registries; do not repeat them in prompts. The execution reference contains existing detailed gates, the prompt manifest art direction, and DECISION_LOG history. No per-continent setup, additional master runbook or new skill is required.

Approval-only updates retain automatic publication checks but do not repeat unchanged artwork QA/browser review. New asset families need registered keys, references, validators and focused rules before advertising production support. Preserve history, accepted files and concurrent work.
