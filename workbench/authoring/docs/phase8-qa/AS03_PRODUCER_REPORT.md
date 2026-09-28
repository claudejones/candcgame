# AS03 — Bangkok riverfront image checks

**Result:** Five named PNGs generated, corrected and verified for asset handoff. Every image is 2172 × 724 pixels. FAR is opaque; the other four use real transparency.

Approved replacements: **tall ceramic water jar** and **low mooring bollard with coiled rope**.

| File | Issues found and corrections | Final checks |
|---|---|---|
| AS03_BG_DISTANT_BANGKOK.png | Blended 32 edge columns for the repeat join, preserving geometry. | Opaque; skyline and Wat Arun-inspired prang remain visible. |
| AS03_BG_MID_BANGKOK.png | First candidate was too finely rendered and lacked lower coverage. Focused regeneration corrected style and coverage; cleared faint alpha and normalized existing lower masonry/water opacity. | Anchor row 621; repeat and combined composition pass. |
| AS03_GROUND_BANGKOK.png | Used the cleaner original after rejecting an inferior revision. Removed one surface-fringe row, cleared empty sky, normalized existing terrain, shifted the cap down 5 pixels and trimmed 5 surplus bottom rows. | Exact opaque surface at row 393; transparent above; level repeat join. |
| AS03_OBJECT_ATLAS.png | Cleared faint alpha; uniformly scaled both objects to 91% and aligned their actual feet/plate contacts. | Two 1086 × 724 cells; contacts at (543, 620); complete silhouettes. |
| AS03_HAZARD_SWIFT.png | Cleared faint alpha; normalized the one-column-short canvas through cell placement; uniformly scaled all poses to 88% and registered the torso/head. | Four 543 × 724 cells; body anchors (271, 362); distinct poses, stable body, no clipped wings. |

Landscape review used the canonical 960 × 540 view, base scale 960/2172, layer multipliers 1.25/1/1, parallax 0/0.20/1, zero offsets and surface y=410. FAR-alone and combined views were compared at world positions 0, 5400, 10800, 2400 and 4800. The main prang, satellite spires and skyline remain readable throughout.

Sprite verification inspected semantic contacts and all four swift poses, with a loop preview. Minimum flying-frame outer gutter is 35 pixels. Original candidates and correction records were retained. The surface-fringe cleanup is recorded separately from the helper's routine faint-alpha operations.

Packaging checks: exactly five canonical PNG members, matching reviewed SHA-256 hashes, valid PNG decoding and ZIP integrity. No metadata or test images are included in the ZIP.

Brief references: [Wat Arun architecture](https://en.wikipedia.org/wiki/Wat_Arun), [Thailand bird checklist](https://avibase.bsc-eoc.org/checklist.jsp?region=TH), [House swift appearance](https://en.wikipedia.org/wiki/House_swift).

User artwork acceptance and live gameplay calibration remain pending. No Git publication or Workbench integration was performed.

**Workbench handoff:** Import these five PNGs for AS03. Prepare the metadata, starting settings and Workbench import, then continue calibration.
