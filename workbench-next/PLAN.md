# Production editor migration plan

Status: proposed; parallel branch only. The user's approval is required before replacing the working interface.

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

Previous increment: **Review 10 — stage grounding links**. Each stage has independent follow policies for Claude and Constance. Both controls expose the same setting; the inspector shows the total stage offset. Link toggles preserve positions and migrate v6 saves without changing artwork or calibration values. v7 persists the links.

## Stage grounding — Review 10

**Stage pathway Y · [stage]** is specific to the selected stage. It moves both linked characters and linked hazards together, without changing other stages. The left calibration panel has separate **Claude follows pathway** and **Constance follows pathway** checkboxes. The character Scene inspector exposes the same setting under **Stage grounding → Follow stage pathway**.

The inspector's **Total stage offset · Y** includes the pathway shift and updates immediately. While linked, this field is read-only: use Stage pathway Y. Uncheck the link to edit that character's offset independently for this stage. Unlinking and relinking both preserve its current position; relinking follows future pathway changes without discarding the character's individual correction. Global foot offsets and per-state artwork corrections remain separate. Hazard follow controls keep their existing behavior. Link changes are atomic Undo/Redo actions, including the compensating offset. Out-of-range compensation fails without changing either setting.

The project format/storage key is now **v7**. v6 browser saves and exports migrate with both characters linked, preserving current positions, pathways, profiles, hazard policies/locks and other edits. Save all writes the new copy and retains the old browser record. Export/Import includes every stage's character links. Earlier check certificates require rechecking; no optimization or geometry change is applied during migration. Rendering, optimizer actor caches, HIGH placement suggestions and sequence checks use the same character-link calculation.

## Asset handoff and calibration ownership

Asset creation remains a separate process. The user tells the Workbench agent when a stage's complete asset set is ready; only then does the agent integrate that set and its required metadata into the Workbench, preserving authored configuration. The user calibrates that stage, uses Save all / Export all, and moves on to the next stage. Workbench calibration is **not** a task or completion gate for asset-generation agents. Do not pull in unfinished stages automatically.

“Runtime validation” means checking the saved settings against the actual game's movement, collisions and spawning. Its intended user-facing home is Workbench Test/Game. The current Design scene and checked sequences provide useful previews; full Test/Game runtime integration is still pending. “Complete-stage user review” is ordinary visual/play testing, not an additional implemented feature, separate application or extra approval step in the user's stage-by-stage workflow. Release validation remains distinct from completing assets or saving calibration. Save all stays local; Export all produces a portable project, not an automatic GitHub/game-config publication.

Previous increment: **Review 09 — shared calibration and organized results**. One bounded proposal is checked across Easy, Standard and Hard, preserving existing passing profiles. Preview difficulty selection no longer invalidates shared calibration. Relevant speed/target edits recheck affected results without changing geometry; reference edits can be rechecked separately from optimization. Continent/stage groups, search/status filters, profile badges, comparison matrices and explicit hidden-selection counts support large lists. v6 authored settings are unchanged; old single-profile stamps need a new check. Runtime validation reconciliation and full Test/Game remain pending.

Previous increment: **Review 08.2 — clearer proposal review**. Explicit open/close actions reliably restore the working scene. Before/Proposed have separate demos, verdicts and version-labeled results. Difficulty context, selection counts and Apply/Save/Export distinctions are visible. Analysis and preview still make no authored edits. Solver validation reconciliation and Test/Game integration remain pending.

Previous increment: **Review 08.1 — continuous Scene playback**. Play now loops the current scenario by default. Pause freezes, Stop returns to the beginning frozen, Restart begins again, and disabling Loop retains a finite pass. The scenery/cloud clock continues across repetitions. Per-pass contacts, automatic proposal/sequence action schedules, readiness and v6 persistence are preserved.

Previous increment: **Review 08 — assisted calibration**, authorized 2026-09-19. Shared pathway/opt-in following, reviewed bounded hazard proposals using both current characters, per-field locks, before/proposed Scene demos, global difficulty profiles and verified Design stage sequences are implemented. v6 preserves earlier saved work. See README for the testing workflow and explicit limits. The optimizer never silently changes character physics or applies proposals. Full Test/Game integration remains next.

