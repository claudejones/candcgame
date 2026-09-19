import {AssetSelection, descriptors, same, validateAtlas} from './model.mjs';
import {LAYERS, landscapeDescriptors, drawLandscape} from './landscape.mjs';
import {AssetLoader} from './asset-loader.mjs';
import {croppedBounds,frameViewBox,drawSprite,hitBounds,dragBounds} from './frame-editor.mjs';
import {ProjectDraft,projectProvenance,StageSelection} from './project.mjs';
import {setupProjectWorkflow} from './project-ui.mjs';
import {setupWorkspace} from './workspace-ui.mjs';
import {LandscapePlayback} from './landscape-playback.mjs';
import {setupSceneEditor} from './scene-ui.mjs';
import {setupCalibration} from './calibration-ui.mjs';
import {profileConfig} from './calibration-settings.mjs';

const $ = id => document.getElementById(id);
const config = structuredClone(window.GAME_CONFIG);
const registry = window.CC_LANDSCAPE_REGISTRY, contract = window.CC_LANDSCAPE_CONTRACT;
contract.apply(config,registry);
const spriteItems = descriptors(config, window.GAME_SCHEMA);
const landscapes = landscapeDescriptors(config,registry,contract);
const items = [...landscapes,...spriteItems];
let draft,projectWorkflow,actorScene,calibrationUI;
const loader = new AssetLoader();
const selection = new AssetSelection(items);
const stageSelection = new StageSelection(landscapes,registry);
let selected = landscapes[0];
let stage = selected.stage, frame = 0, view = 'scene', playing = false, image = null, lastTick = 0, animationRequest = 0;
let sceneImages = {}, ready = false;
const sceneState = Object.fromEntries(landscapes.map(item=>[item.stage,{layer:'far',view:'scene',scroll:0,
  visible:{far:true,mid:true,ground:true,clouds:true},guides:false}]));
let catalog;
let editingBounds=false,drag=null;
const workspace=setupWorkspace();
const isLandscape = () => selected.type === 'landscape';
const isActorScene=()=>!isLandscape()&&view==='scene';
const scrollPlayback=new LandscapePlayback({speed:config.worldSpeed,end:Number($('scene-scroll').max),
  read:()=>sceneState[stage].scroll,
  write:value=>{sceneState[stage].scroll=value;paintLandscape();},
  available:()=>isLandscape()&&ready&&sceneState[stage].view!=='source'&&!document.hidden&&!$('project-dialog').open,
  changed:()=>updateScrollControls()});

