import {measureArtwork,optimizeHazard,analyzeProfiles,meetsAll,meetsProfile} from './calibration-engine.mjs';
import {PROFILES,calibrationStamp,timingProfileStamp,calibrationReferenceStamp} from './calibration-settings.mjs';
const clone=v=>structuredClone(v);
export const optimizationSignature=d=>JSON.stringify([d.placement,d.frames,d.value,d.calibration,d.landscapes,d.stageSettings]);
const pause=()=>new Promise(r=>setTimeout(r,0));

// Work against a detached candidate. Cancellation, an image error or an edit made
// while calculating cannot partially replace the user's working configuration.
export async function prepareOptimization({config,draft,items,measure,stage=null,force=false,onProgress=()=>{},cancelled=()=>false,yieldTask=pause}){
 const signature=optimizationSignature(draft),copy={...draft,placement:clone(draft.placement),frames:clone(draft.frames),value:clone(draft.value),calibration:clone(draft.calibration)},rows=[];
 const hazards=items.filter(i=>i.type==='hazard'&&(!stage||i.stage===stage)&&copy.calibration.hazards[i.id].enabled);
 const candidates=hazards.filter(i=>force||copy.calibration.hazards[i.id].stamp!==calibrationStamp(copy,i,config));
 const check=()=>{if(cancelled())throw Error('Optimization cancelled. Your settings were kept.');if(signature!==optimizationSignature(draft))throw Error('Settings changed during optimization. Your edits were kept; save again to recalculate them.');};
 for(const [index,item] of candidates.entries()){
  check();onProgress({item,index,total:candidates.length});await yieldTask();
  const original=clone(copy.placement[item.id]),policy=copy.calibration.hazards[item.id],oldPolicy=clone(policy);
  // Derived speeds are recalculated from the chosen global profile every time.
  delete policy.speeds;policy.stamp='';
  const art=await measure(item,copy);check();
  let row=await optimizeHazard({config,draft:copy,items,item,art,yieldTask,cancelled});
  copy.placement[item.id]=clone(row.placement);
  const solveSpeeds=async()=>{
   const speeds={},reports={};
   for(const profile of PROFILES){
    const base=copy.calibration.profiles[profile][item.kind==='flying'?'flyingSpeed':'groundSpeed'];
    // Keep the requested speed when it works. Wider obstacles can require faster
    // passage to fit within a jump; reducing speed alone is not a general solution.
    const minimum=Math.max(40,...Object.values(speeds)),choices=[base,minimum,...[1.1,.9,1.2,1.35,1.5,1.75,2,2.25,2.5,3,.8,.7].map(f=>base*f)].map(n=>Math.max(minimum,Math.min(640,Math.round(n))));
    let found=false;
    for(const speed of [...new Set(choices)]){
     check();policy.speeds={easy:base,standard:base,hard:base,...speeds,[profile]:speed};
     const r=analyzeProfiles({config,draft:copy,items,item,profiles:[profile]})[profile];
     if(meetsProfile(r)){speeds[profile]=speed;reports[profile]=r;found=true;break;}
     await yieldTask();
    }
    if(!found)return null;
   }
   policy.speeds=speeds;return reports;
  };
  let reports=meetsAll(row.profiles)?row.profiles:await solveSpeeds();
  if(!reports&&!policy.locks.includes('scale')){
   // A bounded artwork-size search is preferable to ever-smaller hitboxes.
   for(const factor of [.9,.8,.7]){
    check();delete policy.speeds;copy.placement[item.id]={...original,scale:Math.max(.02,original.scale*factor)};
    row=await optimizeHazard({config,draft:copy,items,item,art,yieldTask,cancelled});copy.placement[item.id]=clone(row.placement);
    reports=meetsAll(row.profiles)?row.profiles:await solveSpeeds();if(reports)break;
   }
  }
  if(reports){
   policy.stamp=calibrationStamp(copy,item,config);
  }else{
   copy.placement[item.id]=original;copy.calibration.hazards[item.id]={...oldPolicy,stamp:''};delete copy.calibration.hazards[item.id].speeds;
   reports=analyzeProfiles({config,draft:copy,items,item});
  }
  const ready=meetsAll(reports),locks=policy.locks.join(', ');
  rows.push({...row,before:original,placement:clone(copy.placement[item.id]),profiles:reports,ready,applied:ready,
   profileStamps:Object.fromEntries(PROFILES.map(p=>[p,timingProfileStamp(copy.calibration,item,p)])),
   appliedStamp:calibrationReferenceStamp(copy,item,config),stamp:calibrationReferenceStamp(copy,item,config),
   issue:ready?'':`${item.name}: no safe solution within the supported size/speed range${locks?'; retained overrides: '+locks:''}. Existing placement kept.`});
 }
 check();onProgress({index:candidates.length,total:candidates.length});
 return {signature,placement:copy.placement,calibration:copy.calibration,rows,checked:candidates.length,unchanged:hazards.length-candidates.length};
}

export function applyOptimization(draft,plan,storage=null){
 if(plan.signature!==optimizationSignature(draft))throw Error('Settings changed during optimization. Save again to recalculate your latest edits.');
 const placement=draft.placement,calibration=draft.calibration,past=[...draft.past],future=[...draft.future];
 try{draft.editCalibration(plan.calibration,plan.placement);if(storage)draft.save(storage);}
 catch(error){draft.placement=placement;draft.calibration=calibration;draft.past=past;draft.future=future;throw error;}
 return plan;
}
export const artworkMeasurer=(loader,catalog)=>async(item,draft)=>measureArtwork(await loader.load(catalog.assets[item.asset]),item,draft);
