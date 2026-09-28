# Exact pixel finishing

Run with Python 3 and Pillow. This helper moves pixels by whole pixels, applies recorded bottom-margin trims and alpha corrections, optionally repeats missing horizontal columns, and supports uniform nearest-neighbor sprite scaling. It never guesses a semantic anchor or paints new scenery. Original files are read-only inputs. Failed files remain blocked; successful files are not rerun.

Inspect the originals:

`python scripts/finish_pixels.py inspect /absolute/path/image.png`

Create one compact JSON plan containing the stage and an `images` array. Each image entry has:

- `kind`: FAR, MID, GROUND, OBJECT_ATLAS or FLYING.
- `source`: absolute original PNG path.
- `source_sha256`: hash from inspection, protecting against changed inputs.
- `filename`: canonical PNG basename.
- `pieces`: one region for a landscape, two for objects, four for flying. Regions use source coordinates `[left,top,right,bottom]`, right/bottom exclusive. Include every nontransparent pixel exactly once; do not hide clipping by narrowing regions.
- Each piece except FAR has `anchor`: integer `[x,y]` relative to its source region, and `anchor_evidence`: the specific visible feature used and how its position was measured. Landscape anchors use x=0 and the identified baseline row. Object anchors identify actual ground contact, not a shadow. Flying anchors identify the same torso feature in all four frames, not each silhouette's bounding-box center.
- `horizontal_extension`: optionally `wrap` for a landscape missing columns, only after inspecting the intended repeat join. This repeats original edge pixels; it does not certify a seamless join.

Example single ground entry inside `images`:

```json
{
  "kind": "GROUND",
  "source": "/absolute/path/ground.png",
  "source_sha256": "USE_THE_ACTUAL_INSPECTED_HASH",
  "filename": "AF03_GROUND_MARRAKESH.png",
  "pieces": [{"region": [0,0,2172,724], "anchor": [0,393], "anchor_evidence": "Visible flat paving top at row393, confirmed with alpha row scan."}]
}
```

Run:

`python scripts/finish_pixels.py apply /absolute/path/plan.json --output-dir /absolute/path/new-finished-directory`

Exit0 means all requested geometry operations passed; exit2 means some files are blocked. Read `pixel-results.json`. `production_ready` intentionally stays false because software measurements cannot certify semantic anchors, repeat seams, artwork quality or an animation cycle.

Inspect the resulting landscapes side-by-side across a repeat join and together using the established rendering scales/anchors with visual offsets0. Preview atlas frames as an animation. Record visual findings separately; never replace a failure with an unchecked pass. Reject body drift even when mathematical anchor placement passes.

## Planned corrections

The user authorized the following as normal finishing, with originals preserved and every operation recorded. Set `correction_reason` on a job with any corrections or scaling. No extra approval is needed for these measured routine operations; broader changes remain separate.

- `corrections.trim_bottom`: integer0..36, only MID/GROUND. Remove surplus lower terrain/masonry margin; inspect it first. Never crop named features or objects. This permits the actual measured trim, not an automatic36-row cut.
- `corrections.clear_regions`: array of `{region:[l,t,r,b], max_alpha:22}`. Only visually confirmed empty space; the script rejects a region containing stronger alpha. Allowed maximum32.
- `corrections.clear_below_alpha`: optional0..32. Remove very faint alpha residue across a source when inspection establishes it is unwanted, not intentional translucency. Prefer the smallest effective value (AF03 flying used8).
- `corrections.opaque_regions`: array of `{region:[l,t,r,b], min_alpha:250}`. Normalize existing terrain to alpha255. The script rejects actual holes or values below the threshold (which must be at least128); it does not fabricate missing terrain.
- `scale`: one job-level number0.8..1 for sprites only. Apply exactly the same scale in both dimensions and across the complete flying cycle, around the supplied source anchors. Nearest-neighbor sampling preserves pixel-art edges; rounding changes individual pixels, so visually review all frames. Per-piece scale is prohibited. Prefer the largest common scale that provides gutters; do not shrink automatically if translation alone works.

Numbers outside these modest bounds, cropping a subject, synthetic terrain extension, or nonuniform scaling require a separately explained decision. Keep correction regions in original source coordinates. The script logs altered regions/counts and retains exact hashes.

## ZIP delivery

After source geometry and visual review, write a small review JSON with `anchors`, `repeat_edges`, `combined_landscape`, and `animation` each set to `pass` only for checks actually performed. Include `hashes` mapping each image kind to its reviewed SHA256. Record notes including any remaining visual limitations. `combined_landscape: pass` requires the composition review in SKILL.md: compare FAR alone with the combined scene at the start, middle, end and any obvious worst overlap/repeat position using canonical scales, offsets and parallax. Record positions and recognizable distant features still visible. A hidden skyline with only sky visible fails even when the seams and anchors pass. The pixel script cannot judge composition or repair it by erasing opaque scenery; use a focused artistic edit for that defect.

`python scripts/finish_pixels.py package /absolute/path/pixel-results.json --review /absolute/path/review.json --zip /absolute/path/STAGE_Workbench_PNGs.zip`

Packaging requires five geometry passes, five matching current/reviewed hashes, and recorded visual passes. It creates exactly five PNG members with canonical basenames, without metadata or test files. It does not overwrite an existing ZIP. Verify the archive opens and matches the saved images. Save the ZIP and review report for the user. The geometry report's `production_ready:false` means software alone does not certify the visuals; the separate visual review completes asset handoff readiness. User artwork acceptance and gameplay calibration remain pending.

Deliver the five corrected PNGs and stage ID when geometry and visual checks pass. If blocked, preserve all results and report only the outstanding correction. Workbench prepares metadata and calibration.
