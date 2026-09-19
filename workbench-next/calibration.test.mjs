import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {descriptors} from './model.mjs';
import {landscapeDescriptors} from './landscape.mjs';
import {ProjectDraft,projectProvenance,PRE_CALIBRATION_FORMAT,PRE_CHARACTER_LINK_FORMAT,PROJECT_STORAGE_KEY} from './project.mjs';
import {sceneGeometry,STEP} from './scene-model.mjs';
import {calibrationStamp,calibrationReferenceStamp,timingProfileStamp,PROFILES,effectivePlacement,profileConfig} from './calibration-settings.mjs';
import {analyzeHazard,optimizeHazard,meetsProfile,makeSequence} from './calibration-engine.mjs';
import {createMotion} from './runtime-rules.mjs';
const context={window:{}};vm.createContext(context);
for(const name of JSON.parse(fs.readFileSync(new URL('./source-files.json',import.meta.url),'utf8')))vm.runInContext(fs.readFileSync(new URL('../'+name,import.meta.url),'utf8'),context);
const w=context.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);
const items=descriptors(config,w.GAME_SCHEMA),stages=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog=JSON.parse(fs.readFileSync(new URL('./asset-catalog.json',import.meta.url)));
const make=()=>new ProjectDraft(items,stages,catalog.dimensions,projectProvenance(catalog,items,stages),catalog.migrations,config);
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};};
const find=id=>items.find(i=>i.id===id),hazard=find('hazard:na01:0');
const art={left:.30,right:.70,top:.20,bottom:.95,warnings:[]};

test('shared path moves both characters and linked ground/HIGH/LOW hazards; local edits and manual hazards stay independent',()=>{
 const d=make(),fly=find('hazard:na01:2');
 const geometry=(who,h,flight)=>sceneGeometry({config,stage:'na01',draft:d,character:find(`character:${who}:run`),hazard:h,flight});
 const before=geometry('claude',hazard,'high'),bFly=geometry('constance',fly,'low');
 const c=structuredClone(d.calibration);c.stages.na01.pathY+=15;d.editCalibration(c);
 assert.equal(geometry('claude',hazard,'high').character.foot-before.character.foot,15);
 assert.equal(geometry('claude',hazard,'high').hazard.anchor-before.hazard.anchor,15);
 assert.equal(geometry('constance',fly,'low').character.foot-bFly.character.foot,15);
 assert.equal(geometry('constance',fly,'low').hazard.anchor-bFly.hazard.anchor,15);
 assert.equal(effectivePlacement(d,fly).highClearance,d.placement[fly.id].highClearance-15);
 d.editPlacement('grounding:na01:claude',{groundOffset:7});assert.equal(geometry('claude',hazard,'high').character.foot-before.character.foot,22);
 assert.equal(geometry('claude',hazard,'high').hazard.anchor-before.hazard.anchor,15);
 const off=structuredClone(d.calibration);off.hazards[hazard.id].follow=false;d.editCalibration(off);assert.equal(effectivePlacement(d,hazard).groundOffset,d.placement[hazard.id].groundOffset);
 assert.equal(d.calibration.stages.eu01.pathY,d.calibration.stages.eu01.originY);
});

