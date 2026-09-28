import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {descriptors} from '../dist/workbench-next/model.mjs';
import {landscapeDescriptors} from '../dist/workbench-next/landscape.mjs';
import {ProjectDraft,projectProvenance} from '../dist/workbench-next/project.mjs';
import {runtimeSnapshot,PlayRuntime} from '../dist/workbench-next/play-runtime.mjs';
const c={window:{}};vm.createContext(c);
for(const f of JSON.parse(fs.readFileSync('authoring/workbench-next/source-files.json')))vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);
const w=c.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);
const items=descriptors(config,w.GAME_SCHEMA),stages=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog=JSON.parse(fs.readFileSync('dist/workbench-next/asset-catalog.json'));
const draft=new ProjectDraft(items,stages,catalog.dimensions,projectProvenance(catalog,items,stages),catalog.migrations,config);
draft.landscapes.na01.mid.y+=7;draft.placement['hazard:na01:0'].scale=.27;
const before=JSON.stringify(draft.export());
const snapshot=(stage='na01',character='claude',difficulty='standard')=>runtimeSnapshot({config,draft,items,catalog,stage,character,difficulty});
let cases=0;
for(const stage of stages)for(const who of ['claude','constance'])for(const difficulty of ['easy','standard','hard']){
 const s=snapshot(stage.stage,who,difficulty);const run=new PlayRuntime(s,{unlimitedLives:true});run.start();
 for(let i=0;i<5500;i++)run.tick();
 assert.equal(run.status,'complete');assert(run.spawned>0);assert(run.hits>0,'standing player should contact hazards');assert.equal(run.lives,config.spawnDirector.startingLives);cases++;
}
const detached=snapshot();const run=new PlayRuntime(detached);assert.equal(run.draft.landscapes.na01.mid.y,draft.landscapes.na01.mid.y);
run.start();run.action('jump');run.advance(.2);const y=run.motion.y;assert(y<0);run.pause();const t=run.time;run.advance(1);assert.equal(run.time,t);run.tick(true);assert(run.time>t);
assert.equal(run.snapshot.draft.placement['hazard:na01:0'].scale,.27);assert.equal(JSON.stringify(draft.export()),before);
const fail=new PlayRuntime(snapshot());fail.start();for(let i=0;i<5500;i++)fail.tick();assert.equal(fail.status,'failed');assert.equal(fail.lives,0);assert.equal(fail.action('jump'),false);
const a=new PlayRuntime(snapshot(),{unlimitedLives:true}),b=new PlayRuntime(snapshot(),{unlimitedLives:true});a.start();b.start();for(let i=0;i<5400;i++)a.advance(1/60);for(let i=0;i<10800;i++)b.advance(1/120);assert.deepEqual(a.events,b.events);assert.equal(a.steps,b.steps);
const recovery=new PlayRuntime(snapshot(),{unlimitedLives:true});recovery.start();while(!recovery.hits)recovery.tick();assert.equal(recovery.action('slide'),false);const hits=recovery.hits;for(let i=0;i<60;i++)recovery.tick();assert.equal(recovery.hits,hits);
console.log(JSON.stringify({stageCharacterDifficultyRuns:cases,frames60and120:'same events',damageRecoveryPauseSnapshot:'passed',allPriorDraftFields:'unchanged'}));
// Actual PNG decode and renderer smoke check using the shipped assets.
const {createRequire}=await import('node:module');
const {createCanvas,loadImage}=createRequire(import.meta.url)('@napi-rs/canvas');
const {runtimeAssetKeys,drawRuntime}=await import('../dist/workbench-next/play-runtime.mjs');
const visual=new PlayRuntime(snapshot(),{unlimitedLives:true}),images={};
for(const key of runtimeAssetKeys(visual.snapshot)){const source=catalog.assets[key].split('?')[0];images[key]=await loadImage(new URL('../dist/workbench-next/'+source,import.meta.url));}
visual.start();visual.advance(8);const canvas=createCanvas(960,540);drawRuntime(canvas,visual,images,w.CC_LANDSCAPE_CONTRACT,{boxes:true});fs.writeFileSync('../play-na01-check.png',canvas.toBuffer('image/png'));console.log('Runtime PNG rendering passed');

