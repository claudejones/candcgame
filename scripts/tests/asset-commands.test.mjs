import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {help,resolve as route,stageKey,handoff,futurePacket,ROOT} from '../assets.mjs';
import {createRun,startJob} from '../asset-jobs.mjs';
const resolve=input=>route(input,{active:null,approvedRevisions:{}});

test('help exposes all continent keys, layer aliases and reserved scope without prompts',()=>{
  const packet=help('keys');
  assert.equal(Object.keys(packet.continents).length,7);
  assert.equal(Object.values(packet.continents).flatMap(c=>c.stages).length,21);
  assert.equal(packet.continents.AF.phase8,false);
  assert.ok(packet.layerKeys.FAR.includes('DISTANT'));
  assert.equal(packet.sharedPrompt,undefined);
  assert.equal(stageKey('au-1'),'OC01');
  assert.equal(stageKey('sa2'),'SA02');
  assert.throws(()=>stageKey('SA04'),/Unknown stage/);
});
test('single-layer regeneration resolves only that art job and preserves exact filenames',()=>{
  for(const layer of ['FAR','MID','GROUND']) {
    const p=resolve(`regenerate landscape NA01 ${layer}`);
    assert.deepEqual(p.selectedLayers,[layer]);
    assert.equal(p.jobs.length,1);
    assert.equal(p.scope.length,1);
    assert.match(p.scope[0],/north-america\/NA01_/);
    assert.ok(p.jobs[0].reference.startsWith('assets-original/'));
    assert.ok(p.jobs[0].prompt.includes(`P8-NA01-${layer}`));
    assert.ok(!p.jobs[0].prompt.includes('P8-NA02'));
    assert.ok(JSON.stringify(p).length<16000,'focused packet grew unexpectedly');
  }
  assert.match(resolve('regenerate NA01 DISTANT').scope[0],/NA01_BG_DISTANT_MESAS.png$/);
});
test('whole-stage requests resolve three jobs; approved builds never reopen artwork',()=>{
  const p=resolve('regenerate landscape SA02');
  assert.equal(p.jobs.length,3);
  assert.equal(p.target,'SA02');
  assert.ok(JSON.stringify(p).length<18000);
  const approved=help().stages.find(s=>s.status==='approved')?.stage;
  if(approved) {
    assert.equal(resolve(`build ${approved}`).operation,'read');
    assert.equal(resolve(`generate ${approved} MID`).operation,'read');
  }
  assert.equal(resolve('generate SA02').operation,resolve('build SA02').operation);
  assert.match(handoff(),/^(In claudejones\/candcgame:|In the candcgame Workbench conversation: import asset handoff config\/asset-handoffs\/[a-z]{2}\d{2}\.json for [A-Z]{2}\d{2}\.$|Phase 8 registered landscapes are approved)/);
});
test('a closed asset-ready stage hands off to Workbench before advancing production',()=>{
  const state={active:null,activeRunId:null,approvedRevisions:{af01:{commit:'c'}},runs:{af02:{
    target:'AF02',status:'ready-for-calibration',closedAt:'2026-09-19T21:00:00Z',
    handoff:{path:'config/asset-handoffs/af02.json'}
  }}};
  assert.equal(handoff(state),'In the candcgame Workbench conversation: import asset handoff config/asset-handoffs/af02.json for AF02.');
  state.approvedRevisions.af02={commit:'d'};
  assert.equal(handoff(state),'In claudejones/candcgame: build stage AF03.');
});
test('revision keeps existing edit source and explicit direction',()=>{
  const p=resolve('revise SA01 MID: keep the snake; remove the monkey');
  assert.equal(p.jobs[0].editingSource,p.scope[0]);
  assert.equal(p.direction,'keep the snake; remove the monkey');
  assert.throws(()=>resolve('revise SA01: anything'),/Unknown stage/);
  assert.throws(()=>resolve('revise SA01 MID'),/describe the requested change/);
});
test('unknown or unapproved future scope is blocked; publication has no generation packet',()=>{
  const plan=JSON.parse(fs.readFileSync(`${ROOT}/config/remaining-continent-proposal.json`,'utf8'));
  plan.productionEnabled=false;
  const future=futurePacket('build','stage',plan.stages.find(s=>s.id==='AF01'),[],{approvedRevisions:{}},plan);
  assert.equal(future.operation,'blocked');
  assert.equal(future.generationAllowed,false);
  assert.equal(future.jobs,undefined);
  assert.deepEqual(future.assignments.map(item=>item.owner),['landscape-worker','hazard-worker']);
  assert.match(future.blockers.join(' '),/productionEnabled/);
  assert.throws(()=>resolve('build landscape AS'),/outside Phase 8/);
  assert.throws(()=>resolve('build character claude'),/registration required/);
  assert.equal(help('character').state,'registration-required');
  assert.deepEqual(help('hazard').selectors,['GROUND1','GROUND2','FLYING']);
  assert.equal(resolve('regenerate hazard AF01 GROUND1').plannedJobs[0].preserveSibling,'GROUND2');
  assert.equal(resolve('revise hazard AF01 FLYING: clearer wing poses').direction,'clearer wing poses');
  assert.equal(resolve('publish SA02').jobs,undefined);
  assert.equal(resolve('resume SA02').jobs,undefined);
  assert.equal(resolve('status OC01').state,'readiness-pending');
  const emptyResume=resolve('resume AF01');
  assert.equal(emptyResume.activeRun,null);
  assert.deepEqual(emptyResume.recovery.pending,[]);
  assert.equal(emptyResume.recovery.autoRegenerate,false);
  assert.throws(()=>resolve('regenerate NA01 SKY'),/Unknown layer/);
  assert.throws(()=>route('regenerate NA01 FAR',{active:{stage:'SA02'},approvedRevisions:{}}),/Active checkpoint/);
  assert.throws(()=>resolve('build character AF01'),/registration required/);
});

