## September 28, 2026 · Idle-demo handoff reliability fix

User reported title music ending without the demo. The previous trigger depended exclusively on track.ended and counted title idle time with a 100ms-per-frame cap. Added AudioEngine.musicFinished: non-loop completion is detected either by the ended flag or by the live audio voice clock reaching its decoded buffer duration. Paused/hidden audio does not count. Title idle timing now uses actual visible elapsed time, with visibility changes resetting the frame baseline to prevent hidden-tab catch-up. Demo loading errors now surface an actionable message instead of silently restarting the title.

Expanded authoring/attract-full-qa.mjs to exercise actual setupPlayModes → title audio clock → detached optimization → loadLevel → AttractPlayback using original PNGs, deliberately withholding source.onended. It enters the demo successfully. Audio completion/pause and existing cycle/global UI tests pass. Live browser access reached a sign-in wall, so the user's exact browser failure was not observed directly; browser/device confirmation remains pending. No artwork, user configuration, progression or pacing changes.

## September 28, 2026 · Title attract cycle and two-slide maximum

Title music now plays once per title visit/cycle. After the track ends and at least ten seconds without input, an 18-second checked gameplay demo runs, then returns to the start screen and restarts the title music. Normal stages rotate in order and characters alternate. Muted/unavailable/gesture-blocked music uses a twenty-second idle fallback. Hidden tabs suspend the cycle; other menus do not start demos. Pointer/key input cancels the demo or its loading and consumes the associated click/key release. Design Screens previews do not start the cycle.

Demo preparation optimizes a detached stage snapshot if necessary, then uses the actual shared checked runtime with automatic timed actions. No player attempt is created, no rewards/progress are committed, and no authoring calibration or saves are written. Music/SFX settings remain effective. Controls are hidden during the demo and a small return hint identifies it.

PACING_VERSION 7 caps consecutive slide-required encounters at two across combination boundaries. A third high flyer becomes a low flyer or ground hazard requiring a jump. The complete arrival/action sequence is checked for both characters; mixed groups retain held-slide pairs where appropriate. Five sections, continuous 90-second pacing, deterministic plans and flyer separation remain. Explicit hold-slide-only authoring overrides also obey the two-slide cap and include jump breaks. No artwork/hitbox/global difficulty changes; opening Preview stage or a Game stage regenerates the plan without Optimize All.

Validation: 63 stage/difficulty plans, 126 zero-hit full runs, max-two-slide assertions in both-character arrival order, no excessive gaps or flyer overlap. Attract unit/real-runtime and global UI event harness cover track completion, title restart, exact eighteen-second cycle timing, stage/character rotation, cancellation, hidden/menu suspension, click-through suppression and unchanged player save/rewards. Audio, ordinary Game menu/Continue/secret entry and stage-preview event checks pass. Browser layout, physical mobile input/audio and subjective balance remain user testing; no browser/device certification is claimed.

## September 28, 2026 · Approved 27-hazard artwork integration

Integrated the 18 original atlases and 27 approved ground hazards from C_AND_C_HAZARD_UPGRADE.zip. Exact source/replacement hashes and untouched slots verified. New labels, OC01 sign/AN02 case crops, contact-row grounding and body-based collision cores are shared by Design/Game. All existing scales retained. Exact-provenance migration automatically refits/checks changed hazards on load, preserves previous save recovery, and carries valid unchanged-neighbor calibration across the shared atlas hash change. Current-artwork overrides remain stable on reload.

All 27 pass Easy/Standard/Hard for both characters. 63 stage/difficulty plans and 126 zero-hit 90-second runs pass, plus runtime hit/pause/terminal and stage-preview UI event regressions. 162 shared-renderer scene views inspected; representative mobile-size canvas views reviewed, not physical phone/browser layout QA. No blocking art issues; anchor and boots contrast are worth checking in mobile play. Details, reproduction, package authority and rollback are in authoring/hazard-upgrade/INTEGRATION_REPORT.md. Earlier finish-grounding, pacing, audio and boss behavior are preserved.

## September 27, 2026 · Finish uses the actual character ground guide

Supersedes the preceding pathway-only correction. User clarified that the flag must automatically align with the selected character's white foot guide for each stage, including individual grounding, rather than preserving the misplaced Y=8 example or asking for manual correction.

The runtime now passes g.character.foot directly into finishGeometry. This is the exact value used to draw the white guide in Design; no parallel grounding formula or pathway fallback. It remains stationary during jumping/sliding and respects linked/unlinked character grounding. Visible flag base remains the measured original PNG base. Default relative Y=0.

finishPlacementVersion 3 performs a one-time reset of all older finish groundOffset values to zero, explicitly requested by the user to realign every stage. Scale and X offsets from version 2 remain unchanged. Older placeholder scale migration still applies to pre-version-2 projects. Existing recovery copies retain old saved data on Save All; future version-3 overrides survive reload/import. Character/hazard/landscape calibration and pacing are unchanged.

Checks: 42 stage/character runtime grounding checks now assert exact character-guide alignment, not a one-pixel tolerance against the shared pathway. Added saved version-2 Y=8 reset, independently offset/unlinked characters, and no flag movement during jump. Save/recovery/import/undo/redo passed. Shared Design stage-preview PNG/UI harness passed. No physical-device QA claimed.

## September 27, 2026 · All-stage finish grounding correction

The preceding Inspector update was incomplete: finish defaults still inherited historical grounding offsets and eleven imported stages retained placeholder scale 1 instead of the established .22. Shared pathway calculation alone did not repair them. All 21 stages now default to scale .22 and zero pathway offset. Original finish PNG bytes are unchanged. The visible base is measured at source row 1238 of 1299 (alpha > 32), excluding transparent bottom padding; geometry anchors that base to pathY plus the Inspector override.

Existing v9 saves/imports gain finishPlacementVersion 2. Values matching old source defaults are corrected field-by-field for groundOffset/scale; distinct user values, X offsets and combination overrides stay intact. Existing recovery-copy behavior preserves the old saved payload on Save All. Current-version exports/imports do not repeat this migration. Character, hazard, landscape and pacing calibration remain unchanged. No Optimize All required: refresh applies migration; Save All retains it.

Validation: finish-grounding-qa.mjs passes 42 stage/character runtime snapshot checks with the user's fixture, shared pathway movement, inherited/default migration, custom override retention, saved recovery copy, idempotent round-trip and undo/redo. Character foot guides in that fixture are within one scene pixel of the shared pathway due to retained individual offsets. Stage-preview UI/PNG harness passes both characters and finish editing. These are automated checks, not physical mobile QA.

