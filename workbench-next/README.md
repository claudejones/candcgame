# C&C production workbench — parallel development

Status: **review increment 12; not the replacement editor**.
Branch: `editor-next`. Upstream incorporated through main `bf5d788` for the completed AF02 handoff and asset-ready workflow. Existing numerical Workbench defaults remain explicit in `source-config.js`; its source revision is the preserved calibration baseline. NA/SA/EU landscapes and AF01 artwork are approved. AF02 is imported for user calibration, with artwork/calibration/release acceptance tracked separately.

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

## AF02 asset-ready import — Review 12

AF02 is available under **Africa → AF02 · Namibia — Sossusvlei dunes**. The exact `config/asset-handoffs/af02.json` v1 handoff supplies FAR/MID/GROUND, Curled clay-pan crust plates, Forked dead camelthorn snag and four-frame Namaqua sandgrouse. All five PNGs retain their source hashes. Landscape offsets are zero, and crops, source anchors, provisional scale/body bounds, animation and HIGH/LOW offsets come directly from the handoff. The bird mirrors toward the player in Frame and Scene; Full atlas retains right-facing source pixels.

This is the first real asset-ready import. It adds AF02 to Design only and clearly labels calibration as pending. The production catalog/landscape registry still leave AF02 pending, with no release, finish or gameplay certification. AF01's upstream artwork acceptance is now reflected; its calibration and all existing Workbench defaults are preserved. Unimported stages remain absent. Full Test/Game integration remains pending.

The v8 project format is unchanged. Known ten-stage v8 saves and all previously supported older saves gain AF02's starting settings while retaining existing crops, frames, transforms, placement, stage pathway links, difficulty profiles and locks. Save all preserves the old v8 record as an artwork-update recovery copy. Import remains a whole-project replacement with a changes review. Existing migration routes are carried forward on every stage import so users can skip intermediate previews safely. No optimization proposals are applied by importing assets.

Import verification covers exact hashes and rendering geometry, both characters, all four bird frames, HIGH/LOW, mirroring/Undo/Redo, stage pathway edits and save/import. The importer is idempotent for identical handoffs and rejects conflicting bytes/metadata. These checks establish an editable stage, not accepted artwork or calibrated gameplay.

## AF01 integration and hazard facing — Review 11 (historical)

AF01 is available under **Africa → AF01 · Tanzania — Serengeti savannah** with FAR/MID/GROUND, Termite mound, Crested porcupine and the four-frame Lilac-breasted roller. All five images are byte-identical to upstream `a09b176dd8531bfb3425c9af534ff197a05a253e`. The imported release remains integrated/awaiting art acceptance; Workbench calibration is a separate user step. AF02/AF03 and other pending stages remain absent from selectors and image requests.

The Workbench uses AF01's explicit source anchors, cropped registration, mirrored rendering/collision X offsets and HIGH/LOW placement corrections (HIGH +22, LOW 0). Frame and Scene show gameplay facing; Full atlas shows original pixels and source coordinates. **Mirror horizontally** in the hazard Scene inspector is saved with the project, supports Undo/Redo and reflects hitbox drag conversion. Crop/bounds edits cannot remove an explicit source anchor. The same geometry drives previews, contact checks, optimization and generated sequences. The optimizer accounts for source anchors when finding a support point or flight height.

A visual audit found the SA02 llama and EU02 bicycle face right; their Workbench defaults now mirror them toward the player. Existing birds face left and retain source direction. The complete list of mirrored defaults is SA02 llama, EU02 bicycle, AF01 porcupine and AF01 roller. Artwork bytes and frame order do not change. Mirror overrides remain per hazard. Recheck timing after a facing change because the collider is reflected with the visible body.

**v8** includes facing and per-hazard HIGH/LOW placement corrections. Known nine-stage saves/exports are validated against their original stage set before AF01 defaults are added. Existing crops, bounds, numeric placement, pathway links, profiles and locks are retained. v7/v6/v5/v4 browser records remain recoverable; a newer save does not overwrite them. Import still replaces the whole project after review, including any resets of AF01 when importing an older nine-stage file. Unknown provenance and malformed/missing old entries are rejected before mutation.

