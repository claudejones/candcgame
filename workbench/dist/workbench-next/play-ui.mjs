import {AttractPlayback} from './attract-mode.mjs';
import {prepareOptimization,artworkMeasurer} from './auto-optimization.mjs';
import {sharedAudio} from './audio-engine.mjs';
import {paintGameHud} from './game-hud.mjs';
import {loadLevel,drawLevel} from './level-runtime.mjs';
import {AssetLoader} from './asset-loader.mjs';

export function setupPlayModes({config,draft,items,catalog,landscapes,contract,getStage,getSequence=()=>null,stopDesign,returnDesign,message}){
 const $=id=>document.getElementById(id),panel=$('play-workspace'),loader=new AssetLoader();
 let mode='design',run=null,images={},request=0,last=null,token=0,ready=false,globalGame=null,unlimited=false,demo=false,demoPlayback=null;
 $('run-stage').replaceChildren(...landscapes.map(s=>new Option(`${s.stage.toUpperCase()} · ${config.worldProfiles[s.stage].label||s.stage}`,s.stage)));
 $('run-stage').append(new Option('Beneath the Ice','secret01'));
 const pause=()=>{cancelAnimationFrame(request);request=0;last=null;run?.pause();if(ready){paint();if(mode!=='design'&&!document.hidden)request=requestAnimationFrame(tick);}};
 const terminal=()=>run&&['complete','failed'].includes(run.status);
 function paint(){
  if(!run||!ready)return;drawLevel($('run-canvas'),run,images,contract,{reducedMotion:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches});
  paintGameHud($('run-hud'),run);
  const stopped=run.status!=='playing';
  const celebrated=run.status==='complete'&&run.celebrationTime>=run.config.state.celebrate.frames/run.config.state.celebrate.fps;
  $('run-overlay').hidden=globalGame?true:!(run.status==='ready'||run.status==='failed'||celebrated);
  $('run-overlay-title').textContent={ready:'Ready?',paused:'Paused',failed:'RUN FAILED',complete:'Stage complete!'}[run.status]||'';
  $('run-overlay-description').textContent={ready:'Jump over obstacles. Slide beneath high birds.',paused:'Your run is paused.',failed:'Give it another go.',complete:'You reached the end of this stage.'}[run.status]||'';
  $('run-restart').hidden=run.status==='ready';
  $('run-pause').disabled=terminal()||run.status==='ready';$('run-pause').textContent=run.status==='playing'?'PAUSE':'RESUME';
  $('run-toggle').textContent=run.status==='playing'?'Pause':terminal()?'Play again':run.status==='ready'?'Start':'Resume';
  $('run-jump').disabled=stopped;$('run-slide').disabled=stopped;globalGame?.update(run);
 }
 function tick(now){
  request=0;if(mode==='design'||!ready||document.hidden)return;
  if(last!==null&&(!globalGame||globalGame.presenting())){const dt=Math.min(.1,(now-last)/1000);if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches&&run.status==='complete'&&run.kind!=='secret')run.celebrationTime+=dt;else if(demoPlayback&&globalGame?.presenting())demoPlayback.advance(dt);else if(!(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches&&['paused','complete','failed'].includes(run.status))||(run.kind==='secret'&&run.status==='complete'&&!run.resultReady))run.advance(dt);}last=now;paint();
  if(['playing','paused','complete','failed'].includes(run.status))request=requestAnimationFrame(tick);
 }
 async function reload(propagate=false){
  pause();const current=++token;ready=false;$('run-overlay').hidden=true;$('run-pause').disabled=true;$('run-toggle').disabled=true;
  $('run-jump').disabled=true;$('run-slide').disabled=true;$('run-loading').hidden=false;$('run-loading').textContent='Loading stage…';
  try{
   let runtimeDraft=draft;
   if(demo){runtimeDraft={...draft,placement:structuredClone(draft.placement),calibration:structuredClone(draft.calibration),frames:structuredClone(draft.frames),value:structuredClone(draft.value)};const plan=await prepareOptimization({config,draft:runtimeDraft,items,stage:$('run-stage').value,measure:artworkMeasurer(loader,catalog)});if(current!==token)return;runtimeDraft.placement=plan.placement;runtimeDraft.calibration=plan.calibration;}
   const loaded=await loadLevel({config,draft:runtimeDraft,items,catalog,stage:$('run-stage').value,character:$('run-character').value,difficulty:$('run-difficulty').value,sequence:getSequence()},loader,{unlimitedLives:unlimited});
   if(current!==token||mode==='design')return;
   run=loaded.run;demoPlayback=demo?new AttractPlayback(run):null;run.lives=3;images=loaded.images;ready=true;
   $('run-hud').style.setProperty('--heart-sprite',`url("${images.hudHearts.src}")`);
   $('run-hud').style.setProperty('--character-sprite',`url("${images.hudCharacters.src}")`);
   $('run-path').src=images.hudPath.src;
   $('run-loading').hidden=true;$('run-toggle').disabled=false;paint();
  }catch(error){if(current===token){$('run-loading').textContent=`Could not load play mode: ${error.message}. Use Restart to retry.`;message(error.message,true);if(propagate===true)throw error;}}
 }
 async function switchMode(next){
  if(next===mode)return;if(next==='game')void sharedAudio.unlock();pause();stopDesign();mode=next;
  document.body.dataset.mode=mode;$('workspace').hidden=mode!=='design';panel.hidden=mode==='design';
  for(const name of ['design','game']){$(`mode-${name}`).classList.toggle('active',name===mode);$(`mode-${name}`).setAttribute('aria-pressed',String(name===mode));}
  if(mode==='design'){token++;globalGame?.close();returnDesign(run?.stage);return;}
  $('run-stage').value=getStage();$('run-difficulty').value=draft.calibration.profile;
  $('play-title').textContent='Game';
  try{
   if(!globalGame){const {setupGlobalGame}=await import('./global-game.mjs');globalGame=await setupGlobalGame({guideData:{items,catalog,draft},panel,surface:$('run-canvas').parentElement,pause,cancelDemo:()=>{token++;pause();if(demo){run=null;ready=false;cancelAnimationFrame(request);request=0;}demo=false;demoPlayback=null;},getRun:()=>run,
    launch:async selection=>{ demo=selection.demo===true;demoPlayback=null;$('run-stage').value=selection.stage;$('run-character').value=selection.character;$('run-difficulty').value=selection.difficulty;unlimited=selection.unlimited;await reload(true);if(!ready||mode==='design')return;cancelAnimationFrame(request);run.start();last=null;request=requestAnimationFrame(tick);$('run-canvas').focus();paint(); },backDesign:()=>switchMode('design')});}
   globalGame.open();
  }catch(error){message(`Could not open Game: ${error.message}`,true);await switchMode('design');}
 }
 for(const name of ['design','game']){$(`mode-${name}`).disabled=false;$(`mode-${name}`).onclick=()=>switchMode(name);}
 for(const id of ['run-stage','run-character','run-difficulty'])$(id).onchange=reload;
 $('run-restart').onclick=reload;$('run-design').onclick=()=>switchMode('design');
 $('run-toggle').onclick=async()=>{
  if(!ready)return;globalGame?.audio.unlock();globalGame?.audio.effect('UI_BUTTON_CONFIRM');if(terminal())await reload();if(!ready)return;
  if(run.status==='playing')pause();else{cancelAnimationFrame(request);run.start();last=null;request=requestAnimationFrame(tick);$('run-canvas').focus();paint();}
 };
 $('run-pause').onpointerdown=e=>{if(e.button!==undefined&&e.button!==0)return;e.preventDefault();if(!$('run-pause').disabled)$('run-toggle').onclick();};
 $('run-pause').onclick=e=>{if(e.detail===0)return $('run-toggle').onclick();};
 for(const action of ['jump','slide'])$(`run-${action}`).onpointerdown=e=>{e.preventDefault();if(ready){globalGame?.audio.unlock();if(action==='slide'&&run.holdSlide){run.holdSlide(true);$(`run-${action}`).setPointerCapture?.(e.pointerId);}else run.action(action);paint();}};
 for(const action of ['jump','slide'])$(`run-${action}`).onclick=e=>{if(e.detail===0&&ready){globalGame?.audio.unlock();run.action(action);paint();}};
 for(const type of ['pointerup','pointercancel','lostpointercapture'])$('run-slide').addEventListener(type,()=>run?.holdSlide?.(false));
 window.addEventListener('keyup',e=>{if(['ArrowDown','KeyS'].includes(e.code))run?.holdSlide?.(false);});
 // Capture play keys so Design shortcuts cannot fire while its workspace is hidden.
 window.addEventListener('keydown',e=>{
  if(mode==='design'||globalGame?.blocked()||$('project-dialog').open||['INPUT','SELECT','TEXTAREA','BUTTON'].includes(e.target.tagName))return;
  if(['Space','ArrowUp','ArrowDown','KeyW','KeyS','KeyP'].includes(e.code)){
   e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
   if(e.code==='KeyP'&&run&&['playing','paused'].includes(run.status))$('run-toggle').click();else if(ready){globalGame?.audio.unlock();if(['ArrowDown','KeyS'].includes(e.code)&&run.holdSlide)run.holdSlide(true);else run.action(['ArrowDown','KeyS'].includes(e.code)?'slide':'jump');paint();}
  }
 },true);
 window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(mode!=='design'&&ready){cancelAnimationFrame(request);last=null;request=requestAnimationFrame(tick);}});
 return {active:()=>mode!=='design',pause,changed:()=>{if(mode!=='design')reload();}};
}
