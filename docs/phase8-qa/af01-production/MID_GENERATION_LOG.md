# AF01 MID imagegen attempt log

- Run: `af01-20260919172919-679b96`
- Job: `AF01:MID`
- Status: incomplete; canonical output moved into staging, no live generation
- Immutable job: `/workspace/scratch/b1988fd1efd9/candcgame/tmp/af01/mid-job.json`
- Best exact transparent candidate: `tmp/af01/candidates/mid-attempt3-exact-rgba-red-fringe.png`
- Best exact clean intermediate: `tmp/af01/candidates/mid-attempt10-clean-opaque-exact.png`
- Generator limitation: every built-in transparency generation/extraction introduced saturated red alpha-boundary pixels visible over FAR. Code-based cleanup was not authorized.

## Attempt 1 — 35.9s — rejected (2171x724 RGBA, red alpha fringe)

```text
Use case: stylized-concept
Asset type: transparent middle-distance layer for a side-scrolling game
Primary request: Create AF01 MID: widely spaced flat-topped acacias, golden grass islands, and a few weathered rounded rock groups across an otherwise transparent canvas, plus one restrained giraffe browsing an acacia away from the playable route.
Input images: Image 1 is the exact existing-game MID transparency, crisp pixel-art, source-scale, and authored-baseline reference. Image 2 is the Serengeti vegetation/location reference. Image 3 is the giraffe anatomy and markings reference. Image 4 is the exact committed AF01 FAR continuity reference; match its light, palette, depth, and leave its central stacked granite kopje visible through MID openings.
Scene/backdrop: transparent background only. No sky color, no landscape fill, no checkerboard. The alpha openings will reveal FAR.
Subject: several separate, natural middle-distance scenery islands: open flat-topped acacias with slender branching trunks, tawny grass tufts, low golden grass shelves, and restrained rounded granite groups. Include exactly one full-bodied giraffe at middle distance, large enough to read as a large animal relative to an acacia, with its neck angled naturally as it browses foliage. The giraffe is static background wildlife and must not resemble a gameplay obstacle.
Style/medium: polished crisp existing-game pixel art, deliberate hard-edged pixel clusters, controlled detail and readable silhouettes, matching Image 1 and the committed FAR. No painterly blur, no antialiasing, no smooth 3D rendering.
Composition/framing: exact 2172 x 724 pixel canvas. Keep the upper area and broad gaps between islands genuinely transparent. Author the ground-contact bases and lower overlap around source Y=621, with enough grass/rock pixels around and below that row to overlap the future GROUND layer naturally. Keep the central region over the FAR kopje substantially open; frame rather than cover the kopje. Put the giraffe and its browsing acacia clearly off-center, away from the repeat joins. Distribute smaller islands asymmetrically across left and right thirds. Keep both horizontal edges sparse and compatible for repeating, with no subject cut by an edge.
Lighting/mood: clear warm daylight consistent with FAR.
Color palette: golden ochre grasses, muted olive and deep green acacia foliage, warm gray-brown rounded rocks, giraffe tan with dark brown patches; cool purple-brown shadows consistent with FAR.
Constraints: exact 2172 x 724 dimensions; 8-bit RGBA PNG with genuine alpha transparency; transparent pixels between and above all scenery islands; crisp alpha edges; exactly one giraffe; no people; no other animals; no hazards; no clouds; no sky/background fill; no HUD; no text; no labels; no watermark; no checkerboard. Preserve useful open sightlines and FAR kopje visibility.
Avoid: continuous opaque backdrop, black or white matte, foreground-scale vegetation, dense forest, giraffe miniaturization, giraffe as a giant foreground character, American-desert plants, angular mesas, repeated cloned trees, edge-cut landmarks.
```

## Attempt 2 — 41.0s — rejected (2171x724 RGBA, red fringe remained)

```text
Use case: precise-object-edit
Asset type: transparent middle-distance layer for a side-scrolling game
Primary request: Preserve the attached AF01 Serengeti MID artwork, transparent island layout, landmark positions, giraffe, acacias, rocks, grass, palette, and composition, but correct the output canvas to exactly 2172 pixels wide by 724 pixels high and clean the alpha edges.
Input images: Image 1 is the edit target. Keep all approved art and open transparent gaps, including the broad central opening that preserves the FAR kopje.
Constraints: output must be an exact 2172 x 724 pixel 8-bit RGBA PNG with genuine alpha transparency; add the missing single pixel column at the far right using transparent or adjacent seam-compatible edge content; do not scale, crop, stretch, shift, or substantially repaint the scene. Remove isolated bright red fringe pixels around foliage, rocks, giraffe, and grass; alpha edges must be crisp and use only natural scene colors with no colored matte. Preserve exactly one browsing giraffe off-center, widely spaced flat-topped acacias, golden grass islands, rounded rocks, and lower overlap around source Y=621. Keep the upper field and gaps transparent. No background fill, no sky, no clouds, no black or white matte, no checkerboard, no text, no watermark.
```

