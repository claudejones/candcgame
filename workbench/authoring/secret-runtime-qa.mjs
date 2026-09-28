import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {descriptors} from '../dist/workbench-next/model.mjs';import {landscapeDescriptors} from '../dist/workbench-next/landscape.mjs';import {ProjectDraft,projectProvenance} from '../dist/workbench-next/project.mjs';
import {secretSnapshot,SecretRuntime} from '../dist/workbench-next/secret-runtime.mjs';import {drawSecret} from '../dist/workbench-next/secret-renderer.mjs';
const context={window:{}};vm.createContext(context);for(const file of JSON.parse(fs.readFileSync('authoring/workbench-next/source-files.json')))vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
const w=context.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);
const items=descriptors(config,w.GAME_SCHEMA),landscapes=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog=JSON.parse(fs.readFileSync('dist/workbench-next/asset-catalog.json')),draft=new ProjectDraft(items,landscapes,catalog.dimensions,projectProvenance(catalog,items,landscapes),catalog.migrations,config);
const manifest=JSON.parse(fs.readFileSync('dist/assets/secret-level/asset_manifest.json')),tuning=JSON.parse(fs.readFileSync('dist/assets/secret-level/encounter_config.json'));
const before=JSON.stringify(draft.export());
const make=who=>new SecretRuntime(secretSnapshot({config,draft,items,catalog,character:who},manifest,tuning));

