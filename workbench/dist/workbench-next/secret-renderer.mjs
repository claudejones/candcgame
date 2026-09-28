import {drawRuntimeCharacter} from './play-runtime.mjs';
export function animationFrame(meta,time,hold=false){
 const durations=meta.durations_ms,total=durations.reduce((a,b)=>a+b,0);let ms=Math.max(0,time*1000);
 if(!total)return 0;if(meta.loop&&!hold)ms%=total;else ms=Math.min(ms,total-1);
 for(let i=0;i<durations.length;i++){if(ms<durations[i])return i;ms-=durations[i];}return durations.length-1;
}
// Presentation uses the combat clock, including final capture's own elapsed time.
export function electricalState(run,reducedMotion=false){
 const last=run.pulses.at(-1),age=last===undefined?Infinity:run.status==='complete'?run.captureTime:run.time-last;
 const until=60-run.time%60,charging=run.status!=='complete'&&until<=2;
 const emitter=age<.5?4:age<1?5:charging?(until>1.4?1:until>.8?2:3):0;
 return {age,emitter,beam:age<.5,impact:age<.5,overload:run.status!=='complete'&&age>=.5&&age<2.8,
  overloadFrame:reducedMotion?0:Math.floor(Math.max(0,age-.5)/.15)%3,
  overloadAlpha:Math.min(1,Math.max(0,(2.8-age)/.2))};
}
export function electricalPlacement(layout,fx){
 const scale=layout.bossCellDisplay[0]/fx.placement.bossCellSize[0];
 const point=p=>[layout.bossTopLeft[0]+p[0]*scale,layout.bossTopLeft[1]+p[1]*scale];
 const rect=(p,size)=>{const c=point(p);return [c[0]-size[0]*scale/2,c[1]-size[1]*scale/2,size[0]*scale,size[1]*scale];};
 const [x,y,w,h]=layout.emitter,nozzle=[x+w/2,y+h],emitterScale=w/80;
 return {scale,nozzle,emitter:[nozzle[0]-64*emitterScale,nozzle[1]-40*emitterScale,128*emitterScale,64*emitterScale],
  end:point(fx.placement.impactCenterInBossCell),impact:rect(fx.placement.impactCenterInBossCell,fx.placement.impactDisplaySizeInBossUnits),
  overload:rect(fx.placement.overloadCenterInBossCell,fx.placement.overloadDisplaySizeInBossUnits)};
}
export function drawSecret(canvas,run,images,{boxes=false,reducedMotion=false}={}){
 const ctx=canvas.getContext('2d'),manifest=run.snapshot.secret.manifest,l=manifest.layout,t=reducedMotion?0:run.ambientTime;
 ctx.save();ctx.setTransform(canvas.width/1280,0,0,canvas.height/720,0,0);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#04192e';ctx.fillRect(0,0,1280,720);
 const im=name=>images['secret:'+name];
 const layer=name=>ctx.drawImage(im(name),0,0,1280,720);
 const atlas=(name,time,rect,frame=null)=>{const m=manifest.animations[name],r=m.rects[frame??animationFrame(m,time)];ctx.drawImage(im(name),...r,...rect);};
 layer('SECRET_LAB_BACKDROP.png');
 for(const tank of l.tanks){const [x,y,w,h]=tank.rect;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();atlas(`SECRET_SPECIMEN_${tank.specimen}_ATLAS.png`,t+tank.phase_ms/1000,[x,y,w,h]);if(!reducedMotion){ctx.globalAlpha=.55;atlas('SECRET_BUBBLES_ATLAS.png',t+tank.phase_ms/1000,[x,y,w,h]);}ctx.restore();}
 l.monitors.forEach((r,i)=>atlas('SECRET_MONITOR_ATLAS.png',t+i*.31,r));l.lamps.forEach((r,i)=>atlas('SECRET_LAMP_ATLAS.png',t+i*1.7,r));
 layer('SECRET_CONVEYOR_FRAME.png');layer('SECRET_BOSS_PLATFORM.png');
 const [x,y,w,h]=l.conveyor.rect;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();const offset=((run.beltOffset%62)+62)%62;for(let tx=x+offset-62;tx<x+w;tx+=62)ctx.drawImage(im('SECRET_CONVEYOR_TREAD.png'),tx,y,62,17);ctx.restore();
 // Direction cue stays on the belt frame, away from the character and HUD.
 if(run.beltWarning){ctx.save();ctx.font='bold 18px monospace';ctx.textAlign='center';ctx.fillStyle='#071d32';ctx.fillRect(350,499,240,30);ctx.fillStyle='#ffdc54';ctx.fillText(run.beltWarning.direction>0?'BELT →':'← BELT',470,521);ctx.restore();}
 const lastPulse=run.pulses.at(-1),age=lastPulse===undefined?Infinity:run.time-lastPulse,display=[...l.bossTopLeft,...l.bossCellDisplay];
 const milestone=run.milestone;let boss='SECRET_BOSS_IDLE_ATLAS.png',bossTime=t,bossFrame=null;
 if(run.status==='complete'){boss='SECRET_BOSS_CAPTURE_ATLAS.png';bossTime=run.captureTime;}
 else if(milestone&&milestone.state!=='breathing'){boss='SECRET_BOSS_STAGGER_ATLAS.png';bossFrame=milestone.state==='impact'?(milestone.age<.3?0:1):milestone.state==='stunned'?2:3;}
 else if(run.attack){boss=`SECRET_BOSS_${run.attack.lane.toUpperCase()}_ATLAS.png`;bossTime=run.time-run.attack.start;}
 atlas(boss,bossTime,display,bossFrame);
 for(const p of run.active){const name=p.lane==='high'?'SECRET_BOLT_HIGH_ATLAS.png':'SECRET_ORB_LOW_ATLAS.png',m=manifest.animations[name],scale=.5,r=m.rects[0];atlas(name,run.time,[p.x/.75-m.anchor[0]*scale,p.y/.75-m.anchor[1]*scale,r[2]*scale,r[3]*scale]);if(boxes){ctx.strokeStyle='#ffdc54';ctx.lineWidth=2;ctx.strokeRect((p.x-p.w/2)/.75,(p.y-p.h/2)/.75,p.w/.75,p.h/.75);}}
 const fx=manifest.electricalV2,es=electricalState(run,reducedMotion),ep=electricalPlacement(l,fx);
 atlas('SECRET_EMITTER_CHARGE_V2_ATLAS.png',0,ep.emitter,es.emitter);
 if(es.beam){
  const dx=ep.end[0]-ep.nozzle[0],dy=ep.end[1]-ep.nozzle[1],width=fx.placement.beamDisplayWidthInBossUnits*ep.scale;
  ctx.save();ctx.translate(...ep.nozzle);ctx.rotate(-Math.atan2(dx,dy));atlas('SECRET_CONTAINMENT_BEAM_V2_ATLAS.png',reducedMotion?0:es.age,[-width/2,0,width,Math.hypot(dx,dy)]);ctx.restore();
 }
 if(es.overload){ctx.save();ctx.globalAlpha=es.overloadAlpha;atlas('SECRET_ELECTRIC_OVERLOAD_V2_ATLAS.png',0,ep.overload,es.overloadFrame);ctx.restore();}
 if(es.impact)atlas('SECRET_ELECTRIC_IMPACT_V2_ATLAS.png',reducedMotion?0:es.age,ep.impact);
 if(run.status==='complete')atlas('SECRET_CONTAINMENT_ATLAS.png',run.captureTime,display);
 for(const fx of run.fx)atlas('SECRET_IMPACT_ATLAS.png',run.ambientTime-fx.time,[fx.x/.75-56,fx.y/.75-40,112,80]);
 ctx.restore();ctx.imageSmoothingEnabled=false;
 const g=run.geometry();drawRuntimeCharacter(ctx,run,images,g,boxes);return g;
}