function message(text, error = false) { $('message').textContent = text; $('message').classList.toggle('error', error); }
function saveState() {
  projectWorkflow?.refresh();calibrationUI?.refresh();
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
  stageSelection.remember(stage);
  $('continent').value=stageSelection.continent;
  $('stage').replaceChildren(...stageSelection.groups.get(stageSelection.continent).map(item=>new Option(`${item.id.toUpperCase()} · ${item.label}`,item.id)));
  $('stage').value = stage;
  $('landscapes').replaceChildren(...LAYERS.map(layer=>{
    const node=button(layer.toUpperCase(),isLandscape()&&sceneState[stage].layer===layer,()=>{
      sceneState[stage].layer=layer;
      if(isLandscape()){navigation();render();}else select(`landscape:${stage}`);
      $(`layer-${layer}`).focus();
    });node.id=`layer-${layer}`;return node;
  }));
  $('characters').replaceChildren(...['claude','constance'].map(who => button(who === 'claude' ? 'Claude' : 'Constance',
    selected.id.startsWith(`character:${who}:`),()=>select(selection.characterId(who)),'6 animation states')));
  $('hazards').replaceChildren(...spriteItems.filter(item=>item.stage === stage).map(item=>button(item.name,selected.id===item.id,
    ()=>select(item.id),`${item.frames} frame${item.frames===1?'':'s'} · ${item.kind}`)));
  $('states').hidden = selected.type !== 'character';
  $('states').replaceChildren(...Object.keys(config.state).map(state=>button(state[0].toUpperCase()+state.slice(1),state===selected.state,
    ()=>select(`character:${selected.id.split(':')[1]}:${state}`))));
  for(const id of ['landscape-views','landscape-properties','scene-tools','landscape-dock','landscape-status'])$(id).hidden=!isLandscape();
  for(const id of ['sprite-views','sprite-properties','frame-boundaries','bounds-control','playback-note'])$(id).hidden=isLandscape();
  const scene=isActorScene();
  for(const id of ['actor-context','actor-dock','actor-tools','placement-properties','scene-edit-target'])$(id).hidden=!scene;
  for(const id of ['sprite-properties','frame-boundaries','bounds-control'])$(id).hidden=isLandscape()||scene;
  $('stage-context').hidden=scope==='character'&&!scene;
  $('stage-context-label').textContent=scope==='character'?'Preview stage · character stays shared':'Stage context';
  for(const [id,mode] of [['actor-view','scene'],['frame-view','frame'],['atlas-view','atlas']])$(id).setAttribute('aria-pressed',String(view===mode));
  $('animation-dock').hidden=isLandscape()||scene||selected.frames<2;
  $('preview-area').classList.toggle('landscape-preview',isLandscape()||scene);
  if(!scene)$('preview').classList.remove('hitbox-editing');
  $('inspector-title').textContent=isLandscape()?'Layer properties':scene?'Scene properties':'Frame properties';
  $('source-size-label').textContent=isLandscape()?'Image size':'Frame size';
  $('source-count-label').textContent=isLandscape()?'Artwork':'Frames';
  $('preview-context').textContent=isLandscape()||scene?'Scene · 960 × 540 · ground Y = 410':'Source pixels · fixed frame scale';
}

async function select(id) {
  if(!catalog)return;
  stopMotion();actorScene?.reset();
  selection.remember(selected,frame);
  selected=items.find(item=>item.id===id); if(!selected)throw new Error('Unknown sprite');
  drag=null;editingBounds=false;
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
  if(isActorScene())entries.push(...actorScene.entries(selected,stage));
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
        const size=draft.size(selected.id);
        if(size.width!==image.naturalWidth||size.height!==image.naturalHeight)throw new Error('Decoded atlas differs from its registered size.');
        if(isActorScene()){actorScene.validate(selected,stage,loaded);sceneImages=loaded;}
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

function activeBounds(number=frame){return drag&&number===frame?drag.current:draft.bounds(selected.id,number);}
function drawFrame(canvas, number, crop, baseline=false) {
  const frames=draft.frames[selected.id].map((b,i)=>drag&&i===frame?drag.current:b);
  drawSprite(canvas,image,selected,number,baseline?draft.frameBaseline[selected.id][number]:activeBounds(number),crop,frameViewBox(selected,frames),$('bounds').checked);
}

function drawAtlas(canvas) {
  if(!image){canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);return;}
  canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0);
  const unit=Math.max(2,image.naturalWidth/500);ctx.lineWidth=unit;
  for(let i=0;i<selected.frames;i++){
    const r=activeBounds(i);ctx.strokeStyle=i===frame?'#c9ed8a':'#7ec7bb88';ctx.strokeRect(r.x,r.y,r.w,r.h);
  }
  if($('bounds').checked){const crop=croppedBounds(activeBounds(),draft.crop(selected.id,frame));ctx.strokeStyle='#ffc987';ctx.setLineDash([unit*2,unit*2]);ctx.strokeRect(crop.x,crop.y,crop.w,crop.h);ctx.setLineDash([]);}
  if(editingBounds){const r=activeBounds();ctx.fillStyle='#c9ed8a';const side=unit*4;for(const x of [r.x,r.x+r.w/2,r.x+r.w])for(const y of [r.y,r.y+r.h/2,r.y+r.h]){if(x===r.x+r.w/2&&y===r.y+r.h/2)continue;ctx.fillRect(x-side/2,y-side/2,side,side);}}
}

