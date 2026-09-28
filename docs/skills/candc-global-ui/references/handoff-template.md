# Global UI asset handoff

Use this structure for each approved delivery; omit fields only when genuinely inapplicable. Distinguish source artwork from final packed/derived integration files. Keep review screenshots out of the import set.

## Batch

- Name/version; purpose; user approval status.
- Included original source artwork and integration filenames.
- Dependencies on existing approved assets.
- Outstanding decisions and checks (explicitly say if none).

## Screen behavior

| Field | Required content |
|---|---|
| Appears when | Entry event and prerequisites |
| Inputs | Difficulty, character, stage/result, best rating, assistance and unlock data as needed |
| States | Default, no-save/empty, locked, selected, earned, perfect, assisted, disabled and loading as applicable |
| Buttons | Exact label, visibility/enabled condition, action and destination |
| Animation | Trigger, supplied frames or runtime transform, duration, loop, order, skip/input behavior |
| Persistence | What saves/unlocks; when committed; whether repeated entry is a no-op |
| Exit | Continue, back, cancel and failed-load behavior |
| Layout | Safe areas, anchors, layering, intended size and responsive behavior |
| Audio | Cue intent, separate music/effects settings, or none |

## Asset/frame manifest

For each asset provide stable ID, filename, SHA256, width, height, alpha mode and intended display size. For atlases include cell/frame rectangles with explicit coordinate convention, state/pose IDs, local anchors and padding. Derive hashes and dimensions from actual finished bytes, never from prompts. Record grayscale/packing/scale transformations and original-to-final relationships.

## Verification

Record measured geometry, visual check at intended display sizes, state correspondence, animation playback where supplied, ZIP membership/CRC/byte identity, and any provisional runtime assumptions. Separate asset-ready, visually reviewed, user-approved and integrated status. Workbench imports original bytes and owns runtime/save tests; do not claim those tests from a mockup.

## Approved-design coverage (required)

Include a table mapping every approved visible component and state to its delivered filename/frame, verified shared dependency, or exact code-rendered styling specification. Include icons, character pins, thumbnails, card/nameplate treatments and animations, not only the background. Workbench owns assembly and behavior; the asset producer owns all required artwork and sprites. List exact shared dependencies without duplicating common packs unnecessarily. Include a faithful assembled preview made from the delivered components and compare it with the approved concept. Missing artwork or generic substitute styling blocks a complete-delivery claim.
