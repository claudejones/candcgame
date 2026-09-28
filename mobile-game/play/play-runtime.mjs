import {finishGeometry} from './stage-settings.mjs';
import {encounterPacing,encounterVariation} from './encounter-pacing.mjs';
import {createMotion,intersects} from './runtime-rules.mjs';
import {sceneGeometry,hazardGeometry,poseFrame} from './scene-model.mjs';
import {effectivePlacement,profileConfig,hazardSpeed} from './calibration-settings.mjs';
import {drawLandscape} from './landscape.mjs';

export const RUNTIME_STEP=1/60;
// A detached, serializable input. Playing never writes into the authoring draft.
export function runtimeSnapshot({config,draft,items,catalog,stage,character='claude',difficulty='standard',sequence=null}) {
  if(!config.worldProfiles[stage]||!['claude','constance'].includes(character)||!draft.calibration.profiles[difficulty])throw new Error('Choose a valid stage, character and difficulty.');
  return structuredClone({version:1,stage,character,difficulty,sequence:sequence?.stage===stage&&sequence?.profile===difficulty&&sequence.verified?sequence:null,config:profileConfig(config,{...draft.calibration,profile:difficulty}),
    items:items.filter(i=>i.type==='character'||i.stage===stage),assets:catalog.assets,provenance:draft.provenance,
    draft:{value:draft.value,frames:draft.frames,placement:draft.placement,landscapes:draft.landscapes,calibration:draft.calibration,stageSettings:draft.stageSettings}});
}

