# Complete continent rewards — v1.0

All 21 stage trophies and seven continent passport designs are user-approved. This package consolidates the approved artwork without regeneration. Integration and runtime validation remain with Workbench.

## Import

Import the seven TROPHY_<CONTINENT>_ATLAS.png files from continents/<ID>/assets, shared/assets/PASS_STAMPS_ATLAS.png, and shared/assets/UI_REWARD_UTILITIES_ATLAS.png. The per-continent passport sheets and standalone images are retained as sources/reference; runtime should use the combined passport sheet. Original generated PNGs are preserved in each continent’s originals directory. Existing continent notes/QA describe the earlier delivery; this top-level approval and import mapping supersede their pending-review language.

Trophy sheets:768×512, three256×256 columns stage01/02/03, row0 gray unearned, row1 earned. Center128, baseline232; preserve entire cells and proportional scaling. Passport sheet:1792×512, seven256×256 columns NA,SA,EU,AF,AS,OC,AN; row0 gray, row1 earned. Seals224×224 centered128,128. Always render square. Manifest specifies exact crops and hashes.

Shared utilities appear once:96×32, empty hollow heart at0,0; red full heart at32,0; perfect star at64,0, each32×32. This PNG is also the byte-identical authored utility original; its redundant original copy was omitted. Ignore the historical originals path in the shared utility notes. No assisted/disabled heart. Do not import obsolete four-cell utilities.

## States and behavior

Used in Achievements and successful stage/continent results. Same art across Easy, Standard, Hard; separate records per difficulty. Trophy names and state/help labels are live UI text, not part of art. Gray tiles remain inspectable. Tapping a tile opens name, requirement and progress; Back closes details/returns to the invoking screen. Difficulty tabs select records.

Every stage/retry starts with three hearts. Eligible successful completion awards1–3 hearts; saved best only increases. All three earned stage trophies grant the continent stamp; all three best ratings3 add the shared perfect star and live Perfect label. Replays can improve stages separately. Display current-attempt hearts separately from saved best.

Unlimited Health grants no new trophies, ratings, stamps or permanent unlocks; existing legitimate rewards stay visible. Completion message: “Stage complete — rewards disabled while Unlimited Health is on.” No award reveal for assisted completion. Eligibility recovery after toggling assistance still needs Workbench/product resolution; recommend restart with assistance off.

Results buttons recommended: Continue (World Map), Map, Replay Stage subject to pre-unlock replay policy. Achievements buttons: difficulty tabs, reward detail, Back. New trophy/New best notification only when eligible records improve. Newly earned/perfect passport follows in the same result panel. Commit eligible result exactly once before reveal; inspection/reopening must not modify saves.

No animation frames included. Recommended new-award reveal: opacity0→1, uniform scale0.9→1 over600ms, once, tap to skip. Reduced motion immediate. Optional reward cue follows Sound Effects preference; no audio included. Character celebration and background motion belong to runtime integration, not these static PNGs.

## Verification and remaining work

All PNGs decode. Combined passport crops match approved standalone images byte-for-byte. Existing generated originals and final continent images preserved byte-for-byte. Shared utilities included once. Gray/color alignment was verified in each batch. Combined passport preview inspected. ZIP CRC and entry bytes checked.

Workbench must validate actual phone layouts, touch/keyboard input, save behavior, assistance, idempotent awards, difficulty isolation, and reduced motion. Character-shared records, pre-unlock successful replays and detailed save policy remain recommendations in the global plan. Mystery passport is separate, still undesigned, and not included. This package does not implement screens or deploy the game.
