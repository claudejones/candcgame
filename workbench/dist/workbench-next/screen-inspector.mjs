import {GameAudio} from './game-audio.mjs';
import {AUDIO_ASSETS} from './audio-manifest.mjs';
import {paintGameHud} from './game-hud.mjs';
import {setupGlobalGame} from './global-game.mjs';
import {PlayerStore} from './player-state.mjs';
import {SCREEN_SCENARIOS,screenScenario} from './screen-scenarios.mjs';
import {loadLevel,drawLevel} from './level-runtime.mjs';
import {AssetLoader} from './asset-loader.mjs';
const node=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text)n.textContent=text;return n;};
export function setupScreenInspector({config,draft,items,catalog,landscapes,contract,stopDesign}){
 const audio=new GameAudio();
 const workspace=document.getElementById('workspace'),nav=document.getElementById('screens-panel');
 const studio=node('section','screen-studio'),inspector=node('aside','screen-inspector');studio.hidden=inspector.hidden=true;
 studio.append(node('h2','','Screen preview'));const panel=node('div','screen-preview-host'),surface=node('div','play-surface'),canvas=node('canvas');canvas.width=960;canvas.height=540;surface.append(canvas);const hud=document.getElementById('run-hud').cloneNode(true);hud.removeAttribute('id');for(const n of hud.querySelectorAll('[id]'))n.removeAttribute('id');surface.append(hud);panel.append(surface);studio.append(panel);workspace.append(studio,inspector);
 inspector.append(node('div','section-label','SCREEN INSPECTOR'));const trigger=node('p','muted');inspector.append(trigger);
 const audioField=node('label','check'),audioEnabled=node('input');audioEnabled.type='checkbox';audioField.append(audioEnabled,document.createTextNode('Audio preview'));inspector.append(audioField);
 const audioPicker=node('select');audioPicker.setAttribute('aria-label','Sound to preview');for(const id of Object.keys(AUDIO_ASSETS))audioPicker.add(new Option(id.replaceAll('_',' '),id));
 const audioControls=node('div','screen-transport'),listen=node('button','','Play sound'),silence=node('button','','Stop sound');audioControls.append(listen,silence);inspector.append(audioPicker,audioControls);
 const audioHint=node('p','muted','Audio preview is off. Editing and optimization stay silent.');audioHint.setAttribute('role','status');inspector.append(audioHint);
 audioEnabled.onchange=()=>{audio.enable(audioEnabled.checked);if(audioEnabled.checked)audio.unlock();refresh();};
 listen.onclick=()=>{audioEnabled.checked=true;audio.enable(true);audio.unlock();audio.audition(audioPicker.value,!/^(PLAYER_|UI_|BOSS_HIT|BOSS_WEAPON)/.test(audioPicker.value));audioHint.textContent='Playing '+audioPicker.options[audioPicker.selectedIndex].text+'.';};
 silence.onclick=()=>{audioEnabled.checked=false;audio.stop();audioHint.textContent='Audio preview is off.';};
 function select(label,options,parent=inspector){const field=node('label','field',label),s=node('select');for(const [value,text] of options)s.add(new Option(text,value));field.append(s);parent.append(field);s.onchange=refresh;return s;}
 const scenario=select('Screen',SCREEN_SCENARIOS.map(([id,label])=>[id,label]),nav);
 const stage=select('Stage',landscapes.map(l=>[l.stage.toUpperCase(),`${l.stage.slice(0,2).toUpperCase()} · Stage ${Number(l.stage.slice(2))} · ${config.worldProfiles[l.stage].label}`]));
 const route=select('Flight route',[['NA03','North America → South America'],['SA03','South America → Europe'],['EU03','Europe → Africa'],['AF03','Africa → Asia'],['AS03','Asia → Oceania'],['OC03','Oceania → Antarctica']]);
 const character=select('Character',[['claude','Claude'],['constance','Constance']]);
 const difficulty=select('Difficulty',[['easy','Easy'],['standard','Standard'],['hard','Hard']]);difficulty.value='standard';
 const hearts=select('Remaining hearts',[['3','3'],['2','2'],['1','1']]);
 const progress=select('Reward history',[['partial','Earlier stages complete'],['empty','No rewards'],['perfect','All stages perfect']]);
 const size=select('Preview width',[['960','960 px · Game'],['1280','1280 px · Desktop'],['844','844 px · Landscape']]);
 function fit(){panel.style.width=size.value+'px';panel.style.zoom=String(Math.min(1,Math.max(1,studio.clientWidth-36)/Number(size.value)));panel.dataset.previewWidth=size.value;}
 size.onchange=()=>{fit();refresh();};new ResizeObserver(fit).observe(studio);
 const travelField=node('label','field','Travel progress'),travelInput=node('input');travelInput.type='range';travelInput.min='0';travelInput.max='100';travelInput.value='0';travelField.append(travelInput);inspector.append(travelField);travelInput.oninput=()=>{if(fixture){animated=false;toggle.textContent='Play animation';panel.classList.add('screen-motion-paused');fixture.travelProgress=Number(travelInput.value)/100;ui.setTravelProgress(fixture.travelProgress);}};
 const transport=node('div','screen-transport');inspector.append(transport);
 function button(label,action){const b=node('button','',label);b.onclick=action;transport.append(b);return b;}
 const toggle=button('Pause animation',()=>{animated=!animated;if(audio.enabled)audio.engine.setPaused(!animated);if(animated&&isTravel()&&fixture.travelProgress>=1)setTravel(0);toggle.textContent=animated?'Pause animation':'Play animation';panel.classList.toggle('screen-motion-paused',!animated);});
 button('Step frame',()=>{animated=false;toggle.textContent='Play animation';panel.classList.add('screen-motion-paused');if(isTravel())stepTravel(1/60);else run?.advance(1/60);paint();});
 button('Reset preview',()=>{travelInput.value='0';refresh();});
 const next=button('Next reward',()=>{if(fixture?.result?.queue.length){fixture.queueIndex=(fixture.queueIndex+1)%(fixture.result.queue.length+1);ui.preview(fixture);}});
 const phase=select('Practice from',[['0','Start · 0:00'],['58','First pulse · 0:58'],['60','Phase 2 · 1:00'],['118','Second pulse · 1:58'],['120','Phase 3 · 2:00'],['178','Final containment · 2:58']]);
 const boxLabel=node('label','check'),boxes=node('input');boxes.type='checkbox';boxLabel.append(boxes,document.createTextNode('Show collision bounds'));inspector.append(boxLabel);
 const actions=node('div','gameplay-actions show');surface.append(actions);
 for(const action of ['slide','pause','jump']){const b=node('button','',action.toUpperCase());b.type='button';b.dataset.action=action;b.onclick=()=>{if(!run)return;audio.unlock();if(action==='pause'){if(run.status==='playing')run.pause();else if(run.status==='paused')run.start();b.textContent=run.status==='paused'?'RESUME':'PAUSE';}else run.action(action);paint();canvas.focus();};actions.append(b);}
 canvas.tabIndex=0;canvas.setAttribute('aria-label','Secret stage practice; Space to jump, down arrow to slide, P to pause');
 canvas.onkeydown=e=>{if(!active||run?.kind!=='secret'||!ui.presenting())return;if(['Space','ArrowUp','ArrowDown','KeyP'].includes(e.code)){e.preventDefault();e.stopPropagation();if(e.repeat)return;audio.unlock();if(e.code==='KeyP'){if(run.status==='playing')run.pause();else run.start();}else run.action(e.code==='ArrowDown'?'slide':'jump');}};
 const status=node('p','muted');status.setAttribute('role','status');inspector.append(status);
 let active=false,ui=null,initializing=null,run=null,images={},request=0,last=null,version=0,animated=true,fixture=null;
 const loader=new AssetLoader(),memory=new Map(),store=new PlayerStore({getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)});
 function paint(){if(run){if(['secret-play','secret-capture'].includes(fixture?.kind))audio.update(run);drawLevel(canvas,run,images,contract,{boxes:boxes.checked,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches});paintGameHud(hud,run,images);}}
 window.addEventListener('blur',()=>{run?.pause();last=null;});document.addEventListener('visibilitychange',()=>{if(document.hidden)run?.pause();last=null;});
 function isTravel(){return ['travel','travel-plane'].includes(fixture?.kind);}
 function setTravel(value){fixture.travelProgress=Math.min(1,value);travelInput.value=String(fixture.travelProgress*100);ui?.setTravelProgress(fixture.travelProgress);}
 function stepTravel(dt){setTravel((fixture.travelProgress||0)+dt*1000/Math.max(1,ui.travelDuration()));if(fixture.travelProgress>=1){animated=false;toggle.textContent='Play animation';panel.classList.add('screen-motion-paused');}}
 function tick(now){request=0;if(!active)return;if(last!==null&&animated&&!document.hidden){const dt=Math.min(.1,(now-last)/1000);if(isTravel())stepTravel(dt);else if(ui?.presenting())run?.advance(dt);}last=now;paint();ui?.update(run);if(audio.enabled)audio.engine.setPaused(!animated||(['secret-play','secret-capture'].includes(fixture?.kind)&&run?.status==='paused'));if(audio.enabled&&audio.engine.lastError)audioHint.textContent='Some audio could not play. Try Play sound again; the preview remains available.';request=requestAnimationFrame(tick);}
 async function loadRun(selection,result=null){
  const id=++version,loaded=await loadLevel({config,draft,items,catalog,stage:selection.stage.toLowerCase(),character:selection.character,difficulty:selection.difficulty},loader,{unlimitedLives:selection.unlimited===true});
  if(id!==version||!active)return;
  images=loaded.images;run=loaded.run;run.start();if(run.kind!=='secret')run.pause();
  if(run.kind==='secret'){run.previewPhase(Number(phase.value));if(scenario.value==='secret-capture'){run.previewPhase(179.99);run.advance(1/60);}}
  if(result){run.status=result.complete?'complete':'failed';if(result.complete)run.celebrationTime=4;run.lives=result.hearts;run.motion.setState(result.complete?'celebrate':'hit');if(run.kind==='secret'&&result.complete){run.previewPhase(179.99);run.steps=10800;run.shields=0;run.pulses=[60,120,180];run.captureTime=run.captureDuration+run.celebrationDuration;}if(!result.complete){run.motion.frame=1;run.config.spawnDirector.failed=true;}}

  paint();
 }
 async function refresh(){
  if(!active)return;audio.stop();audio.enable(audioEnabled.checked);audioHint.textContent=audioEnabled.checked?'Audio preview on · uses the same sounds as Game.':'Audio preview is off.';stopDesign();status.textContent='Loading preview…';
  try{
   if(!ui){initializing??=setupGlobalGame({guideData:{items,catalog,draft},panel,surface,previewStore:store,audio,pause:()=>run?.pause(),getRun:()=>run,launch:loadRun});ui=await initializing;}
   if(!active)return;
   fixture=screenScenario({kind:scenario.value,stage:scenario.value==='travel-plane'?route.value:stage.value,character:character.value,difficulty:difficulty.value,hearts:hearts.value,progress:progress.value});
   travelField.hidden=!isTravel();route.parentElement.hidden=fixture.kind!=='travel-plane';if(isTravel()){travelInput.value='0';fixture.travelProgress=0;}
   trigger.textContent=SCREEN_SCENARIOS.find(x=>x[0]===scenario.value)[2];next.disabled=!fixture.result?.queue.length;
   const isSecret=fixture.kind.startsWith('secret-');phase.parentElement.hidden=!isSecret;stage.parentElement.hidden=isSecret||fixture.kind==='travel-plane';difficulty.parentElement.hidden=isSecret;actions.hidden=fixture.kind!=='secret-play';
   await ui.preview(fixture);if(fixture.kind!=='secret-play'&&!isTravel())await loadRun(fixture,fixture.result);status.textContent='Preview only · player saves are unchanged.';
  }catch(e){initializing=null;status.textContent=`Could not load preview: ${e.message}. Use Reset preview to retry.`;}
 }
 return {chooseSecret(){scenario.value='secret-play';},open(){active=true;workspace.classList.add('screens-active');nav.hidden=false;studio.hidden=inspector.hidden=false;fit();last=null;cancelAnimationFrame(request);request=requestAnimationFrame(tick);refresh();},close(){active=false;version++;cancelAnimationFrame(request);ui?.close();workspace.classList.remove('screens-active');nav.hidden=true;studio.hidden=inspector.hidden=true;},active:()=>active};
}
