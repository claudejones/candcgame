# UI05 — Menus, Achievements and Support · v1

The user approved the Achievements visual direction, with the mystery footer replaced by a dedicated Secret Level page8/8. The rest of this package extends that visual family to Options, Pause, About/How to Play, level selection and supporting dialogs for review. This is a graphic/presentation delivery, not a runtime replacement or deployment.

Extract the full ZIP and open `menus-preview.html`. The review selector exposes fixtures for every continent/difficulty, secret-page states, reward details, options, pause, help, level selection and dialogs. Arrows, difficulty tabs, reward details and menu links work within the review tool; actions requiring gameplay emit `ui05:action` and show a notice. Audio switches change the local review only. No localStorage, player saves, game flags or audio engine are modified. The bottom review controls and sample records are not game UI. PNG/JPG previews are optional review material, not import assets.

## Integration boundary

Reuse the existing startup, stage entry, pause/resume, finish/failure events, renderer, character state/anchors, music/SFX engine, save system and level selection. Assemble the delivered UI components around those hooks. Do not replace gameplay with this HTML, navigate the game to a review file, move characters for a mockup, rewrite finish detection or redo calibration. The existing finish-flag → result-overlay flow from UI04 remains unchanged.

Pause presents its panel over the current live stage. Invoke the existing pause logic: stop gameplay input, hazards, scrolling and collision, preserve the current camera/health, use the existing idle character behavior and continue ambient clouds as already requested. Resume returns to the same attempt, not a reload. The navy background in standalone menu previews is only a neutral reference; it does not replace the paused scene. If the existing pause button directly toggles pause/resume, preserve that behavior; this asset package does not authorize forcing a modal on that button. Connect a separate menu entry or the existing paused-menu hook as appropriate.

## Assets and source inventory

- `assets/`: new editable-system PNG components: header, large panel, dialog, row; four reward card states; eight navigation/control icons; eight switch states; circular locked secret-passport placeholder. Card/icon/switch atlases are included as alternatives to standalone PNGs.
- `originals/`: all new SVG sources, existing editable UI04 button sources, and28 original approved trophy/passport masters. New interface shapes extend the existing SVG/CSS component system; no reward or character artwork is regenerated.
- `shared/`: one self-contained snapshot of approved21 trophies/seven passports (color/gray/atlases), canonical hollow/full hearts and perfect star, all21 level thumbnails, shared UI icons and UI04 button states, plus opening/logo references for the shortcut example. Deduplicate by hash against earlier packages. Do not establish a second canonical utility set.
- `asset_manifest.json`: new component sizes, nine-slice recommendations and exact atlas cells. `shared_frames.json`: verified shared reward mappings. `file_inventory.json`: measured dimensions/modes/bytes/SHA256. `stages.json`: all21 stage IDs/names. `scenes.json`/`scenes.js`: layout/state fixtures, not game saves.
- Fonts and OFL license included. Use nearest-neighbor image sampling. Keep names, difficulty, counts, requirements, button labels and setting values live text.

## Achievements — confirmed presentation

Back returns to the screen that opened Achievements (startup, map, results or paused menu), preserving its state. Difficulty tabs switch separate earned records, never overwrite a save or the active journey difficulty. Preserve selected continent when switching tabs. Hard before unlock is explainable on tap/focus: complete all21 eligible Standard stages. After unlock it behaves like the other tabs.

Pages1–7: NA,SA,EU,AF,AS,OC,AN, each with three stage trophies and a circular continent passport. Display the same art across difficulties with different records. Each trophy overlays exactly three canonical hollow/full hearts. Zero best = gray Not earned,1/2 = color Best:n/3,3 = color Perfect. Passport is gray until all3 stages have eligible ratings; color afterward; separate perfect star only when all3 best ratings are3. Selected cyan border is independent of earned/gray status. Future continent rewards can be inspected even if their stages cannot yet be played.