## September 27, 2026 · Finish Inspector and pause-menu map navigation

Finish already derives its base from calibration.stages[stage].pathY. Retain that shared control and existing stageSettings.finish overrides; do not reset offsets. Moved finish fields from left navigation into the existing Inspector. Stage preview → Inspect finish flag opens the frozen 89-second approach and exposes only the finish Inspector. Ordinary stage playback retains its compact canvas-first layout. Save All/export/import remain the existing v9 flow.

Verification: stage-preview UI/PNG harness passed both-character preview, finish seek and edits, saved settings, and a shared pathway change retaining finish offsets. Global-game event harness passed map confirmation, retained rewards, and fresh replay attempts, plus existing normal/secret menu flows. These are automated checks, not physical-device visual QA.

Game Menu now includes Back to map with the existing leave confirmation, preserving rewards and restarting unfinished attempts on next Play. Main Menu remains available for character/difficulty/start navigation.

Mobile release remains a separate pending milestone. Supplied landscape phone screenshots show clipped start content, an overly reduced map with unscaled labels, and an undersized gameplay area inside Workbench. Removing editor chrome alone is insufficient. Next release work: shared game-only entrypoint; viewport/safe-area-aware landscape layout for start/map/results/HUD/touch controls; portrait guidance; mobile audio/lifecycle handling; actual iOS/Android touch/performance testing. Preserve stage geometry and timing while adapting presentation. Produce a hosting-ready ZIP with code, original assets and a frozen versioned configuration snapshot, independently of Workbench. No standalone builder or release is claimed implemented.

GitHub release handoff: synchronize reviewed source/build tooling into claudejones/candcgame after inspecting that repository's current instructions and branch. Track configuration and asset manifest with source; attach the generated ZIP to a tagged GitHub Release or CI artifact. Workbench Sites publication is not GitHub synchronization. No GitHub push or standalone release was requested/performed in this update.

## September 27, 2026 — continuous 90-second pacing

Supersedes the section-contained combination scheduling below. One scheduling cursor now runs across all five sections; a section boundary increases pressure without requiring hazards to leave the viewport or restarting the reaction delay. Group generation continues to the final approach instead of stopping after a per-section quota. Default recovery targets tighten from 3.5→2.2 seconds (Easy), 2.5→1.2 (Standard), and 1.75→0.85 (Hard); global spacing/reaction/density values and per-stage overrides still influence these targets. Movement, hitboxes and grounded terrain speed stay calibrated.

Flying-hazard spacing uses an envelope over every cropped animation frame and checks both endpoints of the shared on-screen travel interval. A 12-scene-pixel horizontal gap between vertically overlapping flyers prevents visible overlap and overtaking, including across combination boundaries. Held-slide groups favor a shared safe flight speed. When a preferred group needs excessive delay, the scheduler tries another enabled group first. Candidate checking and final whole-stage validation both enforce flight separation and player clearance. The derived visible allowance includes incoming combinations and cleared props exiting the viewport, bounded at eight; the profile's base value remains unchanged.

The final approach is filled or adjusted to approximately 2–3 seconds, with complete hazard clearance before 90 seconds. Finish flag rendering and completion time remain unchanged. The expandable Combinations & inspection timeline displays recovery intervals and the finish approach; longer safety-constrained gaps are highlighted. No additional default controls were added.

Validation against the uploaded project fixture: all 63 stage/difficulty plans and 126 zero-hit runs passed, exact 90-second completion, no oversized recovery intervals, no overlapping/overtaking flyers, and preserved configuration round trips. NA01 Standard's initial recovery decreased from 15.82s to about 2.52s. Existing stage-preview event/PNG checks passed, including custom held-slide settings and Save All. Tests are simulations and event checks; hands-on timing/balance review remains with the user. Reopening Preview stage or entering Game regenerates the plan; Optimize All is not required solely for this update.

## September 27, 2026 — compact stage preview layout

The stage preview now reserves at least 48vh (240–640px bounds) for the canvas and lets the studio scroll when necessary instead of shrinking gameplay to a thumbnail. During stage preview only, the inactive hitbox inspector, calibration panel, sprite view switches and baseline comparison are hidden. Watch/play, timeline, status, playback/restart and speed stay available; combination selection, section grid and detailed inspection expand under “Combinations & inspection.” Single-pass editing restores its existing panels. No gameplay, sequence, calibration or saved configuration changes. Existing stage-preview event/PNG checks passed, including seeking, manual play, loop, finish editing, both characters and Save All. Browser/mobile layout review remains manual.

## September 27, 2026 — combination planning and stage preview

- Normal stages use a deterministic combination plan shared by Design and Game: jump/slide pairs, repeated jumps (up to four), and held-slide groups. Five fixed sections start at 0, 18, 36, 54 and 72 seconds; normal completion is exactly 90 seconds. Hazards clear before the final approach. The secret encounter retains its independent 180-second timeline.
- Every proposed combination is checked as a continuous route for both characters. The planner adjusts timing, respects visible-hazard limits and uses a single safe terrain speed for all ground props. Flying speeds vary only where their calibrated action windows remain safe. A group that cannot fit safely reduces to a checked single encounter; authored geometry and locks are preserved.
- Design → Stages → Stage preview → Preview stage prepares the current plan and opens it in the existing scene workspace. Automatic watch and manual play share PlayRuntime. The timeline supports seeking, five-section jumps, combination loops, frame stepping and playback speed. Manual preview has unlimited lives and reports contacts; it never writes player progress or plays audio.
- Hold Slide with keyboard or pointer. Release/cancel, pause and focus loss release the held input. A tap retains the existing timed slide. Automated held groups sustain the slide through the full group.
- Stage overrides expose combination selection, maximum combination length (0 = automatic), held-slide target (0 = automatic), and density. Safety checks take precedence over exact requested density/length. Changed geometry is automatically recalculated when opening Preview stage; Save All keeps changes. Finish preview is frozen at 89 seconds and has no results overlay.
- Design → Stages → Finish flag: per-stage ground offset, approach X offset and scale. The flag follows the shared pathway. X offset adjusts the approach and eases to zero at the player crossing, preserving the 90-second completion. This is explicitly an approach-artwork offset, not a stage-duration setting.
- Optional `stageSettings` extends v9 exports and browser saves. Older v9/v8 imports receive only new defaults; crops, placements, landscape settings, locks and calibration stamps remain untouched. Save, import/export, change review, undo and redo include stage settings. Runtime snapshots copy them.
- Validation: uploaded September 27 configuration, 63 stage/difficulty plans and 126 zero-hit character runs, deterministic replay, 90-second finish, five sections, finish geometry and save/import/undo/redo. Original PNG rendering and preview UI events cover watch/manual, seek, loop, both characters and finish controls. Play UI, hit/recovery, audio and secret encounter regression checks also run. Browser/mobile layout and hands-on balance are for user review; event-harness checks are not browser QA.

