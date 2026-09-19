import {AssetSelection, Draft, descriptors, same, sourceFrame, validateAtlas, STORAGE_KEY} from './model.mjs';

const $ = id => document.getElementById(id);
const config = window.GAME_CONFIG;
const items = descriptors(config, window.GAME_SCHEMA);
const draft = new Draft(items);
const cache = new Map();
const selection = new AssetSelection(items);
let selected = items.find(item => item.id === 'character:claude:run');
let stage = 'na01', frame = 0, view = 'frame', playing = false, image = null, lastTick = 0, requestId = 0, animationRequest = 0;
let catalog;

function message(text, error = false) { $('message').textContent = text; $('message').classList.toggle('error', error); }
function saveState() {
  $('save-status').textContent = draft.dirty ? 'Unsaved candidate changes' : 'Candidate draft saved / no unsaved changes';
  $('change-count').textContent = `${draft.changedFrames} frame${draft.changedFrames === 1 ? '' : 's'} changed from baseline`;
  $('save').disabled = !draft.dirty;
  $('undo').disabled = !draft.past.length;
  $('redo').disabled = !draft.future.length;
}

function button(label, pressed, action, description) {
  const node = document.createElement('button'); node.type = 'button'; node.textContent = label;
  node.setAttribute('aria-pressed',String(pressed)); node.onclick = action;
  if(description){const hint=document.createElement('small');hint.textContent=description;node.append(hint);}
  return node;
}

function navigation() {
  const scope = selected.type === 'character' ? 'character' : 'stage';
  for (const name of ['stage','character']) {
    const active = name === scope;
    $(`${name}-tab`).setAttribute('aria-selected',String(active));
    $(`${name}-tab`).tabIndex = active ? 0 : -1;
    $(`${name}-panel`).hidden = !active;
  }
  $('stage-code').textContent = stage.toUpperCase();
  $('stage').value = stage;
  $('characters').replaceChildren(...['claude','constance'].map(who => button(who === 'claude' ? 'Claude' : 'Constance',
    selected.id.startsWith(`character:${who}:`),()=>select(selection.characterId(who)),'6 animation states')));
  $('hazards').replaceChildren(...items.filter(item=>item.stage === stage).map(item=>button(item.name,selected.id===item.id,
    ()=>select(item.id),`${item.frames} frame${item.frames===1?'':'s'} · ${item.kind}`)));
  $('states').hidden = selected.type !== 'character';
  $('states').replaceChildren(...Object.keys(config.state).map(state=>button(state[0].toUpperCase()+state.slice(1),state===selected.state,
    ()=>select(`character:${selected.id.split(':')[1]}:${state}`))));
}

async function loadImage(source) {
  if(!cache.has(source))cache.set(source,new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=async()=>{
      try{await img.decode();resolve(img);}catch{cache.delete(source);reject(new Error('Image could not be decoded.'));}
    };
    img.onerror=()=>{cache.delete(source);reject(new Error('Image could not be loaded.'));};img.src=source;
  }));
  return cache.get(source);
}

async function select(id) {
  selection.remember(selected,frame);
  selected=items.find(item=>item.id===id); if(!selected)throw new Error('Unknown sprite');
  setPlaying(false);frame=selection.frameFor(id);image=null;const token=++requestId;
  if(selected.stage)stage=selected.stage;
  selection.remember(selected,frame);
  navigation();
  $('breadcrumb').textContent=selected.type==='character'?`CHARACTERS / ${selected.name.toUpperCase()}`:`${stage.toUpperCase()} / HAZARDS`;
  $('asset-title').textContent=selected.type==='character'?`${selected.state[0].toUpperCase()+selected.state.slice(1)} animation`:selected.name;
  $('asset-scope').textContent=selected.type==='character'?'GLOBAL CHARACTER':`STAGE ${stage.toUpperCase()}`;
  $('source-size').textContent=`${selected.region.w} × ${selected.region.h}`;
  $('source-frames').textContent=selected.frames;
  $('source-file').textContent=catalog.assets[selected.asset].split('/').pop();
  $('playback-note').textContent=selected.artworkLoop?'Artwork loop only. Jump, Slide and Hit gameplay timing is tested in the runtime.':'Artwork preview. Use Test for actual movement, collisions and timing.';
  $('loading').hidden=false;$('loading').classList.remove('failed');$('loading').textContent=`Loading ${selected.name}${selected.state?' · '+selected.state:''}…`;$('retry').hidden=true;$('asset-health').textContent='Loading image…';
  $('preview-area').setAttribute('aria-busy','true');
  $('play').disabled=true;$('previous').disabled=true;$('next').disabled=true;
  makeFilmstrip();render();
  try {
    const loaded=await loadImage(catalog.assets[selected.asset]);
    if(token!==requestId)return;
    validateAtlas(selected,loaded.naturalWidth,loaded.naturalHeight);image=loaded;
    $('asset-health').textContent=`Loaded · ${image.naturalWidth} × ${image.naturalHeight} · frames verified`;
    $('play').disabled=selected.frames<2;$('previous').disabled=selected.frames<2;$('next').disabled=selected.frames<2;
    render();
    $('loading').hidden=true;$('preview-area').setAttribute('aria-busy','false');
  } catch(error) {
    if(token!==requestId)return;
    $('loading').classList.add('failed');$('loading').textContent=error.message;$('retry').hidden=false;$('asset-health').textContent='Image unavailable · try again';$('preview-area').setAttribute('aria-busy','false');
  }
}

