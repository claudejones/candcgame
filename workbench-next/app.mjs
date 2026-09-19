import {AssetSelection, descriptors, same, sourceFrame, validateAtlas, STORAGE_KEY} from './model.mjs';
import {DesignDraft, DESIGN_STORAGE_KEY, LAYERS, landscapeDescriptors, drawLandscape} from './landscape.mjs';
import {AssetLoader} from './asset-loader.mjs';

const $ = id => document.getElementById(id);
const config = structuredClone(window.GAME_CONFIG);
const registry = window.CC_LANDSCAPE_REGISTRY, contract = window.CC_LANDSCAPE_CONTRACT;
contract.apply(config,registry);
const spriteItems = descriptors(config, window.GAME_SCHEMA);
const landscapes = landscapeDescriptors(config,registry,contract);
const items = [...landscapes,...spriteItems];
const draft = new DesignDraft(spriteItems,landscapes);
const loader = new AssetLoader();
const selection = new AssetSelection(items);
let selected = landscapes[0];
let stage = selected.stage, frame = 0, view = 'frame', playing = false, image = null, lastTick = 0, animationRequest = 0;
let sceneImages = {}, ready = false;
const sceneState = Object.fromEntries(landscapes.map(item=>[item.stage,{layer:'far',view:'scene',scroll:0,
  visible:{far:true,mid:true,ground:true,clouds:true},guides:false}]));
let catalog;
const isLandscape = () => selected.type === 'landscape';

function message(text, error = false) { $('message').textContent = text; $('message').classList.toggle('error', error); }
function saveState() {
  $('save-status').textContent = draft.dirty ? 'Unsaved browser draft changes' : 'Browser draft · no unsaved changes';
  $('change-count').textContent = `${draft.changedFrames} sprite frames · ${draft.changedLayers} landscape layers changed`;
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
  $('landscapes').replaceChildren(button('Stage landscape',isLandscape(),()=>select(`landscape:${stage}`),'FAR · MID · GROUND'));
  $('characters').replaceChildren(...['claude','constance'].map(who => button(who === 'claude' ? 'Claude' : 'Constance',
    selected.id.startsWith(`character:${who}:`),()=>select(selection.characterId(who)),'6 animation states')));
  $('hazards').replaceChildren(...spriteItems.filter(item=>item.stage === stage).map(item=>button(item.name,selected.id===item.id,
    ()=>select(item.id),`${item.frames} frame${item.frames===1?'':'s'} · ${item.kind}`)));
  $('states').hidden = selected.type !== 'character';
  $('states').replaceChildren(...Object.keys(config.state).map(state=>button(state[0].toUpperCase()+state.slice(1),state===selected.state,
    ()=>select(`character:${selected.id.split(':')[1]}:${state}`))));
  for(const id of ['landscape-layers','landscape-views','landscape-properties','scene-tools'])$(id).hidden=!isLandscape();
  for(const id of ['sprite-views','sprite-properties','animation-dock','bounds-control'])$(id).hidden=isLandscape();
  $('preview-area').classList.toggle('landscape-preview',isLandscape());
  $('inspector-title').textContent=isLandscape()?'Layer properties':'Frame properties';
  $('source-size-label').textContent=isLandscape()?'Image size':'Frame size';
  $('source-count-label').textContent=isLandscape()?'Artwork':'Frames';
  $('preview-context').textContent=isLandscape()?'Scene · 960 × 540':'Source pixels · fixed frame scale';
}