Historical increment: **Review 06 — in-scene Design calibration and motion**, explicitly authorized 2026-09-19. Character/hazard Scene view, shared/state/stage placement, collision geometry, HIGH/LOW flight, one fixed-step preview clock, Play/Freeze/Next frame/Restart/slow motion, focused-input retention, companion context, lazy decoded scene loading and synchronized comparison are implemented. Whole-project v5 includes these fields; older saves/imports migrate with existing edits retained and the v4 record preserved. This is pose-loop/pass calibration, not physics/collision gameplay. Test/Game, FX/finish editing and the full production adapter still follow.

Maintenance increment: **Review 05.3 — EU02/EU03 artwork sync**, requested 2026-09-19 for configuration testing. Incorporated main `e7b2b962…`, including EU02 approved and EU03 integrated/awaiting approval, with byte-identical source PNGs and registry cache keys. Both prior project provenance signatures migrate to this snapshot: retain custom transforms and sprite edits, update untouched defaults and preserve the previous browser save. This publishes current artwork to the parallel prototype only; it does not approve EU03 or complete Test/Game.

Maintenance increment: **Review 05.2 — landscape playback**, requested 2026-09-19. Play/Pause, Restart and Replay traverse the existing 0–4,800 px preview at the current runtime speed, including shared cloud drift and synchronized baseline comparison. Scrubbing pauses; Source, asset switches, project actions and hidden tabs stop motion. Design pause freezes the image for inspection; gameplay pause remains unchanged. This is a landscape repeat preview, not the full Test/Game course. Current configuration format, approved artwork and runtime integration sequence remain unchanged.

Maintenance increment: **Review 05.1 — approved EU01/SA03 artwork refresh**, requested 2026-09-19. Integrated main `b469182…` into `editor-next`, retaining the current UI. The catalog and packaged preview now use the approved FAR/MID/GROUND sets, zero-offset defaults and unchanged source bytes. Explicit old/new source signatures permit bounded draft migration: preserve user edits, migrate untouched defaults, retain the previous saved record before saving the upgraded project. This does not change the runtime/Test/Game implementation sequence below.

Current increment: **Review 05 — whole-project configurations and continent navigation**, requested 2026-09-19. Continent → Stage shows available registry stages and remembers the last stage per continent. Save all / Export all / Import operate on the complete editable configuration. Import validates before a field-level diff, preserves a pre-import recovery copy, and applies as one Undo step. Browser save status is distinct from GitHub. The v4 project records source and artwork provenance; v1/v2/v3 candidate drafts recover without overwriting their old keys. Runtime conversion remains pending.

Next delivery sequence: **complete runtime adapter + remaining Design (FX/finish) → working Test → working Game → legacy cleanup and cutover review**. Test and Game remain required work; their visible tabs are planned, disabled entry points. No individual stage/asset save workflow is needed for the current scope.

Previous increment: **Review 04 — atlas frame boundaries and preview space**, approved for implementation 2026-09-19. Every character/hazard frame has an editable source rectangle independent of fine crop and neighboring frames. Numeric edits, atlas drag/resize, keyboard nudges, reset, mixed Undo/Redo and v3 browser persistence/export are implemented. Fine crop remains nonnegative; expanding the source rectangle reveals more artwork. Source-image bytes and production defaults are unchanged.

Navigation now owns landscape FAR/MID/GROUND and character states. The center has one compact view/zoom/options/focus toolbar and fits the canvas to both available dimensions. Inspector groups and the frame strip collapse independently; Focus view hides both side panels; choices use a separate layout key. Preview visibility remains outside authored configuration. Browser acceptance is still required.

Previous increment: **Review 03 — landscapes connected**, 2026-09-19. The user explicitly prioritized completing Stage landscapes before further cosmetic refinement. FAR/MID/GROUND, scene/layer/source views, visual transforms, repeat/parallax scroll, comparison and combined landscape/sprite draft persistence are implemented. They use current GitHub artwork and the shared production geometry function. A full runtime adapter, gameplay entities, finish scenes, FX, import UI and Test/Game remain pending. See VERIFICATION.md for evidence and limits.

## Product direction

Keep **Design / Test / Game**. Give each a clear job and use the same authored snapshot and renderer.

- **Design:** choose a stage/asset, inspect it in context, adjust bounded values, compare, undo, save a local draft, export changes for review.
- **Test:** deterministic scenarios using that draft—character actions, selected-hazard interaction, full stage, finish/recovery checks. No configuration editing mixed into test controls.
- **Game:** clean player experience, with diagnostics and preview overrides removed. Its starting snapshot is explicit; production defaults remain independent of browser editor saves.