function makeFilmstrip() {
  $('filmstrip').replaceChildren(...Array.from({length:selected.frames},(_,number)=>{
    const b=button('',number===frame,()=>setFrame(number));b.setAttribute('aria-label',`Select frame ${number+1}`);
    const c=document.createElement('canvas'),label=document.createElement('span');label.textContent=`Frame ${number+1}`;b.append(c,label);return b;
  }));
}

function render(updateThumbnails = true) {
  if(!draft)return;
  scrollPlayback.speed=profileConfig(config,draft.calibration).worldSpeed;
  if(isLandscape()){renderLandscape();saveState();workspace.fit();return;}
  if(isActorScene()){actorScene?.render({selected,stage,ready,images:sceneImages});saveState();workspace.fit();return;}
  const crop=draft.crop(selected.id,frame);
  const bounds=activeBounds();
  $('frame-label').textContent=`Frame ${frame+1} / ${selected.frames}`;
  $('scope').textContent=`${selected.name} · ${selected.state || stage.toUpperCase()} · frame ${frame+1} only`;
  for(const side of ['l','r','t','b']){
    const input=$(`crop-${side}`);input.value=crop[side];input.disabled=playing||!image;
    input.max=(['l','r'].includes(side)?bounds.w:bounds.h)-1;
  }
  for(const field of ['x','y','w','h']){$(`frame-${field}`).value=bounds[field];$(`frame-${field}`).disabled=playing||!ready;}
  $('edit-boundaries').disabled=!ready||playing;
  $('edit-boundaries').textContent=editingBounds?'Finish editing bounds':'Edit bounds on atlas';$('edit-boundaries').setAttribute('aria-pressed',String(editingBounds));
  $('preview').classList.toggle('editing',editingBounds&&view==='atlas');
  $('reset-boundaries').disabled=!ready||playing||same(bounds,draft.frameBaseline[selected.id][frame]);
  $('source-size').textContent=`${bounds.w} × ${bounds.h}`;
  const overlaps=draft.frames[selected.id].map((b,i)=>i!==frame&&bounds.x<b.x+b.w&&bounds.x+bounds.w>b.x&&bounds.y<b.y+b.h&&bounds.y+bounds.h>b.y?i+1:null).filter(Boolean);
  $('boundary-warning').textContent=overlaps.length?`Boundary overlaps frame ${overlaps.join(', ')}. Check the atlas for neighboring artwork.`:'';
  $('reset-frame').disabled=playing||!image||same(crop,selected.crops[frame]);
  const showCompare=$('compare').checked&&view==='frame';
  document.querySelector('.baseline-card').hidden=!showCompare;
  $('compare').disabled=view==='atlas';
  $('preview-label').textContent=view==='atlas'?'SOURCE ATLAS · ACTIVE FRAME':'WORKING DRAFT';
  if(view==='frame')drawFrame($('preview'),frame,crop);else drawAtlas($('preview'));
  if(showCompare)drawFrame($('baseline'),frame,selected.crops[frame],true);
  [...$('filmstrip').children].forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===frame));if(updateThumbnails)drawFrame(b.querySelector('canvas'),i,draft.crop(selected.id,i));});
  saveState();
  workspace.fit();
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
  $('preview').setAttribute('aria-label',`${stage.toUpperCase()} ${state.view==='scene'?'combined landscape':layer+' '+state.view}`);
  paintLandscape();
}