## Approved audio integration — September 27, 2026

Imported 36 original MP3s from C_AND_C_AUDIO_HANDOFF(1).zip into dist/assets/audio, verified against supplied SHA-256 inventory. No audio-byte changes. Shared audio-engine/game-audio modules connect existing persisted Music/Sound Effects switches, menus, all 21 stage themes, boss releases/pulses, player actions/hit/stars, normal and boss completion and World Complete. Stage/continent fanfare deduplicates. Boss fanfare starts after capture, at celebration. Game Over stops BGM with no added cue.

Web Audio gesture unlock; lazy current music decode and small shared SFX cache; old music buffer eviction. 220ms transitions and runtime repeat crossfade; no seamless-loop claim. Pause/hidden suspend music at offset and discard transient effects; resume never queues old cues. UI remains audible when gameplay is paused. Music .35, gameplay effects .70, UI .45, stingers .65; shared output compressor bounds dense mixtures. UI group one voice, weapons three, other effects one per ID, eight effects overall. Original bytes unchanged.

Design is silent by default. Screens inspector has Audio preview, all 36 audition choices, Play sound and Stop sound. Screen/reset/exit cancels prior preview; user opt-in persists only during that inspector session. Shared implementation has no editor dependency. Independent game packaging is still separate work.

Validation: 36 full MP3 decodes and hashes; audio lifecycle/event harness covers pause offsets, mute, repeat, late/missing load, caps and both-character routing. Existing 126 runtime scenarios, 1344 global screen fixtures, player UI/travel/global flows and boss 30/60/120Hz checks passed. Browser/mobile playback and subjective listening/mix approval remain Claude's review. Calibration, encounter pacing, saved overrides and reward rules unchanged. The previously proposed combination planner/held slide/fixed 90s changes remain unimplemented.

## Approved annotated map layout — September 22, 2026

Applied reference stage positions without numbers or changing stage identities/unlocks. Original stage node atlas and gold dotted stage paths retained. Six intercontinent flights use individual cubic routes with tangent-facing planes and clearance around stage nodes. Oceania and Antarctica progress right to left. Oceania label moved clear of flight, Antarctica lowered; phone Africa label adjusted to avoid pins. South America remains centered below stages without a connector.

Label backgrounds are 85% opaque; text, locks and order pills remain opaque. Map is an isolated stacking context beneath an opaque stage drawer. Design draws character after hazards, matching Game; collision geometry and saved calibration unchanged.

Validation: 1344 screen fixtures, travel/loading and global UI regressions; all six route endpoint/tangent/node-clearance checks; overlapping Design draw order for both characters; map label/pin checks at 1280/844/590. Canvas composite inspected. No browser or physical-mobile layout claim.

## South America label-only correction — September 22, 2026

User requests no connector. Removed the SA leader metadata, rendering and CSS. Label is horizontally centered on South America at x=.265 for desktop and phone, retaining its existing y=.78. All other map markers, paths, flight behavior and Screens controls are unchanged. Supersedes the left-side label and connector described below.

## Approved correction: original stage markers and paths — September 22, 2026

User rejected numbered stage markers and modified intra-stage path styling. Restored original MAP_NODE_STATES_ATLAS selection, sizes/rings and previous gold dotted stage connectors exactly; existing direct-play access behavior is retained. Only intercontinent routes keep cyan dash styling. South America label moved to the open area left of its lower coastline, normalized (.13,.78), with a short solid leader anchored to the continent at (.245,.76), clear of the incoming flight and Africa. Original stage art and saved configurations untouched.

Plane cell size reduced 52→44 CSS px. Intercontinent flight duration 2000→3200ms; intra-stage pin travel remains 1600ms and arrival hold 2000ms. Plane rotates to the actual route tangent (native map aspect ratio included), replacing horizontal-only mirroring. Dedicated Screens plane preview remains available with route/play/pause/step/scrub/reset controls and shares this rendering/timing.

Validation: 1344 screen fixtures, original unnumbered node checks, all six route heading checks, real travel/loading regressions, unchanged two-second hold, and label/pin geometry at 1280/844/590 widths passed. Desktop/phone geometry composite inspected; not a browser/physical-phone layout claim. Previous numbered-marker milestone below is superseded.

## Map marker clarity and explicit plane preview — September 22, 2026

Stage destinations retain their original atlas and now carry visible 1/2/3 number centers and dark outlines. Intra-stage dots are smaller gold marks; flight routes are slim cyan dashes aligned with the curve, visibly different in size, shape and color. South America's continent label/order pill is moved right to clear the North America arrival route. Stage access and all saved gameplay/configuration data are unchanged.

Screens now has separate World map · stage travel and World map · plane travel entries. Plane preview exposes six named Flight route choices rather than requiring discovery of a third-stage selection. Actual shared travel renderer supports animation, pause, frame step, progress scrub and reset without rebuilding the map on every frame. At the destination the plane disappears and the character holds for two seconds. Previews remain isolated from real progress.

Validation: 1344 screen fixtures; targeted plane preview routes in both directions, numbered markers, stage-only travel, stable DOM while scrubbing, and arrival hold; original travel/launch regression tests; label/pin geometry at 1280/844/590 widths. Browser/physical-mobile visual approval remains pending.

## Playthrough feedback and plane travel — September 22, 2026

Published with explicit user approval as version 51, source f759c1587b595d7d3d25c2330a5e24b014c59553; deployment appgdep_6ab1cacd2fc881918ef3eac2b3aadadd succeeded. Original plane source and handoff retained under authoring/map-travel; original SHA a9785e122c97e6db78764cbbfd3d5b6a5c76370251845121c0a20bf19608bc27. Prepared 2 x 660px atlas with identical canonical body, original alternate propeller region and removed alpha haze below 128. Phone visible widths 48.14/50.35px. Both-direction motion reference and preparation/validation scripts are in that folder.

