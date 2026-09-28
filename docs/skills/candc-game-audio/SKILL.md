---
name: candc-game-audio
description: Audio production workflow for the Claude & Constance Around the World 8-bit game. Use for Suno music/SFX prompting, audio planning, naming, QA, tracking, and game-integration handoff.
---

# C&C Game Audio

## Purpose
This skill is the production authority for audio assets for **Claude & Constance Around the World**.

Use it for stage music; title/world-map/boss/ending music; UI/player/hazard/boss/environmental SFX; Suno prompts; audio audits; naming; QA; and integration handoffs.

When an asset depends on a stage's environment, hazards, mechanics, or visual identity, use the project's current source of truth when available. Do not invent missing stage facts.

## Locked decisions
1. 7 continents × 3 normal stages = **21 normal stages**.
2. Normal gameplay target is about **1:30 per stage**.
3. Normal stage themes use **Suno Advanced v6**.
4. Target normal stage music at roughly **1:45–2:00** unless later approved otherwise.
5. Normal stage music does not need to be generated as a seamless loop. Runtime looping may be a failsafe only.
6. **NA01_THEME is already created. Do not regenerate unless explicitly requested.**
7. One common **STAGE_COMPLETE** fanfare is shared by all normal stages.
8. **STAGE_COMPLETE is already created and approved at ~7 sec. Do not regenerate unless explicitly requested.**
9. The secret level has dedicated **boss music**.
10. Use **Suno Sounds → One Shot** for short stingers and most UI/game SFX.
11. Use **Suno Sounds → Loop** mainly for ambience or intentionally short repeating beds, not primary stage BGM.
12. Suno Sounds prompts have a **500-character maximum**. Every Sounds prompt produced by this skill must be ≤500 characters.
13. Download approved masters as **WAV**.
14. Maintain a coherent C&C sonic identity: playful adventure, retro-game readability, consistent 8-bit/chiptune family.
15. Avoid vocals unless the user explicitly changes direction.
16. Avoid named-artist imitation and copyrighted melody imitation.
17. Do not overproduce hazard/ambience audio. Support gameplay clarity.

## Canonical structure
```text
assets/audio/
├── music/
│   ├── title/C_AND_C_TITLE.wav
│   ├── world/WORLD_MAP.wav
│   ├── stages/NA01_THEME.wav ... AN03_THEME.wav
│   ├── boss/SECRET_BOSS_THEME.wav
│   └── ending/GAME_COMPLETE.wav
├── stingers/
│   ├── STAGE_COMPLETE.wav
│   ├── CONTINENT_COMPLETE.wav
│   └── BOSS_COMPLETE.wav
├── sfx/
│   ├── player/
│   ├── ui/
│   ├── world/
│   ├── hazards/
│   └── boss/
└── ambience/
    ├── NA/
    ├── SA/
    ├── EU/
    ├── AF/
    ├── AS/
    ├── OC/
    └── AN/
```

Stage IDs: NA01–03, SA01–03, EU01–03, AF01–03, AS01–03, OC01–03, AN01–03.

## Required workflow

### A. Classify
Use one: `STAGE_MUSIC`, `GLOBAL_MUSIC`, `BOSS_MUSIC`, `STINGER`, `PLAYER_SFX`, `UI_SFX`, `WORLD_SFX`, `HAZARD_SFX`, `BOSS_SFX`, `AMBIENCE`.

### B. Verify facts
For stage-specific assets identify stage ID/theme, environment, gameplay pace, relevant hazards/mechanics, emotional tone, and neighboring approved music if relevant. Use repository/project truth when available.

### C. Choose Suno workflow
- Stage/global/boss/ending music → **Advanced v6**
- Short stingers/SFX → **Sounds → One Shot**
- Ambient/repeating texture → **Sounds → Loop**

### D. Produce a production card
For Advanced v6 provide: asset ID/path, model, Instrumental setting, target duration, BPM, key guidance, `Styles`, `Exclude Styles`, optional Weirdness/Style Influence, rationale, QA.

For Sounds provide: asset ID/path, One Shot/Loop, BPM/key guidance, **one prompt ≤500 characters**, duration guidance, QA.

### E. Approval gate
Check scene/action fit; C&C sonic coherence; gameplay clarity; immediate usable start; ~90-sec endurance for stage music; non-fatiguing SFX; clean seam for loops; decisive resolution for stingers; WAV master downloaded.

### F. Track production state
Never tell the user to regenerate an approved asset without explicit reason/request.

Current completed:
- `assets/audio/music/stages/NA01_THEME.wav` — CREATED
- `assets/audio/stingers/STAGE_COMPLETE.wav` — CREATED / APPROVED (~7 sec)

Next normal stage: **NA02**.

## Stage music rules
Preserve shared C&C DNA while making every stage distinct:
- instrumental;
- 8-bit/chiptune retro-console palette;
- immediate gameplay-ready opening;
- forward motion for side-scrolling;
- memorable but non-distracting melody;
- clear bass/rhythm;
- enough development for ~90 seconds;
- no long intro;
- no slow ambient breakdown;
- no vocal section;
- no cinematic trailer ending;
- no required fade-out.

Express location through rhythm, contour, register, percussion character, harmony, and melodic vocabulary without crude stereotypes. Do not mechanically copy NA01.

## Normal stage completion
Default runtime intent:
1. Stage theme plays.
2. Player reaches finish.
3. BGM stops or quickly fades.
4. Shared `STAGE_COMPLETE.wav` plays.
5. Results/unlock/progression may occur during the ~7-sec fanfare.

## Secret boss
At minimum plan for `SECRET_BOSS_THEME.wav`, weapon charge/fire, boss hit/stun, defeated cue, and `BOSS_COMPLETE.wav`. Add appearance/recovery only if actual mechanics require them.

## Output discipline
When asked for the next asset, give the exact production card needed for Suno plus QA—not the entire manifest. Adapt to observed Suno behavior.

Supporting files:
- `references/AUDIO_MANIFEST.md`
- `references/SUNO_PROMPT_RULES.md`
- `references/AUDIO_FILE_NAMING.md`
- `references/AUDIO_PRODUCTION_CHECKLIST.md`
- `templates/STAGE_MUSIC_TEMPLATE.md`
- `templates/SFX_TEMPLATE.md`
- `templates/AMBIENCE_TEMPLATE.md`
