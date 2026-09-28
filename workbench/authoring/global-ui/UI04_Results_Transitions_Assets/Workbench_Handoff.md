# UI04 — Results and Transitions · v1

The user approved the complete UI04 graphics delivery. Approval covers presentation assets, not evidence of completed runtime integration.

Open `results-preview.html` after extracting the entire ZIP. The bottom review selector exposes every result state, both characters, all21 stage trophies, seven perfect passport examples, and world completion in each difficulty. It is a presentation reference: buttons emit `ui04:action` and explain their destination; they do not load stages, mutate saves or unlock content. The selector, motion toggle, notices and preview background composites are review tools, not game UI. PNGs in `previews/` are review-only and may be deleted. Import component assets, not flattened screenshots.

## Import and ownership

- New authored graphics: `assets/UI04_RESULT_PANEL.png` (890×550), `UI04_TRANSITION_PANEL.png` (1000×230), eight primary/secondary button states (320×96), and `UI04_BUTTONS_ATLAS.png` (1280×192). Editable SVG originals included. Text is never baked into these assets.
- Nine-slice borders: 28px left/top/right/bottom, safe content inset32px; manifest records these measurements. Scale center/edge strips, not corner shapes. The supplied HTML uses full-frame scaling at the fixed review composition; production should use nine-slice for variable dimensions.
- `shared/` is ONE self-contained snapshot of the existing21 trophies/seven passports (earned/unearned and original atlases), common hearts/perfect star, map/pins/icons/cloud and character source sheets. Deduplicate by SHA256 against previously imported reward/UI03 packs. Do not create a second canonical shared utility set. `originals/` preserves all28 reward source artworks plus the new editable UI SVGs.
- `CHARACTER_*_SOURCE.png` are byte-preserved extractions from the supplied LAB25Q reference, not freshly redesigned characters. Prefer the game's current approved character assets and per-character crop/anchor calibration. Preview derivatives under `preview-only/` are exact source-cell crops. Never replace runtime calibration with their enlarged review layout.
- Game Over holds the existing stunned pose (hit frame index1) with looping star FX. Do not repeatedly play the impact/recovery poses after game over. Celebration loops the existing four frames. Clouds continue; hazards, collision, stage movement and result generation stop.
- Current gameplay renders the background and character behind the overlay. No new stage scenery is required. The supplied SA02 composite is illustrative assembly from recovered layers, not a new gameplay background or calibration result. Stage-specific trophy thumbnails must not replace gameplay layers.

## Appearance and actions

| State / appears when | Contents | Actions |
|---|---|---|
| First eligible completion, previous best0 | Color stage trophy, this-run hearts, saved-best hearts, Trophy earned | Next Stage, Replay, World Map |
| Eligible improvement, previous best1/2 and better finish | Same trophy, New best, this-run and updated saved best, old→new explanation | Same |
| Eligible equal/lower replay | This-run hearts and preserved best shown separately, no award animation or New best | Same |
| Assisted completion | Stage complete; Unlimited Health; rewards disabled; existing records unchanged. No trophy award, heart-rating award or unlock animation | Replay, World Map; only add a session-continuation action if the runtime's assisted progression policy permits it |
| Game Over, zero health | Empty health hearts; Retry starts with3 hearts; no new award | Retry → same stage/difficulty/character,3 hearts; Main Menu → startup |
| Third stage of a continent | Result primary label Next Continent; eligible newly earned/upgraded passport is queued before departure | Primary continues queue, Replay returns to just-finished stage, World Map exits to map |
| First continent completion | Existing circular earned stamp, all3 stages completed | Continue → next queued event or map; Achievements → correct difficulty/continent |
| Perfect continent upgrade | Same stamp plus separate canonical gold star, all3 saved bests are3 | Same; show only one perfect celebration if regular and perfect are newly earned together |
| World completion | Seven stamps and21/21 completion in that difficulty | World Map, Achievements, Main Menu |
| First eligible Standard world completion | World panel adds newly unlocked Hard + Level Select | Same; do not repeat unlock copy after entitlement already exists |
| Easy/Hard world completion, repeat Standard completion | Completion summary; no new Hard/Level Select claim | Same |
| First seven-perfect-Standard milestone | Special-level entry unlocked; its passport is NOT earned | Achievements, World Map. No Play Special Level while content/entry rules are undesigned |
| Stage entry after load succeeds | Actual stage ID/name/difficulty and saved best; starts with3 hearts | Start Stage; never start hazards behind entry screen |
| Loading / load failure | Loading status / failed-to-load explanation | Loading: World Map; error: Retry load / World Map. UI05 may later own full loading system |
| Intercontinent travel | Existing map, route and selected head pin moves between actual continent points | Skip completes presentation, not progression or asset loading |

The preview uses SA02 sample values, SA03 continent awards, AN03 world completion, and SA→EU travel. All21 stage IDs and names are in `stages.json`; all content slots are data-driven. At AN03 the result action is World Results, never Next Continent. Load the following stage from the actual stage manifest, not string arithmetic. Disabled states exist for any button awaiting load/save acknowledgement.

## Result data and persistence

