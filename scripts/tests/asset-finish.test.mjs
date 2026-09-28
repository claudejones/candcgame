import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {finishView,keys} from '../asset-finish.mjs';
import {imagePrompt,revisionPrompt} from '../asset-prompts.mjs';
import {execFileSync} from 'node:child_process';
import {assetReceipt} from '../asset-receipt.mjs';
import {resolve,help,handoff,futurePacket,ROOT} from '../assets.mjs';
const {publishAssetOnly}=createRequire(import.meta.url)('../asset-only-publisher.cjs');
test('finish is discoverable and bypasses legacy coordinator state in resolver and handoff',()=>{
  assert.equal(help('commands').commands.finish.operation,'direct-finish');
  const r=resolve('finish AF03',{activeRunId:'broken',runs:{broken:{target:'AF03',status:'working'}}});
  assert.equal(r.workers,0);assert.equal(r.generationAllowed,false);
  assert.match(handoff(),/finish AF03/);assert.ok(JSON.stringify(r).length<6000);
});
test('asset receipt verifies saved branch bytes and blocks a damaged handoff',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'receipt-'));
  try {
    const plan=JSON.parse(fs.readFileSync(path.join(ROOT,'config/remaining-continent-proposal.json')));
    const bundle=JSON.parse(fs.readFileSync(path.join(ROOT,'config/asset-handoffs/af02.json')));
    const put=(p,b)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),b);};
    put('config/remaining-continent-proposal.json',JSON.stringify(plan));
    for(const [k,a] of Object.entries(bundle.assets)){put(a.path,k);a.sha256=crypto.createHash('sha256').update(k).digest('hex');}
    put(bundle.evidence,'Fixture evidence');put('config/asset-handoffs/af02.json',JSON.stringify(bundle));
    const git=args=>execFileSync('git',args,{cwd:root,stdio:['ignore','pipe','pipe']}).toString().trim();
    git(['init']);git(['add','.']);git(['-c','user.name=Test','-c','user.email=test@example.com','commit','-m','fixture']);
    git(['update-ref','refs/remotes/origin/work/asset-ready/af02',git(['rev-parse','HEAD'])]);
    assert.equal(assetReceipt(root,'AF02').state,'saved-for-calibration');assert.equal(assetReceipt(root,'AF03'),null);
    put(bundle.assets.FAR.path,'damaged');git(['add','.']);git(['-c','user.name=Test','-c','user.email=test@example.com','commit','-m','damage']);git(['update-ref','refs/remotes/origin/work/asset-ready/af02',git(['rev-parse','HEAD'])]);
    assert.equal(assetReceipt(root,'AF02').state,'asset-receipt-blocked');
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('finish resolves only pinned files; changed or missing bytes block without jobs',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'finish-'));
  try {
    fs.mkdirSync(path.join(root,'config/asset-finish'),{recursive:true});
    const stage={id:'AF03',landscapes:Object.fromEntries(['FAR','MID','GROUND'].map(k=>[k,{path:`assets/${k}.png`}])),groundAtlas:'assets/OBJECT_ATLAS.png',hazards:{FLYING:{path:'assets/FLYING.png'}}};
    fs.writeFileSync(path.join(root,'config/remaining-continent-proposal.json'),JSON.stringify({stages:[stage]}));
    const assets={};for(const k of keys){const local=path.join(root,k);fs.writeFileSync(local,k);assets[k]={output:`assets/${k}.png`,source:{local,sha256:crypto.createHash('sha256').update(k).digest('hex')}};}
    fs.writeFileSync(path.join(root,'config/asset-finish/af03.json'),JSON.stringify({version:1,stageId:'AF03',assets}));
    let r=finishView(root,'AF03');assert.equal(r.workers,0);assert.equal(r.generationAllowed,false);assert.ok(r.assets.every(a=>a.state==='source-verified'));assert.ok(JSON.stringify(r).length<6000);
    fs.writeFileSync(assets.MID.source.local,'changed');fs.unlinkSync(assets.FLYING.source.local);
    r=finishView(root,'AF03',{verify:true});assert.equal(r.assets.filter(a=>a.state==='recovery-blocked').length,2);assert.notEqual(r.handoff.state,'validated');
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('each image template isolates its subject and flying poses; revision scope is required',()=>{
  const s={id:'AS01',palette:'test palette',landscapes:{FAR:{direction:'mountain landmark'},MID:{direction:'bamboo grove'},GROUND:{direction:'stone path'}},brief:{farFocalPoint:'mountain landmark',midLifeDetail:'bamboo grove',intendedRelativeScale:'UNRELATED RUNTIME'},hazards:{GROUND1:{label:'jar'},GROUND2:{label:'basket'},FLYING:{label:'stork'}}};
  for(const k of keys){const p=imagePrompt(s,k);assert.ok(p.length<2500);assert.ok(!p.includes('UNRELATED RUNTIME'));}
  const p=imagePrompt(s,'GROUND');for(const term of ['stork','jar','mountain landmark','bamboo grove'])assert.ok(!p.includes(term));assert.match(p,/row 393/);
  const f=imagePrompt(s,'FLYING');for(let i=1;i<=4;i++)assert.ok(f.includes(`Frame ${i}:`));assert.throws(()=>revisionPrompt('','preserve'));assert.match(revisionPrompt('one wing','body'),/Correct only/);
});
test('all nine post-Africa stages compile five scoped prompts and retain reference gates',()=>{
  const plan=JSON.parse(fs.readFileSync(path.join(ROOT,'config/remaining-continent-proposal.json')));
  const reference='assets/worlds/africa/AF01_BG_DISTANT_SERENGETI.png';
  for(const original of plan.stages.filter(s=>/^(AS|OC|AN)/.test(s.id))){
    const stage=structuredClone(original);stage.selectionStatus='ready';stage.referencesReady=true;
    stage.referenceFiles=Object.fromEntries([...keys,'GROUND1','GROUND2'].map(k=>[k,[reference]]));stage.hazards.FLYING.selectionStatus='ready';
    const packet=futurePacket('build','stage',stage,[],{approvedRevisions:{}},plan);
    assert.equal(packet.generationAllowed,true,stage.id);assert.equal(packet.jobs.length,5);
    for(const job of packet.jobs){assert.match(job.prompt,/Create/);assert.ok(job.prompt.length<3000);assert.ok(!job.prompt.includes('intendedRelativeScale'));}
    stage.referencesReady=false;assert.equal(futurePacket('build','stage',stage,[],{approvedRevisions:{}},plan).generationAllowed,false);
  }
});
test('asset publisher is idempotent, branch-specific, rejects runtime paths and concurrent changes',async()=>{
  const a='a'.repeat(40),b='b'.repeat(40),c='c'.repeat(40),d='d'.repeat(40);let current={sha:a,treeSha:b},writes=0;
  const adapter={fetchRef:async ref=>{assert.equal(ref,'heads/work/asset-ready/af03');return current;},createTree:async()=>c,createCommit:async()=>d,updateRef:async x=>{assert.equal(x.force,false);writes++;current={sha:x.sha,treeSha:c};}};
  const o={adapter,stageId:'AF03',branchHead:a,baseTreeSha:b,allowedPaths:['assets/worlds/africa/x.png'],snapshot:{treeSha:c,files:[{path:'assets/worlds/africa/x.png',blobSha:b,reuse:true}]}};
  assert.equal((await publishAssetOnly(o)).commit,d);await publishAssetOnly(o);assert.equal(writes,1);
  await assert.rejects(()=>publishAssetOnly({...o,allowedPaths:['src/js/game.js'],snapshot:{treeSha:c,files:[{path:'src/js/game.js',blobSha:b,reuse:true}]}}),/Out-of-scope/);
  current={sha:d,treeSha:b};await assert.rejects(()=>publishAssetOnly(o),/changed/);
});
