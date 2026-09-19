# C&C production workbench — parallel development

Status: **review increment 8.1; not the replacement editor**.
Branch: `editor-next`. Audit baseline: `132955434f7835064e5d28d8761521111ce0dbf5`; upstream refreshed through main `e7b2b9625d499b5dae633c94ac83b74166fa4ed0` for EU02 and EU03 landscapes (2026-09-19). Production source/assets match this upstream snapshot; candidate-only changes remain under `workbench-next/`. EU02 is approved; EU03 is integrated and awaiting artwork approval.

Read [AUDIT.md](AUDIT.md) for findings and [PLAN.md](PLAN.md) for the migration and acceptance gates.

## Review this increment

[Open the private design preview](https://candc-workbench-next.claudejones.chatgpt.site). Publication is confirmed; user visual acceptance remains pending.

Private preview publication is authorized as a separate Site. See [PREVIEW_HOSTING.md](PREVIEW_HOSTING.md) for its identity and repeatable packaging. This does not authorize replacing the working editor or deploying this branch over GitHub Pages.

GitHub remains the source of truth and GitHub Pages is the final delivery destination after approval. The ChatGPT Site is only a temporary review host; no hosting-specific API is required by the editor.

Review 02 separates **Stage** and **Character** sub-tabs, remembers each character's state/frame and each stage's selected hazard/frame during the session, labels global versus stage scope, and reduces headings/spacing. The stage selector appears only in Stage. Crop editing waits for the selected image to finish loading.

Review 04 lists **Stage → Landscape → FAR/MID/GROUND** directly in the left panel. Character animation states are also on the left. Use **Scene**, **Layer** or **Source** to choose the view. Scale, X/Y offsets and parallax change the scene; scroll to inspect repetition. Layer/cloud visibility and the ground guide are temporary preview settings. Compare shows the baseline beside the draft. Review 05.3 uses the current integrated landscape sets for all nine stages. NA01–NA03, SA01–SA03 and EU01–EU02 are approved; EU03 is labeled as awaiting approval in Source & status.

The review host packages a GitHub snapshot; refreshing a browser does not synchronize newer upstream artwork. Every asset refresh must update the branch, registry, catalog and private deployment together. Images retain their approved bytes and hash-based cache keys; the catalog revalidates on startup. Preview packaging removes generated output first so superseded images are not retained in the archive.

The exact Review 05 and Review 05.1/05.2 source signatures are recorded in `project-migrations.json` for conversion to the current artwork snapshot. Saved v4 projects and older v2/v3 Design files keep all sprite crops/bounds and custom transforms. Untouched legacy landscape values move to the new baseline defaults, including zero EU02/EU03 offsets. Unknown source revisions are still rejected. Save all preserves the previous v4 browser record under `cc-workbench-next-before-artwork-refresh-v4`; download it under Changes & recovery. No browser record is overwritten automatically during loading. Custom offsets remain intentional edits; use Compare baseline to inspect them against the new artwork.

From the repository root, run `python -m http.server 8080`, then open
`http://localhost:8080/workbench-next/`.

This is a working **landscape and sprite Design proposal**, using repository artwork. It includes both characters, all six states, all nine existing stages' hazards, a shared frame strip, step/play controls, full-atlas view, per-frame crops, before/after comparison, undo/redo, separate draft saving, and export. Frame/atlas playback is an artwork loop; Scene additionally provides the production-derived movement and contact checks described below. Test and Game connections are visibly deferred.

It does not load the old runtime, write the current editor's storage, modify source images/configuration, or change gameplay. The candidate project export has its own format and is **not** a current game-config import. Future runtime integration must convert these complete drafts explicitly. Test and Game remain required next milestones.

## Continuous Scene playback — Review 08.1

**Play scene** now repeats continuously by default. **Loop** repeats the selected hazard pass, proposal action demo or checked stage sequence. Each repeat resets its actor/action schedule and contact result while the landscape and clouds continue on the existing world clock. The preceding result stays visible as **Previous**. This repeats the current scenario; it does not generate a new random course.

**Pause / freeze** retains the exact current time; **Next frame** advances one simulation step while frozen. **Stop** returns the scene to its beginning, frozen, retaining the selected demo/sequence. **Restart** returns to the beginning and plays. Turning Loop off finishes the current pass and stops at its endpoint. **Pause on contact** is an explicit exception: it freezes on the first contact of each pass. Selection, editing focus, project actions and hidden tabs retain their existing pause behavior. Controls wait for scene readiness.

Loop and transport state are preview settings; Save all/Export retain the same v6 project data. Artwork, calibration values, timing-window calculations and production runtime code are unchanged in this update.

## Assisted calibration — Review 08

Start with **Calibrate hazards → Optimize stage**. Select a result to see **Before / Proposed** in the Scene and numerical changes in the inspector. **Demo Claude / Demo Constance** automatically times the suggested Jump or Slide; flying hazards support HIGH and LOW. Freeze, Next frame and Replay still work. Mark the proposals you accept as **Reviewed**, then **Apply reviewed stage** or **Apply all reviewed**. A batch is one Undo step. **Save all / Export all / Import** include the complete result.

- **Shared pathway Y** belongs to the selected stage. It begins at the midpoint of the two current character foot references, with zero initial displacement. Moving it moves both characters and hazards with **Follow shared pathway** enabled. Character-only shared/state/stage corrections stay local; changes to either character invalidate the hazard checks. Re-optimize to update collision/clearance suggestions after a reference change. Auto-follow handles position; it does not silently rewrite approved hitboxes.
- Ground proposals use measured visible support from the existing cropped frames, accounting for transparent padding. HIGH flying clearance is derived from both Slide collision envelopes; LOW is placed relative to the shared pathway. Frame-to-frame support variation is flagged. These are reviewable suggestions, not new artwork metadata or image edits. Both characters remain fixed throughout optimization.
- Every manually changed hazard field is locked from optimization. You can toggle each field's lock explicitly. Turning **Follow shared pathway** off freezes the hazard at its current position and preserves its grounding during optimization; switching it back on links future pathway movement without a jump. Stage-specific placement and hitbox overrides remain available.
- The bounded solver checks all hazard starting frames against all Run starting frames for both characters at 60 simulation steps/s using production movement/intersection methods. It searches only plausible collision dimensions/clearances; it does not change artwork scale or character physics. Results report measured input windows and standing contact. **Needs adjustment** means the current target was not established; review can still apply its limited proposal, but it is not marked checked or eligible for a sequence.
- **Difficulty · global** stores editable Easy / Standard / Hard profiles: ground/flying speed, minimum input window, arrival/reaction spacing, count and maximum visible hazards. Easy starts at the proven base speed with a larger timing margin, fewer hazards, longer gaps and one visible hazard. Slowing an obstacle can make it harder to clear during a fixed-duration action, so lower speed alone is not labeled easier. Hard increases speed and density; Jump/Slide physics and hitboxes remain shared.
- **Generate stage sequence** checks the current applied draft, excludes hazards that miss the selected profile (listed by name), respects the per-hazard inclusion toggle, and verifies a complete action schedule for both characters. **Watch checked sequence** demonstrates it with automatic actions; freeze/step remain available. Change the scene character, then Watch again for the other character. A relevant edit, profile change or stage change requires regeneration. This is a deterministic Design demo, not the complete production spawn director or Test/Game mode.
- **Optimize all** visits all 27 currently available hazards across nine stages, with decoded-image reuse, visible progress and cancellation. Nothing is applied automatically. New v6 projects include pathway references, profiles, follow/include settings, locks and check provenance. Real v5 saves retain their existing edits; customized hazard fields migrate as locked. The older browser record is retained. Transient proposals and generated demos are not saved; regenerate them from the saved configuration.
- The compact Hand icon and Space + drag pan the zoomed preview without editing the draft.

Test and Game, damage/recovery, FX/finish authoring and full runtime snapshot conversion remain the next delivery milestones. Production files and the working GitHub Pages editor are unchanged.

## Contact checks and direct scene editing — Review 07

- **Play scene** runs one selected hazard past the character. Game actions use the production CharacterMachine movement/state methods and ObjectQA intersection rule, extracted into a small generated adapter. Jump integrates the unchanged launch/gravity; Slide uses the current runtime's **0.75 s**. The existing 0.70 s historical-spec discrepancy remains a separate reconciliation; this increment changes no production timings.
- **Jump / Slide** work during playback or while frozen; Next frame then advances the triggered action. **Replay pass** resets the encounter and starts it again. **Pause on contact** freezes on the first intersecting 1/60-second step, including within a delayed display callback. Contact remains latched for that pass. “Cleared” appears only after an uninterrupted pass started ahead of the character and the full hazard/collider has left the viewport. No lives, damage or hit reaction is triggered.
- **Scene setup → Playback → Pose loop** retains artwork calibration for individual states. Its contact result applies to that pose, not a gameplay jump. Game actions are the default. The selected character's six state atlases load before controls enable, using the existing loading/decode indicator and cache; unrelated stages/characters are not loaded.
- Click an actor or choose **Editing → Character / Hazard** in the inspector to switch the editing target without resetting the clock, zoom or pan. The right panel shows placement, grounding/flight clearance, and **Hitbox** for that actor. In Game actions it follows the actual character state. Focusing an input freezes motion for stable editing. Frame/Full atlas open the currently edited actor.
- **Edit hitbox on scene** shows handles: drag inside to move, edges/corners to resize. All drags use the same production ratios and limits as numeric inputs, are one Undo step, and join existing Save all / Export all / Import. Escape, cancellation, blur, view changes and project actions cancel unfinished drags. At character collision height 1, the production vertical-offset equation has no spare height; reduce height to adjust Y. No collision semantics are silently changed to make dragging unrestricted.
- **Hand** or **Space + drag** pans the zoomed preview, including the baseline. Fit restores the fitted view. Pan gestures take priority over atlas/hitbox edits and never alter the draft. Actor selection retains the view. Browser-native scrolling remains available.
- Editing geometry invalidates the historical pass result; replay is required to establish a new clear result. Frozen geometry still shows current overlap. Preview actions, contact results, panning, diagnostic visibility and motion choices are transient, excluded from the v5 project. Existing saves/imports remain compatible.

Checks: `node workbench-next/build-runtime-rules.mjs --check` verifies the generated action adapter against production source. Node tests compare movement through landing and timed slide, collision geometry and contacts, fixed-step catch-up, pass result validity, and hitbox inversion. The optional DOM/canvas integration script exercises actual controls, save/import and pointer events; it does not establish browser CSS/layout acceptance. Complete stage gameplay, damage/recovery, FX/finish and Test/Game remain future milestones.

## In-scene character and hazard calibration — Review 06 (historical increment)

Select **Character → Claude/Constance → state**, or **Stage → hazard**. The new **Scene** view shows the selected character and one selected hazard together on the stage. **Frame** and **Full atlas** retain their existing per-frame editing tools. In Character Scene, Continent/Stage is explicitly a preview context; selecting it never changes shared character settings. Scene companions choose the comparison hazard, or the character/state shown beside a selected hazard.

- Character inspector: shared master scale and foot offset; state scale and X/Y; separately labeled character + stage grounding; state collision proportions/offsets.
- Hazard inspector: scale and placement X, ground offset or HIGH/LOW flight clearance, animation FPS where applicable, and collision proportions/offsets. Settings belong to that hazard's stage.
- **Play scene / Pause (freeze)** moves scenery, clouds, pose animation and the selected hazard on one clock. **Next frame** freezes and advances exactly 1/60 second; a pose changes only when its FPS reaches the next frame. **Restart** returns to time zero, frozen. Speeds: ¼×, ½×, 1×, 2×.
- View options: ground/foot guides, collision boxes, baseline comparison and scroll/hazard travel. Turn travel off to animate poses in place. Frozen numeric edits repaint immediately without advancing time. Playback repaints canvases/readouts without rebuilding focused inspector controls.
- Comparison uses the same clock and preview selections. Selection/view changes, history, project actions and hiding the browser tab stop motion. Scene controls remain disabled until all selected images finish decoding; failed assets offer Retry.

Review 06 was a Design pose/pass preview: Jump, Slide and Hit looped their artwork for calibration. Review 07 adds the isolated interaction simulation described above. The original Review 06 scope follows: It does not simulate jump physics, timed gameplay actions, collision outcomes or the stage course. Test/Game, FX/finish authoring and the complete production runtime adapter remain separate milestones. Baseline drawing equations are checked directly against the existing production renderer; gameplay geometry uses the canonical Y=410 surface independently of visual landscape offsets.

**Save all / Export all / Import** now include every placement/collision field across both characters, all states and all stages. Placement edits share Undo/Redo with crops, bounds and landscape edits. New exports use v5. Existing v4 and earlier projects retain their old frame/landscape edits and receive baseline defaults for newly introduced settings; every reset is visible on import review. A v5 browser checkpoint is separate from the retained v4 record, downloadable under **Changes & recovery → Download previous editor save**. Existing artwork migrations still apply; no PNGs or production config values changed.

## Landscape playback

Review 05.2 adds **Play scroll / Pause**, **Restart** and **Replay** beside the existing slider. In Stage → Landscape → Scene, Play moves from the current position to the preview endpoint of 4,800 px (40 seconds from zero at the unchanged 120 px/s world speed). Restart begins at zero immediately; Replay starts over after reaching the endpoint. The shared clouds drift at the runtime's 8 px/s, with existing stage visibility, scale, height and opacity. Layer view isolates the selected layer; Source remains static. This range checks landscape repetition and is not a full gameplay course or finish sequence.

Scrubbing pauses and sets both world and cloud positions consistently. Baseline comparison uses the same time. Pause freezes the complete Design preview for inspection; it does not redefine gameplay pause behavior. Playback stops on asset/stage selection, Source view, history/project actions and a hidden browser tab. Controls wait for the selected assets to load. Playback and visibility are temporary preview state, never saved configurations. Inspector fields retain focus while the canvas moves.

## One project, all configurations

Review 05 adds **Continent → Stage**, derived from available stage metadata. Each continent remembers its last stage during the session, and each stage retains its selected asset. Only the three available continents and nine stages are selectable; the menu will expand with the registry. Character settings remain shared across stages.

- **Save all** writes every editable landscape transform, character/hazard crop and atlas boundary to one browser checkpoint. It includes stages/assets you have not selected. Saving does not commit to GitHub. The status shows unsaved changes or the successful browser-save time.
- **Export all** downloads the complete working project, including unsaved changes. Images remain in the repository. Exports do not mark the browser draft as saved.
- **Import** validates a project before showing field-by-field differences against your current work. Applying replaces the full editable configuration; resets are visible in the comparison. It creates a pre-import browser recovery copy first, then applies one undoable transaction. Choose Save all to persist the imported draft.
- **Changes & recovery** compares all scopes with the GitHub baseline, identifies the source baseline, and lets you review or download the pre-import copy. That copy survives saving and reloading. Browser data is local to its origin: export/import transfers work between the preview and a compatible future GitHub-hosted editor.

New v6 files record source baseline, actual asset SHA-256 hashes and dimensions. Incompatible files are rejected before mutation. Older v1/v2/v3/v4 drafts are accepted with compatibility notes; missing landscapes/boundaries use baseline values and every resulting reset is shown. Production game-config files are rejected. Maximum import size is 2 MB.

Failed writes retain the working draft and its dirty status. An import cannot apply unless its recovery copy was stored. Conflicting saves from another browser tab require export/reload. An unreadable browser save can be downloaded and is backed up before an explicit Save all replaces it. Original v1/v2/v3 keys remain untouched.

## Frame boundary editing and layout

Select a character/state or hazard, then a frame. **Atlas frame boundary** provides Source X/Y/Width/Height. **Edit bounds on atlas** opens the full atlas: drag its selected rectangle or resize an edge/corner; arrow keys nudge, Shift nudges 10 px, Escape cancels the current drag. Each drag is one Undo step. Bounds stay inside the image and preserve a valid fine crop. Neighboring-frame overlap is flagged for inspection. A shared frame registration space preserves source-pixel placement and prevents per-pose auto-scaling. Source PNGs are never rewritten.

For the rolling barrel, the baseline equal-width frame 3 includes part of frame 4; frame 4 starts too far right. Review-only verified corrections are frame 3 X=1086, Y=0, Width=491, Height=724; frame 4 X=1577, Y=0, Width=595, Height=724. These are examples to enter as draft edits, not silently applied production defaults.

The preview fits both width and height. Zoom can show actual source pixels with scrolling. **View options** contains comparison, crop outlines, layer visibility and guides. Inspector groups and the frame strip collapse. **Focus view** hides both side panels; **Show panels** or Escape restores them. Panel choices persist separately from the design draft. Test/Game remain planned.

## Isolation

- Everything in this increment is under `workbench-next/`.
- Existing `src/`, `assets/`, `archive/`, `config/`, CI and Pages workflows remain unchanged.
- Storage key: `cc-workbench-next-project-v6`; pre-import recovery: `cc-workbench-next-before-import-v4`; unreadable-save backup: `cc-workbench-next-unreadable-save-v4`. Recovery keys retain their existing names; v5/v4 browser saves are preserved. Older candidate keys are read only for recovery. Layout choices use `cc-workbench-next-layout-v1` separately. No reads/writes to current editor checkpoints.
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
