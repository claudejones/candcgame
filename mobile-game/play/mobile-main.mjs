import {setupGlobalGame} from './global-game.mjs';
import {AssetLoader} from './asset-loader.mjs';
import {runtimeSnapshot,PlayRuntime,runtimeAssetKeys} from './play-runtime.mjs';
import {loadLevel,drawLevel} from './level-runtime.mjs';
import {paintGameHud} from './game-hud.mjs';
import {AttractPlayback} from './attract-mode.mjs';
import {sharedAudio} from './audio-engine.mjs';
const $=id=>document.getElementById(id),panel=$('game'),surface=$('surface'),canvas=$('run-canvas'),portrait=matchMedia('(orientation: portrait)');
const loader=new AssetLoader(),limit=24,originalLoad=loader.load.bind(loader);
loader.load=source=>{const p=originalLoad(source);loader.cache.delete(source);loader.cache.set(source,p);while(loader.cache.size>limit)loader.cache.delete(loader.cache.keys().next().value);return p;};
let run=null,images={},ui=null,last=null,request=0,generation=0,auto=null;
const slidePointers=new Set();
function release(){slidePointers.clear();run?.holdSlide?.(false);}
function pause(){release();run?.pause();last=null;if(ui?.presenting())sharedAudio.setPaused(true);}
function interrupt(){pause();sharedAudio.visibility(document.hidden||portrait.matches);}
function rotation(){ $('rotate').hidden=!portrait.matches;panel.inert=portrait.matches;if(portrait.matches)interrupt();else{sharedAudio.visibility(document.hidden);last=null;} }
function paint(){
 if(!run)return;drawLevel(canvas,run,images,window.CC_LANDSCAPE_CONTRACT,{reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches});paintGameHud($('run-hud'),run);
 for(const a of ['jump','slide'])$('run-'+a).disabled=run.status!=='playing';
 $('run-pause').disabled=!['playing','paused'].includes(run.status);$('run-pause').textContent=run.status==='playing'?'PAUSE':'RESUME';$('run-pause').setAttribute('aria-label',run.status==='playing'?'Pause game':'Resume game');ui?.update(run);
}
function tick(now){request=0;if(!document.hidden&&!portrait.matches&&run&&ui?.presenting()){if(last!==null){const dt=Math.min(.1,(now-last)/1000);if(auto)auto.advance(dt);else run.advance(dt);}paint();}last=now;request=requestAnimationFrame(tick);}
function toggle(){if(ui?.blocked()||!run||portrait.matches)return;ui.audio.unlock();if(run.status==='playing')pause();else if(run.status==='paused'){release();run.start();sharedAudio.setPaused(false);last=null;}paint();}
function action(a,held=false){if(ui?.blocked()||run?.status!=='playing'||portrait.matches)return;ui.audio.unlock();if(a==='slide'&&held&&ui.store.state.settings.continuousSlide)run.holdSlide(true);else run.action(a);}
for(const a of ['jump','slide']){const b=$('run-'+a);b.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();if(a==='slide')slidePointers.add(e.pointerId);action(a,a==='slide');try{b.setPointerCapture?.(e.pointerId);}catch{}paint();};b.onclick=e=>{if(e.detail===0)action(a);};}
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('run-slide').addEventListener(event,e=>{slidePointers.delete(e.pointerId);if(!slidePointers.size)run?.holdSlide?.(false);});
$('run-pause').onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();toggle();};$('run-pause').onclick=e=>{if(e.detail===0)toggle();};
addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(e.target.tagName)||e.repeat)return;const a=['ArrowDown','KeyS'].includes(e.code)?'slide':['Space','ArrowUp','KeyW'].includes(e.code)?'jump':null;if(a||e.code==='KeyP'){e.preventDefault();if(a)action(a,a==='slide');else toggle();}});
addEventListener('keyup',e=>{if(['ArrowDown','KeyS'].includes(e.code))release();});addEventListener('blur',interrupt);addEventListener('pagehide',interrupt);document.addEventListener('visibilitychange',()=>{if(document.hidden)interrupt();else{sharedAudio.visibility(portrait.matches);last=null;}});portrait.addEventListener('change',rotation);
panel.addEventListener('dblclick',e=>e.preventDefault());
panel.addEventListener('gesturestart',e=>{if(panel.querySelector('.global-confirm,.global-result:not([hidden]),.global-notice:not([hidden])'))e.preventDefault();},{passive:false});
// Gesture unlock is repeatable after OS audio interruptions. No extra Ready dialog.
document.addEventListener('pointerdown',()=>{if(!portrait.matches)ui?.audio.unlock();},{capture:true});
// Hold decoded map/UI artwork through the session so navigation cannot reveal partial art.
const screenArtwork=[];
let screenManifest=null,worldAssets=null;
async function prepareScreens(world=false){
 if(worldAssets&&world)return worldAssets;
 if(!screenManifest){const response=await fetch('../assets/global-ui/manifest.json');
 if(!response.ok)throw Error('Map artwork could not load. Check your connection and retry.');
 screenManifest=await response.json();}
 const work=Promise.all(Object.entries(screenManifest).filter(([name])=>/\.png$/.test(name)&&(world?/^MAP_|^UI_CONTINENT/.test(name):/^(UI_|BRAND_GAME_LOGO|G1B_)/.test(name)&&!name.startsWith('UI_CONTINENT'))).map(async([name,record])=>{
  const img=new Image();
  await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Map artwork could not load. Check your connection and retry.'));img.src='../assets/global-ui/'+record.file+'?v='+record.sha256.slice(0,12);});
  if(img.decode)await img.decode();screenArtwork.push(img);
 }));
 if(world)worldAssets=work.catch(e=>{worldAssets=null;throw e;});
 await (world?worldAssets:work);await document.fonts?.ready;
}
async function boot(){
 void sharedAudio.prefetch('C_AND_C_TITLE');
 await prepareScreens();
 const response=await fetch('./release.json');if(!response.ok)throw Error('The game could not load. Check your connection and retry.');const data=await response.json();
 const {config,draft,items,catalog}=data;
 const playerStorage={getItem:key=>localStorage.getItem('candc.mobile-test.'+key),setItem:(key,value)=>localStorage.setItem('candc.mobile-test.'+key,value)};
 ui=await setupGlobalGame({panel,surface,playerStorage,prepareWorld:()=>prepareScreens(true),isVisible:()=>!document.hidden&&!portrait.matches,guideData:{items,catalog,draft},getRun:()=>run,pause,cancelDemo:()=>{generation++;if(auto){run=null;images={};auto=null;}},launch:async selection=>{
  const token=++generation;pause();run=null;images={};auto=null;
  const options={config,draft,items,catalog,...selection},stage=selection.stage;let loaded;
  if(stage==='secret01')loaded=await loadLevel(options,loader,{unlimitedLives:selection.unlimited});
  else{
   const response=await fetch(`./plans/${stage}-${selection.difficulty}.json`);if(!response.ok)throw Error('Stage could not load. Check your connection and try again.');const sequence=await response.json();
   if(!sequence.verified||sequence.stage!==stage||sequence.profile!==selection.difficulty)throw Error('Stage plan is incompatible with this release.');
   const snapshot=runtimeSnapshot({...options,sequence});const pairs=await Promise.all(runtimeAssetKeys(snapshot).map(async key=>{const img=await loader.load(catalog.assets[key]);const size=catalog.dimensions[key];if(size&&(img.naturalWidth!==size.width||img.naturalHeight!==size.height))throw Error('Stage artwork is incompatible with this release.');return [key,img];}));loaded={run:new PlayRuntime(snapshot,{unlimitedLives:selection.unlimited}),images:Object.fromEntries(pairs)};
  }
  if(token!==generation)return;run=loaded.run;images=loaded.images;auto=selection.demo?new AttractPlayback(run):null;
  $('run-hud').style.setProperty('--heart-sprite',`url("${images.hudHearts.src}")`);$('run-hud').style.setProperty('--character-sprite',`url("${images.hudCharacters.src}")`);$('run-path').src=images.hudPath.src;
  run.start();if(document.hidden||portrait.matches)pause();last=null;canvas.focus();
 }});
 $('boot').hidden=true;ui.open();rotation();request=requestAnimationFrame(tick);
}
$('retry').onclick=()=>location.reload();export const started=boot().catch(e=>{$('boot-text').textContent=e.message;$('retry').hidden=false;});rotation();
