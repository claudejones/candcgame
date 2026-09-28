## Electrical V2 and variation revision

V2 supersedes the earlier 2.7-second pulse below: 0.8s recoil (beam/impact first0.5s), 2s crouched hold,0.5s recovery,0.5s idle; new warning earliest3.8s. Final capture precedes two complete celebration cycles, then resultReady. Survival clock stays180s.

Motifs contain repeated jumps/slides as well as switches; deterministic per-shot speed and gap factors avoid an unvarying alternating rhythm. Checked speed variants must pass both-character timing analysis, otherwise that event retains its qualifying base speed. Each event stores its speed for parity between Design and Game. Existing geometry certification is not widened by fallback-runtime tests.

# Encounter pacing

The five ordinary HUD markers divide an encounter into five difficulty sections. Fallback runs use elapsed stage progress, scheduling against expected arrival. Checked runs use the generated section boundaries so the displayed progression matches its verified action schedule.

Base profile values remain editable. Arrival spacing multipliers are 2, 1.6, 1.25, 1, and 0.8; action spacing multipliers are 1.5, 1.25, 1, 0.85, and 0.7. Both are bounded by a complete jump or slide plus 200ms. Visibility grows from the configured starting limit by 0, 0, 1, 1, and 2 (ceiling six). After the opening section, available jump and slide hazards alternate. Fallback schedules keep faster hazards from overtaking preceding encounters. Checked sequences use only qualifying geometry and validate the full continuous trajectory for both characters. Regenerate existing checked sequences to adopt this revision.

Boss combinations grow from two to three to four warned shots, with increasing projectile speed and shorter breaks. Every shot retains its 150ms ready and 800ms warning. At 60 and 120 seconds, a conservative projectile exit horizon stops scheduling before the pulse. The 200ms impact, 1500ms frame-2 hold, 500ms recovery and 500ms idle use combat time; ambient animation remains independent. Resetting the next charge to the end of that sequence prevents catch-up bursts. The 180-second capture is terminal.

Design review: Screens → Beneath the Ice · practice. Choose either character and practice from 0:58 or 1:58 to observe preparation and the full milestone, or 2:58 for final capture. Controls use the same selectors as Game. Review HUD legibility and button layout on the target mobile browser; automated checks validate timing and events, not physical-device appearance.
