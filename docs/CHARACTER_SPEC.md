# Character Specification

Status: initial recovery of locked character production rules.

## Characters
Playable characters: Claude and Constance.

Visual baseline: light-brown skin, adventure clothing, consistent approved pixel-art treatment.

## Gameplay sizing
Do not edit the approved gameplay atlas simply to force a target display size. Read actual frame dimensions and scale the selected frame into the game world. In the intended 480x270 logical presentation, normal standing/running visible height targets approximately 58–66 logical pixels.

Claude and Constance retain their natural proportional differences. Do not force identical visible dimensions or distort Constance's hair / Claude's body for collision fairness. Tune collision geometry independently.

## Atlas rules
- Stable per-frame anchors and apparent body scale across states.
- State pose changes occur within the frame rather than by scaling the character.
- Generous transparent gutters; no neighboring-frame contamination.
- Character atlases use Claude on the top row and Constance on the bottom row unless an asset-specific locked specification states otherwise.
- Preserve fixed palette, skin tones, head/core torso proportions and character identity across states.

## Slide
G1D is a timed Slide state, not Duck.
- `slideDuration = 0.70s`
- Approved Constance Slide crop default is per-frame: frame 1 L/R/T/B = 0/0/0/0; frame 2 = 55/0/0/0.

## Migration
Do not regenerate approved character atlases as part of repository cleanup. Preserve originals first, externalize them, and verify rendered behavior against LAB25Q.