function updateScrollControls() {
  const available=isLandscape()&&ready&&sceneState[stage].view!=='source';
  const position=sceneState[stage].scroll;
  $('scene-play').disabled=!available;$('scene-restart').disabled=!available;$('scene-scroll').disabled=!available;
  $('scene-play').textContent=scrollPlayback.running?'Pause':position>=scrollPlayback.end?'Replay':'Play scroll';
  $('scene-play').setAttribute('aria-pressed',String(scrollPlayback.running));
  $('scene-play').title=scrollPlayback.running?'Freeze landscape and clouds for inspection':`Preview at gameplay speed: ${scrollPlayback.speed} px/s; clouds ${config.worldContract.cloudSpeed} px/s`;
  $('scene-scroll').value=position;
  $('scroll-value').textContent=`${Math.round(position).toLocaleString()} / ${scrollPlayback.end.toLocaleString()} px`;
}

// Playback repaints the two canvases and transport only. Inspector inputs stay mounted
// and retain focus and uncommitted typing while the landscape is moving.
function paintLandscape() {
  if(!draft||!isLandscape())return;
  const state=sceneState[stage];
  const options={config:profileConfig(config,draft.calibration),contract,stage,images:sceneImages,...state,
    visible:state.view==='layer'?{...state.visible,[state.layer]:true}:state.visible};
  drawLandscape($('preview'),{...options,transforms:draft.landscapes[stage]});
  if($('compare').checked&&state.view!=='source')drawLandscape($('baseline'),{...options,transforms:draft.landscapeBaseline[stage]});
  updateScrollControls();
}

function setPlaying(next) {cancelAnimationFrame(animationRequest);animationRequest=0;playing=next;lastTick=0;$('play').textContent=playing?'Pause':'Play';$('play').setAttribute('aria-pressed',String(playing));}
function stopMotion(){scrollPlayback.pause();actorScene?.stop();setPlaying(false);}
function setFrame(number) {if(isLandscape()||isActorScene()||!ready)return;drag=null;setPlaying(false);frame=(number+selected.frames)%selected.frames;render();}
function tick(now) {
  if(playing&&image){
    if(!lastTick)lastTick=now;
    const delay=1000/(selected.fps*Number($('speed').value));
    if(now-lastTick>=delay){frame=(frame+Math.floor((now-lastTick)/delay))%selected.frames;lastTick=now-((now-lastTick)%delay);render(false);}
  }
  if(playing)animationRequest=requestAnimationFrame(tick);
}

