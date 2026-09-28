# Global UI integration — September 21, 2026

Imported the six approved delivery packages; latest START_HERE policies supersede older pending-art notes. Original source artwork and contracts are retained in authoring/global-ui. Runtime uses original PNG bytes, shared atlases, fonts and a hash manifest under dist/assets/global-ui. No flattened preview scene, sample progression, preview character crop or old stage scenery is shipped as gameplay. Import verified 1,001 supplied hash entries; 109 unique runtime files. Asset originals are not Base64 encoded.

## Implementation

- player-state.mjs: independent candc.player.v1 storage; character-attributed ratings aggregated into shared collections; Easy/Standard/Hard separate; monotonic best; three hearts on entry/retry; idempotent attempt outcomes; saved pending announcements; save error preserves in-memory records and existing unreadable saves.
- global-game.mjs and scoped CSS: delivered startup logo/portraits/background, map geography/ocean with normalized phone/desktop coordinates, current head pin and travel, stage cards, results, rewards/passports, difficulty tabs, eighth Secret page, menu/options/about, confirmation and save feedback.
- play-ui.mjs: lazy global-screen bridge using existing snapshot/asset loader/runtime. Existing finish and failure are the only outcome triggers. Commit outcome before reward reveal, then stage → strongest passport → world/Standard unlock → secret announcement. Continue restarts the saved stage with three hearts; obsolete result notices are cleared without changing earned rewards. New attempts start through the same Game loading path.
- Pause remains direct without a dialog. Separate Menu pauses gameplay; returning stays paused. Existing Idle/cloud presentation, looping Celebrate/clouds and failed stun stars remain. No character relocation for result panels. Reduced-motion terminal presentation freezes; hidden page stops gameplay presentation and pauses map/travel motion.
- Assisted attempts retain prior rewards and can continue their journey but never award or unlock. Turning assistance off cannot recover eligibility within the same attempt. A stage reached only through assisted advancement is not reward eligible until its ordinary prerequisites are earned.
- Hard and unrestricted ordinary stage selection require all 21 eligible Standard completions. Secret entitlement requires seven perfect Standard passports. Secret entry shows unavailable content; no invented final passport art or gameplay. Music/SFX preferences are stored independently; no audio exists in this handoff/current runtime to play.

## Review defaults — product confirmation still outstanding

The handoff explicitly leaves reward ownership, checkpoint/reset and assistance recovery open. No answers were supplied to the offered choices. Review implementation uses shared character rewards, journey-only New Game reset, and sticky assistance until a fresh attempt. The user has since confirmed that Continue restarts the saved stage rather than restoring its result screen. Per-character contributions are retained so reward ownership can be changed without discarding earned ratings. PLAYER_POLICY documents these defaults; they are not claimed as newly approved product policy.

## Validation

Passed: 126 stage × character × difficulty runtime simulations; frame-rate consistency; actual PNG decoding/rendering; original stun-star rows; checked Design sequence handoff; snapshot/draft isolation; paused Idle/clouds; completed Celebrate/clouds; failed stars with frozen gameplay.

Passed event harnesses: startup → map → load → Start; both characters; direct Pause/Resume; return to unchanged Design; result/replay/failure/retry; achievement caller restoration; menu/options/assistance; locked eighth page. Player-store tests cover all21 progression, monotonic ratings, duplicate outcomes, difficulty isolation, unlocks, assisted exclusion, save reload and storage failure/corruption. Local HTML/CSS image references resolve.

These are simulation and DOM-event checks, not browser screenshots or physical mobile testing. The managed preview does not support this buildless static project. Desktop visual parity, touch hit regions, safe areas, short-screen scrolling and browser animation still require review in the deployed Workbench. No standalone game release or offline/PWA installation claim.

Protected Design machines, renderer, calibration, project persistence, landscapes, all21 stage assets and settings remain unchanged.
