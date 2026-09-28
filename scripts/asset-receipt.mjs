// Read an asset-only handoff from one already-fetched ref; never load worker history.
import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {validateAssetHandoff}=require('../src/js/asset-handoff-contract.js');
const {expectedPaths}=require('./validate-asset-handoff.cjs');
export function assetReceipt(root,stageId) {
  if(!/^(AF|AS|OC|AN)0[1-3]$/.test(stageId))return null;
  const branch=`work/asset-ready/${stageId.toLowerCase()}`,ref=`refs/remotes/origin/${branch}`;
  const git=args=>execFileSync('git',args,{cwd:root,stdio:['ignore','pipe','ignore'],maxBuffer:32*1024*1024});
  let commit;try{commit=git(['rev-parse','--verify',ref]).toString().trim();}catch{return null;}
  const read=p=>git(['show',`${commit}:${p}`]);
  try {
    const bundlePath=`config/asset-handoffs/${stageId.toLowerCase()}.json`,bundle=JSON.parse(read(bundlePath));
    if(bundle.stageId.toUpperCase()!==stageId)throw new Error('Stage differs');
    validateAssetHandoff(bundle,{expectedPaths:expectedPaths(stageId,root)});
    for(const asset of Object.values(bundle.assets))if(crypto.createHash('sha256').update(read(asset.path)).digest('hex')!==asset.sha256)throw new Error('Saved image hash differs');
    read(bundle.evidence);
    return {stageId,state:'saved-for-calibration',branch,commit,bundle:bundlePath,calibration:'pending',release:'pending',nextAction:`Import asset handoff ${bundlePath} for ${stageId} from ${branch} at ${commit}.`};
  } catch(error) {return {stageId,state:'asset-receipt-blocked',branch,commit,reason:error.message.split('\n')[0],nextAction:'Repair this exact saved bundle; do not restart generation'};}
}