Upstream production/runtime changes are incorporated on the isolated editor branch. `source-config.js` explicitly retains the Workbench's earlier eleven numerical hazard defaults instead of silently promoting the other agent's comparison candidates. Upstream code/config/evidence is otherwise unchanged. The selected runtime source files are declared once in `source-files.json`; catalog and preview builds use that same boot order. Production main/Pages and approved source images are not changed by this Workbench publication. Full Test/Game integration remains pending.

[Asset production handoff and required workflow changes](ASSET_HANDOFF.md) distinguishes artwork/metadata QA from later calibration. The current upstream release validator still requires gameplay checks; the production-workflow owner must introduce a separate asset-ready handoff before those checks can be removed from asset completion. No skipped checks may be labeled passed.

## Stage grounding — Review 10

**Stage pathway Y · [stage]** is specific to the selected stage. It moves both linked characters and linked hazards together, without changing other stages. The left calibration panel has separate **Claude follows pathway** and **Constance follows pathway** checkboxes. The character Scene inspector exposes the same setting under **Stage grounding → Follow stage pathway**.

The inspector's **Total stage offset · Y** includes the pathway shift and updates immediately. While linked, this field is read-only: use Stage pathway Y. Uncheck the link to edit that character's offset independently for this stage. Unlinking and relinking both preserve its current position; relinking follows future pathway changes without discarding the character's individual correction. Global foot offsets and per-state artwork corrections remain separate. Hazard follow controls keep their existing behavior. Link changes are atomic Undo/Redo actions, including the compensating offset. Out-of-range compensation fails without changing either setting.

The project format/storage key is now **v7**. v6 browser saves and exports migrate with both characters linked, preserving current positions, pathways, profiles, hazard policies/locks and other edits. Save all writes the new copy and retains the old browser record. Export/Import includes every stage's character links. Earlier check certificates require rechecking; no optimization or geometry change is applied during migration. Rendering, optimizer actor caches, HIGH placement suggestions and sequence checks use the same character-link calculation.

## Asset handoff and calibration ownership

Asset creation remains a separate process. The user tells the Workbench agent when a stage's complete asset set is ready; only then does the agent integrate that set and its required metadata into the Workbench, preserving authored configuration. The user calibrates that stage, uses Save all / Export all, and moves on to the next stage. Workbench calibration is **not** a task or completion gate for asset-generation agents. Do not pull in unfinished stages automatically.

“Runtime validation” means checking the saved settings against the actual game's movement, collisions and spawning. Its intended user-facing home is Workbench Test/Game. The current Design scene and checked sequences provide useful previews; full Test/Game runtime integration is still pending. “Complete-stage user review” is ordinary visual/play testing, not an additional implemented feature, separate application or extra approval step in the user's stage-by-stage workflow. Release validation remains distinct from completing assets or saving calibration. Save all stays local; Export all produces a portable project, not an automatic GitHub/game-config publication.

### Import an asset-ready stage

The Workbench agent imports the coordinator's versioned bundle from the source checkout:

```sh
node workbench-next/import-asset-handoff.mjs \
  --bundle /path/to/source-repo/config/asset-handoffs/af02.json \
  --source-root /path/to/source-repo
```

The command accepts schema v1 `asset-ready` bundles only. It verifies the stage's five canonical paths, complete PNG structure and pixel stream, dimensions, SHA-256 hashes, evidence paths, source anchors, frame crops, facing, provisional scale and collision metadata. It copies the verified PNG bytes to their reserved canonical asset paths and adds a Workbench-only preview configuration. Calibration and release remain `pending`; the production stage catalog stays pending and no gameplay checks are synthesized.

An identical repeat is a no-op. Different bytes or metadata for an already imported stage, and conflicting bytes already present at a canonical destination, are rejected so an artwork refresh cannot silently replace saved settings. Existing integrated AF01 bytes are compatibility-checked and retain their current Workbench defaults and acceptance metadata. For a new stage, the generated provenance migration retains all existing crops, bounds, landscape transforms, placement, pathway links, difficulty profiles and field locks, then adds the new stage with pending calibration defaults.

