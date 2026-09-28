# Technical check

- 36 MP3 files extracted and categorized; macOS resource-fork metadata omitted.
- All 21 expected stage IDs, four global music tracks and nine selected SFX are present.
- STAGE_COMPLETE and BOSS_COMPLETE are present. A separate CONTINENT_COMPLETE is absent and no longer required: the user approved STAGE_COMPLETE reuse on 2026-09-27.
- Every file was inspected with ffprobe and decoded to completion with ffmpeg without reported decode errors.
- Copied audio SHA-256 hashes match the source ZIP entries; original audio bytes were preserved.
- Most stage tracks are slightly shorter than 90 seconds; NA01 is 113.544 seconds. Boss music is 179.592 seconds. See inventory for exact durations.
- SFX duration and music-loop behavior need in-game listening review. No perceptual quality, loudness balance, seamless-loop or runtime integration approval is claimed.
- No repository files changed; no deployment performed.
