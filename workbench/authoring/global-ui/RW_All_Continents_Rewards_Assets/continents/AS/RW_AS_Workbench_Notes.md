# RW-AS — Asia rewards

Approved concepts: Kyoto pagoda/bamboo/blossoms, Zhangjiajie pillars/mist, Bangkok Thai temple/river; circular cream/teal/gold passport-entry seal. Final masters and atlas delivery are ready for review, not integrated. Location names are live UI text below trophies, never embedded in the artwork.

## Files and layout contract

Original generated RGBA PNGs preserved in originals/, one per design. Assets/ includes four 256×256 earned masters and corresponding UNEARNED derivatives, TROPHY_AS_ATLAS.png (768×512), PASS_AS_ATLAS.png (256×512), and a dependency on RW_Shared_Utilities.zip v1.0. Shared utility PNGs are intentionally not duplicated here. Manifest contains actual dimensions, SHA256, rects and anchors.

Trophy columns: AS01, AS02, AS03. Row0 gray unearned, row1 colored earned. Each cell256×256, rectangles [x,y,width,height] with exclusive right/bottom. All trophies bottom-align at y232, centered x128; their visible widths177–192px, heights188–208px. Transparent gutters at least24px vertically. Render whole cells; do not independently auto-trim gray and color.

Passport rows: gray at[0,0,256,256], color at[0,256,256,256]. Center128,128; visible bounding box[16,16,240,240], exactly224px wide/high. Render using equal width/height; never stretch to fit a rectangular container. This is the interim Asia-only passport sheet. In the eventual1792×512 shared sheet, AS occupies column4; do not fill missing continent slots with NA duplicates.

Shared utility32px cells, delivered once in RW_Shared_Utilities.zip: empty hollow heart, full red heart, perfect gold star. Atlas96×32. Star moved from legacy x96 to x64; use semantic IDs from new manifest. No disabled/assisted heart exists. Hearts remain separate from trophies; star separate from passport.

## Finishing and corrections

Source generator preserved in original files. Transparent originals had disconnected edge speckles. Finalization thresholds alpha at128 and retains largest connected silhouette, removing detached speckles. Hard alpha supports crisp pixel edges. Trophies proportionally resized nearest-neighbor into a192×208 box, centered and bottom-aligned. Passport source's slight width/height mismatch corrected by normalizing its cropped silhouette to224×224. Earned→unearned uses Pillow BT.601 luminance conversion, with byte-identical alpha. No independent regeneration of off states. Source hashes and final hashes recorded.

## Runtime state and appearance

Used in Achievements and stage/continent results. Same art across Easy, Standard, Hard; store records separately per difficulty. Sample previews use Standard only and illustrative values. Actual ownership across characters remains a global-plan recommendation for Workbench/product resolution.

Eligible completion: bestHearts[difficulty][stage]=max(previousBest,heartsAtFinish), valid earned values1–3;0 means unearned. Three heart slots under each stage trophy display saved best. Worse replays never reduce rating. All stages/retries start with three health hearts.

All three AS records>=1 earns colored passport. All three==3 adds separate perfect star and live Perfect label. Separate improved replays may satisfy this; no uninterrupted-run requirement. Existing earned records stay visible during assisted play. Assisted play cannot earn trophies, upgrades, passports or permanent unlocks. Assisted preview shows existing eligible1/2/3 best ratings unchanged. Completing with Unlimited Health grants no new trophy, hearts, stamp or unlock; no special heart state is shown. Completion copy: Stage complete — rewards disabled while Unlimited Health is on. The stamp's JOURNEY COMPLETE is decorative motif text, not eligibility evidence; live Not earned / Earned / Perfect labels are authoritative.

## Interaction and help

Achievements: Easy / Standard / Hard tabs select records without changing artwork. Each reward is a touch/keyboard-activatable tile; opens detail panel with name, state, requirement and progress. Back closes panel to achievement board; board Back returns to invoking screen. Unearned and earned tiles both inspectable; unearned is not disabled.

Trophy help: Complete this stage with Unlimited Health off. Improvement: Finish with more hearts to improve your best. Best: X/3.
Passport help: Complete all three Asia stages. Progress X/3. Perfect: Earn three hearts on all three stage trophies. Progress X/3 perfect.
Assistance help: Achievements and permanent unlocks are disabled during assisted play. Turning assistance off mid-stage must not retroactively award the current attempt; exact toggle/restart policy remains recommended, not newly approved here.

Results: display this-attempt hearts separately from stored best. New trophy only for first eligible completion; New best only for improvement; otherwise Stage complete. Recommend Continue to World Map, Map, and Replay Stage subject to unresolved pre-level-select replay policy. Combine newly earned/perfect passport as next card in same results panel. Do not show an earned-award reveal for assisted completion. No new button artwork required.

## Animation, audio, persistence

No animation frames supplied. Recommended runtime trophy/stamp reveal: opacity0→1 and uniform scale0.9→1 over600ms once after committed new award. Gold star appears only for newly perfect continent. No infinite glow loop. Tap skips decorative reveal; controls become available promptly. Reduced motion uses immediate state. Optional reward cue follows Sound Effects preference; no audio included.

Commit eligible result exactly once before decorative reveal. Opening Achievements or replaying reveal writes no rewards. Workbench owns save schema, idempotent commit, toggling assistance, loading and save failures. The artist handoff does not implement gameplay or storage.

## QA and remaining validation

All sources/finals decode. Four originals retained byte-identical. Gray/earned alpha matches byte-for-byte. Trophies fit gutters and common baseline. Passport has equal visible width/height. Mixed1/2/3, all-unearned, perfect, and assisted-existing-records previews visually reviewed at844×390. At small size the stamp's lettering is decorative; live labels carry meaning. Larger detail view should show stamp at192–256px when space permits. Achievements preview is provisional layout; final UI05 may use continent paging/scrolling for smaller safe-area widths.

PNG hashes, atlas crop identity, transparent perimeter, ZIP CRC and ZIP-byte equality verified. Remaining: final user atlas review and Workbench device/input/state/save/reduced-motion verification. No deployment performed.

## Scale-out

Reuse the same cell, state and utility contracts for RW-OC, RW-AN. RW-NA is the preceding approved design family. Each has3 unique trophy designs and1 continent stamp, checked against stage themes. Seven trophy sheets and one combined seven-continent passport sheet at completion. Mystery passport is a separately designed3-state sheet; no mystery content invented by this batch. No World Treasures.


## Exact stage labels

AS01 — Kyoto; AS02 — Zhangjiajie; AS03 — Bangkok. Render names as live text beneath trophies. The preview uses 144×144 image cells; prefer integer/nearest-neighbor scaling where possible. Native cells are 256×256.
