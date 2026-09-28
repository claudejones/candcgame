import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {
  checkpointRun, closeRun, compactWorkflowState, createRun, fileHash, readWorkflowState, recordFailure, recordResult,
  requeueJob, resumeReport, startJob, updateWorkflowState, verifyRecovery, workerBrief
} from '../asset-jobs.mjs';

function fixture() {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'asset-jobs-'));
  fs.mkdirSync(path.join(root,'assets'),{recursive:true});
  fs.mkdirSync(path.join(root,'refs'),{recursive:true});
  fs.mkdirSync(path.join(root,'spec'),{recursive:true});
  for (const [file,bytes] of [['assets/far.png','far0'],['assets/mid.png','mid0'],['assets/ground.png','ground0'],['assets/fly.png','fly0'],['refs/style.png','reference'],['spec/stage.json','{}']]) {
    fs.writeFileSync(path.join(root,file),bytes);
  }
  const statePath=path.join(root,'state.json');
  fs.writeFileSync(statePath,JSON.stringify({schemaVersion:1,active:null,approvedRevisions:{locked:{commit:'abc'} }},null,2));
  const packet={target:'ZZ01',operation:'produce-and-publish',generationAllowed:true,specHash:'spec-hash',specSources:['spec/stage.json'],
    protectedOutputs:['assets/far.png','assets/mid.png','assets/ground.png','assets/fly.png'],sharedRules:{rule:'shared'},jobs:[
      {selector:'FAR',owner:'landscape-worker',output:'assets/far.png',reference:'refs/style.png',prompt:'far'},
      {selector:'MID',owner:'landscape-worker',output:'assets/mid.png',reference:'refs/style.png',prompt:'mid'},
      {selector:'FLYING',owner:'hazard-worker',output:'assets/fly.png',reference:'refs/style.png',prompt:'fly'}
    ]};
  return {root,statePath,packet};
}

function start(f) {
  const created=createRun({root:f.root,statePath:f.statePath,expectedRevision:0,command:'build stage ZZ01',packet:f.packet,baseCommit:'a'.repeat(40),now:new Date('2026-01-01T00:00:00Z')});
  return {runId:created.result.runId,revision:created.state.revision};
}

test('schema migration preserves approvals and CAS rejects stale writers',()=>{
  const f=fixture();
  const state=readWorkflowState(f.statePath);
  assert.equal(state.schemaVersion,2);
  assert.deepEqual(state.approvedRevisions.locked,{commit:'abc'});
  const changed=updateWorkflowState({statePath:f.statePath,expectedRevision:0,actor:'coordinator',mutate(s){s.marker=true;}});
  assert.equal(changed.state.revision,1);
  assert.throws(()=>updateWorkflowState({statePath:f.statePath,expectedRevision:0,actor:'coordinator',mutate(){}}),/Stale workflow revision/);
  assert.throws(()=>updateWorkflowState({statePath:f.statePath,expectedRevision:1,actor:'worker',mutate(){}}),/Only the coordinator/);
});

test('state compaction preserves approvals and resumable worker packets outside the checkpoint',()=>{
  const f=fixture(),started=start(f);
  let legacy=readWorkflowState(f.statePath);
  for(const job of Object.values(legacy.runs[started.runId].jobs)){
    job.workerPacket=workerBrief({statePath:f.statePath,runId:started.runId,jobId:job.id});
    delete job.workerPacketRef;
  }
  const archivedFar=structuredClone(legacy.runs[started.runId].jobs['ZZ01:FAR'].workerPacket);
  fs.writeFileSync(f.statePath,JSON.stringify(legacy));
  const before=readWorkflowState(f.statePath),compacted=compactWorkflowState({statePath:f.statePath,expectedRevision:started.revision});
  const run=compacted.state.runs[started.runId];
  assert.deepEqual(compacted.state.approvedRevisions,before.approvedRevisions);
  assert.equal(compacted.result.packets,3);
  assert.equal(run.jobs['ZZ01:FAR'].workerPacket,undefined);
  assert.ok(run.jobs['ZZ01:FAR'].workerPacketRef.path);
  const archivedPath=path.join(path.dirname(f.statePath),run.jobs['ZZ01:FAR'].workerPacketRef.path);
  assert.deepEqual(JSON.parse(fs.readFileSync(archivedPath,'utf8')),archivedFar);
  const brief=workerBrief({statePath:f.statePath,runId:started.runId,jobId:'ZZ01:FAR'});
  assert.equal(brief.prompt,'far');
  const startedJob=startJob({root:f.root,statePath:f.statePath,expectedRevision:compacted.state.revision,runId:started.runId,jobId:'ZZ01:FAR'});
  assert.equal(startedJob.result.packet.prompt,'far');
});

