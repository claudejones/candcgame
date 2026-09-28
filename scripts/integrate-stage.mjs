// Coordinator only. Assemble a complete measured stage; never invent calibration.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {ROOT,resolve} from './assets.mjs';
const require=createRequire(import.meta.url),{validate}=require('./validate-stage-assets.cjs');
export function integrate(command,release){
  const packet=resolve(command);
  if(!packet.generationAllowed||!packet.jobs?.length)throw new Error('Integration requires an eligible explicit production/revision command');
  const id=packet.target.toLowerCase(),records=JSON.parse(fs.readFileSync(path.join(ROOT,'config/stage-releases.json'))),old=records.stages[id];
  const report=validate(id,release);
  const selected=new Set(packet.jobs.map(j=>j.output));
  if(old)for(const [key,asset] of Object.entries(old.assets))if(!selected.has(asset.path)&&asset.sha256!==report.assets[key].sha256)throw new Error(`Unselected asset changed: ${key}`);
  if(old&&packet.family!=='stage'){
    const selectedHazards=new Set(packet.jobs.flatMap(j=>j.selectedHazards||[]));
    for(const [index,key] of ['GROUND1','GROUND2','FLYING'].entries())if(!selectedHazards.has(key)&&JSON.stringify(old.hazards[index])!==JSON.stringify(release.hazards[index]))throw new Error(`Unselected hazard metadata changed: ${key}`);
    if(JSON.stringify(old.finish)!==JSON.stringify(release.finish))throw new Error('Unselected finish metadata changed');
  }
  // Single-ground-cell revisions require byte comparison to the recorded approved snapshot.
  for(const job of packet.jobs)if(job.preserveSibling){
    if(!old)throw new Error('Single-cell revision requires a prior integrated atlas');
    const before=execFileSync('git',['show',`HEAD:${job.output}`],{cwd:ROOT,maxBuffer:32*1024*1024});
    if(crypto.createHash('sha256').update(before).digest('hex')!==old.assets.OBJECT_ATLAS.sha256)throw new Error('Recover the prior atlas revision before one-cell integration');
    execFileSync('python',['-c',`import io,sys\nfrom PIL import Image\nold=Image.open(io.BytesIO(sys.stdin.buffer.read())).convert('RGBA')\nnew=Image.open(sys.argv[1]).convert('RGBA')\ni=int(sys.argv[2]); box=(i*1086,0,(i+1)*1086,724)\nassert old.size==new.size==(2172,724), 'Atlas dimensions changed'\nassert old.crop(box).tobytes()==new.crop(box).tobytes(), 'Unselected sibling pixels changed'`,path.join(ROOT,job.output),job.preserveSibling==='GROUND1'?'0':'1'],{input:before});
  }
  const registryFile=path.join(ROOT,'config/phase8-landscapes.json'),registry=JSON.parse(fs.readFileSync(registryFile));
  for(const key of ['FAR','MID','GROUND'])registry.stages[id].layers[key.toLowerCase()].cacheKey=report.assets[key].sha256.slice(0,8);
  registry.stages[id].status='integrated';records.stages[id]={...release,status:'integrated'};
  const recordsFile=path.join(ROOT,'config/stage-releases.json'),originalRegistry=fs.readFileSync(registryFile),originalRecords=fs.readFileSync(recordsFile);
  try{
    fs.writeFileSync(registryFile,JSON.stringify(registry,null,2)+'\n');
    fs.writeFileSync(recordsFile,JSON.stringify(records,null,2)+'\n');
    require('./sync-landscape-registry.cjs').sync();
  }catch(error){fs.writeFileSync(registryFile,originalRegistry);fs.writeFileSync(recordsFile,originalRecords);require('./sync-landscape-registry.cjs').sync();throw error;}
  return {stage:packet.target,state:'integrated-not-approved',next:'Run targeted landscape/runtime/composite and stage checks, deploy, then request the single complete-stage review.'};
}
if(process.argv[1]===new URL(import.meta.url).pathname){try{
  if(!process.argv[2]||!process.argv[3])throw new Error('Use integrate-stage.mjs "build stage AF01" <measured-release.json>');
  console.log(JSON.stringify(integrate(process.argv[2],JSON.parse(fs.readFileSync(process.argv[3])))));
}catch(error){console.error(error.message);process.exitCode=1;}}
