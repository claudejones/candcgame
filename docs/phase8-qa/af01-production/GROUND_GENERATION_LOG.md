# AF01 GROUND imagegen attempt log

- Run: `af01-20260919172919-679b96`
- Job: `AF01:GROUND`
- Status: incomplete source; maximum two attempts used; no live generation
- Selected source: `tmp/af01/candidates/ground-attempt2-opaque.png`
- Selected SHA-256: `1e4bc051e26b3e92e2b989b55e837643cfd1c4334ee19c456b63a6304f3e3740`
- Selected format: 2172x724, 8-bit RGB, non-interlaced
- Measurement: row Y=393 has 1937/2172 non-white pixels (89.1805%); first fully non-white row is Y=408; bottom row is 2172/2172 non-white. Anchor remains 15 source pixels too low and requires authorized deterministic anchor/alpha cleanup.

## Attempt 1 — 31.2s — rejected for anchor (2172x724 RGB)

Measurement: Y=393 coverage 1926/2172 (88.674%); first fully authored row Y=408; bottom fully authored.

```text
Use case: stylized-concept
Asset type: opaque intermediate source for AF01 GROUND game landscape layer
Primary request: Create a level compacted ochre Serengeti trail with sparse dry grass at its upper edge and deep layered earth below, in crisp richly shaded existing-game pixel art.
Input images: Image 1 is the immutable mapped GROUND reference for exact layer structure, scale, level surface, deep solid terrain, and crisp pixel-art language; do not inherit its saturated red desert palette or cacti. Image 2 is the Serengeti location/color reference. Image 3 is the selected AF01 MID source for continuity of golden grass, olive foliage, warm earth, lighting, and scale. Image 4 is committed AF01 FAR for overall palette.
Canvas and anchor: exact 2172 x 724 pixels. Entire area above source Y=393 must be one uniform pure-white #FFFFFF temporary background. The playable trail surface begins at EXACT source row Y=393 and remains perfectly level and uninterrupted from the left edge through the right edge. No humps, pits, gaps, slopes, ledges, or protruding obstacles.
Ground structure: a narrow compacted ochre-gold trail surface along Y=393, sparse low dry-grass fringe that never rises enough to read as an obstacle, then solid deep earth from beneath the trail continuously through source Y=724. Show restrained horizontal soil strata, embedded small rounded stones, roots, and warm brown/ochre shading. The entire bottom row must be solid terrain.
Repeat: left and right edges must meet at exactly the same surface height, trail thickness, soil bands, and compatible colors for seamless horizontal repetition. Avoid large stones or unique features at either join.
Style: polished crisp pixel art, hard pixel clusters, limited natural palette, consistent with MID/FAR.
Format: fully opaque 8-bit RGB intermediate, exact 2172 x 724. Pure white only above Y=393; no transparency yet.
Constraints: no baked obstacles, termite mounds, animals, people, trees, bushes, hazards, architecture, sky, clouds, HUD, text, labels, watermark, checkerboard, red/scarlet/magenta/neon fringe, or colored matte.
```

## Attempt 2 — 24.1s — selected source, anchor still incomplete (2172x724 RGB)

Measurement: Y=393 coverage 1937/2172 (89.1805%); first fully authored row Y=408; bottom fully authored.

```text
Use case: precise-object-edit
Asset type: opaque intermediate AF01 GROUND landscape source
Edit the attached exact-size ground image once. Preserve its crisp pixel-art style, ochre-gold compacted trail, sparse low dry grass, layered earth, embedded rounded stones and roots, natural palette, and repeat-compatible texture.
Required anchor correction:
- The playable top surface must be a perfectly level, continuous horizontal trail beginning at EXACT source row Y=393 across ALL 2172 columns.
- EVERY pixel in row Y=393 must be authored non-white trail/grass/earth.
- EVERY pixel in every row from Y=393 through Y=723 must be authored non-white solid terrain. No white gaps, holes, transparency, pits, cutouts, slopes, or breaks anywhere in that rectangular lower region.
- Keep the area from Y=0 through Y=392 pure uniform white except sparse decorative grass tips may rise slightly above Y=393; those tips must remain low and non-obstructive.
- Match left and right edges at identical surface height, trail thickness, soil bands, and compatible colors.
Do not add obstacles or large protruding objects. Do not crop, resize, shift the canvas, or change dimensions.
Format: exact 2172 x 724, fully opaque 8-bit RGB intermediate. No alpha yet. No red/scarlet/magenta fringe, animals, people, hazards, trees, bushes, architecture, sky, clouds, checkerboard, text, labels, or watermark.
```
