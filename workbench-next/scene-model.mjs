import {same} from './model.mjs';
import {croppedBounds,defaultBounds} from './frame-editor.mjs';
import {drawLandscape} from './landscape.mjs';
import {intersects} from './runtime-rules.mjs';
import {characterPathShift,effectivePlacement} from './calibration-settings.mjs';

export const STEP=1/60;
export const PLACEMENT_FIELDS={
  masterScale:['Master scale',.01,2,.001],footOffset:['Shared foot offset',-300,300,1],
  stateScale:['State scale',.05,5,.01],offsetX:['State offset X',-960,960,1],offsetY:['State offset Y',-540,540,1],
  groundOffset:['Grounding offset',-300,300,1],scale:['Scale multiplier',.01,4,.01],xOffset:['Placement offset X',-960,960,1],
  flipX:['Mirror horizontally',false,true],highOffsetY:['HIGH placement correction',-300,300,1],lowOffsetY:['LOW placement correction',-300,300,1],
  highClearance:['HIGH clearance',-300,500,1],lowClearance:['LOW clearance',-300,500,1],fps:['Animation FPS',.1,60,.1],
  cw:['Collision width',.01,2,.01],ch:['Collision height',.01,2,.01],cx:['Collision offset X',-2,2,.01],cy:['Collision offset Y',-2,2,.01]
};
export function placementDefaults(config,items) {
  if(!config)return {};
  const out={};
  for(const who of ['claude','constance']) {
    out[`character:${who}`]={masterScale:config.masterScale[who],footOffset:config.worldContract.footOffset[who]};
    for(const state of Object.keys(config.state)) {
      const c=config.objectQA.characterCollision[who][state];
      out[`character:${who}:${state}`]={stateScale:config.stateScale[who][state],offsetX:config.renderOffsetX[who][state],offsetY:config.renderOffsetY[who][state],cw:c.w,ch:c.h,cx:c.x,cy:c.y};
    }
    for(const [stage,p] of Object.entries(config.worldProfiles))out[`grounding:${stage}:${who}`]={groundOffset:p.characterGrounding?.[who]||0};
  }
  for(const item of items.filter(x=>x.type==='hazard')) {
    const d=config.objectQA.defs[item.stage][Number(item.id.split(':')[2])];
    out[item.id]={scale:d.scale,xOffset:0,flipX:d.flipX===true,...(item.kind==='ground'?{groundOffset:d.groundOffset??config.objectQA.groundOffset}:{highClearance:config.objectQA.flying.highClearance,lowClearance:config.objectQA.flying.lowClearance,highOffsetY:d.flightOffsetY?.high||0,lowOffsetY:d.flightOffsetY?.low||0}),...(item.frames>1?{fps:d.fps??config.objectQA.flying.fps}:{}),cw:d.cw,ch:d.ch,cx:d.cx,cy:d.cy};
  }
  return out;
}
export function validatePlacement(value,baseline) {
  if(!value||!same(Object.keys(value).sort(),Object.keys(baseline).sort()))throw new Error('Placement settings do not match this project.');
  for(const [id,fields] of Object.entries(baseline)) {
    if(!value[id]||!same(Object.keys(value[id]).sort(),Object.keys(fields).sort()))throw new Error(`Invalid placement fields: ${id}`);
    for(const [key,n] of Object.entries(value[id])) {
      if(key==='flipX'){if(typeof n!=='boolean')throw new Error('Hazard mirror must be true or false.');continue;}
      const [label,min,max]=PLACEMENT_FIELDS[key];
      if(!Number.isFinite(n)||n<min||n>max)throw new Error(`${label} must be between ${min} and ${max}.`);
    }
  }
  return value;
}