const evidence=[];
for(const who of ['claude','constance'])for(const hz of [30,60,120]){
 const r=make(who),acted=new Set();r.start();
 while(r.time<180&&r.status==='playing'){
  for(const p of r.active){const eta=(p.x-r.config.characterX)/(p.speed||390);if(eta<.26&&!acted.has(p.serial)){r.action(p.lane==='low'?'jump':'slide');acted.add(p.serial);}}
  r.advance(1/hz);
 }
 evidence.push({who,hz,status:r.status,time:r.time,hits:r.hits,shots:r.spawned});
 assert.equal(r.status,'complete',JSON.stringify(evidence));assert.equal(r.hits,0,JSON.stringify(evidence));assert.equal(r.time,180);assert.deepEqual(r.pulses,[60,120,180]);assert.equal(r.shields,0);
 assert.equal(new Set(r.events.filter(e=>e.type==='release').map(e=>e.id)).size,r.spawned);
 assert.equal(r.resultReady,false);assert(r.celebrationDuration>=5);r.advance(r.captureDuration+.01);assert.equal(r.resultReady,false);r.advance(r.celebrationDuration);assert.equal(r.resultReady,true);assert.equal(r.motion.state,'celebrate');
}
console.log(evidence);
// Default standing must be vulnerable. Pause preserves exact airborne combat state.
for(const who of ['claude','constance']){
 const r=make(who);r.start();r.action('jump');r.advance(.15);const saved={time:r.time,y:r.motion.y,vy:r.motion.vy,belt:r.beltTime};r.pause();r.advance(5);assert.equal(r.time,saved.time);assert.equal(r.beltTime,saved.belt);r.start();assert.equal(r.motion.y,saved.y);assert.equal(r.motion.vy,saved.vy);
 while(r.status==='playing')r.advance(1/60);assert.equal(r.status,'failed');assert.equal(r.lives,0);const time=r.time;r.advance(2);assert.equal(r.time,time);assert.equal(r.motion.frame,1);assert(r.motion.starT>0);
}
// Fatal collision on the deadline wins. No capture/pulse or reward is emitted.
const tie=make('claude');tie.start();tie.previewPhase(179.99);tie.steps=10799;tie.lives=1;tie.invulnerable=0;const box=tie.geometry().character.collision;
tie.active=[{serial:999,x:box.x+box.w/2+6.5,y:box.y+box.h/2,originX:700,originY:box.y+box.h/2,targetY:box.y+box.h/2,w:14,h:14,lane:'low',item:{id:'test',name:'test'},hit:false}];tie.advance(1/60);assert.equal(tie.status,'failed');assert(!tie.pulses.includes(180));
assert.equal(JSON.stringify(draft.export()),before);
const {createCanvas,loadImage}=createRequire(import.meta.url)('@napi-rs/canvas');
const images=Object.fromEntries(await Promise.all([...Object.keys(manifest.assets).map(n=>['secret:'+n,'dist/assets/secret-level/'+n]),...[...new Set([...items.filter(i=>i.type==='character').map(i=>i.asset),'stars'])].map(k=>[k,'dist/workbench-next/'+catalog.assets[k]])].map(async([k,p])=>[k,await loadImage(p.split('?')[0])])));
for(const who of ['claude','constance']){const r=make(who);r.start();r.advance(3.3);const c=createCanvas(960,540);drawSecret(c,r,images,{boxes:false});fs.writeFileSync('./secret-'+who+'-review.png',c.toBuffer('image/png'));}
console.log('Passed: 180-second avoidance both characters at 30/60/120Hz; once-only releases/pulses, capture, fatal deadline priority, pause, failure stars and unchanged Design draft. Rendered original PNGs.');
const reactionWindows=[];
for(const who of ['claude','constance'])for(const lane of ['high','low']){
 const pass=[];
 for(const lead of [.12,.18,.24,.30,.36,.42]){
  const r=make(who);r.tuning=structuredClone(r.tuning);r.tuning.bursts.forEach(p=>p.pattern=[lane]);r.start();let acted=false;
  while(r.time<6){if(r.active.length&&!acted&&(r.active[0].x-r.config.characterX)/(r.active[0].speed||390)<lead){r.action(lane==='high'?'slide':'jump');acted=true;}r.advance(1/60);if(r.spawned)r.nextCharge=999;}
  if(!r.hits)pass.push(lead);
 }
 assert(pass.length>=3,`${who} ${lane} reaction window too narrow: ${pass}`);reactionWindows.push({who,lane,passingLeadSeconds:pass});
 const standing=make(who);standing.tuning=structuredClone(standing.tuning);standing.tuning.bursts.forEach(p=>p.pattern=[lane]);standing.start();while(standing.time<6)standing.advance(1/60);assert(standing.hits>0,`${who} ${lane} must hit standing`);
}
console.log('Reaction windows',reactionWindows);
// Exact milestone timeline, empty projectile corridor, pause and full warning on resume.
for(const who of ['claude','constance']){
 const r=make(who);r.unlimitedLives=true;r.start();let overlaps=0;
 for(let n=0;n<10800;n++){
  r.advance(1/60);overlaps=Math.max(overlaps,r.active.length);
  for(const boundary of [60,120]){
   const age=r.time-boundary;
   if(age>=0&&age<3.8-1e-8){assert.equal(r.active.length,0);assert.equal(r.attack,null);}
   if(Math.abs(age-1.5)<1e-8){assert.equal(r.milestone.state,'stunned');const before={time:r.time,belt:r.beltTime,age:r.milestone.age};r.pause();r.advance(5);assert.equal(r.time,before.time);assert.equal(r.beltTime,before.belt);assert.equal(r.milestone.age,before.age);r.start();}
   if(Math.abs(age-.1)<1e-8)assert.equal(r.milestone.state,'impact');
   if(Math.abs(age-3.0)<1e-8)assert.equal(r.milestone.state,'recovery');
   if(Math.abs(age-3.5)<1e-8)assert.equal(r.milestone.state,'breathing');
  }
 }
 const shots=r.events.filter(e=>e.type==='release');assert(new Set(shots.map(e=>e.speed)).size>=4);assert(shots.some((e,i)=>i>1&&e.lane===shots[i-1].lane&&e.lane===shots[i-2].lane));assert(shots.some((e,i)=>i>0&&e.lane==='low'&&shots[i-1].lane==='low'));
 assert(overlaps>=2,'Combination must have multiple projectiles in flight');assert.equal(r.time,180);assert.equal(r.status,'complete');assert.deepEqual(r.pulses,[60,120,180]);
 for(const boundary of [60,120]){const charge=r.events.find(e=>e.type==='charge'&&e.time>=boundary);assert(charge.time>=boundary+3.8-1e-8);const shot=r.events.find(e=>e.type==='release'&&e.id===charge.id);assert(shot.time-charge.time>=.95-1e-8);}
}
console.log('Milestones passed for both characters: 800ms recoil, 2000ms stun, 500ms recovery, 500ms breathing; frozen on pause, no overlapping shots, full warning restart, exact 180s and multiple projectiles during bursts.');

const pressure=make('claude');pressure.unlimitedLives=true;pressure.start();while(pressure.status==='playing')pressure.advance(1/60);const phases=[0,1,2].map(i=>{const shots=pressure.events.filter(e=>e.type==='release'&&e.time>=i*60&&e.time<(i+1)*60);return {shots:shots.length,mean:shots.reduce((a,e)=>a+e.speed,0)/shots.length};});for(let i=1;i<3;i++){assert(phases[i].shots>phases[i-1].shots);assert(phases[i].mean>phases[i-1].mean*1.15);}console.log('Increasing boss pressure:',phases);
