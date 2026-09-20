'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createConnectedPublisher,createFunctionsExecAdapter}=require('../connected-publisher.cjs');
const S=n=>String(n).repeat(40), DEV=S(1), MAIN=S(2), BASE_TREE=S(3), TREE=S(4), BLOB=S(5), COMMIT=S(6), MAIN_COMMIT=S(7);

function harness({createdTree=TREE,createdBlob=BLOB}={}){
  let saved=null,blobCalls=0;
  const refs={'heads/dev':{sha:DEV,treeSha:BASE_TREE},'heads/main':{sha:MAIN,treeSha:BASE_TREE}};
  const runs=[];
  const adapter={
    async fetchRef(ref){return {...refs[ref]};},
    async createBlob(){blobCalls++;return createdBlob;},
    async createTree(){return createdTree;},
    async createCommit({parents}){return parents[0]===MAIN?MAIN_COMMIT:COMMIT;},
    async updateRef({ref,sha,force}){assert.equal(force,false);refs[ref]={sha,treeSha:TREE};},
    async fetchRuns(){return runs.map(run=>({...run}));}
  };
  const checkpoint={async load(){return saved&&structuredClone(saved);},async save(value){saved=structuredClone(value);}};
  const publisher=createConnectedPublisher({adapter,checkpoint,devRef:'heads/dev',mainRef:'heads/main',verifiedSnapshot:{treeSha:TREE,files:[{path:'readme.txt',blobSha:BLOB,content:'hello',encoding:'utf-8'}]}});
  return {publisher,refs,runs,get saved(){return saved;},get blobCalls(){return blobCalls;}};
}
const run=(name,headSha,headBranch,status='completed',conclusion='success',url=`https://runs/${name}`,event='push')=>({name,headSha,headBranch,event,status,conclusion,url});

test('publisher resumes idempotently through exact-SHA dev CI, identical-tree main, and Pages',async()=>{
  const h=harness();
  assert.deepEqual((await h.publisher.advance()).status,'pending');
  assert.equal(h.saved.phase,'dev-ci');assert.equal(h.blobCalls,1);assert.equal(h.refs['heads/dev'].sha,COMMIT);
  assert.equal((await h.publisher.advance()).gate,'development-ci');assert.equal(h.blobCalls,1);
  h.runs.push(run('Production CI',COMMIT,'dev','completed','success','https://runs/dev'));
  assert.equal((await h.publisher.advance()).gate,'main-ci');
  assert.equal(h.refs['heads/main'].sha,MAIN_COMMIT);assert.equal(h.refs['heads/main'].treeSha,TREE);
  h.runs.push(run('Production CI',MAIN_COMMIT,'main','completed','success','https://runs/main'));
  assert.equal((await h.publisher.advance()).gate,'pages');
  h.runs.push(run('Deploy QA site to GitHub Pages',MAIN_COMMIT,'main','completed','skipped','https://runs/unrelated-skip','workflow_run'));
  assert.equal((await h.publisher.advance()).status,'pending');
  h.runs.push(run('Deploy QA site to GitHub Pages',MAIN_COMMIT,'main','completed','success','https://runs/pages','workflow_run'));
  const complete=await h.publisher.advance();
  assert.equal(complete.status,'complete');assert.equal(complete.sha,MAIN_COMMIT);assert.equal(complete.developmentSha,COMMIT);assert.equal(complete.treeSha,TREE);
  assert.equal(h.blobCalls,1);
});

test('publisher stops on concurrent ref movement and failed gates',async()=>{
  const concurrent=harness();
  await concurrent.publisher.advance();
  concurrent.runs.push(run('Production CI',COMMIT,'dev','completed','success','https://runs/dev'));
  concurrent.refs['heads/main']={sha:S(8),treeSha:S(9)};
  const blocked=await concurrent.publisher.advance();
  assert.equal(blocked.status,'blocked');assert.equal(blocked.gate,'main-ref-mismatch');assert.equal(concurrent.refs['heads/main'].sha,S(8));

  const failed=harness();await failed.publisher.advance();
  failed.runs.push(run('Production CI',COMMIT,'dev','completed','failure','https://runs/fail'));
  const failure=await failed.publisher.advance();
  assert.equal(failure.status,'failed');assert.equal(failure.gate,'development-ci');assert.equal(failure.conclusion,'failure');
});

