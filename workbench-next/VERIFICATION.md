# Workbench review — verification

## Review 04 — frame boundaries and fitted workspace

Implemented from the user's approved refinement on 2026-09-19. Production/config/artwork remain untouched; this increment changes only `workbench-next/` on its existing upstream baseline.

- 19 tests pass: prior landscape/loading/crop checks plus independent per-frame boundaries, retained character rows/crops, atlas limits, drag transaction undo, v3 exact save/restore (including a crop exceeding the old cell width), atomic invalid-draft rejection, failed writes, v1/v2 recovery without overwriting older keys, and fitting within both available dimensions.
- Application/module syntax checks and HTML unique-ID/literal-selector checks pass.
- Rendered original and adjusted barrel frames using the candidate drawing code. Visual inspection confirms frame 3's neighboring sliver can be excluded and frame 4's left edge recovered. The same source pixels and registration are retained. No default calibration or PNG was changed to produce this test.
- UI: landscape layers and character states moved left; one toolbar; image area fits available width/height; zoom, View options, collapsible inspector/filmstrip, and persistent Focus view.

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
