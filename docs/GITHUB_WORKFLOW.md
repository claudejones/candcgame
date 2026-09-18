# GitHub Approval, CI and QA Deployment Workflow

Status: active repository workflow contract.

## Purpose

GitHub is the primary source of truth. Development, asset generation and visual QA remain incremental and approval-gated. Deployment automation removes the need for a separate interactive GitHub login without weakening those gates.

## Normal change path

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

## Binary asset transfer

Do not route PNG or other binary assets through shell-output capture, Base64 text relays or another interface that can truncate large outputs. Upload large binaries through a binary-safe Git/GitHub path, then confirm the committed blob matches the local file before promotion.

Production CI runs `scripts/validate-phase8-pngs.js` over every integrated Phase 8 validation landscape. The validator checks PNG signatures, complete chunk boundaries, chunk CRC values, complete IDAT decompression, expected dimensions and exact pixel scanline length. A failed integrity check blocks `main` validation and therefore blocks automatic Pages deployment.

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