test('synthetic ready future state gives jobs only to production commands and keeps approved builds locked',()=>{
  const plan=JSON.parse(fs.readFileSync(`${ROOT}/config/remaining-continent-proposal.json`,'utf8'));
  plan.productionEnabled=true;
  plan.readiness={landscapeContractPromotion:'complete',runtimeRegistration:'complete',hazardValidation:'passed'};
  const stage=structuredClone(plan.stages.find(item=>item.id==='AF01'));
  stage.selectionStatus='approved';
  stage.referencesReady=true;
  stage.referenceFiles=['assets-original/current-generated/NA-assets/NA01_BG_DISTANT_MESAS.png'];
  const state={approvedRevisions:{},runs:{},activeRunId:null};
  const build=futurePacket('build','stage',stage,[],state,plan);
  assert.equal(build.operation,'produce-only');
  assert.equal(build.jobs.length,5);
  assert.match(build.stop,/Workbench/);
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'future-packet-'));
  const statePath=path.join(temp,'state.json');
  fs.writeFileSync(statePath,JSON.stringify({schemaVersion:2,revision:0,active:null,activeRunId:null,runs:{},approvedRevisions:{}}));
  let mutation=createRun({root:ROOT,statePath,expectedRevision:0,command:'build stage AF01',packet:build,baseCommit:'b'.repeat(40)});
  const runId=mutation.result.runId;
  mutation=startJob({root:ROOT,statePath,expectedRevision:mutation.state.revision,runId,jobId:'AF01:FAR'});
  assert.match(mutation.result.packet.prompt,/granite kopje/);
  assert.ok(!JSON.stringify(mutation.result.packet).includes('SOSSUSVLEI'));
  mutation=startJob({root:ROOT,statePath,expectedRevision:mutation.state.revision,runId,jobId:'AF01:OBJECT_ATLAS'});
  assert.match(mutation.result.packet.prompt,/Termite mound/);
  assert.match(mutation.result.packet.prompt,/Crested porcupine/);
  assert.deepEqual(mutation.result.packet.selectedHazards,['GROUND1','GROUND2']);
  for(const command of ['publish','resume','verify','approve','rollback']) {
    const packet=futurePacket(command,'stage',stage,[],state,plan);
    assert.equal(packet.operation,command==='publish'?'publish-only':command==='resume'?'resume':command==='verify'?'read':command==='approve'?'accept':'restore');
    assert.equal(packet.jobs,undefined);
  }
  const locked=futurePacket('build','stage',{...stage,status:'approved'},[],state,plan);
  assert.equal(locked.operation,'read');
  assert.equal(locked.jobs,undefined);
  assert.equal(handoff({active:null,activeRunId:null,runs:{},approvedRevisions:{af01:{commit:'c'}}}),'In claudejones/candcgame: build stage AF02.');
});

test('reference readiness cannot enable generation with an empty downloaded image',()=>{
  const plan=JSON.parse(fs.readFileSync(`${ROOT}/config/remaining-continent-proposal.json`,'utf8'));
  plan.productionEnabled=true;
  plan.readiness={landscapeContractPromotion:'complete',runtimeRegistration:'complete',hazardValidation:'passed'};
  const stage=structuredClone(plan.stages.find(item=>item.id==='AF01'));
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'empty-reference-'));
  try {
    const file=path.join(temp,'reference.jpg');
    fs.writeFileSync(file,'');
    stage.selectionStatus='ready';stage.referencesReady=true;
    stage.referenceFiles=[path.relative(ROOT,file)];
    const packet=futurePacket('build','stage',stage,[],{approvedRevisions:{}},plan);
    assert.equal(packet.generationAllowed,false);
    assert.equal(packet.jobs,undefined);
    assert.match(packet.blockers.join(' '),/reference image is empty/);
  } finally { fs.rmSync(temp,{recursive:true,force:true}); }
});
