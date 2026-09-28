# SECRET01 — Beneath the Ice: complete graphics and animation delivery

## Read first

The user approved the underground-lab/conveyor/alien-boss direction and authorized the complete package, including moving specimens, security-screen interference and blinking equipment. Final expanded artwork is delivered for review; runtime integration and difficulty acceptance are separate. Use `$candc-workbench` for integration and `$candc-global-ui` for presentation history. Preserve current Design/Game architecture, original ordinary21 stages, controls, calibration and player records. This is an asset supplement, not a replacement game engine or automatic publication request.

Open `secret-preview.html` after extracting the ZIP. The two edited showcase videos demonstrate both characters, high/low attacks, ambient movement, three containment milestones and the reward presentation. They deliberately skip most of the three-minute waiting time; production duration remains180seconds. `Lab_Ambience.mp4` isolates tank/screen/light motion. Still previews include entry, Game Over, assisted completion and all three passport states. Review footers/captions and sample timer jumps are NOT product UI.

## Files and exact geometry

`assets/` contains28 core PNGs plus the stage thumbnail. `asset_manifest.json` gives measured canvases, atlas cell rectangles, anchors, timings and overlay placements. Coordinates use top-left origin; rectangles are[x,y,width,height]. `file_inventory.json` records original/final byte hashes. `originals/` preserves untouched generated masters and editable SVG sources for native pixel UI/FX. Do not extract sprites from the concept image or use generated raw grids without finishing metadata: several generated frames crossed nominal source cell edges.

Use a fixed arena with reference1280×720, not the ordinary2172×724 horizontally repeating landscape contract. Backdrop, conveyor frame and boss platform are three1280×720 RGBA layers sharing origin0,0. The small62×17 tread tile repeats ONLY inside[0,471,873,17], moving left at proposed62referencepx/s. Supporting chassis/roller centers remain fixed. Boss ground461 and player ground471 reflect the slight pedestal step in this design. These are arena reference anchors, NOT permission to overwrite existing per-character grounding/calibration. Build a special-arena layout adapter using the current engine's calibrated character feet anchors and physics units.

Scene order: dark underlay -> backdrop -> tank specimens/bubbles and monitor/lamp/emitter overlays -> fixed chassis/platform -> repeating tread -> character/boss/projectiles -> impact/pulse/capture FX -> existing controls + special HUD -> existing result/menu framework. No distant scrolling or camera-distance completion; the character runs in place over the moving belt. Ambient clocks can be separate from combat time. Fit the whole arena proportionally to the available landscape area; keep both actors and reaction corridor visible. On wider screens use a dark navy surround or responsive UI, not stretched actors. HUD/buttons live in safe-area-aware UI and may reflow; never shrink touch targets blindly. Preserve existing Jump/Slide/Pause placement and input semantics. The review's footer occupies an illustrative area, not final controls.

## Boss and projectile atlases

| File | Frames / cell | Playback |
|---|---|---|
| SECRET_BOSS_HIGH_ATLAS.png |6 /512×512;3columns |Ready, anticipate, charged, release, recoil, recover |
| SECRET_BOSS_LOW_ATLAS.png |6 /512×512;3columns |Same sequence; cannon clearly lowered near ankle |
| SECRET_BOSS_IDLE_ATLAS.png |4 /512×512 |350ms/frame, loop |
| SECRET_BOSS_STAGGER_ATLAS.png |4 /512×512 |150,200,250,300ms; once per pulse |
| SECRET_BOSS_CAPTURE_ATLAS.png |4 /512×512 |250,300,350,800ms; hold last pose |
| SECRET_ORB_LOW_ATLAS.png |2 /160×96 |100ms/frame; orb anchor48,48 |
| SECRET_BOLT_HIGH_ATLAS.png |2 /224×160 |100ms/frame; anchor112,80 |
| SECRET_IMPACT_ATLAS.png |4 /224×160 |70,90,100,120ms, then remove |

All boss frames share anchor256,464. Finish operations: threshold near-transparent generation haze at alpha128; fixed scale per source sheet; explicit crop rectangles; align feet to464 without per-pose stretch. High source uses0.75; low0.75; supplemental source0.94 to match its different native pixel scale. Low-fire muzzle flare has16px minimum horizontal cell padding; it is wholly contained. Source geometry/finishing records included. All pose bounds are measured in `atlas_bounds.json`. Muzzle release should use per-attack anchors from `encounter_config.json`, not boss center or a moving claw. Revalidate anchors in engine at final arena scale.

