import {SceneClock,PLACEMENT_FIELDS,drawDesignScene} from './scene-model.mjs';
import {same,validateAtlas} from './model.mjs';
const $=id=>document.getElementById(id);
export function setupSceneEditor({config,contract,items,landscapes,catalog,draft,active,reload,changed,message}) {
  let current=null,who='claude',state='run',inspectorKey='';
  const hazards=new Map(landscapes.map(s=>[s.stage,items.find(i=>i.stage===s.stage&&i.type==='hazard').id]));
  const find=id=>items.find(i=>i.id===id);
  function context(selected,stage){
    if(selected.type==='character'){[,who,state]=selected.id.split(':');}
    if(selected.type==='hazard')hazards.set(stage,selected.id);
    return {character:find(`character:${who}:${state}`),hazard:find(hazards.get(stage)),landscape:landscapes.find(s=>s.stage===stage)};
  }
  const clock=new SceneClock({available:()=>Boolean(active()&&current?.ready&&!document.hidden&&!$('project-dialog').open),paint});
  function entries(selected,stage){
    const c=context(selected,stage),entries=Object.entries(c.landscape.sources).map(([layer,key])=>[layer,catalog.assets[key]]);
    if(config.worldProfiles[stage].clouds!==false)entries.push(['clouds',catalog.assets.clouds]);
    entries.push(['character',catalog.assets[c.character.asset]],['hazard',catalog.assets[c.hazard.asset]]);
    return entries;
  }
  function validate(selected,stage,images){
    const c=context(selected,stage);
    for(const [key,item] of [['character',c.character],['hazard',c.hazard]]) {
      const img=images[key],size=draft.size(item.id);validateAtlas(item,img.naturalWidth,img.naturalHeight);
      if(img.naturalWidth!==size.width||img.naturalHeight!==size.height)throw new Error('Scene atlas dimensions do not match the catalog.');
    }
    for(const [layer,expected] of Object.entries(c.landscape.expected||{}))if(images[layer].naturalWidth!==expected.width||images[layer].naturalHeight!==expected.height)throw new Error('Scene landscape dimensions do not match the registry.');
  }
  function paint(){
    if(!current||!active())return;
    const c=context(current.selected,current.stage),available=current.ready;
    const options={config,contract,draft,...current,...c,time:clock.time,travel:$('actor-travel').checked,flight:$('scene-flight').value,guides:$('actor-guides').checked,boxes:$('actor-boxes').checked};
    const result=drawDesignScene($('preview'),options);
    if($('compare').checked)drawDesignScene($('baseline'),{...options,baseline:true});
    $('actor-play').textContent=clock.running?'Pause / freeze':'Play scene';$('actor-play').setAttribute('aria-pressed',String(clock.running));
    for(const id of ['actor-play','actor-step','actor-restart','actor-speed'])$(id).disabled=!available;
    $('actor-time').textContent=`Step ${clock.steps.toLocaleString()} · ${clock.time.toFixed(2)} s${clock.running?'':' · Frozen'}`;
    $('actor-pose').textContent=result.character?`${who==='claude'?'Claude':'Constance'} ${state} ${result.character.frame+1}/${c.character.frames} · ${c.hazard.name} ${result.hazard?.frame+1}/${c.hazard.frames}`:'';
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
      input.onchange=()=>{try{if(input.value.trim()==='')throw new Error('Enter a value.');draft.editPlacement(id,{...draft.placement[id],[field]:Number(input.value)});message('Updated placement. Save all keeps every character and stage setting.');}catch(error){message(error.message,true);}render(current);changed();};
    }
    const reset=document.createElement('button');reset.className='subtle';reset.textContent='Reset this group';reset.dataset.resetPlacement=id;reset.dataset.fields=fields.join(',');body.append(reset);
    reset.onclick=()=>{draft.editPlacement(id,{...draft.placement[id],...Object.fromEntries(fields.map(f=>[f,draft.placementBaseline[id][f]]))});render(current);changed();};
    return details;
  }
  function inspector(selected,stage){
    const key=selected.id+':'+stage;
    if(key!==inspectorKey){
      inspectorKey=key;const groups=[];
      if(selected.type==='character') {
        const who=selected.id.split(':')[1];
        groups.push(group('Shared character',`character:${who}`,['masterScale','footOffset'],'All states · all stages'));
        groups.push(group('State placement',selected.id,['stateScale','offsetX','offsetY'],`${selected.state} · all stages`));
        groups.push(group('Stage grounding',`grounding:${stage}:${who}`,['groundOffset'],`${who} · ${stage.toUpperCase()} only. Positive Y moves down.`));
      }else {
        const fields=['scale','xOffset',...(selected.kind==='ground'?['groundOffset']:['highClearance','lowClearance']),...(selected.frames>1?['fps']:[])];
        groups.push(group('Hazard placement',selected.id,fields,`${stage.toUpperCase()} · ${selected.name}. Positive grounding moves down.`));
      }
      groups.push(group('Collision geometry',selected.id,['cw','ch','cx','cy'],'Proportions of the sprite geometry. Enable Collision boxes under View options.',false));
      $('placement-properties').replaceChildren(...groups);
    }
    for(const input of $('placement-properties').querySelectorAll('input')){input.value=draft.placement[input.dataset.placement][input.dataset.field];input.disabled=!current.ready;}
    for(const reset of $('placement-properties').querySelectorAll('button')){const id=reset.dataset.resetPlacement;reset.disabled=!current.ready||reset.dataset.fields.split(',').every(f=>same(draft.placement[id][f],draft.placementBaseline[id][f]));}
  }
  function render(value){
    current=value;const {selected,stage}=current,c=context(selected,stage);
    $('compare').disabled=false;document.querySelector('.baseline-card').hidden=!$('compare').checked;
    $('preview').classList.remove('editing');$('preview').setAttribute('aria-label',`${stage.toUpperCase()} scene with ${who} and ${c.hazard.name}`);
    $('preview-label').textContent=`${stage.toUpperCase()} · WORKING SCENE`;
    $('scope').textContent=selected.type==='character'?`${selected.name} · shared settings and ${stage.toUpperCase()} grounding`:`${stage.toUpperCase()} · ${selected.name}`;
    $('scene-character-choice').hidden=selected.type==='character';$('scene-hazard-choice').hidden=selected.type==='hazard';
    $('scene-character').value=who;$('scene-state').value=state;
    const options=items.filter(i=>i.stage===stage&&i.type==='hazard');
    if($('scene-hazard').dataset.stage!==stage){$('scene-hazard').replaceChildren(...options.map(i=>new Option(i.name,i.id)));$('scene-hazard').dataset.stage=stage;}
    $('scene-hazard').value=c.hazard.id;$('scene-flight-choice').hidden=c.hazard.kind!=='flying';
    inspector(selected,stage);paint();
  }
  for(const name of Object.keys(config.state))$('scene-state').add(new Option(name[0].toUpperCase()+name.slice(1),name));
  $('scene-character').onchange=()=>{who=$('scene-character').value;reload();};
  $('scene-state').onchange=()=>{state=$('scene-state').value;reload();};
  $('scene-hazard').onchange=()=>{hazards.set(current.stage,$('scene-hazard').value);reload();};
  $('scene-flight').onchange=()=>{clock.restart();paint();};
  $('actor-play').onclick=()=>{if(clock.running)clock.pause();else clock.play();};
  $('actor-step').onclick=()=>clock.step();$('actor-restart').onclick=()=>clock.restart();
  $('actor-speed').onchange=()=>clock.setSpeed(Number($('actor-speed').value));
  for(const id of ['actor-guides','actor-boxes'])$(id).onchange=paint;
  $('actor-travel').onchange=()=>clock.restart();
  return {entries,validate,render,stop:()=>clock.pause(),reset:()=>clock.restart(),step:()=>clock.step(),clock};
}
