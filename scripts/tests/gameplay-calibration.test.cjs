const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const { load, read } = require("../landscape-runtime-state.cjs");

const runtime = load("runtime");
runtime.context.CONFIG = runtime.config;
const source = read("src/js/game-runtime.js");
vm.runInContext(`
  const CHAR={claude:{row:0,label:"CLAUDE"},constance:{row:1,label:"CONSTANCE"}};
  const worldSourceW=()=>CONFIG.worldProfiles[CONFIG.activeWorld]?.sourceW||CONFIG.worldContract.sourceW;
  ${source.slice(source.indexOf("class CharacterMachine{"), source.indexOf("class Lab{"))}
  this.CharacterMachine=CharacterMachine;
  this.ObjectQA=ObjectQA;
  this.GameplayDirector=GameplayDirector;
`, runtime.context);

const ctx = {
  drawImage() {}, save() {}, restore() {}, beginPath() {}, moveTo() {},
  lineTo() {}, stroke() {}, strokeRect() {}
};
const assets = { run:{}, idle:{}, jump:{}, slide:{}, hit:{}, celebrate:{}, stars:{} };
const characters = ["claude", "constance"];
const sampleRates = [60, 120];
const leadSamples = Array.from({ length: 58 }, (_, i) => (i + 3) * .02);
const trajectoryCache = new Map();

function setup(stage, who) {
  runtime.config.activeWorld = stage;
  const character = new runtime.context.CharacterMachine(assets);
  character.character = who;
  character.setState("run");
  const objectQA = new runtime.context.ObjectQA(ctx, {}, { lastRenderedSurfaceY:410, worldX:0 }, character);
  const director = Object.create(runtime.context.GameplayDirector.prototype);
  director.objectQA = objectQA;
  character.draw(ctx);
  return { character, objectQA, director };
}

function trajectory(stage, who, action, lead, hz) {
  const key = [stage, who, action || "run", lead, hz].join("|");
  if (trajectoryCache.has(key)) return trajectoryCache.get(key);
  const q = setup(stage, who), dt = 1 / hz, samples = [];
  let triggered = !action;
  for (let t = -1.5; t <= 1.5 + 1e-9; t += dt) {
    if (!triggered && t >= -lead - 1e-9) {
      action === "jump" ? q.character.triggerJump() : q.character.triggerSlide();
      triggered = true;
    }
    // Lab.update checks collisions before the following draw, so characterBox sees
    // the same one-render-frame lag as gameplay rather than an idealized pose.
    q.character.update(dt);
    samples.push({ t, box:q.objectQA.characterBox() });
    q.character.draw(ctx);
  }
  trajectoryCache.set(key, samples);
  return samples;
}

function outcome(stage, who, def, mode, action, lead, speed, phase, hz) {
  const q = setup(stage, who), frameCount = def.frames || 1;
  const geoms = Array.from({ length:frameCount }, (_, frame) =>
    q.director.geom({ x:runtime.config.characterX, frame, mode }, def));
  let horizontalOverlap = false;
  for (const { t, box:characterBox } of trajectory(stage, who, action, lead, hz)) {
    const frame = frameCount > 1
      ? ((Math.floor((t + 1.5) * (def.fps || runtime.config.objectQA.flying.fps)) + phase) % frameCount + frameCount) % frameCount
      : 0;
    const geom = geoms[frame];
    const objectBox = { ...geom.box, x:geom.box.x - speed * t };
    if (objectBox.x < characterBox.x + characterBox.w && objectBox.x + objectBox.w > characterBox.x) {
      horizontalOverlap = true;
      if (q.objectQA.intersects(objectBox, characterBox)) return { horizontalOverlap:true, collided:true };
    }
  }
  return { horizontalOverlap, collided:false };
}

function passes(stage, who, def, mode, action, lead, speed, phase, hz) {
  const result = outcome(stage, who, def, mode, action, lead, speed, phase, hz);
  return result.horizontalOverlap && !result.collided;
}

