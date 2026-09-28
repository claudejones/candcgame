# C&C audio integration — plan for Claude's approval

## Request to Workbench
Read this package and the current repository instructions, including AGENTS.md and current status. Inspect the actual game and Workbench audio/event architecture. Then present a concrete implementation plan to Claude for review and explicit approval BEFORE modifying runtime code, committing, or deploying audio integration. This package authorizes planning; it is not implementation approval. Explain where Claude will review the plan, which decisions need approval, and exactly how he will test the implemented result afterward.

Keep it simple. Use the supplied sounds and existing controls wherever possible. Do not add new audio assets, extra UI sounds, ambience, or hazard sounds. Do not regenerate approved audio. Preserve unrelated and concurrent Workbench work.

## Package facts
- 36 supplied MP3 files: 21 stage themes, 4 global music tracks, 2 completion stingers, 9 SFX.
- User-approved replacement (2026-09-27): continent completion reuses STAGE_COMPLETE. No separate CONTINENT_COMPLETE file is required. When stage and continent completion coincide, play STAGE_COMPLETE once, not twice.
- Original MP3 bytes are preserved. Earlier production instructions requested WAV, but the actual delivery is MP3. Do not rename MP3s to WAV or transcode them to pretend they are lossless masters. Use these MP3s unless a concrete technical problem requires a separately approved derivative.
- AUDIO_INVENTORY.csv and .json provide exact paths, measured durations, byte sizes and SHA-256 hashes. Treat the JSON as an inventory, not a ready-made runtime configuration.
- The user approved music/stingers through conversation and selected the simplified SFX. This handoff's technical checks do not constitute listening or in-game mix approval.

## Intended directory structure
All paths are relative to the repository root. Merge these files into the existing assets tree; do not replace the whole assets folder.

- assets/audio/music/stages/{STAGE_ID}_THEME.mp3 — NA01–03, SA01–03, EU01–03, AF01–03, AS01–03, OC01–03, AN01–03
- assets/audio/music/title/C_AND_C_TITLE.mp3
- assets/audio/music/world/WORLD_MAP.mp3
- assets/audio/music/boss/SECRET_BOSS_THEME.mp3
- assets/audio/music/ending/GAME_COMPLETE.mp3
- assets/audio/stingers/STAGE_COMPLETE.mp3
- assets/audio/stingers/BOSS_COMPLETE.mp3
- Continent completion event aliases assets/audio/stingers/STAGE_COMPLETE.mp3; no duplicated audio file.
- assets/audio/sfx/player/PLAYER_JUMP.mp3
- assets/audio/sfx/player/PLAYER_SLIDE.mp3
- assets/audio/sfx/player/PLAYER_HIT.mp3
- assets/audio/sfx/player/PLAYER_STUNNED.mp3
- assets/audio/sfx/ui/UI_BUTTON_CONFIRM.mp3
- assets/audio/sfx/ui/UI_START_CONTINUE_CONFIRM.mp3
- assets/audio/sfx/boss/BOSS_WEAPON_FIRE_HIGH.mp3
- assets/audio/sfx/boss/BOSS_WEAPON_FIRE_LOW.mp3
- assets/audio/sfx/boss/BOSS_HIT.mp3

## Proposed event mapping for review
Verify these against real event/state names and identify exact integration points in the plan. Do not assume a mechanic exists because a sound exists.

| Event | Audio | Proposed behavior |
|---|---|---|
| Title screen | C_AND_C_TITLE | One background track; start when browser audio is unlocked. |
| World map / stage selection | WORLD_MAP | One background track, continuing through map movement. |
| Normal stage begins | Matching stage ID theme | Start from beginning on a new run/retry; stop at actual completion or exit. |
| Secret boss encounter | SECRET_BOSS_THEME | Replace other background music; stop on encounter end. |
| Campaign ending | GAME_COMPLETE | Play once; allow its final cadence to finish. |
| Normal stage cleared | STAGE_COMPLETE | Stop/briefly fade BGM and play once; do not stack completion fanfares. |
| Continent cleared | STAGE_COMPLETE (shared) | User-approved reuse. Deduplicate against stage completion for the same finish; play once. No separate continent audio file. |
| Secret boss defeated | BOSS_COMPLETE | Stop boss BGM; play once; sequence separately from campaign-ending music if both occur. |
| Accepted jump action | PLAYER_JUMP | Once when jump actually starts, not on every button/key event. |
| Accepted slide action | PLAYER_SLIDE | Once on entering slide; do not retrigger every frame while held. Inspect current held-slide mechanics. |
| Player takes damage | PLAYER_HIT | Once per accepted damage event, not on repeated invulnerable overlaps. |
| Player enters stunned state | PLAYER_STUNNED | Once per state entry. Propose timing relative to HIT so both remain clear. No looping. |
| General button action, including select/back | UI_BUTTON_CONFIRM | One cue per accepted action. Use across general buttons. |
| Start or Continue | UI_START_CONTINUE_CONFIRM | Replaces the general button cue for these actions; never play both. |
| High weapon fires | BOSS_WEAPON_FIRE_HIGH | Once on the actual high shot. Verify shooter and high/low meanings from implemented mechanics. |
| Low weapon fires | BOSS_WEAPON_FIRE_LOW | Once on the actual low shot. Verify shooter and high/low meanings from implemented mechanics. |
| Boss accepts damage | BOSS_HIT | Once per accepted boss-damage event, not repeated collision frames. |