function drawFrame(canvas, number, crop) {
  const r=selected.region;canvas.width=r.w;canvas.height=r.h;
  const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,r.w,r.h);
  if(!image)return;
  const source=sourceFrame(selected,number,crop);
  // Fixed source cell coordinates: crops never auto-enlarge the visible sprite.
  ctx.drawImage(image,source.x,source.y,source.w,source.h,crop.l,crop.t,source.w,source.h);
  if($('bounds').checked){ctx.strokeStyle='#c9ed8a';ctx.lineWidth=Math.max(2,r.w/230);ctx.strokeRect(crop.l+1,crop.t+1,source.w-2,source.h-2);}
}

function drawAtlas(canvas) {
  if(!image){canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);return;}
  canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0);
  const r=selected.region;ctx.lineWidth=Math.max(3,image.naturalWidth/450);
  for(let i=0;i<selected.frames;i++){
    ctx.strokeStyle=i===frame?'#c9ed8a':'#7ec7bb88';ctx.strokeRect(r.x+i*r.w+2,r.y+2,r.w-4,r.h-4);
  }
  if($('bounds').checked){const crop=sourceFrame(selected,frame,draft.crop(selected.id,frame));ctx.strokeStyle='#ffc987';ctx.strokeRect(crop.x+2,crop.y+2,crop.w-4,crop.h-4);}
}

function makeFilmstrip() {
  $('filmstrip').replaceChildren(...Array.from({length:selected.frames},(_,number)=>{
    const b=button('',number===frame,()=>setFrame(number));b.setAttribute('aria-label',`Select frame ${number+1}`);
    const c=document.createElement('canvas'),label=document.createElement('span');label.textContent=`Frame ${number+1}`;b.append(c,label);return b;
  }));
}

function render(updateThumbnails = true) {
  const crop=draft.crop(selected.id,frame);
  $('frame-label').textContent=`Frame ${frame+1} / ${selected.frames}`;
  $('scope').textContent=`${selected.name} · ${selected.state || stage.toUpperCase()} · frame ${frame+1} only`;
  for(const side of ['l','r','t','b']){
    const input=$(`crop-${side}`);input.value=crop[side];input.disabled=playing||!image;
    input.max=(['l','r'].includes(side)?selected.region.w:selected.region.h)-1;
  }
  $('reset-frame').disabled=playing||!image||same(crop,selected.crops[frame]);
  const showCompare=$('compare').checked&&view==='frame';
  document.querySelector('.baseline-card').hidden=!showCompare;
  $('compare').disabled=view==='atlas';
  $('preview-label').textContent=view==='atlas'?'SOURCE ATLAS · ACTIVE FRAME':'WORKING DRAFT';
  if(view==='frame')drawFrame($('preview'),frame,crop);else drawAtlas($('preview'));
  if(showCompare)drawFrame($('baseline'),frame,selected.crops[frame]);
  [...$('filmstrip').children].forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===frame));if(updateThumbnails)drawFrame(b.querySelector('canvas'),i,draft.crop(selected.id,i));});
  saveState();
}

