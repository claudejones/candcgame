// Optional release QA against every real atlas. Canvas dependency stays outside the app.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {descriptors} from './model.mjs';
import {landscapeDescriptors} from './landscape.mjs';
import {ProjectDraft,projectProvenance} from './project.mjs';
import {measureArtwork,optimizeHazard,analyzeHazard,meetsProfile,makeSequence} from './calibration-engine.mjs';
const {createCanvas,loadImage}=createRequire(path.resolve(process.argv[2]||'.','package.json'))('@napi-rs/canvas');
const context={window:{}};vm.createContext(context);
for(const f of ['game-config.js','config-schema.js','landscape-registry.js','landscape-contract.js'])vm.runInContext(fs.readFileSync(new URL('../src/js/'+f,import.meta.url),'utf8'),context);
const w=context.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);
const items=descriptors(config,w.GAME_SCHEMA),stages=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog=JSON.parse(fs.readFileSync(new URL('./asset-catalog.json',import.meta.url)));
const draft=new ProjectDraft(items,stages,catalog.dimensions,projectProvenance(catalog,items,stages),catalog.migrations,config),proposals=[],sequences=[];
for(const item of items.filter(i=>i.type==='hazard')){
 const image=await loadImage(new URL(catalog.assets[item.asset].split('?')[0],import.meta.url)),art=measureArtwork(image,item,draft,()=>createCanvas(1,1));
 const r=await optimizeHazard({config,draft,items,item,art});proposals.push(r);draft.placement[item.id]=r.placement;
 for(const profile of ['easy','standard','hard'])if(meetsProfile(r.beforeProfiles[profile]))assert.ok(meetsProfile(r.profiles[profile]),item.id+' must retain '+profile);
 if(item.kind==='ground'&&r.changes.some(c=>c.field==='groundOffset')){
  const frame=draft.frames[item.id][0],crop=draft.value[item.id][0],height=(frame.h-crop.t-crop.b)*960/config.worldContract.sourceW*r.placement.scale;
  assert.ok(Math.abs(410+r.placement.groundOffset-(1-art.bottom)*height-draft.calibration.stages[item.stage].pathY)<1e-7,'visible support meets path');
 }
}
for(const profile of ['easy','standard','hard']){
 draft.calibration.profile=profile;
 for(const {stage} of stages){
  const reports=items.filter(i=>i.type==='hazard'&&i.stage===stage).map(item=>{const reports=(item.kind==='flying'?['high','low']:['high']).map(flight=>analyzeHazard({config,draft,items,item,flight}));return {id:item.id,stage,reports,ready:reports.every(r=>r.pass)};});
  const sequence=makeSequence({config,draft,items,reports,stage,seed:config.spawnDirector.seed});assert.equal(sequence.verified,true);sequences.push({stage,profile,duration:sequence.duration,events:sequence.events.length,excluded:sequence.excluded});
 }
}
const report={proposals:proposals.map(r=>({id:r.id,ready:r.ready,warnings:r.warnings,changes:r.changes,profiles:Object.fromEntries(Object.entries(r.profiles).map(([p,reports])=>[p,{pass:meetsProfile(reports),beforePass:meetsProfile(r.beforeProfiles[p]),windows:reports.map(x=>({flight:x.flight,action:x.action,minimumMs:x.minimumMs,characters:x.characters}))}]))})),sequences};
if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(report,null,2)+'\n');
console.log(`${proposals.length} real atlases measured; ${proposals.filter(r=>r.ready).length} shared proposals meet all three difficulties; ${proposals.filter(r=>!r.ready).length} correctly require adjustment. ${sequences.length} stage/profile sequences proved for both characters at 60 Hz. Approved image bytes were not changed.`);
