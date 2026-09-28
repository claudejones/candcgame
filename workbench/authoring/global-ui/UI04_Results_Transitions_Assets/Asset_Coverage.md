# UI04 coverage inventory

| Approved/proposed component | Delivered implementation |
|---|---|
| Navy stepped result overlay, cyan border | assets/UI04_RESULT_PANEL.png + editable originals/UI04_RESULT_PANEL.svg; shared by success/failure/passports/world |
| Gold primary / navy secondary controls | Eight standalone PNGs, SVG originals and UI04_BUTTONS_ATLAS; normal/focus/pressed/disabled |
| Titles, stage/difficulty, ratings, explanations | Live text, exact coordinates/colors/font sizes in scenes.json; font + license |
| Unique stage reward | All21 TROPHY_<stage>.png, gray versions, seven trophy atlases; original masters included; shared not regenerated |
| Current and saved heart rows | Canonical96×32 reward utilities atlas, exact empty/full derivatives; no alternate assisted glyph |
| Circle passport + perfect distinction | All seven approved circle stamps/gray states/atlases; separate canonical PERFECT_STAR.png |
| World completion | Seven existing stamps in shared slots; text/button states; no eighth world trophy invented |
| Mystery entry announcement | Existing check icon + live explanation; no mystery stamp awarded or invented |
| Character celebration | Preserved reference CHARACTER_CELEBRATE_SOURCE.png; both character rows; preview cell crops; reuse current game sprites/calibration |
| Stunned character / looping stars | Preserved CHARACTER_HIT_SOURCE.png + CHARACTER_STARS_SOURCE.png; both rows; preview crops. Current game sources take precedence |
| Stage scenery | Existing live stage renderer; SA02 reference layer copies and composite under preview-only, not replacement gameplay layers |
| Background dim / separators | CSS/Canvas rectangle #03182e at22% opacity; live layout; no bitmap needed |
| Ambient clouds | Existing renderer; UI03 MAP_CLOUD_1.png snapshot for review |
| Stage entry/loading/error | UI04_TRANSITION_PANEL.png + SVG source; reusable controls; data-driven21 names |
| Travel map/pin | UI03 world/ocean + both approved head pins; dotted #ffdc54 route,5px at1280-wide reference, CSS/SVG; runtime coordinates reused |
| Review screens | Actual-component PNGs, phone examples, both characters,21 stage examples,7 passport examples, three difficulties; results-preview.html with state selector |
| Source reference approval | Two approved concept PNGs under originals/reference-concepts; never use them as game backgrounds |

No new generated character, reward or scenery art is introduced. Editable UI sources extend the existing authored SVG/CSS system. Rendering UI frames this way keeps exact edges and states consistent. Existing shared files occur once per file in this self-contained package and should be deduplicated on import. PNGs and their atlases are alternate integration representations.
