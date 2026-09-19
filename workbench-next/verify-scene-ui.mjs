import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
// Optional DOM integration check. Supply a directory containing installed jsdom and @napi-rs/canvas.
// This exercises real application handlers with a DOM and canvas; it is not browser layout QA.
const root=fileURLToPath(new URL('..',import.meta.url));
const qaRequire=createRequire(path.resolve(process.argv[2]||root,'package.json'));
const {JSDOM}=qaRequire('jsdom');
let canvas;try{canvas=qaRequire('@napi-rs/canvas');}catch{canvas=createRequire(import.meta.url)('@napi-rs/canvas');}
const {createCanvas,loadImage}=canvas;
const output=process.argv[3];if(output)fs.mkdirSync(output,{recursive:true});
const dom=new JSDOM(fs.readFileSync(root+'/workbench-next/index.html','utf8'),{url:'https://preview.local/workbench-next/',pretendToBeVisual:true,runScripts:'outside-only'}),w=dom.window;
const canvases=new WeakMap(),contexts=new WeakMap();
const backing=node=>{if(!canvases.has(node))canvases.set(node,createCanvas(node.width,node.height));return canvases.get(node);};
for(const key of ['width','height']){const original=Object.getOwnPropertyDescriptor(w.HTMLCanvasElement.prototype,key);Object.defineProperty(w.HTMLCanvasElement.prototype,key,{get:original.get,set(v){original.set.call(this,v);if(canvases.has(this))canvases.get(this)[key]=v;}});}
w.HTMLCanvasElement.prototype.getContext=function(){if(!contexts.has(this)){const ctx=backing(this).getContext('2d');contexts.set(this,new Proxy(ctx,{get(target,key){if(key==='drawImage')return (img,...args)=>target.drawImage(img.bitmap||canvases.get(img)||img,...args);const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;},set(target,key,value){target[key]=value;return true;}}));}return contexts.get(this);};
class ImageStub {set src(url){this.url=url;const p=path.resolve(root+'/workbench-next',url.split('?')[0]);this.promise=loadImage(p).then(img=>{this.bitmap=img;this.width=this.naturalWidth=img.width;this.height=this.naturalHeight=img.height;this.onload?.();}).catch(e=>{this.onerror?.(e);throw e;});}decode(){return this.promise;}}
let rafId=0;const raf=new Map();
Object.assign(globalThis,{window:w,document:w.document,localStorage:w.localStorage,Option:w.Option,Image:ImageStub,ResizeObserver:class{observe(){}},requestAnimationFrame:cb=>{raf.set(++rafId,cb);return rafId;},cancelAnimationFrame:id=>raf.delete(id),fetch:async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(root+'/workbench-next/asset-catalog.json'))})});
w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
for(const name of ['game-config.js','config-schema.js','landscape-registry.js','landscape-contract.js'])vm.runInContext(fs.readFileSync(root+'/src/js/'+name,'utf8'),dom.getInternalVMContext());
const $=id=>w.document.getElementById(id),wait=async()=>{for(let i=0;i<300;i++){if($('loading').hidden)return;if($('loading').classList.contains('failed'))throw new Error($('loading').textContent);await new Promise(r=>setTimeout(r,10));}throw new Error('Loading timeout: '+$('message').textContent);};
const click=id=>$(id).click(),change=(node,value)=>{node.value=value;node.dispatchEvent(new w.Event('change',{bubbles:true}));};
await import(root+'/workbench-next/app.mjs');await wait();
click('character-tab');await wait();assert.equal($('actor-dock').hidden,false);assert.equal($('stage-context').hidden,false);assert.equal($('actor-play').disabled,false);
const ground=()=>w.document.querySelector('input[data-placement="grounding:na01:claude"]');assert.ok(ground());change(ground(),'-12');assert.match($('save-status').textContent,/Unsaved/);
click('actor-step');assert.match($('actor-time').textContent,/Step 1 .*0.02 s/);
click('actor-play');assert.equal(raf.size,1);const tick=time=>{const entries=[...raf];raf.clear();for(const [,cb] of entries)cb(time);};tick(0);tick(1000);assert.match($('actor-time').textContent,/Step 61/);
const focused=ground();focused.focus();focused.value='-13';tick(1100);assert.equal(w.document.activeElement,focused);assert.equal(focused.value,'-13');change(focused,'-13');
click('actor-play');assert.equal(raf.size,0);const frozen=$('actor-time').textContent;await new Promise(r=>setTimeout(r,25));assert.equal($('actor-time').textContent,frozen);
change($('actor-speed'),'0.25');click('actor-play');tick(2000);tick(3000);click('actor-play');assert.match($('actor-time').textContent,/Step 82/);
click('actor-restart');assert.match($('actor-time').textContent,/Step 0/);assert.equal($('actor-play').textContent,'Play scene');
click('save');const key='cc-workbench-next-project-v5';assert.equal(JSON.parse(w.localStorage.getItem(key)).placement['grounding:na01:claude'].groundOffset,-13);
change($('continent'),'Europe');await wait();assert.equal($('actor-dock').hidden,false);assert.ok(w.document.querySelector('input[data-placement="grounding:eu01:claude"]'));
change($('stage'),'eu03');await wait();change(w.document.querySelector('input[data-placement="grounding:eu03:claude"]'),'-19');
if(output)fs.writeFileSync(path.join(output,'scene-character.png'),backing($('preview')).toBuffer('image/png'));
click('frame-view');await wait();assert.equal($('actor-dock').hidden,true);assert.equal($('stage-context').hidden,true);click('atlas-view');assert.equal($('atlas-view').getAttribute('aria-pressed'),'true');click('actor-view');await wait();
click('stage-tab');await wait();const hazardButtons=[...$('hazards').querySelectorAll('button')];hazardButtons[2].click();await wait();assert.equal($('actor-dock').hidden,false);assert.equal($('scene-flight-choice').hidden,false);change($('scene-flight'),'low');change($('scene-character'),'constance');await wait();change($('scene-state'),'slide');await wait();
click('actor-boxes');click('compare');assert.equal(w.document.querySelector('.baseline-card').hidden,false);
const scale=w.document.querySelector('input[data-placement="hazard:eu03:2"][data-field="scale"]');change(scale,'.4');click('undo');assert.equal(scale.value,'0.3');click('redo');assert.equal(scale.value,'0.4');
click('actor-play');tick(0);tick(1000);click('actor-play');if(output)fs.writeFileSync(path.join(output,'scene-hazard.png'),backing($('preview')).toBuffer('image/png'));
click('changes');assert.equal($('project-dialog').open,true);assert.match($('project-changes').textContent,/Placement/);assert.equal(raf.size,0);click('close-project-dialog');
click('save');const saved=JSON.parse(w.localStorage.getItem(key));assert.equal(saved.placement['hazard:eu03:2'].scale,.4);assert.equal(saved.placement['grounding:eu03:claude'].groundOffset,-19);assert.equal(saved.placement['grounding:na01:claude'].groundOffset,-13);
const beforeImport=JSON.stringify(saved);change(w.document.querySelector('input[data-placement="hazard:eu03:2"][data-field="scale"]'),'0.5');
Object.defineProperty($('import-file'),'files',{configurable:true,value:[{name:'roundtrip.json',size:beforeImport.length,text:async()=>beforeImport}]});
await $('import-file').onchange();assert.equal($('project-dialog').open,true);assert.match($('project-changes').textContent,/0.5/);click('apply-import');
assert.equal(w.document.querySelector('input[data-placement="hazard:eu03:2"][data-field="scale"]').value,'0.4');click('undo');assert.equal(w.document.querySelector('input[data-placement="hazard:eu03:2"][data-field="scale"]').value,'0.5');click('redo');
click('actor-play');assert.equal(raf.size,1);Object.defineProperty(w.document,'hidden',{configurable:true,value:true});w.document.dispatchEvent(new w.Event('visibilitychange'));assert.equal(raf.size,0);assert.match($('actor-time').textContent,/Frozen/);
console.log('DOM flow passed: scenes/load, context, focused edits during playback, fixed stepping/freeze/slow motion/restart, frame/atlas return, HIGH/LOW, comparison, undo/redo, save, import/apply/undo and hidden-tab freeze.');