## Shared calibration and organized results — Review 09

**Optimize stage / Optimize all** now proposes one shared hazard configuration and checks it against **Easy, Standard and Hard**. Selecting a different preview difficulty changes the scene speed, timed demo and sequence context; it does not invalidate or rewrite approved geometry. The bounded search preserves every difficulty that the current settings already pass. Artwork size, characters, movement physics and manual field locks stay fixed. A proposal that cannot satisfy every profile remains explicitly flagged; applying it does not certify it as ready for every difficulty.

Results use **continent headings → collapsible stage groups → hazard cards**, with a count for each stage, shared readiness totals, search by hazard/stage/continent, a continent filter and **All / Needs attention / Ready to apply / Selected / Applied** filters. Expand/Collapse stages affects the shown groups. Search opens matching groups. Each card contains Easy/Standard/Hard badges; its review inspector shows a Before/Proposed verdict table and the selected profile's numerical timing windows. Clear filters recovers the complete list. Selection survives filtering; the Apply controls explicitly count selected items hidden by filters. Stage Apply changes only the selected stage, while Apply all selected includes those hidden selections. Both remain one Undo transaction.

**Recheck results** validates existing numbers without optimizing or applying geometry. Editing a profile's relevant speed or minimum timing window automatically rechecks that profile for affected results; unrelated profiles and hazard kinds retain their checks. Changing count, spacing, reaction time or visibility affects generated sequences only. A character/atlas/pathway/hazard reference change marks affected results for recheck; explicitly rechecking those entries uses the new working settings and clears their obsolete proposal. Re-optimize only when new geometry suggestions are wanted. Cancellation leaves unfinished entries marked for recheck and never applies values.

The v6 project format and all existing placement/crop/manual settings are preserved. Only check fingerprints change: old single-profile certificates require a new check; they are not silently relabeled as all-profile approval. Results, filters and reports are session-only; Save all/Export keep authored settings, not transient reports. After reopening, Optimize or Recheck the available results to obtain fresh analysis. Profile settings and the selected preview profile retain their existing persistence behavior.

On the current unmodified artwork baseline, **19 of 27 shared proposals pass all three difficulty targets**; eight remain flagged. All 27 stage/profile sequence combinations clear for both characters using their eligible hazards. These are Design solver results at 60 simulation steps/s, not exhaustive production gameplay certification. The runtime collision-order / timing-window reconciliation, main's eleven comparison candidates and full Test/Game integration remain pending. Neither production files nor existing GitHub Pages are changed by this review.

## Proposal review — Review 08.2

Each hazard has an explicit **Review proposal** button; it becomes **Close comparison** while selected. That action and **Exit proposal** stop/reset the demo, hide comparison and restore the editable working scene without applying anything. Applying or invalidating a proposal also clears its preview.

**Before** is the working configuration snapshot taken when analysis ran, including unsaved edits; it is not necessarily the repository baseline. **Proposed** is the optional replacement. Cards and the inspector show both timing verdicts. If both meet the target, keep the current settings unless the proposed alignment or timing margin is preferable. Both versions now have independently timed **Demo Before/Proposed** buttons for Claude and Constance. The main preview's result is labeled by version and character; the side comparison is a visual reference, not an independently checked encounter.

The selected global difficulty profile, minimum input window and ground/flying speeds are visible with the results. A single demo showing **Cleared** only demonstrates one sampled action time. **Meets target** additionally requires both characters to pass the solver's sampled starting-frame checks, including both HIGH and LOW for flying hazards. Review 09 supersedes the original profile-selection invalidation: switching profiles keeps the all-profile checks; changing relevant timing inputs rechecks them. This review UI update does not change the solver or resolve the runtime parity limitations below.

Select **Reviewed · select to apply** only for proposals you want. Apply buttons show stage and selection counts; the selection note identifies any results still needing adjustment. **Apply** updates the working draft in one Undo step. **Save all** persists in this browser; **Export all** downloads a portable project. Neither writes GitHub or updates the existing production game. Proposals still needing adjustment remain unchecked for sequence eligibility even if deliberately applied.