- Map drawer defaults closed; selecting a continent opens it. Bottom instruction has a bounded, contrasting strip. Order pills centered. Available/completed dots have accessible direct-play targets; locked nodes cannot launch. Adjacent targets do not overlap. Antarctica nodes now centered at x=.40/.50/.60; its pin sits beside the dot so the centered label remains readable. Geometry passes at 1280/844/590 widths.
- Curved dotted intercontinent routes and supplied plane share normalized geometry with real travel and Screens. Flight 2000ms, within-continent pin travel 1600ms, arrival hold 2000ms; editable values in global-ui/map_layout.json.travel. Plane alternates every 120ms, mirrors leftward, disappears at arrival. Character returns before the hold. Background hiding freezes elapsed travel, reduced motion uses brief 600ms arrival, duplicate launches guarded, departure to Design invalidates pending loads. Original unlock/reward/save rules unchanged.
- Real entries now show the same Loading stage screen as Screens until launch resolves. Replaces Loading current draft. Preview travel covers flight and arrival hold; select a continent's third stage to inspect cross-continent travel.
- Pause acts on pointerdown; subsequent pointer click cannot toggle twice. Centering survives pressed/disabled states. Normal stage results wait exactly two celebration cycles and use a centered 54%-width panel. Secret capture/result timing unchanged. Perfect-passport stars are larger and attached bottom-center to the stamp across rewards/detail/results. Achievements retain their layout with smaller badges and more compact spacing; narrow screens retain scrolling rather than hiding content.
- Pacing v4 has stable stage+difficulty seeds. Motifs balance ground / low / high, cap flying streaks at two (when ground hazards are enabled), and leave a larger interval between six-event phrases. All five difficulty sections retain progressive timing pressure. Flying velocities vary within checked safe windows. Ground props use one stage/profile velocity certified against every enabled ground hazard, and the ground texture/finish marker use that same velocity. Shared planner powers Design sequence preview and Game; authored placement/global settings are not rewritten by sequencing. If locked geometry admits no common safe speed, entry reports that conflict instead of falsely certifying it.

Validation: provided-config Optimize All retains overrides, character calibration, art/global profiles and saves. 63 stage/difficulty plans and 126 zero-hit character runs; fresh first-open optimization also qualifies all 63 hazards and validates all 63 shared-speed sequences; distinct repeatable stage/profile patterns, max-two flyer runs and common ground speed checked. 126 runtime regressions, 60/120Hz event parity, controls, health/recovery/pause, both-character Play UI, 1302 Screens fixtures and global flows passed. Dedicated travel tests cover both directions, actual loading, duplicate launch, 2s hold, hidden-tab freeze, reduced motion and pending-load cancellation. Browser/physical-mobile visual approval remains pending; the motion GIF is a compositor reference, not a browser capture.

Design workflow: stage Hazard settings edit geometry/pathway-follow/enabled state; Optimize All or Save All recalculates affected calibration. Generate checked sequence / Play sequence previews automatic actions for either character; Game uses that same deterministic plan. No manual timeline-placement editor was added.

Pacing reference: Valve, The AI Systems of Left 4 Dead (Mike Booth, 2009), build-up/peak/fade/relax model, https://steamcdn-a.akamaihd.net/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf. Adapted as deterministic phrases for mastery, not random/adaptive stage regeneration.

## Stable menus and map stage drawer — September 21, 2026

Implemented feedback-2.zip: Start difficulty labels use centered equal grid tracks and smaller responsive type so Standard fits. Continue now has only its label; Continue and New Game share width and 52px height. Start and Achievements reserve fixed-height mode-help areas, and automatic focus prevents scroll jumps. Selected continent styling is yellow text only; a focus-visible outline remains for keyboard accessibility.

World map is constrained to the remaining viewport height. Map geography stays contained at a fixed aspect ratio. Stage cards move into a right-side overlay drawer with independent scrolling, Close/Escape and a header Stages toggle. Selecting a continent opens its drawer; initial entry opens the current continent for immediate Play. Travel closes the drawer to keep the moving pin visible. Screens uses the same drawer in a fixed-height preview. Clouds retain continuous linear motion.

Validation: 1,302 screen fixtures, drawer open/close/Escape/continent switching, persistent mode-help slots, simplified Continue, global flows and both-character Play UI tests passed. No optimizer, saved-project or gameplay rules changed. Browser/mobile visual approval is still pending; no DOM layout rendering capability was available.

## Automatic optimization and remaining UI feedback — September 21, 2026

This milestone supersedes the planned-only optimizer and reversing cloud animation below.

- Optimize All / Optimize Stage now calculate, apply and save in one action. Save All recalculates only stale enabled hazards. No review/selection/apply proposals remain in the UI. Details are collapsed by default; existing optional recovery/history tools remain.
- Direct hazard edits already mark field overrides. Those fields, character calibration, source frames/crops, global difficulty values and landscapes are preserved. Stage pathway grounding still moves linked characters and hazards together. Automatic calibration searches bounded geometry and per-hazard difficulty speeds rather than weakening timing targets. Impossible override combinations remain unchanged, uncertified and explicitly reported; the solver does not silently unlock fields or disable hazards.
- Shared per-hazard derived speeds are optional validated calibration data. Project v9 exports/imports them; v8 browser saves and JSON imports migrate without placement loss, preserving the old browser key. Calibration certificates are version 5. Cancellation/concurrent edits discard the detached candidate; a rejected save rolls back automatic edits and retains the user's working edits.
- Fully calibrated normal stages automatically use the shared checked encounter planner on Game load, even without a Design preview. It validates variable-speed encounters and full action spacing for both characters. Difficulty and pacing edits are used on the next load. Existing uncalibrated runtime fallback and secret encounter remain available; certificates are not claims about arbitrary unsaved edits. Checked sequences can extend ordinary stage duration, as before.
- Clouds now move left continuously at a constant rate on one duplicated, clipped 90-second track. Reduced-motion and Screens pause still work. Duplicate Game heading/Back to Design are hidden. Menu button frames use sliced original assets and content-sized widths.
- Hard/Level Select requirements are adjacent to their controls. Save success is quiet, or briefly labels the explicit Save button; failures use a centered dismissible dialog with retry. Locked stage cards use gray thumbnails and a lock; selecting it reveals one contextual prerequisite.
- Continent selection has a consistent outline instead of the current-plate top artifact. Asia markers are further inland. Antarctica label is lower on the ice, with its connected stage markers placed to the left to leave room for current-character pins. Geometry checked at 1280/844/590 widths.
- Player-facing names updated to Desert Mesas, Mountain Pines and Savanna Plains; existing stage IDs and progress keys remain unchanged. About now explains desktop/mobile controls, hearts, perfect runs, passports, exact Standard unlock requirements, secret survival, saves and assisted play. Screens adds explicit locked/unlocked Level Select fixtures.

