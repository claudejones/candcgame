import {SceneClock,STEP,ContactPass,PLACEMENT_FIELDS,drawDesignScene,sceneGeometry} from './scene-model.mjs';
import {createMotion} from './runtime-rules.mjs';
import {profileConfig,pathShift,characterPathShift,calibrationStamp} from './calibration-settings.mjs';
import {same,validateAtlas} from './model.mjs';
import {hitBounds} from './frame-editor.mjs';
import {contains,dragBox,placementForBox,drawHandles} from './hitbox-editor.mjs';
const $=id=>document.getElementById(id);
export function setupSceneEditor({config,contract,items,landscapes,catalog,draft,active,reload,changed,message,calibration=()=>null}) {
  let current=null,who='claude',state='run',inspectorKey='',selectionKey='',target='character',motion=null,result=null,editing=false,drag=null,signature='',sequence=null,demo=null,sequenceIndex=0,cycleStart=0,cycleNumber=1,lastResult='';
  const pass=new ContactPass(),hazards=new Map(landscapes.map(s=>[s.stage,items.find(i=>i.stage===s.stage&&i.type==='hazard').id]));
  const cfg=()=>profileConfig(config,draft.calibration);
  const find=id=>items.find(i=>i.id===id),gameActions=()=>$('scene-motion').value==='encounter',loopEnabled=()=>$('actor-loop').checked;
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
    const c=context(),images={...current.images,character:current.images[`character:${c.character.state}`]},proposal=calibration()?.previewFor(c.hazard);
    return {config:cfg(),contract,draft,...current,...c,images,time:time-cycleStart*STEP,worldTime:time,encounters:sequence?.events.map(e=>({...e,item:find(e.id)})),travel:$('actor-travel').checked,flight:$('scene-flight').value,guides:$('actor-guides').checked,boxes:$('actor-boxes').checked||editing,motion:gameActions()?motion:null,looping:false,contactLatched:pass.firstContact!==null,placementOverride:drag?{[drag.item.id]:drag.value}:proposal?{[c.hazard.id]:proposal.value}:null};
  }
  function resetActors(){
    sequenceIndex=0;if(demo)demo.triggered=false;
    motion=createMotion(config,sequence||demo?'run':state);
    if(demo&&demo.at===0){motion[demo.action==='jump'?'triggerJump':'triggerSlide']();demo.triggered=true;}
  }
  function startPass(time){
    resetActors();pass.reset();
    const first=pass.sample(sceneGeometry(options(time)),0,{travel:$('actor-travel').checked});
    if(sequence){pass.startedAhead=true;pass.complete=false;}
    return first;
  }
  function advance(time){
    // Repeat the encounter on its own clock. Scenery/clouds keep the total time,
    // and the single animation loop retains freeze, speed and catch-up behavior.
    if(pass.complete){
      if(!loopEnabled())return false;
      lastResult=pass.label(sceneGeometry(options(time)),{travel:$('actor-travel').checked});
      cycleStart=clock.steps;cycleNumber++;
      const first=startPass(time);
      return !(first&&$('pause-contact').checked);
    }
    const localTime=(clock.steps-cycleStart)*STEP;
    if(gameActions())motion.update(STEP);
    if(sequence){while(sequenceIndex<sequence.events.length&&localTime+1e-8>=sequence.events[sequenceIndex].start+sequence.events[sequenceIndex].local[who]){const e=sequence.events[sequenceIndex++];motion[e.action==='jump'?'triggerJump':'triggerSlide']();}}
    else if(demo&&!demo.triggered&&localTime+1e-8>=demo.at){motion[demo.action==='jump'?'triggerJump':'triggerSlide']();demo.triggered=true;}
    const g=sceneGeometry(options(time));let first;
    if(sequence){first=g.contact&&pass.firstContact===null;if(first)pass.firstContact=localTime;pass.complete=localTime>=sequence.duration;}
    else first=pass.sample(g,localTime,{travel:$('actor-travel').checked});
    return !((first&&$('pause-contact').checked)||(pass.complete&&!loopEnabled()));
  }
  function entries(selected,stage){
    syncContext(selected,stage);
    const landscape=landscapes.find(s=>s.stage===stage),entries=Object.entries(landscape.sources).map(([layer,key])=>[layer,catalog.assets[key]]);
    if(config.worldProfiles[stage].clouds!==false)entries.push(['clouds',catalog.assets.clouds]);
    for(const item of items.filter(i=>i.type==='character'&&i.id.split(':')[1]===who))entries.push([`character:${item.state}`,catalog.assets[item.asset]]);
    entries.push(['hazard',catalog.assets[find(hazards.get(stage)).asset]]);for(const item of items.filter(i=>i.stage===stage&&i.type==='hazard'))entries.push(['hazard:'+item.id,catalog.assets[item.asset]]);return entries;
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
    const proposal=calibration()?.previewFor(context().hazard);
    if($('compare').checked)drawDesignScene($('baseline'),{...opts,baseline:!proposal,placementOverride:proposal?{[proposal.row.id]:proposal.before}:null,contactLatched:false});
    document.querySelector('.baseline-card .preview-tag').textContent=proposal?'BEFORE · VISUAL REFERENCE':'BASELINE';
    $('preview-label').textContent=proposal?(proposal.proposed?'PROPOSED · NOT APPLIED':'BEFORE · SNAPSHOT'):sequence?'CHECKED SEQUENCE · DEMO':`${current.stage.toUpperCase()} · WORKING SCENE`;
    if(editing&&current.ready&&!proposal&&!sequence)drawHandles($('preview'),result[target].collision);
    $('preview').classList.toggle('hitbox-editing',editing);
    $('actor-play').textContent=clock.running?'Pause / freeze':pass.complete&&!loopEnabled()?'Replay pass':'Play scene';$('actor-play').setAttribute('aria-pressed',String(clock.running));
    for(const id of ['actor-play','actor-step','actor-restart','actor-stop','actor-loop','actor-speed','actor-jump','actor-slide','edit-hitbox','edit-target'])$(id).disabled=!current.ready;
    $('actor-step').disabled=!current.ready||(pass.complete&&!loopEnabled());
    $('actor-jump').disabled=$('actor-slide').disabled=!current.ready||!gameActions()||pass.complete||Boolean(sequence);
    $('edit-hitbox').disabled=!current.ready||Boolean(proposal)||Boolean(sequence);
    $('actor-time').textContent=`Step ${clock.steps.toLocaleString()} · ${clock.time.toFixed(2)} s${clock.running?'':' · Frozen'}`;
    const c=context();$('actor-pose').textContent=sequence?`${who==='claude'?'Claude':'Constance'} ${c.character.state} · ${sequenceIndex}/${sequence.events.length} actions`:`${who==='claude'?'Claude':'Constance'} ${c.character.state} ${result.character.frame+1}/${c.character.frames} · ${c.hazard.name} ${result.hazard.frame+1}/${c.hazard.frames}`;
    const status=$('contact-status'),label=current.ready?`${cycleNumber>1?'Pass '+cycleNumber+' · ':''}${pass.label(result,{travel:opts.travel})}${lastResult?' · Previous: '+lastResult:''}`:'Loading scene…';
    const statusLabel=proposal?`${proposal.proposed?'Proposed':'Before'} · ${who==='claude'?'Claude':'Constance'} · ${label}`:label;
    if(status.textContent!==statusLabel)status.textContent=statusLabel;
    status.classList.toggle('contact',result.contact||pass.firstContact!==null);
    $('scene-playback-help').textContent=(loopEnabled()?'Loop repeats this pass or sequence. Pause freezes; Stop returns to the start. ':'One pass; stops at the end. ')+(sequence?'Checked sequence · actions play automatically for the selected character. Freeze or step to inspect. Exit sequence to edit.':demo?`${proposal&&!proposal.proposed?'Before':'Proposed'} timing demo · action plays automatically. Result describes the main preview only. Freeze or step to inspect.`:gameActions()?'Jump/Slide use game timing. Next frame = 1/60 s.':'Pose loop only · contact checks for this pose; use Game actions to test Jump/Slide clearance.');
    $('edit-target').value=target;$('edit-target-name').textContent=target==='character'?`${c.character.name} · ${c.character.state}`:c.hazard.name;
    $('edit-hitbox').setAttribute('aria-pressed',String(editing));$('edit-hitbox').textContent=editing?'Finish hitbox editing':'Edit hitbox on scene';
    inspector(false);
    if(opts.guides&&current.ready){const ctx=$('preview').getContext('2d');ctx.save();ctx.strokeStyle='#d5eeee';ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(0,draft.calibration.stages[current.stage].pathY);ctx.lineTo(960,draft.calibration.stages[current.stage].pathY);ctx.stroke();ctx.restore();}
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
      if(draft.calibration.hazards[id]){const lockLabel=document.createElement('span');lockLabel.className='field-lock';const lock=document.createElement('input');lock.type='checkbox';lock.dataset.lock=id;lock.dataset.lockField=field;lock.setAttribute('aria-label',`Lock ${text}`);lockLabel.append(lock,document.createTextNode('Lock from optimizer'));label.append(lockLabel);lock.onchange=()=>{const checked=lock.checked;clock.pause();const c=structuredClone(draft.calibration),h=c.hazards[id];h.locks=checked?[...new Set([...h.locks,field])]:h.locks.filter(k=>k!==field);draft.editCalibration(c);render(current);changed();};}

      input.onfocus=()=>{if(clock.running)clock.pause();};
      input.onchange=()=>{try{if(input.disabled)throw new Error('Unlink the character from the stage pathway to edit its offset.');if(input.value.trim()==='')throw new Error('Enter a value.');draft.editPlacement(id,{...draft.placement[id],[field]:Number(input.value)});message('Updated placement. Replay the pass to check your changes.');}catch(error){message(error.message,true);}render(current);changed();};
    }
    const reset=document.createElement('button');reset.className='subtle';reset.textContent='Reset this group';reset.dataset.resetPlacement=id;reset.dataset.fields=fields.join(',');body.append(reset);
    reset.onclick=()=>{if(reset.disabled)return;clock.pause();draft.editPlacement(id,{...draft.placement[id],...Object.fromEntries(fields.map(f=>[f,draft.placementBaseline[id][f]]))});render(current);changed();};
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
        const grounding=group(`Stage grounding · ${stage.toUpperCase()}`,`grounding:${stage}:${who}`,['groundOffset'],'');
        const body=grounding.querySelector('.group-content'),label=document.createElement('label'),link=document.createElement('input'),note=document.createElement('p');
        label.className='check';link.type='checkbox';link.dataset.characterFollow=who;label.append(link,document.createTextNode('Follow stage pathway'));note.className='scope-note';note.dataset.groundingHelp='';body.prepend(label,note);
        grounding.querySelector('.field').firstChild.textContent='Total stage offset · Y';
        link.onchange=()=>calibration()?.setCharacterFollow(who,link.checked);groups.push(grounding);
      }else {
        const fields=['scale','xOffset',...(selected.kind==='ground'?['groundOffset']:['highClearance','lowClearance','highOffsetY','lowOffsetY']),...(selected.frames>1?['fps']:[])];
        const automation=document.createElement('div');automation.className='group-content';
        for(const [field,text] of [['follow','Follow shared pathway'],['enabled','Include in generated sequences']]){const label=document.createElement('label');label.className='check';const input=document.createElement('input');input.type='checkbox';input.dataset.policy=field;input.dataset.hazard=selected.id;label.append(input,document.createTextNode(text));automation.append(label);input.onchange=()=>{const checked=input.checked;clock.pause();const cal=structuredClone(draft.calibration);cal.hazards[selected.id][field]=checked;const placements=structuredClone(draft.placement);if(field==='follow'){const d=pathShift(draft,stage)*(checked?-1:1),p=placements[selected.id];if(selected.kind==='ground')p.groundOffset+=d;else{p.highClearance-=d;p.lowClearance-=d;}}try{draft.editCalibration(cal,placements);}catch(error){message(error.message,true);}render(current);changed();};}groups.push(automation);
        const facing=document.createElement('label');facing.className='check';const mirror=document.createElement('input');mirror.type='checkbox';mirror.dataset.facing=selected.id;facing.append(mirror,document.createTextNode('Mirror horizontally'));automation.append(facing);
        const facingHelp=document.createElement('p');facingHelp.className='scope-note';facingHelp.textContent='Scene and Frame use gameplay facing. Full atlas shows source pixels. Mirroring also reflects the hitbox.';automation.append(facingHelp);
        mirror.onchange=()=>{const flipX=mirror.checked;clock.pause();try{draft.editPlacement(selected.id,{...draft.placement[selected.id],flipX});}catch(error){message(error.message,true);}render(current);changed();};
        const checked=document.createElement('p');checked.id='hazard-check-status';checked.className='scope-note';groups.push(checked);
        groups.push(group('Hazard placement',selected.id,fields,`${stage.toUpperCase()} · ${selected.name}. Positive grounding moves down.`));
      }
      const box=group('Hitbox',selected.id,['cw','ch','cx','cy'],selected.type==='character'?'Game collision proportions. At height 1, vertical offset has no effect; reduce height to create adjustment space.':'Game collision proportions. Dragging follows the same limits as these fields.',editing);box.id='hitbox-properties';groups.push(box);
      $('placement-properties').replaceChildren(...groups);
    }
    for(const input of $('placement-properties').querySelectorAll('input[data-placement]')){
      const proposal=calibration()?.previewFor(context().hazard),id=input.dataset.placement,grounding=id.startsWith('grounding:'),linked=grounding&&draft.calibration.stages[stage].characterFollow[who];
      if(updateValues)input.value=(proposal&&id===proposal.row.id?proposal.value:draft.placement[id])[input.dataset.field]+(grounding?characterPathShift(draft,stage,who):0);
      input.disabled=!current.ready||Boolean(proposal)||Boolean(sequence)||linked;
    }
    for(const link of $('placement-properties').querySelectorAll('[data-character-follow]')){
      link.checked=draft.calibration.stages[stage].characterFollow[link.dataset.characterFollow];link.disabled=!current.ready||Boolean(calibration()?.isPreview())||Boolean(sequence);
      $('placement-properties').querySelector('[data-grounding-help]').textContent=link.checked?'Includes this stage’s pathway shift. Uncheck Follow stage pathway to edit independently. Global foot and state artwork corrections stay separate.':'Independent offset for this character in this stage. Positive Y moves down. Relinking keeps its position and follows future pathway changes.';
    }
    for(const lock of $('placement-properties').querySelectorAll('[data-lock]')){lock.checked=draft.calibration.hazards[lock.dataset.lock].locks.includes(lock.dataset.lockField);lock.disabled=Boolean(calibration()?.isPreview())||Boolean(sequence);}
    for(const input of $('placement-properties').querySelectorAll('[data-facing]')){input.checked=draft.placement[input.dataset.facing].flipX;input.disabled=!current.ready||Boolean(calibration()?.isPreview())||Boolean(sequence);}
    for(const input of $('placement-properties').querySelectorAll('[data-policy]')){input.checked=draft.calibration.hazards[input.dataset.hazard][input.dataset.policy];input.disabled=Boolean(calibration()?.isPreview())||Boolean(sequence);}
    if($('hazard-check-status')){const policy=draft.calibration.hazards[selected.id];$('hazard-check-status').textContent=calibration()?.checkStatus(selected)??(policy.stamp?(policy.stamp===calibrationStamp(draft,selected,config)?'Applied calibration · all difficulties checked':'Needs recheck · reference, hazard or timing target changed'):'Not calibrated · optimize to propose a starting point');}

    for(const reset of $('placement-properties').querySelectorAll('button')){const id=reset.dataset.resetPlacement;reset.disabled=!current.ready||Boolean(calibration()?.isPreview())||Boolean(sequence)||(id.startsWith('grounding:')&&draft.calibration.stages[stage].characterFollow[who])||reset.dataset.fields.split(',').every(f=>same(draft.placement[id][f],draft.placementBaseline[id][f]));}
  }
  function render(value){
    current=value;syncContext(value.selected,value.stage);motion??=createMotion(config,state);
    const next=JSON.stringify([draft.placement,draft.frames,draft.value,draft.calibration]);if(signature&&next!==signature){pass.invalidate();lastResult='';}signature=next;
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
    calibration()?.refresh();inspector(true);paint();
  }
  function reset(keep=false){cancelDrag();if(!keep){sequence=null;demo=null;}cycleStart=0;cycleNumber=1;lastResult='';resetActors();pass.reset();clock.restart();if(current?.ready){startPass(0);paint();}}
  function replay(){reset(true);if(pass.firstContact!==null&&$('pause-contact').checked)return;clock.play();}
  function choose(next){clock.pause();cancelDrag();target=next;inspectorKey='';inspector(true);paint();}
  function action(name){cancelDrag();motion[name==='jump'?'triggerJump':'triggerSlide']();const first=pass.sample(sceneGeometry(options()),(clock.steps-cycleStart)*STEP,{travel:$('actor-travel').checked});if(first&&$('pause-contact').checked)clock.pause();paint();}
  function point(e){const r=$('preview').getBoundingClientRect();return {x:(e.clientX-r.left)*$('preview').width/r.width,y:(e.clientY-r.top)*$('preview').height/r.height};}
  function cancelDrag(){if(!drag)return;const id=drag.pointer;drag=null;if($('preview').hasPointerCapture?.(id))$('preview').releasePointerCapture(id);paint();}
  $('preview').addEventListener('pointerdown',e=>{
    if(!active()||!current?.ready||e.button!==0||e.defaultPrevented||sequence||calibration()?.isPreview())return;
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
  $('scene-flight').onchange=()=>reset();$('scene-motion').onchange=()=>reset();
  $('pause-contact').onchange=()=>{if($('pause-contact').checked)$('actor-boxes').checked=true;paint();};
  $('actor-play').onclick=()=>{cancelDrag();if(clock.running)clock.pause();else if(pass.complete&&!loopEnabled())replay();else clock.play();};
  $('actor-step').onclick=()=>{cancelDrag();clock.step();};$('actor-restart').onclick=replay;
  $('actor-stop').onclick=()=>reset(true);
  $('actor-loop').onchange=()=>{if(pass.complete&&!loopEnabled())clock.pause();else paint();};
  $('actor-jump').onclick=()=>action('jump');$('actor-slide').onclick=()=>action('slide');
  $('actor-speed').onchange=()=>clock.setSpeed(Number($('actor-speed').value));
  for(const id of ['actor-guides','actor-boxes'])$(id).onchange=paint;
  $('actor-travel').onchange=()=>reset();$('edit-target').onchange=()=>choose($('edit-target').value);
  $('edit-hitbox').onclick=()=>{clock.pause();cancelDrag();editing=!editing;if(editing){$('actor-boxes').checked=true;$('hitbox-properties').open=true;}paint();};
  async function demonstrate(character,action,at){who=character;state='run';$('scene-motion').value='encounter';await reload();demo={action,at:Math.round(at/STEP)*STEP};reset(true);$('actor-travel').checked=true;clock.play();}
  function startSequence(value){sequence=value;state='run';$('scene-motion').value='encounter';$('actor-travel').checked=true;reset(true);pass.startedAhead=true;clock.play();}
  function endSequence(){if(sequence){sequence=null;reset();render(current);}}
  return {entries,validate,render,demonstrate,startSequence,endSequence,sequenceActive:()=>Boolean(sequence),refresh:()=>{if(current&&active())render(current);},editingItem:()=>current?context()[target]:null,stop:()=>{cancelDrag();clock.pause();},reset,step:()=>{cancelDrag();if(!pass.complete||loopEnabled())clock.step();},clock};
}