test('worker packets contain only the pertinent profile and keep shared geometry and reference hashes',()=>{
  const f=fixture();
  f.packet.sharedRules={profile:{content:'landscape'},hazardProfile:'hazard',viewport:{w:960,h:540},landscapeAnchors:{mid:621}};
  const started=start(f),state=readWorkflowState(f.statePath);
  const landscape=workerBrief({statePath:f.statePath,runId:started.runId,jobId:'ZZ01:FAR'});
  const hazard=workerBrief({statePath:f.statePath,runId:started.runId,jobId:'ZZ01:FLYING'});
  assert.equal(landscape.sharedRules.profile.content,'landscape');
  assert.equal(hazard.sharedRules.profile.content,'hazard');
  assert.equal(JSON.stringify(landscape).includes('hazardProfile'),false);
  assert.notEqual(hazard.sharedRules.profile.content,'landscape');
  assert.deepEqual(landscape.sharedRules.viewport,{w:960,h:540});
  assert.ok(Object.keys(state.runs[started.runId].jobs['ZZ01:FAR'].referenceHashes).length);
});

test('repeated technical failures require diagnosis or approved finishing without relaxing standards',()=>{
  const f=fixture(),started=start(f);
  let mutation=startJob({root:f.root,statePath:f.statePath,expectedRevision:started.revision,runId:started.runId,jobId:'ZZ01:FAR'});
  mutation=recordFailure({statePath:f.statePath,expectedRevision:mutation.state.revision,runId:started.runId,jobId:'ZZ01:FAR',detail:'alpha background remains opaque'});
  assert.equal(mutation.result.classification,'alpha');
  assert.equal(mutation.result.nextAction,'retry-after-correction');
  mutation=startJob({root:f.root,statePath:f.statePath,expectedRevision:mutation.state.revision,runId:started.runId,jobId:'ZZ01:FAR'});
  mutation=recordFailure({statePath:f.statePath,expectedRevision:mutation.state.revision,runId:started.runId,jobId:'ZZ01:FAR',detail:'transparent alpha still fails'});
  assert.equal(mutation.result.count,2);
  assert.equal(mutation.result.nextAction,'diagnose-or-approved-finishing');
  assert.equal(mutation.result.autoAccept,false);
  assert.equal(mutation.result.relaxStandards,false);
});

test('selected JSON source hashes ignore unrelated status prose but detect effective contract changes',()=>{
  const f=fixture();
  fs.writeFileSync(path.join(f.root,'spec/stage.json'),JSON.stringify({stage:{direction:'keep',status:'working'},other:{notes:'a'}}));
  f.packet.specSources=[{path:'spec/stage.json',select:['stage.direction']}];
  let started=start(f);
  fs.writeFileSync(path.join(f.root,'spec/stage.json'),JSON.stringify({stage:{direction:'keep',status:'closed'},other:{notes:'b'}}));
  let mutation=startJob({root:f.root,statePath:f.statePath,expectedRevision:started.revision,runId:started.runId,jobId:'ZZ01:FAR'});
  assert.equal(mutation.result.packet.prompt,'far');
  const g=fixture();
  fs.writeFileSync(path.join(g.root,'spec/stage.json'),JSON.stringify({stage:{direction:'keep'}}));
  g.packet.specSources=[{path:'spec/stage.json',select:['stage.direction']}];
  started=start(g);
  fs.writeFileSync(path.join(g.root,'spec/stage.json'),JSON.stringify({stage:{direction:'change'}}));
  assert.throws(()=>startJob({root:g.root,statePath:g.statePath,expectedRevision:started.revision,runId:started.runId,jobId:'ZZ01:FAR'}),/Stale specification/);
});

