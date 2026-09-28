# Secret Level — Electrical Hit V2

User requested stronger visible boss damage and selected electrical after-effects instead of stars. User also requested a smaller, narrower labeled HUD that exposes the overhead cannon, with a visible charge/fire sequence. This is a supplemental graphics package for the already integrated Beneath the Ice level. It supersedes the previous brief pulse/held-pose-only presentation at the first two milestones. Original level, current input behavior, current attack tuning and reward rules remain authoritative. The included video uses the original delivered scene as a visual reference, not the latest runtime HUD or calibrated player scale.

## Included art

| Asset | Cells | Playback |
|---|---|---|
| SECRET_CONTAINMENT_BEAM_V2_ATLAS.png | 4 × 160×512, horizontal; atlas640×512 |125ms/frame, loop only during beam interval|
| SECRET_ELECTRIC_IMPACT_V2_ATLAS.png |3 × 512×512, horizontal; atlas1536×512|160/180/160ms, once|
| SECRET_ELECTRIC_OVERLOAD_V2_ATLAS.png |3 × 512×512, horizontal; atlas1536×512|150ms/frame, loop through stunned interval|

All PNGs have actual transparency. Atlas coordinates and anchors are in fx_manifest.json. Originals include the unmodified generated lightning master and editable geometric beam SVG frames. Generated source had faint transparent haze; finishing uses alpha threshold128 plus a uniform448px image inside each512px cell to add safe gutters. Do not use the raw master as an atlas. The original master retains its original transparency and hidden RGB data; viewers that ignore alpha can misleadingly show a blue backdrop.

Reuse existing SECRET_BOSS_STAGGER_ATLAS frames0,1,2,3 and existing idle, capture and shield-break atlases from the base package. No stars or new boss identity. The body holds its existing crouched frame while the electricity visibly changes shape. This version intentionally does not introduce a new two-frame body loop. The animated electrical overload is the sustained injury cue, and should read with the BOSS STUNNED text hidden.

## Timing relative to elapsed60 or120 seconds

| Time | Action |
|---|---|
|-2000..0ms|Emitter charges in three increasing brightness stages. Begin stopping new attacks earlier as needed so all existing projectiles clear safely before the milestone.|
|0ms|Latch milestone once; reduce shield count exactly once, play shared shield-break.|
|0..500ms|Thick beam visibly connects nozzle to boss upper torso; impact burst plays once.|
|0..300ms|Existing stagger frame0.|
|300..800ms|Existing recoil frame1.|
|500..2800ms|Loop electrical overload around armor; overlap the end of recoil.|
|800..2800ms|Hold crouched stagger frame2 for a full two seconds. No attacks.|
|2600..2800ms|Fade overload opacity from1 to0; do not fade the boss.|
|2800..3300ms|Recovery frame3; remove optional stun text.|
|3300..3800ms|Idle breathing space.|
|3800ms onward|Next attack may start its full normal warning; no immediate release or catch-up burst.|

Use elapsed delta time and threshold crossing, never frame equality. Duration is independent of refresh rate. Combat timer continues, conveyor/player controls and lab ambience continue. User pause freezes combat timer, this sequence and conveyor together. No full-screen flash, camera shake, new damage event, new player power or extra life rule. Effect is visual evidence of the already scheduled containment hit.

At elapsed180, the first500ms beam/impact may be reused, then transition to the existing final capture. Do not run the recover/idle/next-attack portion, delay the survival requirement, or award twice. Preserve existing fatal-contact/success ordering.

## Placement and draw order — essential

The effects must follow the actual integrated boss transform and emitter nozzle. The reference uses boss cells512×512 with feet anchor[256,464]. Overload center in that cell is[256,344], display size[420,300] in boss-local units. This authored effect is intentionally displayed as a broad oval around the hunched shoulders/torso; it remains sparse enough to see the boss. Impact center[256,310], display size[240,240]. These measurements include transparent gutters; do not tightly crop frames independently.

