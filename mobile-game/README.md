# Claude & Constance: mobile testing build

This is a game-only web build, independent of the Workbench UI. It is a testing baseline, not a production or app-store release.

## What is implemented

- Shared gameplay, menus, rewards, HUD, hazard guide, audio and secret boss. No editor controls or Workbench app bootstrap.
- Landscape viewport, safe-area padding, a fixed 960×540 canvas scaled without changing gameplay coordinates, and existing approved controls/artwork.
- Portrait cover pauses the stage. Background/blur also pauses; returning requires Resume. Held slide releases on pointer cancellation, focus loss and pause.
- Original Web Audio integration; audio unlocks on a user tap. Music and sound toggles persist.
- Current-stage assets load on demand. The standalone image loader retains at most 24 cached image promises; active images remain referenced while playing. Browser garbage collection still controls actual release of decoded memory.
- Normal-stage plans are generated during the build, not optimized on the phone. Sixty-three deterministic plans cover 21 stages × three difficulties; both characters share the existing checked planner.
- Fixed configuration snapshot and asset hash report. Later Workbench edits do not modify a published game.
- Testing saves use `candc.mobile-test.candc.player.v1`, separate from Workbench Game saves. Local storage contains progress/settings only, never images/music.

## Configuration checkpoint

This baseline uses `authoring/hazard-upgrade/checked-project.json`, SHA-256 `df2aede6fd88182b53b4b6bfeeda70fe0f8f5f6d0484d07820d20cd9f90135ca`.
It is NOT a claim to include the user's latest browser-only overrides. Rebuild with their latest Export All JSON before release. The build validates imported configuration and refuses unsafe plans; it does not silently retune placements or hitboxes.

## Build and host

Requires Node 22+ and the current complete Workbench source checkout (dist and authoring), plus an Export All JSON. No npm install or backend is needed for the resulting game.

```sh
node authoring/mobile-game/build.mjs --source /path/to/workbench-source --config /path/to/export-all.json --out /path/to/new-game-build
node authoring/mobile-game/verify.mjs /path/to/new-game-build
```

Serve the resulting folder over HTTPS. Its index.html opens play/index.html; keep play/ and assets/ together. Do not open through file://. Subdirectory hosting is supported. Hashes and byte sizes are in build-report.json. The game does not fetch files from the Workbench Site.

## Asset/performance audit

The baseline contains 302 asset files / 189,015,121 bytes (180.3 MiB):

| Group | MiB |
| --- | ---: |
| Stage/world art | 99.2 |
| Audio | 53.3 |
| Global UI | 15.2 |
| Secret level | 5.1 |
| Characters | 5.0 |
| Shared art | 2.4 |

No Base64 embedding, resampling, atlas geometry changes or lossy conversion. All source media bytes are preserved.
Total download size is not initial page load or decoded memory. A 2172×724 RGBA texture occupies about 6 MiB once decoded; compressed download size does not describe RAM usage. A decoded 90-second 44.1 kHz stereo music buffer is about 30 MiB. The existing audio engine keeps effects plus the current music buffer; a crossfade briefly needs two music voices/buffers.

Next optimization decisions after device measurement:
1. Use HTTP compression for JS/JSON/CSS; cache versioned assets with immutable headers, while HTML and release metadata must revalidate.
2. Measure title startup and largest normal/boss stage on a midrange phone with a cold cache and throttled connection. Target 60 fps with no sustained frame spikes; do not call this target a measured result.
3. Test lossless PNG recompression or lossless WebP as derived release assets, preserving original PNG masters, dimensions, alpha and exact decoded pixels. Compressed textures still have decoded memory cost.
4. Audio is already MP3. Compare a 128 kbps stereo music derivative against the originals on phone speakers/headphones before adopting it. Keep short SFX responsive; do not repeatedly transcode masters. If audio memory is the bottleneck, evaluate streamed music separately because it changes the current timing/crossfade behavior.
5. Consider a bounded visited-stage offline cache only after release/update behavior is defined. Do not precache the entire 180 MiB game on first visit.

## Local saves and installation

Local storage persists across ordinary visits at the same origin. Clearing site data/private browsing can remove saves. A different domain or browser has separate storage; the current Workbench save cannot silently migrate to a new game origin. Use a stable HTTPS host. Backup/export and cross-device/cloud sync are not implemented.

This baseline is a hosted web app. It does not yet include offline support, an installable PWA manifest/service worker, native Android/iOS wrappers, signing or store submissions. A portrait prompt is the reliable fallback; browser orientation-lock support is not universal. After browser tests pass, add installable metadata/icons and a versioned offline policy, then consider a native wrapper only if app-store distribution is required.

## Device acceptance checklist

Test Safari on iPhone and Chrome on Android, landscape in both directions, with and without browser toolbars. Check a small landscape viewport (e.g. 667×375), notches/safe areas, title, map/drawer, tabs/scrolling, rewards and result overlays. Play both characters; hold/release Slide, cancel a touch, switch apps, rotate and return. Confirm pause/resume, muted/unmuted music, Bluetooth/audio interruptions, retry after failed network loads, stage-start Continue, perfect rewards and the full three-minute secret capture/failure paths.

Automated checks: 302 asset hashes/paths; 126 full normal-stage zero-hit runs at exactly 90 seconds; independent module paths; actual PNG host loading and Play/Pause/Resume; rotate/background pause; isolated saves. These checks do not certify physical-device layout, Safari audio behavior, thermal/battery performance or final game balance.

## GitHub handoff boundary

A separate mobile-test branch preserves the old main/Pages game. Current GitHub main is behind the Workbench assets. Existing byte-identical blobs are reused; the remaining original binary files must be copied from the full ZIP using a binary-safe Git upload. `MISSING_ASSETS.json` records exact paths/hashes. The repository's docs/GITHUB_WORKFLOW.md prohibits binary data through shell-output/Base64 relays; the available GitHub connector has no local-file binary upload operation. Do not deploy the incomplete GitHub folder or report it as a complete asset sync.

To finish from a normal authenticated Git checkout, check out the mobile-test branch, extract the full ZIP into mobile-game/ (contents at mobile-game/index.html, mobile-game/play/, mobile-game/assets/), verify hashes, then commit the missing assets. Preserve existing main/Pages until the required CI and mobile review gates pass.


## Startup update (September 28)

The rotation cover shows the original game/world logo. Title artwork loads first; map artwork loads behind Loading world before its first appearance. Compressed title music is fetched at boot, then decoded/played after a user gesture. Map failure offers Retry or Main Menu. No map travel time elapses while its artwork is loading. Original favicon and Apple touch icon are referenced directly.

## Completing the GitHub transfer

In your authenticated local checkout of claudejones/candcgame, switch to `work/mobile-test-20260928` and pull its latest changes. Extract this ZIP's contents into `mobile-game/`, preserving the branch's build-tools directory. Run `node mobile-game/verify-package.mjs mobile-game`, then commit and push `mobile-game/`. Do not upload the ZIP itself as a substitute for its extracted contents.

The branch prepares the existing Pages workflow to validate and include `/mobile-game/` while retaining the legacy pages. After the assets are committed, the agent can resume the existing development CI → main CI → Pages gates. Until those gates finish, no new GitHub Pages mobile release is live.
