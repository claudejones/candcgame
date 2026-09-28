# Gameplay Specification

Status: initial recovery document. Preserve established behavior from LAB25Q unless an explicit locked decision changes it.

## Campaign scope
7 continents x 3 stages = 21 stages.

## Core movement states
Approved gameplay state family includes Idle, Run, Jump, Slide, Hit/Stunned and Celebrate.

G1D is **Slide**, not Duck. Approved slide duration: 0.70 seconds.

## Player presentation
The intended 480x270 logical production composition targets a normal standing/running visible player height of approximately 58–66 logical pixels. Feet align to the canonical running surface rather than aligning the sprite cell itself. Claude and Constance retain natural proportional differences; collision boxes provide gameplay fairness.

## Hit recovery
Established QA baseline includes post-hit invulnerability blinking beginning with the second hit visual frame and approximately 2.0 seconds of invulnerability. Preserve the current reference implementation during migration unless explicitly retuned.

## Pause
Pause freezes gameplay/hazards/timer/world scrolling, disables jump/slide input, and presents the character in Idle. The shared cloud effect may continue while paused according to the established baseline.

## Lives
Unlimited Lives exists as a QA/gameplay option in the established baseline and must not regress during structural migration.

## Progression direction
The post-North-America campaign direction replaced the earlier mode concept with a single campaign plus Perfect Runs: stage medal per stage, continent passport after three medals, and 21 Perfects unlocking a bonus level. Before final production implementation, reconcile this direction with any older Explorer/Adventurer UI still present in the legacy harness; do not silently choose the older implementation merely because it exists in LAB25Q.

## Migration rule
Structural extraction to modules/external assets must not change movement physics, hazard timing, collision detection, invulnerability, stage signatures, progression behavior, or character grounding unless that behavior is the explicitly approved subject of the change.
