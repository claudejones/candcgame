import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {descriptors} from '../dist/workbench-next/model.mjs';import {landscapeDescriptors} from '../dist/workbench-next/landscape.mjs';import {ProjectDraft,projectProvenance} from '../dist/workbench-next/project.mjs';
import {secretSnapshot,SecretRuntime} from '../dist/workbench-next/secret-runtime.mjs';import {drawSecret} from '../dist/workbench-next/secret-renderer.mjs';
const context={window:{}};vm.createContext(context);for(const file of JSON.parse(fs.readFileSync('authoring/workbench-next/source-files.json')))vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
const w=context.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);
const items=descriptors(config,w.GAME_SCHEMA),landscapes=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog=JSON.parse(fs.readFileSync('dist/workbench-next/asset-catalog.json')),draft=new ProjectDraft(items,landscapes,catalog.dimensions,projectProvenance(catalog,items,landscapes),catalog.migrations,config);

const {prepareOptimization,applyOptimization}=await import('../dist/workbench-next/auto-optimization.mjs');
const {measureArtwork,analyzeProfiles,meetsAll}=await import('../dist/workbench-next/calibration-engine.mjs');
const {createCanvas,loadImage}=createRequire(import.meta.url)('@napi-rs/canvas');
const measure=async(item,d)=>measureArtwork(await loadImage(new URL('../dist/workbench-next/'+catalog.assets[item.asset].split('?')[0],import.meta.url)),item,d,()=>createCanvas(1,1));
const plan=await prepareOptimization({config,draft,items,measure});applyOptimization(draft,plan);console.log(JSON.stringify({firstOpenReady:plan.rows.filter(r=>r.ready).length,issues:plan.rows.filter(r=>!r.ready).map(r=>r.issue)}));assert(plan.rows.every(r=>r.ready));
const {makeSequence}=await import('../dist/workbench-next/calibration-engine.mjs');let sequences=0;
for(const stage of landscapes.map(s=>s.stage))for(const profile of ['easy','standard','hard']){
 const d={...draft,calibration:{...draft.calibration,profile}};
 const reports=items.filter(i=>i.type==='hazard'&&i.stage===stage).map(item=>{const reports=analyzeProfiles({config,draft:d,items,item,profiles:[profile]})[profile];return {id:item.id,stage,reports,ready:reports.every(r=>r.pass)};});
 assert(makeSequence({config,draft:d,items,reports,stage}).verified);sequences++;
}
console.log('Fresh setup: '+sequences+' shared-speed stage/profile sequences verified for both characters.');