## Continuous Scene playback — Review 08.1

**Play scene** now repeats continuously by default. **Loop** repeats the selected hazard pass, proposal action demo or checked stage sequence. Each repeat resets its actor/action schedule and contact result while the landscape and clouds continue on the existing world clock. The preceding result stays visible as **Previous**. This repeats the current scenario; it does not generate a new random course.

**Pause / freeze** retains the exact current time; **Next frame** advances one simulation step while frozen. **Stop** returns the scene to its beginning, frozen, retaining the selected demo/sequence. **Restart** returns to the beginning and plays. Turning Loop off finishes the current pass and stops at its endpoint. **Pause on contact** is an explicit exception: it freezes on the first contact of each pass. Selection, editing focus, project actions and hidden tabs retain their existing pause behavior. Controls wait for scene readiness.

Loop and transport state are preview settings; Save all/Export retain the same v6 project data. Artwork, calibration values, timing-window calculations and production runtime code are unchanged in this update.

## Assisted calibration — Review 08

Start with **Calibrate hazards → Optimize stage**. Click **Review proposal** to see **Before / Proposed** in the Scene and numerical changes in the inspector. **Demo Claude / Demo Constance** automatically times the suggested Jump or Slide; flying hazards support HIGH and LOW. Freeze, Next frame and Replay still work. Mark the proposals you accept as **Reviewed · select to apply**, then **Apply selected in [stage]** or **Apply all selected**. A batch is one Undo step. **Save all / Export all / Import** include the complete result.

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

New v8 files record source baseline, actual asset SHA-256 hashes and dimensions. Incompatible files are rejected before mutation. Older v1/v2/v3/v4 drafts are accepted with compatibility notes; missing landscapes/boundaries use baseline values and every resulting reset is shown. Production game-config files are rejected. Maximum import size is 2 MB.

Failed writes retain the working draft and its dirty status. An import cannot apply unless its recovery copy was stored. Conflicting saves from another browser tab require export/reload. An unreadable browser save can be downloaded and is backed up before an explicit Save all replaces it. Original v1/v2/v3 keys remain untouched.

## Frame boundary editing and layout

Select a character/state or hazard, then a frame. **Atlas frame boundary** provides Source X/Y/Width/Height. **Edit bounds on atlas** opens the full atlas: drag its selected rectangle or resize an edge/corner; arrow keys nudge, Shift nudges 10 px, Escape cancels the current drag. Each drag is one Undo step. Bounds stay inside the image and preserve a valid fine crop. Neighboring-frame overlap is flagged for inspection. A shared frame registration space preserves source-pixel placement and prevents per-pose auto-scaling. Source PNGs are never rewritten.

For the rolling barrel, the baseline equal-width frame 3 includes part of frame 4; frame 4 starts too far right. Review-only verified corrections are frame 3 X=1086, Y=0, Width=491, Height=724; frame 4 X=1577, Y=0, Width=595, Height=724. These are examples to enter as draft edits, not silently applied production defaults.

The preview fits both width and height. Zoom can show actual source pixels with scrolling. **View options** contains comparison, crop outlines, layer visibility and guides. Inspector groups and the frame strip collapse. **Focus view** hides both side panels; **Show panels** or Escape restores them. Panel choices persist separately from the design draft. Test/Game remain planned.

## Isolation

- Everything in this increment is under `workbench-next/`.
- Existing `src/`, `assets/`, `archive/`, `config/`, CI and Pages workflows remain unchanged.
- Storage key: `cc-workbench-next-project-v8`; pre-import recovery: `cc-workbench-next-before-import-v4`; unreadable-save backup: `cc-workbench-next-unreadable-save-v4`. Recovery keys retain their existing names; v7/v6/v5/v4 browser saves are preserved. Older candidate keys are read only for recovery. Layout choices use `cc-workbench-next-layout-v1` separately. No reads/writes to current editor checkpoints.
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