test('v5 migration retains all edits and locks only custom hazard fields; v8 round trips calibration in one transaction',()=>{
 const old=make(),store=memory();old.editPlacement(hazard.id,{...old.placement[hazard.id],cw:.25});old.editPlacement('grounding:na01:claude',{groundOffset:12});
 const payload=old.export();payload.format=PRE_CALIBRATION_FORMAT;for(const [id,p] of Object.entries(payload.placement))if(id.startsWith('hazard:'))for(const k of ['flipX','highOffsetY','lowOffsetY'])delete p[k];delete payload.calibration;const raw=JSON.stringify(payload);store.setItem(PRE_CALIBRATION_FORMAT,raw);
 const d=make();d.load(store);assert.equal(d.placement[hazard.id].cw,.25);assert.deepEqual(d.calibration.hazards[hazard.id].locks,['cw']);assert.equal(d.calibration.stages.na01.pathY,d.calibration.stages.na01.originY);
 const before=d.export(),c=structuredClone(d.calibration),p=structuredClone(d.placement);c.profile='hard';c.profiles.hard.count=14;c.stages.na01.pathY+=8;p[hazard.id].ch=.3;d.editCalibration(c,p);const after=d.export();
 d.undo();assert.deepEqual(d.export(),before);d.redo();assert.deepEqual(d.export(),after);d.save(store);assert.equal(store.getItem(PRE_CALIBRATION_FORMAT),raw);assert.ok(store.getItem(PROJECT_STORAGE_KEY));
 const restored=make();restored.load(store);assert.deepEqual(restored.export(),after);assert.equal(restored.dirty,false);
 const extreme=structuredClone(payload);for(const who of ['claude','constance']){extreme.placement[`character:${who}`].footOffset=300;extreme.placement[`grounding:na01:${who}`].groundOffset=300;}const high=make(),highStore=memory();high.applyImport(high.prepareImport(extreme),highStore);high.save(highStore);const highReload=make();highReload.load(highStore);assert.equal(highReload.calibration.stages.na01.pathY,1010);
 const target=make(),review=target.prepareImport(after);assert.ok(review.rows.some(r=>r.element==='Automation'));target.applyImport(review,memory());assert.deepEqual(target.export(),after);
 for(const mutate of [x=>x.calibration.profiles.easy.count=2.5,x=>x.calibration.profiles.hard.groundSpeed=0,x=>x.calibration.stages.na01.pathY=Infinity,x=>x.calibration.hazards[hazard.id].locks=['noSuchField']]){const bad=structuredClone(after);mutate(bad);assert.throws(()=>target.prepareImport(bad));assert.deepEqual(target.export(),after);}
});

test('proposals never mutate a draft, preserve manual locks and grounding, and invalidate when either character changes',async()=>{
 const d=make();d.editPlacement(hazard.id,{...d.placement[hazard.id],cw:.25,groundOffset:31});const c=structuredClone(d.calibration);c.hazards[hazard.id].follow=false;d.editCalibration(c);const before=d.export();
 const row=await optimizeHazard({config,draft:d,items,item:hazard,art});assert.deepEqual(d.export(),before);assert.equal(row.placement.cw,.25);assert.equal(row.placement.groundOffset,31);
 const stamp=calibrationStamp(d,hazard,config);d.editPlacement('character:constance:slide',{...d.placement['character:constance:slide'],ch:.6});assert.notEqual(calibrationStamp(d,hazard,config),stamp);
 const updated=calibrationStamp(d,hazard,config);d.edit('character:claude:run',0,{l:1,r:0,t:0,b:0});assert.notEqual(calibrationStamp(d,hazard,config),updated);
 assert.throws(()=>{const bad=structuredClone(d.calibration);bad.profiles.easy.minWindowMs=0;d.editCalibration(bad);});
 await assert.rejects(()=>optimizeHazard({config,draft:d,items,item:hazard,art,cancelled:()=>true}),/cancelled/);
});

test('bounded optimization reports impossible geometry and proves complete generated sequences with the scene renderer equations',async()=>{
 const d=make(),row=await optimizeHazard({config,draft:d,items,item:hazard,art});assert.equal(row.ready,true);d.placement[hazard.id]=row.placement;
 const configBefore=JSON.stringify(config),charactersBefore=JSON.stringify(Object.entries(d.placement).filter(([id])=>id.startsWith('character:')));
 for(const profile of ['easy','standard','hard']){
  d.calibration.profile=profile;const report=analyzeHazard({config,draft:d,items,item:hazard});
  // Higher Easy margin may exclude a particular hazard; it must never force a pass.
  if(!report.pass){assert.equal(profile,'easy');continue;}
  for(const c of Object.values(report.characters)){assert.equal(c.threat,true);assert.ok(c.best.width*1000>=report.minimumMs);}
  const reports=[{id:hazard.id,stage:hazard.stage,ready:true,reports:[report]}],args={config,draft:d,items,reports,stage:'na01',seed:123},seq=makeSequence(args);assert.deepEqual(makeSequence(args),seq);assert.equal(seq.events.length,d.calibration.profiles[profile].count);
  for(const who of ['claude','constance']){const cfg=profileConfig(config,d.calibration),motion=createMotion(cfg);let next=0;
   for(let n=0;n<=Math.ceil(seq.duration/STEP);n++){const time=n*STEP;if(next<seq.events.length&&time+1e-8>=seq.events[next].start+seq.events[next].local[who]){motion.triggerJump();next++;}
    const g=sceneGeometry({config:cfg,draft:d,stage:'na01',character:find(`character:${who}:${motion.state}`),hazard,motion,time,looping:false,encounters:seq.events.map(e=>({...e,item:hazard}))});assert.equal(g.contact,false,`${profile}/${who}/${n}`);motion.update(STEP);
   }assert.equal(next,seq.events.length);
  }
 }
 assert.equal(JSON.stringify(config),configBefore);assert.equal(JSON.stringify(Object.entries(d.placement).filter(([id])=>id.startsWith('character:'))),charactersBefore);
 d.placement[hazard.id]={...d.placement[hazard.id],scale:2,cw:2,ch:2};d.calibration.hazards[hazard.id].locks=['scale','cw','ch','groundOffset','cx','cy'];const impossible=await optimizeHazard({config,draft:d,items,item:hazard,art});assert.equal(impossible.ready,false);assert.equal(impossible.placement.cw,2);
});