No separate land, recovery, finish-crossing, navigation/back, unlock, travel, hazard, ambient or game-over sounds are requested.

## Playback details the implementation plan must resolve
1. Use one shared audio pathway for the shipped game and playable Workbench previews. Editing or auto-simulation should not unexpectedly produce continuous sound. Identify which modes enable audio and how previews are stopped.
2. Respect browser gesture requirements. Unlock audio from an intentional user action, catch playback failures, and let gameplay proceed if audio fails. Inspect first-press Start/Continue behavior on mobile.
3. Keep only one BGM track active. Clean up prior tracks on transitions, retries, exits and mode changes. Avoid duplicate event listeners and duplicate cues.
4. Reuse existing mute/volume controls. If none exist, propose the smallest useful control set (one persistent mute toggle is sufficient initially); expose mix gains in shared configuration for tuning.
5. Define pause, resume, background-tab and mobile app-switch behavior. Recommended: suspend music while paused/hidden, clear transient SFX, and resume from the correct position without replaying queued actions.
6. Load only needed music and a small SFX set. The supplied collection is about 56 MB; do not eagerly decode all music at launch. Explain caching, loading and missing-file behavior.
7. Most stage tracks measure 88.68–89.904 seconds; NA01 is 113.544 seconds. Gameplay is about 90 seconds. Music must not control finish timing. Propose and audition a runtime end/loop fallback so short tracks do not leave a gap. Do not claim seamless loops. Title/map/boss may repeat during long visits; check their joins. SECRET_BOSS_THEME is 179.592 seconds.
8. STAGE_COMPLETE measures 6.84 seconds and BOSS_COMPLETE 4.44 seconds. Use actual playback completion for sequencing where appropriate, not old prompt targets.
9. SFX range from 0.504 to 2.112 seconds. Audition action responsiveness, onset silence and repeated playback. HIGH fire is 2.04 seconds and LOW 1.032 seconds; UI Start/Continue is 2.112 seconds. Do not delay game actions to wait for SFX to end. Propose per-sound overlap/retrigger limits. Preserve sources; describe any necessary trimming as a reviewable derivative before doing it.
10. Provide initial music/SFX mix settings as proposals and verify by listening. Avoid clipping, overly loud UI sounds and music masking hit/weapon cues. Do not normalize or process originals silently.

## What Claude should receive before implementation
Return a short, concrete plan containing:
- Current code findings and proposed files/modules to change.
- A complete asset-to-event table using actual event names, including high/low weapon mapping.
- Music transition/loop/pause policy and completion-cue priority.
- The smallest required UI change, or confirmation that existing controls suffice.
- The approved shared stage/continent completion mapping, deduplication rule and any sounds that lack a matching state.
- Initial mix/retrigger settings and any proposed edits to audio bytes.
- A staged implementation and validation approach, with the exact preview location when available.
- A clearly marked request: “Claude, please approve this audio implementation plan before I begin.” Do not treat this handoff or prior sound approvals as approval to implement or deploy.

## Proposed user review after approved implementation
Workbench must tailor these steps to the real screens and provide the exact preview link/build identifier and expected result for each:
1. Open a fresh session on desktop and mobile. Press Start once: hear only Start/Continue feedback, with no overlapping title/game music.
2. Try general buttons and Back; verify the shared button cue. Check mute persists and no controls become unresponsive.
3. Open the map, select a stage, play, pause, resume, retry and return to map. Check transitions and no duplicate music.
4. Preview each of the 21 stage mappings using existing Workbench facilities if available. Play one stage through its end, including a short music track; inspect timing and completion behavior.
5. Test jump, slide/held slide, damage and stun. Repeated input and invulnerable overlaps must not create unwanted sound stacks.
6. Test the boss high/low shots, boss damage, player damage and victory. Verify the distinct fire mappings and cue clarity.
7. Review stage completion, continent completion using the shared STAGE_COMPLETE cue, boss victory and campaign ending. No competing fanfares or clipped final chord.
8. Switch tabs/apps, return, and repeat a run. Check mute, pause and loading behavior remain correct.
9. Ask Claude for final sound/mix acceptance. Explain any remaining limits and obtain deployment approval according to the repository workflow.

## Acceptance boundaries
This package is a prepared asset and planning handoff only. No game code has been changed and nothing has been deployed. Completion of packaging is not approval of the implementation plan. Keep technical validation and Claude's listening/gameplay approval separate.
