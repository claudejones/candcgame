import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Node,findButton} from './global-dom-harness.mjs';
import {setupGlobalGame} from '../dist/workbench-next/global-game.mjs';
import {PlayerStore,STAGES} from '../dist/workbench-next/player-state.mjs';
import {screenScenario,SCREEN_SCENARIOS} from '../dist/workbench-next/screen-scenarios.mjs';
globalThis.document={createElement:t=>new Node(t),hidden:false,addEventListener(){}};
globalThis.matchMedia=()=>({matches:false});globalThis.requestAnimationFrame=()=>1;
globalThis.fetch=async path=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('dist/workbench-next/'+path))});
Object.defineProperty(globalThis,'localStorage',{get(){throw Error('Preview touched real player storage');}});
const memory=new Map(),store=new PlayerStore({getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)}),panel=new Node(),surface=new Node();panel.append(surface);let launches=0;
const ui=await setupGlobalGame({panel,surface,previewStore:store,pause(){},getRun:()=>null,launch:async()=>{launches++;}});
let count=0;
for(const stage of STAGES)for(const character of ['claude','constance'])for(const [kind] of SCREEN_SCENARIOS){
 const fixture=screenScenario({kind,stage,character,difficulty:'standard',hearts:2});const before=JSON.stringify(fixture);ui.preview(fixture);assert.equal(JSON.stringify(fixture),before);count++;
 const root=panel.querySelector('#screens-global-game'),result=surface.querySelector('.global-result');
 if(kind==='map')assert.equal(root.querySelectorAll('.global-stage-route').length,14);
 if(kind==='failed')assert(result.textContent.includes('GAME OVER'));
 if(kind==='perfect')assert(result.textContent.includes('PERFECT PASSPORT'));
 if(kind==='continue'){await root.querySelector('.global-continue').click();assert(launches>0);}
 if(kind==='save-error'){await findButton(panel,'Retry Save').click();assert.equal(store.status,'saved');}
}
assert.equal(panel.querySelector('#global-game'),null);
console.log(`${count} shared screen renders passed across all stages and both characters; fixture inputs unchanged, Continue and Retry Save isolated, real storage inaccessible.`);

// Contextual information stays with its control; only failures open the dialog.
ui.preview(screenScenario({kind:'start',stage:'NA01',character:'claude',difficulty:'standard',progress:'empty'}));
let root=panel.querySelector('#screens-global-game');const hard=root.querySelectorAll('button').find(b=>b.textContent==='Hard');await hard.click();assert(root.querySelector('.global-difficulty-help').textContent.includes('21 stages'));assert(panel.querySelector('.global-notice').hidden);
ui.preview(screenScenario({kind:'level-select-locked',stage:'NA01',character:'claude',difficulty:'standard'}));root=panel.querySelector('#screens-global-game');let select=findButton(root,'Level Select');assert(select.querySelector('img'));await select.click();assert(root.querySelector('.global-level-select-help').textContent.includes('locked'));assert(panel.querySelector('.global-notice').hidden);
ui.preview(screenScenario({kind:'level-select-unlocked',stage:'NA01',character:'claude',difficulty:'standard'}));root=panel.querySelector('#screens-global-game');select=findButton(root,'Level Select');assert(!select.querySelector('img'));await select.click();assert(root.textContent.includes('WORLD MAP'));assert.equal(root.querySelectorAll('.global-cloud-flow').length,1);assert.equal(root.querySelectorAll('.global-cloud').length,12);
await findButton(root,'Save').click();assert(root.textContent.includes('Saved'));assert(panel.querySelector('.global-notice').hidden);assert(!panel.textContent.includes('Saved on this device.'));
ui.preview(screenScenario({kind:'map',stage:'NA01',character:'claude',difficulty:'standard',progress:'empty'}));root=panel.querySelector('#screens-global-game');assert(!root.textContent.includes('Complete Stage'));await findButton(root,'Locked').click();assert(root.querySelector('.global-stage-requirement').textContent.includes('Desert Mesas'));
ui.preview(screenScenario({kind:'about',stage:'NA01',character:'claude',difficulty:'standard'}));root=panel.querySelector('#screens-global-game');for(const text of ['Desktop controls','Mobile controls','Hearts and trophies','Continent passports','Unlock Hard and Level Select','Unlock Beneath the Ice'])assert(root.textContent.includes(text));
console.log('Cleanup UI passed: contextual locks, Level Select states, silent save success, continuous cloud track, stage requirements on demand, and About requirements.');

ui.preview(screenScenario({kind:'map',stage:'NA01',character:'claude',difficulty:'standard',progress:'empty'}));
root=panel.querySelector('#screens-global-game');let drawer=root.querySelector('.global-stage-drawer');const toggle=findButton(root,'Stages');assert(drawer.hidden);await toggle.click();assert(!drawer.hidden);await findButton(drawer,'Close').click();assert(drawer.hidden);assert.equal(toggle.getAttribute('aria-expanded'),'false');await toggle.click();assert(!drawer.hidden);drawer.onkeydown({key:'Escape',preventDefault(){}});assert(drawer.hidden);
await root.querySelectorAll('.global-continent').find(b=>b.getAttribute('aria-label').startsWith('ASIA')).click();drawer=root.querySelector('.global-stage-drawer');assert(!drawer.hidden);assert(drawer.textContent.includes('Kyoto'));assert.equal(drawer.parentElement.className,'global-map-body');
ui.preview(screenScenario({kind:'start',stage:'NA01',character:'claude',difficulty:'standard'}));root=panel.querySelector('#screens-global-game');assert.equal(root.querySelector('.global-continue'),null,'fresh title hides Continue');assert.equal(root.querySelector('.global-continue-detail'),null);
ui.preview(screenScenario({kind:'achievements',stage:'NA01',character:'claude',difficulty:'standard'}));root=panel.querySelector('#screens-global-game');assert(root.querySelector('.global-reward-mode-help'));await findButton(root,'Hard').click();assert(root.querySelector('.global-reward-mode-help').textContent.includes('Hard unlocks'));await findButton(root,'Easy').click();assert(root.querySelector('.global-reward-mode-help').textContent.includes('Easy trophies'));
console.log('Drawer open/close/Escape, continent selection, simple Continue and persistent mode-help slots passed.');

for(const stage of ['NA01','SA02','OC01']){
 const fixture=screenScenario({kind:'travel-plane',stage,character:'constance',difficulty:'standard'});assert(fixture.stage.endsWith('03'));ui.preview(fixture);assert(panel.querySelector('.global-travel-plane'));assert.equal(ui.travelDuration(),5200);
 const plane=panel.querySelector('.global-travel-plane');ui.setTravelProgress(.25);assert(!plane.hidden);assert(panel.querySelector('#global-map-pin').hidden);ui.setTravelProgress(.75);assert(plane.hidden);assert(!panel.querySelector('#global-map-pin').hidden);assert.equal(panel.querySelector('.global-travel-plane'),plane,'scrubbing must not rebuild map DOM');
}
const stageTravel=screenScenario({kind:'travel',stage:'SA03',character:'claude',difficulty:'standard'});assert.equal(stageTravel.stage,'SA02');ui.preview(stageTravel);assert.equal(panel.querySelector('.global-travel-plane'),null);assert.equal(ui.travelDuration(),3600);assert.equal(panel.querySelectorAll('.global-stage-number').length,0);
console.log('Explicit plane preview: routes, both directions, arrival hold, stable scrub renderer, original unnumbered destinations and separate stage-only travel passed.');
