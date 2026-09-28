import assert from 'node:assert/strict';
import {make} from './secret-fixture.mjs';
for(const who of ['claude','constance'])for(const hz of [30,60,120])for(const lead of [.18,.26,.34]){
 const r=make(who),acted=new Set(),crossed=new Set();let min=Infinity,max=-Infinity,paused=false,reversedInAir=false,previousDirection=1;r.start();
 while(r.status==='playing'){
  for(const p of r.active){const velocity=r.motion.state==='jump'?r.airVelocity:r.beltVelocity,eta=(p.x-r.config.characterX)/(p.speed+velocity);if(eta<lead&&!acted.has(p.serial)){if(r.action(p.lane==='low'?'jump':'slide'))acted.add(p.serial);}}
  const savedAir=r.airVelocity,wasJump=r.motion.state==='jump';r.advance(1/hz);
  min=Math.min(min,r.config.characterX);max=Math.max(max,r.config.characterX);
  assert(r.config.characterX>=82.5&&r.config.characterX<=292.5);
  if(wasJump&&r.motion.state==='jump')assert.equal(r.airVelocity,savedAir);
  if(previousDirection!==r.beltDirection&&r.motion.state==='jump')reversedInAir=true;previousDirection=r.beltDirection;
  for(const p of r.active)if(p.x<=r.config.characterX&&!crossed.has(p.serial)){
   crossed.add(p.serial);const event=r.events.find(e=>e.type==='charge'&&e.id===p.serial);assert(r.time>=event.arrivalEarly-1/hz&&r.time<=event.arrivalLate+1/hz,'arrival must stay inside scheduled movement envelope');
  }
  if(!paused&&r.beltWarning&&r.time>10){const before=[r.time,r.config.characterX,r.beltVelocity,r.beltOffset,JSON.stringify(r.beltWarning)];r.pause();r.advance(5);assert.deepEqual([r.time,r.config.characterX,r.beltVelocity,r.beltOffset,JSON.stringify(r.beltWarning)],before);r.start();paused=true;}
 }
 assert.equal(r.status,'complete',`${who}/${hz}/${lead} failed`);assert.equal(r.hits,0,`${who}/${hz}/${lead} took hits`);assert.equal(r.time,180);assert(paused);assert(max-min>60);
 const reversals=r.events.filter(e=>e.type==='belt-reverse');assert(reversals.length>15);
 for(const e of reversals){const warning=r.events.findLast(w=>w.type==='belt-warning'&&w.time<=e.time);assert(e.time-warning.time>=.8-1e-8);assert(![60,120].some(t=>e.time>=t&&e.time<t+3.8));}
 const charges=r.events.filter(e=>e.type==='charge');for(let i=1;i<charges.length;i++)assert(charges[i].arrivalEarly>=charges[i-1].arrivalLate+Math.max(Math.abs(r.config.jump.launch)*2/r.config.jump.gravity,r.config.actions.slideDuration)+.12-1e-8);
 console.log({who,hz,lead,reversals:reversals.length,travel:Math.round(max-min),shots:r.spawned,hits:r.hits,reversedInAir});
}
// Explicit takeoff/reversal fixture: airborne drift follows takeoff, not the reversing belt.
for(const who of ['claude','constance']){const r=make(who);r.start();r.advance(1);r.beltWarning={start:r.time-.8,at:r.time,direction:-1};r.action('jump');const velocity=r.airVelocity,x=r.config.characterX;r.advance(.1);assert.equal(r.beltDirection,-1);assert.equal(r.airVelocity,velocity);assert(r.config.characterX>x);}
console.log('Conveyor: 18 full survival runs, warning/arrival envelopes, pause, bounds, airborne momentum and stun exclusion passed.');

import {checkHeldSlide} from './held-slide-qa.mjs';
for(const who of ['claude','constance'])checkHeldSlide(()=>make(who));
