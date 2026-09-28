import {encounterPacing,encounterVariation,encounterSeed,PACING_VERSION} from './encounter-pacing.mjs';
import {createMotion,intersects} from './runtime-rules.mjs';
import {STEP,characterGeometry,hazardGeometry} from './scene-model.mjs';
import {croppedBounds} from './frame-editor.mjs';
import {pathShift,characterPathShift,effectivePlacement,profileConfig,calibrationReferenceStamp,timingProfileStamp,hazardSpeed,PROFILES} from './calibration-settings.mjs';
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
 const bounds=croppedBounds(draft.frames[item.id][0],draft.value[item.id][0]);
 const core=item.artworkCore?{left:(item.artworkCore[0]-bounds.x)/bounds.w,right:(item.artworkCore[2]-bounds.x)/bounds.w,top:(item.artworkCore[1]-bounds.y)/bounds.h,bottom:(item.artworkCore[3]-bounds.y)/bounds.h}:null;
 return {...m,frames,warnings,core,contact:item.artworkContactY===undefined?m.bottom:(item.artworkContactY-bounds.y)/bounds.h};
}
function actorCache(config,draft,items,stage,who,action,end){
 const shared={...draft.placement,groundOffset:draft.placement[`grounding:${stage}:${who}`].groundOffset+characterPathShift(draft,stage,who)};
 const geom=m=>{const item=items.find(i=>i.id===`character:${who}:${m.state}`);return characterGeometry(config,item,m.frame,draft.frames[item.id][m.frame],draft.value[item.id][m.frame],shared,m.y).collision;};
 const run=[];for(let phase=0;phase<config.state.run.frames;phase++){const m=createMotion(config);m.elapsed=phase/config.state.run.fps;const arr=[];for(let n=0;n<=end;n++){arr.push(geom(m));m.update(STEP);}run.push(arr);}
 const m=createMotion(config,action),acted=[];let duration=0;for(let n=0;n<=end;n++){acted.push(geom(m));if(n&&m.state==='run'&&!duration)duration=n;m.update(STEP);}return {run,acted,duration:duration||end};
}
const cache=new WeakMap();
function actorsFor(config,draft,items,stage,action,end){
 let map=cache.get(draft);if(!map){map=new Map();cache.set(draft,map);}const key=JSON.stringify([stage,action,end,config.actions,config.jump,['claude','constance'].map(who=>characterPathShift(draft,stage,who)),Object.entries(draft.placement).filter(([id])=>id.startsWith('character:')||id.startsWith('grounding:')),Object.entries(draft.frames).filter(([id])=>id.startsWith('character:')),Object.entries(draft.value).filter(([id])=>id.startsWith('character:'))]);
 if(!map.has(key))map.set(key,Object.fromEntries(['claude','constance'].map(who=>[who,actorCache(config,draft,items,stage,who,action,end)])));return map.get(key);
}
function intervals(flags){const out=[];let start=null;for(let i=0;i<=flags.length;i++){if(flags[i]&&start===null)start=i;if(!flags[i]&&start!==null){out.push({start:start*STEP,end:(i-1)*STEP,width:(i-start)*STEP});start=null;}}return out;}
export function analyzeHazard({config,draft,items,item,placement=draft.placement[item.id],flight='high',profileName=draft.calibration.profile,speedFactor=1}){
 const cfg=profileConfig(config,{...draft.calibration,profile:profileName}),profile=draft.calibration.profiles[profileName],action=item.kind==='flying'&&flight==='high'?'slide':'jump';
 const calibratedSpeed=hazardSpeed(draft.calibration,item,profileName)*speedFactor;
 if(item.kind==='flying')cfg.objectQA.flying.speed=calibratedSpeed;else cfg.worldSpeed=calibratedSpeed;
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
 const core=art.core??art,factor=art.core?1:.85;
 set('cw',clamp((core.right-core.left)*factor,.05,1.2));set('ch',clamp((core.bottom-core.top)*factor,.05,1.2));set('cx',clamp((core.left+core.right)/2-.5,-1,1));set('cy',item.kind==='ground'?-(1-core.bottom):clamp((core.top+core.bottom)/2-.5,-1,1));
 const path=draft.calibration.stages[item.stage].pathY;
 const geometry=flight=>hazardGeometry(config,item,0,draft.frames[item.id][0],draft.value[item.id][0],effectivePlacement({...draft,placement:{...draft.placement,[item.id]:p}},item),{flight,travel:false});
 if(item.kind==='ground'){const g=geometry('high');set('groundOffset',clamp(p.groundOffset+path-(g.dest.y+(art.contact??art.bottom)*g.dest.h),-300,300));if(art.core){const aligned=geometry('high');set('cy',(aligned.dest.y+core.bottom*aligned.dest.h-aligned.anchor)/aligned.dest.h);}}
 else{
  const slideTops=[];for(const who of ['claude','constance']){const it=items.find(i=>i.id===`character:${who}:slide`);for(let frame=0;frame<it.frames;frame++)slideTops.push(characterGeometry(config,it,frame,draft.frames[it.id][frame],draft.value[it.id][frame],{...draft.placement,groundOffset:draft.placement[`grounding:${item.stage}:${who}`].groundOffset+characterPathShift(draft,item.stage,who)}).collision.y);}
  const high=geometry('high').collision;set('highClearance',clamp(p.highClearance+high.y+high.h-Math.min(...slideTops)+5,-300,500));
  const low=geometry('low').collision;set('lowClearance',clamp(p.lowClearance+low.y+low.h-(path-4),-300,500));
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
 let rng=encounterSeed(stage,draft.calibration.profile,seed);const rand=()=>{rng=(Math.imul(1664525,rng)+1013904223)>>>0;return rng/4294967296;};
 // Ground props share one validated terrain velocity. Flying hazards retain
 // independent speeds. This never edits authored placement or global profiles.
 const grounds=eligible.filter(r=>items.find(i=>i.id===r.id).kind==='ground');
 let groundSpeed=p.groundSpeed,groundReports=new Map();
 const speeds=[p.groundSpeed,...grounds.map(r=>r.reports[0].speed),...Array.from({length:61},(_,i)=>40+i*10)];
 for(const speed of [...new Set(speeds)].sort((a,b)=>Math.abs(a-p.groundSpeed)-Math.abs(b-p.groundSpeed))){
  const found=new Map();for(const r of grounds){const item=items.find(i=>i.id===r.id),report=analyzeHazard({config,draft,items,item,speedFactor:speed/hazardSpeed(draft.calibration,item,draft.calibration.profile)});if(!report.pass)break;found.set(r.id,report);}
  if(found.size===grounds.length){groundSpeed=speed;groundReports=found;break;}
 }
 if(groundReports.size!==grounds.length)throw Error('Ground hazards have no shared safe terrain speed. Review locked geometry overrides.');
 const events=[],combinations=[],variantReports=new Map(),cfg=profileConfig(config,draft.calibration),duration=90;
 const settings=draft.stageSettings?.[stage]?.combinations??{length:0,holdSeconds:0,density:1};
 const difficulty=draft.calibration.profile,rank={easy:0,standard:1,hard:2}[difficulty];
 const margin=[.28,.18,.1][rank],cutoff=duration-.15;
 const geometry=(e,t)=>{const item=items.find(i=>i.id===e.id),hp=effectivePlacement(draft,item),time=t-e.start,frame=((Math.floor(time*(hp.fps??item.fps)+1e-9)%item.frames)+item.frames)%item.frames;return hazardGeometry(cfg,item,frame,draft.frames[item.id][frame],draft.value[item.id][frame],hp,{time,flight:e.flight,looping:false,speed:e.speed});};
 // Validate complete combinations, including earlier hazards still on screen.
 // Failed candidates are delayed automatically; no manual spacing repair step.
 function flightClear(candidate){
  const flyers=candidate.filter(e=>e.kind==='flying');
  for(let i=0;i<flyers.length;i++)for(const b of flyers.slice(i+1)){
   const a=flyers[i];if(a.bounds.bottom<=b.bounds.top||b.bounds.bottom<=a.bounds.top)continue;
   const begin=Math.max(0,a.start+a.enter,b.start+b.enter),end=Math.min(duration,a.exit,b.exit);if(end<=begin)continue;
   for(const t of [begin,end])if(b.bounds.left-(t-b.start)*b.speed-(a.bounds.right-(t-a.start)*a.speed)<11.99)return false;
  }
  return true;
 }
 function checked(candidate,from=0){
  if(!flightClear(candidate))return false;
  for(const who of ['claude','constance']){let slides=0;for(const e of [...candidate].sort((a,b)=>(a.start+a.local[who])-(b.start+b.local[who]))){slides=e.action==='slide'?slides+1:0;if(slides>2)return false;}}
  for(const who of ['claude','constance']){
   const m=createMotion(cfg);let next=0;while(next<candidate.length&&candidate[next].start+candidate[next].local[who]<from-1e-8)next++;
   const first=Math.max(0,from),last=Math.min(duration,Math.max(...candidate.map(e=>e.exit))+STEP);
   for(let step=Math.floor(first/STEP);step<=Math.ceil(last/STEP);step++){
    const t=step*STEP;
    while(next<candidate.length&&t+1e-8>=candidate[next].start+candidate[next].local[who]){
     const e=candidate[next++];if(m.state!=='run'&&!(m.state==='slide'&&e.action==='slide'))return false;
     m[e.action==='jump'?'triggerJump':'triggerSlide']();if(e.holdUntil)m.slideT=Math.max(m.slideT,e.holdUntil[who]-t);
    }
    const character=items.find(i=>i.id===`character:${who}:${m.state}`),cb=characterGeometry(cfg,character,m.frame,draft.frames[character.id][m.frame],draft.value[character.id][m.frame],{...draft.placement,groundOffset:draft.placement[`grounding:${stage}:${who}`].groundOffset+characterPathShift(draft,stage,who)},m.y).collision;
    let visible=0,limit=p.maxVisible;
    for(const e of candidate){if(t<e.start-960/e.speed||t>e.exit)continue;const g=geometry(e,t);limit=Math.max(limit,e.maxVisible);if(g.dest.x<960&&g.dest.x+g.dest.w>0)visible++;if(intersects(cb,g.collision))return false;}
    if(visible>limit)return false;m.update(STEP);
   }
  }
  return true;
 }
 function choose(kind,phase,index,forcedSpeed=null){
  const flying=kind==='high'||kind==='low',pool=eligible.filter(r=>items.find(i=>i.id===r.id).kind===(flying?'flying':'ground'));
  const choices=pool.length?pool:eligible,r=choices[Math.floor(rand()*choices.length)],item=items.find(i=>i.id===r.id);
  let report=groundReports.get(r.id);
  if(!report){
   const base=r.reports.find(x=>x.flight===(kind==='high'?'high':'low'))??r.reports[0],factor=forcedSpeed?forcedSpeed/hazardSpeed(draft.calibration,item,difficulty):encounterVariation(index,phase,difficulty,stage).speedFactor,key=[r.id,base.flight,factor].join(':');
   if(!variantReports.has(key))variantReports.set(key,analyzeHazard({config,draft,items,item,flight:base.flight,speedFactor:factor}));
   report=variantReports.get(key);if(!report.pass)report=base;
  }
  const local=Object.fromEntries(Object.entries(report.characters).map(([who,c])=>[who,Math.round((c.best.start+c.best.end)/2/STEP)*STEP]));
  const hp=effectivePlacement(draft,item),frames=Array.from({length:item.frames},(_,f)=>hazardGeometry(cfg,item,f,draft.frames[item.id][f],draft.value[item.id][f],hp,{time:0,flight:report.flight,speed:report.speed,looping:false}));
  const bounds={left:Math.min(...frames.map(g=>g.dest.x)),right:Math.max(...frames.map(g=>g.dest.x+g.dest.w)),top:Math.min(...frames.map(g=>g.dest.y)),bottom:Math.max(...frames.map(g=>g.dest.y+g.dest.h))};
  const travel=Math.max(bounds.right,...frames.map(g=>g.collision.x+g.collision.w))/report.speed+STEP*2;
  // The derived allowance includes an incoming combination and cleared props
  // still leaving the viewport. It does not require a blank screen between groups.
  return {phase,maxVisible:Math.min(8,p.maxVisible+phase+4),id:r.id,kind:item.kind,bounds,enter:(bounds.left-960)/report.speed,flight:report.flight,action:report.action,local,speed:report.speed,travel,actionDuration:Math.max(...Object.values(report.characters).map(c=>c.duration))};
 }
 // Sections describe pressure, not separate encounter containers. Carry the
 // scheduling cursor across boundaries and fill the entire playable timeline.
 const restRanges={easy:[3.5,2.2],standard:[2.5,1.2],hard:[1.75,.85]}[difficulty];
 const profileBaseline={easy:{spacing:2.6,reaction:2.8,count:6},standard:{spacing:1.75,reaction:2.2,count:8},hard:{spacing:1.1,reaction:1.6,count:12}}[difficulty];
 const restScale=clamp((p.spacingSeconds/profileBaseline.spacing+p.reactionSeconds/profileBaseline.reaction)/2,.5,2)/settings.density*clamp(profileBaseline.count/p.count,.5,2);
 const targetRest=phase=>(restRanges[0]+(restRanges[1]-restRanges[0])*phase/4)*restScale;
 const patternNames=['jump-slide','repeat-jump','mixed','hold-slide'];
 let cursor=Math.max(2,p.reactionSeconds),group=0;
 function separate(pending){
  // The envelope covers every animation frame, not only the collision box.
  // Linear flight means checking both ends of the shared visibility interval
  // also prevents a fast trailing flyer overtaking a slower leading flyer.
  for(let n=0;n<pending.length;n++){
   const b=pending[n];if(b.kind!=='flying')continue;
   for(let attempt=0;attempt<80;attempt++){
    let shortfall=0;
    for(const a of [...events,...pending.slice(0,n)].filter(e=>e.kind==='flying')){
     if(a.bounds.bottom<=b.bounds.top||b.bounds.bottom<=a.bounds.top)continue;
     const begin=Math.max(0,a.start+a.enter,b.start+b.enter),end=Math.min(duration,a.exit,b.exit);
     if(end<=begin)continue;
     const gap=t=>b.bounds.left-(t-b.start)*b.speed-(a.bounds.right-(t-a.start)*a.speed);
     shortfall=Math.max(shortfall,12-Math.min(gap(begin),gap(end)));
    }
    if(shortfall<.001)break;
    const shift=Math.ceil((shortfall/b.speed+STEP)/STEP)*STEP;
    for(let i=n;i<pending.length;i++){pending[i].start+=shift;pending[i].exit=pending[i].start+pending[i].travel;}
   }
  }
 }
 function hold(pending){
  for(const e of pending)delete e.holdUntil;
  for(let i=0;i<pending.length-1;i++)if(pending[i].action==='slide'&&pending[i+1].action==='slide'){
   const pair=pending.slice(i,i+2),until=Object.fromEntries(['claude','constance'].map(who=>[who,Math.max(...pair.map(e=>e.start+e.local[who]+e.actionDuration))]));for(const e of pair)e.holdUntil=until;i++;
  }
 }
 const endOf=pending=>Math.max(...pending.map(e=>e.start+Math.max(...Object.values(e.local))+e.actionDuration));
 function build(motif,phase,at,offset=0){
  const pending=[];
  for(const [index,requestedKind] of motif.entries()){
   const history=[...events,...pending],pair=history.slice(-2);
   const kind=requestedKind==='high'&&pair.length===2&&pair.every(e=>e.action==='slide')?((group+phase)%2?'low':'ground'):requestedKind;
   const prev=pending.at(-1),e=choose(kind,phase,events.length+index+offset,kind==='high'&&prev?.action==='slide'?prev.speed:null);
   if(prev)at+=prev.action==='slide'&&e.action==='slide'?(settings.holdSeconds?Math.max(.3,(settings.holdSeconds-config.actions.slideDuration)):[.65,.55,.45][rank]):prev.actionDuration+margin*(1-phase*.1)+Math.max(0,p.spacingSeconds-1.5)*(.2-phase*.025);
   e.start=Math.ceil(Math.max(0,at-Math.min(...Object.values(e.local)))/STEP)*STEP;e.exit=e.start+e.travel;pending.push(e);
  }
  separate(pending);hold(pending);return pending;
 }
 function append(pending,phase){
  const id=combinations.length,start=Math.min(...pending.map(e=>e.start+Math.min(...Object.values(e.local)))),end=endOf(pending),actions=pending.map(e=>e.action),held=actions.length>1&&actions.every(a=>a==='slide');
  combinations.push({id,phase,start,end,label:held?'Hold slide':actions.join(' → '),heldSeconds:held?end-start:0});
  events.push(...pending.map(e=>({...e,combination:id})));return end;
 }
 while(cursor<87.5&&group<100){
  const phase=Math.min(4,Math.floor(cursor/18)),length=settings.length||Math.min(4,2+Math.floor((phase+rank)/2));
  const motifs=[['ground','high'],Array(length).fill('ground'),['low','ground','high'],Array(Math.min(3,length)).fill('high')].filter((m,i)=>(settings.patterns??patternNames).includes(patternNames[i]));
  const preferred=(encounterSeed(stage,difficulty,seed)+group)%motifs.length;
  let accepted=null;
  // Try other allowed combinations before adding idle time. Partial combinations
  // are only used for the final approach or an authored safety constraint.
  for(let delay=0;delay<=2&&!accepted;delay+=.25){
   for(let choice=0;choice<motifs.length&&!accepted;choice++){
    const motif=motifs[(preferred+choice)%motifs.length].slice(0,length),pending=build(motif,phase,cursor+delay,choice);
    while(pending.length&&(endOf(pending)>87.5||Math.max(...pending.map(e=>e.exit))>cutoff)){pending.pop();hold(pending);}
    if(!pending.length)continue;
    const first=Math.min(...pending.map(e=>e.start+Math.min(...Object.values(e.local))));
    if(first>cursor+delay+.5)continue;
    if(checked([...events,...pending],combinations.at(-1)?.end??0))accepted=pending;
   }
  }
  if(!accepted)break;
  const end=append(accepted,phase);cursor=end+targetRest(Math.min(4,Math.floor(end/18)));group++;
 }
 // Fill the last approach with a short allowed encounter if a larger group
 // could not fit. Completion and celebration still start at exactly 90 seconds.
 const lastEnd=combinations.at(-1)?.end??0;
 if(lastEnd<86.5){
  const allowed=settings.patterns??patternNames,kind=allowed.every(p=>p==='hold-slide')?'high':'ground';
  for(let at=87;at>=Math.max(lastEnd+.75,84);at-=.25){
   const pending=build([kind],4,at);if(endOf(pending)>88||pending[0].exit>cutoff)continue;
   if(checked([...events,...pending],lastEnd)){append(pending,4);break;}
  }
 }
 const last=combinations.at(-1);
 if(last&&last.end<87.1){
  const tail=events.filter(e=>e.combination===last.id),prefix=events.filter(e=>e.combination!==last.id),shift=Math.min(87.3-last.end,cutoff-Math.max(...tail.map(e=>e.exit)));
  if(shift>0&&shift<=1.25){const moved=tail.map(e=>({...e,start:e.start+shift,exit:e.exit+shift,...(e.holdUntil?{holdUntil:Object.fromEntries(Object.entries(e.holdUntil).map(([who,t])=>[who,t+shift]))}:{})}));
   if(checked([...prefix,...moved],combinations.at(-2)?.end??0)){events.splice(prefix.length,tail.length,...moved);last.start+=shift;last.end+=shift;}
  }
 }
 const breathingRooms=combinations.map((c,i)=>{const next=combinations[i+1],end=next?.start??duration,length=Math.max(0,end-c.end),target=targetRest(c.phase);return {start:c.end,end,duration:length,phase:c.phase,kind:next?'recovery':'finish',target:next?target:2.5,long:length>(next?target+1.25:3.1)};});
 if(!events.length)throw Error('No checked encounter fits this stage. Review conflicting geometry overrides.');
 if(!checked(events))throw Error('Stage verification failed. Your settings were preserved.');
 return {groundSpeed,pacingBoundaries:[0,18,36,54,72],pacingVersion:PACING_VERSION,stage,events,combinations,breathingRooms,duration,excluded:reports.filter(r=>r.stage===stage&&!r.ready).map(r=>r.id),profile:difficulty,seed,verified:true};
}
