'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const {ASSET_KEYS,validateAssetHandoff}=require('../src/js/asset-handoff-contract.js');
const {validatePng}=require('./png-integrity.cjs');
function expectedPaths(stageId,root=ROOT){
  const plan=JSON.parse(fs.readFileSync(path.join(root,'config/remaining-continent-proposal.json'),'utf8'));
  const stage=plan.stages.find(item=>item.id.toLowerCase()===stageId.toLowerCase());
  if(!stage)throw new Error(`Unknown expansion stage ${stageId}`);
  return {FAR:stage.landscapes.FAR.path,MID:stage.landscapes.MID.path,GROUND:stage.landscapes.GROUND.path,OBJECT_ATLAS:stage.groundAtlas,FLYING:stage.hazards.FLYING.path};
}
function validateBundleFile(file,{root=ROOT}={}){
  const absolute=path.resolve(root,file),bundle=JSON.parse(fs.readFileSync(absolute,'utf8'));
  const paths=expectedPaths(bundle.stageId,root);
  validateAssetHandoff(bundle,{expectedPaths:paths});
  for(const key of ASSET_KEYS){
    const asset=bundle.assets[key];
    validatePng(bundle.stageId,key,{validation:asset.path,width:asset.width,height:asset.height,...(key==='FAR'?{colorTypes:[2,6]}:{colorType:6})},root);
    const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,asset.path))).digest('hex');
    if(actual!==asset.sha256)throw new Error(`${bundle.stageId}/${key}: handoff hash does not match ${asset.path}`);
  }
  execFileSync('python',['scripts/hazard-atlas-qa.py',bundle.assets.OBJECT_ATLAS.path],{cwd:root,stdio:['ignore','pipe','pipe']});
  execFileSync('python',['scripts/hazard-atlas-qa.py',bundle.assets.FLYING.path,'--flying'],{cwd:root,stdio:['ignore','pipe','pipe']});
  for(const evidence of [bundle.evidence,bundle.existingAcceptance?.evidence].filter(Boolean))if(!fs.existsSync(path.join(root,evidence)))throw new Error(`${bundle.stageId}: missing evidence ${evidence}`);
  return {stageId:bundle.stageId,readiness:bundle.readiness,bundle:path.relative(root,absolute),assets:ASSET_KEYS.length,downstream:bundle.downstream};
}
function validateCommitted({root=ROOT}={}){
  const directory=path.join(root,'config/asset-handoffs');
  if(!fs.existsSync(directory))return [];
  const files=fs.readdirSync(directory).filter(file=>file.endsWith('.json')).sort();
  return files.map(file=>validateBundleFile(path.join('config/asset-handoffs',file),{root}));
}
if(require.main===module)try{
  const file=process.argv[2];
  const result=file?validateBundleFile(file):validateCommitted();
  console.log(JSON.stringify(result,null,2));
}catch(error){console.error(error.message);process.exitCode=1;}
module.exports={expectedPaths,validateBundleFile,validateCommitted};
