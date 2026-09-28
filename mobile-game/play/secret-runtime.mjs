import {PlayRuntime,RUNTIME_STEP,runtimeSnapshot} from './play-runtime.mjs';
import {characterGeometry} from './scene-model.mjs';
import {createMotion,intersects} from './runtime-rules.mjs';
export const BOSS_MILESTONE=Object.freeze({impact:.8,stunned:2,recovery:.5,breathing:.5,total:3.8});
const SCALE=.75;
export function secretSnapshot(options,manifest,tuning){
 const snapshot=runtimeSnapshot({...options,stage:'na01',difficulty:'standard',sequence:null});
 snapshot.stage='secret01';snapshot.kind='secret';snapshot.items=snapshot.items.filter(i=>i.type==='character');
 snapshot.secret={manifest:structuredClone(manifest),tuning:structuredClone(tuning)};
 snapshot.config.characterX=manifest.layout.playerAnchorX*SCALE;
 snapshot.config.spawnDirector.failed=false;
 return snapshot;
}
export function calibrateSecretLanes(snapshot){
 const standing=[],sliding=[],ground=snapshot.secret.manifest.layout.groundY*SCALE;
 for(const who of ['claude','constance'])for(const state of ['run','slide']){
  const item=snapshot.items.find(i=>i.id===`character:${who}:${state}`);
  for(let f=0;f<item.frames;f++){const g=characterGeometry(snapshot.config,item,f,snapshot.draft.frames[item.id][f],snapshot.draft.value[item.id][f],{...snapshot.draft.placement,groundOffset:ground-410-snapshot.draft.placement[`character:${who}`].footOffset});(state==='run'?standing:sliding).push(g.collision.y);}
 }
 const top=Math.max(...standing),bottom=Math.min(...sliding),gap=bottom-top;
 if(gap<5)throw Error('Secret high lane needs at least 5 px between the Run and Slide hitboxes. Review shared character calibration.');
 return {high:(top+bottom)/2,highHeight:Math.min(6,gap-3),low:ground-12,lowHeight:14};
}
export class SecretRuntime extends PlayRuntime{
 constructor(snapshot,options={}){
  super(snapshot,options);this.kind='secret';this.duration=180;this.shields=3;this.pulses=[];this.attack=null;this.serial=0;this.nextCharge=2;this.burstIndex=0;this.burstGroup=0;this.groupShot=0;
  this.tuning=snapshot.secret.tuning;this.layout=snapshot.secret.manifest.layout;this.ambientTime=0;this.beltTime=0;this.captureTime=0;this.fx=[];this.savedMotion=null;this.lanes=calibrateSecretLanes(snapshot);this.resetConveyor();
 }
 resetConveyor(){
  this.config.characterX=this.layout.playerAnchorX*SCALE;this.beltOffset=0;this.beltVelocity=0;this.airVelocity=0;this.beltDirection=1;this.beltWarning=null;this.nextReversal=this.time+this.tuning.conveyor.reverseIntervals[this.phase];
 }
 action(kind){const grounded=this.motion.state!=='jump',accepted=super.action(kind);if(accepted&&kind==='jump'&&grounded)this.airVelocity=this.beltVelocity;return accepted;}
 updateConveyor(){
  const c=this.tuning.conveyor,speed=c.speeds[this.phase]*SCALE,min=c.bounds[0]*SCALE,max=c.bounds[1]*SCALE;
  const reserved=this.milestone||60-this.time%60<=c.warningSeconds+c.rampSeconds;
  const edge=this.beltDirection>0?max-this.config.characterX:this.config.characterX-min;
  if(!reserved&&!this.beltWarning&&(this.time>=this.nextReversal||edge<speed*(c.warningSeconds+c.rampSeconds)+15)){
   this.beltWarning={start:this.time,at:this.time+c.warningSeconds,direction:-this.beltDirection};this.events.push({type:'belt-warning',time:this.time,direction:-this.beltDirection});
  }
  if(this.beltWarning&&this.time>=this.beltWarning.at&&!reserved){this.beltDirection=this.beltWarning.direction;this.beltWarning=null;this.nextReversal=this.time+c.reverseIntervals[this.phase];this.events.push({type:'belt-reverse',time:this.time,direction:this.beltDirection});}
  const target=this.beltDirection*speed,step=2*speed/c.rampSeconds*RUNTIME_STEP;
  this.beltVelocity+=Math.max(-step,Math.min(step,target-this.beltVelocity));this.beltOffset+=this.beltVelocity/SCALE*RUNTIME_STEP;
  const velocity=this.motion.state==='jump'?this.airVelocity:this.beltVelocity;
  this.config.characterX=Math.max(min,Math.min(max,this.config.characterX+velocity*RUNTIME_STEP));
 }
 // Arrival envelope covers either reversal and preserved airborne momentum, not just current velocity.
 shotArrivalWindow(muzzle,speed,warning){
  const c=this.tuning.conveyor,v=Math.max(...c.speeds)*SCALE,x=this.config.characterX;
  const reach=Math.min(c.bounds[1]*SCALE,x+v*warning),retreat=Math.max(c.bounds[0]*SCALE,x-v*warning);
  return {early:warning+Math.max(0,muzzle-reach-35)/(speed+v),late:warning+Math.max(0,muzzle-retreat+35)/(speed-v)};
 }
 start(){if(this.status==='paused'&&this.savedMotion){this.motion=this.savedMotion;this.savedMotion=null;this.status='playing';}else super.start();}
 pause(){if(this.status==='playing'){this.savedMotion=this.motion;this.motion=createMotion(this.config,'idle');this.status='paused';}this.carry=0;}
 geometry(){
  const item=this.character,frame=this.motion.frame;
  const character=characterGeometry(this.config,item,frame,this.draft.frames[item.id][frame],this.draft.value[item.id][frame],{...this.draft.placement,groundOffset:this.layout.groundY*SCALE-410-this.draft.placement[`character:${this.who}`].footOffset},this.motion.y);
  const hazards=this.active.map(event=>{const collision={x:event.x-event.w/2,y:event.y-event.h/2,w:event.w,h:event.h};return {collision,event,contact:intersects(character.collision,collision)};});
  return {character,hazards};
 }
 get phase(){return Math.min(2,3-this.shields);}
 get milestone(){
  const boundary=this.pulses.at(-1);if(!boundary||boundary===180)return null;
  const age=this.time-boundary;if(age>=BOSS_MILESTONE.total-1e-8)return null;
  return {boundary,age,state:age<.8-1e-8?'impact':age<2.8-1e-8?'stunned':age<3.3-1e-8?'recovery':'breathing'};
 }
 get preparationSeconds(){
  // Entire projectile (including its tail) leaves before a milestone.
  const speed=this.tuning.attack.referenceProjectileSpeedPxPerSecond*SCALE*Math.min(1,...this.tuning.bursts.flatMap(b=>b.speedFactors||[1]));
  return Math.max(2.8,this.tuning.attack.releaseOffsetMs/1000+(this.layout.bossAnchor[0]*SCALE+120)/speed+.1);
 }
 get captureDuration(){return this.tuning.captureVisualDurationMs/1000;}
 get celebrationDuration(){const c=this.config.state.celebrate;return Math.max(this.tuning.celebrationMinimumSeconds||5,(this.tuning.celebrationCyclesBeforeResult||2)*c.frames/c.fps);}
 get resultReady(){return this.status==='failed'||this.status==='complete'&&this.captureTime>=this.captureDuration+this.celebrationDuration;}
 release(){
  const a=this.attack;if(!a||a.released)return;a.released=true;
  const local=this.tuning.attack[a.lane==='high'?'highMuzzleLocal':'lowMuzzleLocal'];
  const bossScale=this.layout.bossCellDisplay[0]/512;
  const x=(this.layout.bossTopLeft[0]+local[0]*bossScale)*SCALE;
  // The visual muzzle is fixed; lane endpoints are calibrated independently of glow.
  const y=(this.layout.bossTopLeft[1]+local[1]*bossScale)*SCALE,targetY=this.lanes[a.lane];
  this.active.push({serial:a.id,lane:a.lane,item:{id:'secret-'+a.lane,name:a.lane==='high'?'High bolt':'Low orb'},x,y,originX:x,originY:y,targetY,speed:a.speed,w:(a.lane==='high'?38:22)*SCALE,h:a.lane==='high'?this.lanes.highHeight:this.lanes.lowHeight,hit:false});
  this.spawned++;this.events.push({type:'release',id:a.id,lane:a.lane,speed:a.speed,time:this.time});
 }
 tick(){
  if(this.status!=='playing')return;
  this.steps++;this.beltTime+=RUNTIME_STEP;this.invulnerable=Math.max(0,this.invulnerable-RUNTIME_STEP);this.recovery=Math.max(0,this.recovery-RUNTIME_STEP);this.motion.update(RUNTIME_STEP);this.updateConveyor();
  const phase=this.tuning.phases[this.phase],boundary=phase.end;
  if(this.attack&&!this.attack.released&&this.time>=this.attack.start+this.tuning.attack.releaseOffsetMs/1000)this.release();
  if(this.attack&&this.time-this.attack.start>=(this.tuning.attack.releaseOffsetMs+this.tuning.attack.followThroughMs)/1000)this.attack=null;
  if(!this.attack&&![60,120].some(t=>this.time>=t&&this.time<t+BOSS_MILESTONE.total)&&this.time>=this.nextCharge&&this.time<boundary-this.preparationSeconds){
   const burst=this.tuning.bursts[this.phase],id=this.serial++,index=this.burstIndex++,lane=burst.pattern[(index+this.burstGroup*3)%burst.pattern.length];
   const speed=this.tuning.attack.referenceProjectileSpeedPxPerSecond*SCALE*this.tuning.attack.phaseSpeedFactors[this.phase]*(burst.speedFactors?.[(index*3+this.burstGroup)%burst.speedFactors.length]||1);
   const local=this.tuning.attack[lane==='high'?'highMuzzleLocal':'lowMuzzleLocal'],muzzle=(this.layout.bossTopLeft[0]+local[0]*this.layout.bossCellDisplay[0]/512)*SCALE;
   const arrival=this.shotArrivalWindow(muzzle,speed,this.tuning.attack.releaseOffsetMs/1000);
   // Choose timing against arrival as well as warning, so a faster shot cannot erase the response gap.
   const reset=Math.max(Math.abs(this.config.jump.launch)*2/this.config.jump.gravity,this.config.actions.slideDuration)+.12;
   const start=Math.max(this.time,(this.lastShotArrival??-100)+reset-arrival.early);
   if(start>this.time+1e-8){this.nextCharge=start;this.burstIndex--;this.serial--;}else{
   this.attack={id,lane,speed,start,released:false};this.lastShotArrival=start+arrival.late;
   this.groupShot++;const groupSize=burst.groupSizes?.[this.burstGroup%burst.groupSizes.length]||burst.pattern.length;
   const rest=this.groupShot>=groupSize;if(rest){this.groupShot=0;this.burstGroup++;}
   this.nextCharge=start+(rest?burst.restSeconds:burst.intervalSeconds*(burst.gapFactors?.[index%burst.gapFactors.length]||1));
   this.events.push({type:'charge',id,lane,speed,time:start,arrivalEarly:start+arrival.early,arrivalLate:start+arrival.late});
   }
  }
  for(const p of this.active){p.x-=(p.speed||this.tuning.attack.referenceProjectileSpeedPxPerSecond*SCALE)*RUNTIME_STEP;const ratio=Math.min(1,Math.max(0,(p.originX-p.x)/(p.originX-this.tuning.conveyor.bounds[1]*SCALE-60)));p.y=p.originY+(p.targetY-p.originY)*ratio;}
  // Contacts are resolved before containment/deadline success, including tick 10800.
  for(const g of this.geometry().hazards){if(g.contact&&!g.event.hit&&this.invulnerable===0){this.damage(g.event);this.fx.push({x:g.event.x,y:g.event.y,time:this.ambientTime});break;}}
  this.active=this.active.filter(p=>p.x>-120&&!p.hit);
  if(this.status==='failed'){this.attack=null;return;}
  for(const boundary of this.tuning.pulseSeconds){if(this.time>=boundary&&!this.pulses.includes(boundary)){
   this.pulses.push(boundary);this.shields--;this.burstIndex=0;this.groupShot=0;this.burstGroup=0;this.lastShotArrival=null;this.attack=null;this.nextCharge=boundary+BOSS_MILESTONE.total;
   this.events.push({type:'pulse',time:boundary});
  }}
  if(this.time>=this.duration){this.status='complete';this.active=[];this.attack=null;this.motion.setState('idle');this.captureTime=0;this.events.push({type:'stage-complete',stage:this.stage,time:this.time});}
 }
 advance(seconds){
  const dt=Math.max(0,seconds);this.ambientTime+=dt;this.fx=this.fx.filter(f=>this.ambientTime-f.time<.38);
  if(this.status==='complete'){const before=this.captureTime;this.captureTime+=dt;const celebrationDt=Math.max(0,this.captureTime-Math.max(before,this.captureDuration));if(celebrationDt>0){if(this.motion.state!=='celebrate')this.motion.setState('celebrate');this.celebrationTime+=celebrationDt;this.motion.update(celebrationDt);}else this.motion.update(dt);return;}
  if(this.status==='paused'||this.status==='failed'){this.motion.update(dt);return;}
  if(this.status!=='playing')return;this.carry+=dt;
  while(this.carry+1e-9>=RUNTIME_STEP&&this.status==='playing'){this.carry-=RUNTIME_STEP;this.tick();}
 }
 // Authoring-only fixture seek. Never used by Game entry or save restoration.
 previewPhase(seconds){this.steps=Math.round(Math.min(179.9,Math.max(0,seconds))/RUNTIME_STEP);this.pulses=[60,120].filter(t=>t<=this.time);this.shields=3-this.pulses.length;this.attack=null;this.active=[];this.burstIndex=0;this.groupShot=0;this.burstGroup=0;this.lastShotArrival=null;this.nextCharge=Math.max(this.time+1.2,(this.pulses.at(-1)||-100)+BOSS_MILESTONE.total);this.beltTime=this.time;this.resetConveyor();this.carry=0;}
}
