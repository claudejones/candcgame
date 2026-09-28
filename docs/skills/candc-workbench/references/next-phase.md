> Current scope supersedes older Test/Game notes below: two visible modes, Design and Game. Preserve and reuse Design machines/previews/calibration. Extract only missing approved LAB25Q HUD/controls/assets using the same implementation patterns. No legacy-director replacement. Current matching checked Design sequences can feed manual Game play. See current project WORKBENCH_RUNTIME_STATUS.md before resuming; browser visual approval and standalone build remain pending.

# Next phase: shared Test and Game runtime

## Agreed direction, September 21, 2026

The user has not finished adjusting stage configs and wants to build Test/Game before calibrating all 21 stages. This is intentional: gameplay should support calibration. The initial milestone is a complete NA01 Design → Test → Design loop, followed by all stages and Game mode. Read continuity.md and the current project status for completed work; the list below describes the target phase, not a claim that every item is complete.

1. **Shared configuration and runtime adapter.** Convert the current draft into a complete runtime snapshot covering assets, frames/crops, character state scales/anchors, landscape transforms, hazard geometry/facing, difficulty, pacing, damage and completion. Preserve Save All/Export All and unsaved edits across modes. Inventory fields and verify parity instead of assuming the old runtime consumes new draft fields. Reconcile collision ordering and timing measurement before relying on optimization certificates.
2. **Test mode.** Select stage, Claude/Constance and Easy/Standard/Hard; play manually using the real runtime. Include pause/restart, slow motion, frame stepping, optional collision outlines and unlimited lives. Implement actual spawning, contacts, damage, recovery and stage completion. Prove NA01 first, then cover all 21 stages. Keep diagnostics optional and Test progress isolated.
3. **Game mode and independent build.** Reuse that runtime for a clean player experience with start, character/mode selection, settings, pause, lives, retry, progression and completion. Build Game packages HTML/JS/CSS/assets plus a versioned config snapshot that runs on mobile hosting without Workbench. Validate artifact asset paths and gameplay parity. Build generation and release deployment are distinct actions.
4. **Calibrate through play.** Establish the shared Claude/Constance baseline, then review each stage by moving between Design and Test. Preserve manual edits and locks. Check both characters and all difficulty profiles; review proposals before applying. Do not mark stages accepted without the user's review.

## Incoming presentation work

The user is producing these in another conversation:
- Start screen: mode, player and settings controls. Do not assume its player-facing modes mean developer Design/Test modes; use the delivered behavior brief or clarify when needed.
- World map: seven continents and 21 stages, character travel animations, stage/continent transitions and unlock display.
- Trophies/rewards and other missing artwork.

Define replaceable screen boundaries and events for start run, stage complete, destination unlocked, travel transition and trophy earned. Agree schemas with actual deliveries, rather than hard-coding guessed trophy rules, mode semantics or progression animations. Accept original asset ZIPs plus state/button/animation/trigger descriptions. Temporary functional controls may support testing while final presentation is pending; do not represent them as approved final art.

## Known validation issue to resolve

Existing Workbench PLAN.md records pending reconciliation with legacy dependent-calibration evidence: production collision checks may read previously drawn character geometry; timing-window calculations differ by one simulation sample. Inspect current code before concluding this remains unresolved. Use one collision/update ordering and consistent timing units across runtime and editor. Preserve existing reports and meaningful visual sizes; do not silently merge older proposed tuning. Verify relevant behavior at 60/120 Hz and distinguish rendering rate from simulation step.
