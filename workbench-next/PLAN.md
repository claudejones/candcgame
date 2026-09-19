# Production editor migration plan

Status: proposed; parallel branch only. The user's approval is required before replacing the working interface.

## Product direction

Keep **Design / Test / Game**. Give each a clear job and use the same authored snapshot and renderer.

- **Design:** choose a stage/asset, inspect it in context, adjust bounded values, compare, undo, save a local draft, export changes for review.
- **Test:** deterministic scenarios using that draft—character actions, selected-hazard interaction, full stage, finish/recovery checks. No configuration editing mixed into test controls.
- **Game:** clean player experience, with diagnostics and preview overrides removed. Its starting snapshot is explicit; production defaults remain independent of browser editor saves.

Proposed desktop organization: persistent mode/project/save bar; left project tree; center scene viewport; right contextual inspector; expandable bottom animation dock and diagnostics. Workspace panels scroll independently. Mobile gameplay remains landscape-first; authoring is optimized for desktop/tablet without shrinking the player UI. Every image has loading/error state and every editable field has an observable renderer effect.

Character and hazard animation share a frame strip, previous/next, play/pause, preview speed, atlas/current-frame views, per-frame crop, and baseline comparison. Asset-specific properties stay separate: character state/grounding/FX versus hazard spawn/flight/collision. Artwork looping is not a substitute for physics/timed-state testing.

## Architecture

`Editor UI → validated Draft Store → snapshot adapter → Runtime commands/state → renderer`

Asset registry/loading serves both runtime and previews. The UI never clicks hidden controls, reads labels as state, or writes arbitrary runtime globals. Compatibility conversion has one owner and remains outside the new components. Transient selection/diagnostics are not serialized as production configuration.

Draft store: typed schemas and frame bounds; field ownership; undo/redo commands; saved/default comparison; atomic import with diff and rollback; local save errors; explicit revision/schema/asset provenance. Local saves remain local. Export/commit/deploy stays a reviewed repository workflow.

Runtime API: `ready`, `getState`, `applySnapshot`, `setContext`, `setCharacterPreview({state,frame,playing})`, `setHazardPreview`, `setDiagnostics`, `play/pause/reset`, `stepSimulation`, and `dispose`. Commands must be idempotent where appropriate and report invalid/unready state. Reuse existing Scene/CharacterMachine/ObjectQA/GameplayDirector behavior; do not rewrite physics.

## Incremental delivery gates

| Milestone | Deliverable | Exit evidence |
|---|---|---|
| 1 · Audit + design review | This audit, plan, isolated branch, working sprite-workspace proposal with approved art | Character/hazard frame selection, crop independence, undo/redo and separate saves verified; user reviews layout direction |
| 2 · Reliable state foundation | Complete schema/field map, isolated draft store, import/export migration, shared asset registry, visible readiness/error states | Invalid imports cannot mutate state; stage/global saves correct; reload/export/import round-trip; old local saves untouched |
| 3 · Direct runtime adapter | Extract commands/state from current Lab handlers; controlled candidate runtime host without legacy panel dependencies | Same snapshot produces same scene and gameplay; boot with no legacy controls; canonical surface, character anchors and constants preserved |
| 4 · Complete Design | Scene navigation, consistent sprite dock, landscape and finish scene previews, FX, Stage/Gameplay settings with protected defaults | Both characters × six states × every frame; all current hazards; each field mapped to runtime + save + export; no blank silent previews |
| 5 · Complete Test + Game | Explicit mode transitions, simulation stepping, focused/full-course/finish/recovery scenarios, clean Game preview | Design→Test→Game→Design; pause/resume/step; HIGH/LOW; collision latch; failure/retry; finish and progress; no QA state in Game |
| 6 · Loading and cleanup | Active-stage loading/cache, stable forms/focus, visible failures, remove proven obsolete live code | Cold/warm loading measured before/after; unrelated-stage asset failure does not prevent active stage; no hidden-control references; production does not import editor code |
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

- `editor-next` starts at main `1329554…`; additive `workbench-next/` directory initially. Check main/development heads before any later merge and bring in intervening approved asset changes without overwriting them.
- No changes to `src/dev.html`, `src/game.html`, approved images, current storage keys or Pages in milestone 1.
- Existing Pages deploys **main only after CI**. A branch alone does not create a GitHub Pages preview URL. Use a local candidate server initially. Decide a separate non-production preview route/host before shared browser acceptance; never deploy the branch over the current Pages site.
- Draft PR triggers the existing pull-request CI without deploying Pages. A later review build may add a dedicated candidate preview workflow, with its destination explicit.
- Baseline stays available until cutover approval. At cutover retain a known-good editor route/snapshot and rollback instructions; never delete archive/source preservation areas.
- No broad Git branch/history cleanup in this track. Remove files only when the dependency audit and parity tests prove they are obsolete.

## Next implementation packet

Continue in `editor-next`; read root AGENTS.md, Current Status and this folder. Review milestone 1 with Claude, then implement milestone 2. The sprite proposal is a design increment, not a complete editor, gameplay preview, production configuration importer or approval of the new interface. SA02 landscape production remains a separate track and is not started here.