The visual attack timeline has800ms readable charge: anticipate400ms + charged400ms, then release frame100ms, recoil200ms and recovery300ms. Optional ready pose150ms precedes anticipation. On entering release(frame3, zero-based), emit exactly ONE projectile per attack ID. Re-rendering, paused frames, slow frames or animation loops must not emit duplicates. Use threshold crossing/event flags, not equality to a frame timestamp. Each new attack is scheduled independently; do not loop the attack atlas as an automatic shooter.

Final projectile distinction: round low orb vs pointed high bolt, both amber/cream energy. This supersedes the early concept's violet high-shot illustration and pilot's temporary round high shot. Distinction is carried by cannon position, flight height and silhouette, never color alone. Impact/dissipation is non-damaging visual FX. Calibrate the orb core/bolt body collision separately from decorative tails, sparks and glow. Supplied source art contains only hard-edged pixel energy.

## Existing character mechanics

Reuse Claude/Constance's current Run, Jump, timed Slide, hit/recovery, invulnerability blink, stunned/stars, idle and celebration implementations. No new attack button, throw mechanic, physics, invulnerability rule or character art. Current slide duration0.70s remains. `shared/` contains original approved character source snapshots for recovery and review only; they are NOT a migration over current calibrated runtime assets. Preserve Constance's established per-frame slide crop overrides. Preview scaling/choreographed jump is illustrative and must not be copied into production calibration. Keep current health HUD heart artwork, use3hearts at every start/retry.

High shot must intersect a standing character but clear the calibrated slide hitbox. Low shot must hit standing/running lower body but clear a correctly timed jump. Verify both characters and the actual arc, land/recovery time, mobile viewport and post-hit states. Boss visual breathing/recoil must not move projectile spawn unpredictably. No simultaneously unavoidable high/low wall. `encounter_config.json` provides proposed intervals and patterns, not certified difficulty tuning. Workbench must validate before accepting them.

## Three-minute encounter and outcome order

Entry gate remains all7 perfect Standard continent passports. Completing Antarctica alone does not unlock it. Existing startup Secret Level shortcut appears only after the entitlement; launch through current loading/entry hooks. The dedicated achievement page is8/8 and visible while locked. This delivery supplies the final gray/color passport, replacing UI05's labeled future-art slots.

1. Enter/Retry: initialize a new attempt with3hearts, elapsed0, shields3, empty projectile list, no committed outcome. Existing entry panel: title Beneath the Ice; “Survive for three minutes. Jump low shots. Slide high shots.” Start begins combat; Back returns to caller.
2. Phase1[0,60): clear separate attacks. Phase2[60,120): more varied combinations. Phase3[120,180): shorter spacing within validated safe windows. Phase order and count fixed; speeds/intervals are calibration inputs.
3. At elapsed60 and120, emit one containment pulse, reduce shield count3→2→1, play stagger and shield-break once. Reserve quiet space around pulses: proposed stop new charges during the last2.8s before each boundary; allow existing shots to clear; next attack no earlier than1.2s after boundary. Combat clock continues during these short presentations, so encounter stays180seconds.
4. At elapsed180, resolve final contacts/outcome using current deterministic engine ordering. Recommended tie policy: fatal contact at or before deadline wins over success; do not award both. If alive, lock successful outcome exactly once, disable/remove remaining hazards, set shields0, play final pulse/capture then existing character celebration. Present result after capture (~1.7s), without extending the required survival clock. The boss's3cyan torso nodes are decorative power cores; the HUD shield count is authoritative.
5. Fatal damage earlier: existing Game Over flow, stunned character and looping stars, boss no longer schedules attacks. Retry restarts at0 with3hearts; Main Menu invokes current menu. Preserve ambient motion under outcome overlays as in ordinary stages. No trophy/passport on failure.
6. Eligible secret success grants one secret passport. Unlimited Health success shows completion with “Rewards disabled while Unlimited Health is on”; never changes passport or entitlements. Existing earned passport remains intact. A repeated eligible success shows completion/replay, not duplicate new-award reveal. No new secret stage trophy or heart-rating system is introduced by this package.

Paused gameplay: freeze combat elapsed time, spawn schedule, in-flight projectiles, character physics and conveyor coherently. Resume retains exact attempt; no catches-up burst after a background tab. Keep existing pause-button toggle semantics. Ambient specimens/screens can continue on ambient clock under the established pause/result policy; honor reduced motion. Browser tab suspension must not consume survival time unless the existing game intentionally supports that policy. Continue/load follows current start-of-stage semantics: restart the saved stage from its beginning, not mid-projectile. Keep ordinary journey and secret entitlement distinct; do not overwrite another save cursor without the current save contract.

