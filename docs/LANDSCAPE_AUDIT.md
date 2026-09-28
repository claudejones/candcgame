# 27-Landscape Audit

Audit date: 2026-09-16
Source: GitHub Actions run 35131578854, `Landscape technical audit`.
Contract: `docs/WORLD_RENDERING_SPEC.md`.
Status: TECHNICAL EVIDENCE / HISTORICAL DISPOSITION LABELS. The later accepted production decision is to regenerate all 27 layers as the standardized-contract validation batch. KEEP means reusable visual/content evidence, not exemption from Phase 8 regeneration.

## Important scope
This is the completed **technical/geometry audit** of all 27 current FAR/MID/GROUND PNGs. It measures source dimensions, alpha bounds, transparency, and coverage at key source rows.

The automated measurements are objective evidence. The original KEEP / REPAIR / REGENERATE labels recorded the files' technical condition before the complete standardization decision. A file is not rejected merely because a particular legacy source row is transparent; the production logical contract and the coordinated FAR+MID+GROUND stage composition remain authoritative.

Classification meanings:
- **KEEP** — current source has no technical evidence requiring artwork alteration; preserve as an approved visual reference and verify its composition evidence in the production renderer.
- **REPAIR** — artwork is fundamentally usable, but technical evidence and/or established LAB25Q QA evidence shows coverage/geometry work is required before production use.
- **REGENERATE** — artwork is structurally unsuitable enough that replacement would have been preferable to repair based on the technical audit alone. No current file reached that severity threshold; the later all-layer regeneration decision instead addresses cross-stage standardization.

## Executive result
- KEEP: **21**
- REPAIR: **6**
- REGENERATE: **0**

All nine FAR layers are fully opaque across their complete source canvases and provide a valid visual foundation. The repair set is concentrated in Europe plus the known NA02 composition issue.

## Classification matrix

| Stage | FAR | MID | GROUND | Stage disposition |
|---|---|---|---|---|
| NA01 Desert | KEEP | KEEP | KEEP | KEEP / visual verification |
| NA02 Pines/Stream | KEEP | REPAIR | REPAIR | REPAIR composition |
| NA03 City | KEEP | KEEP | KEEP | KEEP / visual verification |
| SA01 Amazon | KEEP | KEEP | KEEP | KEEP / visual verification |
| SA02 Andes | KEEP | KEEP | KEEP | KEEP / visual verification |
| SA03 Rio | KEEP | KEEP | KEEP | KEEP / visual verification |
| EU01 Greece | KEEP | REPAIR | REPAIR | REPAIR composition |
| EU02 Paris | KEEP | REPAIR | REPAIR | REPAIR composition |
| EU03 Barcelona | KEEP | KEEP | KEEP | KEEP, visual verification required |

## Asset-level results

### North America
- `NA01_BG_DISTANT_MESAS.png` — **KEEP**. 2172x724, fully opaque FAR.
- `NA01_BG_MID_DESERT.png` — **KEEP**. Intentional alpha; content reaches through source Y663 and is fully covered at Y621. No technical evidence by itself requires art alteration.
- `NA01_GROUND_DESERT.png` — **KEEP**. Terrain content occupies Y118-614; strong Y393 coverage. Validate bottom coverage in production composition rather than forcing the legacy Y621 row.

- `NA02_BG_DISTANT_MOUNTAINS.png` — **KEEP**. 2171x724, fully opaque FAR.
- `NA02_BG_MID_PINES.png` — **REPAIR**. Content Y77-677 with only 37.94% row coverage at Y393. The source is usable, but this combines with established LAB25Q QA evidence that NA02 required significant vertical adjustment after synthetic backing removal. Repair should increase useful independent MID coverage/overlap without relying on GROUND displacement.
- `NA02_GROUND_TRAIL.png` — **REPAIR**. Content starts Y186 and extends to bottom, but bottom-row coverage is only 0.97%. Established QA showed this stage needed significant Y correction. Preserve the visual terrain; repair depth/edge coverage rather than regenerating by default.

- `NA03_BG_DISTANT_NYC.png` — **KEEP**. 2172x724, fully opaque FAR.
- `NA03_BG_MID_CITY.png` — **KEEP**. Broad content Y9-685 and 93.42% coverage at Y393. Transparency at Y621 is not by itself a failure because source-row 621 is legacy implementation geometry, not the production contract.
- `NA03_GROUND_CITY.png` — **KEEP**. Ground begins Y319 with full row coverage at Y393 and content through Y699. Verify natural production baseline/depth visually.

