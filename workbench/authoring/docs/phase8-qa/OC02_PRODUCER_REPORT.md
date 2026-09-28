# OC02 — Queensland tropical coast

**Five PNGs completed and verified for asset handoff.** All are2172 × 724. FAR is opaque; MID, GROUND and both atlases have real transparency. Gameplay readability remains provisional pending review with approved runtime character settings.

Approved replacements: **life ring on a wooden stand** and **low folded beach chair**. Flying species: **rainbow lorikeet**.

| File | Issues, corrections and result |
|---|---|
| OC02_BG_DISTANT_QUEENSLAND.png | Original2171 × 724; repeated one edge column without scaling. Opaque, repeat join passes; distant rainforest headland remains recognizable. |
| OC02_BG_MID_QUEENSLAND.png | Cleared faint alpha≤8; normalized existing sand from row540 down, original minimum alpha253. Anchor621 retained. Raised terrace supports the landing, nets and plants behind the gameplay lane. |
| OC02_GROUND_QUEENSLAND.png | Initial surface had translucent fringe and insufficient depth. Focused edit added depth. A separately documented62-row surplus-bottom trim, one-row fringe removal and existing-soil opacity normalization aligned the actual cap from331 to393. Flat, opaque393–723 and empty above; repeat passes. The62-row trim exceeds the routine helper36-row allowance and was recorded independently without modifying the helper. |
| OC02_OBJECT_ATLAS.png | Original1827 × 861; both full objects uniformly scaled82% and reframed into two1086 × 724 cells. Semantic contacts(543,620); full silhouettes, minimum gutter40px. |
| OC02_HAZARD_LORIKEET.png | Original2117 × 743; all four complete poses reframed into543 × 724 cells. Common83% scale corrected insufficient tail clearance at85%/84%. Same torso/head feature at(271,362), right-facing, minimum gutter34px, four distinct wing poses. |

## Visual checks

Compared FAR alone and combined scenes at worldX0,5400,10800,2400,4800. Viewport960 × 540, base scale960/2172, multipliers1.25/1/1, parallax0/.20/1, offsets0 and surface410. The forested headland peak and shoulders, pale beach crescent and turquoise sea remain readable. All columns are opaque through the previous problem zone at screen rows400–409. FAR/MID/GROUND repeat joins inspected.

The landing and drying nets sit on their own upper sand terrace. Their feet remain visibly behind and above the running surface; a quieter pale-sand band separates them from the foreground path. A labeled124px character guide and actual new hazard sprites at illustrative sizes were checked at every sampled position. This is **provisional composition evidence**, not an approved runtime gameplay composite; actual character settings were not retrieved. Workbench must confirm live sizes, silhouettes, flight height and collision fairness.

Animation contact sheet and loop preview show four distinct wing poses with registered torso/head, stable proportions and clear gutters. No per-frame scaling, cropped subjects or adjusted editor offsets were used.

Packaging: exactly five canonical PNGs; decoded dimensions, reviewed SHA-256 hashes and ZIP integrity checked. No metadata or QA files in the PNG ZIP.

Reference basis: [UNESCO Wet Tropics of Queensland](https://whc.unesco.org/en/list/486/) and [Australian Museum rainbow lorikeet](https://australian.museum/learn/animals/birds/rainbow-lorikeet/). No external reference photographs were attached to generation.

Import these five PNGs for OC02. Prepare the metadata, starting settings and Workbench import, then continue calibration.