for(const name of stageSelection.groups.keys())$('continent').add(new Option(name,name));
$('stage-availability').textContent=`${stageSelection.groups.size} continents · ${landscapes.length} available stages · 21 planned`;
function changeStage(next){if(selected.type==='character'){stage=next;select(selected.id);}else select(selection.stageId(next));}
$('continent').onchange=()=>changeStage(stageSelection.choose($('continent').value));
$('stage').onchange=()=>changeStage($('stage').value);
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
$('play').onclick=()=>{drag=null;editingBounds=false;setPlaying(!playing);render(false);if(playing)animationRequest=requestAnimationFrame(tick);};
function spriteView(next){const reload=view==='scene'||next==='scene',target=view==='scene'?actorScene?.editingItem()?.id:null;stopMotion();drag=null;view=next;if(next==='frame')editingBounds=false;navigation();if(reload)select(target||selected.id);else render();}
$('actor-view').onclick=()=>spriteView('scene');$('frame-view').onclick=()=>spriteView('frame');$('atlas-view').onclick=()=>spriteView('atlas');
$('compare').onchange=render;$('bounds').onchange=render;
$('retry').onclick=()=>select(selected.id);
for(const mode of ['scene','layer','source'])$(`${mode}-view`).onclick=()=>{if(mode==='source')scrollPlayback.pause();sceneState[stage].view=mode;render();};
for(const name of [...LAYERS,'clouds'])$(`visible-${name}`).onchange=()=>{sceneState[stage].visible[name]=$(`visible-${name}`).checked;render();};
$('scene-guides').onchange=()=>{sceneState[stage].guides=$('scene-guides').checked;render();};
$('scene-scroll').onpointerdown=()=>scrollPlayback.pause();
$('scene-scroll').oninput=()=>scrollPlayback.seek(Number($('scene-scroll').value));
$('scene-play').onclick=()=>{if(scrollPlayback.running)scrollPlayback.pause();else scrollPlayback.play();};
$('scene-restart').onclick=()=>scrollPlayback.play(true);
for(const field of ['scale','x','y','parallax'])$(`layer-${field}`).onchange=()=>{
  try {
    const raw=$(`layer-${field}`).value;if(raw.trim()==='')throw new Error('Enter a transform value.');
    const layer=sceneState[stage].layer;
    draft.editLayer(stage,layer,{...draft.transform(stage,layer),[field]:Number(raw)});
    message(`Updated ${stage.toUpperCase()} ${layer.toUpperCase()}. Save all to keep this adjustment.`);
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
$('reset-frame').onclick=()=>{try{draft.edit(selected.id,frame,selected.crops[frame]);message('This frame restored to its baseline crop.');}catch(error){message(`Reset the frame boundary first: ${error.message}`,true);}render();};
for(const field of ['x','y','w','h'])$(`frame-${field}`).onchange=()=>{
  try{
    const raw=$(`frame-${field}`).value;if(raw.trim()==='')throw new Error('Enter a frame boundary value.');
    draft.editBounds(selected.id,frame,{...draft.bounds(selected.id,frame),[field]:Number(raw)});
    message(`Updated frame ${frame+1} boundary. Other frames are unchanged.`);
  }catch(error){message(error.message,true);}render();
};
$('edit-boundaries').onclick=()=>{setPlaying(false);editingBounds=!editingBounds;if(editingBounds)$('frame-boundaries').open=true;spriteView(editingBounds?'atlas':'frame');};
$('reset-boundaries').onclick=()=>{try{draft.editBounds(selected.id,frame,draft.frameBaseline[selected.id][frame]);message('Frame boundary restored to baseline.');}catch(error){message(`Reset crop first: ${error.message}`,true);}render();};
function atlasPoint(event){const rect=$('preview').getBoundingClientRect();return {x:(event.clientX-rect.left)*$('preview').width/rect.width,y:(event.clientY-rect.top)*$('preview').height/rect.height};}
function cancelDrag(){const previous=drag;drag=null;if(previous&&$('preview').hasPointerCapture(previous.pointer))$('preview').releasePointerCapture(previous.pointer);if(previous)render();}
$('preview').onpointerdown=event=>{
  if(event.defaultPrevented||isLandscape()||!ready||playing||!editingBounds||view!=='atlas'||event.button!==0)return;
  const point=atlasPoint(event),bounds=draft.bounds(selected.id,frame),rect=$('preview').getBoundingClientRect();
  const handle=hitBounds(point,bounds,8*$('preview').width/rect.width);if(!handle)return;
  event.preventDefault();$('preview').focus();$('preview').setPointerCapture(event.pointerId);
  drag={pointer:event.pointerId,id:selected.id,frame,start:bounds,point,handle,current:bounds};
};
$('preview').onpointermove=event=>{
  if(!drag||event.pointerId!==drag.pointer)return;
  const point=atlasPoint(event);
  drag.current=dragBounds(drag.start,drag.handle,point.x-drag.point.x,point.y-drag.point.y,draft.size(drag.id),draft.crop(drag.id,drag.frame));
  render(false);
};
$('preview').onpointerup=event=>{
  if(!drag||event.pointerId!==drag.pointer)return;
  const edit=drag;drag=null;$('preview').releasePointerCapture(event.pointerId);
  try{draft.editBounds(edit.id,edit.frame,edit.current);message(`Updated frame ${edit.frame+1} boundary. Undo restores the complete drag.`);}catch(error){message(error.message,true);}render();
};
$('preview').onpointercancel=cancelDrag;$('preview').onlostpointercapture=cancelDrag;
$('preview').onkeydown=event=>{
  if(event.key==='Escape'){cancelDrag();return;}
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)||isLandscape()||!ready)return;
  event.preventDefault();
  if(isActorScene()){if(event.key==='ArrowRight')actorScene.step();return;}
  if(editingBounds&&view==='atlas'){
    const step=event.shiftKey?10:1,dx=event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0,dy=event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0;
    draft.editBounds(selected.id,frame,dragBounds(draft.bounds(selected.id,frame),'move',dx,dy,draft.size(selected.id),draft.crop(selected.id,frame)));render();
  }else if(event.key==='ArrowLeft'||event.key==='ArrowRight')setFrame(frame+(event.key==='ArrowLeft'?-1:1));
};
function history(direction) {
  const edit=(direction==='undo'?draft.past:draft.future).at(-1);if(!edit)return;
  cancelDrag();stopMotion();draft[direction]();
  if(edit.kind==='placement'){render();message(`${direction==='undo'?'Undid':'Redid'} placement: ${edit.id.replaceAll(':',' / ')}.`);return;}
  if(edit.kind==='project'){render();message(`${direction==='undo'?'Undid':'Redid'} the configuration change.`);return;}
  selection.remember(selected,frame);
  if(edit.kind==='landscape') {sceneState[edit.stage].layer=edit.layer;sceneState[edit.stage].view='scene';select(`landscape:${edit.stage}`);}
  else {selection.frames.set(edit.id,edit.frame);if(selected.id===edit.id)frame=edit.frame;select(edit.id);}
  message(`${direction==='undo'?'Undid':'Redid'} ${edit.kind==='landscape'?edit.stage.toUpperCase()+' '+edit.layer.toUpperCase():'sprite frame '+(edit.frame+1)} change.`);
}
$('undo').onclick=()=>history('undo');$('redo').onclick=()=>history('redo');
window.addEventListener('beforeunload',event=>{if(draft?.dirty){event.preventDefault();event.returnValue='';}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopMotion();render();}});
window.addEventListener('pagehide',stopMotion);
window.addEventListener('keydown',event=>{
  if($('project-dialog').open)return;
  if(['INPUT','SELECT','TEXTAREA','BUTTON','CANVAS','SUMMARY'].includes(document.activeElement?.tagName))return;
  if(event.key==='ArrowLeft'){event.preventDefault();setFrame(frame-1);}
  if(event.key==='ArrowRight'){event.preventDefault();if(isActorScene())actorScene.step();else setFrame(frame+1);}
});

