# UI02 — Coastal Departure Start Screen

Direction A approved by Claude. Final artwork ready for user review; no runtime integration performed. Airport direction is not selected. Existing progression rules remain unchanged.

## Assets

- originals/UI_OPENING_BACKGROUND_SOURCE.png: exact generated original, opaque RGB, 1672×941.
- assets/UI_OPENING_BACKGROUND.png: opaque 1280×720 integration PNG; full-image nearest-neighbor normalization. Tiny aspect adjustment from source dimensions; no artistic edits in code.
- references/: byte-identical approved logo and character-selection atlas for reuse.
- previews/: REVIEW-ONLY composites at 667×375 (no save), 844×390 (saved journey), 960×432 (Hard unlocked). Plain controls illustrate geometry, not final styling; implement the approved concept's navy/gold pixel borders. Hard * is a preview placeholder for a proper accessible lock icon. Sample NA02 progress is illustrative.
- asset-manifest.json: measured dimensions, roles and SHA256 hashes.

Generated with built-in image generation using approved concept A. Prompt: clean coastal scene matching A, sunny sky, ocean, mountainous coast right, small sailboat left, stone terrace, luggage and foliage at edges; remove all logos, characters, buttons, labels, panels and decorative sign text. Original retained. PNG normalization and review composites are deterministic.

## Appearance and layout

Appears on initial launch and explicit Main Menu return. Static background fills the viewport using centered cover scaling. Cropping peripheral luggage/foliage on wide displays is acceptable. Logo top center; character selection left; difficulty and main actions right; Achievements / Options / About bottom. UI is responsive, not baked into the background. Keep live controls within device safe areas, with at least 44 CSS px target height and visible focus/selection indicators. Reduce logo and portrait height before shrinking controls on short screens; allow menu scrolling if necessary. Previews do not model browser chrome or notches. Layer background, contrast panels, approved logo/portraits, live text/buttons, then modal overlays. The compact logo subtitle is decorative, not instructional copy. Use established character crops in runtime; previews split source into left/right halves and trim alpha only for fitting.

## Inputs, states, actions

Inputs: selected character/difficulty, saved journey and stage summary, Hard entitlement, assistance setting, loading/error status.

- Claude / Constance: select character for New Game; selected border plus check/text, not color alone.
- Easy / Standard: initially selectable. Recommend player label Difficulty.
- Hard locked: gray with lock; tap/focus explains “Complete all 21 Standard stages without assistance.” Hard unlocked becomes selectable.
- No save: New Game primary; Continue disabled with “No saved journey”.
- Save exists: Continue primary, showing saved stage/difficulty/character. Continue uses the save regardless of current New Game selections, then opens World Map.
- New Game: confirm before replacing an active journey, then World Map. Recommended checkpoint model restarts unfinished stages; recommended New Game preserves earned achievements and permanent unlocks. Both are proposals for reconciliation/approval, not newly settled by this art delivery.
- Achievements: per-difficulty achievement view. Options: Unlimited Health, Music, Sound Effects, gated Level Select. About: game premise and controls. Submenu Back returns to Start retaining choices. UI05 owns final submenu layouts.
- Assisted: show “Assisted play” and help “Unlimited Health: achievements and permanent unlocks are disabled during assisted play.” Existing earned records remain visible. Assistance activation/recovery details remain open recommendations in global plan.
- Loading: show Loading, prevent duplicate activation. Failed load: Retry / Back, preserve save and selections.

## Motion, sound, saves

No animation frames or audio supplied. Optional runtime entry fade 200ms once; immediate display under reduced motion. Buttons immediately usable. No idle demo or looping background animation approved. Button sound follows Sound Effects; music follows Music setting and browser interaction requirements.

Entering Start, selecting character/difficulty, or viewing help does not earn rewards or reset progress. Persist settings through existing storage; Workbench owns save schema and checkpoint reconciliation. Three health hearts reset at every stage and retry. Unlimited Health prevents depletion; assisted play earns no achievements or permanent unlocks. No extra lives currency.

## Verification and remaining checks

Clean art visually checked: concept's baked controls, characters and decorative sign removed; no residual text or panels. Geometry and PNG decoding verified; original/reference byte identity checked. Three mobile-size compositions inspected without overlapping controls. One unreadable preview was regenerated before packaging. ZIP CRC and contents verified. Static mockups do not establish functional input, save/load, unlocks or installed-app behavior.

Final user artwork acceptance pending. Workbench must implement pixel-style controls, accessible lock/help, safe areas, loading/error/assisted states, and test real devices plus both characters. Import only integration background and approved dependencies, never flattened review previews. Next production batch is RW-NA rewards pilot unless user chooses otherwise.
