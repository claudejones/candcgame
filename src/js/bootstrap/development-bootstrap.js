(() => {
  "use strict";

  const VALID_MODES = Object.freeze(["design", "test", "game"]);
  const params = new URLSearchParams(window.location.search);
  const requested = (params.get("mode") || "design").toLowerCase();
  let mode = VALID_MODES.includes(requested) ? requested : "design";

  const pilot = window.GAME_CONFIG?.worldProfiles?.na01;
  if (pilot) Object.assign(pilot, {sourceW:2172,seamY:410,farY:0,farScale:1.25,midYOffset:0,midScale:1,groundYOffset:0,groundScale:1,characterGrounding:{claude:0,constance:0}});

  const listeners = new Set();
  const notify = () => listeners.forEach(fn => fn(mode));

  const app = {
    build: Object.freeze({phase:"7C", kind:"development", modes:VALID_MODES}),
    get mode(){ return mode; },
    isDevelopment: true,
    setMode(next){
      next = String(next || "").toLowerCase();
      if(!VALID_MODES.includes(next)) throw new Error(`Unknown app mode: ${next}`);
      if(next === mode) return;
      mode = next;
      document.documentElement.dataset.appMode = mode;
      const url = new URL(window.location.href);
      url.searchParams.set("mode", mode);
      history.replaceState(null, "", url);
      notify();
    },
    onModeChange(fn){
      if(typeof fn !== "function") throw new TypeError("Mode listener must be a function");
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
  };

  window.CC_APP = Object.freeze(app);
  document.documentElement.dataset.appBuild = "development";
  document.documentElement.dataset.appMode = mode;
  window.addEventListener("DOMContentLoaded", () => {
    const frame = document.getElementById("sharedRuntime");
    if (!frame) return;
    const url = new URL(frame.src, window.location.href);
    if (url.searchParams.get("phase8Pilot") === "na01") return;
    url.searchParams.set("phase8Pilot", "na01");
    frame.src = url;
  }, {once:true});
})();
