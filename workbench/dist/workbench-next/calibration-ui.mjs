import {PROFILE_FIELDS,PROFILES,calibrationStamp,hazardSpeed} from './calibration-settings.mjs';
import {analyzeHazard,makeSequence} from './calibration-engine.mjs';
import {prepareOptimization,applyOptimization,artworkMeasurer,optimizationSignature} from './auto-optimization.mjs';
const $=id=>document.getElementById(id),clone=v=>structuredClone(v);
export function setupCalibration({config,draft,items,catalog,loader,stageGroups,getStage,navigate,scene,changed,message}){
 const hazards=items.filter(i=>i.type==='hazard'),measure=artworkMeasurer(loader,catalog);let busy=false,generation=0,sequence=null,sequenceStamp='',issues=new Map();
 const fresh=i=>draft.calibration.hazards[i.id].stamp===calibrationStamp(draft,i,config);
 const names=new Map();for(const [continent,stages] of stageGroups){$('cal-continent').add(new Option(continent,continent));for(const s of stages)names.set(s.id,{continent,label:s.label});}
 const node=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n;};
 function refreshResults(){
  const enabled=hazards.filter(i=>draft.calibration.hazards[i.id].enabled),ready=enabled.filter(fresh).length;
  $('cal-counts').textContent=`${ready} of ${enabled.length} hazards checked for both characters · Easy, Standard and Hard`;
  const query=$('cal-search').value.trim().toLowerCase(),continent=$('cal-continent').value,filter=$('cal-filter').value;
  const visible=enabled.filter(i=>(!continent||names.get(i.stage).continent===continent)&&`${i.name} ${i.stage} ${names.get(i.stage).label}`.toLowerCase().includes(query)&&(filter==='all'||filter==='attention'&&!fresh(i)||filter==='applied'&&fresh(i)));
  $('cal-showing').textContent=`Showing ${visible.length} hazards`;$('cal-empty').hidden=!!visible.length;
  const list=$('cal-results');list.replaceChildren();
  for(const i of visible){
   const card=node('article','');card.className='cal-result';const valid=fresh(i),policy=draft.calibration.hazards[i.id];
   card.append(node('strong',`${i.stage.toUpperCase()} · ${i.name}`),node('p',valid?'Ready · all difficulties checked':issues.get(i.id)||'Save All will recalculate this hazard.'));
   if(valid)card.append(node('small',PROFILES.map(p=>`${p}: ${Math.round(hazardSpeed(draft.calibration,i,p))} px/s`).join(' · ')));
   if(policy.locks.length)card.append(node('small',`Your overrides: ${policy.locks.join(', ')}`));
   const b=node('button','Open stage settings');b.disabled=busy;b.onclick=()=>navigate(i.id);card.append(b);list.append(card);
  }
 }
 function refresh(){
  const cal=draft.calibration,stage=getStage();$('pathway-y').value=cal.stages[stage].pathY;$('pathway-label').textContent=`Stage pathway Y · ${stage.toUpperCase()}`;
  for(const who of ['claude','constance'])$(`pathway-follow-${who}`).checked=cal.stages[stage].characterFollow[who];
  $('difficulty-profile').value=cal.profile;for(const input of $('difficulty-fields').querySelectorAll('input'))input.value=cal.profiles[cal.profile][input.dataset.profile];
  $('cal-profile').textContent=`Preview: ${cal.profile}. Global difficulty settings apply across stages; your stage overrides are retained.`;
  for(const id of ['optimize-stage','optimize-all','generate-sequence'])$(id).disabled=busy;
  $('cancel-optimization').hidden=!busy;$('cal-progress').hidden=!busy;
  if(sequence&&sequenceStamp!==optimizationSignature(draft)){sequence=null;scene()?.endSequence();$('sequence-status').textContent='Settings changed. Open Preview stage to recalculate it.';}
  $('play-sequence').hidden=true;
  $('finish-pathway').textContent=`Follows the selected character’s ground guide · ${stage.toUpperCase()}`;
  const ss=draft.stageSettings[stage];for(const pattern of ['jump-slide','repeat-jump','mixed','hold-slide']){$('combo-'+pattern).checked=ss.combinations.patterns.includes(pattern);$('combo-'+pattern).disabled=busy;}for(const [id,group,key] of [['finish-ground','finish','groundOffset'],['finish-x','finish','xOffset'],['finish-scale','finish','scale'],['combo-length','combinations','length'],['combo-hold','combinations','holdSeconds'],['combo-density','combinations','density']]){$(id).value=ss[group][key];$(id).disabled=busy;}
  $('preview-finish').disabled=busy;$('stop-sequence').hidden=!scene()?.sequenceActive();refreshResults();
 }
 async function optimize({stage=null,force=false,storage=null}={}){
  if(busy)throw Error('Optimization is already running.');
  scene()?.stop();scene()?.endSequence();sequence=null;busy=true;const token=++generation;refresh();changed();
  try{
   const plan=await prepareOptimization({config,draft,items,measure,stage,force,cancelled:()=>token!==generation,onProgress:({item,index,total})=>{$('cal-progress').max=Math.max(1,total);$('cal-progress').value=index;$('cal-status').textContent=item?`Optimizing ${index+1} of ${total} · ${item.name}…`:'Finishing automatic setup…';}});
   applyOptimization(draft,plan,storage);
   for(const r of plan.rows){if(r.issue)issues.set(r.id,r.issue);else issues.delete(r.id);}
   const failures=plan.rows.filter(r=>!r.ready),summary=failures.length?`${storage?'Saved. ':''}${plan.checked-failures.length} hazards optimized; ${failures.length} override conflicts are listed below. Your overrides were kept.`:storage?`${force?'Optimized and saved.':'Saved.'} ${plan.checked?`${plan.checked} affected hazards recalculated.`:'All checks are current.'}`:`${plan.checked} hazards optimized and applied. Save All keeps this setup.`;
   $('cal-status').textContent=summary;message(summary,!!failures.length);return plan;
  }catch(error){$('cal-status').textContent=error.message;throw error;}
  finally{busy=false;changed();refresh();scene()?.reset();scene()?.refresh();}
 }
 const run=options=>optimize(options).catch(e=>message(e.message,true));
 $('optimize-stage').onclick=()=>run({stage:getStage(),force:true,storage:localStorage});$('optimize-all').onclick=()=>run({force:true,storage:localStorage});
 $('cancel-optimization').onclick=()=>{generation++;$('cal-status').textContent='Cancelling…';};
 function editConfig(fn){if(busy)return;scene()?.stop();const cal=clone(draft.calibration);try{fn(cal);draft.editCalibration(cal);scene()?.reset();changed();refresh();scene()?.refresh();}catch(e){message(e.message,true);refresh();}}
 $('pathway-y').onchange=()=>editConfig(c=>{if(!$('pathway-y').value.trim())throw Error('Enter a pathway Y.');c.stages[getStage()].pathY=Number($('pathway-y').value);});
 function setCharacterFollow(who,follow){if(busy)return;scene()?.stop();try{draft.setCharacterFollow(getStage(),who,follow);changed();scene()?.reset();}catch(e){message(e.message,true);}refresh();scene()?.refresh();}
 for(const who of ['claude','constance'])$(`pathway-follow-${who}`).onchange=()=>setCharacterFollow(who,$(`pathway-follow-${who}`).checked);
 $('difficulty-profile').onchange=()=>editConfig(c=>c.profile=$('difficulty-profile').value);
 const labels={groundSpeed:'Ground speed · px/s',flyingSpeed:'Flying speed · px/s',minWindowMs:'Minimum input window · ms',spacingSeconds:'Base arrival spacing · s',reactionSeconds:'Base action spacing · s',count:'Sequence density',maxVisible:'Visible hazard allowance · base'};
 for(const [key,[min,max]] of Object.entries(PROFILE_FIELDS)){const label=node('label',labels[key]);label.className='field';const input=document.createElement('input');Object.assign(input,{type:'number',min,max,step:key.includes('Seconds')?.1:1});input.dataset.profile=key;label.append(input);$('difficulty-fields').append(label);input.onchange=()=>editConfig(c=>{if(!input.value.trim())throw Error('Enter a profile value.');c.profiles[c.profile][key]=Number(input.value);});}
 $('cal-search').oninput=refreshResults;for(const id of ['cal-continent','cal-filter'])$(id).onchange=refreshResults;
 $('cal-clear-filters').onclick=()=>{$('cal-search').value='';$('cal-continent').value='';$('cal-filter').value='all';refreshResults();};
 let openFinish=false;
 $('generate-sequence').onclick=async()=>{
  if(busy)return;$('finish-panel').open=false;scene()?.stop();scene()?.endSequence();busy=true;const token=++generation;refresh();changed();$('sequence-status').textContent='Checking the complete stage for both characters…';
  try{await new Promise(r=>setTimeout(r,0));const stage=getStage();
   if(hazards.some(i=>i.stage===stage&&draft.calibration.hazards[i.id].enabled&&!fresh(i))){const plan=await prepareOptimization({config,draft,items,measure,stage,cancelled:()=>token!==generation});applyOptimization(draft,plan);}
   const signature=optimizationSignature(draft),reports=[];
   for(const item of hazards.filter(i=>i.stage===stage&&draft.calibration.hazards[i.id].enabled)){
    if(token!==generation)throw Error('Sequence cancelled.');
    const rr=(item.kind==='flying'?['high','low']:['high']).map(flight=>analyzeHazard({config,draft,items,item,flight}));reports.push({id:item.id,stage,reports:rr,ready:rr.every(r=>r.pass)});await new Promise(r=>setTimeout(r,0));
   }
   if(signature!==optimizationSignature(draft)||getStage()!==stage)throw Error('Stage or settings changed. Open Preview stage again.');
   if(reports.some(r=>!r.ready))throw Error('Save All to resolve the retained geometry overrides, then preview this stage.');
   sequence=makeSequence({config,draft,items,reports,stage,seed:config.spawnDirector.seed});sequenceStamp=signature;
   $('sequence-status').textContent=`${sequence.profile} · ${sequence.events.length} hazards · 90 seconds · continuous pacing through five difficulty sections. Repeatable for this stage and difficulty; checked jump / slide combinations. Both characters have a checked route through every encounter.${sequence.breathingRooms.some(r=>r.long)?' Longer safety gaps are highlighted in Combinations & inspection.':''}`;
   $('sequence-list').replaceChildren(...sequence.combinations.map(c=>node('li',`Section ${c.phase+1} · ${c.start.toFixed(1)} s · ${c.label}${c.heldSeconds?' · '+c.heldSeconds.toFixed(1)+' s':''}`)));
   $('sequence-combo').replaceChildren(...sequence.combinations.map(c=>new Option(`${c.start.toFixed(1)} s · ${c.label}`,c.id)));
   const timeline=$('sequence-timeline');timeline.replaceChildren();for(let phase=0;phase<5;phase++){const section=node('div','');section.className='sequence-section';const b=node('button',`Section ${phase+1}`);b.onclick=()=>scene()?.seekSequence(phase*18);section.append(b);for(const c of sequence.combinations.filter(c=>c.phase===phase)){const b=node('button',c.label);b.title=`${c.start.toFixed(1)} s`;b.onclick=()=>{$('sequence-combo').value=c.id;$('sequence-combo').onchange();};section.append(b);const rest=sequence.breathingRooms?.[c.id];if(rest){const gap=node('button',`${rest.kind==='finish'?'Finish approach':'Rest'} · ${rest.duration.toFixed(1)} s`);gap.className=rest.long?'sequence-rest long-rest':'sequence-rest';gap.title=rest.long?'Longer than the pacing target; retained for safe clearance.':'Breathing room after this combination';gap.onclick=()=>scene()?.seekSequence(rest.start);section.append(gap);}}timeline.append(section);}

  }catch(e){sequence=null;$('sequence-status').textContent=e.message;message(e.message,true);}finally{busy=false;refresh();changed();}
  if(sequence){await $('play-sequence').onclick();if(openFinish){scene()?.seekSequence(89);$('finish-panel').open=true;} }openFinish=false;
 };
 $('play-sequence').onclick=async()=>{if(!sequence)return;const s=sequence;await navigate(s.events[0].id);scene().startSequence(s);refresh();};$('stop-sequence').onclick=()=>{scene()?.endSequence();refresh();};
 for(const pattern of ['jump-slide','repeat-jump','mixed','hold-slide'])$('combo-'+pattern).onchange=()=>{try{const stage=getStage(),ss=clone(draft.stageSettings[stage]);ss.combinations.patterns=['jump-slide','repeat-jump','mixed','hold-slide'].filter(p=>$('combo-'+p).checked);draft.editStageSettings(stage,ss);changed();refresh();}catch(e){message(e.message,true);refresh();}};
 $('preview-finish').onclick=async()=>{openFinish=true;await $('generate-sequence').onclick();};
 for(const [id,group,key] of [['finish-ground','finish','groundOffset'],['finish-x','finish','xOffset'],['finish-scale','finish','scale'],['combo-length','combinations','length'],['combo-hold','combinations','holdSeconds'],['combo-density','combinations','density']])$(id).onchange=()=>{if(busy)return;try{const stage=getStage(),ss=clone(draft.stageSettings[stage]);if(!$(id).value.trim())throw Error('Enter a value.');ss[group][key]=Number($(id).value);const keep=sequence;draft.editStageSettings(stage,ss);if(group==='finish'&&keep)sequenceStamp=optimizationSignature(draft);changed();refresh();if(group==='finish'&&keep){scene()?.startSequence(keep);scene()?.seekSequence(89);}}catch(e){message(e.message,true);refresh();}};
 refresh();
 return {save:storage=>optimize({storage}),getSequence:()=>sequence&&sequenceStamp===optimizationSignature(draft)?clone(sequence):null,refresh,previewFor:()=>null,checkStatus:item=>fresh(item)?'Automatic calibration checked · all difficulties':issues.get(item.id)||'Save All will recalculate affected settings',setCharacterFollow,isPreview:()=>false,busy:()=>busy};
}
