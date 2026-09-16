# Universal World Geometry Analysis — 27 Landscape PNGs

Date: 2026-09-16
Source set: 9 FAR + 9 MID + 9 GROUND PNGs in `assets-original/current-generated/`
Measurement source: `tools/audit_landscapes.py`, GitHub Actions run 35148937178.

## Purpose
Derive one scalable production geometry from the existing approved landscape family. Stage-specific runtime Y offsets are not the target. Assets that do not conform should be repaired to the common contract.

## What was measured
For every PNG: source dimensions; first/last nontransparent row; transparency/opacity; horizontal alpha coverage by row; first sustained 50/75/90% coverage; longest sustained 50/75/90% bands; normalized row positions so differing source sizes can be compared.

## Findings

### FAR
All nine FAR files are 100% opaque from top to bottom. Their alpha geometry is effectively identical. FAR can use one global placement. The dominant source family is approximately 3:1 and renders to about 160 logical px when width-fit to a 480 logical-pixel viewer.

**Disposition:** global FAR drawY = 0, width-fit scale = 1.00. No FAR artwork repair is indicated by alpha geometry.

### MID
MID is the largest source of inconsistency.

Normalized first sustained 50% coverage ranges from 0.3660 to 0.6685 (median 0.5055). First sustained 75% coverage ranges 0.4240–0.7141 (median 0.5898). First sustained 90% coverage ranges 0.4890–0.7566 (median 0.6133).

Despite that variation, normalized row 0.75 is the only tested lower-band row where every MID has at least 75% horizontal coverage: minimum 89.1%, median 100%, maximum 100%. This means the current MIDs share a dependable dense lower band around 75% of source height, but their upper starts and lower endings are not standardized.

**Production implication:** standardize MID canvas/coverage rather than retaining stage-specific MID Y. On a canonical 2172×724 canvas width-fit to 480, a global MID drawY around 45 places the source-canvas bottom at logical Y205. MIDs should be repaired so their intended lower scenery/overlap reliably owns the lower part of that canvas and does not end early.

### GROUND
GROUND has much tighter functional alignment than its raw transparent bounds suggest.

Normalized first sustained 50% coverage: 0.4655–0.5718, median 0.5176.
Normalized first sustained 75% coverage: 0.4834–0.5909, median 0.5367.
Normalized first sustained 90% coverage: 0.4903–0.6041, median 0.5539.

At normalized source rows 0.60, 0.65, 0.70 and 0.75, every current GROUND has at least 75% horizontal coverage. At 0.65 and 0.70 every GROUND is 100% covered across the width. This is strong evidence of a common dense terrain band.

The median 90%-coverage onset is ~0.554 of source height. On a 724px canonical source this is ~401px. This is notably close to the historical ~393 source-row calibration and explains why that old value often appeared to work, while also showing why it was not exact for every current PNG.

**Production implication:** define a canonical GROUND running-surface/source anchor near source Y400 on a 2172×724 canvas. At width-fit scale (480/2172), mapping source Y400 to logical Y205 gives drawY ≈116.6 and image bottom ≈276.6. The world can clip before that; the extra source depth provides safe terrain overscan.

## Source standardization recommendation
The dominant current source format is 2172×724. Differences such as 2048×682 and 2079×756 change rendered height/aspect even when width-fit, undermining plug-and-play behavior.

For future production and any repaired landscape assets, use:
- Landscape source canvas: **2172×724**
- Render: width-fit to **480 logical px**
- Render multiplier: **1.00**
- Resulting source-to-logical scale: ~0.2210
- Rendered landscape image height: **160 logical px**

Existing approved art should be preserved and extended/repositioned onto the canonical canvas when repair is required; do not stylistically regenerate by default.

## Candidate universal viewer geometry for next harness
This is the geometry to TEST next with the real LAB25Q HUD/player/control implementation; it is not yet a final lock.

- Total logical viewer: **480×270**
- FAR: **drawY 0**, scale 1.00
- MID: **drawY 45**, scale 1.00
- Universal player/ground baseline: **Y205**
- Canonical GROUND source surface: **Y400** on 2172×724
- GROUND drawY: **~116.6**, scale 1.00
- Initial control zone: **40px**, Y230–270
- World region above controls: **230px**
- Visible terrain depth below baseline before controls: **25px**
- GROUND source image extends below viewer to ~Y276.6, providing overscan while world rendering is clipped at the control-zone boundary.
- CLOUD: overlay; use LAB25Q cloud behavior/asset with adjustable QA Y until global cloud band is visually confirmed.
- HUD: overlay; reuse actual LAB25Q HUD implementation and safe area rather than a substitute.
- PLAYER: reuse actual LAB25Q character scale/foot anchor; feet target the universal Y205 baseline.

## Why 480×270 remains viable
The analysis does **not** currently justify changing the total canvas. Once a 40px bottom control zone is reserved, the world region is 480×230. The proposed Y205 running surface leaves 25 logical pixels of visible terrain before controls, while the standardized ground asset itself continues below the clipped world region. This is internally coherent and should be tested with the real LAB25Q experience before changing viewer dimensions.

## Current asset-family deltas
- FAR: structurally unified already.
- MID: significant vertical-content variation; this is the main artwork-standardization problem.
- GROUND: common dense terrain band exists, but surface onset varies by ~11% of source height; standardize source surface around Y400 and repair/reposition outliers.
- Previously identified trouble stages NA02, EU01 and EU02 remain high-priority candidates, but all MID/GROUND files should now be evaluated against the universal source contract rather than legacy per-stage offsets.

## Next harness gate
Rebuild the world-composition harness as a stripped LAB25Q gameplay shell using the candidate universal geometry above. It must use the actual HUD code/assets, actual player grounding/scale, actual Slide/Pause/Jump control layout, cloud layer, and clipping between world and control zone. No per-stage FAR/MID/GROUND runtime Y configuration should be required in the target mode. Add diagnostic toggles separately from production geometry.

Only after all nine current stages are rendered through that one geometry should individual assets be marked PASS / REPAIR / REGENERATE against the universal contract.