### South America
- `SA01_BG_DISTANT_AMAZON.png` — **KEEP**. Fully opaque FAR.
- `SA01_BG_MID_AMAZON.png` — **KEEP**. Exceptionally broad MID coverage: content spans full height, 85.67% at Y393 and 100% at Y621/bottom. Consistent with prior QA observation that SA01 composition worked without compensating backing.
- `SA01_GROUND_AMAZON.png` — **KEEP**. Content Y114-bottom, 95.9% at Y393 and 100% at Y621; strong depth coverage.

- `SA02_BG_DISTANT_ANDES.png` — **KEEP**. Fully opaque FAR.
- `SA02_BG_MID_ANDES.png` — **KEEP**. Intentional transparent MID, content Y113-706. Row393 coverage 52.62%. Prior integration/ground seam corrections were already completed and the stage subsequently held calibration; no current evidence requires another art change.
- `SA02_GROUND_ANDES.png` — **KEEP**. Content Y174-bottom with 82.27% row393 coverage. Bottom row is mostly transparent, but production acceptance depends on actual calibrated terrain depth, not opaque coverage at the physical file edge.

- `SA03_BG_DISTANT_RIO.png` — **KEEP**. 2079x756, fully opaque FAR.
- `SA03_BG_MID_RIO.png` — **KEEP**. Content Y33-bottom; 58.87% Y393 and 100% Y621. Strong vertical reach.
- `SA03_GROUND_RIO.png` — **KEEP**. Content Y118-663 and full Y621 coverage. The zero at Y393 reflects where this particular source terrain is authored, not automatic failure; SA03 was previously calibrated successfully.

### Europe
- `EU01_BG_DISTANT_GREECE.png` — **KEEP**. 2048x682, fully opaque FAR.
- `EU01_BG_MID_GREECE.png` — **REPAIR**. Content Y35-bottom with substantial transparency. Technical data alone is not fatal, but established LAB25Q QA exposed transparent window/arch regions and insufficient coordinated vertical ownership. Preserve the artwork; repair transparency/coverage where the FAR reveal is unintended and increase usable overlap.
- `EU01_GROUND_GREECE.png` — **REPAIR**. Content ends at Y533; no coverage at source bottom or Y621. This matches observed insufficient bottom ground coverage. Extend terrain depth while preserving approved surface art.

- `EU02_BG_DISTANT_PARIS.png` — **KEEP**. 2048x682, fully opaque FAR.
- `EU02_BG_MID_PARIS.png` — **REPAIR**. Content Y17-620 and no coverage at Y621/bottom. Established QA identified insufficient MID/ground composition room. Preserve the Paris art but extend/repair useful vertical ownership and overlap.
- `EU02_GROUND_PARIS.png` — **REPAIR**. Content Y13-661 but no bottom coverage and only 53.81% at Y393. This aligns with the observed ground-too-short/void problem. Extend dependable ground depth rather than shifting the entire layer unnaturally upward.

- `EU03_BG_DISTANT_BARCELONA.png` — **KEEP**. Fully opaque FAR.
- `EU03_BG_MID_BARCELONA.png` — **KEEP**. 2172x724, content Y53-677, 70.67% at Y393 and 100% at Y621. Previous MID adjustment aligned reasonably; no technical reason to alter it now.
- `EU03_GROUND_BARCELONA.png` — **KEEP**. Content Y123-612 and 100% at Y393. Bottom/Y621 transparency must be validated against the production baseline, but unlike EU01/EU02 there is no established stage QA evidence of an unresolved ground-coverage failure.

## How Phase 8 uses the audit
1. All 27 layers remain in the accepted regeneration validation batch.
2. The nine technically sound FAR layers are strong visual references, not geometry exemptions.
3. The six REPAIR labels identify the most severe current coverage failures: NA02 MID + GROUND, EU01 MID + GROUND and EU02 MID + GROUND.
4. KEEP layers retain their approved visual identity while being regenerated to the standard authored geometry.
5. The measurements provide baseline evidence for canvas, alpha, coverage, anchor and seam QA.
6. Regeneration standardizes geometry and layer responsibility; it does not authorize stylistic redesign.

## Required next gate
Use these measurements and classifications when writing regeneration briefs. Regenerate one complete stage first under the individual FAR/MID/GROUND approval gates, validate it in the canonical 960x540 renderer with `GROUND_SURFACE_Y=410`, transparent backing, layer-isolation controls and explicit overscan visualization, and refine the contract if necessary. Then regenerate the other eight existing stage sets. Preserve approved visual identity throughout; do not carry legacy geometry forward merely because a layer was originally labeled KEEP.
