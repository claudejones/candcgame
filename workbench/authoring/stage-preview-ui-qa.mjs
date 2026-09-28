import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {descriptors} from '../dist/workbench-next/model.mjs';import {landscapeDescriptors} from '../dist/workbench-next/landscape.mjs';import {ProjectDraft,projectProvenance} from '../dist/workbench-next/project.mjs';import {setupSceneEditor} from '../dist/workbench-next/scene-ui.mjs';import {setupCalibration} from '../dist/workbench-next/calibration-ui.mjs';import {Node} from './global-dom-harness.mjs';import {finishGeometry,FINISH_BASE_RATIO} from '../dist/workbench-next/stage-settings.mjs';
const {createCanvas,loadImage}=createRequire(import.meta.url)('@napi-rs/canvas');
const ctx={window:{}};vm.createContext(ctx);for(const f of JSON.parse(fs.readFileSync('authoring/workbench-next/source-files.json')))vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),ctx);
const w=ctx.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);const items=descriptors(config,w.GAME_SCHEMA),landscapes=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog=JSON.parse(fs.readFileSync('dist/workbench-next/asset-catalog.json')),draft=new ProjectDraft(items,landscapes,catalog.dimensions,projectProvenance(catalog,items,landscapes),catalog.migrations,config);
const payload=JSON.parse(fs.readFileSync(process.argv[2]||'authoring/fixtures/combination-project-v9.json')),d=draft.decode(payload).state;Object.assign(draft,{...d,value:d.crops});
const nodes=new Map([...fs.readFileSync('dist/workbench-next/index.html','utf8').matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Node()]));
Node.prototype.add=function(n){this.append(n);};Node.prototype.addEventListener=function(type,fn){(this.listeners??={})[type]=fn;};Node.prototype.scrollIntoView=function(){};
const q=Node.prototype.querySelectorAll;Node.prototype.querySelectorAll=function(selector){if(selector.includes('['))return [];return q.call(this,selector);};
const $=id=>nodes.get(id)||[...nodes.values()].flatMap(n=>n.querySelectorAll?.('#'+id)||[])[0]||null;
globalThis.Option=function(text,value){const n=new Node('option');n.textContent=text;n.value=String(value);return n;};
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
const windowHandlers={};globalThis.window={addEventListener(t,f){(windowHandlers[t]??=[]).push(f);}};globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};
globalThis.document={getElementById:$,createElement:t=>new Node(t),createTextNode:t=>t,querySelector:()=>new Node(),hidden:false};
for(const id of ['preview','baseline']){const canvas=createCanvas(960,540);canvas.classList={toggle(){},remove(){},add(){}};canvas.setAttribute=()=>{};canvas.addEventListener=()=>{};canvas.getBoundingClientRect=()=>({width:960,height:540,left:0,top:0});nodes.set(id,canvas);}
$('scene-motion').value='encounter';$('actor-travel').checked=true;$('sequence-control').value='watch';$('cal-filter').value='all';$('scene-flight').value='high';
const loader={load:async source=>{const im=await loadImage(new URL('../dist/workbench-next/'+source.split('?')[0],import.meta.url));return im;}};
let selected=items.find(i=>i.id==='hazard:na01:0'),scene,cal,errors=[];const stage='na01';
async function reload(){const entries=scene.entries(selected,stage),images=Object.fromEntries(await Promise.all(entries.map(async([key,path])=>[key,await loader.load(path)])));scene.render({selected,stage,images,ready:true});}
scene=setupSceneEditor({config,contract:w.CC_LANDSCAPE_CONTRACT,items,landscapes,catalog,draft,active:()=>true,reload,changed(){},message:(m,e)=>{if(e)errors.push(m);},calibration:()=>cal});
cal=setupCalibration({config,draft,items,catalog,loader,stageGroups:new Map([['World',landscapes.map(s=>({id:s.stage,label:s.stage}))]]),getStage:()=>stage,navigate:async id=>{selected=items.find(i=>i.id===id);await reload();},scene:()=>scene,changed(){},message:(m,e)=>{if(e)errors.push(m);}});
await reload();await $('generate-sequence').onclick();assert.deepEqual(errors,[]);assert(scene.sequenceActive());assert(!$('stage-preview-tools').hidden);assert($('sequence-timeline').children.length===5);
scene.seekSequence(54);assert.equal(Number($('sequence-time').value),54);assert(!$('actor-play').disabled);assert($('actor-jump').disabled);
$('sequence-control').value='play';$('sequence-control').onchange();assert(!$('actor-jump').disabled);$('actor-jump').onclick();scene.step();assert($('actor-pose').textContent.includes('jump'));
$('sequence-combo').value='1';$('sequence-combo').onchange();$('sequence-loop-combo').checked=true;$('sequence-loop-combo').onchange();assert(scene.clock.running);
$('sequence-loop-combo').checked=false;await $('preview-finish').onclick();assert.equal(Number($('sequence-time').value),89);assert(!scene.clock.running);assert($('finish-panel').open);
$('finish-ground').value='15';$('finish-ground').onchange();assert.equal(draft.stageSettings.na01.finish.groundOffset,15);assert.equal(Number($('sequence-time').value),89);
$('scene-character').value='constance';await $('scene-character').onchange();scene.seekSequence(89);assert($('actor-pose').textContent.includes('Constance'));
$('stop-sequence').onclick();assert(!scene.sequenceActive());assert($('stage-preview-tools').hidden);assert.deepEqual(errors,[]);
console.log('Stage UI: one-click preview, five-section timeline, manual play, seek, combination loop, finish controls and both characters passed with original PNG rendering. Event harness, not browser layout QA.');

for(const pattern of ['jump-slide','repeat-jump','mixed'])$('combo-'+pattern).checked=false;
$('combo-hold-slide').onchange();$('combo-length').value='2';$('combo-length').onchange();$('combo-hold').value='3';$('combo-hold').onchange();await $('generate-sequence').onclick();const plan=cal.getSequence();assert(plan.combinations.some(c=>c.heldSeconds>=2.8));assert(plan.events.some(e=>e.action==='jump'));let slides=0;for(const e of plan.events){slides=e.action==='slide'?slides+1:0;assert(slides<=2);}assert.deepEqual(errors,[]);await cal.save(localStorage);assert(!draft.dirty);
console.log('Combination selection, three-second hold override, automatic checking and Save All passed.');

// Shared pathway moves the finish base; per-stage overrides survive that move.
const originalPath=draft.calibration.stages.na01.pathY,originalFinish=structuredClone(draft.stageSettings.na01.finish),marker={width:150,height:350};
const ground=()=>410+draft.placement['character:claude'].footOffset+draft.placement['grounding:na01:claude'].groundOffset+draft.calibration.stages.na01.pathY-draft.calibration.stages.na01.originY;
const beforeFlag=finishGeometry(config,draft,'na01',89,90,120,marker,ground());
$('pathway-y').value=String(originalPath+10);$('pathway-y').onchange();
const afterFlag=finishGeometry(config,draft,'na01',89,90,120,marker,ground());
assert.equal(afterFlag.y-beforeFlag.y,10);assert.deepEqual(draft.stageSettings.na01.finish,originalFinish);assert.equal(afterFlag.y+afterFlag.h*FINISH_BASE_RATIO,ground()+originalFinish.groundOffset);
assert($('finish-pathway').textContent.includes('character’s ground guide'));
console.log('Finish Inspector and shared Stage pathway Y passed: same grounding control, preserved per-stage offsets.');