## Ambient animation and FX

Three specimen species×4frames,128×160 cells, head anchor64,24. Use supplied five tank rectangles/species/phase offsets. Clip creature and bubbles to each tank interior. Head/body remain in place while tendrils, frills and tails change; do not translate an entire static creature to fake articulation. Frame durations650/850/700/1000ms suggested; independent initial phases stop synchronized motion. All tanks use actual clean background interiors—no static creature painted underneath.

Monitors:8frames64×48,180ms/frame; crop/scale into existing screen interiors only. They show muted security-style shapes, scan lines and occasional interference. Lamps:3frames16×32, slow staggered dim/medium/bright cadence; phase each fixture differently. Bubbles:8frames64×128,220ms/frame, repeat. These are subdued; boss warnings remain brighter. No screen-wide flashing. Low-motion mode can hold specimen/frame0, steady lamps and monitors and omit bubbles.

Emitter:4frames64×32, progress dim→bright during final3seconds before a pulse. Pulse:4frames160×512, loop briefly (~340ms) from overhead emitter toward boss, then remove. Shield-break:4frames96×96, once on the lost HUD segment. Capture field:6frames512×512 build upward, then alternate final two subtly or hold final under reduced motion. These geometric effects were authored as editable SVGs and supplied as PNG atlases, so Workbench need not invent missing artwork. Dimming or omitting decorative FX for accessibility must not hide the shield count or outcome label.

## HUD, reward and existing panels

Retain canonical health hearts upper left and pause control. Timer centered,3:00→0:00. Three shield slots upper right use SECRET_SHIELD_UI_ATLAS:active,flash,cracked,empty. Draw3slots always; empty count must be unambiguous. Keep live labels/text and dynamic timer out of PNGs. The supplied1280×68 HUD frame is a visual source for responsive assembly, not a command to stretch pixel borders.

PASS_SECRET_ATLAS is768×256: cell0 locked question mark; cell1 final gray design; cell2 earned color. Each256×256; anchor128,128. Earned seal224×224 with16px transparent gutter; gray derived from exactly the same earned image/alpha. Existing circular locked icon retained. New final circular passport says Beneath the Ice / Secret Complete with ice/contained-alien emblem. Keep it square at every size. No perfect star/three hearts needed on this single completion reward unless separately approved.

Entry/results/Game Over/assisted overlays reuse delivered UI04 panel/buttons; achievements reuse UI05 styling/page8. Shared PNG snapshots included and hashed; deduplicate with existing imports. New text is live HTML/Canvas. Victory actions: Replay Secret Level, Achievements, Main Menu; use shared button components and existing handlers. Opening Achievements is read-only and returns to result. Unearned detail explains the Standard perfect-passport unlock or eligible secret-completion requirement as appropriate. Startup button uses existing menu styling; no new startup background. Thumbnail320×240 is an undistorted crop of the actual assembled lab/boss scene.

## Product decisions still requiring reconciliation

The artwork is complete for the approved encounter. The following are proposed runtime defaults, not silently confirmed user rules: (a) one Standard secret encounter difficulty and one shared secret-completion record across characters, with page8 discoverable from all difficulty tabs; (b) once assistance is used, attempt remains ineligible until a fresh attempt starts with assistance off; (c) fatal-contact deadline tie policy above. Compare with current approved Workbench decisions before implementing; ask the user only if still unresolved. Neither pending policy prevents importing/reviewing assets. Do not invent three secret passport rewards.

No audio files are included: reuse approved existing cues/music respecting independent Music/SFX settings; new sound design is outside this graphics delivery. Do not play arbitrary replacement audio. No automatic idle-demo feature is authorized.

## Workbench acceptance gate

Verify actual phone/tablet landscape layout and safe areas; current controls stay reachable; both attack lanes and all pattern transitions are avoidable for both characters; collision ordering and post-hit recovery; freeze/resume and background-tab behavior; pulses exactly once; no double release/award under lag; eligibility, local save/load and repeat clear; locked/gray/earned page8 and startup entry. Run current gameplay test infrastructure with actual configurations. Graphic/atlas checks and scripted videos are not evidence these runtime tests passed. Preserve a recoverable baseline and current authoring calibration. Import does not authorize publication or a standalone release.