function robustWindow(stage, who, def, mode, action) {
  const speeds = def.kind === "flying"
    ? Object.values(runtime.config.spawnDirector.speedClasses)
    : [runtime.config.worldSpeed];
  const good = leadSamples.map(lead => {
    for (const hz of sampleRates) for (const speed of speeds)
      for (let phase = 0; phase < (def.frames || 1); phase++)
        if (!passes(stage, who, def, mode, action, lead, speed, phase, hz)) return false;
    return true;
  });
  let longest = 0, current = 0;
  for (const value of good) {
    current = value ? current + 1 : 0;
    longest = Math.max(longest, current);
  }
  return Math.max(0, longest - 1) * .02;
}

test("all 27 hazards collide while running and have a real timed avoidance window", () => {
  const baselineStages = ["na01", "na02", "na03", "sa01", "sa02", "sa03", "eu01", "eu02", "eu03"];
  const entries = baselineStages.map(stage => [stage, runtime.config.objectQA.defs[stage]]);
  assert.equal(entries.reduce((n, [, defs]) => n + defs.length, 0), 27);
  const narrowWindows = [];

  for (const [stage, defs] of entries) for (const def of defs) {
    const variants = def.kind === "flying"
      ? [{ mode:"high", action:"slide" }, { mode:"low", action:"jump" }]
      : [{ mode:null, action:"jump" }];
    for (const who of characters) for (const { mode, action } of variants) {
      const speeds = def.kind === "flying"
        ? Object.values(runtime.config.spawnDirector.speedClasses)
        : [runtime.config.worldSpeed];
      for (const hz of sampleRates) for (const speed of speeds)
        for (let phase = 0; phase < (def.frames || 1); phase++)
          assert.equal(outcome(stage, who, def, mode, null, 0, speed, phase, hz).collided, true,
            `${stage} ${def.name} ${who} ${mode || "ground"} must threaten a running player`);

      const window = robustWindow(stage, who, def, mode, action);
      if (window < .06 - 1e-9)
        narrowWindows.push(`${stage} ${def.name} ${who} ${mode || "ground"}: ${(window * 1000).toFixed(0)}ms ${action}`);
    }
  }
  assert.deepEqual(narrowWindows, [], `avoidance windows below 60ms:\n${narrowWindows.join("\n")}`);
});

test("calibration preserves the locked movement and altitude contract", () => {
  assert.deepEqual({ ...runtime.config.jump }, { launch:-402, gravity:825 });
  assert.equal(runtime.config.actions.slideDuration, .75);
  assert.deepEqual({ ...runtime.config.objectQA.flying }, {
    mode:"high", highClearance:68, lowClearance:18, speed:170, fps:8, frame:0, t:0, travel:0
  });
});

test("integrated expansion hazards threaten running players and permit timed avoidance", () => {
  const catalog=runtime.context.window.CC_STAGE_CATALOG;
  for(const stage of Object.values(catalog.stages).filter(s=>!s.legacy&&['integrated','approved'].includes(s.status))){
    for(const def of runtime.config.objectQA.defs[stage.id]){
      const variants=def.kind==='flying'?[{mode:'high',action:'slide'},{mode:'low',action:'jump'}]:[{mode:null,action:'jump'}];
      for(const who of characters)for(const {mode,action} of variants){
        const speeds=def.kind==='flying'?Object.values(runtime.config.spawnDirector.speedClasses):[runtime.config.worldSpeed];
        for(const hz of sampleRates)for(const speed of speeds)for(let phase=0;phase<(def.frames||1);phase++)
          assert.equal(outcome(stage.id,who,def,mode,null,0,speed,phase,hz).collided,true,`${stage.id}/${def.name}/${who}/${mode}: running must collide`);
        assert.ok(robustWindow(stage.id,who,def,mode,action)>=.06-1e-9,`${stage.id}/${def.name}/${who}/${mode}: no robust timed ${action} window`);
      }
    }
  }
});