async function select(id) {
  if(!catalog)return;
  selection.remember(selected,frame);
  selected=items.find(item=>item.id===id); if(!selected)throw new Error('Unknown sprite');
  setPlaying(false);frame=selection.frameFor(id);image=null;sceneImages={};ready=false;
  if(selected.stage)stage=selected.stage;
  selection.remember(selected,frame);
  navigation();
  $('breadcrumb').textContent=selected.type==='character'?`CHARACTERS / ${selected.name.toUpperCase()}`:`${stage.toUpperCase()} / ${isLandscape()?'LANDSCAPE':'HAZARDS'}`;
  $('asset-title').textContent=isLandscape()?registry.stages[stage].label.split('—').at(-1).trim():selected.type==='character'?`${selected.state[0].toUpperCase()+selected.state.slice(1)} animation`:selected.name;
  $('asset-scope').textContent=selected.type==='character'?'GLOBAL CHARACTER':`STAGE ${stage.toUpperCase()}`;
  if(!isLandscape()) {
    $('preview').setAttribute('aria-label','Selected sprite preview');
    $('source-size').textContent=`${selected.region.w} × ${selected.region.h}`;
    $('source-frames').textContent=selected.frames;
    $('source-file').textContent=catalog.assets[selected.asset].split('/').pop();
  }
  $('playback-note').textContent=selected.artworkLoop?'Artwork loop only. Jump, Slide and Hit gameplay timing is tested in the runtime.':'Artwork preview. Use Test for actual movement, collisions and timing.';
  $('loading').hidden=false;$('loading').classList.remove('failed');$('retry').hidden=true;$('asset-health').textContent='Loading images…';
  $('preview-area').setAttribute('aria-busy','true');
  $('play').disabled=true;$('previous').disabled=true;$('next').disabled=true;
  if(!isLandscape())makeFilmstrip();render();
  const entries=isLandscape()?LAYERS.map(layer=>[layer,catalog.assets[selected.sources[layer]]]):[['sprite',catalog.assets[selected.asset]]];
  if(isLandscape() && config.worldProfiles[stage].clouds!==false)entries.push(['clouds',catalog.assets.clouds]);
  await loader.select(entries,{
    progress:(count,total)=>{$('loading').textContent=`Loading ${isLandscape()?stage.toUpperCase()+' landscape':selected.name} · ${count} of ${total} ready…`;},
    ready:loaded=>{
      if(isLandscape()) {
        for(const layer of LAYERS) {
          const expected=selected.expected?.[layer];
          if(expected && (loaded[layer].naturalWidth!==expected.width || loaded[layer].naturalHeight!==expected.height))throw new Error(`${layer.toUpperCase()} image dimensions do not match the registry.`);
        }
        sceneImages=loaded;$('asset-health').textContent=`Ready · ${entries.length} images decoded`;
      } else {
        validateAtlas(selected,loaded.sprite.naturalWidth,loaded.sprite.naturalHeight);image=loaded.sprite;
        $('asset-health').textContent=`Loaded · ${image.naturalWidth} × ${image.naturalHeight} · frames verified`;
        $('play').disabled=selected.frames<2;$('previous').disabled=selected.frames<2;$('next').disabled=selected.frames<2;
      }
      ready=true;render();
      $('loading').hidden=true;$('preview-area').setAttribute('aria-busy','false');
    },
    failed:error=>{
      ready=false;image=null;sceneImages={};render();
      $('loading').classList.add('failed');$('loading').textContent=error.message;$('retry').hidden=false;$('asset-health').textContent='Image unavailable · try again';$('preview-area').setAttribute('aria-busy','false');
    }
  });
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
  if(isLandscape()){renderLandscape();saveState();return;}
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

function renderLandscape() {
  const state=sceneState[stage], layer=state.layer, transform=draft.transform(stage,layer);
  $('scope').textContent=`${stage.toUpperCase()} · ${layer.toUpperCase()} layer only`;
  $('editing-layer').textContent=layer.toUpperCase();
  for(const name of LAYERS)$(`layer-${name}`).setAttribute('aria-pressed',String(name===layer));
  for(const mode of ['scene','layer','source'])$(`${mode}-view`).setAttribute('aria-pressed',String(mode===state.view));
  for(const field of ['scale','x','y','parallax']) {
    $(`layer-${field}`).value=transform[field];$(`layer-${field}`).disabled=!ready || state.view==='source';
  }
  $('reset-layer').disabled=!ready || state.view==='source' || same(transform,draft.landscapeBaseline[stage][layer]);
  $('transform-note').textContent=state.view==='source'?'Original image pixels. Use Scene or Layer to adjust placement.':'Scale multiplies the stage’s source-to-scene scale. X/Y use scene pixels; parallax is visible when you scroll. Gameplay surface stays at Y = 410.';
  const compare=$('compare').checked && state.view!=='source';
  $('compare').disabled=state.view==='source';
  document.querySelector('.baseline-card').hidden=!compare;
  $('preview-label').textContent=state.view==='source'?`${layer.toUpperCase()} · ORIGINAL SOURCE`:state.view==='layer'?`${layer.toUpperCase()} · WORKING DRAFT`:'SCENE · WORKING DRAFT';
  const options={config,contract,stage,images:sceneImages,...state,
    visible:state.view==='layer'?{...state.visible,[layer]:true}:state.visible};
  drawLandscape($('preview'),{...options,transforms:draft.landscapes[stage]});
  if(compare)drawLandscape($('baseline'),{...options,transforms:draft.landscapeBaseline[stage]});
  const source=sceneImages[layer];
  $('source-size').textContent=source?`${source.naturalWidth} × ${source.naturalHeight}`:'Loading…';
  $('source-file').textContent=catalog?.assets[selected.sources[layer]].split('/').pop().split('?')[0]||'—';
  $('source-frames').textContent=selected.status==='approved'?'Approved landscape':selected.status==='integrated'?'Integrated · awaiting review':'Legacy landscape';
  $('landscape-status').textContent=selected.status==='legacy'?'Current legacy artwork and placement. Phase 8 landscape replacement is pending.':selected.status==='approved'?'Approved landscape artwork and baseline. Visibility, guides and scroll are preview controls.':'Integrated landscape artwork awaiting approval. Visibility, guides and scroll are preview controls.';
  for(const name of [...LAYERS,'clouds']) {
    $(`visible-${name}`).checked=state.visible[name];
    $(`visible-${name}`).disabled=!ready || state.view!=='scene' || (name==='clouds' && config.worldProfiles[stage].clouds===false);
  }
  $('scene-guides').checked=state.guides;$('scene-guides').disabled=!ready || state.view==='source';
  $('scene-scroll').value=state.scroll;$('scene-scroll').disabled=!ready || state.view==='source';
  $('scroll-value').textContent=`${state.scroll} px`;
  $('preview').setAttribute('aria-label',`${stage.toUpperCase()} ${state.view==='scene'?'combined landscape':layer+' '+state.view}`);
}

function setPlaying(next) {cancelAnimationFrame(animationRequest);animationRequest=0;playing=next;lastTick=0;$('play').textContent=playing?'Pause frames':'Play frames';$('play').setAttribute('aria-pressed',String(playing));}
function setFrame(number) {if(isLandscape()||!ready)return;setPlaying(false);frame=(number+selected.frames)%selected.frames;render();}
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
for(const layer of LAYERS)$(`layer-${layer}`).onclick=()=>{sceneState[stage].layer=layer;render();};
for(const mode of ['scene','layer','source'])$(`${mode}-view`).onclick=()=>{sceneState[stage].view=mode;render();};
for(const name of [...LAYERS,'clouds'])$(`visible-${name}`).onchange=()=>{sceneState[stage].visible[name]=$(`visible-${name}`).checked;render();};
$('scene-guides').onchange=()=>{sceneState[stage].guides=$('scene-guides').checked;render();};
$('scene-scroll').oninput=()=>{sceneState[stage].scroll=Number($('scene-scroll').value);render();};
for(const field of ['scale','x','y','parallax'])$(`layer-${field}`).onchange=()=>{
  try {
    const raw=$(`layer-${field}`).value;if(raw.trim()==='')throw new Error('Enter a transform value.');
    const layer=sceneState[stage].layer;
    draft.editLayer(stage,layer,{...draft.transform(stage,layer),[field]:Number(raw)});
    message(`Updated ${stage.toUpperCase()} ${layer.toUpperCase()}. Save browser draft to keep this adjustment.`);
  }catch(error){message(error.message,true);}render();
};
$('reset-layer').onclick=()=>{const layer=sceneState[stage].layer;draft.editLayer(stage,layer,draft.landscapeBaseline[stage][layer]);message(`${layer.toUpperCase()} restored to the stage baseline.`);render();};
for(const side of ['l','r','t','b'])$(`crop-${side}`).onchange=()=>{
  try{
    const raw=$(`crop-${side}`).value;if(raw.trim()==='')throw new Error('Enter a crop value.');
    draft.edit(selected.id,frame,{...draft.crop(selected.id,frame),[side]:Number(raw)});
    message(`Updated frame ${frame+1}. Other frames are unchanged.`);
  }catch(error){message(error.message,true);}render();
};
$('reset-frame').onclick=()=>{draft.edit(selected.id,frame,selected.crops[frame]);message('This frame restored to its approved baseline crop.');render();};
function history(direction) {
  const edit=(direction==='undo'?draft.past:draft.future).at(-1);if(!edit)return;
  setPlaying(false);draft[direction]();
  selection.remember(selected,frame);
  if(edit.kind==='landscape') {sceneState[edit.stage].layer=edit.layer;sceneState[edit.stage].view='scene';select(`landscape:${edit.stage}`);}
  else {selection.frames.set(edit.id,edit.frame);if(selected.id===edit.id)frame=edit.frame;select(edit.id);}
  message(`${direction==='undo'?'Undid':'Redid'} ${edit.kind==='landscape'?edit.stage.toUpperCase()+' '+edit.layer.toUpperCase():'sprite frame '+(edit.frame+1)} change.`);
}
$('undo').onclick=()=>history('undo');$('redo').onclick=()=>history('redo');
$('save').onclick=()=>{try{draft.save(localStorage);message('Landscapes and sprite crops saved in this browser. GitHub source is unchanged.');}catch(error){message(`Save failed: ${error.message}. Export the design draft to retain your work.`,true);}saveState();};
$('export').onclick=()=>{
  const blob=new Blob([JSON.stringify(draft.export(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='cc-workbench-next-design-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  message('Exported candidate landscapes and sprite crops. This is not a production game-config import.');
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
  try{
    const saved=localStorage.getItem(DESIGN_STORAGE_KEY), old=localStorage.getItem(STORAGE_KEY);
    if(saved){draft.restore(JSON.parse(saved));message('Restored the browser draft: landscapes and sprite crops.');}
    else if(old){draft.restoreSpriteDraft(JSON.parse(old));message('Recovered previous sprite crops. Save browser draft to include landscapes; the old saved copy is retained.');}
  }catch(error){message(`Candidate save was not loaded: ${error.message}. The stored copy is unchanged.`,true);}
  await select(selected.id);
}catch(error){$('loading').classList.add('failed');$('loading').textContent=error.message;message('Could not start the Design workspace. Serve the repository over HTTP and reload.',true);}
