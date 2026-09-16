# UI / UX Specification

Status: initial migration guardrails; detailed production UI specification still to be recovered/expanded.

## Platform
Mobile-first only for gameplay, landscape orientation. Desktop is primarily a development/QA surface.

## Migration guardrail
Repository restructuring is not a UI redesign. Preserve the validated HUD, controls, progress presentation, pause behavior and QA affordances while application code/assets are externalized.

## Established QA/HUD details
- Pause control is centered between Slide and Jump in the established control layout.
- Progress marker remains centered on the progress path/line and must not overshoot the finish.
- Character-specific progress markers must remain correctly aligned.
- QA bounds overlay OFF state must persist as established by the harness behavior.

## Production versus QA
QA-only controls such as calibration panels, collision bounds, world-layer visibility and copy/export controls must remain separable from production player UI. Their state must not leak into production configuration unless explicitly defined as a production feature.