test('bounded dispatch permits two owners, serializes landscape, and requeues an interrupted job explicitly',()=>{
  const f=fixture(), started=start(f);
  const far=startJob({root:f.root,statePath:f.statePath,expectedRevision:started.revision,runId:started.runId,jobId:'ZZ01:FAR'});
  assert.deepEqual(Object.keys(far.result.packet).includes('prompt'),true);
  assert.equal(far.result.packet.prompt,'far');
  assert.ok(!JSON.stringify(far.result.packet).includes('fly'));
  assert.throws(()=>startJob({root:f.root,statePath:f.statePath,expectedRevision:far.state.revision,runId:started.runId,jobId:'ZZ01:MID'}),/already has a running job/);
  const fly=startJob({root:f.root,statePath:f.statePath,expectedRevision:far.state.revision,runId:started.runId,jobId:'ZZ01:FLYING'});
  assert.throws(()=>startJob({root:f.root,statePath:f.statePath,expectedRevision:fly.state.revision,runId:started.runId,jobId:'ZZ01:FAR'}),/is running/);
  const requeued=requeueJob({root:f.root,statePath:f.statePath,expectedRevision:fly.state.revision,runId:started.runId,jobId:'ZZ01:FAR'});
  assert.equal(requeued.result.status,'pending');
  assert.equal(requeued.result.autoRegenerate,false);
  assert.equal(readWorkflowState(f.statePath).runs[started.runId].jobs['ZZ01:FAR'].dispatches,1);
});

test('result rejects stale sibling bytes, stale references, forged claims and missing output',()=>{
  const f=fixture(), started=start(f);
  let mutation=startJob({root:f.root,statePath:f.statePath,expectedRevision:started.revision,runId:started.runId,jobId:'ZZ01:MID'});
  fs.writeFileSync(path.join(f.root,'assets/far.png'),'unauthorized');
  const job=mutation.state.runs[started.runId].jobs['ZZ01:MID'];
  fs.writeFileSync(path.join(f.root,'assets/mid.png'),'mid-result');
  const manifest={runId:started.runId,jobId:job.id,path:job.output,sha256:fileHash(f.root,job.output),baseCommit:'a'.repeat(40),baseHash:job.baseHash,specHash:job.specHash,referenceHashes:job.referenceHashes,attempts:1};
  assert.throws(()=>recordResult({root:f.root,statePath:f.statePath,expectedRevision:mutation.state.revision,runId:started.runId,jobId:job.id,manifest}),/Unowned output changed/);

  const g=fixture(), s=start(g);
  mutation=startJob({root:g.root,statePath:g.statePath,expectedRevision:s.revision,runId:s.runId,jobId:'ZZ01:MID'});
  const clean=mutation.state.runs[s.runId].jobs['ZZ01:MID'];
  fs.writeFileSync(path.join(g.root,'assets/mid.png'),'result');
  const forged={runId:s.runId,jobId:clean.id,path:clean.output,sha256:'0'.repeat(64),baseCommit:'a'.repeat(40),baseHash:clean.baseHash,specHash:clean.specHash,referenceHashes:clean.referenceHashes,attempts:1};
  assert.throws(()=>recordResult({root:g.root,statePath:g.statePath,expectedRevision:mutation.state.revision,runId:s.runId,jobId:clean.id,manifest:forged}),/hash does not match/);
  fs.rmSync(path.join(g.root,'assets/mid.png'));
  forged.sha256=null;
  assert.throws(()=>recordResult({root:g.root,statePath:g.statePath,expectedRevision:mutation.state.revision,runId:s.runId,jobId:clean.id,manifest:forged}),/Missing owned output/);

  const h=fixture(), t=start(h);
  fs.writeFileSync(path.join(h.root,'refs/style.png'),'changed-reference');
  assert.throws(()=>startJob({root:h.root,statePath:h.statePath,expectedRevision:t.revision,runId:t.runId,jobId:'ZZ01:FAR'}),/Stale reference/);
});

