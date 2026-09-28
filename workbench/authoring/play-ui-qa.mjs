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
globalThis.document={createElement:tag=>new Node(tag),getElementById:id=>{assert(nodes.has(id),'Missing UI element '+id);return nodes.get(id);},body:{dataset:{}},querySelectorAll:()=>[],addEventListener(){}};globalThis.window={addEventListener(){}};globalThis.Option=class{};globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};globalThis.matchMedia=()=>({matches:false});
globalThis.fetch=async path=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('dist/workbench-next/'+path))});
const playerMemory=new Map();globalThis.localStorage={getItem:k=>playerMemory.get(k)||null,setItem:(k,v)=>playerMemory.set(k,v)};
// Load real images while retaining the browser Image contract used by AssetLoader.
// The loader returns the wrapper, so forward drawImage through its native image.
globalThis.Image=class{get src(){return this.source;}set src(source){this.source=source;loadImage(new URL('../dist/workbench-next/'+source.split('?')[0],import.meta.url)).then(im=>{this.native=im;this.naturalWidth=im.width;this.naturalHeight=im.height;this.width=im.width;this.height=im.height;this.onload?.();}).catch(()=>this.onerror?.());}async decode(){} };
const c2=canvas.getContext('2d'),draw=c2.drawImage.bind(c2);c2.drawImage=(im,...args)=>draw(im.native||im,...args);
let returned=null;const errors=[];const ui=setupPlayModes({config,draft,items,catalog,landscapes,contract:w.CC_LANDSCAPE_CONTRACT,getStage:()=> 'na01',stopDesign(){},returnDesign:s=>returned=s,message:(m,error)=>{if(error)errors.push(m);}});
draft.landscapes.na01.mid.y=13;const before=JSON.stringify(draft.export());
assert(!nodes.has('mode-test'));assert(!html.includes('Functionality audit'));assert(!html.includes('Workbench preview'));
await nodes.get('mode-game').onclick();assert(ui.active());assert.equal(errors.length,0,errors.join());assert.equal(document.body.dataset.mode,'game');
const root=nodes.get('play-workspace').querySelector('#global-game');await findButton(root,'New Game').click();await findButton(root,'Play').click();
assert.equal(nodes.get('run-toggle').disabled,false);assert.equal(nodes.get('run-overlay').hidden,true);assert.equal(nodes.get('run-toggle').textContent,'Pause');assert.equal(nodes.get('run-jump').disabled,false);
nodes.get('run-pause').onpointerdown({button:0,preventDefault(){}});assert.equal(nodes.get('run-pause').textContent,'RESUME');await nodes.get('run-pause').onclick({detail:1});assert.equal(nodes.get('run-overlay').hidden,true);assert.equal(nodes.get('run-pause').textContent,'RESUME');assert.equal(nodes.get('run-jump').disabled,true);
await nodes.get('run-toggle').onclick();assert.equal(nodes.get('run-overlay').hidden,true);
await nodes.get('mode-design').onclick();assert.equal(returned,'na01');assert.equal(JSON.stringify(draft.export()),before);
await nodes.get('mode-game').onclick();await findButton(root,'Constance').click();await findButton(root,'New Game').click();await findButton(root,'Confirm').click();await findButton(root,'Play').click();assert.equal(nodes.get('run-character').value,'constance');assert.equal(errors.length,0);assert.equal(nodes.get('run-toggle').textContent,'Pause');await nodes.get('mode-design').onclick();assert.equal(JSON.stringify(draft.export()),before);
console.log('UI event integration passed: original PNGs, two modes, both characters, immediate Play/Pause/Resume, disabled paused actions, return to Design and unchanged draft. Browser layout not tested.');

await nodes.get('mode-game').onclick();await root.querySelector('.global-continue').click();assert.equal(nodes.get('run-overlay').hidden,true);assert.equal(nodes.get('run-toggle').textContent,'Pause');assert.equal(nodes.get('run-jump').disabled,false);await nodes.get('mode-design').onclick();assert.equal(JSON.stringify(draft.export()),before);console.log('Continue starts the real runtime immediately, with no Ready overlay.');
// Exercise the secret entry through the real play-mode loading hook and shared HUD.
const {freshPlayer,STAGES,PLAYER_KEY}=await import('../dist/workbench-next/player-state.mjs');const unlocked=freshPlayer();for(const id of STAGES)unlocked.ratings.standard[id]={claude:3};playerMemory.set(PLAYER_KEY,JSON.stringify(unlocked));
const hudPanel=new Node();hudPanel.className='hud-panel';nodes.get('run-hud').append(hudPanel);
const secretUI=setupPlayModes({config,draft,items,catalog,landscapes,contract:w.CC_LANDSCAPE_CONTRACT,getStage:()=> 'na01',stopDesign(){},returnDesign:s=>returned=s,message:(m,error)=>{if(error)errors.push(m);}});
await nodes.get('mode-game').onclick();const secretRoot=nodes.get('play-workspace').querySelectorAll('.global-game').filter(n=>n.id==='global-game').at(0);
await findButton(secretRoot,'Beneath the Ice').click();assert.equal(errors.length,0,errors.join());assert.equal(nodes.get('run-stage').value,'secret01');assert.equal(nodes.get('run-overlay').hidden,true);assert.equal(nodes.get('run-toggle').textContent,'Pause');assert.equal(nodes.get('run-hud').querySelector('.secret-timer').textContent,'3:00');
await nodes.get('run-pause').onclick({detail:0});assert.equal(nodes.get('run-pause').textContent,'RESUME');await nodes.get('run-toggle').onclick();assert.equal(nodes.get('run-pause').textContent,'PAUSE');
await nodes.get('mode-design').onclick();assert.equal(JSON.stringify(draft.export()),before);console.log('Secret entry passed with real assets: gated menu → immediate arena → timer/shields → pause/resume → unchanged Design.');
