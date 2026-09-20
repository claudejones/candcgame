const test=require('node:test'),assert=require('node:assert/strict');
const {createConnectedCheckpoint}=require('../connected-publication-checkpoint.cjs');
function fixture(){
 let head='a'.repeat(40),tree='b'.repeat(40),document=null,pending=null,writes=0;
 const adapter={fetchRef:async()=>({sha:head,treeSha:tree}),createBlob:async({content})=>{pending=content;return 'c'.repeat(40);},createTree:async({baseTreeSha})=>{assert.equal(baseTreeSha,options.snapshot.treeSha);return tree;},createCommit:async()=>String(++writes).padStart(40,'0'),updateRef:async({sha,force})=>{assert.equal(force,false);head=sha;document=pending;}};
 const tools={github_fetch_file:async()=>{if(!document)throw Error('404 Not Found');return {structuredContent:{content:document}};}};
 const options={tools,adapter,repository:'owner/repo',branch:'work/publish/test',snapshot:{treeSha:'9'.repeat(40),files:[{path:'test.txt',blobSha:'e'.repeat(40),content:'not checkpoint content'}]}};
 return {options,get writes(){return writes;},get document(){return document;},conflict:()=>{head='f'.repeat(40);}};
}
test('durable checkpoint writes only intended ref transitions, survives restart, omits file content',async()=>{
 const f=fixture(),c=createConnectedCheckpoint(f.options);assert.equal(await c.load(),null);
 await c.save({phase:'prepare'});await c.save({phase:'blobs'});assert.equal(f.writes,0);
 const state={phase:'dev-ref',snapshotTree:f.options.snapshot.treeSha,devCommit:'d'.repeat(40)};await c.save(state);assert.equal(f.writes,1);
 assert.equal(JSON.parse(f.document).snapshot.files[0].content,undefined);
 const restart=createConnectedCheckpoint(f.options);assert.deepEqual(await restart.load(),state);
 await restart.save(state);assert.equal(f.writes,1);
 await restart.save({...state,phase:'dev-ci'});assert.equal(f.writes,1);
 await restart.save({...state,phase:'main-ref'});assert.equal(f.writes,2);
});
test('concurrent recovery branch changes block writes',async()=>{
 const f=fixture(),c=createConnectedCheckpoint(f.options);await c.load();f.conflict();await assert.rejects(c.save({phase:'dev-ref'}),/changed concurrently/);assert.equal(f.writes,0);
});
