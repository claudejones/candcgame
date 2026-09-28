# Corrections applied

- Replaced the pilot low-shot study with a genuinely lowered cannon pose and separate low-orb attack.
- Preserved source masters while applying explicit source crops, alpha cleanup and fixed source scale; aligned every packed boss frame to the same foot baseline. No frame-by-frame stretching.
- Generated clean empty tank interiors so animated specimens do not duplicate a painted static creature.
- Kept conveyor tread, support structure and boss platform separate. Tank overlays are clipped to their interiors.
- Added articulated specimen frames, staggered monitor/lamp movement, milestone effects and final capture.
- Normalized final passport artwork to a circular square extent with consistent transparent gutters. Gray derives from the earned art with identical alpha.
- Added all three result actions: Replay, Achievements and Main Menu.
- Derived the stage-card image using an undistorted 4:3 crop.

Visual inspection: both attacks, capture, result, mobile-sized entry/result, boss frame contact sheet and passport states. Automated checks: PNG decode, atlas bounds/frame uniqueness/baselines, passport alpha, video decode and ZIP member integrity. Runtime collision and browser/device testing remain Workbench work.
