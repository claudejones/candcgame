# LAB25Q Phase 0 — Review and Gate

Status: COMPLETE
Date: 2026-09-16
Authority: `docs/LAB25Q_EXTERNALIZATION_BLUEPRINT.md`

## Exact source facts
- Immutable source: `archive/LAB25Q/CHARACTER_STATE_LAB_25Q_WORLD_VISUAL_OWNERSHIP_QA.html`
- Source size: 87,408,213 bytes.
- One inline CSS block: 10,587 characters.
- One inline JavaScript block: 85,808,449 characters.
- 62 embedded image payloads.
- 275 unique DOM IDs and 48 markup classes.
- Full machine-generated inventory: `docs/LAB25Q_PHASE0_SOURCE_MANIFEST.md`.

## Manual semantic resolution of the three markup-level payloads
The analyzer correctly identified the remaining 59 JavaScript-owned payloads by nearby AssetStore/property ownership. The three markup-level payloads are resolved from their actual DOM/CSS-variable context:

1. `IMG-00` -> gameplay HUD CSS custom property `--heart-sprite`.
2. `IMG-01` -> gameplay HUD CSS custom property `--character-sprite` used by the progress marker.
3. `IMG-02` -> `<img class="progress-path">` source.

These are semantic roles derived from LAB25Q source context. They are not mapped to current named files yet; named-file correspondence is Phase 2.

## Critical geometry evidence recovered from LAB25Q
- Character atlas cell: 700 px.
- Run: 4 frames; Idle: 2; Jump: 3; Slide: 2; Hit: 3; Celebrate: 4.
- Character rows: Claude top / Constance bottom under the LAB25Q atlas contract.
- Stun-star cell: 240x150; render scale 0.56; 10 FPS.
- Constance Slide frame 2 crop: left 55 px; other insets 0.
- LAB25Q historical Slide duration: 0.75 s. This remains unchanged for extraction parity; the separate production lock of 0.70 s is reconciled only after parity.
- Hit recovery: 1.10 s; invulnerability: 2.00 s.
- Character X: 220; world speed: 120.
- Hazard stage duration: 90 s; starting lives: 3; max visible/reaction queue: 2; reaction lead: 2.20 s; signature start: 75 s; seed: 2309.
- Flying speed classes: 150 / 170 / 210; altitude mix 55 HIGH / 45 LOW.
- Stage phases: warmup 0-10, establish 10-30, develop 30-55, pressure 55-75, signature 75-85, finish 85-90.

## Important Phase 2 warning already visible from Phase 0
The embedded image geometry is not uniform and must not be inferred from filenames or occurrence order. Examples include:
- character atlases at 2800x1400, 2100x1400, or 1400x1400 according to frame count;
- HUD heart and progress-character sprites at 1774x887;
- progress path at 2048x258;
- hazard/object sheets spanning 1774x887, 2048x682, 2172x724, 1536x1024 and other source sizes;
- one embedded NA FAR payload is JPEG rather than PNG.

This confirms the approved rule: semantic ownership and real geometry must be checked before each named-asset substitution.

## Phase 0 gate
PASS.

Phase 1 may proceed. Phase 1 changes only code location: externalize the exact CSS and exact JavaScript while retaining all 62 embedded image bytes and LAB25Q implementation values. No current named asset substitution is allowed in Phase 1.
