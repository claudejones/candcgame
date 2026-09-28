import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {descriptors} from '../dist/workbench-next/model.mjs';import {landscapeDescriptors} from '../dist/workbench-next/landscape.mjs';import {ProjectDraft,projectProvenance} from '../dist/workbench-next/project.mjs';
import {secretSnapshot,SecretRuntime} from '../dist/workbench-next/secret-runtime.mjs';import {drawSecret} from '../dist/workbench-next/secret-renderer.mjs';
const context={window:{}};vm.createContext(context);for(const file of JSON.parse(fs.readFileSync('authoring/workbench-next/source-files.json')))vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
const w=context.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);
const items=descriptors(config,w.GAME_SCHEMA),landscapes=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog=JSON.parse(fs.readFileSync('dist/workbench-next/asset-catalog.json')),draft=new ProjectDraft(items,landscapes,catalog.dimensions,projectProvenance(catalog,items,landscapes),catalog.migrations,config);


const decoded=draft.decode(JSON.parse(fs.readFileSync('../auto-solved.json'))).state;Object.assign(draft,{value:decoded.crops,frames:decoded.frames,placement:decoded.placement,landscapes:decoded.landscapes,calibration:decoded.calibration});
const {analyzeProfiles,makeSequence}=await import('../dist/workbench-next/calibration-engine.mjs');
const signatures=new Set();let checked=0;
for(const stage of landscapes.map(s=>s.stage))for(const difficulty of ['easy','standard','hard']){
 const d={...draft,calibration:{...draft.calibration,profile:difficulty}};
 const reports=items.filter(i=>i.type==='hazard'&&i.stage===stage).map(item=>{const reports=analyzeProfiles({config,draft:d,items,item,profiles:[difficulty]})[difficulty];return {id:item.id,stage,reports,ready:reports.every(r=>r.pass)};});
 const seq=makeSequence({config,draft:d,items,reports,stage,seed:config.spawnDirector.seed});
 let flying=0,ground=0,low=0,high=0;for(const e of seq.events){const item=items.find(i=>i.id===e.id);if(item.kind==='ground'){assert.equal(e.speed,seq.groundSpeed);ground++;flying=0;}else{flying++;assert(flying<=2);e.flight==='low'?low++:high++;}}
 assert(ground>0&&low>0&&high>0);signatures.add(JSON.stringify(seq.events.map(e=>[e.action,e.flight,e.start,e.speed])));checked++;
 if(stage==='na01'){const repeat=makeSequence({config,draft:d,items,reports,stage,seed:config.spawnDirector.seed});assert.deepEqual(repeat,seq);}
}
assert.equal(signatures.size,63);console.log(`${checked} distinct stage/difficulty patterns; replay determinism, mixed ground/low/high, max two consecutive flyers, shared ground velocity passed.`);
