'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const {validatePng}=require('./png-integrity.cjs');
const {validateRelease}=require('../src/js/stage-contract.js');
const {validateCommitted}=require('./validate-asset-handoff.cjs');
const {createValidationCache}=require('./validation-cache.cjs');
const VALIDATOR_DEPENDENCIES=['scripts/validation-cache.cjs','scripts/png-integrity.cjs','scripts/hazard-atlas-qa.py','scripts/validate-stage-assets.cjs','src/js/stage-contract.js'].map(file=>path.join(ROOT,file));
// Release/path checks remain live; only effective per-file geometry keys cached image checks.
const CANONICAL_CONFIG=[];
function validate(id,release,{root=ROOT}={}){
  id=id.toLowerCase();
  const plan=JSON.parse(fs.readFileSync(path.join(root,'config/remaining-continent-proposal.json')));
  const s=plan.stages.find(s=>s.id.toLowerCase()===id);if(!s)throw new Error(`Unknown expansion stage ${id}`);
  const files={...Object.fromEntries(['FAR','MID','GROUND'].map(k=>[k,s.landscapes[k].path])),OBJECT_ATLAS:s.groundAtlas,FLYING:s.hazards.FLYING.path};
  if(release)validateRelease({id,files,release});
  const result={stage:id,assets:{}};
  const cache=createValidationCache({root});
  for(const [key,file] of Object.entries(files)){
    const spec={validation:file,width:2172,height:724,...(key==='FAR'?{colorTypes:[2,6]}:{colorType:6})};
    const sha256=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
    if(release&&release.assets[key].sha256!==sha256)throw new Error(`${id}/${key}: reviewed bytes changed`);
    cache.run({validator:'png-integrity',files:[file],metadata:{stageId:id,key,spec},dependencies:VALIDATOR_DEPENDENCIES,canonicalConfig:CANONICAL_CONFIG},()=>validatePng(id,key,spec,root));
    result.assets[key]={path:file,sha256};
    if(key==='OBJECT_ATLAS'||key==='FLYING')result[key]=cache.run({validator:'hazard-atlas-qa',files:[file],metadata:{stageId:id,key,flying:key==='FLYING'},dependencies:VALIDATOR_DEPENDENCIES,canonicalConfig:CANONICAL_CONFIG},()=>JSON.parse(execFileSync('python',['scripts/hazard-atlas-qa.py',file,...(key==='FLYING'?['--flying']:[])],{cwd:root,encoding:'utf8'}))).value;
  }
  return result;
}
if(require.main===module){try{
  const records=JSON.parse(fs.readFileSync(path.join(ROOT,'config/stage-releases.json'))).stages;
  const ids=process.argv[2]?[process.argv[2].toLowerCase()]:Object.keys(records);
  for(const id of ids){validate(id,records[id]);console.log(`Full-stage assets OK: ${id}`);}
  const handoffs=validateCommitted();
  for(const item of handoffs)console.log(`Asset-ready handoff OK: ${item.stageId}`);
}catch(error){console.error(error.stderr?.toString().trim()||error.message);process.exitCode=1;}}
module.exports={validate};