// Verify restored original stars animate on hit frame 2, with the proper character row.
for(const who of ['claude','constance']){
 const hit=new PlayRuntime(snapshot('na01',who),{unlimitedLives:true});hit.start();hit.motion.setState('hit');hit.motion.update(.2);assert.equal(hit.motion.frame,1);
 const calls=[],context=canvas.getContext('2d'),original=context.drawImage.bind(context);context.drawImage=(im,...args)=>{if(im===images.stars)calls.push(args);return original(im,...args);};
 drawRuntime(canvas,hit,images,w.CC_LANDSCAPE_CONTRACT);hit.motion.update(.11);drawRuntime(canvas,hit,images,w.CC_LANDSCAPE_CONTRACT);context.drawImage=original;
 assert.equal(calls.length,2);assert.notEqual(calls[0][0],calls[1][0]);assert.equal(calls[0][1],who==='claude'?0:150);
 if(who==='claude')fs.writeFileSync('../play-hit-stars-check.png',canvas.toBuffer('image/png'));
}
console.log('Original stun stars: both rows and changing animation frames verified.');

// Checked Design encounters retain their geometry and never auto-play avoidance actions in Game.
const encounter={id:'hazard:na01:0',flight:'high',start:2,exit:12,speed:300,local:{claude:3,constance:3},action:'jump'};
const checked={stage:'na01',profile:'standard',verified:true,duration:13,events:[encounter]};
const sharedSnapshot=runtimeSnapshot({config,draft,items,catalog,stage:'na01',sequence:checked});
const shared=new PlayRuntime(sharedSnapshot,{unlimitedLives:true});shared.start();shared.advance(1);
assert.equal(shared.spawned,1);assert.equal(shared.motion.state,'run');assert.equal(shared.active[0].start,2);assert.equal(shared.active[0].startX,config.objectQA.x);
shared.pause();assert.equal(shared.motion.state,'idle');assert.equal(shared.action('jump'),false);const frozen=shared.time;shared.advance(1);assert.equal(shared.time,frozen);shared.start();assert.equal(shared.motion.state,'run');
assert.equal(runtimeSnapshot({config,draft,items,catalog,stage:'na02',sequence:checked}).sequence,null);
assert.equal(runtimeSnapshot({config,draft,items,catalog,stage:'na01',difficulty:'hard',sequence:checked}).sequence,null);
assert.equal(JSON.stringify(draft.export()),before);
console.log('Checked sequence handoff, manual input, gameplay pause and snapshot isolation passed.');

for(const who of ['claude','constance']){
 const r=new PlayRuntime(snapshot('na01',who),{unlimitedLives:true});r.start();r.advance(8);r.pause();
 const time=r.time,geometry=JSON.stringify(r.geometry().hazards),clouds=r.cloudTime,idle=r.motion.elapsed;
 r.advance(.2);assert.equal(r.time,time);assert.equal(JSON.stringify(r.geometry().hazards),geometry);assert(r.cloudTime>clouds);assert(r.motion.elapsed>idle);assert.equal(r.motion.state,'idle');
 r.start();r.steps=Math.ceil(r.duration/(1/60))-1;r.active=[];r.spawned=r.profile.count;r.tick();assert.equal(r.status,'complete');
 const finishTime=r.time,frame=r.motion.frame;r.advance(1/r.config.state.celebrate.fps+.001);assert.equal(r.motion.state,'celebrate');assert.notEqual(r.motion.frame,frame);assert.equal(r.time,finishTime);assert(r.celebrationTime>0);
}
console.log('Both characters: Idle/clouds animate during frozen pause; Celebrate animates after finish.');

// Terminal overlays do not stop the presentation animation clock.
for(const who of ['claude','constance']){
 const r=new PlayRuntime(snapshot('na01',who));r.start();for(let i=0;i<5500;i++)r.tick();assert.equal(r.status,'failed');
 const time=r.time,hits=r.hits,stars=r.motion.starT,hazards=JSON.stringify(r.geometry().hazards);
 r.advance(.11);assert.equal(r.motion.state,'hit');assert.equal(r.motion.frame,1);assert(r.motion.starT>stars);assert.equal(r.time,time);assert.equal(r.hits,hits);assert.equal(JSON.stringify(r.geometry().hazards),hazards);
 const complete=new PlayRuntime(snapshot('na01',who));complete.status='complete';complete.motion.setState('celebrate');
 const cycle=complete.config.state.celebrate.frames/complete.config.state.celebrate.fps;complete.advance(cycle+.01);const frame=complete.motion.frame,cloud=complete.cloudTime;
 complete.advance(1/complete.config.state.celebrate.fps);assert.notEqual(complete.motion.frame,frame);assert(complete.cloudTime>cloud);
}
console.log('Terminal overlays: both characters keep celebrating/clouds scrolling or stun stars animating; gameplay stays frozen.');

import {checkHeldSlide} from './held-slide-qa.mjs';
for(const who of ['claude','constance'])checkHeldSlide(()=>new PlayRuntime(snapshot('na01',who),{unlimitedLives:true}));
