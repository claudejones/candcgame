# Workbench review — verification

## Review 06 — in-scene Design calibration and motion

Explicitly requested 2026-09-19. Changes remain inside `workbench-next/`; the current artwork/configuration source snapshot is retained.

- 41 Node tests pass. New renderer comparisons execute the actual production CharacterMachine/ObjectQA drawing code and compare all character states/poses and all hazard poses, both flight heights, and multiple pass times. Baseline coordinates/collision geometry match; shared/stage offsets remain distinct and canonical ground is 410.
- Fixed-step clock cases verify whole-scene 1/60-second stepping, freeze/resume, no paused-time jump, slow motion, restart, unavailable previews and stale callbacks. Pose selection remains FPS-based. Selected-state artwork loops are explicitly Design previews; gameplay physics/timing/collision outcomes remain for Test.
- New placement fields round-trip through complete export/import/save/reload, mixed history and one-step import undo/redo. Invalid/missing/unknown placement fields reject atomically. Actual v4 browser records migrate without overwriting the retained v4 key; v5 saves/reloads preserve both old edits and new placement.
- DOM integration ran the real app and event handlers with jsdom and real canvas/image decoding: scene readiness, character/stage/hazard context, numerical edits retaining focus during playback, fixed stepping/freeze/slow motion/restart, Frame/Atlas switching, HIGH/LOW, comparison, save/change review, import/apply/undo and hidden-tab freeze. This is not a browser CSS/layout test.
- Actual Scene canvases for character calibration and Constance Slide + flying hazard were rendered and visually inspected. Source artwork and previously authored frame/crop bounds feed the same scene. Automatic responsive browser visual acceptance remains pending.

Reproduce pure checks: `node --test workbench-next/*.test.mjs`. Optional DOM check: install `jsdom@26` and `@napi-rs/canvas` in a separate temporary directory, then run `node workbench-next/verify-scene-ui.mjs /absolute/path/to/dependency-directory /absolute/path/to/optional-render-output`. Test artifacts/dependencies are not runtime or Site dependencies.

User acceptance: open a character or hazard, select Scene, adjust shared/state/stage grounding or hazard placement, freeze/step/restart, try ¼×, compare baseline, save/export/import/reload, and return to Frame/Atlas. Select a flying hazard for HIGH/LOW. Frame stepping advances time; it does not force a new sprite pose every click. Test and Game are still planned.

Publication succeeded at https://candc-workbench-next.claudejones.chatgpt.site (saved version 9, deployment `appgdep_6aaea37986d8819181b58e3f2d91ffd3`). Site source: `fb93bbc3fcd40c8a19faa54e97f1faed07498538`; GitHub implementation: `8234467e606866401098ec49e594af72d5e28062`. [Production CI passed for that exact implementation](https://github.com/claudejones/candcgame/actions/runs/35450342079). All module syntax, unique IDs and DOM references pass. The validated archive contains 75 files and 53 unchanged PNGs; source/provenance match the pushed revision. Native deployment status is `succeeded`; user browser testing can begin.

## Review 05.3 — EU02/EU03 artwork sync

Requested 2026-09-19 for configuration testing. Incorporated main `e7b2b9625d499b5dae633c94ac83b74166fa4ed0`; source/configuration/artwork match that upstream snapshot exactly. EU02 is approved; EU03 is integrated and awaiting artwork acceptance. No image generation or alteration occurred.

- The six selected PNGs match upstream QA hashes, dimensions and registry cache keys. Targeted EU02/EU03 asset checks and runtime-registry synchronization pass. Baseline offsets are zero, multipliers 1.25/1/1, anchors MID 621/GROUND 393, and logical ground 410.
- 36 Node tests pass, including saved Review 05.1/05.2 projects retaining character/hazard frame edits, custom EU02/EU03 transforms and unrelated-stage settings. Untouched defaults update, the old saved record survives loading and is backed up before Save all, and the migrated checkpoint reloads exactly. Older Review 05 and v2/v3 Design imports also remain supported; unknown sources are rejected.
- Candidate EU02/EU03 composites were rendered and visually inspected at 0 and 2,400 px. The new Paris and Barcelona layers are visible with correct geometry and no transparent holes. This is offline renderer evidence, not browser interaction acceptance.
- Migration messaging points to Source & status for artwork approval, so the integrated EU03 set is not presented as approved. Test/Game implementation remains pending; this update enables current Design configuration testing.