try{
  const response=await fetch('./asset-catalog.json',{cache:'no-cache'});if(!response.ok)throw new Error(`Catalog load failed (${response.status})`);catalog=await response.json();
  draft=new ProjectDraft(spriteItems,landscapes,catalog.dimensions,projectProvenance(catalog,spriteItems,landscapes),catalog.migrations,config);
  try{
    message(draft.load(localStorage));
  }catch(error){message(`Candidate save was not loaded: ${error.message}. The stored copy is unchanged.`,true);}
  actorScene=setupSceneEditor({config,contract,items:spriteItems,landscapes,catalog,draft,active:isActorScene,reload:()=>select(selected.id),changed:saveState,message,calibration:()=>calibrationUI});
  calibrationUI=setupCalibration({config,draft,items:spriteItems,catalog,loader,getStage:()=>stage,navigate:async id=>{view='scene';await select(id);},scene:()=>actorScene,changed:()=>{stopMotion();saveState();render();},message});
  projectWorkflow=setupProjectWorkflow({draft,beforeAction:()=>{cancelDrag();stopMotion();render();},changed:()=>render(),message});
  await select(selected.id);
}catch(error){$('loading').classList.add('failed');$('loading').textContent=error.message;message('Could not start the Design workspace. Serve the repository over HTTP and reload.',true);}
