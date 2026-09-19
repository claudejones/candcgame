# C&C production workbench — parallel development

Status: **review increment 5.2; not the replacement editor**.
Branch: `editor-next`. Audit baseline: `132955434f7835064e5d28d8761521111ce0dbf5`; upstream refreshed through main `b469182fd6ee76c346a959cfde82a5b108b048ed` for the approved EU01 and SA03 landscapes (2026-09-19). Production source/assets match this upstream snapshot; candidate-only changes remain under `workbench-next/`.

Read [AUDIT.md](AUDIT.md) for findings and [PLAN.md](PLAN.md) for the migration and acceptance gates.

## Review this increment

[Open the private design preview](https://candc-workbench-next.claudejones.chatgpt.site). Publication is confirmed; user visual acceptance remains pending.

Private preview publication is authorized as a separate Site. See [PREVIEW_HOSTING.md](PREVIEW_HOSTING.md) for its identity and repeatable packaging. This does not authorize replacing the working editor or deploying this branch over GitHub Pages.

GitHub remains the source of truth and GitHub Pages is the final delivery destination after approval. The ChatGPT Site is only a temporary review host; no hosting-specific API is required by the editor.

Review 02 separates **Stage** and **Character** sub-tabs, remembers each character's state/frame and each stage's selected hazard/frame during the session, labels global versus stage scope, and reduces headings/spacing. The stage selector appears only in Stage. Crop editing waits for the selected image to finish loading.

Review 04 lists **Stage → Landscape → FAR/MID/GROUND** directly in the left panel. Character animation states are also on the left. Use **Scene**, **Layer** or **Source** to choose the view. Scale, X/Y offsets and parallax change the scene; scroll to inspect repetition. Layer/cloud visibility and the ground guide are temporary preview settings. Compare shows the baseline beside the draft. Review 05.1 uses approved assets for NA01–NA03, SA01–SA03 and EU01; EU02/EU03 remain explicitly labeled legacy sets until synchronized from an approved upstream snapshot.

The review host packages a GitHub snapshot; refreshing a browser does not synchronize newer upstream artwork. Every asset refresh must update the branch, registry, catalog and private deployment together. Images retain their approved bytes and hash-based cache keys; the catalog revalidates on startup. Preview packaging removes generated output first so superseded images are not retained in the archive.

The exact Review 05 → 05.1 draft migration is recorded in `project-migrations.json`. Saved v4 projects and older v2/v3 Design files keep all sprite crops/bounds and custom transforms. Untouched legacy landscape values move to the new approved defaults. Unknown source revisions are still rejected. Save all preserves the previous v4 browser record under `cc-workbench-next-before-artwork-refresh-v4`; download it under Changes & recovery. No browser record is overwritten automatically during loading.

From the repository root, run `python -m http.server 8080`, then open
`http://localhost:8080/workbench-next/`.

This is a working **landscape and sprite Design proposal**, using repository artwork. It includes both characters, all six states, all nine existing stages' hazards, a shared frame strip, step/play controls, full-atlas view, per-frame crops, before/after comparison, undo/redo, separate draft saving, and export. Jump/Hit playback here is an explicitly labeled artwork loop, not simulated gameplay or a timing change. Test and Game connections are visibly deferred.

It does not load the old runtime, write the current editor's storage, modify source images/configuration, or change gameplay. The candidate project export has its own format and is **not** a current game-config import. Future runtime integration must convert these complete drafts explicitly. Test and Game remain required next milestones.

## Landscape playback

Review 05.2 adds **Play scroll / Pause**, **Restart** and **Replay** beside the existing slider. In Stage → Landscape → Scene, Play moves from the current position to the preview endpoint of 4,800 px (40 seconds from zero at the unchanged 120 px/s world speed). Restart begins at zero immediately; Replay starts over after reaching the endpoint. The shared clouds drift at the runtime's 8 px/s, with existing stage visibility, scale, height and opacity. Layer view isolates the selected layer; Source remains static. This range checks landscape repetition and is not a full gameplay course or finish sequence.

Scrubbing pauses and sets both world and cloud positions consistently. Baseline comparison uses the same time. Pause freezes the complete Design preview for inspection; it does not redefine gameplay pause behavior. Playback stops on asset/stage selection, Source view, history/project actions and a hidden browser tab. Controls wait for the selected assets to load. Playback and visibility are temporary preview state, never saved configurations. Inspector fields retain focus while the canvas moves.

## One project, all configurations

Review 05 adds **Continent → Stage**, derived from available stage metadata. Each continent remembers its last stage during the session, and each stage retains its selected asset. Only the three available continents and nine stages are selectable; the menu will expand with the registry. Character settings remain shared across stages.

- **Save all** writes every editable landscape transform, character/hazard crop and atlas boundary to one browser checkpoint. It includes stages/assets you have not selected. Saving does not commit to GitHub. The status shows unsaved changes or the successful browser-save time.
- **Export all** downloads the complete working project, including unsaved changes. Images remain in the repository. Exports do not mark the browser draft as saved.
- **Import** validates a project before showing field-by-field differences against your current work. Applying replaces the full editable configuration; resets are visible in the comparison. It creates a pre-import browser recovery copy first, then applies one undoable transaction. Choose Save all to persist the imported draft.
- **Changes & recovery** compares all scopes with the GitHub baseline, identifies the source baseline, and lets you review or download the pre-import copy. That copy survives saving and reloading. Browser data is local to its origin: export/import transfers work between the preview and a compatible future GitHub-hosted editor.

New v4 files record source baseline, actual asset SHA-256 hashes and dimensions. Incompatible files are rejected before mutation. Older v1/v2/v3 drafts are accepted with compatibility notes; missing landscapes/boundaries use baseline values and every resulting reset is shown. Production game-config files are rejected. Maximum import size is 2 MB.

Failed writes retain the working draft and its dirty status. An import cannot apply unless its recovery copy was stored. Conflicting saves from another browser tab require export/reload. An unreadable browser save can be downloaded and is backed up before an explicit Save all replaces it. Original v1/v2/v3 keys remain untouched.

## Frame boundary editing and layout

Select a character/state or hazard, then a frame. **Atlas frame boundary** provides Source X/Y/Width/Height. **Edit bounds on atlas** opens the full atlas: drag its selected rectangle or resize an edge/corner; arrow keys nudge, Shift nudges 10 px, Escape cancels the current drag. Each drag is one Undo step. Bounds stay inside the image and preserve a valid fine crop. Neighboring-frame overlap is flagged for inspection. A shared frame registration space preserves source-pixel placement and prevents per-pose auto-scaling. Source PNGs are never rewritten.

For the rolling barrel, the baseline equal-width frame 3 includes part of frame 4; frame 4 starts too far right. Review-only verified corrections are frame 3 X=1086, Y=0, Width=491, Height=724; frame 4 X=1577, Y=0, Width=595, Height=724. These are examples to enter as draft edits, not silently applied production defaults.

The preview fits both width and height. Zoom can show actual source pixels with scrolling. **View options** contains comparison, crop outlines, layer visibility and guides. Inspector groups and the frame strip collapse. **Focus view** hides both side panels; **Show panels** or Escape restores them. Panel choices persist separately from the design draft. Test/Game remain planned.

## Isolation

- Everything in this increment is under `workbench-next/`.
- Existing `src/`, `assets/`, `archive/`, `config/`, CI and Pages workflows remain unchanged.
- Storage key: `cc-workbench-next-project-v4`; pre-import recovery: `cc-workbench-next-before-import-v4`; unreadable-save backup: `cc-workbench-next-unreadable-save-v4`. Older candidate keys are read only for recovery. Layout choices use `cc-workbench-next-layout-v1` separately. No reads/writes to current editor checkpoints.
- No production promotion, main merge or Pages deployment before user approval and the existing gates.
- `tmp/` is intentionally not used: repository policy excludes it from Git.
- Approved source and archive files remain immutable. Keep the candidate out of the production bundle at eventual integration.

## Checks

`node --test workbench-next/*.test.mjs`

`node workbench-next/build-catalog.cjs --check`

`node --check workbench-next/app.mjs`

`node workbench-next/build-preview.mjs /absolute/path/to/separate-preview-checkout`

`build-catalog.cjs` reads the existing runtime source map without executing the runtime and applies the shared landscape registry's active source overrides. Run it again when source paths or approvals change. Candidate code uses the real config's cell sizes, frame counts, crop defaults and production landscape geometry function. Source PNGs are copied without modification. Only the selected sprite or selected scene's layers/clouds are requested by the browser.

Next milestone: connect the complete draft to the existing runtime and in-scene character/hazard/finish/FX editing, then implement actual Test and Game modes. See PLAN.md. This increment does not establish gameplay parity or approve replacement.