User review: refresh the private preview, look for Review 05.3, then choose Europe → EU02 / EU03. Check FAR/MID/GROUND, Scene and Play scroll. Use Compare baseline when reviewing preserved custom transforms. Existing saved edits should load; Save all retains a downloadable pre-update checkpoint in Changes & recovery.

Publication succeeded at https://candc-workbench-next.claudejones.chatgpt.site (saved version 8, deployment `appgdep_6aae36c57f408191a59f43500490466e`). Site source: `1a2d519aba24187132b423a195ddaf5d678794fc`; GitHub implementation: `bfe280780f06d15befe0ca380769f81a14295e87`. [Production CI passed for that exact implementation](https://github.com/claudejones/candcgame/actions/runs/35428766964). Syntax and DOM references pass. The 73-file archive contains 53 source-identical PNGs and excludes the six superseded EU02/EU03 landscape files. Source provenance and the hosting manifest were verified before saving. Native deployment status is `succeeded`; browser/user acceptance remains pending.

## Review 05.2 — landscape playback

Requested 2026-09-19. The existing 0–4,800 px slider now supports Play/Pause, Restart and end-of-range Replay. Landscape and clouds use the current runtime speeds (120 and 8 px/s); cloud scale, height, opacity, layer order and stage visibility are preserved. Baseline and draft share one preview time. Code changes are confined to `workbench-next/`; approved artwork, game runtime and project format are unchanged.

- 34 Node tests pass. New transport cases cover elapsed-time speed, pause/resume without a time jump, exact endpoint, replay/restart, bounded scrubbing, unavailable previews, duplicate-loop prevention and stale callbacks after context changes.
- Cloud draw calls match the actual runtime update/tile methods across all nine stage profiles at five times, including repeat boundaries. Layer isolation and hidden clouds remain respected. Existing landscape geometry, asset hashes and complete project save/import/migration checks still pass.
- Playback repaints canvases and transport only; it does not rebuild inspectors or rewrite focused transform inputs on animation ticks. Asset changes, Source view, history/project actions and hidden tabs stop playback. Preview position and cloud phase remain outside authored configuration.
- Design Pause deliberately freezes clouds for inspection; production pause behavior is unchanged. The 4,800 px endpoint is the preview range, not a full stage simulation. Test/Game remain pending.

Browser interaction and responsive visual acceptance remain pending. Review Stage → Landscape → Scene: Play scroll, pause, scrub, restart, compare the baseline, then switch stages or open Source. Clouds should drift behind MID, the endpoint should stop cleanly, and frame controls should still work in Character/Hazard views.

Publication succeeded at https://candc-workbench-next.claudejones.chatgpt.site (saved version 7, deployment `appgdep_6aae261177ac819195c8c72a7f73700c`). Site source: `1739d1fcc362812df4a3c030e6b1179446f4ea5e`; GitHub implementation: `e3d9c39e28ba23075cb464f07681add357cf190d`. [Production CI passed for that exact implementation](https://github.com/claudejones/candcgame/actions/runs/35425556990). Module syntax, unique HTML IDs and literal DOM references pass. The 73-file archive matches the pushed source and contains 53 unchanged PNGs; the filtered catalog retains all source provenance. Native deployment status is `succeeded`; browser visual acceptance remains pending.

## Review 05.1 — approved EU01/SA03 snapshot refresh

Requested 2026-09-19 after the user found stale EU01 images despite a hard refresh. Cause: the private prototype packaged an older GitHub snapshot. Merged approved main `b469182fd6ee76c346a959cfde82a5b108b048ed` into the parallel editor; production source/configuration/artwork match that upstream tree, and new editor logic remains under `workbench-next/`.

- All six EU01/SA03 landscape PNG hashes match `approvedRevisions`; registry-generated cache keys match the bytes. EU01 approval points to reviewed revision `8556e5a0312e53cb3843f1b69c61a35e698383ef`. No artwork was regenerated or transformed.
- 28 Node checks pass. Added actual prior-baseline migration cases for v4 browser saves and v2/v3 imports: retained character crops, barrel bounds and custom transforms; unchanged defaults update; failed backup writes preserve the old saved record; saving/reloading succeeds; unknown or future source signatures remain blocked.
- Rendered and inspected EU01 and SA03 with the candidate renderer and canonical defaults. New artwork is visible and scene geometry is correct. This is an offline composition check, not browser UI testing.
- Generated catalog and runtime registry checks pass. Static packaging cleans its generated directory, preventing old landscape files from lingering. Startup revalidates the catalog; PNG URLs keep registry cache keys.

