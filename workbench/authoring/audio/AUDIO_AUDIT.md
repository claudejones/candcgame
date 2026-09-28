# Audio coverage audit — 2026-09-27

Scope: supplied 8-bit-sounds.zip compared with the simplified audio decisions in this conversation. This is an asset inventory and proposed event-coverage audit; current runtime code has not been audited here. Workbench must verify actual event hooks before implementation.

| Group | Required and supplied | Result |
|---|---|---|
| Stage music | NA01–03, SA01–03, EU01–03, AF01–03, AS01–03, OC01–03, AN01–03 themes | All 21 present |
| Global music | C_AND_C_TITLE, WORLD_MAP, SECRET_BOSS_THEME, GAME_COMPLETE | All 4 present |
| Completion stingers | STAGE_COMPLETE, BOSS_COMPLETE | Both present |
| Player SFX | PLAYER_JUMP, PLAYER_SLIDE, PLAYER_HIT, PLAYER_STUNNED | All 4 present |
| UI SFX | UI_BUTTON_CONFIRM, UI_START_CONTINUE_CONFIRM | Both present |
| Boss SFX | BOSS_WEAPON_FIRE_HIGH, BOSS_WEAPON_FIRE_LOW, BOSS_HIT | All 3 present |

Total: 36 files. No missing required files after the continent-cue replacement. No unexpected audio files.

## Approved reuse rules
- Continent completion -> STAGE_COMPLETE. If stage and continent completion fire for the same finish, play once. Reuse the same file/path; do not copy or rename it.
- General buttons, including select and Back -> UI_BUTTON_CONFIRM.
- Start and Continue -> UI_START_CONTINUE_CONFIRM, replacing rather than stacking the general button cue.
- Damage to the player during normal stages or boss encounters -> PLAYER_HIT.
- Boss victory -> BOSS_COMPLETE; there is no additional boss-defeat SFX.

## Deliberately omitted, not missing
Landing, recovery, finish-line crossing, separate back/navigation/locked/unlock cues, travel/plane sounds, hazard sounds, ambience, boss appearance/charge/stun/recovery and a dedicated game-over sound. These were removed or excluded to keep audio simple. No further generation is requested.

## Review points, not asset shortages
- Failure/game-over: no dedicated cue in this set. Proposed behavior is to stop BGM on run end and use existing UI confirmation when Retry/Continue is pressed. This is a proposal for Claude to review, not an approved replacement.
- Boss charge/stun: remain silent unless existing selected sounds serve a verified event; do not invent a mapping or add a new effect.
- Several SFX have longer durations than initial prompt targets; Workbench should audition responsiveness and overlap before proposing trims. Original files remain untouched.
- Most stage music ends slightly before 90 seconds; runtime continuation/transition needs review. No regeneration or automatic extension is requested.
- MP3 is the actual supplied format. No lossless WAV masters are claimed or required to complete this package.

WORKBENCH_HANDOFF.md contains the complete proposed integration mapping and asks Workbench for a concrete plan, review instructions and explicit user approval before implementation.