export class PlayRuntime {
  constructor(snapshot,{unlimitedLives=false}={}) {
    this.snapshot=structuredClone(snapshot);this.config=this.snapshot.config;this.draft=this.snapshot.draft;
    this.stage=snapshot.stage;this.who=snapshot.character;this.profile=this.draft.calibration.profiles[snapshot.difficulty];
    this.items=new Map(this.snapshot.items.map(i=>[i.id,i]));this.hazards=this.snapshot.items.filter(i=>i.type==='hazard'&&this.draft.calibration.hazards[i.id]?.enabled);
    this.sequence=this.snapshot.sequence;this.groundSpeed=this.sequence?.groundSpeed??this.profile.groundSpeed;this.nextEncounter=0;this.duration=90;this.spawnEvents=this.sequence?[...this.sequence.events].sort((a,b)=>(a.start-960/a.speed)-(b.start-960/b.speed)):[];this.unlimitedLives=unlimitedLives;
    this.motion=createMotion(this.config);this.steps=0;this.active=[];this.spawned=0;this.hits=0;this.cleared=0;
    this.lives=this.config.spawnDirector.startingLives;this.invulnerable=0;this.recovery=0;this.status='ready';this.lastEvent='Ready';this.events=[];this.carry=0;
    this.nextSpawn=this.profile.reactionSeconds;this.lastContact=null;this.cloudTime=0;this.celebrationTime=0;
  }
  get time(){return this.steps*RUNTIME_STEP;}
  get character(){return this.items.get(`character:${this.who}:${this.motion.state}`);}
  start(){if(this.status==='ready'||this.status==='paused'){this.status='playing';this.motion.setState('run');}}
  pause(){this.holdSlide(false);if(this.status==='playing'){this.status='paused';this.motion.setState('idle');}this.carry=0;}
  holdSlide(held){
    this.slideRequested=!!held&&this.status==='playing';
    if(!this.slideRequested){this.motion.slideHeld=false;return;}
    if(this.action('slide'))this.motion.slideHeld=true;
  }
  updateMotion(dt){
    this.motion.update(dt);
    // A held control survives landing/recovery; releasing cancels the intent.
    if(this.slideRequested&&this.status==='playing'&&this.recovery<=0&&this.motion.state!=='jump'&&this.motion.state!=='hit'){
      if(this.motion.state!=='slide')this.action('slide');
      this.motion.slideHeld=true;
    }
  }
  action(kind){
    if(this.status!=='playing'||this.recovery>0||this.motion.state==='hit')return false;
    const previous=this.motion.state;
    if(kind==='jump'){if(this.motion.state==='jump')return false;this.motion.triggerJump();}
    else if(kind==='slide'){if(this.motion.state==='jump')return false;this.motion.triggerSlide();}
    else return false;
    if(kind==='jump'||previous!=='slide')this.events.push({type:'action',action:kind,time:this.time});
    return true;
  }
  plannedAction(event){if(this.action(event.action)&&event.holdUntil)this.motion.slideT=Math.max(this.motion.slideT,event.holdUntil[this.who]-this.time);}
  geometry(){
    const character=sceneGeometry({config:this.config,stage:this.stage,draft:this.draft,character:this.character,motion:this.motion}).character;
    const hazards=this.active.map(e=>{
      const p=effectivePlacement(this.draft,e.item),f=poseFrame(e.item,this.time-e.start,p.fps??e.item.fps);
      const g=hazardGeometry(this.config,e.item,f,this.draft.frames[e.item.id][f],this.draft.value[e.item.id][f],p,{time:this.time-e.start,looping:false,flight:e.flight,startX:e.startX,speed:e.speed});
      return {...g,frame:f,event:e,contact:intersects(character.collision,g.collision)};
    });
    return {character,hazards};
  }
  damage(event){
        event.hit=true;this.hits++;if(!this.unlimitedLives)this.lives=Math.max(0,this.lives-1);
        this.invulnerable=this.config.hitRecovery.invulnerabilityDuration;this.recovery=this.config.hitRecovery.recoveryDuration;
        this.motion.setState('hit');this.lastContact={serial:event.serial,name:event.item.name,time:this.time};this.lastEvent=`Hit: ${event.item.name}`;
        this.events.push({type:'hit',time:this.time,hazard:event.item.id});
        if(!this.lives){this.status='failed';this.config.spawnDirector.failed=true;this.motion.frame=1;this.events.push({type:'run-failed',time:this.time});}
  }
  tick(force=false){
    if(this.status!=='playing'&&!(force&&['ready','paused'].includes(this.status)))return;
    if(this.status==='ready')this.status='paused';
    this.steps++;this.invulnerable=Math.max(0,this.invulnerable-RUNTIME_STEP);this.recovery=Math.max(0,this.recovery-RUNTIME_STEP);
    this.updateMotion(RUNTIME_STEP);
    const cutoff=this.duration-this.config.spawnDirector.finishRelease;
    const pacing=encounterPacing((this.time+(1080-this.config.characterX)/this.profile.groundSpeed)/this.duration,this.profile,this.config,this.snapshot.difficulty);this.pacingPhase=pacing.phase;
    if(!this.sequence&&this.hazards.length&&this.spawned<this.profile.count*5&&this.time>=this.nextSpawn&&this.time<cutoff&&this.active.length<pacing.maxVisible){
      const variation=encounterVariation(this.spawned,pacing.phase,this.snapshot.difficulty,this.stage),wantSlide=variation.action==='slide',candidates=this.hazards.filter(h=>h.kind===(variation.kind==='ground'?'ground':'flying')),item=(candidates.length?candidates:this.hazards)[this.spawned%(candidates.length||this.hazards.length)],speed=item.kind==='ground'?this.groundSpeed:hazardSpeed(this.draft.calibration,item,this.snapshot.difficulty)*variation.speedFactor;
      // Start beyond the viewport; reaction lead is measured to the character.
      let startX=Math.max(1080,this.config.characterX+speed*this.profile.reactionSeconds);
      const earliest=this.time+(startX-this.config.characterX)/speed;if(this.scheduledContactAt>earliest)startX+=(this.scheduledContactAt-earliest)*speed;
      const p=effectivePlacement(this.draft,item),g=hazardGeometry(this.config,item,0,this.draft.frames[item.id][0],this.draft.value[item.id][0],p,{travel:false,startX,flight:'high'});
      const exitTime=(startX+Math.abs(p.xOffset)+g.dest.w*2+200)/speed;
      if(this.time+exitTime<=cutoff){
        this.active.push({item,speed,start:this.time,startX,flight:wantSlide?'high':'low',hit:false,serial:this.spawned});this.spawned++;this.scheduledContactAt=this.time+(startX-this.config.characterX)/speed+pacing.actionGap;
      }
      this.nextSpawn=this.time+Math.max(pacing.spacing*variation.gapFactor,pacing.actionGap);
    }
    if(this.sequence){
      while(this.nextEncounter<this.spawnEvents.length){
        const e=this.spawnEvents[this.nextEncounter];
        if(this.time<e.start-960/e.speed)break;
        this.nextEncounter++;const item=this.items.get(e.id);if(!item)continue;
        this.active.push({item,speed:e.speed,start:e.start,startX:this.config.objectQA.x,flight:e.flight,hit:false,serial:this.spawned++});
      }
    }
    // Compute current pose and contact after movement; rendering has no simulation side effects.
    const geometry=this.geometry();
    for(const g of geometry.hazards){
      if(g.contact&&!g.event.hit&&this.invulnerable===0){
        this.damage(g.event);
        break;
      }
    }
    for(const g of geometry.hazards)if(Math.max(g.dest.x+g.dest.w,g.collision.x+g.collision.w)<0){
      this.active=this.active.filter(e=>e!==g.event);if(!g.event.hit)this.cleared++;
      if(this.lastContact?.serial===g.event.serial)this.lastContact=null;
    }
    if(this.time>=this.duration&&this.status!=='failed'){
      this.active=[];this.status='complete';this.motion.setState('celebrate');this.lastEvent='Stage complete';this.events.push({type:'stage-complete',stage:this.stage,time:this.time});
    }
  }
  advance(seconds){
    const dt=Math.max(0,seconds);
    if(['playing','paused','complete'].includes(this.status))this.cloudTime+=dt;
    if(['paused','complete','failed'].includes(this.status)){
      this.motion.update(dt);
      if(this.status==='complete')this.celebrationTime+=dt;
      return;
    }
    if(this.status!=='playing')return;
    this.carry+=Math.max(0,seconds);
    while(this.carry+1e-9>=RUNTIME_STEP&&this.status==='playing'){this.carry-=RUNTIME_STEP;this.tick();}
  }
}