User review: open Europe → EU01; FAR/MID/GROUND should show approved artwork. Source & status should say Approved landscape. Existing draft edits should remain; use Compare baseline to distinguish a custom transform from the new defaults. Save all retains a downloadable pre-update copy under Changes & recovery. No main/Pages editor replacement is authorized by this update.

Publication succeeded at https://candc-workbench-next.claudejones.chatgpt.site (saved version 6, deployment `appgdep_6aae224b39dc81918a94526f9a5728ce`). Site source: `ff7d4bd38a3a2fd17ce30c2eb5766e6fae7bc8a3`; GitHub implementation: `d338d0ab311e511a6ba7f44770df201fd6820ad3`. [Production CI passed for that exact implementation](https://github.com/claudejones/candcgame/actions/runs/35424878798). The archive contains 72 files and the six changed landscape PNGs match the approved upstream bytes. Native publication is confirmed; user browser review remains pending.

## Review 05 — whole-project configuration workflow

Requested 2026-09-19 after the user reviewed Review 04's layout and atlas dragging positively. Changes stay under `workbench-next/`; production artwork, runtime, configs and current editor storage remain untouched.

- 26 Node tests pass, including whole-project export/import/save/reload across unvisited stages, both characters and expanded-boundary fine crops; visible resets; one-step import Undo/Redo with existing history; saved/dirty behavior; invalid fields, source mismatches and stale reviews rejected before mutation; quota and conflicting-tab protection; recovery after save/reload; v1/v2/v3 recovery retaining old keys; malformed-save backup; unordered JSON object compatibility; and continent/stage memory.
- Import preview does not write or mutate. Apply requires a durable pre-import recovery copy. Apply does not auto-save the imported project. Export includes all working changes without marking them saved.
- Save status identifies browser persistence; the change dialog identifies the GitHub source baseline. Only current Design settings are included; Test/Game runtime settings are still pending.
- Catalog records hashes and dimensions from unchanged repository PNGs. Syntax, ID references and static packaging are checked before publication.

Review 05 private publication succeeded at https://candc-workbench-next.claudejones.chatgpt.site (version 5, deployment `appgdep_6aae1f4eb83c8191a5615b0403db4aa5`). Site source: `ef7b2f606962fe21f9a0265a11983fa0f225ba39`; GitHub implementation: `6e81660ea95efb55be8ab1bf7f69a85d40e61e36`. [Production CI passed for that implementation](https://github.com/claudejones/candcgame/actions/runs/35424288144). Packaged code and provenance match the source; all 53 packaged PNG hashes match their source. The archive entrypoint and hosting manifest were verified before saving. Main and development have since advanced independently; this editor increment retains its existing configuration/artwork baseline.

Browser interaction and responsive visual acceptance remain pending. Review: select Europe → EU02, change continents and return; verify EU02 is remembered. Edit one character frame, one hazard boundary and one landscape, export all, change a value, import the exported file, review/reset differences, apply, Undo/Redo, save all and reload. Under Changes & recovery, review the pre-import copy. Import an invalid JSON file to verify a visible error without losing work. Test and Game remain disabled until the runtime adapter and their dedicated milestones are complete.

## Review 04 — frame boundaries and fitted workspace

Implemented from the user's approved refinement on 2026-09-19. Production/config/artwork remain untouched; this increment changes only `workbench-next/` on its existing upstream baseline.

- 19 tests pass: prior landscape/loading/crop checks plus independent per-frame boundaries, retained character rows/crops, atlas limits, drag transaction undo, v3 exact save/restore (including a crop exceeding the old cell width), atomic invalid-draft rejection, failed writes, v1/v2 recovery without overwriting older keys, and fitting within both available dimensions.
- Application/module syntax checks and HTML unique-ID/literal-selector checks pass.
- Rendered original and adjusted barrel frames using the candidate drawing code. Visual inspection confirms frame 3's neighboring sliver can be excluded and frame 4's left edge recovered. The same source pixels and registration are retained. No default calibration or PNG was changed to produce this test.
- UI: landscape layers and character states moved left; one toolbar; image area fits available width/height; zoom, View options, collapsible inspector/filmstrip, and persistent Focus view.

Review 04 private publication succeeded at https://candc-workbench-next.claudejones.chatgpt.site (saved version 4, deployment `appgdep_6aae1633fce48191a0665232b63bfda6`). Site source: `3a70a9bee0dacf1ff3fafea1d69f24b314fa2a1e`; GitHub implementation: `398ce53d656b048fc7ca307696cba92d7b328264`. Archive entrypoint, manifest and application bytes match the pushed source. Native publication success confirms availability, not browser interaction acceptance.