test('resume reports completed, missing and pending without auto regeneration; publication rejects changed saved bytes',()=>{
  const f=fixture(), started=start(f);
  let mutation=startJob({root:f.root,statePath:f.statePath,expectedRevision:started.revision,runId:started.runId,jobId:'ZZ01:FAR'});
  const job=mutation.state.runs[started.runId].jobs['ZZ01:FAR'];
  fs.writeFileSync(path.join(f.root,job.output),'far-result');
  const manifest={runId:started.runId,jobId:job.id,path:job.output,sha256:fileHash(f.root,job.output),baseCommit:'a'.repeat(40),baseHash:job.baseHash,specHash:job.specHash,referenceHashes:job.referenceHashes,attempts:2};
  mutation=recordResult({root:f.root,statePath:f.statePath,expectedRevision:mutation.state.revision,runId:started.runId,jobId:job.id,manifest});
  let report=resumeReport(f.root,mutation.state.runs[started.runId]);
  assert.deepEqual(report.completed,['ZZ01:FAR']);
  assert.deepEqual(report.pending.sort(),['ZZ01:FLYING','ZZ01:MID']);
  assert.equal(report.autoRegenerate,false);
  fs.writeFileSync(path.join(f.root,job.output),'corrupt');
  report=resumeReport(f.root,mutation.state.runs[started.runId]);
  assert.equal(report.missing[0].reason,'changed');
  assert.throws(()=>checkpointRun({root:f.root,statePath:f.statePath,expectedRevision:mutation.state.revision,runId:started.runId,phase:'ready-to-publish'}),/requires every saved job/);
});

test('large binary recovery requires coordinator verification of a fetched remote ref',()=>{
  const f=fixture();
  f.packet.jobs=[f.packet.jobs[0]];
  f.packet.protectedOutputs=['assets/far.png'];
  for(const args of [['init'],['config','user.email','test@example.invalid'],['config','user.name','Test'],['add','.'],['commit','-m','base']]) execFileSync('git',args,{cwd:f.root,stdio:'ignore'});
  const baseCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:f.root,encoding:'utf8'}).trim();
  let mutation=createRun({root:f.root,statePath:f.statePath,expectedRevision:0,command:'build stage ZZ01',packet:f.packet,baseCommit});
  const runId=mutation.result.runId;
  mutation=startJob({root:f.root,statePath:f.statePath,expectedRevision:mutation.state.revision,runId,jobId:'ZZ01:FAR'});
  fs.writeFileSync(path.join(f.root,'assets/far.png'),Buffer.alloc(2*1024*1024+17,7));
  execFileSync('git',['add','assets/far.png'],{cwd:f.root});
  execFileSync('git',['commit','-m','recovery'],{cwd:f.root,stdio:'ignore'});
  const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:f.root,encoding:'utf8'}).trim();
  const job=mutation.state.runs[runId].jobs['ZZ01:FAR'];
  const resultHash=fileHash(f.root,job.output);
  const manifest={runId,jobId:job.id,path:job.output,sha256:resultHash,baseCommit,baseHash:job.baseHash,specHash:job.specHash,referenceHashes:job.referenceHashes,attempts:1,
    recovery:{ref:'work/assets/zz01',commit,contentHash:resultHash,verified:true}};
  assert.throws(()=>recordResult({root:f.root,statePath:f.statePath,expectedRevision:mutation.state.revision,runId,jobId:job.id,manifest}),/worker result cannot claim remote/i);
  delete manifest.recovery.verified;
  mutation=recordResult({root:f.root,statePath:f.statePath,expectedRevision:mutation.state.revision,runId,jobId:job.id,manifest});
  assert.equal(mutation.result.durable,false);
  mutation=checkpointRun({root:f.root,statePath:f.statePath,expectedRevision:mutation.state.revision,runId,phase:'ready-to-publish'});
  assert.throws(()=>checkpointRun({root:f.root,statePath:f.statePath,expectedRevision:mutation.state.revision,runId,phase:'awaiting-approval'}),/verified remote recovery evidence/);
  execFileSync('git',['update-ref','refs/remotes/origin/work/assets/zz01',commit],{cwd:f.root});
  mutation=verifyRecovery({root:f.root,statePath:f.statePath,expectedRevision:mutation.state.revision,runId,jobId:job.id,remoteRef:'refs/remotes/origin/work/assets/zz01'});
  assert.equal(mutation.result.durable,true);
  assert.throws(()=>verifyRecovery({root:f.root,statePath:f.statePath,expectedRevision:mutation.state.revision,runId,jobId:job.id,remoteRef:commit}),/remote-tracking ref/);
});

