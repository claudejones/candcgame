import fs from 'node:fs';import assert from 'node:assert/strict';import {Node,findButton} from './global-dom-harness.mjs';import {setupGlobalGame} from '../dist/workbench-next/global-game.mjs';import {best,STAGES} from '../dist/workbench-next/player-state.mjs';
const panel=new Node(),surface=new Node();panel.append(surface);const memory=new Map();
globalThis.document={createElement:t=>new Node(t),hidden:false,addEventListener(){}};globalThis.matchMedia=()=>({matches:true});globalThis.requestAnimationFrame=()=>1;
globalThis.fetch=async path=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('dist/workbench-next/'+path))});globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
let run=null,launches=0,lastSelection=null;const ui=await setupGlobalGame({panel,surface,pause(){if(run.status==='playing')run.status='paused';},getRun:()=>run,launch:async selection=>{launches++;lastSelection=selection;run={status:'ready',lives:3,stage:selection.stage,celebrationTime:0,config:{state:{celebrate:{frames:4,fps:8}}}};}});
const root=panel.querySelector('#global-game');ui.open();await findButton(root,'New Game').click();assert(root.querySelector('.global-stage-drawer').hidden);await findButton(root,'Stages').click();assert(root.textContent.includes('Stage 1'));assert.equal(root.querySelectorAll('.global-stage-route').length,14);assert.deepEqual(root.querySelectorAll('.global-continent-order').map(n=>n.textContent),['1','2','3','4','5','6','7']);assert(!/\b(?:NA|SA|EU|AF|AS|OC|AN)0[123]\b/.test(root.textContent));await findButton(root,'Play').click();assert.equal(launches,1);
run.status='complete';ui.update(run);assert.equal(best(ui.store.state,'standard','NA01'),3);ui.update(run);assert.equal(Object.keys(ui.store.state.outcomes).length,1);
let result=surface.querySelector('.global-result');assert(!result.textContent.includes('Perfect Stage Run!'));run.celebrationTime=.99;ui.update(run);assert(!result.textContent.includes('Perfect Stage Run!'));run.celebrationTime=1;ui.update(run);assert(result.textContent.includes('Perfect Stage Run!'));assert(result.textContent.includes('Stage 1 · Desert'));assert(!result.textContent.includes('NA01'));assert(!result.querySelectorAll('button').some(b=>b.textContent==='Achievements'));assert.deepEqual(result.querySelectorAll('button').map(b=>b.textContent),['Next Stage','Replay','Map']);
await findButton(result,'Replay').click();assert.equal(launches,2);ui.update(run);assert.equal(Object.keys(ui.store.state.outcomes).length,1);run.status='failed';run.lives=0;ui.update(run);assert(result.textContent.includes('GAME OVER'));assert.deepEqual(result.querySelectorAll('button').map(b=>b.textContent),['Retry','Map','Main Menu']);await findButton(result,'Retry').click();assert.equal(run.lives,3);
const menu=surface.querySelector('.global-run-menu');run.status='playing';await menu.querySelector('button').click();assert.equal(run.status,'paused');await findButton(root,'Options').click();const unlimited=root.querySelectorAll('button').find(b=>b.getAttribute('aria-label')==='Unlimited Health');await unlimited.click();await findButton(root,'Confirm').click();assert(ui.store.state.attempt.assisted);assert(run.unlimitedLives);await findButton(root,'Back').click();await findButton(root,'Back to Game').click();assert.equal(run.status,'paused');run.status='complete';run.celebrationTime=4;ui.update(run);assert(result.textContent.includes('No new rewards'));
await findButton(result,'Map').click();await findButton(root,'Achievements').click();for(let i=0;i<7;i++)await findButton(root,'Next').click();assert(root.textContent.includes('SECRET LEVEL'));assert(root.textContent.includes('8/8'));
// Validate every runtime image URL produced, including dynamically selected frames.
const manifest=JSON.parse(fs.readFileSync('dist/assets/global-ui/manifest.json'));for(const r of Object.values(manifest))assert(fs.existsSync('dist/assets/global-ui/'+r.file));
console.log('Global UI event flows passed: startup → map → result, replay/failure/retry, focused result actions, pause menu, sticky assistance, and locked eighth page. No browser-layout claim.');

