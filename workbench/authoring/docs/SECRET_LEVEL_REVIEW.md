# Beneath the Ice — integration review

Implemented locally; not published. The delivered WORKBENCH_REQUEST.txt requests a reviewable integration and validation report before publication.

## How to test after publication

- **Design → Stages → Beneath the Ice** opens the isolated practice arena. The same entry is available through **Screens → Beneath the Ice · practice**.
- Select Claude or Constance, start at 0:00 / 1:00 / 2:00 / 2:58, show collision bounds, pause or step frames, and use Jump / Slide / Pause. Keyboard: focus the arena, Space/Up to jump, Down to slide, P to pause.
- Screens also exposes the unlocked start menu, capture, failure, eligible/assisted results and the three secret-passport states. Set Reward history to No rewards / Earlier stages complete / All stages perfect to inspect locked / revealed / earned passport artwork.
- Real Game exposes **Beneath the Ice** on the main menu only after all seven perfect Standard passports. Ordinary stages and their progression remain unchanged.

## Implemented behavior

The fixed 1280×720 reference arena fits the existing 960×540 runtime. All 29 delivered asset PNGs retain their exact hashes and dimensions. Characters retain current calibrated scale, frame crops, state offsets and motion rules; the arena adapter anchors their feet to the conveyor. The reference previews use different illustrative character scaling and were not copied into gameplay.

Combat lasts 180 seconds. The current deterministic pattern produces 35 projectiles, with an 800 ms charge after the 150 ms ready pose. High bolts and low orbs use separate visual origins and collision cores. Their paths settle into lanes derived from the actual shared Run/Slide hitboxes before reaching the reaction corridor. The delivered reference heights would miss the current smaller characters. This avoids changing character calibration to fit new art.

Pulses occur once at 60, 120 and 180 seconds. The boss staggers at the first two; final containment runs for 1.7 seconds before celebration/result presentation. Contacts resolve before deadline success. Pause freezes combat, projectiles, belt and the original motion state; idle/ambient presentation continues. Resume restores the exact jump/slide state. Failure retains the stunned pose and moving stars.

An additive player-save migration stores a single shared secret passport and a separate secret attempt/Continue target. It preserves the ordinary journey, ratings and outcome records. Assistance taints the attempt until a new unassisted attempt. Replay never duplicates a newly earned reward; assistance cannot erase an existing reward. Continue restarts the secret stage with three hearts at zero elapsed time.

Current Workbench decisions supersede older proposals: immediate Play (no extra Ready panel); shared reward ownership; sticky assistance; no Achievements action on result overlays. Achievements remains available from the main menu and game menu. The secret encounter uses one Standard tuning profile. Existing contact-before-success ordering resolves deadline ties.

## Validation

- Original asset SHA-256, PNG decode/dimensions and atlas rectangles: passed.
- Both characters at 30, 60 and 120 Hz: six complete 180-second zero-hit avoidance runs, 35 shots each, exact pulse count, identical survival duration.
- Both projectile lanes hit a standing character. Sampled safe input lead times: high 0.12–0.42 s; low 0.18–0.42 s for both characters. These samples establish tested timing points, not exhaustive human difficulty certification.
- Once-only release/pulse/outcome behavior, fatal deadline priority, exact paused jump restoration, failure stars and final capture: passed.
- Save migration, locked/unlocked entry, sticky assistance, idempotent shared reward, stage-start Continue and ordinary-cursor preservation: passed.
- Real asset loading through Game's entry hook, timer/shields, immediate launch, pause/resume and unchanged Design draft return: passed in the event harness.
- Original 126 stage/character/difficulty regressions and PNG rendering: passed.
- Screens fixtures run with production localStorage inaccessible: passed.

Actual browser/mobile layout, safe-area interaction, subjective difficulty and the user's browser-local calibration still need hands-on review. Scaled Screens widths are not a full device emulator. No audio or independent standalone game release was added.

## Actual arena renders

These are engine-rendered arena images using the project baseline and original PNGs. The HTML HUD and controls are verified separately by event tests; they are not baked into these images.

![Claude arena](secret-review/claude-arena.png)

![Constance arena](secret-review/constance-arena.png)