## Attempt 3 — 29.1s — rejected visually (2172x724 RGBA; structural pass, red fringe)

```text
Use case: precise-object-edit
Asset type: transparent 2172x724 game landscape layer
Primary request: Output this same AF01 MID artwork on an EXACT 2172-pixel-wide by 724-pixel-high canvas. The current attached file is incorrectly 2171 pixels wide. Correct that one-pixel width defect inside the image generation output.
Constraints: REQUIRED PNG dimensions are exactly width 2172 and height 724. Preserve all scenery, transparency, giraffe, acacias, grass islands, rocks, open central gap, positions, scale, palette, and pixel-art style. Do not crop or rescale. Extend the far-right transparent canvas by exactly one pixel column to reach width 2172. Keep RGBA with genuine alpha. Remove any isolated bright-red halo/fringe pixels and keep natural-color crisp alpha edges. No background fill, no checkerboard, no text, no watermark.
```

## Attempt 4 — 39.1s — rejected (cloned/tiled composition and red fringe)

```text
Use case: precise-object-edit
Asset type: transparent 2172x724 game MID landscape layer
Primary request: Remove every saturated bright-red and pure-red mask/fringe artifact from the attached AF01 MID image, especially the red outline under the entire grass baseline, around bushes, rocks, tree canopies, trunks, and the giraffe.
Input images: Image 1 is the edit target. Preserve its scene, transparency, dimensions, composition, scale, giraffe, acacias, grass islands, rocks, central opening, and all object positions.
Required correction: inspect all visible object boundaries. Wherever there are bright saturated red pixels, replace them with the nearest appropriate natural pixel-art color from the adjacent golden grass, olive foliage, brown trunk, warm rock, giraffe, or make them fully transparent where they lie outside the object silhouette. There must be zero visible red halo or red matte when composited over a blue-sky/golden-plains background.
Constraints: output exactly 2172 x 724 pixels, 8-bit RGBA PNG with genuine alpha; do not crop, resize, shift, or redesign anything; preserve transparent upper field and gaps; preserve lower overlap around Y=621; crisp hard pixel-art edges; natural palette only. No red outline, no colored matte, no background fill, no checkerboard, no text, no watermark.
```

## Attempt 5 — 33.1s — rejected (2171x724 RGBA, red fringe)

```text
Use case: stylized-concept
Asset type: transparent side-scrolling game MID landscape layer
Primary request: Generate a fresh AF01 Serengeti MID layer with a genuinely transparent background: a small number of distinct, widely spaced flat-topped acacia and golden-grass scenery islands, a few weathered rounded granite rocks, and exactly one restrained giraffe browsing one acacia at middle distance.
Input images: Image 1 defines the crisp existing-game MID pixel-art and true-alpha structure. Image 2 defines Serengeti vegetation and spacing. Image 3 defines giraffe anatomy and markings. Image 4 is the committed FAR; match it and preserve its central kopje visibility.
Composition: exact 2172 x 724 canvas. Place one large acacia-and-rock island in the left third. Place the single giraffe browsing a medium acacia in the right third. Add only two or three smaller distinct grass/rock/acacia islands. Leave a broad transparent central opening over the FAR kopje and generous transparent gaps elsewhere. Keep both outer edges sparse and repeat-compatible; no cut-off landmarks. All island bases cluster around source Y=621 with authored golden-grass overlap slightly above and below that row.
Style: crisp richly shaded game pixel art with hard pixel clusters and natural dark olive, deep brown, and purple-brown silhouette edges.
Palette: golden ochre grasses, muted olive/deep green leaves, warm gray-brown rock, tan/dark-brown giraffe, matching FAR lighting.
Strict alpha and color constraints: exact 2172 x 724, 8-bit RGBA, genuine transparency in the entire upper field and gaps. Every visible boundary pixel must be a natural grass, foliage, trunk, rock, or giraffe color. Absolutely no bright red, pure red, neon red, magenta, or colored key/mask fringe anywhere. No red outline. No matte. No background fill, sky, checkerboard, people, other animals, hazards, text, labels, or watermark.
Avoid: cloned or repeating scenery groups within the canvas, dense continuous hedge, oversized foreground trees, miniature giraffe, giant foreground giraffe, covering the central FAR kopje, American desert flora/geology.
```

## Attempt 6 — 28.2s — rejected (2170x725 RGBA, red fringe)

