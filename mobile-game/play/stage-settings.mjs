// Authoring choices are separate from derived collision calibration.
export const FINISH_PLACEMENT_VERSION=3;
// Measured visible base (alpha > 32) of the original 1211 × 1299 finish PNG.
export const FINISH_BASE_RATIO=1238/1299;
export function stageSettingsDefaults(config,stages){return Object.fromEntries(stages.map(s=>[s.stage,{finish:{groundOffset:0,xOffset:config?.finish?.stages?.[s.stage]?.xOffset??0,scale:.22},combinations:{length:0,holdSeconds:0,density:1,patterns:['jump-slide','repeat-jump','mixed','hold-slide']}}]));}
export function upgradeFinishSettings(settings,config,baseline,previousVersion){
 const value=structuredClone(settings);
 for(const [stage,ss] of Object.entries(value)){
  const old=config.finish.stages[stage];
  // User requested every stage be realigned, including previously retained Y offsets.
  ss.finish.groundOffset=0;
  if(previousVersion===undefined&&ss.finish.scale===old.scale)ss.finish.scale=baseline[stage].finish.scale;
 }
 return value;
}
export function validateStageSettings(value,baseline){
 if(!value||JSON.stringify(Object.keys(value).sort())!==JSON.stringify(Object.keys(baseline).sort()))throw Error('Invalid stage settings.');
 for(const settings of Object.values(value)){
  if(Object.keys(settings).sort().join()!=='combinations,finish')throw Error('Invalid stage settings fields.');
  for(const [group,ranges] of Object.entries({finish:{groundOffset:[-300,300],xOffset:[-300,300],scale:[.02,5]},combinations:{length:[0,4],holdSeconds:[0,4],density:[.5,1.5]}})){
   if(!settings[group]||Object.keys(settings[group]).filter(k=>group!=='combinations'||k!=='patterns').sort().join()!==Object.keys(ranges).sort().join())throw Error('Invalid '+group+' fields.');
   for(const [key,[min,max]] of Object.entries(ranges)){const n=settings[group][key];if(!Number.isFinite(n)||n<min||n>max||(key==='length'&&!Number.isInteger(n)))throw Error('Invalid '+key+'.');}
  }
  const patterns=settings.combinations.patterns;if(!Array.isArray(patterns)||!patterns.length||new Set(patterns).size!==patterns.length||patterns.some(p=>!['jump-slide','repeat-jump','mixed','hold-slide'].includes(p)))throw Error('Choose at least one supported combination.');
 }
 return value;
}
export function finishGeometry(config,draft,stage,time,duration,speed,image,characterGroundY){
 if(!Number.isFinite(characterGroundY))throw new Error('Finish requires the character ground guide.');
 const finish=draft.stageSettings?.[stage]?.finish??config.finish.stages[stage];
 const remaining=Math.max(0,duration-time),scale=config.canvas.w/config.worldContract.sourceW*finish.scale;
 const w=image.width*scale,h=image.height*scale;
 // Horizontal artwork adjustment is introduced on approach and reaches zero
 // at the finish: the flag always crosses the player at the 90-second mark.
 const approach=Math.min(1,remaining/config.spawnDirector.finishRelease);
 return {x:config.characterX+remaining*speed+finish.xOffset*approach-w/2,y:characterGroundY+finish.groundOffset-h*FINISH_BASE_RATIO,w,h,baseY:characterGroundY+finish.groundOffset};
}