test('shared proposals and certification are independent of selected difficulty; every previously passing profile is preserved',async()=>{
 const d=make(),before=d.export(),rows=[];
 for(const profile of PROFILES){d.calibration.profile=profile;rows.push(await optimizeHazard({config,draft:d,items,item:hazard,art}));}
 for(const row of rows){assert.deepEqual(row.placement,rows[0].placement);assert.deepEqual(row.profiles,rows[0].profiles);assert.equal(row.stamp,rows[0].stamp);assert.deepEqual(Object.keys(row.profiles),PROFILES);for(const p of PROFILES)if(meetsProfile(row.beforeProfiles[p]))assert.equal(meetsProfile(row.profiles[p]),true,`must preserve ${p}`);}
 assert.deepEqual(d.placement,before.placement);const stamp=calibrationStamp(d,hazard,config);d.calibration.profile='easy';assert.equal(calibrationStamp(d,hazard,config),stamp);
});

test('only relevant timing inputs invalidate profile checks; speed or density edits never alter shared placement',()=>{
 const d=make(),fly=find('hazard:na01:2'),geometry=calibrationReferenceStamp(d,hazard,config),original=structuredClone(d.placement);
 const signatures=()=>Object.fromEntries([hazard,fly].map(item=>[item.id,PROFILES.map(p=>timingProfileStamp(d.calibration,item,p))]));
 const before=signatures(),certified=calibrationStamp(d,hazard,config);
 d.calibration.profiles.hard.count=14;d.calibration.profiles.hard.spacingSeconds=2;d.calibration.profile='hard';
 assert.deepEqual(signatures(),before);assert.equal(calibrationStamp(d,hazard,config),certified);
 d.calibration.profiles.hard.flyingSpeed+=10;const flying=signatures();assert.deepEqual(flying[hazard.id],before[hazard.id]);assert.notEqual(flying[fly.id][2],before[fly.id][2]);assert.deepEqual(flying[fly.id].slice(0,2),before[fly.id].slice(0,2));
 d.calibration.profiles.easy.minWindowMs+=20;assert.notEqual(signatures()[hazard.id][0],before[hazard.id][0]);assert.notEqual(signatures()[fly.id][0],before[fly.id][0]);assert.equal(calibrationReferenceStamp(d,hazard,config),geometry);assert.notEqual(calibrationStamp(d,hazard,config),certified);assert.deepEqual(d.placement,original);
 const save=memory();d.save(save);const restored=make();restored.load(save);assert.deepEqual(restored.export(),d.export());
});


