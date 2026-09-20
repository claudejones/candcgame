# Workflow optimization verification

2026-09-20. Scope: command execution, recovery, local validation reuse, publication and asset-ready Workbench refresh. No generated or approved artwork, runtime release or calibration defaults changed.

## Observed cost and control failures

- AF01 recorded 25 generation attempts, AF02 15. Repeated atlas/canvas/alpha defects consumed attempts; these are attempt counts, not a model usage measurement. See AF01_STAGE_QA.md and AF02_ASSET_QA.md and retained coordinator runs.
- The main checkpoint was 182,293 characters and embedded roughly 56k characters of repeated worker packets per completed Africa stage. Each worker received both profiles. Active checkpoint is now 50,900 characters (72.1% smaller); exact historical packet contents and all approval pointers were compared against the original and preserved. Full packet/history reads made routine resumes unnecessarily large.
- AGENTS + CURRENT_STATUS + ASSET_COMMAND_WORKFLOW totaled 34,820 characters. Startup reduced to 12,337 characters (64.6% fewer), with detailed procedures loaded only for the operation that needs them. Counts are UTF-8 decoded characters, not tokens.
- Main reported no active run while `work/assets/af03` contained a durable FAR and unfinished jobs. A resume must inspect the actual recovery branch and distinguish recorded state from verified current bytes.
- Publication rebuilt object/ref/CI steps interactively. The reusable publisher now executes those gates and returns only its status. This reduces repeated reasoning and output; CI itself is not removed.

## Implemented protections

- Default command output is bounded to 6,000 characters; selected worker detail to 14,000. Measured selected-stage view: 1,134 characters; recovery fixture: 486; live AF03 resume: 864; selected flying brief about 8.7k. Profiles are scoped by worker type. Historical packet evidence remains hash-addressed outside the main checkpoint; approvals and selected file hashes remain intact.
- Failure classification routes a repeated defect to diagnosis and bounded candidate finishing rather than unconstrained regeneration. It cannot mark a failed image accepted.
- Local image validation cache keys actual bytes, effective geometry and validator dependencies. Live schema/hash/evidence checks remain; CI bypasses the cache. Tests cover changed bytes, metadata, validator/config dependencies, corrupt entries and CI bypass.
- Publication checks connected-tool response/argument formats, exact local/remote tree equality, both branch heads, non-force writes, branch-specific push CI, and main-SHA Pages. Tests cover interruption/retry, mismatched blobs/trees, concurrent refs and false CI matches. Durable progress is stored on a dedicated recovery branch before ref writes and at completion, not per blob or polling cycle.
- Existing artifact-ready vs calibrated-release boundaries remain. Workbench refresh is explicit and applies only to imported asset-ready stages, retaining manual edits and requiring affected calibration/visual review. It does not refresh released artwork implicitly.

## Reproduction and limits

Run `node --test scripts/tests/*.test.cjs scripts/tests/*.test.mjs`, the existing Production CI validation step with `CI=true`, and `git diff --check`. On editor-next run the Workbench importer/project tests and catalog consistency check. Inspect `node scripts/assets.mjs resume AF03` and `handoff` against the current remote recovery branch. The command budget regression tests enforce measured output size.

No transcript-wide token accounting or interface-limit root cause is claimed. Independent worker contexts can reduce coordinator payload but do not make returned results free. This change has not measured future image quality, end-to-end throughput or a subscription percentage. The next stage trial should record attempts by defect, reused files, setup/output size, recovery reuse and elapsed generation/publication time separately. Passing tooling tests is not approval of any new artwork or calibration.

Validation: final Workbench suite passed 68/68 tests. Historical packet contents and approval pointers were compared with the pre-change Git snapshot. The latest toolchain/recovered-workspace regression passes without changing pinned inputs.

Final main snapshot passed the full existing Production CI shell step locally with `CI=true` (cache bypass), including all integrated PNG/geometry and runtime/schema checks. `git diff --check` passed.
