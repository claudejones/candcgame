import {Node,findButton} from './global-dom-harness.mjs';
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {descriptors} from '../dist/workbench-next/model.mjs';import {landscapeDescriptors} from '../dist/workbench-next/landscape.mjs';import {ProjectDraft,projectProvenance} from '../dist/workbench-next/project.mjs';import {setupPlayModes} from '../dist/workbench-next/play-ui.mjs';
const {createCanvas,loadImage}=createRequire(import.meta.url)('@napi-rs/canvas');
const ctx={window:{}};vm.createContext(ctx);for(const f of JSON.parse(fs.readFileSync('authoring/workbench-next/source-files.json')))vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),ctx);
const w=ctx.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);const items=descriptors(config,w.GAME_SCHEMA),landscapes=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog=JSON.parse(fs.readFileSync('dist/workbench-next/asset-catalog.json')),draft=new ProjectDraft(items,landscapes,catalog.dimensions,projectProvenance(catalog,items,landscapes),catalog.migrations,config);
const html=fs.readFileSync('dist/workbench-next/index.html','utf8');const nodes=new Map([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Node()]));
const canvas=createCanvas(960,540);canvas.focus=()=>{};nodes.set('run-canvas',canvas);const surface=new Node();canvas.parentElement=surface;nodes.get('play-workspace').append(surface);nodes.get('run-character').value='claude';
for(const [id,cls] of [['run-hearts','life-hud'],['run-stage-title','stage-title'],['run-progress','progress-track'],['run-progress-marker','progress-marker'],['run-path','progress-path']]){nodes.get(id).className=cls;nodes.get('run-hud').append(nodes.get(id));}
const hearts=Array.from({length:3},()=>new Node());for(const heart of hearts){heart.className='life-heart';nodes.get('run-hearts').append(heart);}
globalThis.document={createElement:tag=>{if(tag!=='canvas')return new Node(tag);const c=createCanvas(1,1),x=c.getContext('2d'),draw=x.drawImage.bind(x);x.drawImage=(im,...args)=>draw(im.native||im,...args);return c;},getElementById:id=>{assert(nodes.has(id),'Missing UI element '+id);return nodes.get(id);},body:{dataset:{}},querySelectorAll:()=>[],addEventListener(){}};globalThis.window={addEventListener(){}};globalThis.Option=class{};const rafs=new Map();let rid=0;globalThis.requestAnimationFrame=f=>{rafs.set(++rid,f);return rid;};globalThis.cancelAnimationFrame=id=>rafs.delete(id);globalThis.matchMedia=()=>({matches:false});
globalThis.fetch=async path=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('dist/workbench-next/'+path)),arrayBuffer:async()=>new ArrayBuffer(1)});
const playerMemory=new Map();globalThis.localStorage={getItem:k=>playerMemory.get(k)||null,setItem:(k,v)=>playerMemory.set(k,v)};
// Load real images while retaining the browser Image contract used by AssetLoader.
// The loader returns the wrapper, so forward drawImage through its native image.
globalThis.Image=class{get src(){return this.source;}set src(source){this.source=source;loadImage(new URL('../dist/workbench-next/'+source.split('?')[0],import.meta.url)).then(im=>{this.native=im;this.naturalWidth=im.width;this.naturalHeight=im.height;this.width=im.width;this.height=im.height;this.onload?.();}).catch(()=>this.onerror?.());}async decode(){} };
const c2=canvas.getContext('2d'),draw=c2.drawImage.bind(c2);c2.drawImage=(im,...args)=>draw(im.native||im,...args);
const {sharedAudio}=await import('../dist/workbench-next/audio-engine.mjs');
class Param{constructor(){this.value=0;}setValueAtTime(v){this.value=v;}linearRampToValueAtTime(v){this.value=v;}cancelScheduledValues(){}}
class AudioContext{constructor(){this.currentTime=0;this.state='running';this.destination={};}async resume(){}async decodeAudioData(){return {duration:89.424};}createGain(){return {gain:new Param(),connect(){},disconnect(){}};}createBufferSource(){return {connect(){},disconnect(){},start(){},stop(){},onended:null};}}
sharedAudio.contextFactory=()=>new AudioContext();
let returned=null;const errors=[];const ui=setupPlayModes({config,draft,items,catalog,landscapes,contract:w.CC_LANDSCAPE_CONTRACT,getStage:()=> 'na01',stopDesign(){},returnDesign:s=>returned=s,message:(m,error)=>{if(error)errors.push(m);}});
draft.landscapes.na01.mid.y=13;const before=JSON.stringify(draft.export());
assert(!nodes.has('mode-test'));assert(!html.includes('Functionality audit'));assert(!html.includes('Workbench preview'));
await nodes.get('mode-game').onclick();assert(ui.active());assert.equal(errors.length,0,errors.join());assert.equal(document.body.dataset.mode,'game');

let clock=0;for(let i=0;i<920;i++){clock+=100;sharedAudio.ctx.currentTime=clock/1000;const callbacks=[...rafs.values()];rafs.clear();for(const f of callbacks)f(clock);await new Promise(r=>setTimeout(r,1));}
for(let i=0;i<300&&surface.dataset.globalScreen==='loading';i++)await new Promise(r=>setTimeout(r,50));
console.log({screen:surface.dataset.globalScreen,errors,loading:nodes.get('run-loading').textContent});assert.equal(surface.dataset.globalScreen,'demo');assert.deepEqual(errors,[]);console.log('Full Play UI: title audio clock → real stage optimization/loading → checked demo, without firing onended, passed.');