```text
Use case: precise-object-edit
Asset type: transparent game landscape
Edit only the attached image. Preserve the complete scene exactly once: same single 2172x724-wide composition, same five distinct scenery groups, same one giraffe, same tree/rock/grass positions, same open central gaps, same scale. DO NOT tile, mirror, clone, repeat, duplicate, rearrange, crop, or rescale any object.
Make only these two corrections:
1. Canvas must be exactly 2172 pixels wide and 724 pixels high by adding one transparent pixel column at far right.
2. Replace every saturated scarlet/red/magenta fringe pixel along alpha boundaries with either a nearby natural dark brown/olive/golden color appropriate to the neighboring object, or full transparency when outside the silhouette. No visible red halo may remain anywhere.
Keep true RGBA transparency, crisp hard pixel edges, natural palette, and all existing transparent gaps. No background fill, no checkerboard, no text, no watermark.
```

## Attempt 7 — 32.3s — rejected (2171x724 RGBA, ignored requested cyan matte; red fringe)

```text
Use case: stylized-concept
Asset type: intermediate pixel-art MID layer for later background extraction
Primary request: Create AF01 Serengeti MID scenery as a small number of separate, widely spaced flat-topped acacia and golden-grass islands, weathered rounded granite rocks, and exactly one giraffe browsing an acacia at middle distance.
Input images: Image 1 defines crisp existing-game pixel-art structure and source scale. Image 2 defines Serengeti vegetation. Image 3 defines giraffe anatomy. Image 4 is committed FAR for palette, light, and keeping the central kopje visible.
Composition: exact 2172 x 724. Large distinct acacia/rock island in left third; exactly one giraffe browsing a distinct medium acacia in right third; two smaller grass/rock/acacia islands; broad empty central opening and generous gaps. Bases around source Y=621. Sparse repeat-compatible edges.
Temporary backdrop: fill every area outside the scenery islands with one perfectly uniform flat pale cyan color #C8F0F0, with no texture, gradient, shadow, noise, or scenery in the backdrop. This cyan is only for a later imagegen background-extraction pass.
Style: crisp richly shaded pixel art with hard edges and natural dark brown/olive outlines.
Strict color constraints: no red, scarlet, magenta, neon, or warm-red outline pixels anywhere in the artwork. Natural palette only: golden ochre, olive/deep green, brown, warm gray granite, tan/dark brown giraffe.
Constraints: exact 2172 x 724 dimensions; one continuous canvas; exactly one giraffe; do not clone or repeat scenery inside the canvas; no sky scene, clouds, people, other animals, hazards, checkerboard, text, labels, or watermark.
```

## Attempt 8 — 35.6s — rejected (2170x725 RGBA, red fringe despite clean extra reference)

```text
Use case: stylized-concept
Asset type: transparent side-scrolling game MID landscape layer
Primary request: Create AF01 Serengeti MID: distinct widely spaced flat-topped acacia and golden-grass islands, restrained rounded granite rocks, and exactly one giraffe browsing an acacia at middle distance.
Input images: Image 1 is the immutable mapped MID source-size/transparency reference; use its crisp pixel clusters and island structure but DO NOT inherit its orange/red rock palette or red edge colors. Image 2 is an approved clean-alpha natural foliage/granite MID palette and boundary reference; specifically match its neutral dark olive/brown/gray boundary treatment. Image 3 is Serengeti vegetation reference. Image 4 is giraffe anatomy. Image 5 is committed FAR; match light/palette and preserve its central kopje.
Composition: exact 2172 x 724. One large acacia/rock group in left third; exactly one giraffe browsing a medium acacia in right third; only two or three smaller islands; broad transparent opening over central FAR kopje; generous transparent gaps; sparse repeat-compatible edges. Bases/grass overlap around source Y=621.
Style: crisp richly shaded game pixel art, natural dark brown and olive outlines, no antialiasing.
Strict color rule: no red, orange-red, scarlet, magenta, or neon edge pixels anywhere; no colored matte/halo. Rounded granite is warm gray/tan with purple-brown shadow, foliage olive/deep green, grass golden ochre.
Constraints: exact 2172 x 724, 8-bit RGBA with genuine transparency; upper field and all gaps transparent; exactly one giraffe; no cloned/repeated groups; no sky/background fill, checkerboard, people, other animals, hazards, clouds, HUD, text, labels, or watermark.
```

## Attempt 9 — 32.0s — rejected (2171x724 RGB; clean edge, but copied FAR kopje and continuous lower band)

