import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {descriptors} from '../dist/workbench-next/model.mjs';import {landscapeDescriptors} from '../dist/workbench-next/landscape.mjs';import {ProjectDraft,projectProvenance} from '../dist/workbench-next/project.mjs';
import {secretSnapshot,SecretRuntime} from '../dist/workbench-next/secret-runtime.mjs';import {drawSecret} from '../dist/workbench-next/secret-renderer.mjs';
const context={window:{}};vm.createContext(context);for(const file of JSON.parse(fs.readFileSync('authoring/workbench-next/source-files.json')))vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
const w=context.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);
const items=descriptors(config,w.GAME_SCHEMA),landscapes=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog=JSON.parse(fs.readFileSync('dist/workbench-next/asset-catalog.json')),draft=new ProjectDraft(items,landscapes,catalog.dimensions,projectProvenance(catalog,items,landscapes),catalog.migrations,config);

const {analyzeHazard,makeSequence}=await import('../dist/workbench-next/calibration-engine.mjs');
const {PlayRuntime,runtimeSnapshot}=await import('../dist/workbench-next/play-runtime.mjs');
const {encounterPacing,encounterProgress,encounterVariation}=await import('../dist/workbench-next/encounter-pacing.mjs');
for(const profile of Object.values(draft.calibration.profiles)){
 const sections=Array.from({length:5},(_,i)=>encounterPacing(i/5,profile,config));
 for(let i=1;i<5;i++){assert(sections[i].spacing<=sections[i-1].spacing);assert(sections[i].actionGap<=sections[i-1].actionGap);assert(sections[i].maxVisible>=sections[i-1].maxVisible);}
}
let checked=0;
for(const stage of ['na01','na02','na03']){
 const reports=items.filter(i=>i.stage===stage).map(item=>{const reports=(item.kind==='flying'?['high','low']:['high']).map(flight=>analyzeHazard({config,draft,items,item,flight}));return {id:item.id,stage,reports,ready:reports.every(r=>r.pass)};});
 if(reports.some(r=>r.ready)){
  const sequence=makeSequence({config,draft,items,reports,stage});assert(sequence.verified);assert(sequence.events.filter(e=>items.find(i=>i.id===e.id).kind==='ground').every(e=>e.speed===sequence.groundSpeed),'ground props must share terrain speed');assert.deepEqual([...new Set(sequence.events.map(e=>e.phase))],[0,1,2,3,4]);assert.equal(sequence.events.length,draft.calibration.profiles.standard.count*3);
  for(let phase=1;phase<5;phase++)assert(Math.abs(encounterProgress({time:sequence.pacingBoundaries[phase],duration:sequence.duration,sequence})-phase/5)<1e-8);
  checked++;console.log('Verified five-section sequence:',stage,sequence.events.length,'events');
 }
}
for(const stage of landscapes.map(l=>l.stage)){
 const r=new PlayRuntime(runtimeSnapshot({config,draft,items,catalog,stage}),{unlimitedLives:true});r.start();let multiple=false;const speeds=new Set(),actions=[];let seen=0;while(r.status==='playing'){r.advance(1/60);if(r.active.length>1)multiple=true;for(const e of r.active){speeds.add(e.speed);if(e.serial>=seen){actions.push(e.item.kind==='flying'&&e.flight==='high'?'slide':'jump');seen=e.serial+1;}}}
 assert.equal(r.status,'complete');assert(multiple,stage+' must allow concurrent hazards');assert(speeds.size>2,stage+' must vary speed');assert(actions.some((a,i)=>i&&actions[i-1]===a),stage+' must repeat actions as well as switch');
}
console.log('Pacing passed: monotonic five-section curves, 21 stages with concurrent hazards,',checked,'verified continuous sequence plans. Unqualified geometry is not certified.');

for(let phase=0;phase<5;phase++){
 const curves=['easy','standard','hard'].map(d=>encounterPacing(phase/5,draft.calibration.profiles[d],config,d));
 assert(curves[0].actionGap>=curves[1].actionGap&&curves[1].actionGap>=curves[2].actionGap);
 const speeds=['easy','standard','hard'].map(d=>encounterVariation(2,phase,d).speedFactor*draft.calibration.profiles[d].groundSpeed);
 assert(speeds[0]<=speeds[1]&&speeds[1]<speeds[2]);
}
console.log('Easy/Standard/Hard speed and reaction-spacing separation verified across all five sections.');