Proposed desktop organization: persistent mode/project/save bar; left project tree; center scene viewport; right contextual inspector; expandable bottom animation dock and diagnostics. Workspace panels scroll independently. Mobile gameplay remains landscape-first; authoring is optimized for desktop/tablet without shrinking the player UI. Every image has loading/error state and every editable field has an observable renderer effect.

Character and hazard animation share a frame strip, previous/next, play/pause, preview speed, atlas/current-frame views, per-frame crop, and baseline comparison. Asset-specific properties stay separate: character state/grounding/FX versus hazard spawn/flight/collision. Artwork looping is not a substitute for physics/timed-state testing.

## Organization refinement — review 02

User direction, 2026-09-19: Asset studio has two sub-tabs, **Stage** and **Character**. The stage selector belongs only inside Stage; it must not imply ownership of shared characters. The layout uses smaller headings, closer spacing and independently scrolling work panels to leave more room for the artwork.

| Scope | Current review | Later Design integration |
|---|---|---|
| Stage | Stage selector, landscapes (FAR/MID/GROUND with shared geometry) and hazards with frame tools | Finish scene, stage settings, hazard placement/collision |
| Character | Claude/Constance and six animation states, shared across stages | Character source/animation properties and FX; global defaults clearly labeled |
| Scene context | Review 06: explicit preview stage, character/hazard companions and HIGH/LOW flight | Grounding or overrides involving a character in a particular stage explicitly show both stage and character; they must not silently edit global character defaults |

Switching sub-tabs restores the last character/state/frame or the selected stage's last hazard/frame. Each character and stage retains its own selection for this session. Navigation state is not authored configuration. Stage switching never changes the remembered character animation or its crop edits. Sub-tabs support keyboard navigation and expose the active panel to assistive technology.

Next usability refinements, in order:

1. Completed in Review 05: candidate import with validation/diff/recovery, clear browser-save versus repository status, and whole-project export/import round-trip. Runtime snapshot conversion follows.
2. In-scene scale, position, grounding and collision calibration is implemented in Review 06. Complete production adapter, FX and finish integration next; retain the field-to-render-to-save acceptance matrix.
3. Use collapsible inspector sections and adjustable panel widths as scene controls grow; retain frame controls and Save without page-wide scrolling at normal laptop sizes.
4. Continent → Stage replaces a flat list in Review 05. Expand from available registry entries as stages are built; add readiness/approval summaries when the full 21-stage catalog is available. Load the chosen scene first and show progress/retry in that viewport.
5. Connect Test and Game only after the adapter preserves existing behavior; remove legacy dependencies after parity evidence, then request cutover approval.

## Loading experience — required

User requirement confirmed 2026-09-19: lazy loading must show a visible loading indicator until the selected content is ready.

- Load shared essentials and the selected stage/asset first; defer other stages. Background prefetch must never delay the selected content's ready state.
- Show a spinner and a clear label such as **Loading SA02 — Andes…** in the affected viewport/preview. Show real progress such as **6 of 9 assets ready** when the required asset count is known; never simulate a percentage.
- Keep the indicator visible through download, image decoding and configuration application. Remove it only when the current selection can render its first complete frame. Expose an accessible loading status and busy state.
- Keep navigation and unrelated editing available. Disable Start/Play and controls that require the unfinished content. Gameplay timers must not begin behind the loading indicator.
- Stage changes use the same behavior. Reuse cached decoded assets immediately; do not force a loading animation or minimum delay for ready content.
- Rapid selection changes must not let an older load replace the latest selection or dismiss its indicator.
- On failure, replace the spinner with a useful error and **Retry**. An unrelated deferred-stage failure must not block the active stage or leave an endless spinner.
- Measure cold startup and stage-switch readiness before/after. The expected benefit is a shorter initial wait by loading fewer assets up front; total download work is deferred, not automatically reduced.

Acceptance: with a deliberately slow required asset, loading stays visible and Start stays disabled until the full selected scene is ready; failure gives Retry; cached re-entry is immediate; switching selections during a load never displays stale content.

## Architecture

`Editor UI → validated Draft Store → snapshot adapter → Runtime commands/state → renderer`

Asset registry/loading serves both runtime and previews. The UI never clicks hidden controls, reads labels as state, or writes arbitrary runtime globals. Compatibility conversion has one owner and remains outside the new components. Transient selection/diagnostics are not serialized as production configuration.

