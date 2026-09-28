import {analyzeHazard,makeSequence} from './calibration-engine.mjs';
import {calibrationStamp} from './calibration-settings.mjs';
import {runtimeSnapshot,PlayRuntime,drawRuntime,runtimeAssetKeys} from './play-runtime.mjs';
import {secretSnapshot,SecretRuntime} from './secret-runtime.mjs';
import {drawSecret} from './secret-renderer.mjs';
let secretData;
export async function loadSecretData(){
 secretData??=Promise.all(['asset_manifest.json','encounter_config.json'].map(async f=>{const r=await fetch('../assets/secret-level/'+f);if(!r.ok)throw Error('Could not load secret level metadata.');return r.json();})).catch(e=>{secretData=null;throw e;});return secretData;
}
export async function loadLevel(options,loader,{unlimitedLives=false}={}){
 const secret=options.stage.toLowerCase()==='secret01';let snapshot,records;
 if(secret){const [manifest,tuning]=await loadSecretData();snapshot=secretSnapshot(options,manifest,tuning);records=Object.entries(manifest.assets).map(([name,m])=>['secret:'+name,'../assets/secret-level/'+name,m.sha256,{width:m.width,height:m.height}]);
  records.push(...[...new Set([...snapshot.items.map(i=>i.asset),'stars','hudHearts','hudCharacters','hudPath'])].map(key=>[key,options.catalog.assets[key],options.catalog.hashes[key],options.catalog.dimensions[key]]));
 }else{
  const hazards=options.items.filter(i=>i.type==='hazard'&&i.stage===options.stage&&options.draft.calibration.hazards[i.id].enabled);
  if(hazards.length&&hazards.every(i=>options.draft.calibration.hazards[i.id].stamp===calibrationStamp(options.draft,i,options.config))){
   // Every Game entry uses the same checked encounter planner as Design, even
   // when the author never opened the sequence-preview controls for this stage.
   await new Promise(r=>setTimeout(r,0));
   const draft={...options.draft,calibration:{...options.draft.calibration,profile:options.difficulty}};
   const reports=hazards.map(item=>{const reports=(item.kind==='flying'?['high','low']:['high']).map(flight=>analyzeHazard({...options,draft,item,flight}));return {id:item.id,stage:item.stage,reports,ready:reports.every(r=>r.pass)};});
   if(reports.some(r=>!r.ready))throw Error('Stage calibration changed. Save All in Design to update its timing.');
   options={...options,sequence:makeSequence({...options,draft,reports,seed:options.config.spawnDirector.seed})};
  }
  snapshot=runtimeSnapshot(options);records=runtimeAssetKeys(snapshot).map(key=>[key,options.catalog.assets[key],options.catalog.hashes[key],options.catalog.dimensions[key]]);}
 const loaded=await Promise.all(records.map(async([key,source,hash,size])=>{if(!source)throw Error('Missing asset: '+key);const image=await loader.load(source+(source.includes('?')?'&':'?')+'runtime='+hash);if(size&&(image.naturalWidth!==size.width||image.naturalHeight!==size.height))throw Error('Unexpected image size: '+key);return [key,image];}));
 return {run:secret?new SecretRuntime(snapshot,{unlimitedLives}):new PlayRuntime(snapshot,{unlimitedLives}),images:Object.fromEntries(loaded)};
}
export function drawLevel(canvas,run,images,contract,options={}){return run.kind==='secret'?drawSecret(canvas,run,images,options):drawRuntime(canvas,run,images,contract,options);}
