# LAB25Q -> Modular Parity Checklist

Status: executable parity gate. A system is not marked PASS from source inspection alone; rendered/browser behavior must be verified.

## Structural parity recovered
- [x] 960x540 LAB25Q canvas path.
- [x] FAR -> CLOUDS -> MID -> GROUND render order.
- [x] LAB25Q source-width world scaling and legacy per-stage profiles retained for parity mode.
- [x] Cloud Y/scale/opacity/speed recovered.
- [x] Claude/Constance state atlases, scales, frame rates, foot offsets and Constance Slide frame-2 crop recovered.
- [x] Jump physics recovered.
- [x] Approved production Slide duration 0.70s deliberately supersedes historical LAB25Q 0.75s.
- [x] HUD hearts/progress/character marker and progress formula recovered.
- [x] Gameplay Slide/Pause/Jump controls recovered.
- [x] Seeded gameplay plan and stage-specific signatures extracted.
- [x] Ground/flying hazard placement, collision geometry and animation extracted.
- [x] Hit recovery, 2.0s invulnerability, lives/unlimited-lives path extracted.
- [x] Per-instance collision bound latch uses `inst.hit` until the spawned hazard exits.
- [x] Finish-marker release/placement and Celebrate transition extracted.
- [x] World-layer isolation plus hazard-bounds/unlimited-lives QA controls available in modular harness.

## Browser/rendered parity gate
For each item compare archived LAB25Q against modular harness using the same stage, character and preserved assets.
- [ ] START RUN produces equivalent HUD/control visibility and initial Run state.
- [ ] Claude Run scale, X position and foot anchor match.
- [ ] Constance Run scale, X position and foot anchor match.
- [ ] Jump arc and three-frame state progression match.
- [ ] Slide frame progression/crop match, allowing the approved 0.70s duration difference.
- [ ] Pause freezes timer/hazards/world and switches player to Idle while clouds continue.
- [ ] Hit collision decrements one life and begins frame-2 blink/invulnerability behavior.
- [ ] Hazard collision bounds remain red until that exact instance exits; next instance begins green.
- [ ] HIGH/LOW flying hazard clearances match.
- [ ] Seeded hazard arrival sequence and NA/SA/EU signatures match.
- [ ] Finish marker releases at final five seconds and character transitions to Celebrate at completion.
- [ ] HUD heart states, progress marker and stage title match.
- [ ] FAR/CLOUDS/MID/GROUND isolation exposes transparent application backing with no synthetic world fill.

## Pass rule
Do not call modular parity proven until every browser/rendered item above is PASS or has an explicitly documented approved divergence. Landscape replacement geometry must not be frozen before this gate is complete.
