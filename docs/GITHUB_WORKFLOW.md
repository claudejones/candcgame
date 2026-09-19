# GitHub Approval, CI and QA Deployment Workflow

Status: active repository workflow contract.

## Purpose

GitHub is the primary source of truth. Development, asset generation and visual QA remain incremental and approval-gated. Deployment automation removes the need for a separate interactive GitHub login without weakening those gates.

## Normal change path

The agent starts from `ASSET_COMMAND_WORKFLOW.md`; routine commands do not need repeated conversational permission. These CI/deployment gates remain automated and are reported as a short result. They are not additional user artwork approvals.

1. Internal generation and QA may replace working files directly under their final validation paths. Rejected iterations are not published or documented as production history.
2. Once a complete stage passes internal technical and composite QA, create one integration commit on `modular-parity-validation` containing only its final assets, required runtime/configuration changes and compact QA evidence.
3. Require successful `Production CI` for that exact development SHA.
4. Promote the identical validated tree to `main` without force.
5. `Production CI` runs automatically for that `main` push.
6. If and only if that run succeeds, `Deploy QA site to GitHub Pages` starts automatically.
7. The Pages workflow checks out `workflow_run.head_sha`, the exact SHA validated by Production CI, builds the lightweight QA bundle and publishes it.
8. Verify the deployed app, asset hashes/cache keys and exact SHA, then request one integrated-stage user review.
9. After approval, update final status, hashes and durable decisions once. A requested revision returns only the affected asset/configuration to internal QA.

Development-branch CI never deploys Pages. Pull-request CI never deploys Pages. A failed or cancelled Production CI run never deploys Pages.

## Manual fallback

`workflow_dispatch` remains available for recovery or an explicitly requested redeployment. It is a fallback, not the normal release path and not a substitute for visual approval or successful Production CI.

Rerunning an older workflow run is not a valid way to publish a newer commit: a rerun retains the original run's SHA.

## Established connected publication route

The ChatGPT GitHub connection authenticates the connected tools; it does not supply terminal `git push` credentials. Connected publication has succeeded in this project, including SA02. In these sessions use that route directly. Do not test terminal authentication, ask the user to reconnect a working connector, or search prior chats for upload instructions during routine startup. A separate environment with already configured authenticated Git may use its normal push path.

At publication, use the connected GitHub tools (tool prefixes may vary by environment):

1. Read both branch refs and their commit trees with `github_fetch`. Start from the current development tree and preserve concurrent changes.
2. Create changed UTF-8 files with `github_create_blob` using `encoding: utf-8`. For PNGs, pass the exact binary-safe tool result's Base64 data directly in tool orchestration memory to `github_create_blob` using `encoding: base64`; never print that data or relay it through model text. Reuse already uploaded, verified blobs. Require returned blob IDs to match local Git object IDs. If the environment lacks a byte-preserving binary source, report that specific transfer blocker rather than improvise a text relay or transform the image.
3. Use `github_create_tree`, require the resulting tree to match the validated local snapshot, then `github_create_commit` and `github_update_ref` with `force: false`. Follow the development/main gates above. Recheck both refs immediately before branch writes; reconcile concurrent changes before continuing.
4. Read push-triggered checks with `github_fetch` at `https://api.github.com/repos/claudejones/candcgame/actions/runs?head_sha=<COMMIT_SHA>&per_page=20`. Inspect only run name, head SHA, status, conclusion and URL. A reader limited to pull-request runs is not evidence that push CI is unavailable. Preserve exact-SHA verification for both Production CI and Pages.

Resolve tool schemas when needed at publication, not through open-ended pre-generation research. Keep responses and polling compact; the user needs the outcome and review link.

Do not route PNG or other binary assets through shell-output capture, Base64 text relays or another interface that can truncate large outputs. Upload large binaries through a binary-safe Git/GitHub path, then confirm the committed blob matches the local file before promotion.

Production CI reads `config/phase8-landscapes.json`, verifies the generated runtime registry and cache keys, exercises actual host/renderer startup and saved-config/reset behavior, and runs the PNG/composite checks over stages marked `integrated` or `approved`. Offline previews consume the renderer's shared geometry; a pending stage's prospective preview is not deployment evidence. PNG checks retain full chunk/CRC/decompression/scanline integrity, dimensions and alpha/coverage requirements. A failure blocks main validation and automatic Pages deployment. Local single-image iterations use targeted checks; the full automatic CI gate remains.

CI currently runs on every push to either shared branch; successful main CI triggers Pages. Approval metadata therefore triggers automatic checks even when PNGs are unchanged. This is publication of the acceptance record, not another visual approval gate. For an approval-only diff, verify the image/geometry invariants and required automatic runs; do not repeat local artwork QA or browser review unless a concrete unexpected change appears. Required continent regression remains in scope.

## Required handoff evidence

Before a QA build is called ready for testing, record or report:

- approved snapshot SHA on `main`;
- successful Production CI run for that SHA;
- successful Pages deployment run for that same SHA;
- exact deployed QA URL;
- the scope under test, including any development-only pilot flags.

CI and deployment success establish artifact integrity and publication only. They do not constitute visual or gameplay acceptance.

## Conversation and output discipline

- Use one work conversation per stage whenever practical; start a fresh conversation after a completed deployed stage gate.
- Read required authority files once at stage startup and use targeted reads afterward unless a file changes.
- Keep tool output concise. Do not print complete unchanged specifications, large API responses or encoded binary content.
- Report publication results and exceptions; do not narrate routine blob creation, polling or identical-tree promotion step by step.
- Update `CURRENT_STATUS.md` as a concise operational checkpoint. Do not copy resolved troubleshooting history into every handoff.
