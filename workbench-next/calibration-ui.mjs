import {PROFILE_FIELDS,PROFILES,calibrationStamp,calibrationReferenceStamp,timingProfileStamp} from './calibration-settings.mjs';
import {measureArtwork,optimizeHazard,analyzeHazard,analyzeProfiles,meetsProfile,meetsAll,makeSequence} from './calibration-engine.mjs';
import {setupCalibrationResults,resultStatus} from './calibration-results.mjs';
import {PLACEMENT_FIELDS} from './scene-model.mjs';
const $=id=>document.getElementById(id),clone=v=>structuredClone(v),round=v=>Number(v.toFixed(3));
export function setupCalibration({config,draft,items,catalog,loader,stageGroups,getStage,navigate,scene,changed,message}){
 let rows=[],active=null,proposed=true,busy=false,generation=0,sequence=null,sequenceStamp='',recheckTimer=null,skipRecheck='';
 const hazards=items.filter(i=>i.type==='hazard'),find=id=>items.find(i=>i.id===id);
 const currentStamp=r=>calibrationReferenceStamp(draft,find(r.id),config),fresh=r=>(r.applied?r.appliedStamp:r.stamp)===currentStamp(r);
 const profileFresh=(r,p)=>fresh(r)&&r.profileStamps[p]===timingProfileStamp(draft.calibration,find(r.id),p);
 const checksFresh=r=>PROFILES.every(p=>profileFresh(r,p));
 const eligible=r=>r.reviewed&&!r.applied&&fresh(r)&&checksFresh(r);
 const results=setupCalibrationResults({stageGroups,getStage,status:r=>resultStatus(r,fresh(r),checksFresh(r)),profileFresh,review:r=>show(r),select:(r,checked)=>{if(r){r.reviewed=checked;results.render();}refreshActions();}});
 const snapshot=()=>({...draft,placement:clone(draft.placement),frames:clone(draft.frames),value:clone(draft.value),calibration:clone(draft.calibration)});
 const pendingChecks=()=>rows.filter(r=>fresh(r)&&!checksFresh(r));
 const recheckKey=()=>JSON.stringify(pendingChecks().map(r=>[r.id,currentStamp(r),PROFILES.map(p=>timingProfileStamp(draft.calibration,find(r.id),p))]));
 function scheduleRecheck(){if(busy||recheckTimer||!pendingChecks().length||recheckKey()===skipRecheck)return;recheckTimer=setTimeout(()=>{recheckTimer=null;recheck(false);},80);}
 function previewFor(item){return active&&active.id===item.id&&fresh(active)?{row:active,value:proposed?active.placement:active.before,before:active.before,proposed}:null;}
 function summary(reports){return reports.map(r=>`${r.action.toUpperCase()}${find(active?.id)?.kind==='flying'?' '+r.flight.toUpperCase():''}: `+Object.entries(r.characters).map(([who,c])=>`${who} ${c.best?Math.round(c.best.width*1000)+' ms':'no safe window'}${!c.threat?' (no running contact)':''}`).join(' · ')).join(' / ');}
 const meets=meetsProfile;
 const verdict=reports=>meets(reports)?'meets target':'needs adjustment';
 const profileLabel=cal=>`${cal.profile[0].toUpperCase()+cal.profile.slice(1)} · ${cal.profiles[cal.profile].minWindowMs} ms target · ground ${cal.profiles[cal.profile].groundSpeed} / flying ${cal.profiles[cal.profile].flyingSpeed} px/s`;
 function closeProposal(){
  if(!active)return;
  active=null;proposed=true;$('compare').checked=false;
  $('proposal-review').hidden=true;document.querySelector('.baseline-card').hidden=true;
  scene()?.reset();
 }
 function refresh(){
  const stage=getStage(),cal=draft.calibration;$('pathway-y').value=cal.stages[stage].pathY;$('difficulty-profile').value=cal.profile;
  for(const input of $('difficulty-fields').querySelectorAll('input'))input.value=cal.profiles[cal.profile][input.dataset.profile];
  if(active&&!fresh(active)){closeProposal();message('Calibration inputs changed. Analyze again to refresh the proposal.');}
  for(const r of rows)if(r.reviewed&&(!fresh(r)||!checksFresh(r)))r.reviewed=false;
  $('cal-profile').textContent='Checks: Easy · Standard · Hard. Preview: '+profileLabel(cal);
  $('proposal-review').hidden=!active;
  if(active){
   const version=proposed?'Proposed':'Before',profile=cal.profile,valid=profileFresh(active,profile),before=active.beforeProfiles[profile],after=active.profiles[profile];
   $('proposal-name').textContent=`${active.stage.toUpperCase()} · ${active.name}`;
   $('proposal-context').textContent=profileLabel(cal);
   $('proposal-profiles').querySelector('tbody').replaceChildren(...PROFILES.map(p=>{const tr=document.createElement('tr');tr.classList.toggle('current',p===profile);for(const text of [p[0].toUpperCase()+p.slice(1),profileFresh(active,p)?verdict(active.beforeProfiles[p]):'Recheck',profileFresh(active,p)?verdict(active.profiles[p]):'Recheck']){const td=document.createElement('td');td.textContent=text;tr.append(td);}return tr;}));
   $('proposal-outcome').textContent=!valid?'Rechecking this difficulty. Shared settings are unchanged.':`Before: ${verdict(before)}. Proposed: ${verdict(after)}. `+(meets(before)&&meets(after)?'Both meet this target. Keep current unless you prefer the proposed alignment or timing margin.':meets(before)?'Current settings meet this target; the proposal does not. Keep current or review the other difficulties.':!meets(after)?'This difficulty still needs adjustment.':'Review the alignment and timing margin before applying.')+(active.ready?' Shared proposal meets all three difficulties.':' Shared proposal does not yet meet every difficulty.');
   $('proposal-summary').textContent=valid?`Before — ${summary(before)}. Proposed — ${summary(after)}.`+(active.warnings.length?' '+active.warnings.join(' '):''):'Timing results will refresh after checking.';
   $('proposal-fields').replaceChildren(...active.changes.map(c=>{const p=document.createElement('p');p.textContent=`${PLACEMENT_FIELDS[c.field]?.[0]||c.field}: ${round(c.before)} → ${round(c.after)}`;return p;}));
   $('proposal-current').setAttribute('aria-pressed',String(!proposed));$('proposal-next').setAttribute('aria-pressed',String(proposed));
   $('proposal-demo-help').textContent=`Demo runs ${version.toLowerCase()} settings at a sampled safe action time for the selected flying pass. “Cleared” describes the main preview only; the Before comparison is a visual reference, not a separate test. The timing target checks both characters and all sampled starting frames.`;
   for(const who of ['claude','constance']){const button=$(`proposal-demo-${who}`);button.disabled=busy||!valid;button.textContent=`Demo ${version} · ${who==='claude'?'Claude':'Constance'}`;}
  }
  results.render({rows,active,busy});
  if(sequence&&(sequence.stage!==stage||sequenceStamp!==JSON.stringify([draft.placement,draft.frames,draft.value,draft.calibration]))){sequence=null;$('sequence-status').textContent='Settings changed. Regenerate the sequence.';$('sequence-list').replaceChildren();scene()?.endSequence();}
  $('play-sequence').hidden=!sequence;$('stop-sequence').hidden=!scene()?.sequenceActive();
  refreshActions();scheduleRecheck();
 }
 function refreshActions(){for(const id of ['optimize-stage','optimize-all','generate-sequence'])$(id).disabled=busy;
  const selected=rows.filter(eligible),stageSelected=selected.filter(r=>r.stage===getStage()),needs=selected.filter(r=>!r.ready).length;
  $('apply-reviewed').disabled=busy||!selected.length;$('apply-stage').disabled=busy||!stageSelected.length;
  $('apply-reviewed').textContent=`Apply all selected (${selected.length})`;$('apply-stage').textContent=`Apply selected in ${getStage().toUpperCase()} (${stageSelected.length})`;
  $('cal-selection').textContent=`${selected.length} selected${selected.some(r=>!results.shown().includes(r))?' · '+selected.filter(r=>!results.shown().includes(r)).length+' hidden by filters':''}${needs?' · '+needs+' still need adjustment':''}. Applying updates your working draft. Save all keeps it in this browser; Export all downloads it.`;
  $('recheck-results').disabled=busy||!rows.length;
  $('cancel-optimization').hidden=!busy;$('cal-progress').hidden=!busy;
 }
 async function show(r){if(!fresh(r)||!checksFresh(r)||r.applied||busy)return;if(active===r){closeProposal();refresh();changed();return;}scene()?.stop();results.openStage(r.stage);active=r;proposed=true;$('compare').checked=true;$('actor-boxes').checked=true;await navigate(r.id);refresh();scene()?.refresh();}
 async function optimize(all){
  scene()?.stop();closeProposal();sequence=null;scene()?.endSequence();const token=++generation;busy=true;refresh();
  const candidates=hazards.filter(i=>all||i.stage===getStage()),snapshotValue=snapshot();
  rows=rows.filter(r=>!candidates.some(i=>i.id===r.id));$('cal-progress').max=candidates.length;$('cal-progress').value=0;
  try{for(const item of candidates){if(token!==generation)break;$('cal-status').textContent=`Analyzing ${item.stage.toUpperCase()} · ${item.name}…`;
    const img=await loader.load(catalog.assets[item.asset]);if(token!==generation)break;const art=measureArtwork(img,item,snapshotValue);
    const row=await optimizeHazard({config,draft:snapshotValue,items,item,art,yieldTask:()=>new Promise(r=>setTimeout(r,0)),cancelled:()=>token!==generation});
    if(token!==generation)break;rows.push(row);$('cal-progress').value++;refresh();
   }
   if(token===generation)$('cal-status').textContent=`${rows.length} proposals · ${rows.filter(r=>r.ready).length} meet all three difficulties. Use Review proposal to compare. This analysis made no edits; select only the changes you want.`;
  }catch(error){if(token===generation){$('cal-status').textContent=error.message;message(error.message,true);}}
  finally{if(token===generation){busy=false;refresh();}}
 }
 async function recheck(explicit=false){
  if(busy)return;clearTimeout(recheckTimer);recheckTimer=null;
  if(explicit){skipRecheck='';for(let i=0;i<rows.length;i++){const r=rows[i];if(!fresh(r)){const before=clone(draft.placement[r.id]);rows[i]={...r,before,placement:clone(before),beforeProfiles:{},profiles:{},profileStamps:{},changes:[],warnings:['Current settings checked; no geometry changes proposed.'],stamp:currentStamp(r),applied:false,reviewed:false,ready:false};}}}
  const candidates=pendingChecks();if(!candidates.length){refresh();return;}
  scene()?.stop();const token=++generation,copy=snapshot(),key=recheckKey();busy=true;
  $('cal-progress').max=candidates.length;$('cal-progress').value=0;refresh();
  try{for(const row of candidates){
   if(token!==generation)return;const item=find(row.id),reference=currentStamp(row),profiles=PROFILES.filter(p=>!profileFresh(row,p));
   $('cal-status').textContent=`Rechecking ${row.stage.toUpperCase()} · ${row.name} · ${profiles.join(', ')}…`;
   await new Promise(r=>setTimeout(r,0));if(token!==generation)return;
   const before=analyzeProfiles({config,draft:copy,items,item,placement:row.before,profiles}),after=analyzeProfiles({config,draft:copy,items,item,placement:row.placement,profiles});
   if(fresh(row)&&currentStamp(row)===reference&&reference===calibrationReferenceStamp(copy,item,config))for(const p of profiles){const stamp=timingProfileStamp(copy.calibration,item,p);if(stamp===timingProfileStamp(draft.calibration,item,p)){row.beforeProfiles[p]=before[p];row.profiles[p]=after[p];row.profileStamps[p]=stamp;}}
   row.ready=meetsAll(row.profiles);$('cal-progress').value++;refresh();
  }
  if(token===generation)$('cal-status').textContent='Rechecked affected results. No placement or hitbox settings were changed.';
  }catch(error){if(token===generation){skipRecheck=key;$('cal-status').textContent=error.message;message(error.message,true);}}
  finally{if(token===generation){busy=false;refresh();scene()?.refresh();}}
 }
 $('recheck-results').onclick=()=>recheck(true);
 function apply(stageOnly){
  const selected=rows.filter(r=>eligible(r)&&(!stageOnly||r.stage===getStage()));if(!selected.length)return;
  scene()?.stop();closeProposal();const placements=clone(draft.placement),cal=clone(draft.calibration);
  for(const r of selected){const h=cal.hazards[r.id];for(const [key,value] of Object.entries(r.placement))if(!h.locks.includes(key))placements[r.id][key]=value;}
  for(const r of selected)cal.hazards[r.id].stamp=r.ready?calibrationStamp({...draft,placement:placements,calibration:cal},find(r.id),config):'';
  draft.editCalibration(cal,placements);for(const r of selected){r.applied=true;r.appliedStamp=currentStamp(r);r.reviewed=false;}
  $('cal-status').textContent=`${rows.length} proposals · ${rows.filter(r=>r.applied).length} applied to the working draft. Remaining proposals are optional.`;
  changed();refresh();scene()?.refresh();message(`Applied ${selected.length} hazard proposals. Undo reverses this batch; Save all keeps it.`);
 }
 function editConfig(fn){scene()?.stop();const cal=clone(draft.calibration);try{fn(cal);draft.editCalibration(cal);scene()?.reset();changed();refresh();scene()?.refresh();}catch(error){message(error.message,true);refresh();}}
 $('pathway-y').onchange=()=>editConfig(c=>{if($('pathway-y').value.trim()==='')throw new Error('Enter a pathway Y.');c.stages[getStage()].pathY=Number($('pathway-y').value);});
 $('difficulty-profile').onchange=()=>editConfig(c=>c.profile=$('difficulty-profile').value);
 const labels={groundSpeed:'Ground speed · px/s',flyingSpeed:'Flying speed · px/s',minWindowMs:'Minimum input window · ms',spacingSeconds:'Minimum arrival spacing · s',reactionSeconds:'Reaction / action spacing · s',count:'Sequence hazard count',maxVisible:'Maximum visible hazards'};
 for(const [key,[min,max]] of Object.entries(PROFILE_FIELDS)){const label=document.createElement('label');label.className='field';label.textContent=labels[key];const input=document.createElement('input');Object.assign(input,{type:'number',min,max,step:key.includes('Seconds')?.1:1});input.dataset.profile=key;label.append(input);$('difficulty-fields').append(label);input.onchange=()=>editConfig(c=>{if(input.value.trim()==='')throw new Error('Enter a profile value.');c.profiles[c.profile][key]=Number(input.value);});}
 $('optimize-stage').onclick=()=>optimize(false);$('optimize-all').onclick=()=>optimize(true);$('cancel-optimization').onclick=()=>{generation++;busy=false;skipRecheck=recheckKey();clearTimeout(recheckTimer);recheckTimer=null;$('cal-status').textContent='Cancelled. Completed proposals remain available; no settings were applied.';if(!sequence)$('sequence-status').textContent='';refresh();};
 $('apply-stage').onclick=()=>apply(true);$('apply-reviewed').onclick=()=>apply(false);
 $('proposal-current').onclick=()=>{proposed=false;scene()?.reset();refresh();scene()?.refresh();};$('proposal-next').onclick=()=>{proposed=true;scene()?.reset();refresh();scene()?.refresh();};
 $('proposal-exit').onclick=()=>{closeProposal();refresh();changed();};
 for(const who of ['claude','constance'])$(`proposal-demo-${who}`).onclick=async()=>{if(!active||busy||!profileFresh(active,draft.calibration.profile))return;const flight=$('scene-flight').value,reports=(proposed?active.profiles:active.beforeProfiles)[draft.calibration.profile],report=reports.find(r=>r.flight===flight)||reports[0],best=report.characters[who].best;if(!best){message(`No safe ${report.action} window was found for ${who}. Adjust this hazard and recheck.`,true);return;}await scene().demonstrate(who,report.action,(best.start+best.end)/2);};
 $('generate-sequence').onclick=async()=>{
  scene()?.stop();closeProposal();sequence=null;scene()?.endSequence();const token=++generation,stage=getStage();$('cal-progress').max=hazards.filter(i=>i.stage===stage&&draft.calibration.hazards[i.id].enabled).length;$('cal-progress').value=0;$('sequence-status').textContent='Checking current settings and a continuous solution for both characters…';busy=true;refreshActions();
  try{await new Promise(r=>setTimeout(r,0));if(token!==generation)return;const reports=[],signature=JSON.stringify([draft.placement,draft.frames,draft.value,draft.calibration]);for(const item of hazards.filter(i=>i.stage===stage&&draft.calibration.hazards[i.id].enabled)){
    const rr=(item.kind==='flying'?['high','low']:['high']).map(flight=>analyzeHazard({config,draft,items,item,flight}));reports.push({id:item.id,stage,reports:rr,ready:rr.every(r=>r.pass)});$('cal-progress').value++;await new Promise(r=>setTimeout(r,0));if(token!==generation)return;if(signature!==JSON.stringify([draft.placement,draft.frames,draft.value,draft.calibration]))throw new Error('Settings changed during checking. Generate the sequence again.');
   }
   sequence=makeSequence({config,draft,items,reports,stage,seed:config.spawnDirector.seed});sequenceStamp=JSON.stringify([draft.placement,draft.frames,draft.value,draft.calibration]);
   $('sequence-status').textContent=`${sequence.profile} · ${sequence.events.length} hazards · ${Math.ceil(sequence.duration)} s. A complete action sequence clears both characters at 60 simulation steps/s.${sequence.excluded.length?' Excluded (timing target not met): '+sequence.excluded.map(id=>find(id).name).join(', ')+'.':''}`;
   $('sequence-list').replaceChildren(...sequence.events.map(e=>{const li=document.createElement('li');li.textContent=`${e.start.toFixed(1)} s · ${find(e.id).name} · ${e.action}`;return li;}));
  }catch(error){if(token===generation){sequence=null;$('sequence-status').textContent=error.message;message(error.message,true);}}finally{if(token===generation){busy=false;refresh();}}
 };
 $('play-sequence').onclick=async()=>{if(!sequence)return;const s=sequence;await navigate(s.events[0].id);scene().startSequence(s);refresh();};$('stop-sequence').onclick=()=>{scene()?.endSequence();refresh();};
 function checkStatus(item){
  const row=rows.find(r=>r.id===item.id);if(!row||!fresh(row))return null;
  if(!checksFresh(row))return 'Timing checks need refresh · shared settings unchanged';
  const reports=row.applied?row.profiles:row.beforeProfiles,failed=PROFILES.filter(p=>!meetsProfile(reports[p]));
  return failed.length?'Current settings need adjustment: '+failed.join(', '):'Current settings checked · all difficulties';
 }
 return {refresh,previewFor,checkStatus,isPreview:()=>Boolean(active&&fresh(active)),busy:()=>busy};
}
