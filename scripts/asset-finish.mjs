// Single-agent completion: no worker state, history scans, generation, or network.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {expectedPaths,validateBundleFile}=require('./validate-asset-handoff.cjs');
export const keys=['FAR','MID','GROUND','OBJECT_ATLAS','FLYING'];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');

export function sourceBytes(root,source) {
  if (!/^[a-f0-9]{64}$/.test(source?.sha256 || '')) throw new Error('Source requires a SHA-256');
  if (source.git) {
    if (!/^[a-f0-9]{40}$/.test(source.git.commit) || !source.git.path || source.git.path.startsWith('/') || source.git.path.split('/').includes('..')) throw new Error('Source requires a pinned commit and safe repository path');
    return execFileSync('git',['show',`${source.git.commit}:${source.git.path}`],{cwd:root,maxBuffer:32*1024*1024,stdio:['ignore','pipe','pipe']});
  }
  if (!path.isAbsolute(source.local || '')) throw new Error('Local source requires an absolute path');
  return fs.readFileSync(source.local);
}

export function finishView(root,stageId,{verify=false}={}) {
  if (!/^(AF|AS|OC|AN)0[1-3]$/.test(stageId)) throw new Error('Finish is for expansion-stage asset handoffs only');
  const manifestPath=`config/asset-finish/${stageId.toLowerCase()}.json`;
  if (!fs.existsSync(path.join(root,manifestPath))) return {stageId,state:'manifest-needed',generationAllowed:false,nextAction:`Create ${manifestPath} from known saved files; no automatic regeneration.`};
  const manifest=JSON.parse(fs.readFileSync(path.join(root,manifestPath),'utf8'));
  if (manifest.version!==1 || manifest.stageId!==stageId || keys.some(k=>!manifest.assets?.[k]) || Object.keys(manifest.assets).length!==5) throw new Error('Finish manifest requires exactly five selected assets');
  const paths=expectedPaths(stageId,root),assets=[];
  for (const key of keys) {
    const item=manifest.assets[key];
    if (item.output!==paths[key]) throw new Error(`${key}: output differs from canonical path`);
    try {
      const bytes=sourceBytes(root,item.source);
      if (hash(bytes)!==item.source.sha256) throw new Error('saved source hash changed');
      const finalPath=path.join(root,item.output);
      const installed=fs.existsSync(finalPath) && hash(fs.readFileSync(finalPath))===item.source.sha256;
      assets.push({key,state:installed?'selected-bytes-installed':'source-verified',durable:Boolean(item.source.git),source:item.source.git || item.source.local,nextAction:item.nextAction || 'Check selected image and record evidence'});
    } catch(error) { assets.push({key,state:'recovery-blocked',reason:error.message.split('\n')[0],nextAction:'Recover this exact source; do not regenerate automatically'}); }
  }
  const bundle=`config/asset-handoffs/${stageId.toLowerCase()}.json`;
  let handoff={state:'pending',path:bundle,...(verify?{reason:'Install the selected bytes and update manifest hashes before handoff verification'}:{})};
  if (verify && assets.every(a=>a.state==='selected-bytes-installed')) {
    try { handoff={state:'validated',...validateBundleFile(bundle,{root})}; }
    catch(error) {handoff={state:'blocked',path:bundle,reason:(error.stderr?.toString() || error.message).trim().slice(0,600)};}
  }
  return {stageId,manifest:manifestPath,workers:0,generationAllowed:false,assets,handoff,
    publication:{branch:`work/asset-ready/${stageId.toLowerCase()}`,mode:'asset-only',gameplayRelease:'pending'},
    nextAction:assets.some(a=>a.state==='recovery-blocked')?'Resolve listed source only':handoff.state==='validated'?'Commit verified assets and metadata to the asset-only branch; verify remote bytes':'Finish listed files, record visual checks, write v1 handoff, then run finish --verify'};
}