// Shared pure geometry for the candidate scene. Baseline equations match the
// production CharacterMachine/ObjectQA; authored layer offsets never move ground 410.
export function characterGeometry(config,item,frame,bounds,crop,placement,motionY=0) {
  const who=item.id.split(':')[1],shared=placement[`character:${who}`],state=placement[item.id];
  const s=shared.masterScale*state.stateScale,cell=config.cell;
  const foot=410+shared.footOffset+placement.groundOffset;
  const base=defaultBounds(item,frame),source=croppedBounds(bounds,crop);
  const x=config.characterX-cell*s/2+state.offsetX,y=foot-cell*s+state.offsetY+motionY;
  const dest={x:x+(source.x-base.x)*s,y:y+(source.y-base.y)*s,w:source.w*s,h:source.h*s};
  const meta=config.visibleMeta[item.state][who==='claude'?0:1][frame];
  const vw=Math.max(8,meta.w*s),vh=Math.max(8,meta.h*s),w=vw*state.cw,h=vh*state.ch;
  const collision={x:config.characterX+state.cx*vw-w/2,y:y+meta.top*s+(vh-h)*(1-state.cy),w,h};
  return {source,dest,collision,foot,scale:s,hitReference:{x:config.characterX,top:y+meta.top*s,w:vw,h:vh}};
}
export function hazardGeometry(config,item,frame,bounds,crop,p,{time=0,travel=true,flight='high',looping=true,startX=config.objectQA.x,phase=0}={}) {
  const source=croppedBounds(bounds,crop),scale=960/config.worldContract.sourceW*p.scale;
  const w=source.w*scale,h=source.h*scale;
  const distance=travel?time*(item.kind==='flying'?config.objectQA.flying.speed:config.worldSpeed):0;
  const loop=config.objectQA.loopDistance;
  let center=startX-(looping?distance%loop:distance);if(looping)while(center < -w-30)center+=loop;
  center+=p.xOffset;
  const anchor=item.kind==='flying'?410-p[flight==='high'?'highClearance':'lowClearance']+(p[flight==='high'?'highOffsetY':'lowOffsetY']||0):410+p.groundOffset;
  const dest={x:center-w/2,y:anchor-(item.kind==='flying'?h/2:h),w,h};
  if(item.sourceAnchor){
    const base=defaultBounds(item,frame),ax=base.x+item.sourceAnchor.x-source.x,ay=base.y+item.sourceAnchor.y-source.y;
    dest.x=center-(p.flipX?source.w-ax:ax)*scale;dest.y=anchor-ay*scale;
  }
  const cw=Math.max(4,w*p.cw),ch=Math.max(4,h*p.ch);
  const collision={x:dest.x+(w-cw)/2+(p.flipX?-p.cx:p.cx)*w,y:item.kind==='flying'?dest.y+(h-ch)/2+p.cy*h:anchor-ch+p.cy*h,w:cw,h:ch};
  return {source,dest,collision,anchor,scale,flipX:p.flipX===true,hitReference:{...dest,anchor,kind:item.kind,flipX:p.flipX===true}};
}
export const poseFrame=(item,time,fps=item.fps)=>((Math.floor((time+1e-9)*fps)%item.frames)+item.frames)%item.frames;
export function sceneGeometry({config,stage,draft,character,hazard,time=0,baseline=false,travel=true,flight='high',motion=null,looping=true,placementOverride=null,hazardTime=time,hazardPhase=0,encounters=null}) {
  const placements={...(baseline?draft.placementBaseline:draft.placement),...(!baseline&&placementOverride||{})};
  const frames=baseline?draft.frameBaseline:draft.frames,crops=baseline?draft.baseline:draft.value,result={};
  if(character) {
    const f=motion?motion.frame:poseFrame(character,time),who=character.id.split(':')[1];
    result.character={...characterGeometry(config,character,f,frames[character.id][f],crops[character.id][f],{...placements,groundOffset:placements[`grounding:${stage}:${who}`].groundOffset+characterPathShift(draft,stage,who,baseline)},motion?.y||0),frame:f,id:character.id};
  }
  if(hazard) {
    const p=effectivePlacement({...draft,placement:placements},hazard,baseline),f=poseFrame(hazard,hazardTime+hazardPhase,p.fps??hazard.fps);
    result.hazard={...hazardGeometry(config,hazard,f,frames[hazard.id][f],crops[hazard.id][f],p,{time:hazardTime,travel,flight,looping}),frame:f,id:hazard.id};
  }
  if(encounters){result.encounters=encounters.filter(e=>time-e.start>=-960/e.speed&&time<=e.exit).map(e=>{const r=sceneGeometry({config,stage,draft,character,hazard:e.item,time,baseline,travel,flight:e.flight,motion,looping:false,placementOverride,hazardTime:time-e.start});return {...r.hazard,item:e.item,contact:r.contact};});}
  result.contact=encounters?result.encounters.some(e=>e.contact):Boolean(result.character&&result.hazard&&intersects(result.character.collision,result.hazard.collision));
  return result;
}
export function drawDesignScene(canvas,options) {
  const {config,contract,stage,images,draft,character,hazard,time=0,worldTime=time,baseline=false,travel=true,guides=true,boxes=false,contactLatched=false}=options;
  const result=sceneGeometry(options);
  drawLandscape(canvas,{config,contract,stage,images,transforms:(baseline?draft.landscapeBaseline:draft.landscapes)[stage],scroll:travel?worldTime*config.worldSpeed:0,cloudScroll:worldTime*config.worldContract.cloudSpeed,guides});
  const ctx=canvas.getContext('2d');
  const draw=(img,g,color)=>{
    if(!img||!g)return;
    const a=g.source,b=g.dest,x=Math.round(b.x),y=Math.round(b.y),w=Math.round(b.w),h=Math.round(b.h);
    if(g.flipX){ctx.save();ctx.translate(x+w,y);ctx.scale(-1,1);ctx.drawImage(img,a.x,a.y,a.w,a.h,0,0,w,h);ctx.restore();}else ctx.drawImage(img,a.x,a.y,a.w,a.h,x,y,w,h);
    if(boxes){const c=g.collision;ctx.save();ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.strokeRect(c.x,c.y,c.w,c.h);ctx.restore();}
  };
  draw(images.character,result.character,result.contact?'#ff7373':'#64d9ff');
  if(result.encounters)for(const g of result.encounters)draw(images['hazard:'+g.item.id],g,g.contact?'#ff7373':'#c9ed8a');else draw(images.hazard,result.hazard,result.contact||contactLatched?'#ff7373':'#c9ed8a');
  if(character&&images.character&&guides){ctx.save();ctx.strokeStyle='#ffffff';ctx.beginPath();ctx.moveTo(config.characterX-30,result.character.foot+.5);ctx.lineTo(config.characterX+30,result.character.foot+.5);ctx.stroke();ctx.restore();}
  return result;
}

