/* Durable progress on a dedicated recovery branch; no image content in checkpoints. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ConnectedPublicationCheckpoint=api;}(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  function createConnectedCheckpoint({tools,adapter,repository,branch,path='config/asset-publication-checkpoint.json',snapshot}){
    if(!/^work\//.test(branch||''))throw new Error('Publication checkpoint requires a dedicated work/ recovery branch.');
    if(!snapshot?.treeSha||!Array.isArray(snapshot.files))throw new Error('Verified snapshot required.');
    const fetchFile=Object.entries(tools).find(([name])=>name.endsWith('__github_fetch_file')||name==='github_fetch_file')?.[1];
    if(!fetchFile)throw new Error('Connected file reader unavailable.');
    const clone=x=>JSON.parse(JSON.stringify(x));
    let cached,head,persisted,loaded=false;
    function data(result){if(result.isError)throw new Error(JSON.stringify(result));return result.structuredContent||result;}
    const source={treeSha:snapshot.treeSha,files:snapshot.files.map(({path,blobSha,mode})=>({path,blobSha,...(mode?{mode}:{}),reuse:true}))};
    async function load(){
      if(loaded)return cached?clone(cached):null;
      const ref=await adapter.fetchRef(`heads/${branch}`);head=ref.sha;
      let result;try{result=data(await fetchFile({repository_full_name:repository,path,ref:head}));}
      catch(error){if(!/404|not found/i.test(String(error.message)))throw error;loaded=true;cached=null;return null;}
      const document=typeof result.content==='string'?JSON.parse(result.content):result;
      if(document.snapshot?.treeSha!==snapshot.treeSha)throw new Error('Recovery branch contains a different publication snapshot.');
      cached=document.state;persisted=JSON.stringify(cached);loaded=true;return clone(cached);
    }
    async function save(state){
      if(!loaded)await load();
      cached=clone(state);
      // Blob/tree/commit creation is content-addressed and safely repeatable.
      // Persist each intended branch write before it happens, then completion.
      // Uploaded blobs/tree are already durable at the first checkpoint.
      if(!['dev-ref','main-ref','complete'].includes(state.phase))return;
      if(persisted===JSON.stringify(state))return;
      const current=await adapter.fetchRef(`heads/${branch}`);
      if(current.sha!==head)throw new Error('Publication recovery branch changed concurrently; inspect before continuing.');
      const content=JSON.stringify({version:1,snapshot:source,state},null,2)+'\n';
      const blob=await adapter.createBlob({content,encoding:'utf-8'});
      const tree=await adapter.createTree({baseTreeSha:snapshot.treeSha,entries:[{path,mode:'100644',type:'blob',sha:blob}]});
      const commit=await adapter.createCommit({message:`Checkpoint publication: ${state.phase}`,treeSha:tree,parents:[head]});
      const latest=await adapter.fetchRef(`heads/${branch}`);
      if(latest.sha!==head)throw new Error('Publication recovery branch changed concurrently; no ref updated.');
      await adapter.updateRef({ref:`heads/${branch}`,sha:commit,force:false});
      const written=await adapter.fetchRef(`heads/${branch}`);
      if(written.sha!==commit)throw new Error('Publication checkpoint was not durably written.');
      head=commit;persisted=JSON.stringify(state);
    }
    return {load,save};
  }
  return {createConnectedCheckpoint};
}));