function setPlaying(next) {cancelAnimationFrame(animationRequest);animationRequest=0;playing=next;lastTick=0;$('play').textContent=playing?'Pause frames':'Play frames';$('play').setAttribute('aria-pressed',String(playing));}
function setFrame(number) {setPlaying(false);frame=(number+selected.frames)%selected.frames;render();}
function tick(now) {
  if(playing&&image){
    if(!lastTick)lastTick=now;
    const delay=1000/(selected.fps*Number($('speed').value));
    if(now-lastTick>=delay){frame=(frame+Math.floor((now-lastTick)/delay))%selected.frames;lastTick=now-((now-lastTick)%delay);render(false);}
  }
  if(playing)animationRequest=requestAnimationFrame(tick);
}

for(const [id,profile] of Object.entries(config.worldProfiles))$('stage').add(new Option(`${id.toUpperCase()} · ${profile.label.split('—')[1]?.trim()||profile.label}`,id));
$('stage').value=stage;
$('stage').onchange=()=>select(selection.stageId($('stage').value));
for(const scope of ['stage','character']) {
  $(`${scope}-tab`).onclick=()=>select(scope==='stage'?selection.stageId(stage):selection.characterId());
  $(`${scope}-tab`).onkeydown=event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    const target=event.key==='Home'?'stage':event.key==='End'?'character':scope==='stage'?'character':'stage';
    $(`${target}-tab`).focus();$(`${target}-tab`).click();
  };
}
$('previous').onclick=()=>setFrame(frame-1);$('next').onclick=()=>setFrame(frame+1);
$('play').onclick=()=>{setPlaying(!playing);render(false);if(playing)animationRequest=requestAnimationFrame(tick);};
$('frame-view').onclick=()=>{view='frame';$('frame-view').setAttribute('aria-pressed','true');$('atlas-view').setAttribute('aria-pressed','false');render();};
$('atlas-view').onclick=()=>{view='atlas';$('frame-view').setAttribute('aria-pressed','false');$('atlas-view').setAttribute('aria-pressed','true');render();};
$('compare').onchange=render;$('bounds').onchange=render;
$('retry').onclick=()=>select(selected.id);
for(const side of ['l','r','t','b'])$(`crop-${side}`).onchange=()=>{
  try{
    const raw=$(`crop-${side}`).value;if(raw.trim()==='')throw new Error('Enter a crop value.');
    draft.edit(selected.id,frame,{...draft.crop(selected.id,frame),[side]:Number(raw)});
    message(`Updated frame ${frame+1}. Other frames are unchanged.`);
  }catch(error){message(error.message,true);}render();
};
$('reset-frame').onclick=()=>{draft.edit(selected.id,frame,selected.crops[frame]);message('This frame restored to its approved baseline crop.');render();};
$('undo').onclick=()=>{setPlaying(false);draft.undo();render();};$('redo').onclick=()=>{setPlaying(false);draft.redo();render();};
$('save').onclick=()=>{try{draft.save(localStorage);message('Candidate draft saved in this browser. Current editor saves are unchanged.');}catch(error){message(`Save failed: ${error.message}. Export the candidate crops to retain your work.`,true);}saveState();};
$('export').onclick=()=>{
  const blob=new Blob([JSON.stringify(draft.export(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='cc-workbench-next-sprite-crops.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  message('Exported candidate crop format. It is not a current game-config import.');
};
window.addEventListener('beforeunload',event=>{if(draft.dirty){event.preventDefault();event.returnValue='';}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){setPlaying(false);render();}});
window.addEventListener('keydown',event=>{
  if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(document.activeElement?.tagName))return;
  if(event.key==='ArrowLeft'){event.preventDefault();setFrame(frame-1);}
  if(event.key==='ArrowRight'){event.preventDefault();setFrame(frame+1);}
});

try{
  const response=await fetch('./asset-catalog.json');if(!response.ok)throw new Error(`Catalog load failed (${response.status})`);catalog=await response.json();
  try{const saved=localStorage.getItem(STORAGE_KEY);if(saved){draft.restore(JSON.parse(saved));message('Restored this candidate’s local draft.');}}catch(error){message(`Candidate save was not loaded: ${error.message}. The stored copy is unchanged.`,true);}
  await select(selected.id);
}catch(error){$('loading').textContent=error.message;message('Could not start the sprite workspace. Serve the repository over HTTP and reload.',true);}