// One encounter, without damage or hit recovery. A changed draft invalidates its
// historical result; only replaying the full pass can establish a clear result.
export class ContactPass {
  constructor(){this.reset();}
  reset(){this.firstContact=null;this.valid=true;this.complete=false;this.startedAhead=false;}
  invalidate(){this.reset();this.valid=false;}
  sample(g,time,{travel=true}={}) {
    if(!g.character||!g.hazard)return false;
    const c=g.character.collision,h=g.hazard.collision;
    if(time===0)this.startedAhead=h.x>=c.x+c.w;
    const first=g.contact&&this.firstContact===null;
    if(first)this.firstContact=time;
    // Wait for the full visible hazard and its hitbox to leave the viewport.
    this.complete=travel&&Math.max(g.hazard.dest.x+g.hazard.dest.w,h.x+h.w)<0;
    return first;
  }
  label(g,{travel=true}={}){
    if(!this.valid)return g.contact?'Contact now · replay to check changes':'Settings changed · replay to check';
    if(this.firstContact!==null)return `Contact detected · ${this.firstContact.toFixed(2)} s`;
    if(!travel)return 'Stationary preview · no pass result';
    if(this.complete)return this.startedAhead?'Cleared · no contact':'Incomplete pass · hazard started behind character';
    return 'Checking pass…';
  }
}

export class SceneClock {
  constructor({available,paint,advance=()=>true,request=cb=>requestAnimationFrame(cb),cancel=id=>cancelAnimationFrame(id)}) {
    Object.assign(this,{available,paint,advance,request,cancel});this.steps=0;this.speed=1;this.running=false;this.handle=null;this.last=null;this.carry=0;this.generation=0;
  }
  get time(){return this.steps*STEP;}
  pause(){this.generation++;if(this.handle!==null)this.cancel(this.handle);this.handle=null;this.running=false;this.last=null;this.carry=0;this.paint();}
  restart(){this.pause();this.steps=0;this.paint();}
  step(){this.pause();if(this.available()){this.steps++;this.advance(this.time,this.steps);this.paint();}}
  setSpeed(speed){if(![.25,.5,1,2].includes(speed))throw new Error('Unsupported preview speed');this.speed=speed;this.last=null;this.carry=0;this.paint();}
  play(){
    if(this.running||!this.available())return;
    this.running=true;this.last=null;const generation=++this.generation;this.paint();
    const tick=now=>{
      if(!this.running||generation!==this.generation)return;
      this.handle=null;if(!this.available()){this.pause();return;}
      if(this.last!==null)this.carry+=Math.max(0,now-this.last)/1000*this.speed;
      this.last=now;const count=Math.floor((this.carry+1e-9)/STEP);this.carry=Math.max(0,this.carry-count*STEP);
      for(let i=0;i<count;i++){this.steps++;if(this.advance(this.time,this.steps)===false){this.running=false;this.last=null;this.carry=0;break;}}
      this.paint();
      if(this.running&&generation===this.generation)this.handle=this.request(tick);
    };
    this.handle=this.request(tick);
  }
}