Workbench supplies: attemptId, stageId, difficulty, characterId, outcome, heartsAtFinish, previousBest, committedBest, rewardEligible, assistedReason, continentBefore/After, worldCompletedBefore/After, previous/current entitlements, nextStageId, nextContinentId, loadStatus, saveStatus and reducedMotion. Use an explicit `rewardEligible` decision from the game; the overlay must not infer eligibility from the final switch position alone. Assistance activation/recovery remains a product decision outside this graphic package.

On eligible success, persist once per attempt: best=max(previousBest, heartsAtFinish); calculate regular/perfect stamps from the three saved stage ratings for this difficulty. Preserve separate Easy/Standard/Hard records. Assisted attempts and failures cannot award, improve or unlock anything. A worse replay cannot downgrade saved best. Never write results on replaying an animation or reopening a panel. Do not claim “Saved” before the real save succeeds. On write failure retain the result in memory and expose Retry Save / Continue without saving using the supplied buttons plus live explanatory text (Workbench storage policy).

Queue changed events in order: stage result → strongest newly earned continent stamp → first world completion / new Standard entitlements → first mystery-entry unlock → map/travel/entry. Already owned milestones do not enqueue new-award celebrations. Commit independently of animation; Skip and rapid button presses cannot duplicate rewards. If the user opens Achievements midway, retain the remaining queue in runtime session state. Main Menu exits presentation without erasing committed achievements. Finish-vs-fatal-hit ordering and save/checkpoint granularity remain runtime validation responsibilities.

## Motion specification

| Element | Timing / behavior |
|---|---|
| Panel entrance | opacity0→1 and scale.98→1 over180ms; buttons focusable after appearance; no game input leaks behind panel |
| First trophy / better rating | Trophy opacity0→1, scale.9→1 over350ms; updated heart row reveals left-to-right at120ms intervals; settle by700ms |
| Equal/lower replay, assisted | Panel entrance only; no reward bounce, sparkle or fanfare |
| Passport | Scale1.15→1 and opacity0→1 over280ms, then still; perfect star fades in over150ms. Preserve circle with equal width/height |
| World/mystery unlock | Reveals over300ms; no automatic stage launch |
| Character celebration | Existing four-frame cycle at6fps as in reference; preserve current game anchors |
| Game Over | Hold hit frame index1; stars top-row four-frame sequence,150ms each, loop until exit. No new death sprite |
| Clouds | Continue current ambient renderer; review cloud gently drifts over30s |
| Travel | Move selected UI03 head pin along route over1600ms; draw route progressively. Use UI03 map_layout coordinates; Skip jumps to endpoint. Example route is not a world itinerary |
| Stage entry |180ms panel appearance; stage starts only on Start Stage once loaded |

Reduced motion: show final UI/stamp/heart states immediately, static character/stars/clouds and final travel destination. Do not require waiting for animation to activate primary action. Pause all animations when document is hidden. Review HTML supports pause/resume and reduced motion, and demonstrates celebration/stars/cloud/travel motion; it is not the full production event queue or audio engine. Audio cue intentions: brief trophy/upgrade cue, passport thump, subdued game-over cue, optional travel sound, honoring separate SFX/music switches. No audio files are supplied or required for this graphics batch.

## Layout and accessibility

Reference canvas1280×720, panel(350,85,890,550), content left386, buttons y535,h76; mobile844×475 preserves~50px button height. Transition panel(140,405,1000,230), buttons72px high. Leave left character area free. In runtime align or mirror the panel to available space around the actual character without teleporting the character or changing stage anchors. Smaller viewports need a responsive layout preserving44px minimum targets and safe-area insets; do not blindly shrink below that target. All text/control positions are provided in scene graphs for reference; adapt to localization rather than truncating.

Modal role=dialog, aria-modal=true, accessible heading, focus on primary action, keyboard focus stays inside active game modal; return focus on exit. The review selector is intentionally outside this game modal model. Inputs that caused the finish/hit must not also activate a result button. UI relies on text/state labels as well as color. Use canonical hollow/full heart shapes. No assisted-heart icon. Keep names, counts, difficulty, instructions and button labels live HTML/Canvas text; use delivered font/license or approved accessible fallback.

## Validation boundaries

See Verification.md for measured file, atlas, scene and archive checks. Static asset assemblies are not browser screenshots. Live browser/device, animation timing in the game, focus/touch, result idempotence, assistance, unlocks and storage still require Workbench integration tests. No game repository was changed or deployed.


## Confirmed integration boundary — existing finish flag

The user confirmed that the existing game already handles crossing the finish flag and stage completion. Preserve that implementation. Attach the approved result overlay to its existing successful-completion event; do not create another finish detector, duplicate completion handler, new stage scene, character repositioning, or replacement gameplay flow. The player crosses the existing finish flag, the existing stage finishes, and the overlay opens over that SAME live scene. Keep the finish flag, current camera and player location visible as appropriate. Continue the approved celebration and ambient clouds behind the overlay; retain existing stopped gameplay behavior. Use the existing failure event for Game Over in the same way.

`results-preview.html`, its selectors, notices, scene graphs, enlarged character composition and sample stage backgrounds are review/reference materials only. They are not the game result page, a route to navigate to, or a replacement runtime. Workbench should reuse its existing renderer, finish/failure handling, animations and progression wherever present, and assemble the new presentation components around those hooks. Reconcile the handoff's suggested timings/layout with that existing implementation rather than recreating it. Asset approval does not authorize rewriting unrelated gameplay or calibration.