Convert these local coordinates using the boss's current uniform display scale/position. Beam starts at the emitter's visible nozzle and ends at the impact center. Beam full sprite width is96 boss-local units; its luminous center is~38units. Resize along its length to connect both points and rotate only if their x coordinates differ. The opaque beam spans its full source height, with centerline x80. Do not hard-code the original1280×720 preview world coordinates into the live game.

Draw background/platform and boss first; draw beam, overload and impact ABOVE the boss; draw HUD/controls last. Do not apply the boss alpha as a mask to the electrical arcs: they must extend outside its silhouette. Clip only to the arena. Keep the emitter nozzle and at least the visible beam path below the HUD; if the current HUD covers the nozzle, use its visible exit point at the HUD lower edge and confirm the beam remains connected to the machinery. Do not lower the boss or alter global calibration to fix an FX placement problem.

No required new button, screen or label is introduced. Optional BOSS STUNNED copy may remain, but visible electricity must carry the state by itself. At mobile landscape size the boss face/body must stay identifiable inside the arcs.

## Acceptance checks

- Watch a real-time clip, not just a paused still: beam is visible for500ms, then animated electrical overload remains during the full2000ms crouched hold.
- Effects remain attached at multiple viewport sizes/current calibrated boss transforms; no HUD clipping, blue rectangular backgrounds or cell bleeding.
- All3 overload shapes animate; they do not merely blink a single static sprite.
- No enemy shots during the sequence; next warning starts no earlier than3800ms after the milestone. Preserve newly tuned attack patterns outside this reserved window.
- Pause at charge/impact/stun and resume without skipping or repeating the shield loss. Retry cancels old timers/effects.
- Verify both characters and minute1/minute2; duration remains180seconds; final capture/Game Over/rewards remain correct.
- Honor reduced motion by holding an electrical frame without flashing, retaining the beam, crouched state and shield change so the event remains understandable.

Asset QA is complete; live runtime/device validation belongs to Workbench. The preview is presentation-only and adds no new audio files. Reuse an existing suitable impact/electrical sound if available and honor SFX off.


## Compact HUD and visible charging cannon — latest user request

Replace the full-width HUD backing with a compact centered panel holding three groups: player hearts with HEALTH beneath; countdown with TIME beneath; three existing shield slots with BOSS SHIELD beneath. Shield is the accurate label for the established containment mechanic; do not introduce a separate boss-health mechanic. Keep the current menu/pause control independent and accessible. No HUD layout changes to ordinary stages are requested here.

The exact CSS/Canvas treatment is in fx_manifest.json under hud: at reference1280×720, panel[320,10,610,74], navy82% fill,2px muted cyan border and2px gold bottom accent. Reuse original heart/shield art and font. Center groups at414/625/826. Labels16reference px below the values; avoid scaling labels below10CSS px on phone and maintain44CSS px menu touch targets. The supplied updated preview demonstrates this treatment. No new HUD raster is required for a simple responsive bordered panel with live values.

Reserve the cannon's complete visible bounds plus16reference px clearance. Reflow/shrink panel width or relocate individual HUD groups within safe areas if current arena coordinates differ. Do not just reduce opacity while continuing to overlap the device. Keep existing player health and boss status semantics. Do not use the earlier fallback of hiding the nozzle behind the HUD: the entire cannon should now remain visible.

SECRET_EMITTER_CHARGE_V2_ATLAS.png: six128×64 transparent overlay cells, atlas768×64; anchor[64,40] is the nozzle. Frame0 dim idle;1 first charge;2 brighter charge;3 full charge;4 firing;5 cooling. Apply it over the current cannon using its actual nozzle transform. Reference overlay top-left1041,71 at102×51 means nozzle1092,103. Overlay adds three fill indicators and brighter barrel bands; it does not contain a second cannon body. Existing cannon is painted in the base lab. Suppress the old emitter overlay while using V2 so they do not compete.

At t=-2000 use frame1 for600ms, frame2 for600ms, frame3 for800ms; at t=0 use frame4 for500ms, frame5 for500ms, then idle0. At the final180s milestone, show the same charge and firing before the existing capture. Pausing freezes this sequence. The bright beam begins at that same nozzle anchor. This ties charge, visible shot and boss overload into one readable event. No independent free-running firing timer.