Tap/click/keyboard activation opens a reusable detail panel: exact stage/continent name, earned state, saved best or eligible completion count, and the next requirement. Unearned trophy: complete that stage without assistance. Improvement: finish with more hearts. Perfect passport:3 perfect stage bests; they need not occur in one continuous run. Help must be reachable on touch and keyboard, not hover-only. All21 trophy and7 passport detail fixtures are included; runtime injects actual current records.

## Secret Level — confirmed requirements, explicitly deferred art

The footer strip is removed. Secret Level has its own full page8/8, visible before unlock. Antarctica is7/8 and South America2/8. Before unlock, show the delivered256×256 question-mark passport plus separate lock, prerequisite “Earn all7 perfect Standard continent passports”, and eligible progress. Page remains readable and inspectable while locked.

| State | Visual / action |
|---|---|
| Locked entry | `UI05_SECRET_PASSPORT_LOCKED.png` + shared lock; requirements/progress; View Standard |
| Entry unlocked, passport unearned | Future actual secret passport art in gray; Not earned; Play Secret Level |
| Eligible secret completion | Same future passport art in full color; Earned; Replay Secret Level |

Unlocking entry never awards or colors the passport. Unlimited Health cannot earn it. User's proposed level scope is one three-minute stage, still undesigned. Final motif, gray/color master, level content and direct-entry difficulty policy are deferred. Therefore this package deliberately does NOT ship a fabricated final passport or claim a complete three-state final-art atlas. The two future states have clearly labeled REVIEW-ONLY art slots. Remove those labels in the game once actual art is supplied. Reserve the existing768×256 three-cell atlas contract; don't ship blank placeholder cells as completed production rewards.

The secret page is displayed as a single Standard-gated achievement in the preview, with8/8 labels in the continent views. How the shared secret page is exposed from Easy/Hard and ownership of its earned record still needs final game-policy mapping; do not invent three separate secret passports. Preserve the Standard unlock prerequisite regardless of current tab.

After entry unlock, add a visible “Secret Level” option to the EXISTING startup menu. Before unlock, hide this startup option; its requirement remains discoverable on the achievement page. The shortcut launches directly through existing loading/stage-entry hooks, without forcing map navigation. Reuse the selected/current character according to existing startup policy; resolve secret difficulty before enabling real launch. The `startup_secret` example demonstrates the button treatment only and is not a replacement startup screen or added intermediate announcement. If content is not installed yet, preserve the earned entitlement but give explicit unavailable-content feedback, not a broken launch.

## Other screens / actions

| Screen / entry | States and actions |
|---|---|
| Options from startup/map/pause | Independent Music and Sound Effects on/off switches; Unlimited Health on/off; Level Select locked/unlocked; Back returns to caller. Mirror actual engine values, not sample fixture values |
| Unlimited Health confirmation | Explain no new trophies, improvements, passports or permanent unlocks; Cancel / Enable. Preserve existing earned records. Activation/recovery timing is still a game-policy decision; don't grant eligibility because the switch is off at finish |
| Level Select before Standard completion | Explain requirement and eligible progress, no launch action |
| Level Select after unlock | Seven continent pages, all21 ordinary stage thumbnails/names with Play; no duplicate stage art. Runtime supplies allowable difficulty and entry policy. Secret remains its separate startup/achievement entry |
| Paused menu, where supported by existing flow | Stage, difficulty, current health, assisted label if relevant; Resume, Restart Stage, Options, Achievements, World Map, Main Menu. Preserve existing pause-button toggle semantics |
| Restart confirmation | Cancel returns to pause; Restart reloads same attempt setup with3 hearts. Saved best cannot decrease |
| Leave confirmation | Preserve requested destination: World Map or Main Menu. Cancel returns to pause; Leave ends current attempt and invokes that destination. Do not conflate the two actions |
| About | Short premise and achievement explanation; How to Play and Back |
| How to Play | Jump clears low obstacles, Slide passes beneath overhead ones, three hearts, finish flag, replay ratings, assisted exclusion. Bind physical controls/key labels to actual existing control map; no new keys/gestures introduced |
| New Game confirmation | Cancel / Start New Game. Proposed copy explains current journey replacement. Workbench must reconcile exact reset scope with current save policy before using this copy; no achievement deletion or save migration is authorized |
| No saved journey | Explain Continue unavailable; Back / New Game. Never silently start a game on Continue |
| Save pending/success/error | Show success only after confirmed write; error offers Retry Save / Back; keep in-memory result and existing records. Use existing save protocol |
| Load pending/error | Loading feedback, retry/back. No progression changes or duplicate stage instances on rapid retry |