test('publisher rejects a remotely constructed tree that differs from the verified local tree',async()=>{
  const h=harness({createdTree:S(7)});
  await assert.rejects(()=>h.publisher.advance(),/does not match verified local tree/);
  assert.equal(h.refs['heads/dev'].sha,DEV);
});

test('functions-exec adapter uses the connected GitHub schemas and parses structured content strings',async()=>{
  const calls=[];
  const response=value=>({structuredContent:{content:JSON.stringify(value)}});
  const tools={
    mcp__github__github_fetch:async args=>{calls.push(['fetch',args]);return response(args.url.includes('/git/ref/')?{object:{sha:DEV}}:{tree:{sha:BASE_TREE}});},
    mcp__github__github_create_blob:async args=>{calls.push(['blob',args]);return response({sha:BLOB});},
    mcp__github__github_create_tree:async args=>{calls.push(['tree',args]);return response({sha:TREE});},
    mcp__github__github_create_commit:async args=>{calls.push(['commit',args]);return response({sha:COMMIT});},
    mcp__github__github_update_ref:async args=>{calls.push(['ref',args]);return response({});}
  };
  const adapter=createFunctionsExecAdapter(tools,{owner:'acme',repo:'game'});
  assert.deepEqual(await adapter.fetchRef('heads/dev'),{sha:DEV,treeSha:BASE_TREE});
  assert.equal(await adapter.createBlob({content:'text',encoding:'utf-8'}),BLOB);
  assert.equal(await adapter.createTree({baseTreeSha:BASE_TREE,entries:[{path:'a',sha:BLOB}]}),TREE);
  assert.equal(await adapter.createCommit({message:'m',treeSha:TREE,parents:[DEV]}),COMMIT);
  await adapter.updateRef({ref:'heads/dev',sha:COMMIT,force:false});
  assert.deepEqual(calls.slice(2),[
    ['blob',{repository_full_name:'acme/game',content:'text',encoding:'utf-8'}],
    ['tree',{repository_full_name:'acme/game',base_tree_sha:BASE_TREE,tree_elements:[{path:'a',sha:BLOB}]}],
    ['commit',{repository_full_name:'acme/game',parent_sha:DEV,tree_sha:TREE,message:'m'}],
    ['ref',{repository_full_name:'acme/game',branch_name:'dev',sha:COMMIT,force:false}]
  ]);
});


test('unrelated branch, pull request and wrong SHA successes cannot satisfy push CI',async()=>{
  const h=harness();await h.publisher.advance();
  h.runs.push(run('Production CI',COMMIT,'main'),run('Production CI',COMMIT,'dev','completed','success','https://runs/pr','pull_request'),run('Production CI',S(8),'dev'));
  assert.equal((await h.publisher.advance()).gate,'development-ci');assert.equal(h.refs['heads/main'].sha,MAIN);
});

test('mismatched uploaded blob stops before a tree or ref is accepted',async()=>{
  const h=harness({createdBlob:S(8)});await assert.rejects(h.publisher.advance(),/uploaded blob does not match/);
  assert.equal(h.refs['heads/dev'].sha,DEV);assert.equal(h.refs['heads/main'].sha,MAIN);
});


test('unreconciled initial branch trees block promotion rather than overwrite main-only work',async()=>{
 const h=harness();h.refs['heads/main'].treeSha=S(9);
 const result=await h.publisher.advance();assert.equal(result.gate,'unreconciled-branch-trees');assert.equal(h.blobCalls,0);assert.equal(h.refs['heads/main'].sha,MAIN);
});
