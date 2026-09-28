import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {descriptors} from '../dist/workbench-next/model.mjs';import {landscapeDescriptors} from '../dist/workbench-next/landscape.mjs';import {ProjectDraft,projectProvenance} from '../dist/workbench-next/project.mjs';
import {secretSnapshot,SecretRuntime} from '../dist/workbench-next/secret-runtime.mjs';import {drawSecret} from '../dist/workbench-next/secret-renderer.mjs';
const context={window:{}};vm.createContext(context);for(const file of JSON.parse(fs.readFileSync('authoring/workbench-next/source-files.json')))vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
const w=context.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);
const items=descriptors(config,w.GAME_SCHEMA),landscapes=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog=JSON.parse(fs.readFileSync('dist/workbench-next/asset-catalog.json')),draft=new ProjectDraft(items,landscapes,catalog.dimensions,projectProvenance(catalog,items,landscapes),catalog.migrations,config);

const {prepareOptimization,applyOptimization}=await import('../dist/workbench-next/auto-optimization.mjs');
const {measureArtwork,analyzeProfiles,meetsAll}=await import('../dist/workbench-next/calibration-engine.mjs');
const {createCanvas,loadImage}=createRequire(import.meta.url)('@napi-rs/canvas');
const payload=JSON.parse(fs.readFileSync('authoring/fixtures/optimization-project-v8.json'));const decoded=draft.decode(payload).state;
Object.assign(draft,{value:decoded.crops,frames:decoded.frames,placement:decoded.placement,landscapes:decoded.landscapes,calibration:decoded.calibration});
const measure=async(item,d)=>measureArtwork(await loadImage(new URL('../dist/workbench-next/'+catalog.assets[item.asset].split('?')[0],import.meta.url)),item,d,()=>createCanvas(1,1));
const original=structuredClone(draft.export()),started=Date.now();
const plan=await prepareOptimization({config,draft,items,measure,onProgress:({item,index,total})=>{if(item)console.log(index+1+'/'+total,item.name);}});
applyOptimization(draft,plan);
console.log(JSON.stringify({seconds:(Date.now()-started)/1000,ready:plan.rows.filter(r=>r.ready).length,issues:plan.rows.filter(r=>!r.ready).map(r=>r.issue)}));
fs.writeFileSync('../auto-solved.json',JSON.stringify(draft.export()));
for(const [id,h] of Object.entries(original.calibration.hazards))for(const field of h.locks)assert.equal(draft.placement[id][field],original.placement[id][field]);
assert.deepEqual(draft.calibration.profiles,original.calibration.profiles);assert.deepEqual(draft.landscapes,original.design.landscapes);assert.deepEqual(draft.frames,original.design.frames);
for(const [id,p] of Object.entries(original.placement))if(!id.startsWith('hazard:'))assert.deepEqual(draft.placement[id],p);
assert.equal(plan.rows.filter(r=>!r.ready).length,0,'all imported hazards must qualify');
const noChange=await prepareOptimization({config,draft,items,measure});assert.equal(noChange.checked,0);
console.log('Original overrides, character configuration, art and global profiles retained. Repeated save skips unchanged hazards.');
// Export/reload preserves derived settings, and v8 browser saves migrate without losses.
const {PROJECT_STORAGE_KEY,PRE_AUTO_FORMAT}=await import('../dist/workbench-next/project.mjs');
const memory=new Map(),storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
applyOptimization(draft,noChange,storage);const restored=new ProjectDraft(items,landscapes,catalog.dimensions,projectProvenance(catalog,items,landscapes),catalog.migrations,config);restored.load(storage);assert.deepEqual(restored.placement,draft.placement);assert.deepEqual(restored.calibration,draft.calibration);
const legacyStorage={getItem:k=>k===PRE_AUTO_FORMAT?JSON.stringify(payload):null};const legacy=new ProjectDraft(items,landscapes,catalog.dimensions,projectProvenance(catalog,items,landscapes),catalog.migrations,config);legacy.load(legacyStorage);assert.deepEqual(legacy.placement,original.placement);
const beforeFailure=JSON.stringify(draft.export()),history=draft.past.length;
assert.throws(()=>applyOptimization(draft,noChange,{getItem:storage.getItem,setItem(){throw Error('Quota exceeded');}}),/Quota/);assert.equal(JSON.stringify(draft.export()),beforeFailure);assert.equal(draft.past.length,history);
await assert.rejects(prepareOptimization({config,draft,items,measure,force:true,cancelled:()=>true}),/cancelled/);assert.equal(JSON.stringify(draft.export()),beforeFailure);
const cal=structuredClone(draft.calibration);cal.stages.na01.pathY+=8;draft.editCalibration(cal);const moved=await prepareOptimization({config,draft,items,measure});assert.equal(moved.checked,3);applyOptimization(draft,moved);
const beforeGlobal=structuredClone(draft.calibration);beforeGlobal.profiles.easy.minWindowMs=166;draft.editCalibration(beforeGlobal);const global=await prepareOptimization({config,draft,items,measure});assert.equal(global.checked,63);assert(global.rows.every(r=>r.ready));applyOptimization(draft,global);
console.log('Save/reload, v8 migration, atomic save failure, cancellation, stage grounding (3 affected), and global edit (63 affected) passed.');
const {makeSequence}=await import('../dist/workbench-next/calibration-engine.mjs');const {runtimeSnapshot,PlayRuntime}=await import('../dist/workbench-next/play-runtime.mjs');
let sequences=0,runs=0;
for(const stage of landscapes.map(s=>s.stage))for(const difficulty of ['easy','standard','hard']){
 const d={...draft,calibration:{...draft.calibration,profile:difficulty}};
 const reports=items.filter(i=>i.type==='hazard'&&i.stage===stage).map(item=>{const reports=analyzeProfiles({config,draft:d,items,item,profiles:[difficulty]})[difficulty];return {id:item.id,stage,reports,ready:reports.every(r=>r.pass)};});
 const seq=makeSequence({config,draft:d,items,reports,stage,seed:config.spawnDirector.seed});assert.equal(seq.excluded.length,0);sequences++;
 for(const who of ['claude','constance']){
  const run=new PlayRuntime(runtimeSnapshot({config,draft:d,items,catalog,stage,character:who,difficulty,sequence:seq}));run.start();let next=0;
  // Runtime resolves movement on the next fixed step; inputs are placed at the
  // preceding frame boundary, as normal keyboard/touch input is received.
  while(run.status==='playing'&&run.time<run.duration+5){
   if(next<seq.events.length&&run.time+1e-8>=seq.events[next].start+seq.events[next].local[who]){run.action(seq.events[next++].action);}
   run.tick();
  }
  assert.equal(run.hits,0,`${stage}/${difficulty}/${who}`);assert.equal(run.status,'complete');runs++;
 }
 console.log('Checked',stage,difficulty);
}
console.log(JSON.stringify({checkedStageProfiles:sequences,zeroHitCharacterRuns:runs}));
