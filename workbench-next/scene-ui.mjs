import {SceneClock,STEP,ContactPass,PLACEMENT_FIELDS,drawDesignScene,sceneGeometry} from './scene-model.mjs';
import {createMotion} from './runtime-rules.mjs';
import {same,validateAtlas} from './model.mjs';
import {hitBounds} from './frame-editor.mjs';
import {contains,dragBox,placementForBox,drawHandles} from './hitbox-editor.mjs';
const $=id=>document.getElementById(id);
export function setupSceneEditor({config,contract,items,landscapes,catalog,draft,active,reload,changed,message}) {
  let current=null,who='claude',state='run',inspectorKey='',selectionKey='',target='character',motion=null,result=null,editing=false,drag=null,signature='';
  const pass=new ContactPass(),hazards=new Map(landscapes.map(s=>[s.stage,items.find(i=>i.stage===s.stage&&i.type==='hazard').id]));
  const find=id=>items.find(i=>i.id===id),gameActions=()=>$('scene-motion').value==='encounter';
  function syncContext(selected,stage){
    const key=selected.id+':'+stage;
    if(key!==selectionKey){selectionKey=key;target=selected.type;editing=false;
      if(selected.type==='character')[,who,state]=selected.id.split(':');
      if(selected.type==='hazard')hazards.set(stage,selected.id);
      motion=createMotion(config,state);pass.reset();inspectorKey='';
    }
  }
  function context(){return {character:find(`character:${who}:${gameActions()?(motion?.state||state):state}`),hazard:find(hazards.get(current.stage))};}
  const clock=new SceneClock({available:()=>Boolean(active()&&current?.ready&&!document.hidden&&!$('project-dialog').open&&!drag),paint,advance});
  function options(time=clock.time){
    const c=context(),images={...current.images,character:current.images[`character:${c.character.state}`]};
    return {config,contract,draft,...current,...c,images,time,travel:$('actor-travel').checked,flight:$('scene-flight').value,guides:$('actor-guides').checked,boxes:$('actor-boxes').checked||editing,motion:gameActions()?motion:null,looping:false,contactLatched:pass.firstContact!==null,placementOverride:drag?{[drag.item.id]:drag.value}:null};
  }
  function advance(time){
    if(gameActions())motion.update(STEP);
    const g=sceneGeometry(options(time)),first=pass.sample(g,time,{travel:$('actor-travel').checked});
    return !((first&&$('pause-contact').checked)||pass.complete);
  }
  function entries(selected,stage){
    syncContext(selected,stage);
    const landscape=landscapes.find(s=>s.stage===stage),entries=Object.entries(landscape.sources).map(([layer,key])=>[layer,catalog.assets[key]]);
    if(config.worldProfiles[stage].clouds!==false)entries.push(['clouds',catalog.assets.clouds]);
    for(const item of items.filter(i=>i.type==='character'&&i.id.split(':')[1]===who))entries.push([`character:${item.state}`,catalog.assets[item.asset]]);
    entries.push(['hazard',catalog.assets[find(hazards.get(stage)).asset]]);return entries;
  }
  function validate(selected,stage,images){
    syncContext(selected,stage);
    const actors=items.filter(i=>i.type==='character'&&i.id.split(':')[1]===who).map(i=>[`character:${i.state}`,i]);actors.push(['hazard',find(hazards.get(stage))]);
    for(const [key,item] of actors){const img=images[key],size=draft.size(item.id);validateAtlas(item,img.naturalWidth,img.naturalHeight);if(img.naturalWidth!==size.width||img.naturalHeight!==size.height)throw new Error('Scene atlas dimensions do not match the catalog.');}
    for(const [layer,expected] of Object.entries(landscapes.find(s=>s.stage===stage).expected||{}))if(images[layer].naturalWidth!==expected.width||images[layer].naturalHeight!==expected.height)throw new Error('Scene landscape dimensions do not match the registry.');
  }
  function paint(){
    if(!current||!active())return;
    const opts=options();result=drawDesignScene($('preview'),opts);
    if($('compare').checked)drawDesignScene($('baseline'),{...opts,baseline:true,contactLatched:false});
    if(editing&&current.ready)drawHandles($('preview'),result[target].collision);
    $('preview').classList.toggle('hitbox-editing',editing);
    $('actor-play').textContent=clock.running?'Pause / freeze':pass.complete?'Replay pass':'Play scene';$('actor-play').setAttribute('aria-pressed',String(clock.running));
    for(const id of ['actor-play','actor-step','actor-restart','actor-speed','actor-jump','actor-slide','edit-hitbox','edit-target'])$(id).disabled=!current.ready;
    $('actor-step').disabled=!current.ready||pass.complete;
    $('actor-jump').disabled=$('actor-slide').disabled=!current.ready||!gameActions()||pass.complete;
    $('actor-time').textContent=`Step ${clock.steps.toLocaleString()} · ${clock.time.toFixed(2)} s${clock.running?'':' · Frozen'}`;
    const c=context();$('actor-pose').textContent=`${who==='claude'?'Claude':'Constance'} ${c.character.state} ${result.character.frame+1}/${c.character.frames} · ${c.hazard.name} ${result.hazard.frame+1}/${c.hazard.frames}`;
    const status=$('contact-status'),label=current.ready?pass.label(result,{travel:opts.travel}):'Loading scene…';
    if(status.textContent!==label)status.textContent=label;
    status.classList.toggle('contact',result.contact||pass.firstContact!==null);
    $('scene-playback-help').textContent=gameActions()?'One hazard pass · contact checks without damage. Jump/Slide use game timing. Next frame = 1/60 s.':'Pose loop only · contact checks for this pose; use Game actions to test Jump/Slide clearance.';
    $('edit-target').value=target;$('edit-target-name').textContent=target==='character'?`${c.character.name} · ${c.character.state}`:c.hazard.name;
    $('edit-hitbox').setAttribute('aria-pressed',String(editing));$('edit-hitbox').textContent=editing?'Finish hitbox editing':'Edit hitbox on scene';
    inspector(false);
  }
  function group(title,id,fields,description,open=true){
    const details=document.createElement('details');details.className='inspector-group';details.open=open;
    const summary=document.createElement('summary');summary.textContent=title;details.append(summary);
    const body=document.createElement('div');body.className='group-content';details.append(body);
    if(description){const p=document.createElement('p');p.className='scope-note';p.textContent=description;body.append(p);}
    const grid=document.createElement('div');grid.className='crop-grid';body.append(grid);
    for(const field of fields){
      const [text,min,max,step]=PLACEMENT_FIELDS[field],label=document.createElement('label'),input=document.createElement('input');label.className='field';label.textContent=text;
      Object.assign(input,{type:'number',min,max,step});input.dataset.placement=id;input.dataset.field=field;label.append(input);grid.append(label);
      input.onfocus=()=>{if(clock.running)clock.pause();};
      input.onchange=()=>{try{if(input.value.trim()==='')throw new Error('Enter a value.');draft.editPlacement(id,{...draft.placement[id],[field]:Number(input.value)});message('Updated placement. Replay the pass to check your changes.');}catch(error){message(error.message,true);}render(current);changed();};
    }
    const reset=document.createElement('button');reset.className='subtle';reset.textContent='Reset this group';reset.dataset.resetPlacement=id;reset.dataset.fields=fields.join(',');body.append(reset);
    reset.onclick=()=>{clock.pause();draft.editPlacement(id,{...draft.placement[id],...Object.fromEntries(fields.map(f=>[f,draft.placementBaseline[id][f]]))});render(current);changed();};
    if(title==='Hitbox')details.addEventListener('toggle',()=>{if(details.open){$('actor-boxes').checked=true;paint();}});
    return details;
  }
  function inspector(updateValues){
    const selected=context()[target],stage=current.stage,key=selected.id+':'+stage;
    if(key!==inspectorKey){
      inspectorKey=key;updateValues=true;const groups=[];
      if(selected.type==='character') {
        groups.push(group('Shared character',`character:${who}`,['masterScale','footOffset'],'All states · all stages'));
        groups.push(group('State placement',selected.id,['stateScale','offsetX','offsetY'],`${selected.state} · all stages`));
        groups.push(group('Stage grounding',`grounding:${stage}:${who}`,['groundOffset'],`${who} · ${stage.toUpperCase()} only. Positive Y moves down.`));
      }else {
        const fields=['scale','xOffset',...(selected.kind==='ground'?['groundOffset']:['highClearance','lowClearance']),...(selected.frames>1?['fps']:[])];
        groups.push(group('Hazard placement',selected.id,fields,`${stage.toUpperCase()} · ${selected.name}. Positive grounding moves down.`));
      }
      const box=group('Hitbox',selected.id,['cw','ch','cx','cy'],selected.type==='character'?'Game collision proportions. At height 1, vertical offset has no effect; reduce height to create adjustment space.':'Game collision proportions. Dragging follows the same limits as these fields.',editing);box.id='hitbox-properties';groups.push(box);
      $('placement-properties').replaceChildren(...groups);
    }
    if(updateValues)for(const input of $('placement-properties').querySelectorAll('input')){input.value=draft.placement[input.dataset.placement][input.dataset.field];input.disabled=!current.ready;}
    for(const reset of $('placement-properties').querySelectorAll('button')){const id=reset.dataset.resetPlacement;reset.disabled=!current.ready||reset.dataset.fields.split(',').every(f=>same(draft.placement[id][f],draft.placementBaseline[id][f]));}
  }
  function render(value){
    current=value;syncContext(value.selected,value.stage);motion??=createMotion(config,state);
    const next=JSON.stringify([draft.placement,draft.frames,draft.value]);if(signature&&next!==signature)pass.invalidate();signature=next;
    $('compare').disabled=false;document.querySelector('.baseline-card').hidden=!$('compare').checked;
    $('preview').classList.remove('editing');$('preview').setAttribute('aria-label',`${current.stage.toUpperCase()} scene with ${who} and ${context().hazard.name}`);
    $('preview-label').textContent=`${current.stage.toUpperCase()} · WORKING SCENE`;
    $('breadcrumb').textContent=`${current.stage.toUpperCase()} / SCENE`;$('asset-title').textContent='Scene calibration';$('asset-scope').textContent=`STAGE ${current.stage.toUpperCase()}`;
    $('scope').textContent='Select the character or hazard to edit its placement and hitbox.';
    $('scene-character-choice').hidden=current.selected.type==='character';$('scene-hazard-choice').hidden=current.selected.type==='hazard';
    $('scene-character').value=who;$('scene-state').value=state;
    const list=items.filter(i=>i.stage===current.stage&&i.type==='hazard');
    if($('scene-hazard').dataset.stage!==current.stage){$('scene-hazard').replaceChildren(...list.map(i=>new Option(i.name,i.id)));$('scene-hazard').dataset.stage=current.stage;}
    $('scene-hazard').value=context().hazard.id;$('scene-flight-choice').hidden=context().hazard.kind!=='flying';
    if(current.ready&&clock.steps===0)pass.sample(sceneGeometry(options()),0,{travel:$('actor-travel').checked});
    inspector(true);paint();
  }
  function reset(){cancelDrag();motion=createMotion(config,state);pass.reset();clock.restart();if(current?.ready){pass.sample(sceneGeometry(options()),0,{travel:$('actor-travel').checked});paint();}}
  function replay(){reset();if(pass.firstContact!==null&&$('pause-contact').checked)return;clock.play();}
  function choose(next){clock.pause();cancelDrag();target=next;inspectorKey='';inspector(true);paint();}
  function action(name){cancelDrag();motion[name==='jump'?'triggerJump':'triggerSlide']();const first=pass.sample(sceneGeometry(options()),clock.time,{travel:$('actor-travel').checked});if(first&&$('pause-contact').checked)clock.pause();paint();}
  function point(e){const r=$('preview').getBoundingClientRect();return {x:(e.clientX-r.left)*$('preview').width/r.width,y:(e.clientY-r.top)*$('preview').height/r.height};}
  function cancelDrag(){if(!drag)return;const id=drag.pointer;drag=null;if($('preview').hasPointerCapture?.(id))$('preview').releasePointerCapture(id);paint();}
  $('preview').addEventListener('pointerdown',e=>{
    if(!active()||!current?.ready||e.button!==0||e.defaultPrevented)return;
    const p=point(e),g=result[target],tolerance=8*$('preview').width/($('preview').getBoundingClientRect().width||960);
    const handle=editing?hitBounds(p,g.collision,tolerance):null;
    if(handle){clock.pause();e.preventDefault();$('preview').focus();$('preview').setPointerCapture(e.pointerId);const item=context()[target];drag={pointer:e.pointerId,point:p,box:{...g.collision},geometry:g,item,handle,value:{...draft.placement[item.id]},before:{...draft.placement[item.id]}};return;}
    for(const kind of ['hazard','character']){const g=result[kind],r=g.hitReference,visible=kind==='character'?{x:r.x-r.w/2,y:r.top,w:r.w,h:r.h}:g.dest;if(contains(p,g.collision)||contains(p,visible)){e.preventDefault();choose(kind);return;}}
  });
  $('preview').addEventListener('pointermove',e=>{
    if(!drag||drag.pointer!==e.pointerId)return;
    const p=point(e);drag.value=placementForBox(drag.item,drag.geometry,dragBox(drag.box,drag.handle,p.x-drag.point.x,p.y-drag.point.y),drag.before);paint();
  });
  $('preview').addEventListener('pointerup',e=>{
    if(!drag||drag.pointer!==e.pointerId)return;
    const edit=drag;drag=null;$('preview').releasePointerCapture(e.pointerId);draft.editPlacement(edit.item.id,edit.value);render(current);changed();message('Hitbox updated. One Undo restores this drag. Replay to check contact.');
  });
  for(const event of ['pointercancel','lostpointercapture'])$('preview').addEventListener(event,cancelDrag);
  window.addEventListener('keydown',e=>{if(e.key==='Escape')cancelDrag();});window.addEventListener('blur',()=>{cancelDrag();clock.pause();});
  for(const name of Object.keys(config.state))$('scene-state').add(new Option(name[0].toUpperCase()+name.slice(1),name));
  $('scene-character').onchange=()=>{who=$('scene-character').value;reload();};
  $('scene-state').onchange=()=>{state=$('scene-state').value;reload();};
  $('scene-hazard').onchange=()=>{hazards.set(current.stage,$('scene-hazard').value);reload();};
  $('scene-flight').onchange=reset;$('scene-motion').onchange=reset;
  $('pause-contact').onchange=()=>{if($('pause-contact').checked)$('actor-boxes').checked=true;paint();};
  $('actor-play').onclick=()=>{cancelDrag();if(clock.running)clock.pause();else if(pass.complete)replay();else clock.play();};
  $('actor-step').onclick=()=>{cancelDrag();clock.step();};$('actor-restart').onclick=replay;
  $('actor-jump').onclick=()=>action('jump');$('actor-slide').onclick=()=>action('slide');
  $('actor-speed').onchange=()=>clock.setSpeed(Number($('actor-speed').value));
  for(const id of ['actor-guides','actor-boxes'])$(id).onchange=paint;
  $('actor-travel').onchange=reset;$('edit-target').onchange=()=>choose($('edit-target').value);
  $('edit-hitbox').onclick=()=>{clock.pause();cancelDrag();editing=!editing;if(editing){$('actor-boxes').checked=true;$('hitbox-properties').open=true;}paint();};
  return {entries,validate,render,editingItem:()=>current?context()[target]:null,stop:()=>{cancelDrag();clock.pause();},reset,step:()=>{cancelDrag();if(!pass.complete)clock.step();},clock};
}