test('asset-ready closeout requires durable jobs and a remotely verified handoff without approving gameplay',()=>{
  const f=fixture();
  f.packet.jobs=[f.packet.jobs[0]];f.packet.protectedOutputs=['assets/far.png'];
  fs.mkdirSync(path.join(f.root,'config/asset-handoffs'),{recursive:true});
  fs.writeFileSync(path.join(f.root,'config/asset-handoffs/zz01.json'),'{}\n');
  for(const args of [['init'],['config','user.email','test@example.invalid'],['config','user.name','Test'],['add','.'],['commit','-m','base']])execFileSync('git',args,{cwd:f.root,stdio:'ignore'});
  const baseCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:f.root,encoding:'utf8'}).trim();
  let mutation=createRun({root:f.root,statePath:f.statePath,expectedRevision:0,command:'build stage ZZ01',packet:f.packet,baseCommit});
  const runId=mutation.result.runId;
  mutation=startJob({root:f.root,statePath:f.statePath,expectedRevision:mutation.state.revision,runId,jobId:'ZZ01:FAR'});
  fs.writeFileSync(path.join(f.root,'assets/far.png'),'ready');
  execFileSync('git',['add','.'],{cwd:f.root});execFileSync('git',['commit','-m','asset-ready'],{cwd:f.root,stdio:'ignore'});
  const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:f.root,encoding:'utf8'}).trim(),job=mutation.state.runs[runId].jobs['ZZ01:FAR'];
  const hash=fileHash(f.root,job.output),manifest={runId,jobId:job.id,path:job.output,sha256:hash,baseCommit,baseHash:job.baseHash,specHash:job.specHash,referenceHashes:job.referenceHashes,attempts:1,recovery:{ref:'work/assets/zz01',commit,contentHash:hash}};
  mutation=recordResult({root:f.root,statePath:f.statePath,expectedRevision:mutation.state.revision,runId,jobId:job.id,manifest});
  assert.throws(()=>checkpointRun({root:f.root,statePath:f.statePath,expectedRevision:mutation.state.revision,runId,phase:'asset-ready',handoffPath:'config/asset-handoffs/zz01.json'}),/verified remote recovery evidence/);
  execFileSync('git',['update-ref','refs/remotes/origin/work/assets/zz01',commit],{cwd:f.root});
  mutation=verifyRecovery({root:f.root,statePath:f.statePath,expectedRevision:mutation.state.revision,runId,jobId:job.id,remoteRef:'refs/remotes/origin/work/assets/zz01'});
  mutation=checkpointRun({root:f.root,statePath:f.statePath,expectedRevision:mutation.state.revision,runId,phase:'asset-ready',handoffPath:'config/asset-handoffs/zz01.json',handoffRecoveryRef:'refs/remotes/origin/work/assets/zz01'});
  assert.equal(mutation.state.runs[runId].handoff.remoteRefVerified,true);
  mutation=closeRun({statePath:f.statePath,expectedRevision:mutation.state.revision,runId});
  assert.equal(mutation.result.status,'ready-for-calibration');
  assert.equal(mutation.state.approvedRevisions.zz01,undefined);
});
