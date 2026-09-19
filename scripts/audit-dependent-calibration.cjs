// Read-only reproduction of the historical 10ms comparison measurements.
// This is evidence, not an optimizer or a production acceptance command.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const repo = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--root')) {
  throw new Error('Usage: node scripts/audit-dependent-calibration.cjs [--root BASELINE_CHECKOUT]');
}
const root = args.length ? path.resolve(args[1]) : repo;
const evidence = JSON.parse(fs.readFileSync(path.join(repo, 'docs/phase8-qa/DEPENDENT_CALIBRATION_MEASUREMENTS.json'), 'utf8'));
for (const [file, expected] of Object.entries(evidence.provenance.runtimeInputs)) {
  const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
  assert.equal(actual, expected, `${file} differs from historical inputs; use --root with commit ${evidence.provenance.baselineCommit}`);
}
const {load, read} = require(path.join(root, 'scripts/landscape-runtime-state.cjs'));
const runtime = load('runtime');
runtime.context.CONFIG = runtime.config;
const source = read('src/js/game-runtime.js');
vm.runInContext(`
  const CHAR={claude:{row:0,label:'CLAUDE'},constance:{row:1,label:'CONSTANCE'}};
  const worldSourceW=()=>CONFIG.worldProfiles[CONFIG.activeWorld]?.sourceW||CONFIG.worldContract.sourceW;
  ${source.slice(source.indexOf('class CharacterMachine{'), source.indexOf('class Lab{'))}
  this.Character=CharacterMachine; this.ObjectQA=ObjectQA; this.Director=GameplayDirector;
`, runtime.context);
const ctx = {drawImage(){},save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},strokeRect(){}};
const assets = {run:{},idle:{},jump:{},slide:{},hit:{},celebrate:{},stars:{}};
const cache = new Map();
const start = -1.9, end = 1.9, rates = [60,120];
function setup(stage, who) {
  runtime.config.activeWorld = stage;
  const character = new runtime.context.Character(assets);
  character.character = who; character.setState('run');
  const objectQA = new runtime.context.ObjectQA(ctx, {}, {lastRenderedSurfaceY:410,worldX:0}, character);
  const director = Object.create(runtime.context.Director.prototype);
  director.objectQA = objectQA; character.draw(ctx);
  return {character, objectQA, director};
}
function trajectory(stage, who, action, lead, hz) {
  const key = [stage,who,action,lead,hz].join('|');
  if (cache.has(key)) return cache.get(key);
  const q = setup(stage,who), dt = 1/hz, samples = [];
  let triggered = false;
  for (let t=start; t<=end+1e-9; t+=dt) {
    if (!triggered && t>=-lead-1e-9) {
      action==='jump' ? q.character.triggerJump() : q.character.triggerSlide();
      triggered=true;
    }
    q.character.update(dt);
    samples.push({t,box:q.objectQA.characterBox()}); // Collision precedes this frame's draw.
    q.character.draw(ctx);
  }
  cache.set(key,samples); return samples;
}
function windowFor(stage,who,def,mode,action) {
  const q=setup(stage,who), frames=def.frames||1;
  const geoms=Array.from({length:frames},(_,frame)=>q.director.geom({x:220,frame,mode},def));
  const speeds=def.kind==='flying'?[150,170,210]:[120];
  const good=[];
  for (let n=5; n<=160; n++) {
    const lead=n/100; let minimumGap=Infinity, valid=true;
    scenarios: for (const hz of rates) for (const speed of speeds) for (let phase=0; phase<frames; phase++) {
      let overlap=false;
      for (const {t,box:characterBox} of trajectory(stage,who,action,lead,hz)) {
        const frame=frames>1?(Math.floor((t-start)*(def.fps||runtime.config.objectQA.flying.fps))+phase)%frames:0;
        const geom=geoms[frame], box={...geom.box,x:geom.box.x-speed*t};
        if (box.x<characterBox.x+characterBox.w && box.x+box.w>characterBox.x) {
          overlap=true;
          if (q.objectQA.intersects(box,characterBox)) {valid=false;break scenarios;}
          minimumGap=Math.min(minimumGap,Math.max(box.y-(characterBox.y+characterBox.h),characterBox.y-(box.y+box.h)));
        }
      }
      if (!overlap) {valid=false;break scenarios;}
    }
    if (valid) good.push({lead,gap:minimumGap});
  }
  const groups=[];
  for (const value of good) {
    if (!groups.length || value.lead-groups.at(-1).at(-1).lead>.011) groups.push([]);
    groups.at(-1).push(value);
  }
  return groups.map(group=>({start:group[0].lead,end:group.at(-1).lead,
    width:+(group.at(-1).lead-group[0].lead).toFixed(2),
    gap:+Math.min(...group.map(x=>x.gap)).toFixed(2)}))
    .sort((a,b)=>b.width-a.width)[0]||null;
}
const results=[];
for (const item of evidence.changes) {
  const original=runtime.config.objectQA.defs[item.stage].find(d=>d.name===item.name);
  assert.ok(original,`Missing historical hazard ${item.stage}/${item.name}`);
  const result={stage:item.stage,name:item.name,action:item.action,mode:item.mode};
  for (const version of ['before','after']) {
    const recorded=item[version], def={...original,scale:recorded.scale};
    if (recorded.groundOffset!==null) def.groundOffset=recorded.groundOffset;
    const windows={};
    for (const who of ['claude','constance']) windows[who]=windowFor(item.stage,who,def,item.mode,item.action);
    result[version]=windows;
    assert.deepEqual(windows,recorded.windows,`Historical measurements differ: ${item.stage}/${item.name}/${version}`);
  }
  results.push(result);
}
console.log(JSON.stringify({baseline:evidence.provenance.baselineCommit,verifiedComparisons:results.length,
  inputLeadStepSeconds:.01,simulationRangeSeconds:[start,end],sampleRatesHz:rates,results},null,2));
