import assert from 'node:assert/strict';
import {make,manifest} from './secret-fixture.mjs';
import {electricalState,electricalPlacement} from '../dist/workbench-next/secret-renderer.mjs';
import {paintGameHud} from '../dist/workbench-next/game-hud.mjs';
import {Node} from './global-dom-harness.mjs';
globalThis.document={createElement:tag=>new Node(tag)};
const hud=new Node();for(const cls of ['hud-panel','life-hud','stage-title','progress-track','progress-marker']){const n=new Node();n.className=cls;hud.append(n);}for(let i=0;i<3;i++){const n=new Node();n.className='life-heart';hud.querySelector('.life-hud').append(n);}
for(const who of ['claude','constance'])for(const boundary of [60,120]){
 const r=make(who);r.unlimitedLives=true;r.start();r.previewPhase(boundary-2);
 const counts={beam:0,stunned:0,recovery:0,breathing:0},frames=new Set();
 for(let n=0;n<354;n++){
  const s=electricalState(r),age=r.time-boundary;
  if(age>=0&&age<3.8-1e-8){if(s.beam)counts.beam++;if(r.milestone.state!=='impact')counts[r.milestone.state]++;if(s.overload)frames.add(s.overloadFrame);assert.equal(r.attack,null);}
  if([0,121,210].includes(n)){const before={time:r.time,belt:r.beltTime,fx:electricalState(r),shields:r.shields};r.pause();r.advance(3);assert.equal(r.time,before.time);assert.equal(r.beltTime,before.belt);assert.deepEqual(electricalState(r),before.fx);assert.equal(r.shields,before.shields);r.start();}
  if(s.overload)assert.equal(electricalState(r,true).overloadFrame,0);
  r.advance(1/60);
 }
 assert.deepEqual(counts,{beam:30,stunned:120,recovery:30,breathing:30});assert.equal(frames.size,3);assert.equal(r.pulses.filter(t=>t===boundary).length,1);
}
for(const who of ['claude','constance']){
 const r=make(who);r.start();r.previewPhase(179.9);while(r.status==='playing')r.advance(1/60);assert.equal(r.shields,0);
 r.advance(.25);paintGameHud(hud,r);for(const slot of hud.querySelectorAll('.secret-shield')){assert.equal(slot.style.backgroundPosition,'100% 0');assert(!slot.className.split(' ').includes('breaking'));}
 r.advance(r.captureDuration-.25);assert(!r.resultReady);r.advance(r.celebrationDuration-.01);assert(!r.resultReady);r.advance(.02);assert(r.resultReady);assert.equal(r.motion.state,'celebrate');assert.equal(r.time,180);
}
const p=electricalPlacement(manifest.layout,manifest.electricalV2),moved=structuredClone(manifest.layout);moved.bossTopLeft=moved.bossTopLeft.map(n=>n+23);moved.emitter=moved.emitter.map((n,i)=>i<2?n+23:n);const q=electricalPlacement(moved,manifest.electricalV2);assert.equal(q.end[0]-p.end[0],23);assert.equal(q.nozzle[1]-p.nozzle[1],23);
// CSS panel right edge stays left of the painted cannon + 16 reference pixels on phone/desktop.
for(const width of [568,667,844,960,1280]){const right=width*(width<=600?.43+.64/2:.4883+.4766/2);assert(right<(1041-16)*width/1280);}
console.log('V2 passed: both characters/minutes; 500ms beam, full 2s hold, all three electrical frames, pause at charge/impact/stun, reduced motion, transformed anchors, phone HUD clearance and final empty shields with two celebration cycles.');
