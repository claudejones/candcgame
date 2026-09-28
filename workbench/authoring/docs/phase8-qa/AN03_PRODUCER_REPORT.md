# AN03 — Research outpost check report

Five final PNGs, each **2172 × 724**. FAR opaque; all other assets genuine RGBA. ZIP contains exactly the five canonical PNGs.

| File | Corrections and verified result |
|---|---|
| AN03_BG_DISTANT_RESEARCH_OUTPOST.png | Angular coastal nunatak, ice plateau and sea. Opaque; repeat reviewed; identifying peak remains visible across all sampled positions. |
| AN03_BG_MID_RESEARCH_OUTPOST.png | One focused edit repaired a snowbank step at the repeat join. Fictional raised huts, warm windows, antennas and windsock retained. Faint-alpha cleanup and existing lower snow opacity normalization; anchor621. |
| AN03_GROUND_RESEARCH_OUTPOST.png | Snow cap388 translated+5 to393; five surplus bottom rows trimmed. Faint alpha≤11 cleared; existing snow/ice/gravel opacity normalized. Above393 transparent and393–723 opaque; level repeat passes. |
| AN03_OBJECT_ATLAS.png | Approved survey instrument on tripod and equipment sled. Source1827×861 split at transparent gap; common0.80 scale preserves proportions and complete silhouettes. Supporting foot/runner contacts mapped to local(543,620) in two1086×724 cells. Minimum gutter49px. |
| AN03_HAZARD_SNOW_PETREL.png | Source2170×725 split at transparent gaps; common0.80 scale and torso registration. Four543×724 cells, torso anchor(271,362), minimum gutter36px. Right-facing raised, descending, lowered and rising wing poses are distinct; head/body alignment visually reviewed. White plumage, short black bill and dark outline remain readable. |

Compared FAR alone with FAR+MID before generating remaining assets, then reviewed the complete landscape at worldX **0,5400,10800,2400,4800**. Viewport960×540; scale multipliers1.25/1/1; visual offsets0; parallax0/0.20/1; surface410; source anchorsMID621/GROUND393. The nunatak summit, slopes and coastal ice remain recognizable throughout. Huts stand on their own background snow terrace behind the quiet running lane. No gap at the FAR/GROUND transition. Repeat joins and the four-frame flying cycle reviewed.

**Gameplay readability is provisional:** a labeled124px character guide and actual stage sprites at illustrative scales(object0.20, bird0.27) were used. Runtime character artwork and calibrated AN03 settings were unavailable. Workbench should validate final hazard sizes and collision bounds. No runtime settings changed.

Species reference description: [Australian Antarctic Program — Snow petrel](https://www.antarctica.gov.au/about-antarctica/animals/flying-birds/petrels-and-shearwaters/snow-petrel/). Station is fictional, with general coastal-station context from [Casey station](https://www.antarctica.gov.au/antarctic-operations/stations-and-field-locations/casey/), not a literal depiction. No external reference photographs were attached. Prior accepted ground artwork was used as a geometry/style reference. Originals and the rejected MID are retained.

Final hashes match reviewed files. Archive membership, CRC, PNG decoding, dimensions and byte identity independently checked. User artwork acceptance and gameplay calibration remain pending.

Import these five PNGs for AN03. Prepare the metadata, starting settings and Workbench import, then continue calibration.
