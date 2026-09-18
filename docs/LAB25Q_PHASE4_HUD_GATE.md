# LAB25Q Phase 4 — HUD Gate A

Status: READY FOR VISUAL PARITY REVIEW

Changed only two Phase-2 class-A, exact-byte HUD assets:

- HUD heart -> `assets/hud/UI_LIFE_HEART.png`
- HUD progress character marker -> `assets/hud/UI_STAGE_PROGRESS_CLAUDE_CONSTANCE.png`

The progress-path image remains embedded because Phase 2 classified its current approved named asset as geometry-changed (2048x258 historical -> 2172x724 current). It is intentionally NOT substituted in this gate.

Remaining embedded image payloads: **60**.

No CSS, JavaScript, gameplay configuration, renderer metadata, or other asset references were changed.

Acceptance: compare HUD against approved Phase 1. If equivalent, Gate A passes and progress-path geometry can be handled separately.
