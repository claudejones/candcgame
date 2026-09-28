# OC01 — Uluru: completed image checks

**PASS: five canonical PNGs, each2172 × 724, ready for Workbench asset import.** This report supersedes the earlier blocked OC01 report. Use OC01_Workbench_PNGs.zip; OC01_progress.zip is an older working checkpoint.

Approved obstacles: spinifex tussock and weathered timber trail-marker post.

| File | Correction and verification |
|---|---|
| OC01_BG_DISTANT_ULURU.png | Opaque, clean repeat join, recognizable broad Uluru silhouette. Passing bytes retained. |
| OC01_BG_MID_ULURU.png | Raised the red-earth bank through a focused image edit after the user authorized continuation. Removed alpha≤8 residue and normalized existing soil from row580 down (minimum original alpha250). Exact baseline621, no offset or scale change. |
| OC01_GROUND_ULURU.png | Exact flat surface393; transparent above, opaque below, level repeat join. Previous60-row surplus-bottom trim and one-row fringe cleanup remain recorded as a separate margin decision. Passing bytes retained. |
| OC01_OBJECT_ATLAS.png | Two1086 × 724 cells; semantic root/post contacts(543,620), uniform97% scale, complete silhouettes, minimum gutter38px. Passing bytes retained. |
| OC01_HAZARD_GALAH.png | Four543 × 724 cells, right-facing, four distinct wing poses, body anchors(271,362), common88% scale, minimum gutter35px. Passing bytes retained. |

**Resolved blocker:** the earlier MID left transparent strips above the ground. The corrected MID is fully opaque across every column at screen rows400–409. Its solid soil now overlaps FAR and GROUND at canonical placement. Both desert oaks and both kangaroos remain visible.

Final FAR-alone and combined scenes were compared at worldX0,5400,10800,2400,4800 using960 × 540 viewport, base960/2172, layer multipliers1.25/1/1, zero offsets, parallax0/.20/1 and surface410. Uluru's broad top and mass remain readable at every sampled position. Landscape repeats, grounding, transparency, atlas contacts, gutters and animation checks pass.

ZIP verification: exactly five named PNGs, valid PNG decoding, exact dimensions, matching reviewed SHA-256 hashes and archive integrity. No test files or metadata inside the PNG ZIP.

Live Workbench calibration and final artwork acceptance remain pending.

Import these five PNGs for OC01. Prepare the metadata, starting settings and Workbench import, then continue calibration.