Validation: all 63 hazards qualify in a fresh setup and in the provided v8 configuration; 63 stage/difficulty sequences and 126 zero-hit character runs passed. Imported locks, global profiles, character values, frames and landscapes preserved. Migration/round-trip, repeat-save skip, stage-only/global invalidation, cancellation, failed save, direct Optimize and Save All event tests passed. Existing 126 runtime regressions, Play UI flows, global flows and 1,302 Screens fixture renders passed. These are simulation/event/canvas-geometry checks, not browser or physical-phone layout approval (no browser capability/binary available).

Tests: run authoring/auto-optimization-qa.mjs before auto-workflow-ui-qa.mjs (the former creates scratch-only auto-solved.json). Also auto-first-open-qa.mjs, screens-qa.mjs, global-game-qa.mjs, global-map-layout-qa.mjs and play-ui-qa.mjs. Provided project snapshot is retained as authoring/fixtures/optimization-project-v8.json solely for regression checks; no user browser settings are overwritten on deployment.

Next review: refresh Workbench, run Optimize All once, then test Game and adjust grounding/overrides with Save All. Visually review menu buttons, constant cloud motion and map placement on desktop/mobile. Standalone packaging and legacy GitHub publication remain separate.

## Map motion and result wording — September 21, 2026

Map clouds now drift 120px over 18–24 seconds with staggered phases, inside a clipped decorative layer. Continent controls remain outside that layer. Reduced-motion and Screens pause rules remain active. Three-heart current runs say “Perfect Stage Run!”; improved lower scores say “New Personal Best!”; other successful runs say “Stage Complete!” while preserving the historical best.

Validation: global-game event QA and 1,218 Screens fixture renders passed, including a one-heart replay after a perfect best. No browser/mobile visual verification claimed.

Automatic optimization remains a proposal, not implemented: current Optimize All creates review/apply proposals; Save All only saves. Intended simplified workflow is one initial Optimize All, global/stage overrides, and affected dependency recalculation on authoring saves; no per-hazard approval process. Contextual messaging and broader preceding UI feedback remain pending.

## Reversing conveyor carries the player

Implemented the approved secret-only conveyor movement. Grounded running/sliding follows signed belt velocity; jumping retains takeoff horizontal velocity. Both character and treadmill motion remain synchronized through smooth acceleration,800ms direction warning, and stage-local safe bounds. Speed tiers24/38/52 referencepx/s and reversal intervals7/5.5/4seconds intensify after shield losses. Edge-aware early warnings prevent drift into the boss/off-screen. No reversal is executed during the3.8s containment sequence; manual pause freezes belt displacement, warning clock, combat and character position together. Retry/fixture seek resets belt state. Character calibration and ordinary stages unchanged.

Blasts keep fixed trajectories, reaching their calibrated lane before the entire player travel corridor; they do not home onto the moving player. Each charge reserves an earliest/latest arrival window covering either belt direction and jump momentum, and subsequent shots respect full action recovery beyond the prior latest arrival. Full warnings remain. Measured31/35/39 shots per minute; pressure still rises, with deliberately fewer tightly spaced shots than stationary-player tuning.

Validation:18 complete180s zero-hit survival simulations (both characters ×30/60/120Hz ×three input lead times). Verified observed arrivals within reservations, airborne reversals, warning duration, player bounds, exact pause restoration and no reversals during stun. Existing electrical/capture/shield/celebration, fatal-deadline, UI and progression tests passed; saved Design data remains unchanged. Automated feasibility is not a claim of final subjective difficulty or physical-phone review. See authoring/secret-conveyor-qa.mjs.

## Progressive challenge and longer celebration

Following user feedback that the unlocked boss is still too easy, raised its three shield-driven speed tiers to1.3/1.65/2.05×reference speed, tightened between-shot and between-group gaps, extended groups, and varied motif position across groups. Full950ms warnings remain; shortened only post-release follow-through to160ms. Scheduling uses actual muzzle-to-player travel and physical action recovery to guard faster follow-ups. Boss remains the existing Standard-gated challenge; unlock/reward/difficulty eligibility is unchanged.

Measured32/38/45 shots per minute (115 total), average speed increases28% then24%. Both characters scripted zero-hit survival at30/60/120Hz; once-only pulse, no stun overlap, pause, fatal deadline and180s completion checks pass. This validates a playable response sequence, not subjective difficulty acceptance.

Ordinary five-section pacing now has separate Easy/Standard/Hard response-spacing and speed ramps (ending1.12/1.32/1.48×profile speeds before per-event variation). Preserved all saved profile/config/geometry values. Checked sequence authoring rechecks altered velocities; unqualified variants retain verified baseline speeds. Regenerate checked sequences to adopt pacing version3. All21 fallback stages and126 regression runs pass; only qualifying baseline checked sequences are certified.

Regular completion now permits at least4seconds of celebration; secret allows at least5seconds after capture. Reduced-motion regular presentation still advances the result delay without forcing sprite animation. Screen result fixtures bypass the delay; actual practice follows it. UI reward idempotency, immediate failure and saved configuration regression checks pass. Browser/mobile feel remains for user review.

## Electrical V2 publication authorized

User explicitly requested publication after reviewing the video and removing the BOSS STUNNED label. Publishing the reviewed implementation below; prior no-publication gate is satisfied. Automated checks from the implementation remain valid. Browser/physical-phone review remains pending.

## Electrical V2 review feedback

User reviewed the runtime video and requested removal of the BOSS STUNNED label. Removed that canvas text; electrical arcs and the existing boss poses alone communicate the state. Timing and gameplay unchanged. Publication approval remains pending.

## September 21, 2026 — Electrical V2 review (NOT published)

User supplied Secret_Level_Electrical_Hit_V2.zip and WORKBENCH_REQUEST(1).txt; the handoff explicitly says not to publish automatically. Live remains version44 (b5f12d1a8277a39f3a95feac39dc0381b345b810). This source revision awaits user review/authorization before saving/deploying a new Site version.

Imported all four original PNGs with SHA256/dimension checks. New FX follows current boss and emitter transforms: 500ms beam/impact, 800ms recoil, two-second frame2 hold with animated arcs, 500ms recovery and 500ms breathing. Cannon has synchronized charge/fire/cooldown; reduced motion holds arcs while retaining the beam/state cues. Secret-only compact labeled HUD clears the whole cannon. Shield-break rendering uses the capture clock so all three shields empty after final impact. The result panel waits for two complete calibrated celebration cycles after the existing capture. Survival remains exactly180 seconds; damage precedence and rewards unchanged.