Draft store: typed schemas and frame bounds; field ownership; undo/redo commands; saved/default comparison; atomic import with diff and rollback; local save errors; explicit revision/schema/asset provenance. Local saves remain local. Export/commit/deploy stays a reviewed repository workflow.

Runtime API: `ready`, `getState`, `applySnapshot`, `setContext`, `setCharacterPreview({state,frame,playing})`, `setHazardPreview`, `setDiagnostics`, `play/pause/reset`, `stepSimulation`, and `dispose`. Commands must be idempotent where appropriate and report invalid/unready state. Reuse existing Scene/CharacterMachine/ObjectQA/GameplayDirector behavior; do not rewrite physics.

## Incremental delivery gates

| Milestone | Deliverable | Exit evidence |
|---|---|---|
| 1 · Audit + design review | This audit, plan, isolated branch, working sprite-workspace proposal with approved art | Character/hazard frame selection, crop independence, undo/redo and separate saves verified; user reviews layout direction |
| 2 · Reliable state foundation | Complete schema/field map, isolated draft store, import/export migration, shared asset registry, loading indicator and readiness/error states | Invalid imports cannot mutate state; stage/global saves correct; reload/export/import round-trip; old local saves untouched; loading/ready/failure states explicit |
| 3 · Direct runtime adapter | Extract commands/state from current Lab handlers; controlled candidate runtime host without legacy panel dependencies | Same snapshot produces same scene and gameplay; boot with no legacy controls; canonical surface, character anchors and constants preserved |
| 4 · Complete Design | Scene navigation, consistent sprite dock, landscape and finish scene previews, FX, Stage/Gameplay settings with protected defaults | Both characters × six states × every frame; all current hazards; each field mapped to runtime + save + export; no blank silent previews |
| 5 · Complete Test + Game | Explicit mode transitions, simulation stepping, focused/full-course/finish/recovery scenarios, clean Game preview | Design→Test→Game→Design; pause/resume/step; HIGH/LOW; collision latch; failure/retry; finish and progress; no QA state in Game |
| 6 · Loading and cleanup | Active-stage lazy loading/cache with progress indicator, stable forms/focus, retryable failures, remove proven obsolete live code | Loading-experience acceptance checks pass; cold/warm loading measured before/after; unrelated-stage asset failure does not prevent active stage; no hidden-control references; production does not import editor code |
| 7 · Candidate acceptance + cutover | Exact-SHA candidate build, regression report, export/recovery instructions, approval | Existing Production CI passes, user approves candidate, then normal validated promotion + Pages gate; verify deployed SHA; retain rollback route |

Milestones 2–6 are incremental changes within the parallel track. Preview progress after each usable increment. Do not combine runtime extraction, gameplay tuning and artwork replacement into one change.

## Parity and behavior gates

1. Preserve 960×540, canonical ground 410, source anchors, approved landscape geometry and bytes. Keep current Slide .75s, recovery 1.10s, invulnerability 2s, flying 68/18, maxVisible 2, reactionLead 2.20, characterX 220, worldSpeed 120 unless explicitly approved otherwise.
2. Preserve Constance Slide frame 2 left crop 55; frame 1 remains unchanged. Test every character/state/frame, including Jump inspection poses, Hit/FX and Celebrate lift.
3. Field acceptance matrix: selection → visible adjustment → mode change → save → reload → export → import → identical effective configuration. Include edits across multiple stages/characters without visiting them after reload.
4. Test unified pause and actual simulation step separately from sprite frame step. Include actions during pause, recovery and failure; per-instance collision red latch; clouds-on-pause behavior.
5. Explicit game-preview source: working draft or saved baseline, with no diagnostic/transient state. Packaged production and development Phase 8 asset sets remain clearly identified until separately approved promotion.
6. Asset health includes source path/revision, expected vs decoded dimensions, frame/crop bounds, load/decode status and retry. Approval status is separate from “loaded.”
7. Accessibility/interaction: labeled numerical inputs and controls, keyboard stepping without accidental gameplay, no focus loss during playback, visible dirty/save failure status, independent panel scrolling.

## Branch, preview and cutover safety

