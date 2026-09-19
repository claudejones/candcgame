# C&C production workbench — parallel development

Status: **review increment 1; not the replacement editor**.
Branch: `editor-next`. Baseline: `132955434f7835064e5d28d8761521111ce0dbf5` (main, 2026-09-19).

Read [AUDIT.md](AUDIT.md) for findings and [PLAN.md](PLAN.md) for the migration and acceptance gates.

## Review this increment

From the repository root, run `python -m http.server 8080`, then open
`http://localhost:8080/workbench-next/`.

This is a working **sprite workspace proposal**, using the approved character and hazard images. It includes both characters, all six states, all nine existing stages' hazards, a shared frame strip, step/play controls, full-atlas view, per-frame crops, before/after comparison, undo/redo, separate draft saving, and export. Jump/Hit playback here is an explicitly labeled artwork loop, not simulated gameplay or a timing change. Test and Game connections are visibly deferred.

It does not load the old runtime, write the current editor's storage, modify images/configuration, or change gameplay. The candidate crop export has its own format and is **not** a current game-config import. Future integration must migrate these drafts explicitly.

## Isolation

- Everything in this increment is under `workbench-next/`.
- Existing `src/`, `assets/`, `archive/`, `config/`, CI and Pages workflows remain unchanged.
- Storage key: `cc-workbench-next-sprite-draft-v1`; no reads/writes to current editor checkpoints.
- No production promotion, main merge or Pages deployment before user approval and the existing gates.
- `tmp/` is intentionally not used: repository policy excludes it from Git.
- Approved source and archive files remain immutable. Keep the candidate out of the production bundle at eventual integration.

## Checks

`node --test workbench-next/model.test.mjs`

`node workbench-next/build-catalog.cjs --check`

`node --check workbench-next/app.mjs`

`build-catalog.cjs` reads the existing runtime source map without executing the runtime and writes this candidate's asset catalog. It is a transitional read-only bridge; milestone 2 replaces it with a shared authoritative registry. Run it again when source paths change. Candidate code uses the real config's cell sizes, frame counts and crop defaults.

Next milestone: review the proposed organization and finish persistence/runtime contracts before connecting the candidate to gameplay. See PLAN.md. Do not treat this increment as feature parity or approval of the replacement.