Boss and ordinary encounters now vary repeated action motifs, individual fixed projectile/hazard speeds, and gaps. Arrival spacing prevents faster follow-ups from removing action recovery time. Checked sequences separately revalidate proposed speeds and fall back to qualifying baseline speeds where necessary; full trajectories remain checked for both characters. Shared event speed reaches both Design rendering and Game. Regenerate old checked sequences to adopt this revision.

Validation: both characters at30/60/120Hz complete180s with74shots and zero hits using the scripted timing policy; precise milestone frame durations, pause at charge/impact/stun, reduced motion, empty capture shields and celebration delay;21ordinary stages concurrent/varied speed, two qualifying continuous plans,126ordinary regression runs, UI/save/unlock/reward tests. Physical-phone/browser rendering is unverified (browser binary download unavailable). Phone HUD clearance is a geometry check, not a browser pass. Actual runtime-canvas video is generated by authoring/render-secret-review.mjs; it intentionally excludes DOM HUD/menus and labels that limitation. No new game artwork or character calibration was generated/changed.

## September 21, 2026 — Boss milestones and progressive encounters

The first secret integration was published as version 43 after user authorization. This revision fixes overlapping secret practice controls using shared action selectors, makes the secret HUD background translucent, and introduces fully warned jump/slide combinations. At 60 and 120 seconds the encounter clears projectiles before a 200ms impact, holds stagger frame 2 for 1500ms, recovers for 500ms, then idles for 500ms before permitting a new full warning. Combat time drives all phases and pauses atomically; final capture remains at exactly 180 seconds. Shield loss occurs once per milestone. Existing character geometry, health, hit recovery, unlocks and rewards remain unchanged.

Ordinary fallback and checked encounters now share five escalating pacing sections. Checked sequence boundaries also drive the HUD dots. Profile controls represent base density, spacing and starting visibility; tighter action spacing still respects jump/slide recovery. Qualified checked sequences remain continuously validated for both characters. Unqualified baseline geometry is not certified by fallback spawn tests. Existing saved checked sequences require regeneration to adopt the new five-section schedule.

Validation: both-character 180s runs at 30/60/120Hz (77 shots), precise milestone/pause/warning checks, all21 ordinary stages with concurrent hazards, two qualified continuous five-section plans, player progression and UI event regressions. Live browser/mobile visual review remains pending. Runtime tuning is persisted in authoring/secret-encounter-overrides.json so an asset reimport retains it. See ENCOUNTER_PACING.md.

## September 21, 2026 — SECRET01 local integration awaiting publication

Beneath the Ice imported from the delivered ZIP and implemented as a special arena adapter using existing character geometry, motion, damage and presentation. Original 21 stages remain unchanged. New modules: level-runtime.mjs (shared loader/dispatch), secret-runtime.mjs (180-second encounter), secret-renderer.mjs (original arena assets). PlayerStore has an additive secret record/attempt/cursor migration. Main menu gate remains all seven perfect Standard passports; unlocking is separate from earning the secret passport. Design Stages has a direct practice entry; Screens has secret scenarios and phase practice controls. Global screen components and player-save isolation are reused.

The supplied WORKBENCH_REQUEST.txt explicitly requests review and validation before publication. Changes are source-only at this checkpoint; live Workbench remains version42 until user authorizes publication. See SECRET_LEVEL_REVIEW.md for behavior, policy reconciliation, validation and review images. Both-character 180s encounter tests at 30/60/120Hz and all126 ordinary regressions passed; browser/mobile hands-on review remains pending. No character/default/calibration or ordinary source image changes; no standalone deployment.

## September 21, 2026 — Design Screens and visible map connections

Implemented vertical Stages / Characters / Screens navigation and Design studio naming. Map routes now use cream dots with navy outlines. Screens directly previews the shared Game UI using an isolated in-memory PlayerStore and detached runtime snapshot. Includes 22 scenarios, stage/character/difficulty/hearts/history controls, animation pause/frame-step/reset, reward queue stepping, travel scrubbing and scaled preview widths. No asset/default/calibration edits. Core runtime unchanged; HUD painter and map-pin interpolation are shared helpers.

Validation: authoring/screens-qa.mjs passed 924 scenario renders and isolated Continue/save actions with real localStorage unavailable. Existing global-game-qa.mjs and play-ui-qa.mjs passed. Browser/mobile layout not verified. See SCREEN_INSPECTOR_PLAN.md for scope and limits; preview widths do not emulate every device media query. Sites 0.1.70 workflow script was absent locally; used existing authenticated Git checkout and installed 0.1.65 package helper with explicit archive validation/native publication.

## Immediate stage entry and focused result actions

Play, Continue, Replay, Retry and Next Stage launch gameplay immediately after assets load; no extra Ready/Start dialog. Direct Pause/Resume remains. Failure actions are Retry, Map, Main Menu. Completion actions are Next Stage/Next Continent/World Map as appropriate, Replay, Map; Achievements remains in menus, not result overlays. Both-character immediate-play/pause and result-action event checks pass.

Proposed next integration: Design Screens tab alongside Stage and Character, reusing live components with an isolated in-memory preview store. See SCREEN_INSPECTOR_PLAN.md. No inspector is implemented or claimed yet.

## Continue checkpoint and map journey cues

User-confirmed Continue now loads the saved stage directly into Ready at its beginning with three hearts, preserving its character/difficulty, settings and earned rewards. Removed terminal-scene restoration; starting a new attempt clears obsolete pending result notices without changing awarded records. Continue has a primary label and smaller continent/stage subtitle. Added seven numbered continent-order pills and fourteen dotted stage links. Antarctica label is centered over its three stages, with responsive spacing for the current pin.

Passed both-character saved/failed Continue regressions, preserved reward/outcome records, existing play/pause/Design event checks, and map node/label geometry at1280,844,590px. Numbered badges and connections are checked in the UI event harness. Live browser/mobile rendering remains pending user review.

## Global UI display cleanup

Fixed CSS cascade collisions from Workbench hover/pressed background shorthands, including repeated character-selection art, clipped selected difficulty art, continent hover and reward/switch hover. Game controls now own full backgrounds. Friendly Stage N · Name labels replace player-facing codes in maps, Continue, rewards, prerequisites and results. Menu uses the supplied icon aligned beside the HUD with a 44px accessible target. All result panels are centered; inactive gameplay controls are hidden behind them. Menu panels are centered, thumbnail aspect ratios retained, and Game heading placed above menus.