Browser interaction/responsive screenshots are still pending. Pure geometry tests and offline sprite rendering do not substitute for browser visual acceptance. Review at your normal laptop window: choose an asset, open Edit bounds on atlas, drag and Undo, compare/reset/save/reload, collapse panels/frame strip, and toggle Focus view. Verify both Character and Stage navigation remain usable. Production cutover remains unapproved.


## Review 03 — landscape workspace

Upstream main incorporated through `723a42b88b44ef610da94222babee51e65018402`, including the approved SA02 files and registry. New editor changes remain confined to `workbench-next/`; production files match that upstream snapshot exactly. No artwork was edited.

Passed on 2026-09-19:

- 13 Node tests across model, landscape and asset-loader suites; application/module syntax checks.
- All 27 landscape sources exist. Active landscapes match registry PNG dimensions and SHA-256 cache revisions, including the NA03 GROUND size exception. Approved NA01–NA03, SA01 and SA02 retain zero offsets and 1.25/1/1 multipliers. Pending SA03/EU stages retain legacy profiles and are labeled accordingly.
- Candidate geometry calls the same production geometry function. Tile draw calls match the existing renderer for all nine stages/layers at four scroll positions, including repeat boundaries.
- Mixed sprite/layer undo and redo, edits across multiple stages, exact combined save/export/reload, invalid-draft atomic rejection, and failed writes retaining dirty state. Existing v1 candidate crop saves migrate without deleting or overwriting their original key.
- Loading waits for every required image decode; progress counts decoded assets; stale selections cannot report readiness or progress; successful assets are cached and failed requests can retry.
- Rendered and visually inspected a nine-stage contact sheet using the candidate canvas renderer and exact source PNGs. This verifies landscape composition, not browser layout or interactive gameplay. No synthetic world backing or artwork correction was added to conceal legacy composition gaps.

User review: open Stage → Stage landscape; choose Scene/Layer/Source and FAR/MID/GROUND. Change an offset, scale or parallax (use Scroll preview), compare baseline, Undo, save and reload. Switch stages and Character to verify independent selection/editing. Confirm loading and retry feedback and fit at your normal window size.

Browser interaction/responsive visual acceptance remains pending. Character/hazard/finish placement, collision, FX, live cloud motion, import UI and Test/Game are not implemented by this increment. The candidate is still a parallel review editor; no cutover is approved.

Review 03 private publication succeeded at https://candc-workbench-next.claudejones.chatgpt.site (saved version 3, deployment `appgdep_6aae0e2868f48191998e59ff3e0723a8`). Site source: `71654c35c4b6b0107ff7004be80098c16a9593aa`; GitHub implementation: `1a8fb2e2cc803f82ae384553677cc1a4a9ef778c`. Archive manifest/entrypoint and packaged code match the prepared source; all 53 PNG copies are byte-identical.

## Earlier review evidence

Date: 2026-09-19. Baseline: main `132955434f7835064e5d28d8761521111ce0dbf5`.

Main advanced during the audit to `7fe0e6bb2716c1ffa597ddc9f7792d79b4824e53`; the intervening change only appends command/resume documentation in `docs/ASSET_COMMAND_WORKFLOW.md`. Runtime/editor code is unchanged. This branch stays pinned to the recorded audit baseline; the later merge must retain that documentation update.

## Passed locally

- JavaScript syntax checks for candidate application/model/build script.
- Catalog matches the source registry and all 58 asset paths exist.
- Unit tests verify all 12 character/state combinations and all 27 hazards against actual PNG dimensions, including every configured frame.
- Constance Slide frame 2 retains left crop 55; changing that frame leaves frame 1 and Claude's crop unchanged; undo/redo restores exact values.
- Candidate save/reload round-trip, failed save retaining dirty state, invalid-payload atomic rejection, and separate candidate-only storage key.
- Change scope is additive under `workbench-next/`. No production source, configuration, artwork, archived source, or workflow modifications.

## Not yet verified

The cloud browser successfully inspected the deployed workbench. It could not open the candidate's local HTTP server; local file navigation is also prohibited by browser policy. No alternate browser surface was used. The candidate therefore has **not received browser interaction, screenshot, responsive-layout or visual acceptance testing**. Source and model checks are not a substitute for that gate.

## Candidate acceptance checklist

Run the local server described in README.md, or use a separately approved candidate preview route. Do not replace the current Pages site to obtain a preview.

