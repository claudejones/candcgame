// Candidate-only defaults. Keep the eleven upstream tuning candidates available
// in production evidence; importing artwork must not silently apply their tuning.
window.CC_WORKBENCH_SOURCE_REVISION="a09b176dd8531bfb3425c9af534ff197a05a253e";
(() => {
 const prior={
  "na01:2": {
    "scale": 0.34
  },
  "na02:0": {
    "scale": 0.22,
    "groundOffset": 36
  },
  "na02:2": {
    "scale": 0.34
  },
  "na03:2": {
    "scale": 0.32
  },
  "sa01:2": {
    "scale": 0.3
  },
  "sa02:2": {
    "scale": 0.34
  },
  "eu01:0": {
    "scale": 0.18,
    "groundOffset": 34
  },
  "eu02:0": {
    "scale": 0.2,
    "groundOffset": 34
  },
  "eu02:1": {
    "scale": 0.2,
    "groundOffset": 34
  },
  "eu03:0": {
    "scale": 0.2,
    "groundOffset": 34
  },
  "eu03:2": {
    "scale": 0.3
  }
};
 for(const [id,fields] of Object.entries(prior)){const [stage,index]=id.split(':');Object.assign(window.GAME_CONFIG.objectQA.defs[stage][index],fields);}
 // Visually audited source art faces right; gameplay approaches from the right.
 for(const [stage,index] of [['sa02',1],['eu02',1]])window.GAME_CONFIG.objectQA.defs[stage][index].flipX=true;
})();