export function runtimeAssetKeys(snapshot){
 const p=snapshot.config.worldProfiles[snapshot.stage];
 return [...new Set([...snapshot.items.map(i=>i.asset),p.farKey,p.midKey,p.groundKey,...(p.clouds!==false?['clouds']:[]),'stars','finishMarker','hudHearts','hudCharacters','hudPath'])];
}
export function drawRuntime(canvas,runtime,images,contract,{boxes=false}={}){
 const {config,draft,stage}=runtime,p=config.worldProfiles[stage];
 drawLandscape(canvas,{config,contract,stage,transforms:draft.landscapes[stage],images:{far:images[p.farKey],mid:images[p.midKey],ground:images[p.groundKey],clouds:images.clouds},scroll:runtime.time*config.worldSpeed,groundScroll:runtime.time*runtime.groundSpeed,cloudScroll:runtime.cloudTime*config.worldContract.cloudSpeed});
 const ctx=canvas.getContext('2d'),g=runtime.geometry();
 const draw=(im,a,outline)=>{
  const s=a.source,d=a.dest;if(!im)return;
  ctx.save();if(a.flipX){ctx.translate(Math.round(d.x+d.w),Math.round(d.y));ctx.scale(-1,1);ctx.drawImage(im,s.x,s.y,s.w,s.h,0,0,Math.round(d.w),Math.round(d.h));}
  else ctx.drawImage(im,s.x,s.y,s.w,s.h,Math.round(d.x),Math.round(d.y),Math.round(d.w),Math.round(d.h));ctx.restore();
  if(boxes){const c=a.collision;ctx.strokeStyle=outline;ctx.lineWidth=2;ctx.strokeRect(c.x,c.y,c.w,c.h);}
 };
 const finish=config.finish.stages[runtime.stage],remaining=Math.max(0,runtime.duration-runtime.time),marker=images.finishMarker;
 if(marker&&finish&&remaining<=config.spawnDirector.finishRelease){
  const {x,y,w,h}=finishGeometry(config,draft,stage,runtime.time,runtime.duration,runtime.groundSpeed,marker,g.character.foot);
  ctx.drawImage(marker,Math.round(x),Math.round(y),Math.round(w),Math.round(h));
 }
 for(const h of g.hazards)draw(images[h.event.item.asset],h,h.contact||h.event.hit?'#ff5959':'#a5ec74');
 drawRuntimeCharacter(ctx,runtime,images,g,boxes);

 return g;
}

// Shared calibrated actor drawing for ordinary stages and special arenas.
export function drawRuntimeCharacter(ctx,runtime,images,g,boxes=false){
 const {config}=runtime;
 const draw=(image,a,color)=>{const s=a.source,d=a.dest;if(image)ctx.drawImage(image,s.x,s.y,s.w,s.h,Math.round(d.x),Math.round(d.y),Math.round(d.w),Math.round(d.h));if(boxes){const c=a.collision;ctx.strokeStyle=color;ctx.lineWidth=2;ctx.strokeRect(c.x,c.y,c.w,c.h);}};
 const blink=runtime.status==='playing'&&runtime.invulnerable>0&&(runtime.motion.state!=='hit'||runtime.motion.frame>=1)&&runtime.status!=='failed';
 if(!blink||Math.floor(runtime.time/.065)%2===0)draw(images[runtime.character.asset],g.character,'#56dfff');
 if(images.stars&&config.hitRecovery.showStars&&runtime.motion.starsVisible()){
  const sw=config.starCell.w,sh=config.starCell.h,scale=config.starScale[runtime.who],dw=sw*scale,dh=sh*scale;
  const f=Math.floor(runtime.motion.starT*config.starFPS)%4;
  ctx.drawImage(images.stars,f*sw,runtime.who==='claude'?0:sh,sw,sh,Math.round(config.characterX-dw/2),Math.round(g.character.hitReference.top-dh*.88+config.starYOffset[runtime.who]),Math.round(dw),Math.round(dh));
 }

}