1. Select Claude and Constance, then each of the six states. Inspect first/last frames and full atlas. All images should be visible with correct character rows.
2. Inspect Constance → Slide → frame 2: Left 55. Change to 60, verify frame 1 remains 0, Undo restores 55, Redo restores 60. Compare baseline, reset to baseline, save.
3. Select an animated hazard in each continent and the EU01 barrel. Step/play, change an individual frame crop, compare, undo. Static hazards disable playback.
4. Save candidate changes, reload, verify recovery and export. Confirm the current editor's checkpoint is unaffected. Candidate exports must never be imported as current game configs.
5. While playing, change asset/state, pause, and switch tabs: no duplicate animation loops or stale image results. Verify image failure gives an explicit error and retry.
6. Inspect at desktop and narrow widths; keep frame controls, crop inputs and save actions reachable. Check labels, keyboard focus and arrows.

This increment does not test gameplay, scene grounding, collisions, timing, finish behavior or the new runtime API. Those are later milestone gates in PLAN.md.

## Private preview preparation

User authorized a separate clickable preview on 2026-09-19. `PREVIEW_HOSTING.md` records the durable Site identity and repeatable publication path. Static packaging passed entrypoint/manifest checks; all 25 included source PNGs are byte-identical to their GitHub source, and the copied application/configuration files match this candidate. Loading now includes image decoding, a visible spinner, an accessible busy state and a clear failure/retry state.

The preview remains a Design/sprite review increment. Publication success must be confirmed by the Sites deployment response; it does not count as user visual approval or approval to replace the working editor.

Private preview deployment succeeded on 2026-09-19: https://candc-workbench-next.claudejones.chatgpt.site . Site source revision: `95d78b7ef1df0e2d786b55261d4593eccf2f7375`. The native deployment response confirms publication; browser visual testing and user approval remain pending.

## Review 02 — compact layout and asset scopes

Implemented from the user's sidebar screenshot and feedback on 2026-09-19. Stage and Character are separate accessible sub-tabs; only Stage shows the stage selector. Global character and stage-specific asset scope are visible. Headings, panel padding and section gaps are smaller; desktop workspace height follows the actual header/footer rather than a fixed subtraction.

All five model tests pass, including a new navigation regression for remembered character states/frames and independent stage hazard selections. Existing crop isolation, undo/redo, atlas bounds and draft persistence tests still pass. Application syntax checks pass. Crop fields and reset remain disabled during image loading/failure.

User review checklist for this increment:

1. Character → Constance → Slide → frame 2. Switch to Stage → SA03 → Tropical Parakeets, then another stage. Returning to Character restores Constance/Slide/frame 2; returning to SA03 restores its selected hazard.
2. Verify Stage has no character list and Character has no stage selector. Character crops remain unchanged when the stage changes.
3. At a laptop viewport, check the smaller heading and gaps, independent panel scrolling and reachable frame/save controls. At narrow widths, both sub-tabs and their active controls remain available.
4. Tab to the sub-tabs and use Left/Right or Home/End. Confirm only the active panel's controls receive keyboard focus.

The supplied screenshot informed these changes; no new browser interaction or rendered responsive-layout checks have been claimed. Final visual acceptance remains a user review gate.

Review 02 private publication succeeded at the same review URL (version 2, deployment `appgdep_6aae03d0994c819181298034305f7c0c`). Packaged UI/model/plan files were verified byte-for-byte against the candidate source. GitHub implementation commit: `0441baf3ef56aeed19d7de19651a741c025ba40f`; Site source commit: `1e6655173838bfb95fa0c2fd007f12d312777ca8`.

## Review 07 — verification (2026-09-19)

- 46 Node tests pass, including direct production-source movement parity, every character/hazard pose geometry, strict-edge intersection, exact first-contact fixed-step stop during delayed display frames, replay/result invalidation, a calibrated obstacle cleared by a timed jump, hitbox inverse mapping and singular full-height character handling.
- Optional jsdom + real canvas integration passes: actual load/navigation, frozen/focused edits, real Jump/Slide transitions, first-contact freeze/step/replay, target switching without clock reset, click selection, hitbox drag + Undo/Redo/Save, Hand and Space panning without draft mutation, existing Frame/Atlas, HIGH/LOW, baseline, whole-project save/import and hidden-tab freeze.
- Generated movement adapter is checked against `src/js/game-runtime.js`; runtime constants and production files remain unchanged. Asset catalog verifies all 58 source paths. No PNG, source config or legacy runtime was modified.
- Canvas renders were inspected. Browser responsive CSS/layout acceptance remains pending; DOM/canvas checks are not browser layout testing.
- Publication and exact CI evidence will be recorded after the new snapshot succeeds. The previous live version remains Review 06 until then.
