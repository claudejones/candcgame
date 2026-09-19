# Review increment 1 — verification

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
