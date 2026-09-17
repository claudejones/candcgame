(() => {
  "use strict";

  const BUILD = Object.freeze({
    phase: "7K",
    kind: "production",
    modes: Object.freeze(["game"])
  });

  window.CC_APP = Object.freeze({
    build: BUILD,
    mode: "game",
    isDevelopment: false
  });

  document.documentElement.dataset.appBuild = "production";
  document.documentElement.dataset.appMode = "game";
})();