Support dialogs use the same provided assets. Current fixtures are representative copy, not authorization to change save/assistance rules. Assistance recovery, cross-character achievement ownership, New Game reset scope, and secret entry difficulty must be reconciled with current game configuration. These are policy items, not missing UI graphics.

## Data and behavior contract

Pass current caller/return target, selected difficulty/continent, character, stage ID/name, currentHealth, bestHeartsByDifficulty, earned/perfect continent states, Standard eligible completion count, Hard/level-select entitlement, secret entry/earned/content-ready states, actual music/SFX flags, assistance flag/eligibility, save/load status, and pending navigation target. Separate presentation selection from current journey state. Page navigation/tab switching only reads records. Store only actual option changes using the current save mechanism; UI05 never recalculates or awards trophies. Draw progress from eligible records, never assisted visits. Persist action effects idempotently through existing game handlers; disable duplicate launch/save requests while pending.

Return from reward details to the same page/tab/selection. Return from Options/Achievements opened during pause to the paused menu with gameplay still paused. Entering achievements from startup must not imply an active stage. Preserve selected focus. Runtime must enforce stage/difficulty eligibility even when UI controls appear enabled.

## Visual geometry, controls and motion

Reference1280×720. Header80px high. Achievement difficulty tabs y92, height68; continent navigation y169 with72px targets; cards(24+312*i,250,296,400); help y666. Secret uses full content area with256px native passport art, equal width/height; no footer. General panel(140,102,1000,568), dialog(215,170,850,420). Controls are at least68px high in reference space, preserving44px targets at844×475; on smaller/shorter devices reflow and increase targets instead of blindly shrinking. Honor safe-area insets and landscape orientation.

Frame nine-slice28px on all sides, content inset32px. UI04 buttons reuse their existing state/geometry contract; toggle160×64 graphic sits inside a larger210×105 accessible switch target. New8-icon atlas is4×2 of64px cells; switch atlas4×2 of160×64 cells with columns Normal/Focus/Pressed/Disabled and rows OFF/ON. Reward-card atlas4×1 of296×400 with Normal/Selected/Pressed/Disabled. State labels and silhouette changes complement color.

Use instant page/tab changes or a short120ms opacity crossfade. No reward-award animation in this read-only screen. Panels may fade in150ms; switches move thumb in100ms if desired, with supplied endpoints. Do not animate earned/locked art independently or award on page open. Reduced motion: immediate final states, no transitions. Shared button focus/pressed assets are supplied. No audio files required; optional existing UI click cue respects SFX setting.

Use semantic buttons/tabs/switches, visible focus, arrow/tab navigation as appropriate, live region for save/load errors. Confirmations/details trap focus and return it on close; Escape/Back follows caller context. Locked controls remain explainable on activation. The reference review tool exposes state controls and is not a production modal/focus manager.

## Verification and remaining boundary

See Verification.md for measured file/atlas/layout/ZIP checks and actual-component phone previews. Browser/runtime integration, touch/keyboard/focus, actual save/unlock policy and device-safe areas require Workbench testing. No game code was changed or deployed. Final secret passport and secret stage remain the explicitly deferred design work; all other supplied UI05 artwork and states are available for review.
