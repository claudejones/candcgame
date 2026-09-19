import {PROFILE_FIELDS,calibrationStamp} from './calibration-settings.mjs';
import {measureArtwork,optimizeHazard,analyzeHazard,makeSequence} from './calibration-engine.mjs';
import {PLACEMENT_FIELDS} from './scene-model.mjs';
const $=id=>document.getElementById(id),clone=v=>structuredClone(v),round=v=>Number(v.toFixed(3));
export function setupCalibration({config,draft,items,catalog,loader,getStage,navigate,scene,changed,message}){
 let rows=[],active=null,proposed=true,busy=false,generation=0,sequence=null,sequenceStamp='';
 const hazards=items.filter(i=>i.type==='hazard'),find=id=>items.find(i=>i.id===id);
 const currentStamp=r=>calibrationStamp(draft,find(r.id),config),fresh=r=>(r.applied?r.appliedStamp:r.stamp)===currentStamp(r);
 function previewFor(item){return active&&active.id===item.id&&fresh(active)?{row:active,value:proposed?active.placement:active.before,before:active.before,proposed}:null;}
 function summary(reports){return reports.map(r=>`${r.action.toUpperCase()}${find(active?.id)?.kind==='flying'?' '+r.flight.toUpperCase():''}: `+Object.entries(r.characters).map(([who,c])=>`${who} ${c.best?Math.round(c.best.width*1000)+' ms':'no safe window'}${!c.threat?' (no running contact)':''}`).join(' · ')).join(' / ');}
 function refresh(){
  const stage=getStage(),cal=draft.calibration;$('pathway-y').value=cal.stages[stage].pathY;$('difficulty-profile').value=cal.profile;
  for(const input of $('difficulty-fields').querySelectorAll('input'))input.value=cal.profiles[cal.profile][input.dataset.profile];
  if(active&&!fresh(active)){active=null;message('Calibration inputs changed. Analyze again to refresh the proposal.');}
  $('proposal-review').hidden=!active;
  if(active){$('proposal-name').textContent=`${active.name} · ${proposed?'Proposed':'Before'}`;$('proposal-summary').textContent=summary(proposed?active.reports:active.beforeReports)+(active.warnings.length?' '+active.warnings.join(' '):'');
   $('proposal-fields').replaceChildren(...active.changes.map(c=>{const p=document.createElement('p');p.textContent=`${PLACEMENT_FIELDS[c.field]?.[0]||c.field}: ${round(c.before)} → ${round(c.after)}`;return p;}));
   $('proposal-demo-claude').disabled=$('proposal-demo-constance').disabled=!proposed;
  }
  $('cal-results').replaceChildren(...rows.map(r=>{
   const card=document.createElement('div');card.className='cal-result';const button=document.createElement('button');button.textContent=`${r.stage.toUpperCase()} · ${r.name}`;button.disabled=!fresh(r);button.onclick=()=>show(r);card.append(button);
   const note=document.createElement('p');note.textContent=!fresh(r)?'Needs recheck':r.applied?(r.ready?'Applied · timing target met':'Applied · timing still needs adjustment'):r.ready?'Meets timing target · review alignment':'Needs adjustment · timing target not met';card.append(note);
   const label=document.createElement('label');label.className='check';const box=document.createElement('input');box.type='checkbox';box.checked=r.reviewed;box.disabled=!fresh(r)||r.applied;box.onchange=()=>{r.reviewed=box.checked;refreshActions();};label.append(box,document.createTextNode('Reviewed · include when applying'));card.append(label);return card;
  }));
  if(sequence&&(sequence.stage!==stage||sequenceStamp!==JSON.stringify([draft.placement,draft.frames,draft.value,draft.calibration]))){sequence=null;$('sequence-status').textContent='Settings changed. Regenerate the sequence.';$('sequence-list').replaceChildren();scene()?.endSequence();}
  $('play-sequence').hidden=!sequence;$('stop-sequence').hidden=!scene()?.sequenceActive();
  refreshActions();
 }
 function refreshActions(){for(const id of ['optimize-stage','optimize-all','generate-sequence'])$(id).disabled=busy;
  $('apply-reviewed').disabled=busy||!rows.some(r=>r.reviewed&&!r.applied&&fresh(r));$('apply-stage').disabled=busy||!rows.some(r=>r.stage===getStage()&&r.reviewed&&!r.applied&&fresh(r));$('cancel-optimization').hidden=!busy;$('cal-progress').hidden=!busy;
 }
 async function show(r){if(!fresh(r))return;scene()?.stop();active=r;proposed=true;$('compare').checked=true;$('actor-boxes').checked=true;await navigate(r.id);refresh();scene()?.refresh();}
 async function optimize(all){
  scene()?.stop();active=null;sequence=null;scene()?.endSequence();const token=++generation;busy=true;refresh();
  const candidates=hazards.filter(i=>all||i.stage===getStage()),snapshot={...draft,placement:clone(draft.placement),frames:clone(draft.frames),value:clone(draft.value),calibration:clone(draft.calibration)};
  rows=rows.filter(r=>!candidates.some(i=>i.id===r.id));$('cal-progress').max=candidates.length;$('cal-progress').value=0;
  try{for(const item of candidates){if(token!==generation)break;$('cal-status').textContent=`Analyzing ${item.stage.toUpperCase()} · ${item.name}…`;
    const img=await loader.load(catalog.assets[item.asset]);if(token!==generation)break;const art=measureArtwork(img,item,snapshot);
    const row=await optimizeHazard({config,draft:snapshot,items,item,art,yieldTask:()=>new Promise(r=>setTimeout(r,0)),cancelled:()=>token!==generation});
    if(token!==generation)break;rows.push(row);$('cal-progress').value++;refresh();
   }
   if(token===generation)$('cal-status').textContent=`${rows.length} proposals · ${rows.filter(r=>r.ready).length} meet the timing target. Select a result to compare; mark reviewed before applying.`;
  }catch(error){if(token===generation){$('cal-status').textContent=error.message;message(error.message,true);}}
  finally{if(token===generation){busy=false;refresh();}}
 }
 function apply(stageOnly){
  const selected=rows.filter(r=>r.reviewed&&!r.applied&&fresh(r)&&(!stageOnly||r.stage===getStage()));if(!selected.length)return;
  scene()?.stop();active=null;const placements=clone(draft.placement),cal=clone(draft.calibration);
  for(const r of selected){const h=cal.hazards[r.id];for(const [key,value] of Object.entries(r.placement))if(!h.locks.includes(key))placements[r.id][key]=value;}
  for(const r of selected)cal.hazards[r.id].stamp=r.ready?calibrationStamp({...draft,placement:placements,calibration:cal},find(r.id),config):'';
  draft.editCalibration(cal,placements);for(const r of selected){r.applied=true;r.appliedStamp=currentStamp(r);r.reviewed=false;}
  changed();refresh();scene()?.refresh();message(`Applied ${selected.length} hazard proposals. Undo reverses this batch; Save all keeps it.`);
 }
 function editConfig(fn){scene()?.stop();const cal=clone(draft.calibration);try{fn(cal);draft.editCalibration(cal);changed();refresh();scene()?.refresh();}catch(error){message(error.message,true);refresh();}}
 $('pathway-y').onchange=()=>editConfig(c=>{if($('pathway-y').value.trim()==='')throw new Error('Enter a pathway Y.');c.stages[getStage()].pathY=Number($('pathway-y').value);});
 $('difficulty-profile').onchange=()=>editConfig(c=>c.profile=$('difficulty-profile').value);
 const labels={groundSpeed:'Ground speed · px/s',flyingSpeed:'Flying speed · px/s',minWindowMs:'Minimum input window · ms',spacingSeconds:'Minimum arrival spacing · s',reactionSeconds:'Reaction / action spacing · s',count:'Sequence hazard count',maxVisible:'Maximum visible hazards'};
 for(const [key,[min,max]] of Object.entries(PROFILE_FIELDS)){const label=document.createElement('label');label.className='field';label.textContent=labels[key];const input=document.createElement('input');Object.assign(input,{type:'number',min,max,step:key.includes('Seconds')?.1:1});input.dataset.profile=key;label.append(input);$('difficulty-fields').append(label);input.onchange=()=>editConfig(c=>{if(input.value.trim()==='')throw new Error('Enter a profile value.');c.profiles[c.profile][key]=Number(input.value);});}
 $('optimize-stage').onclick=()=>optimize(false);$('optimize-all').onclick=()=>optimize(true);$('cancel-optimization').onclick=()=>{generation++;busy=false;$('cal-status').textContent='Cancelled. Completed proposals remain available; no settings were applied.';if(!sequence)$('sequence-status').textContent='';refresh();};
 $('apply-stage').onclick=()=>apply(true);$('apply-reviewed').onclick=()=>apply(false);
 $('proposal-current').onclick=()=>{proposed=false;scene()?.reset();refresh();scene()?.refresh();};$('proposal-next').onclick=()=>{proposed=true;scene()?.reset();refresh();scene()?.refresh();};
 $('proposal-exit').onclick=()=>{active=null;refresh();scene()?.refresh();};
 for(const who of ['claude','constance'])$(`proposal-demo-${who}`).onclick=async()=>{if(!active||!fresh(active))return;const flight=$('scene-flight').value,report=active.reports.find(r=>r.flight===flight)||active.reports[0],best=report.characters[who].best;if(!best){message(`No safe ${report.action} window was found for ${who}. Adjust this hazard and recheck.`,true);return;}await scene().demonstrate(who,report.action,(best.start+best.end)/2);};
 $('generate-sequence').onclick=async()=>{
  scene()?.stop();active=null;sequence=null;scene()?.endSequence();const token=++generation,stage=getStage();$('cal-progress').max=hazards.filter(i=>i.stage===stage&&draft.calibration.hazards[i.id].enabled).length;$('cal-progress').value=0;$('sequence-status').textContent='Checking current settings and a continuous solution for both characters…';busy=true;refreshActions();
  try{await new Promise(r=>setTimeout(r,0));if(token!==generation)return;const reports=[],signature=JSON.stringify([draft.placement,draft.frames,draft.value,draft.calibration]);for(const item of hazards.filter(i=>i.stage===stage&&draft.calibration.hazards[i.id].enabled)){
    const rr=(item.kind==='flying'?['high','low']:['high']).map(flight=>analyzeHazard({config,draft,items,item,flight}));reports.push({id:item.id,stage,reports:rr,ready:rr.every(r=>r.pass)});$('cal-progress').value++;await new Promise(r=>setTimeout(r,0));if(token!==generation)return;if(signature!==JSON.stringify([draft.placement,draft.frames,draft.value,draft.calibration]))throw new Error('Settings changed during checking. Generate the sequence again.');
   }
   sequence=makeSequence({config,draft,items,reports,stage,seed:config.spawnDirector.seed});sequenceStamp=JSON.stringify([draft.placement,draft.frames,draft.value,draft.calibration]);
   $('sequence-status').textContent=`${sequence.profile} · ${sequence.events.length} hazards · ${Math.ceil(sequence.duration)} s. A complete action sequence clears both characters at 60 simulation steps/s.${sequence.excluded.length?' Excluded (timing target not met): '+sequence.excluded.map(id=>find(id).name).join(', ')+'.':''}`;
   $('sequence-list').replaceChildren(...sequence.events.map(e=>{const li=document.createElement('li');li.textContent=`${e.start.toFixed(1)} s · ${find(e.id).name} · ${e.action}`;return li;}));
  }catch(error){if(token===generation){sequence=null;$('sequence-status').textContent=error.message;message(error.message,true);}}finally{if(token===generation){busy=false;refresh();}}
 };
 $('play-sequence').onclick=async()=>{if(!sequence)return;const s=sequence;await navigate(s.events[0].id);scene().startSequence(s);refresh();};$('stop-sequence').onclick=()=>{scene()?.endSequence();refresh();};
 return {refresh,previewFor,isPreview:()=>Boolean(active&&fresh(active)),busy:()=>busy};
}
