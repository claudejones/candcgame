import {createMotion,intersects} from './runtime-rules.mjs';
import {STEP,characterGeometry,hazardGeometry} from './scene-model.mjs';
import {croppedBounds} from './frame-editor.mjs';
import {pathShift,characterPathShift,effectivePlacement,profileConfig,calibrationReferenceStamp,timingProfileStamp,PROFILES} from './calibration-settings.mjs';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
export function measureArtwork(image,item,draft,createCanvas=()=>document.createElement('canvas')){
 const frames=[];
 for(let i=0;i<item.frames;i++){
  const b=croppedBounds(draft.frames[item.id][i],draft.value[item.id][i]),c=createCanvas();c.width=Math.ceil(b.w);c.height=Math.ceil(b.h);const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,b.x,b.y,b.w,b.h,0,0,c.width,c.height);
  const data=ctx.getImageData(0,0,c.width,c.height).data;let left=c.width,right=-1,top=c.height,bottom=-1,count=0;
  for(let y=0;y<c.height;y++){let rowLeft=c.width,rowRight=-1,rowCount=0;for(let x=0;x<c.width;x++)if(data[(y*c.width+x)*4+3]>40){rowLeft=Math.min(rowLeft,x);rowRight=x;rowCount++;}if(rowCount>=Math.max(2,c.width*.002)){left=Math.min(left,rowLeft);right=Math.max(right,rowRight);top=Math.min(top,y);bottom=y;count+=rowCount;}}
  if(right<left)throw new Error(`${item.name}: no visible artwork in frame ${i+1}.`);
  frames.push({left:left/c.width,right:(right+1)/c.width,top:top/c.height,bottom:(bottom+1)/c.height,coverage:count/(c.width*c.height)});
 }
 const m=Object.fromEntries(['left','right','top','bottom'].map(k=>[k,median(frames.map(f=>f[k]))]));
 const warnings=[];if(frames.some(f=>f.coverage>.98))warnings.push('Opaque frame: check the suggested artwork anchor.');
 const h=croppedBounds(draft.frames[item.id][0],draft.value[item.id][0]).h*960/2048*draft.placement[item.id].scale;
 if((Math.max(...frames.map(f=>f.bottom))-Math.min(...frames.map(f=>f.bottom)))*h>4)warnings.push('Animation base varies by more than 4 scene pixels; inspect each frame.');
 return {...m,frames,warnings};
}
function actorCache(config,draft,items,stage,who,action,end){
 const shared={...draft.placement,groundOffset:draft.placement[`grounding:${stage}:${who}`].groundOffset+characterPathShift(draft,stage,who)};
 const geom=m=>{const item=items.find(i=>i.id===`character:${who}:${m.state}`);return characterGeometry(config,item,m.frame,draft.frames[item.id][m.frame],draft.value[item.id][m.frame],shared,m.y).collision;};
 const run=[];for(let phase=0;phase<config.state.run.frames;phase++){const m=createMotion(config);m.elapsed=phase/config.state.run.fps;const arr=[];for(let n=0;n<=end;n++){arr.push(geom(m));m.update(STEP);}run.push(arr);}
 const m=createMotion(config,action),acted=[];let duration=0;for(let n=0;n<=end;n++){acted.push(geom(m));if(n&&m.state==='run'&&!duration)duration=n;m.update(STEP);}return {run,acted,duration:duration||end};
}
const cache=new WeakMap();
function actorsFor(config,draft,items,stage,action,end){
 let map=cache.get(draft);if(!map){map=new Map();cache.set(draft,map);}const key=JSON.stringify([stage,action,end,['claude','constance'].map(who=>characterPathShift(draft,stage,who)),Object.entries(draft.placement).filter(([id])=>id.startsWith('character:')||id.startsWith('grounding:')),Object.entries(draft.frames).filter(([id])=>id.startsWith('character:')),Object.entries(draft.value).filter(([id])=>id.startsWith('character:'))]);
 if(!map.has(key))map.set(key,Object.fromEntries(['claude','constance'].map(who=>[who,actorCache(config,draft,items,stage,who,action,end)])));return map.get(key);
}
function intervals(flags){const out=[];let start=null;for(let i=0;i<=flags.length;i++){if(flags[i]&&start===null)start=i;if(!flags[i]&&start!==null){out.push({start:start*STEP,end:(i-1)*STEP,width:(i-start)*STEP});start=null;}}return out;}
export function analyzeHazard({config,draft,items,item,placement=draft.placement[item.id],flight='high',profileName=draft.calibration.profile}){
 const cfg=profileConfig(config,{...draft.calibration,profile:profileName}),profile=draft.calibration.profiles[profileName],action=item.kind==='flying'&&flight==='high'?'slide':'jump';
 const effective=effectivePlacement({...draft,placement:{...draft.placement,[item.id]:placement}},item),speed=item.kind==='flying'?cfg.objectQA.flying.speed:cfg.worldSpeed;
 const maxW=Math.max(...draft.frames[item.id].map((b,i)=>croppedBounds(b,draft.value[item.id][i]).w))*960/config.worldContract.sourceW*placement.scale;
 const end=Math.ceil((cfg.objectQA.x+Math.abs(placement.xOffset)+maxW*3+300)/speed/STEP),actors=actorsFor(cfg,draft,items,item.stage,action,end),phases=[];
 for(let phase=0;phase<item.frames;phase++){
  const arr=[];for(let step=0;step<=end;step++){const time=step*STEP,frame=Math.floor((time*(effective.fps??item.fps)+phase+1e-9))%item.frames;arr.push(hazardGeometry(cfg,item,frame,draft.frames[item.id][frame],draft.value[item.id][frame],effective,{time,flight,looping:false}).collision);}phases.push(arr);
 }
 const characters={};
 for(const [who,a] of Object.entries(actors)){
  // Test every hazard starting frame against every Run starting frame. Exact
  // 1/60 s input times are intersected, yielding a common robust window.
  const valid=new Uint8Array(end+1).fill(1),boxes=[...a.acted,...a.run.flat()],left=boxes.reduce((n,b)=>Math.min(n,b.x),Infinity),right=boxes.reduce((n,b)=>Math.max(n,b.x+b.w),-Infinity);let threat=true,first=end,last=0;
  for(const hazard of phases)for(const run of a.run){const relevant=[];let touches=false;
   for(let n=0;n<=end;n++){const h=hazard[n];if(h.x<right&&h.x+h.w>left)relevant.push(n);if(intersects(run[n],h)){touches=true;first=Math.min(first,n);last=Math.max(last,n);}}
   if(!touches)threat=false;
   for(let start=0;start<=end;start++)if(valid[start]){
    if(start>last+1||start+a.duration<first-1){valid[start]=0;continue;}
    for(const n of relevant){const box=n>=start?a.acted[n-start]:run[n];if(intersects(box,hazard[n])){valid[start]=0;break;}}
   }
  }
  const windows=intervals(valid),best=windows.reduce((a,b)=>!a||b.width>a.width?b:a,null);
  characters[who]={windows,best,threat,pass:threat&&Boolean(best)&&best.width*1000+1e-6>=profile.minWindowMs,duration:a.duration*STEP};
 }
 return {flight,action,speed,characters,pass:Object.values(characters).every(c=>c.pass),minimumMs:profile.minWindowMs,phases:item.frames*config.state.run.frames,score:Math.min(...Object.values(characters).map(c=>c.threat?(c.best?.width||0):0))};
}
function suggestions(config,draft,items,item,art){
 const before=draft.placement[item.id],policy=draft.calibration.hazards[item.id],locked=new Set([...policy.locks,...(!policy.follow?['groundOffset','highClearance','lowClearance']:[])]),p={...before};
 const set=(k,v)=>{if(!locked.has(k))p[k]=v;};
 set('cw',clamp((art.right-art.left)*.85,.05,1.2));set('ch',clamp((art.bottom-art.top)*.85,.05,1.2));set('cx',clamp((art.left+art.right)/2-.5,-1,1));set('cy',item.kind==='ground'?-(1-art.bottom):clamp((art.top+art.bottom)/2-.5,-1,1));
 const b=croppedBounds(draft.frames[item.id][0],draft.value[item.id][0]),h=b.h*960/config.worldContract.sourceW*p.scale,path=draft.calibration.stages[item.stage].pathY,shift=policy.follow?pathShift(draft,item.stage):0;
 if(item.kind==='ground')set('groundOffset',clamp(path-410+(1-art.bottom)*h-shift,-300,300));
 else{
  const slideTops=[];for(const who of ['claude','constance']){const it=items.find(i=>i.id===`character:${who}:slide`);for(let frame=0;frame<it.frames;frame++)slideTops.push(characterGeometry(config,it,frame,draft.frames[it.id][frame],draft.value[it.id][frame],{...draft.placement,groundOffset:draft.placement[`grounding:${item.stage}:${who}`].groundOffset+characterPathShift(draft,item.stage,who)}).collision.y);}
  set('highClearance',clamp(410+h*p.ch/2+p.cy*h-Math.min(...slideTops)+5+shift,-300,500));
  set('lowClearance',clamp(410+h*p.ch/2+p.cy*h-(path-4)+shift,-300,500));
 }
 return p;
}
export function analyzeProfiles({config,draft,items,item,placement=draft.placement[item.id],profiles=PROFILES}){
 const flights=item.kind==='flying'?['high','low']:['high'];
 return Object.fromEntries(profiles.map(profile=>[profile,flights.map(flight=>analyzeHazard({config,draft,items,item,placement,flight,profileName:profile}))]));
}
export const meetsProfile=reports=>Boolean(reports?.length)&&reports.every(r=>r.pass);
export const meetsAll=reports=>PROFILES.every(p=>meetsProfile(reports[p]));
export async function optimizeHazard({config,draft,items,item,art,yieldTask=()=>Promise.resolve(),cancelled=()=>false}){
 if(cancelled())throw new Error('Analysis cancelled.');
 const before={...draft.placement[item.id]},base=suggestions(config,draft,items,item,art),locked=new Set([...draft.calibration.hazards[item.id].locks,...(!draft.calibration.hazards[item.id].follow?['groundOffset','highClearance','lowClearance']:[]) ]);
 const evaluate=placement=>analyzeProfiles({config,draft,items,item,placement});
 const beforeProfiles=evaluate(before),baseProfiles=evaluate(base);
 const preserves=reports=>PROFILES.every(p=>!meetsProfile(beforeProfiles[p])||meetsProfile(reports[p]));
 const quality=reports=>[PROFILES.filter(p=>meetsProfile(reports[p])).length,Math.min(...Object.values(reports).flat().map(r=>r.score/(r.minimumMs/1000)))];
 const better=(a,b)=>{const x=quality(a),y=quality(b);return x[0]>y[0]||(x[0]===y[0]&&x[1]>y[1]+.00001);};
 // Prefer the artwork alignment when it preserves existing passing profiles;
 // retain the current configuration as a safe candidate throughout the search.
 let best=preserves(baseProfiles)&&quality(baseProfiles)[0]>=quality(beforeProfiles)[0]?base:before,profiles=best===base?baseProfiles:beforeProfiles;
 search: for(const factor of [1,.9,.8])for(const lift of item.kind==='flying'?[0,-6,6]:[0]){
  if(meetsAll(profiles))break search;
  if(cancelled())throw new Error('Analysis cancelled.');
  const p={...base};if(!locked.has('cw'))p.cw=base.cw*factor;if(!locked.has('ch'))p.ch=base.ch*factor;
  if(item.kind==='flying'){if(!locked.has('highClearance'))p.highClearance=clamp(base.highClearance+lift,-300,500);if(!locked.has('lowClearance'))p.lowClearance=clamp(base.lowClearance+lift,-300,500);}
  const r=evaluate(p);if(preserves(r)&&better(r,profiles)){best=p;profiles=r;}
  await yieldTask();
 }
 if(cancelled())throw new Error('Analysis cancelled.');
 const changes=Object.keys(best).filter(k=>Math.abs(best[k]-before[k])>1e-9).map(field=>({field,before:before[field],after:best[field]}));
 return {id:item.id,stage:item.stage,name:item.name,before,placement:best,beforeProfiles,profiles,profileStamps:Object.fromEntries(PROFILES.map(p=>[p,timingProfileStamp(draft.calibration,item,p)])),changes,warnings:[...art.warnings,...(!draft.calibration.hazards[item.id].follow?['Manual grounding retained: Follow shared pathway is off.']:[]),...(!changes.length&&!meetsAll(profiles)?['Current settings retained; no better shared configuration found within the search limits.']:[])],anchor:art.bottom,stamp:calibrationReferenceStamp(draft,item,config),ready:meetsAll(profiles),reviewed:false};
}
export function makeSequence({config,draft,items,reports,stage,seed=1}){
 const p=draft.calibration.profiles[draft.calibration.profile],eligible=reports.filter(r=>r.stage===stage&&r.ready&&draft.calibration.hazards[r.id].enabled);
 if(!eligible.length)throw new Error('No current hazards meet this profile. Review the calibration results or adjust its speed and timing target.');
 let rng=seed>>>0;const rand=()=>{rng=(Math.imul(1664525,rng)+1013904223)>>>0;return rng/4294967296;};
 const events=[],lastAction={claude:-100,constance:-100},motionEnd={claude:-100,constance:-100};let start=0;
 for(let i=0;i<p.count;i++){
  const r=eligible[Math.floor(rand()*eligible.length)],report=r.reports[Math.floor(rand()*r.reports.length)],item=items.find(it=>it.id===r.id);
  const local=Object.fromEntries(Object.entries(report.characters).map(([who,c])=>[who,Math.round((c.best.start+c.best.end)/2/STEP)*STEP]));
  start=i?events.at(-1).start+p.spacingSeconds:Math.max(0,p.reactionSeconds-Math.min(...Object.values(local)));
  for(const who of ['claude','constance'])start=Math.max(start,motionEnd[who]+.1-local[who],lastAction[who]+p.reactionSeconds-local[who]);
  if(events.length>=p.maxVisible){const prev=events[events.length-p.maxVisible];start=Math.max(start,prev.exit+960/report.speed);}
  const width=Math.max(...draft.frames[item.id].map(b=>b.w))*960/config.worldContract.sourceW*draft.placement[item.id].scale;
  const event={id:r.id,flight:report.flight,action:report.action,start:Math.ceil(start/STEP)*STEP,local,speed:report.speed,exit:0};event.exit=event.start+(config.objectQA.x+Math.abs(draft.placement[item.id].xOffset)+width*3)/event.speed;
  events.push(event);for(const who of ['claude','constance']){lastAction[who]=event.start+local[who];motionEnd[who]=lastAction[who]+report.characters[who].duration;}
 }
 // Verify the continuous trajectory against every hazard, including overlap.
 const cfg=profileConfig(config,draft.calibration),duration=Math.max(...events.map(e=>e.exit))+1;
 for(const who of ['claude','constance']){const m=createMotion(cfg);let next=0;for(let step=0;step<=Math.ceil(duration/STEP);step++){
  const t=step*STEP;if(next<events.length&&t+1e-8>=events[next].start+events[next].local[who]){const e=events[next++];if(m.state!=='run')throw new Error('Sequence action conflict; increase spacing.');m[e.action==='jump'?'triggerJump':'triggerSlide']();}
  const character=items.find(i=>i.id===`character:${who}:${m.state}`),cb=characterGeometry(cfg,character,m.frame,draft.frames[character.id][m.frame],draft.value[character.id][m.frame],{...draft.placement,groundOffset:draft.placement[`grounding:${stage}:${who}`].groundOffset+characterPathShift(draft,stage,who)},m.y).collision;
  let visible=0;
  for(const e of events){const item=items.find(i=>i.id===e.id),time=t-e.start;if(time< -960/e.speed||t>e.exit)continue;const hp=effectivePlacement(draft,item),frame=((Math.floor(time*(hp.fps??item.fps)+1e-9)%item.frames)+item.frames)%item.frames,g=hazardGeometry(cfg,item,frame,draft.frames[item.id][frame],draft.value[item.id][frame],hp,{time,flight:e.flight,looping:false});if(g.dest.x<960&&g.dest.x+g.dest.w>0)visible++;if(intersects(cb,g.collision))throw new Error(`Sequence needs more spacing for ${who}. Increase spacing/reaction time and regenerate.`);}
  if(visible>p.maxVisible)throw new Error('Sequence exceeds visible hazard limit. Increase spacing.');m.update(STEP);
 }}
 return {stage,events,duration,excluded:reports.filter(r=>r.stage===stage&&!r.ready).map(r=>r.id),profile:draft.calibration.profile,seed,verified:true};
}