Reviewed all21 map coordinates against the original geography; adjusted land markers and continent labels without changing stage artwork/configuration. Persisted runtime layout overrides separately from the original handoff. Both-character startup/play/pause and progression event checks pass. Canvas geometry review at1280,844 and590px found no current-pin/label overlap for any stage. This is asset/geometry and event QA, not live browser/physical-device verification; hover and responsive rendering need user review.

## Approved global UI handoff integration

Game now opens the supplied startup, world map, player journey, results and achievements/menu components. Design remains the shared runtime/configuration foundation. See GLOBAL_UI_INTEGRATION.md for the independent player-save contract, review-default policy decisions, validation and remaining browser/mobile checks. Secret gameplay/final stamp and independent game packaging remain deferred.

## Terminal overlay animation

Completion keeps Celebrate and cloud motion looping even after its overlay appears. Failure now keeps rendering and advancing the original stun-star atlas over the frozen stunned pose behind Retry. Failure does not advance hazards, stage time or damage. Both-character regression checks cover terminal presentation clocks. These presentation rules remain independent of the temporary overlay artwork so future approved screens can replace it.

## Finish celebration and unobstructed pause

Game now continues presentation frames after completion so both characters play Celebrate; the completion overlay waits one full configured celebration cycle. Pause/Resume uses the in-game control with no pause dialog. Idle and cloud motion advance while stage time, world scrolling, hazards and recovery timers remain frozen. Leaving Game or hiding the tab stops rendering; returning to the visible tab resumes paused presentation without resuming gameplay. Design modules and configuration are unchanged. Both-character regression checks cover frozen gameplay, animated clouds/Idle and animated celebration; UI harness checks pause without overlay.

## Game setup spacing follow-up

Stage, Character and Difficulty now reuse Design's field pattern with labels above equal-height controls, a consistent grid and a gap before the canvas. Heading/Back to Design and selectors align to the same 960px content width as the game surface. Narrow portrait layouts wrap Stage onto its own row. Scope is HTML/CSS only; gameplay, approved in-game HUD, assets and configuration are unchanged. Existing UI event harness passed; browser layout not independently verified.

## Current update — Design foundation with approved Game HUD

User-approved scope: Design and Game only. Reuse Design; extract only missing HUD/controls/assets from LAB25Q. The broader legacy-director migration proposal is superseded. Removed Test navigation, preview/roadmap/audit notices, stage availability/planned summaries and review badge from the product surface.

Original HUD hearts, avatar atlas, progress path and finish marker were decoded once from the immutable LAB25Q source without resizing or regeneration. Hashes/dimensions are in LAB25Q_HUD_ASSETS.json. Assets load through the existing catalog/AssetLoader. game-hud.css scopes approved styling to Game; mobile rules follow the game surface width. Approved centered Pause is restored, with Ready/Start, pause/resume and retry overlays. Paused gameplay uses Idle and blocks Jump/Slide. Existing hit/star behavior remains shared.

Protected unchanged modules: runtime-rules.mjs, scene-model.mjs, scene-ui.mjs, calibration-engine.mjs, calibration-settings.mjs, landscape.mjs, project.mjs, frame-editor.mjs. No character/hazard calibration, artwork replacements or defaults changed. Calibration UI exposes a read-only, freshness-checked sequence getter. A matching generated Design sequence supplies manual Game encounters without automatic avoidance; current scheduler remains the fallback when no matching checked sequence exists. A checked sequence can extend the run duration to let its encounters clear before finish release.

Validation: 126 stage/character/difficulty simulations passed; 60/120Hz events match; real PNG decode/render and both star rows passed; checked-sequence handoff, gameplay pause/input gating and unchanged draft exports passed. UI event harness passed both characters, Start/Pause/Resume and return to Design. Source comparison verified protected modules unchanged. Browser visual/physical-device validation remains pending: browser download was unavailable in this environment. Do not claim screenshot parity or completed mobile QA.

Next review: refresh Workbench, review Game HUD/controls with both characters and return to Design to inspect retained previews/settings. Final global screens/progression and standalone packaging remain separate pending milestones.

## Correction — approved LAB25Q migration required

The user rejected Review26's Test/Game design. Review25/26 below record provisional implementation history, not approved presentation or gameplay parity. Use `LAB25Q_MIGRATION_PLAN.md` in this directory as the next-work plan. The original HTML has now been inspected directly; migrate its approved HUD, controls and behavior through focused refactoring while preserving current assets and user configuration. No runtime changes or deployment were made for this planning checkpoint.

## Review26 — provisional HUD, controls and stars (presentation rejected)

Both Test and Game now display an on-screen lives HUD, character/difficulty, stage title, timed progress with character marker, and Pause/Resume. Jump and Slide are overlaid in the bottom corners. Ready/Paused/Failed/Complete states use a real HTML overlay with Start/Resume/Play again and Restart buttons instead of inert canvas text. Test diagnostics remain outside the game surface. Existing configuration and gameplay geometry are unchanged.

Restored original assets/characters/FX_STUN_STARS_ATLAS.png from claudejones/candcgame main, Git blob b2e5f1001f0d07eb3921e9f2cdc9e15ebd63865c. SHA256 matches the existing catalog:58f02c3044c1dc4b7098bfc5a3f8d053c45ed6722262d85419bacf173e1a3cf0. No image regeneration or save migration. Runtime loads the atlas and plays the existing configured four-frame stars for each character during hit frame2. Tests verify both atlas rows and changing animation cells.126 runtime cases and UI event harness passed again, including overlay Start→Pause→Resume. Original art decoded/rendered and hit composite inspected. Browser layout/physical device testing remains pending. Finish marker remains pending; this supersedes the earlier stars limitation below.

# Workbench runtime checkpoint — September 21, 2026

Review25 implements the first playable milestone: shared detached runtime snapshot, Test controls and a clean Game stage preview. All21 stages, both characters and all3 difficulty profiles are selectable for authoring review. No artwork or configuration defaults were modified.

Modules: dist/workbench-next/play-runtime.mjs and play-ui.mjs. Runtime snapshot covers current draft frames/crops, placement, pathway links, landscapes and calibration profiles plus current configuration and asset sources. Runtime uses the same movement, collision intersection and scene geometry functions as Design. Simulation contacts use the updated pose, independent of render timing. No saved-project schema change is required. Test and Game runs do not save player progression or mutate the draft. Returning to Design preserves edits and follows the tested stage.

