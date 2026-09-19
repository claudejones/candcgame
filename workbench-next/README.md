# C&C production workbench — parallel development

Status: **review increment 4; not the replacement editor**.
Branch: `editor-next`. Audit baseline: `132955434f7835064e5d28d8761521111ce0dbf5`; upstream refreshed through main `723a42b88b44ef610da94222babee51e65018402` for the approved SA02 landscapes and workflow updates (2026-09-19).

Read [AUDIT.md](AUDIT.md) for findings and [PLAN.md](PLAN.md) for the migration and acceptance gates.

## Review this increment

[Open the private design preview](https://candc-workbench-next.claudejones.chatgpt.site). Publication is confirmed; user visual acceptance remains pending.

Private preview publication is authorized as a separate Site. See [PREVIEW_HOSTING.md](PREVIEW_HOSTING.md) for its identity and repeatable packaging. This does not authorize replacing the working editor or deploying this branch over GitHub Pages.

GitHub remains the source of truth and GitHub Pages is the final delivery destination after approval. The ChatGPT Site is only a temporary review host; no hosting-specific API is required by the editor.

Review 02 separates **Stage** and **Character** sub-tabs, remembers each character's state/frame and each stage's selected hazard/frame during the session, labels global versus stage scope, and reduces headings/spacing. The stage selector appears only in Stage. Crop editing waits for the selected image to finish loading.

Review 04 lists **Stage → Landscape → FAR/MID/GROUND** directly in the left panel. Character animation states are also on the left. Use **Scene**, **Layer** or **Source** to choose the view. Scale, X/Y offsets and parallax change the scene; scroll to inspect repetition. Layer/cloud visibility and the ground guide are temporary preview settings. Compare shows the baseline beside the draft. All nine landscapes are available: current registry-approved assets for NA01–NA03, SA01 and SA02, and explicitly labeled legacy assets for the remaining stages.

From the repository root, run `python -m http.server 8080`, then open
`http://localhost:8080/workbench-next/`.

This is a working **landscape and sprite Design proposal**, using repository artwork. It includes both characters, all six states, all nine existing stages' hazards, a shared frame strip, step/play controls, full-atlas view, per-frame crops, before/after comparison, undo/redo, separate draft saving, and export. Jump/Hit playback here is an explicitly labeled artwork loop, not simulated gameplay or a timing change. Test and Game connections are visibly deferred.

It does not load the old runtime, write the current editor's storage, modify source images/configuration, or change gameplay. The candidate Design export has its own format and is **not** a current game-config import. Future integration must migrate these drafts explicitly. Import UI and gameplay integration remain pending.

## Frame boundary editing and layout

Select a character/state or hazard, then a frame. **Atlas frame boundary** provides Source X/Y/Width/Height. **Edit bounds on atlas** opens the full atlas: drag its selected rectangle or resize an edge/corner; arrow keys nudge, Shift nudges 10 px, Escape cancels the current drag. Each drag is one Undo step. Bounds stay inside the image and preserve a valid fine crop. Neighboring-frame overlap is flagged for inspection. A shared frame registration space preserves source-pixel placement and prevents per-pose auto-scaling. Source PNGs are never rewritten.

For the rolling barrel, the baseline equal-width frame 3 includes part of frame 4; frame 4 starts too far right. Review-only verified corrections are frame 3 X=1086, Y=0, Width=491, Height=724; frame 4 X=1577, Y=0, Width=595, Height=724. These are examples to enter as draft edits, not silently applied production defaults.

The preview fits both width and height. Zoom can show actual source pixels with scrolling. **View options** contains comparison, crop outlines, layer visibility and guides. Inspector groups and the frame strip collapse. **Focus view** hides both side panels; **Show panels** or Escape restores them. Panel choices persist separately from the design draft. Test/Game remain planned.

## Isolation

- Everything in this increment is under `workbench-next/`.
- Existing `src/`, `assets/`, `archive/`, `config/`, CI and Pages workflows remain unchanged.
- Storage key: `cc-workbench-next-design-draft-v3`. Existing v2 Design drafts or v1 sprite crops are recovered; saving writes only v3, retaining older copies. Layout choices use `cc-workbench-next-layout-v1` separately. No reads/writes to current editor checkpoints.
- No production promotion, main merge or Pages deployment before user approval and the existing gates.
- `tmp/` is intentionally not used: repository policy excludes it from Git.
- Approved source and archive files remain immutable. Keep the candidate out of the production bundle at eventual integration.

## Checks

`node --test workbench-next/*.test.mjs`

`node workbench-next/build-catalog.cjs --check`

`node --check workbench-next/app.mjs`

`node workbench-next/build-preview.mjs /absolute/path/to/separate-preview-checkout`

`build-catalog.cjs` reads the existing runtime source map without executing the runtime and applies the shared landscape registry's active source overrides. Run it again when source paths or approvals change. Candidate code uses the real config's cell sizes, frame counts, crop defaults and production landscape geometry function. Source PNGs are copied without modification. Only the selected sprite or selected scene's layers/clouds are requested by the browser.

Next milestone: review the proposed organization and finish persistence/runtime contracts before connecting the candidate to gameplay. See PLAN.md. Do not treat this increment as feature parity or approval of the replacement.
