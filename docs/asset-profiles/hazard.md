# New-stage hazard profile

Applies to new AF/AS/OC/AN files. Source: HAZARD_SPEC and REMAINING_CONTINENTS_PLAN. Existing accepted atlases/calibrations stay unchanged.

- Ground atlas: 2172×724 RGBA; two 1086×724 cells, GROUND1 left / GROUND2 right. Source contact (543,620); at least 32px clear cell gutters. No scenery/labels.
- Flying atlas: 2172×724 RGBA; four 543×724 cells. Fixed source body anchor (271,362), right-facing source, stable anatomy, four distinct wing poses and continuous loop. Every flock member animates.
- Record source-facing and intended gameplay-facing separately. Directional hazards approaching from the right face left in gameplay; retain pixels and use the matching `flipX` transform. Nondirectional objects use neither automatic mirroring nor an invented facing.
- Supply source regions, crops/frame crops, anchors, frame order/FPS and usable starting scale/body bounds. Crops retain anchors. Starting bounds represent solid bodies, excluding decorative wings/tails/leaves. Inspect basic rendering and credible size with the character reference at 960×540/mobile; do not inflate a small species for visibility.
- Ground uses Y=410 and the explicit source anchor; flying uses the shared HIGH/LOW starting placement. These are provisional metadata, not accepted character-relative calibration. No global physics, clearance or speed changes to rescue art.
- Validate source integrity/alpha, gutters, ground contact pixels, distinct frame bytes and animation/pose stability. Inspect composition and basic rendering. Structural checks alone do not prove animation quality or collision fairness.
- End asset production with the versioned asset-ready handoff and exact five-file hashes. The editor-next Workbench agent imports it; the user calibrates and saves. Iterative grounding, flight height, hitbox fairness, Jump/Slide windows, difficulty and spawn-spacing balancing belong there. Repeated zero-hit courses are not an asset handoff gate.
- Later playable release retains real contact, collision, finish and gameplay validation. Never mark unperformed checks passed. Keep genuine renderer/scheduler bug fixes and regression tests.
- A GROUND1/GROUND2 revision preserves its sibling's RGBA pixels and metadata exactly. Recover original bytes from Git; never silently regenerate an accepted sibling.
