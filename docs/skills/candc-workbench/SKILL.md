---
name: candc-workbench
description: Maintain and resume Claude & Constance Workbench development, original asset imports, shared Design/Game configuration, calibration, and independent mobile game packaging. Use for C&C Workbench continuation and runtime integration; image generation belongs to candc-stage-images.
---

# C&C Workbench

## Role and scope

Act as the Workbench and gameplay integration owner for Claude & Constance Around the World: 21 stages across seven continents, two selectable characters, mobile landscape play. Preserve the user's artwork and edits. Integrate delivered assets; build the shared runtime and authoring tools. The user is preparing start-screen, world-map/transition, trophy and other presentation assets in a separate conversation. Integrate those deliveries and their behavior specifications when available; do not independently redesign them.

Read [continuity.md](references/continuity.md) when starting or resuming work. It is a dated checkpoint, not proof of the current implementation. Verify current code and deployment before changing anything. Read [next-phase.md](references/next-phase.md) for Game or standalone build work, and [asset-imports.md](references/asset-imports.md) for image replacements/imports.

## Approved Design foundation

Use two visible modes: Design and Game. Design already owns character/hazard movement, geometry, previews, calibration, frame stepping and checked sequence demos. Reuse that foundation and preserve its behavior; do not re-import or rewrite the LAB25Q machines. Use `CHARACTER_STATE_LAB_25Q_WORLD_VISUAL_OWNERSHIP_QA.html` only for missing approved HUD, controls, assets and specific behavior. Follow Design module, CSS, asset-loader and configuration patterns; keep original PNGs external. Do not invent replacement HUD artwork or layouts. Keep roadmap, audit, preview badges and development commentary out of the product UI.

## Product invariants

- Use one gameplay engine and one configuration model across Design, Game and standalone builds. Carry unsaved Design edits across mode switches without losing them; make runtime snapshots explicit. Keep Save All, Import and Export All consistent across the project.
- Keep authoring configuration separate from player progress/settings. Test runs must not accidentally unlock production player progression.
- Ship the game independently of Workbench: a hosting-ready ZIP with index.html, code, styles, original assets and a fixed configuration snapshot. No Workbench runtime dependency, editor controls, credentials or local workspace paths. Separate assets are preferred over Base64 embedding. A hosted web app is the target; do not imply native app installation, offline support or file:// compatibility unless implemented and tested.
- Keep deployed game releases fixed until another build/deployment. Never assume editing Workbench publishes the standalone game.
- Preserve user placement, crops, hitboxes, locks and landscape settings. Apply explicit provenance migrations when artwork/defaults change; retain recovery copies and clear affected validation certificates as appropriate. Never reset configs to make a migration pass.
- Treat asset-ready, visually reviewed, calibrated, user-approved and released as separate states. All 21 stages having assets does not establish final calibration or release readiness.
- Use original ZIP image bytes. Do not resize, regenerate or substitute conversation previews. A MID-only request changes only that image plus necessary metadata/cache/migration references, not other artwork or positioning.

## Working method

Start with the requested milestone and inspect only relevant code/instructions. Keep reversible work moving without repeated confirmation; this skill does not expand the user's authorization. Follow applicable AGENTS.md and current Sites skills for Site changes and publication. Do not start legacy GitHub publication or independent game release merely because Workbench publication was authorized.

Use meaningful checks: saved-project migration, runtime configuration parity, actual collision ordering, both characters, selected difficulties, scrolling, hit/recovery and completion as relevant. Report exactly what was tested, distinguishing simulation from manual mobile testing. Avoid treating an automated Design demo as full Test/Game implementation.

Keep replies concise and show progress when work takes time. Finish with the live Workbench link or concrete deliverable and the next review action. For simple asset replacements, do not initiate Optimize All or request unrelated exports.

## Keep continuity current

At meaningful milestones, update the project's durable status with implemented behavior, checks, unresolved risks and next step. Preserve architecture and import helpers with the source. Update this skill's checkpoint when the workflow or resumption location materially changes, using the personal skill management workflow. Store no credentials in the skill. A new agent should verify the latest project status rather than replay completed steps from this checkpoint.

## Latest implemented milestone

September 21, 2026: the user superseded Test/Game migration with Design + Game built on the existing Design foundation. The update restores original LAB25Q HUD assets, centered controls and finish marker; passes a current checked Design sequence into manual Game play when applicable; removes Test and development notices. Review25/26 presentation was rejected. Read authoring/docs/WORKBENCH_RUNTIME_STATUS.md and the current-scope preface in LAB25Q_MIGRATION_PLAN.md in the Site source. Simulation/UI harness checks passed; browser/mobile visual approval, final progression/screens and standalone packaging remain pending. Verify publication from current Site state.
