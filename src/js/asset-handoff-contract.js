/* Shared, side-effect-free asset-ready handoff validation for production and Workbench. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.CC_ASSET_HANDOFF_CONTRACT=api;
})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  const SCHEMA_VERSION=1;
  const ASSET_KEYS=Object.freeze(['FAR','MID','GROUND','OBJECT_ATLAS','FLYING']);
  const FACING=Object.freeze(['none','left','right']);
  const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
  const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
  const finite=value=>Number.isFinite(value);
  function fail(message){throw new Error(`Asset handoff: ${message}`);}
  function exactKeys(value,keys,label){
    if(!object(value))fail(`${label} must be an object`);
    const actual=Object.keys(value).sort(),expected=[...keys].sort();
    if(actual.length!==expected.length||actual.some((key,index)=>key!==expected[index]))fail(`${label} must contain exactly ${expected.join(', ')}`);
  }
  function point(value,label){if(!object(value)||!finite(value.x)||!finite(value.y))fail(`${label} must contain finite x/y`);}
  function box(value,label){
    if(!object(value)||!['x','y','w','h'].every(key=>finite(value[key])))fail(`${label} must contain finite x/y/w/h`);
    if(value.w<=0||value.h<=0)fail(`${label} dimensions must be positive`);
  }
  function crop(value,label){
    if(value===undefined)return;
    if(!object(value)||!['l','r','t','b'].every(key=>finite(value[key])&&value[key]>=0))fail(`${label} must contain non-negative l/r/t/b`);
  }
  function cropFits(value,source,anchor,label){
    const item=value??{l:0,r:0,t:0,b:0};
    if(item.l+item.r>=source.w||item.t+item.b>=source.h)fail(`${label} leaves no visible area`);
    if(item.l>anchor.x||source.w-item.r<=anchor.x||item.t>anchor.y||source.h-item.b<=anchor.y)fail(`${label} excludes the source anchor`);
  }
  function relativePath(value,label){
    if(typeof value!=='string'||!value||value.startsWith('/')||value.includes('\\')||value.split('/').includes('..'))fail(`${label} must be a safe repository-relative path`);
  }
  function facing(hazard,index){
    const source=hazard.sourceFacing,gameplay=hazard.gameplayFacing;
    if(!FACING.includes(source)||!FACING.includes(gameplay))fail(`hazards[${index}] has invalid facing`);
    if((source==='none')!==(gameplay==='none'))fail(`hazards[${index}] cannot mix directed and none facing`);
    const flipped=source!=='none'&&source!==gameplay;
    if(flipped&&hazard.flipX!==true)fail(`hazards[${index}] facing change requires flipX true`);
    if(!flipped&&hazard.flipX===true)fail(`hazards[${index}] flipX conflicts with facing`);
    if(hazard.flipX!==undefined&&typeof hazard.flipX!=='boolean')fail(`hazards[${index}] flipX must be boolean`);
  }
  function hazard(value,index,stageId){
    if(!object(value)||typeof value.name!=='string'||!value.name.trim())fail(`hazards[${index}] requires a name`);
    const ground=index<2,kind=ground?'ground':'flying';
    if(value.kind!==kind||value.atlasKey!==stageId+(ground?'Hazards':'Bird'))fail(`hazards[${index}] identity does not match ${kind}`);
    if(!finite(value.scale)||value.scale<=0)fail(`hazards[${index}] requires a positive provisional scale`);
    point(value.sourceAnchor,`hazards[${index}].sourceAnchor`);
    const expectedAnchor=ground?{x:543,y:620}:{x:271,y:362};
    if(value.sourceAnchor.x!==expectedAnchor.x||value.sourceAnchor.y!==expectedAnchor.y)fail(`hazards[${index}] source anchor is not canonical`);
    const source=ground?value.rect:{x:0,y:0,w:value.frameW,h:value.frameH};
    box(source,`hazards[${index}] source region`);
    const expected=ground?{x:index*1086,y:0,w:1086,h:724}:{x:0,y:0,w:543,h:724};
    if(Object.keys(expected).some(key=>source[key]!==expected[key]))fail(`hazards[${index}] source region is not canonical`);
    if(!ground&&(!Number.isInteger(value.frames)||value.frames!==4||!finite(value.fps)||value.fps<=0))fail('flying hazard requires four frames and a positive fps');
    crop(value.crop,`hazards[${index}].crop`);
    cropFits(value.crop,source,value.sourceAnchor,`hazards[${index}].crop`);
    if(value.frameCrops!==undefined){if(!Array.isArray(value.frameCrops)||value.frameCrops.length!==(value.frames||1))fail(`hazards[${index}].frameCrops length mismatch`);value.frameCrops.forEach((item,i)=>{crop(item,`hazards[${index}].frameCrops[${i}]`);cropFits(item,source,value.sourceAnchor,`hazards[${index}].frameCrops[${i}]`);});}
    for(const key of ['cw','ch','cx','cy'])if(!finite(value[key]))fail(`hazards[${index}].${key} must be finite provisional metadata`);
    if(value.cw<=0||value.ch<=0||value.cw>1||value.ch>1)fail(`hazards[${index}] provisional bounds must be normalized`);
    if(value.groundOffset!==undefined&&!finite(value.groundOffset))fail(`hazards[${index}].groundOffset must be finite`);
    if(value.flightOffsetY!==undefined){if(!object(value.flightOffsetY)||!finite(value.flightOffsetY.high)||!finite(value.flightOffsetY.low))fail(`hazards[${index}].flightOffsetY must contain finite high/low`);}
    facing(value,index);
    if(!ground&&(value.sourceFacing!=='right'||value.gameplayFacing!=='left'))fail('flying hazard must preserve right-facing source art and face left in gameplay');
  }
  function validateAssetHandoff(bundle,options={}){
    if(!object(bundle))fail('bundle must be an object');
    const topLevel=['schemaVersion','stageId','readiness','downstream','assets','landscape','hazards','checks','evidence'];
    if(own(bundle,'knownIssues'))topLevel.push('knownIssues');
    if(own(bundle,'existingAcceptance'))topLevel.push('existingAcceptance');
    exactKeys(bundle,topLevel,'bundle');
    if(bundle.schemaVersion!==SCHEMA_VERSION)fail(`schemaVersion must be ${SCHEMA_VERSION}`);
    if(!/^[a-z]{2}\d{2}$/.test(bundle.stageId||''))fail('stageId must be lowercase, for example af02');
    if(options.expectedStageId&&bundle.stageId!==String(options.expectedStageId).toLowerCase())fail(`expected stageId ${String(options.expectedStageId).toLowerCase()}`);
    if(bundle.readiness!=='asset-ready')fail('readiness must be asset-ready');
    exactKeys(bundle.downstream,['calibration','release'],'downstream');
    if(bundle.downstream.calibration!=='pending'||bundle.downstream.release!=='pending')fail('calibration and release must remain pending');
    exactKeys(bundle.assets,ASSET_KEYS,'assets');
    for(const key of ASSET_KEYS){
      const asset=bundle.assets[key];
      if(!object(asset))fail(`assets.${key} must be an object`);
      exactKeys(asset,['height','path','sha256','width'],`assets.${key}`);
      relativePath(asset.path,`assets.${key}.path`);
      if(options.expectedPaths?.[key]!==undefined&&asset.path!==options.expectedPaths[key])fail(`assets.${key}.path does not match the canonical stage path`);
      if(!/^[a-f0-9]{64}$/.test(asset.sha256||''))fail(`assets.${key}.sha256 must be lowercase SHA-256`);
      if(asset.width!==2172||asset.height!==724)fail(`assets.${key} must be 2172x724`);
    }
    const landscape=bundle.landscape;
    if(!object(landscape)||landscape.contractVersion!=='phase8-landscape-1')fail('landscape contractVersion is invalid');
    if(landscape.source?.width!==2172||landscape.source?.height!==724)fail('landscape source must be 2172x724');
    const viewport=landscape.viewport;
    if(viewport?.width!==960||viewport?.height!==540||viewport?.groundSurfaceY!==410)fail('landscape viewport must be 960x540 with ground surface 410');
    exactKeys(landscape.layers,['FAR','MID','GROUND'],'landscape.layers');
    const canonical={FAR:{sourceY:0,scale:1.25},MID:{sourceAnchorY:621,offsetY:0,scale:1},GROUND:{sourceAnchorY:393,offsetY:0,scale:1}};
    for(const key of Object.keys(canonical))for(const [field,expected]of Object.entries(canonical[key]))if(landscape.layers[key]?.[field]!==expected)fail(`landscape.layers.${key}.${field} must be ${expected}`);
    if(!Array.isArray(bundle.hazards)||bundle.hazards.length!==3)fail('hazards must contain exactly three entries');
    bundle.hazards.forEach((value,index)=>hazard(value,index,bundle.stageId));
    if(new Set(bundle.hazards.map(item=>item.name)).size!==3)fail('hazard names must be unique');
    exactKeys(bundle.checks,['animation','basicRendering','composition','technical'],'checks');
    for(const key of Object.keys(bundle.checks))if(bundle.checks[key]!==true)fail(`checks.${key} must be true`);
    relativePath(bundle.evidence,'evidence');
    if(bundle.knownIssues!==undefined&&(!Array.isArray(bundle.knownIssues)||bundle.knownIssues.some(item=>typeof item!=='string'||!item.trim())))fail('knownIssues must be non-empty strings');
    if(bundle.existingAcceptance!==undefined){
      exactKeys(bundle.existingAcceptance,['evidence','status'],'existingAcceptance');
      if(bundle.existingAcceptance.status!=='approved')fail('existingAcceptance.status must be approved');
      relativePath(bundle.existingAcceptance.evidence,'existingAcceptance.evidence');
    }
    return true;
  }
  return Object.freeze({SCHEMA_VERSION,ASSET_KEYS,FACING,validateAssetHandoff});
});
