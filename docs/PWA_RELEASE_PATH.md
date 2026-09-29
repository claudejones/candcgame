# PWA release path — isolated lab

This plan and implementation stay on the PWA experiment branch. mobile-game remains the approved baseline and source of truth. The PWA is generated into a temporary output directory from that package; generated release trees are not committed.

## Measurement results

Measured on all 259 PNGs with four workers. The command was optipng -o2 on copies and cwebp -lossless -z 6 -exact -metadata all on source masters.

| Strategy | PNG/image bytes | Package projection* | Saving vs. 180.3 MiB |
| --- | ---: | ---: | ---: |
| Original | 132,890,176 | 189,015,121 bytes / 180.3 MiB | — |
| Optimized PNG | 123,922,013 | 180,046,958 bytes / 171.7 MiB | 4.74% |
| Lossless WebP | 99,694,334 | 155,819,279 bytes / 148.6 MiB | 17.56% |

Both derivative methods had 0 decoded RGBA mismatches, 0 alpha-value mismatches, and 0 dimension mismatches across all 259 files. Sixteen files dropped a structurally present but fully opaque alpha channel; decoded alpha values stayed identical. The final benchmark completed in 325.31 seconds (5m25s) wall time with four workers. No derivative replaces a source asset.

*The projection replaces the PNG total inside the 189,015,121-byte asset package and leaves other assets unchanged. The generated PWA build reports its actual complete byte total, including game code and plans.

### Audio gate

The 36 original MP3s total 55,935,925 bytes and 2,367.55 seconds; their mean bitrate is 193.2 kbps. Music alone averages 188.8 kbps over 2,345.57 seconds. The benchmark created three separate 128 kbps, 44.1 kHz stereo listening derivatives: title theme, NA01 theme, and secret boss theme. Source MP3s were not changed. No audio derivative is used by the PWA package; adoption waits for subjective listening approval.

## Runtime design

- Opening the PWA URL shows PLAY NOW immediately. The game remains playable online without installation.
- The shell detects iOS Safari and standalone mode. It shows the Share → Add to Home Screen → Open as Web App → Add steps only in Safari outside standalone mode. Installed launches skip those steps.
- Android uses the browser's install prompt when available and provides the browser-menu fallback otherwise.
- The full download is user initiated. The shell displays exact generated package bytes, progress by bytes and files, completion, retry state, and offline-ready state. It retains partial cached files so retry can continue.
- The service worker initially caches only the small launch shell. It caches game files on demand for online play. The complete-game button fills a version-specific Cache Storage namespace.
- The generated release uses immutable versioned URLs. PNG references in the approved game code are mapped by the service worker to corresponding exact lossless WebP files in that version. This retains existing manifests and gameplay code while reducing the downloaded package.
- Game versioned URLs never change underneath an active stage. Returning to the launch page after a game update selects the new release; an already open game continues to request its versioned files.
- Player saves retain candc.mobile-test.candc.player.v1. Player data remains separate from offline caches. No artwork, game rules, geometry, music or effects are edited in mobile-game/.

## Build and validation

node tools/build-pwa-lab.mjs "$RUNNER_TEMP/candc-pwa-lab" creates a temporary PWA release outside the repository. It copies non-PNG files, creates lossless WebP derivatives from PNG masters, writes an exact file/byte/hash manifest, and emits a versioned launch target. node tools/verify-pwa-lab.mjs ... verifies every packaged file hash, every PNG/WebP dimension and decoded RGBA pixel, and the existing player key.

GitHub Actions runs production CI plus a separate PWA build verification workflow. Those are repository checks. They do not test browser UI behavior, Airplane Mode, installation, iOS Safari audio, or physical-device performance.

## Device acceptance still required

A hosted HTTPS preview is intentionally not published from this draft. Before release promotion, test the isolated package on actual iPhone/iPad Safari and Android Chrome: normal URL play, standalone launch/install, landscape behavior, browser controls, explicit offline download, Airplane Mode across all 21 stages and the secret boss, music/SFX, saves, returning online, and a version update after a stage returns to the launch screen. Physical-device acceptance has not been claimed.