Test: start/pause/restart, jump/slide keyboard and touch buttons, slow motion, frame step, unlimited lives, collision outlines, contact/hit/clear counts. Game preview hides diagnostics and uses finite lives. Blur/tab hiding pauses. Terminal states: failure with retry, timed completion after configured90 seconds and hazard clearance. Spawning respects enabled hazards, selected speed/reaction/spacing/count/capacity; it is a new deterministic preview director, not the entire legacy phased/signature director. Late encounters are omitted if they cannot clear before the finish interval. It does not certify fairness or optimizer acceptance.

Verification: authoring/play-runtime-qa.mjs ran126 complete unlimited-life standing runs (21×2×3), checked failure/zero lives, recovery input lock, invulnerability, pause/step, identical events under60/120Hz advance calls and unchanged draft exports. Real PNG decoding/rendering passed. authoring/play-ui-qa.mjs exercised UI event wiring with actual assets and a minimal DOM harness: load/start/pause/step/return, both modes, preserved edited snapshot. Browser layout and physical mobile interaction were not tested because no browser executable was available. Automated tests are not user approval or gameplay calibration.

Known pending work: standalone Build Game ZIP; final start/settings/continue/progression/world travel/trophy screens and rules from the user's separate global UI conversation; actual finish marker rendering and shared stun-stars asset restoration (legacy catalog paths exist, original PNGs absent from this Site). Current completion uses a text overlay and hit poses/blinking work without stars. Stars drawing supports the existing configuration when the approved asset is supplied. Do not regenerate missing art without a request. Do not mark full game release complete.

Next: user review of NA01 Design→Test→Design; refine controls/layout from feedback, connect the confirmed progression/UI contract, restore shared assets, and add independent packaging. Reconcile legacy solver timing endpoint differences before claiming all calibration evidence uses the same sampling convention. Existing evidence is preserved. All imported21 stage assets and prior saved settings remain intact. GitHub production synchronization remains pending.


## Start-screen portrait centering — 2026-09-28
- Preserve original G1B_CHARACTER_SELECT_ATLAS.png bytes and 3:4 cell proportions at desktop, mobile and short landscape sizes.
- Center each visible silhouette using measured alpha bounds (Claude X 215–723; Constance X 57–520 within 768px cells), rather than centering the uneven transparent padding.
- Character cards share centered column layout; selection, gameplay calibration and saved settings are unchanged.
- Hazard library is proposed only: stage-filtered approved thumbnails, names, descriptions and jump/slide guidance using shared hazard data. Not implemented in this change.

## How to Play tabs and hazard guide — 2026-09-28
- Start-screen How to Play now contains Game Guide and Hazard Guide tabs. Game Guide retains controls, hearts, trophies, passports, unlocks and saving help.
- Hazard Guide browses all 21 normal stages / 63 hazards through continent and stage selectors. Uses shared runtime descriptors and the current Design atlas frames/crops, asset catalog paths, dimensions and facing. No duplicate artwork or configuration writes.
- Flying guidance explicitly distinguishes high (slide) from low (jump); ground obstacles use jump guidance. Secret boss is not included in the normal-stage catalog.
- Both tabs keep a stable content frame with internal scrolling. Tabs support arrow keys, Home/End and accessible tab/panel relationships.
- Design > Screens includes direct Game Guide and Hazard Guide scenarios; Hazard Guide follows the inspector's stage.
- Verification: hazard-guide-qa covers every stage, all 63 cards and source bounds/paths, selector updates, tab keyboard navigation, Back and unchanged configuration/player saves. Global UI and real-asset Play UI checks pass. Browser layout has not been verified in the signed-in production session.

## Hazard Guide continent pages — 2026-09-28
- Replaced continent/stage dropdowns with seven continent pages, using Previous/Next navigation and a continent name + page count.
- Every page lists all three stages with their hazards grouped under stage headings. Navigation stays visible while the content scrolls; page changes reset the content to the top.
- Screens preview opens the continent containing the inspector's selected stage. Game Guide and shared artwork/configuration remain unchanged.
- Updated hazard-guide-qa passes for all seven pages / 21 groups / 63 cards, page wrapping, tab retention, keyboard navigation and unchanged saves/configuration.

## Independent mobile testing build — 2026-09-28
- Game-only host, build/verify tools and device/performance/storage notes in authoring/mobile-game/. Private preview output in dist/mobile-game/. Original Workbench remains separate.
- Fully self-contained downloadable ZIP has index.html, play/, original assets and build-report.json. No editor bootstrap or Workbench network dependency. Browser web testing only; PWA/offline/native/store work remains pending.
- Fixed test configuration is hazard-upgrade/checked-project.json (SHA-256 df2aede6fd88182b53b4b6bfeeda70fe0f8f5f6d0484d07820d20cd9f90135ca); latest browser-only user overrides still require Export All. Never imply this is the user's final release configuration.
- 63 plans generated at build time, 24-entry standalone image cache, gesture audio unlock, landscape/safe-area host, portrait/background pause requiring Resume, slide cancellation. Mobile-test save namespace isolates Workbench progress.
- 302 original asset files = 189,015,121 bytes; ZIP 187,698,034 bytes. No lossy conversions or geometry changes. Device measurements and lossless release derivatives remain next optimization gates.
- Verified original asset hashes/paths, 126 complete zero-hit 90s runs, module closure, and independent host PNG loading, immediate play, pause/resume, rotation/background pause and isolated saves. No physical-mobile or browser-layout certification.
- GitHub work/mobile-test-20260928 commit 365f8d2ee8de104c10de688dd707b7216c6cf562: game text/build files and 56 reusable asset blobs. 241 binaries (124,383,942 bytes) still require binary-safe bulk transfer from ZIP; exact inventory is mobile-game/MISSING_ASSETS.json. GitHub folder is not yet deployable. No main/Pages changes or CI/production-readiness claim.
- Shared GlobalGame adds optional playerStorage/isVisible adapters with unchanged Workbench defaults.


Mobile fit follow-up (2026-09-28): explicit phone text sizing, compact headers and 44px touch controls, reserved normal HUD/menu space, Continue only for saved journeys, original favicon/Apple icon links. Standalone boot decodes map/UI artwork before opening menus; artwork retained for navigation. Asset bytes/config/plans unchanged. Host and shared flow QA pass; physical device layout/performance remains user QA.

Mobile startup follow-up: original game/world logo on rotate cover; title compressed audio prefetched before gesture; title-only boot with gated on-demand map decode and retry. Host startup/map gating and audio regressions pass. Prepared mobile package verifier and Pages inclusion on work/mobile-test-20260928. Binary transfer remains blocked (241 files); no GitHub Pages or new Sites deployment claimed.
