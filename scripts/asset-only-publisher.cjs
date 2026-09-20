// Dedicated asset branch only. Shared-branch gameplay gates are unchanged.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AssetOnlyPublisher=api;}(globalThis,function(){
  'use strict';
  async function publishAssetOnly({adapter,stageId,branchHead,baseTreeSha,snapshot,allowedPaths}) {
    if(!/^(AF|AS|OC|AN)0[1-3]$/.test(stageId))throw new Error('Invalid asset stage');
    const sha=s=>/^[a-f0-9]{40}$/.test(s||'');
    if(!sha(branchHead)||!sha(baseTreeSha)||!sha(snapshot?.treeSha))throw new Error('Pinned head and trees required');
    const ref=`heads/work/asset-ready/${stageId.toLowerCase()}`;
    const allowed=new Set(allowedPaths);
    if(!Array.isArray(snapshot.files)||!snapshot.files.length)throw new Error('Empty asset snapshot');
    for(const f of snapshot.files){
      if(!allowed.has(f.path)||!sha(f.blobSha)||f.path.includes('..')||!/^(assets\/|config\/asset-(handoffs|finish)\/|docs\/phase8-qa\/)/.test(f.path))throw new Error(`Out-of-scope asset publication: ${f.path}`);
    }
    const current=await adapter.fetchRef(ref);
    if(current.treeSha===snapshot.treeSha)return {status:'saved',commit:current.sha,branch:ref,calibration:'pending',release:'pending'};
    if(current.sha!==branchHead||current.treeSha!==baseTreeSha)throw new Error('Asset branch changed; reconcile before publication');
    for(const f of snapshot.files){
      if(f.content!==undefined){
        if(f.encoding==='base64'&&f.contentSource!=='binary-tool')throw new Error('Binary-safe source required');
        if(await adapter.createBlob(f)!==f.blobSha)throw new Error(`Blob mismatch: ${f.path}`);
      }else if(!f.reuse)throw new Error(`Missing verified bytes: ${f.path}`);
    }
    const tree=await adapter.createTree({baseTreeSha,entries:snapshot.files.map(f=>({path:f.path,sha:f.blobSha,mode:'100644',type:'blob'}))});
    if(tree!==snapshot.treeSha)throw new Error('Asset tree mismatch');
    const commit=await adapter.createCommit({message:`Save ${stageId} assets for Workbench calibration`,treeSha:tree,parents:[branchHead]});
    if((await adapter.fetchRef(ref)).sha!==branchHead)throw new Error('Concurrent asset branch update');
    await adapter.updateRef({ref,sha:commit,force:false});
    const saved=await adapter.fetchRef(ref);
    if(saved.sha!==commit||saved.treeSha!==tree)throw new Error('Remote asset verification failed');
    return {status:'saved',commit,branch:ref,calibration:'pending',release:'pending'};
  }
  return {publishAssetOnly};
}));
