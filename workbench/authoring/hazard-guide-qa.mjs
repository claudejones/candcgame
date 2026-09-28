import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {Node,findButton} from './global-dom-harness.mjs';
import {descriptors} from '../dist/workbench-next/model.mjs';import {landscapeDescriptors} from '../dist/workbench-next/landscape.mjs';import {ProjectDraft,projectProvenance} from '../dist/workbench-next/project.mjs';
import {setupGlobalGame} from '../dist/workbench-next/global-game.mjs';
import {hazardGuideEntries} from '../dist/workbench-next/hazard-guide.mjs';
const ctx={window:{}};vm.createContext(ctx);for(const f of JSON.parse(fs.readFileSync('authoring/workbench-next/source-files.json')))vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),ctx);
const w=ctx.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);const items=descriptors(config,w.GAME_SCHEMA),landscapes=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog=JSON.parse(fs.readFileSync('dist/workbench-next/asset-catalog.json')),draft=new ProjectDraft(items,landscapes,catalog.dimensions,projectProvenance(catalog,items,landscapes),catalog.migrations,config);

const memory=new Map(),panel=new Node(),surface=new Node();panel.append(surface);
globalThis.document={createElement:t=>new Node(t),hidden:false,addEventListener(){}};globalThis.matchMedia=()=>({matches:true});globalThis.requestAnimationFrame=()=>1;
globalThis.fetch=async path=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('dist/workbench-next/'+path))});globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
const data={items,catalog,draft},ui=await setupGlobalGame({panel,surface,guideData:data,getRun:()=>null,pause(){}});ui.open();const root=panel.querySelector('#global-game');
await findButton(root,'How to Play').click();assert(root.textContent.includes('Desktop controls'));
await findButton(root,'Hazard Guide').click();assert.equal(findButton(root,'Hazard Guide').getAttribute('aria-selected'),'true');
let count=0;const before=JSON.stringify(draft.export()),saved=JSON.stringify([...memory]);
for(const c of ['NA','SA','EU','AF','AS','OC','AN']){
 assert.equal(root.querySelectorAll('select').length,0);
 const groups=root.querySelectorAll('.global-hazard-stage');assert.equal(groups.length,3);assert.equal(groups[0].querySelector('h3').id,'game-guide-'+c+'01');
 for(let n=1;n<=3;n++){
  const stage=c+'0'+n;const entries=hazardGuideEntries(data,stage);
  assert(entries.length>=3,stage);assert.equal(groups[n-1].querySelectorAll('.global-hazard-card').length,entries.length);
  for(const e of entries){const s=e.source;assert(s.w>0&&s.h>0&&s.x>=0&&s.y>=0&&s.x+s.w<=e.size.width&&s.y+s.h<=e.size.height,e.name);assert(fs.existsSync('dist/workbench-next/'+e.url.split('?')[0]),e.url);assert(e.name&&e.description&&e.action);count++;}
 }
 await findButton(root,'Next').click();
}
// Paging wraps and Previous returns to Antarctica.
assert.equal(root.querySelector('.global-hazard-stage').querySelector('h3').id,'game-guide-NA01');
await findButton(root,'Previous').click();
assert.equal(JSON.stringify(draft.export()),before);assert.equal(JSON.stringify([...memory]),saved);
findButton(root,'Hazard Guide').onkeydown({key:'ArrowLeft',preventDefault(){}});assert.equal(findButton(root,'Game Guide').getAttribute('aria-selected'),'true');assert(root.textContent.includes('Continent passports'));
await findButton(root,'Hazard Guide').click();assert.equal(root.querySelector('.global-hazard-stage').querySelector('h3').id,'game-guide-AN01');
await findButton(root,'Back').click();assert(root.textContent.includes('Choose your character'));
console.log(`How to Play tabs, keyboard navigation, seven continent pages, all 21 grouped stages / ${count} hazard cards, atlas crop bounds, original image paths and read-only browsing passed. No browser-layout claim.`);