test('per-stage character links preserve every pose, rebase atomically, and persist independently',()=>{
 const d=make(),move=n=>{const c=structuredClone(d.calibration);c.stages.na01.pathY+=n;d.editCalibration(c);};
 const geometry=(who='claude',state='run',stage='na01')=>sceneGeometry({config,stage,draft:d,character:find(`character:${who}:${state}`),hazard:find(`hazard:${stage}:0`)});
 const poses=()=>Object.fromEntries(items.filter(i=>i.type==='character').map(i=>[i.id,geometry(i.id.split(':')[1],i.state).character]));
 const other=geometry('claude','run','eu01');move(23);const before=d.export(),beforePoses=poses(),hazardY=geometry().hazard.anchor;
 d.setCharacterFollow('na01','claude',false);assert.deepEqual(poses(),beforePoses);assert.equal(d.placement['grounding:na01:claude'].groundOffset,before.placement['grounding:na01:claude'].groundOffset+23);
 d.undo();assert.deepEqual(d.export(),before);d.redo();assert.equal(d.calibration.stages.na01.characterFollow.claude,false);
 move(17);assert.equal(geometry().character.foot,beforePoses['character:claude:run'].foot);assert.equal(geometry('constance').character.foot,beforePoses['character:constance:run'].foot+17);assert.equal(geometry().hazard.anchor,hazardY+17);assert.deepEqual(geometry('claude','run','eu01'),other);
 d.editPlacement('grounding:na01:claude',{groundOffset:8});const edited=poses();d.setCharacterFollow('na01','claude',true);assert.deepEqual(poses(),edited);move(-9);assert.equal(geometry().character.foot,edited['character:claude:run'].foot-9);
 d.setCharacterFollow('na01','constance',false);const store=memory();d.save(store);const loaded=make();loaded.load(store);assert.deepEqual(loaded.export(),d.export());const target=make();target.applyImport(target.prepareImport(d.export()),memory());assert.deepEqual(target.export(),d.export());
 const extreme=make(),c=structuredClone(extreme.calibration);c.stages.na01.pathY=1200;extreme.editCalibration(c);const snapshot=extreme.export(),history=extreme.past.length;assert.throws(()=>extreme.setCharacterFollow('na01','claude',false),/range/);assert.deepEqual(extreme.export(),snapshot);assert.equal(extreme.past.length,history);
});

test('v6 migration preserves current geometry and automation; invalid link imports cannot mutate a draft',()=>{
 const old=make(),c=structuredClone(old.calibration);c.stages.na01.pathY+=27;c.profile='hard';c.profiles.easy.minWindowMs=190;c.hazards[hazard.id].follow=false;c.hazards[hazard.id].locks=['cw'];old.editCalibration(c);old.editPlacement('grounding:na01:claude',{groundOffset:-11});
 const payload=old.export();payload.format=PRE_CHARACTER_LINK_FORMAT;for(const [id,p] of Object.entries(payload.placement))if(id.startsWith('hazard:'))for(const k of ['flipX','highOffsetY','lowOffsetY'])delete p[k];payload.calibration.version=1;for(const stage of Object.values(payload.calibration.stages))delete stage.characterFollow;
 const store=memory(),raw=JSON.stringify({...payload,savedAt:'2026-09-19T12:00:00.000Z'});store.setItem(PRE_CHARACTER_LINK_FORMAT,raw);const d=make();d.load(store);assert.deepEqual(d.export(),old.export());assert.equal(d.migrated,true);assert.equal(d.dirty,true);
 const geometry=draft=>sceneGeometry({config,stage:'na01',draft,character:find('character:claude:run'),hazard});assert.deepEqual(geometry(d),geometry(old));d.save(store);assert.equal(store.getItem(PRE_CHARACTER_LINK_FORMAT),raw);assert.ok(store.getItem(PROJECT_STORAGE_KEY));
 const baseline=d.export();for(const mutate of [x=>x.calibration.stages.na01.characterFollow.claude='false',x=>delete x.calibration.stages.eu01.characterFollow.constance,x=>x.calibration.stages.na01.characterFollow.other=true,x=>x.calibration.version=1]){const bad=structuredClone(baseline);mutate(bad);assert.throws(()=>d.prepareImport(bad));assert.deepEqual(d.export(),baseline);}
 const malformed=structuredClone(payload);malformed.calibration.stages.na01.characterFollow={claude:false,constance:true};assert.throws(()=>d.prepareImport(malformed));
});

test('solver actor cache respects character links even when every numeric placement stays unchanged',()=>{
 const d=make(),c=structuredClone(d.calibration);c.stages.na01.pathY+=95;d.editCalibration(c);
 const before=analyzeHazard({config,draft:d,items,item:hazard});const unlinked=structuredClone(d.calibration);unlinked.stages.na01.characterFollow.claude=false;d.editCalibration(unlinked);
 const after=analyzeHazard({config,draft:d,items,item:hazard});const fresh=make();fresh.editCalibration(d.calibration,d.placement);assert.deepEqual(after,analyzeHazard({config,draft:fresh,items,item:hazard}));assert.notDeepEqual(after.characters.claude,before.characters.claude);assert.deepEqual(after.characters.constance,before.characters.constance);
});