for(const who of ['claude','constance']){
 ui.store.newJourney(who,'easy');ui.open();
 assert.equal(root.querySelector('.global-continue').textContent,'Continue');assert.equal(root.querySelector('.global-continue-detail'),null);
 await root.querySelector('.global-continue').click();
 assert.equal(lastSelection.character,who);assert.equal(lastSelection.difficulty,'easy');assert.equal(run.status,'ready');assert.equal(run.lives,3);
 run.status='playing';run.lives=1;ui.store.save();const oldAttempt=ui.store.state.attempt.id;ui.open();await root.querySelector('.global-continue').click();
 assert.notEqual(ui.store.state.attempt.id,oldAttempt);assert.equal(run.status,'ready');assert.equal(run.lives,3);
 run.status='failed';run.lives=0;ui.update(run);assert.equal(ui.store.state.pending[0].kind,'stage');
 const records=JSON.stringify(ui.store.state.ratings),outcomes=Object.keys(ui.store.state.outcomes).length;
 ui.open();await root.querySelector('.global-continue').click();assert.equal(run.status,'ready');assert.equal(run.lives,3);assert.equal(run.stage,'na01');assert.equal(ui.store.state.pending.length,0);
 assert.equal(JSON.stringify(ui.store.state.ratings),records);assert.equal(Object.keys(ui.store.state.outcomes).length,outcomes);assert(!lastSelection.result);
}
console.log('Continue passed for both characters: saved/failed runs restart at three hearts, preserve selections/rewards, and never restore Game Over.');
// Secret entry and its three-state reward reuse the main screen and result framework.
ui.open();assert(!root.querySelectorAll('button').some(b=>b.textContent==='Beneath the Ice'));
for(const id of STAGES)ui.store.state.ratings.standard[id]={claude:3};const ordinaryJourney=JSON.stringify(ui.store.state.journey);ui.store.setOption('unlimited',false);ui.open();
await findButton(root,'Beneath the Ice').click();assert.equal(lastSelection.stage,'secret01');assert.equal(lastSelection.difficulty,'standard');assert.equal(JSON.stringify(ui.store.state.journey),ordinaryJourney);
run.kind='secret';run.status='complete';run.resultReady=false;ui.update(run);assert(ui.store.state.secret.earned);assert(!surface.querySelector('.global-result').textContent.includes('SECRET COMPLETE'));run.resultReady=true;ui.update(run);assert(surface.querySelector('.global-result').textContent.includes('Secret passport earned!'));
const count=Object.keys(ui.store.state.secret.outcomes).length;ui.update(run);assert.equal(Object.keys(ui.store.state.secret.outcomes).length,count);
await findButton(surface.querySelector('.global-result'),'Main Menu').click();assert.equal(root.querySelector('.global-continue').textContent,'Continue');const oldSecretAttempt=ui.store.state.secret.attempt.id;await root.querySelector('.global-continue').click();assert.notEqual(ui.store.state.secret.attempt.id,oldSecretAttempt);assert.equal(lastSelection.stage,'secret01');assert.equal(run.lives,3);
console.log('Secret UI passed: gated shortcut, separate cursor, immediate launch, capture-before-overlay, single passport, and stage-start Continue.');

// A retained perfect best must not describe a one-heart replay as perfect.
ui.store.setOption('unlimited',false);ui.store.newJourney('claude','standard');ui.open();await root.querySelector('.global-continue').click();run.status='complete';run.lives=1;run.celebrationTime=4;ui.update(run);assert(result.textContent.includes('Stage Complete!'));assert(!result.textContent.includes('Perfect Stage Run!'));assert(result.textContent.includes('Best: 3/3'));
console.log('Result wording distinguishes a perfect current run from a retained perfect best.');

ui.open();await findButton(root,'New Game').click();await findButton(root,'Confirm').click();await findButton(root,'Achievements').click();await findButton(root,'Back').click();assert(root.querySelector('.global-stage-drawer').hidden);console.log('Back from achievements keeps the default stage drawer closed.');

// Pause-menu navigation returns to the map without awarding an unfinished run.
ui.store.newJourney('claude','standard');ui.open();await root.querySelector('.global-continue').click();run.status='playing';
const rewardsBeforeMap=JSON.stringify(ui.store.state.ratings),attemptBeforeMap=ui.store.state.attempt.id;
await menu.querySelector('button').click();await findButton(root,'Back to map').click();assert(root.textContent.includes('Return to the map?'));await findButton(root,'Confirm').click();assert.equal(surface.dataset.globalScreen,'map');assert.equal(JSON.stringify(ui.store.state.ratings),rewardsBeforeMap);
await findButton(root,'Stages').click();await root.querySelectorAll('button').find(b=>b.textContent==='Play'||b.textContent==='Replay').click();assert.notEqual(ui.store.state.attempt.id,attemptBeforeMap);assert.equal(run.lives,3);
console.log('Back to map: confirmation, preserved rewards, fresh stage attempt passed.');