- `editor-next` starts at main `1329554…`; upstream now includes EU02/EU03 through `e7b2b962…`. EU03 remains integrated/awaiting approval. Check main/development heads before later merges, retain artwork status and bytes, and provide source-specific migration before replacing a saved draft's baseline.
- No changes to `src/dev.html`, `src/game.html`, approved images, current storage keys or Pages in milestone 1.
- Existing Pages deploys **main only after CI**. A branch alone does not create a GitHub Pages preview URL. Use a local candidate server initially. Decide a separate non-production preview route/host before shared browser acceptance; never deploy the branch over the current Pages site.
- Draft PR triggers the existing pull-request CI without deploying Pages. A later review build may add a dedicated candidate preview workflow, with its destination explicit.
- The existing private ChatGPT Site is a temporary review host. **The approved editor's delivery destination is the existing GitHub repository and GitHub Pages site.** Candidate code uses relative paths and static web files; it has no ChatGPT hosting dependency. Final route replacement still requires the user's approval and existing CI/Pages gates.
- Baseline stays available until cutover approval. At cutover retain a known-good editor route/snapshot and rollback instructions; never delete archive/source preservation areas.
- No broad Git branch/history cleanup in this track. Remove files only when the dependency audit and parity tests prove they are obsolete.

## Next implementation packet

Continue in `editor-next`; read root AGENTS.md, Current Status and this folder. Reviews 06–08 now supply in-scene calibration, production-derived actions/contact checks, reviewed optimization and difficulty demos, and v6 persistence. Next complete the production runtime adapter and finish/FX editing. Convert one validated complete project snapshot on runtime readiness and every mode transition. Test must then provide deterministic play/pause/reset/step and focused/full-stage/finish/recovery scenarios; Game must start from an explicit complete draft or baseline with diagnostics removed. Use the coverage matrix in AUDIT.md to prevent omissions. This remains a parallel Design increment, not a production importer or approval of replacement. Landscape artwork production stays separate. Main was incorporated through `e7b2b962…`; preserve later artwork/workflow updates and extend explicit draft compatibility handling for each changed baseline.

## Review 07 — Design interaction and direct editing

Implemented in the isolated candidate: production-derived movement/intersection adapter; per-step contact checks, latched contact, optional first-contact freeze, complete-pass clear result and Replay; real Jump and timed Slide; explicit Pose loop alternative; click-to-select/Editing target; numeric placement/grounding and hitbox handles with undo; Hand and Space-drag viewport panning. Editing invalidates prior pass results. Existing v5 persistence includes hitbox edits without schema changes. Browser layout/user acceptance remains pending. Test/Game full stage, damage/recovery/invulnerability, FX/finish and production draft adapter remain deferred; this is not replacement approval. Runtime Slide .75 s is preserved, with historical .70 s reconciliation separate.

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

## Immediate next priority — reconcile dependent calibration evidence

The user supplied `main/docs/phase8-qa/DEPENDENT_CALIBRATION_QA.md` and its supporting runtime tests. Review baseline: main `57d6ca4e6932cc0ee5f6d05597245c1c17a74e85`. Its eleven size/contact adjustments are already in main's configuration but documented as awaiting acceptance; editor-next retains its earlier source baseline. Do not merge them automatically or overwrite user drafts.

1. Establish a common validation basis before more tuning. Incorporate the actual runtime collision-check ordering, both characters, all relevant atlas phases, configured speed classes and 60/120 Hz checks. The current runtime reads previously drawn character geometry during collision checks; decide any correction explicitly and apply it consistently across the runtime and editor. Standardize timing-window units/endpoint spans: the current editor counts valid fixed-step samples, while the other regression test measures endpoint spans. This creates a one-step reporting difference (~16.7 ms at 60 Hz); rerun threshold decisions after reconciliation. Clarify the report's 10 ms measurement sampling versus the committed 20 ms regression sampler.
2. Compare original, legacy-proposed and editor-proposed values on that common baseline, including visible size, support/grounding, both action windows and manual locks. Preserve meaningful artwork size; smaller props or disproportionately small colliders are review decisions, not automatic proof of a good result. Retain the existing runtime ground/finish anchor checks and approved PNGs. Recheck flagged hazards; do not interpret differing pass counts across thresholds/baselines as a direct quality ranking.
3. Feed the reviewed complete snapshot into the full Test/Game adapter, covering spawn schedules, collisions, damage/recovery, finish behavior and current upstream source-anchor/stage-catalog support. Explicitly migrate baseline changes without losing local edits. Existing production/contract acceptance gates remain distinct from Design preview checks.

Review 08.1 resolves the playback request only; the validation reconciliation and production integration above remain pending. Keep dependent QA evidence and unresolved findings; pause independent competing legacy tuning rather than deleting its report or reverting useful fixes.
