// Reproduce measured, timed collision evidence for a new stage without tuning it.
// Optional candidate metadata runs prospectively; the final run reads the release.
const fs = require('node:fs');
const crypto = require('node:crypto');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {load, read} = require('./landscape-runtime-state.cjs');
const stage = (process.argv[2] || '').toLowerCase();
if (!stage) throw Error('Usage: node scripts/audit-stage-gameplay.cjs STAGE [candidate.json]');
const runtime = load('runtime'), config = runtime.config;
const candidate = process.argv[3] ? JSON.parse(fs.readFileSync(process.argv[3])) : null;
if (candidate) {
  config.worldProfiles[stage] = {label:stage,farKey:stage+'Far',midKey:stage+'Mid',groundKey:stage+'Ground',characterGrounding:{claude:0,constance:0}};
  runtime.contract.applyStage(config,runtime.registry,stage,true);
  config.objectQA.defs[stage] = candidate.hazards;
  config.finish.stages[stage] = candidate.finish;
  runtime.context.window.CC_STAGE_CATALOG.stages[stage].release=candidate;
}
assert.ok(config.worldProfiles[stage], 'Stage is not integrated');
config.activeWorld = stage;
runtime.context.CONFIG = config;
const source = read('src/js/game-runtime.js');
vm.runInContext(`const CHAR={claude:{row:0,label:'CLAUDE'},constance:{row:1,label:'CONSTANCE'}};
const worldSourceW=()=>CONFIG.worldProfiles[CONFIG.activeWorld]?.sourceW||CONFIG.worldContract.sourceW;
${source.slice(source.indexOf('class CharacterMachine{'),source.indexOf('class Lab{'))}
this.Character=CharacterMachine;this.Preview=ObjectQA;this.Director=GameplayDirector;`,runtime.context);
const ctx={drawImage(){},save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},strokeRect(){}};
const assets=Object.fromEntries(['run','idle','jump','slide','hit','celebrate','stars'].map(x=>[x,x]));
const cache=new Map(), rates=[60,120], start=-1.9, end=1.9;
function setup(who){
  const character=new runtime.context.Character(assets);character.character=who;character.setState('run');character.draw(ctx);
  const preview=new runtime.context.Preview(ctx,{}, {lastRenderedSurfaceY:410,worldX:0},character);
  const director=Object.create(runtime.context.Director.prototype);director.objectQA=preview;
  return {character,preview,director};
}
function trajectory(who,action,lead,hz){
  const key=[who,action,lead,hz].join('|');if(cache.has(key))return cache.get(key);
  const q=setup(who),samples=[];let triggered=!action;
  for(let t=start;t<=end+1e-9;t+=1/hz){
    if(!triggered&&t>=-lead-1e-9){action==='jump'?q.character.triggerJump():q.character.triggerSlide();triggered=true;}
    q.character.update(1/hz);samples.push({t,box:q.preview.characterBox()});q.character.draw(ctx);
  }
  cache.set(key,samples);return samples;
}
function collision(who,def,mode,action,lead,hz,speed,phase){
  const q=setup(who),frames=def.frames||1;
  const geoms=Array.from({length:frames},(_,frame)=>q.director.geom({x:config.characterX,frame,mode},def));
  let overlap=false,gap=Infinity;
  for(const {t,box:cb} of trajectory(who,action,lead,hz)){
    const frame=frames>1?(Math.floor((t-start)*(def.fps||config.objectQA.flying.fps))+phase)%frames:0;
    const box={...geoms[frame].box,x:geoms[frame].box.x-speed*t};
    if(box.x<cb.x+cb.w&&box.x+box.w>cb.x){
      overlap=true;if(q.preview.intersects(box,cb))return {overlap,hit:true};
      gap=Math.min(gap,Math.max(box.y-(cb.y+cb.h),cb.y-(box.y+box.h)));
    }
  }
  return {overlap,hit:false,gap};
}
const results=[],geometry=[];
for(const def of config.objectQA.defs[stage]){
  const speeds=def.kind==='flying'?Object.values(config.spawnDirector.speedClasses):[config.worldSpeed];
  for(const who of ['claude','constance'])for(const [mode,action] of def.kind==='flying'?[['high','slide'],['low','jump']]:[[null,'jump']]){
    const good=[];let threatens=true;
    for(const hz of rates)for(const speed of speeds)for(let phase=0;phase<(def.frames||1);phase++)
      threatens &&= collision(who,def,mode,null,0,hz,speed,phase).hit;
    for(let n=5;n<=160;n++){
      const lead=n/100;let valid=true,gap=Infinity;
      scenarios:for(const hz of rates)for(const speed of speeds)for(let phase=0;phase<(def.frames||1);phase++){
        const v=collision(who,def,mode,action,lead,hz,speed,phase);
        if(!v.overlap||v.hit){valid=false;break scenarios;}gap=Math.min(gap,v.gap);
      }
      if(valid)good.push({lead,gap});
    }
    const groups=[];for(const v of good){if(!groups.length||v.lead-groups.at(-1).at(-1).lead>.011)groups.push([]);groups.at(-1).push(v);}
    const window=groups.map(g=>({start:g[0].lead,end:g.at(-1).lead,width:+(g.at(-1).lead-g[0].lead).toFixed(2),minimumGap:+Math.min(...g.map(v=>v.gap)).toFixed(2)})).sort((a,b)=>b.width-a.width)[0]||null;
    results.push({hazard:def.name,who,mode,action,threatensRunningPlayer:threatens,window});
  }
  const q=setup('claude');
  for(const mode of def.kind==='flying'?['high','low']:[null])for(let frame=0;frame<(def.frames||1);frame++)geometry.push({hazard:def.name,mode,frame,...q.director.geom({x:650,frame,mode},def)});
}
const characters=[];
for(const who of ['claude','constance'])for(const state of ['run','slide']){
  const q=setup(who),draws=[];q.character.setState(state);q.character.draw({...ctx,drawImage(...args){draws.push(args);}});
  characters.push({who,state,draws,box:q.preview.characterBox(),visible:q.character.last});
}
const course=[];
if(config.objectQA.defs[stage].length===3&&results.every(r=>r.window)){
  for(const who of ['claude','constance'])for(const hz of rates){
    const q=setup(who),scene={lastRenderedSurfaceY:410,worldX:0};
    const director=new runtime.context.Director(ctx,{finishMarker:{width:1211,height:1299}},scene,q.character,q.preview);
    director.reset();director.start();const sp=config.spawnDirector;
    const inputs=sp.planned.map(event=>{const r=results.find(r=>r.hazard===event.defName&&r.who===who&&r.mode===event.mode);return {at:event.time-(r.window.start+r.window.end)/2,action:r.action};});
    let n=0,lastHits=0;const hitEvents=[];
    for(let frame=0;frame<=91*hz&&!director.finished&&!sp.failed;frame++){
      while(n<inputs.length&&sp.elapsed>=inputs[n].at-1e-9){const input=inputs[n++];if(!director.isRecovering()){input.action==='jump'?q.character.triggerJump():q.character.triggerSlide();}}
      q.character.update(1/hz);director.update(1/hz);q.character.draw(ctx);
      if(sp.hits!==lastHits){hitEvents.push({time:sp.elapsed,event:sp.lastEvent});lastHits=sp.hits;}
    }
    const finish=director.finishGeom(),sc=config.canvas.w/config.worldContract.sourceW*config.finish.stages[stage].scale;
    course.push({who,hz,finished:director.finished,hits:sp.hits,hitEvents,elapsed:sp.elapsed,finalState:q.character.state,plannedHazards:sp.planned.length,
      signature:sp.planned.filter(e=>e.pattern===stage.toUpperCase()+' SIGNATURE').map(({time,defName,mode,speedClass})=>({time,defName,mode,speedClass})),
      finish:{geometry:finish,visibleContactY:finish?finish.dy+1238*sc:null,poleX:finish?finish.dx+437.5*sc:null}});
  }
}
const provenance={inputs:Object.fromEntries(['src/js/game-runtime.js','src/js/game-config.js','src/js/stage-contract.js','src/js/stage-catalog.js','config/stage-releases.json'].map(file=>[file,crypto.createHash('sha256').update(read(file)).digest('hex')])),assets:(candidate||runtime.context.window.CC_STAGE_CATALOG.stages[stage].release).assets};
const report={stage,provenance,mode:candidate?'prospective-candidate':'integrated-runtime',inputLeadStepSeconds:.01,simulationRangeSeconds:[start,end],sampleRatesHz:rates,speeds:config.spawnDirector.speedClasses,results,geometry,characters,course};
report.passed=results.every(r=>r.threatensRunningPlayer&&r.window&&r.window.width>=.06-1e-9)&&course.every(r=>r.finished&&r.hits===0&&r.finalState==='celebrate'&&Math.abs(r.finish.visibleContactY-410)<.01&&Math.abs(r.finish.poleX-config.characterX)<.01);
console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
