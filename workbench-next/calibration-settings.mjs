export const CALIBRATION_VERSION=2;
export const PROFILES=['easy','standard','hard'];
export const AUTO_FIELDS=['groundOffset','highClearance','lowClearance','cw','ch','cx','cy'];
export const PROFILE_FIELDS={groundSpeed:[40,260],flyingSpeed:[50,320],minWindowMs:[16,600],spacingSeconds:[.5,8],reactionSeconds:[.5,6],count:[2,24],maxVisible:[1,2]};
const clone=v=>structuredClone(v);
export function calibrationDefaults(placement,stages,config){
 const ground=config?.worldSpeed||120,fly=config?.objectQA?.flying?.speed||170;
 const profile=(g,f,window,spacing,reaction,count,maxVisible)=>({groundSpeed:g,flyingSpeed:f,minWindowMs:window,spacingSeconds:spacing,reactionSeconds:reaction,count,maxVisible});
 return {version:1,profile:'standard',profiles:{easy:profile(ground,fly,150,2.6,2.8,6,1),standard:profile(ground,fly,120,1.75,2.2,8,2),hard:profile(ground*1.2,fly*1.2,80,1.1,1.6,12,2)},stages:Object.fromEntries(stages.map(s=>{const id=s.stage||s,originY=410+['claude','constance'].reduce((sum,who)=>sum+(placement[`character:${who}`]?.footOffset||0)+(placement[`grounding:${id}:${who}`]?.groundOffset||0),0)/2;return [id,{originY,pathY:originY}];})),hazards:Object.fromEntries(Object.entries(placement).filter(([id])=>id.startsWith('hazard:')).map(([id])=>[id,{follow:true,enabled:true,locks:[],stamp:''}]))};
}
export function validateCalibration(c,baseline,placement){
 const exact=(a,b)=>a&&typeof a==='object'&&!Array.isArray(a)&&Object.keys(a).sort().join('|')===Object.keys(b).sort().join('|');
 if(!exact(c,baseline)||c.version!==1||!Object.hasOwn(baseline.profiles,c.profile)||!exact(c.profiles,baseline.profiles)||!exact(c.stages,baseline.stages)||!exact(c.hazards,baseline.hazards))throw new Error('Invalid calibration configuration.');
 for(const p of Object.values(c.profiles)){if(!exact(p,baseline.profiles.standard))throw new Error('Invalid difficulty profile.');for(const [key,[min,max]] of Object.entries(PROFILE_FIELDS))if(!Number.isFinite(p[key])||p[key]<min||p[key]>max||(['count','maxVisible'].includes(key)&&!Number.isInteger(p[key])))throw new Error(`Invalid difficulty ${key}.`);}
 for(const p of Object.values(c.stages))if(!exact(p,{originY:0,pathY:0})||![p.originY,p.pathY].every(n=>Number.isFinite(n)&&n>=-200&&n<=1200))throw new Error('Pathway must be between -200 and 1200.');
 for(const [id,h] of Object.entries(c.hazards))if(!exact(h,{follow:0,enabled:0,locks:0,stamp:0})||typeof h.follow!=='boolean'||typeof h.enabled!=='boolean'||!Array.isArray(h.locks)||new Set(h.locks).size!==h.locks.length||h.locks.some(k=>!Object.hasOwn(placement[id],k))||typeof h.stamp!=='string'||h.stamp.length>100)throw new Error('Invalid hazard automation settings.');
 return c;
}
export const pathShift=(draft,stage,baseline=false)=>{const p=(baseline?draft.calibrationBaseline:draft.calibration)?.stages[stage];return p?p.pathY-p.originY:0;};
export function effectivePlacement(draft,item,baseline=false){
 const p=clone((baseline?draft.placementBaseline:draft.placement)[item.id]),cal=(baseline?draft.calibrationBaseline:draft.calibration);
 if(item.type==='hazard'&&cal?.hazards[item.id]?.follow){const d=pathShift(draft,item.stage,baseline);if(item.kind==='ground')p.groundOffset+=d;else{p.highClearance-=d;p.lowClearance-=d;}}
 return p;
}
export function profileConfig(config,calibration){const p=calibration?.profiles[calibration.profile];return p?{...config,worldSpeed:p.groundSpeed,objectQA:{...config.objectQA,flying:{...config.objectQA.flying,speed:p.flyingSpeed}}}:config;}
const fingerprint=value=>{const input=JSON.stringify(value);let h=2166136261;for(let i=0;i<input.length;i++)h=Math.imul(h^input.charCodeAt(i),16777619);return `cal2-${(h>>>0).toString(16)}`;};
// Profile selection and spawn density do not change a hazard's geometry or action window.
export function timingProfileStamp(calibration,item,profile){const p=calibration.profiles[profile];return fingerprint([item.kind==='flying'?p.flyingSpeed:p.groundSpeed,p.minWindowMs]);}
export function calibrationStamp(draft,item,config){return fingerprint([calibrationReferenceStamp(draft,item,config),PROFILES.map(profile=>timingProfileStamp(draft.calibration,item,profile))]);}
export function calibrationReferenceStamp(draft,item,config){
 const chars=Object.fromEntries(Object.entries(draft.placement).filter(([id])=>id.startsWith('character:')||id.startsWith(`grounding:${item.stage}:`)));
 const characterFrames=Object.fromEntries(Object.entries(draft.frames).filter(([id])=>id.startsWith('character:'))),characterCrops=Object.fromEntries(Object.entries(draft.value).filter(([id])=>id.startsWith('character:')));
 return fingerprint([CALIBRATION_VERSION,chars,characterFrames,characterCrops,draft.placement[item.id],draft.frames[item.id],draft.value[item.id],draft.provenance?.assets[item.asset],draft.calibration.stages[item.stage],draft.calibration.hazards[item.id].follow,draft.calibration.hazards[item.id].locks,config.jump,config.actions,config.state,config.visibleMeta]);
}