```text
Use case: stylized-concept
Asset type: OPAQUE intermediate art sheet for later background removal
Create AF01 Serengeti MID scenery with distinct widely spaced flat-topped acacias, golden grass islands, rounded granite rocks, and exactly one giraffe browsing an acacia at middle distance. Match the four attached references for crisp pixel art, Serengeti identity, giraffe anatomy, and FAR palette/continuity. Preserve a broad central gap aligned over the FAR kopje. All bases sit around source Y=621.
CRITICAL INTERMEDIATE FORMAT: render on one perfectly solid pure white (#FFFFFF) background covering the entire 2172x724 canvas. The result must be fully opaque RGB with NO alpha channel and NO transparency. White must fill all upper and gap areas. Do not show black or checkerboard.
Artwork boundaries must use natural dark olive/brown/gray outlines only. Absolutely no red, scarlet, magenta, or neon fringe/outline pixels.
Composition: large group left third, giraffe browsing tree right third, two smaller distinct groups, sparse outer edges, no duplication or tiling inside the canvas.
Output exact 2172 x 724. No sky scene, clouds, people, other animals, hazards, text, labels, or watermark.
```

## Attempt 10 — 24.6s — best intermediate (2172x724 RGB, clean; needs background extraction)

```text
Use case: precise-object-edit
Asset type: opaque intermediate art sheet for later transparency extraction
Edit the attached white-background AF01 MID intermediate while preserving its crisp pixel-art style, palette, left large acacia/rock island, right giraffe/acacia island, giraffe anatomy, and warm lighting.
Required composition correction:
- Remove the entire central granite kopje/large rock formation and replace that area with the exact same solid pure-white #FFFFFF background.
- Break the continuous lower golden-grass strip into separate islands. Clear the broad central region between left and right major groups to pure white from top through bottom, except for at most one small isolated grass/rock tuft well away from the exact center.
- Leave generous pure-white gaps between every island so the FAR kopje will be visible later.
- Keep exactly one giraffe in the right third.
- Preserve sparse repeat-compatible outer edges and bases around source Y=621.
- Do not add or clone any subject.
- Remove all red/scarlet/magenta fringe pixels; use only natural dark brown/olive/golden edge colors.
Format: fully opaque RGB, exact 2172 x 724 canvas, pure-white uniform background with no alpha/transparency yet. No checkerboard, sky, clouds, people, other animals, hazards, text, or watermark.
```

## Attempt 11 — 24.2s — rejected (2172x724 RGBA, extraction reintroduced red fringe)

```text
Use case: background-extraction
Asset type: transparent AF01 MID game landscape layer
Primary request: Remove only the uniform pure-white background from the attached opaque intermediate and make those white areas genuinely transparent.
Preserve the pixel-art scenery exactly: same two large side islands, one tiny central grass/rock tuft, exactly one giraffe browsing the right acacia, all acacia branches and foliage, rocks, grass, positions, scale, natural colors, and broad central opening.
Output requirements: exact 2172 x 724 pixels; 8-bit RGBA PNG; white background becomes alpha 0; all scenery remains opaque with crisp hard pixel-art alpha edges; no white halo or matte; do not crop, resize, shift, repaint, clone, tile, or duplicate anything.
Color constraints: preserve natural olive, brown, gold, tan, and gray colors. Do not introduce red, scarlet, magenta, neon, black/white outlines, or any colored fringe.
No background fill, no checkerboard, no sky, no clouds, no text, no watermark.
```

## Attempt 12 — 22.6s — best structural intermediate (2172x724 RGB, clean continuous lower coverage)

```text
Use case: precise-object-edit
Asset type: opaque intermediate AF01 MID landscape for later deterministic background conversion
Edit the attached exact 2172x724 white-background image once.
Preserve exactly: the left acacia/rock group, the right acacia with exactly one browsing giraffe, the small supporting trees and rocks, all upper white sightline openings, the broad central upper window that preserves the FAR kopje, crisp pixel-art style, natural olive/brown/gold/gray palette, object positions and scale.
Required structural correction: add a continuous authored low golden savannah grass-and-earth base across the ENTIRE canvas width from approximately source Y=570 through source Y=724. There must be no white pixels anywhere below source Y=598. The base should have a level repeat-compatible top contour at the left and right edges, natural shallow grass tufts and subtle earth texture, and enough solid depth to the bottom to cover the runtime gap. Keep the base restrained and low so the central kopje remains visible through the open upper area above the grass line.
The left and right canvas edges must meet at the same base height and use compatible grass/earth colors for horizontal repetition.
Format constraints: exact 2172 x 724; fully opaque 8-bit RGB; uniform pure-white #FFFFFF only in the upper background/openings above the authored base; no alpha/transparency yet. No red, scarlet, magenta, neon fringe, colored matte, duplicated scenery, extra animals, people, hazards, sky, clouds, checkerboard, text, labels, or watermark.
```

- Attempt 12 path: `tmp/af01/candidates/mid-attempt12-best-opaque-structural.png`
- Attempt 12 SHA-256: `f5f0b48e1e0970b2da3342ce0f89ba7e417fbe13c2adf309dd09a4c1f3051877`
