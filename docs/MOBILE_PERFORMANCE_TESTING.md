# Mobile performance test procedure

No measured physical-phone battery, temperature or frame-rate result is claimed by the automated checks.

## Instrumented frame test
Use Safari Web Inspector from a Mac connected to an iPhone (enable Web Inspector on the phone and web-developer features on the Mac). Inspect the actual GitHub Pages game, not a desktop-sized editor. Record a Timeline during NA01, a visually busy stage, the boss, world travel and menu navigation. Record device/OS, release SHA, viewport, cold/warm asset cache and audio settings. Review frame intervals, JavaScript/rendering time, long tasks, network and memory. Target smooth 60 fps (about 16.7 ms between frames), not merely a high average; report p95 frame interval and repeated >50 ms stalls. Repeat after ten minutes to reveal degradation. A desktop run is not a phone result.

## Battery and warmth test
Use the same phone, fixed brightness (e.g. 50%), stable Wi-Fi, same audio level and settings. Begin unplugged and cool, with low-power mode consistently on or off. Close unrelated active tasks. Record battery percentage, room conditions and subjective warmth. Play the same route for 20 minutes; record battery and warmth at 0, 10 and 20 minutes. Repeat twice and compare with a same-duration title/menu session. Percentage readings are coarse; do not extrapolate one short run into a battery-life guarantee. Record warmth as cool/warm/hot unless you have a real temperature instrument.

Disconnect the inspector and do not screen-record during battery testing: tethering/charging and recording alter power use. Stop if the phone shows a temperature warning. Debugging traces and battery trials are separate sessions.

## Lifecycle and interaction checks
Hold/release Slide repeatedly; confirm no selection menu. Rotate both directions, switch apps and return, lock/unlock and interrupt audio. Confirm pause, no stuck slide, no extra damage while hidden, and explicit Resume. Check memory and responsiveness over repeated stage/retry/map transitions.

## Existing measures and remaining work
Current stage images load on demand; decoded loader cache is limited; the rendering canvas is 960×540; stage plans are precomputed; drawing is skipped when hidden/portrait; audio follows visibility. Map artwork is decoded before display. None of this is a battery measurement. The host still schedules an animation callback continuously, and rendering is not yet capped independently of screen refresh rate. Measure before choosing a frame cap or reducing effects.

Official references: https://webkit.org/web-inspector/enabling-web-inspector/ and https://webkit.org/web-inspector/timelines-tab/
