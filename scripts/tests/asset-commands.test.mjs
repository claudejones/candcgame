import test from 'node:test';
import assert from 'node:assert/strict';
import {help,resolve as route,stageKey,handoff} from '../assets.mjs';
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
  assert.match(handoff(),/^(In claudejones\/candcgame:|Phase 8 registered landscapes are approved)/);
});
test('revision keeps existing edit source and explicit direction',()=>{
  const p=resolve('revise SA01 MID: keep the snake; remove the monkey');
  assert.equal(p.jobs[0].editingSource,p.scope[0]);
  assert.equal(p.direction,'keep the snake; remove the monkey');
  assert.throws(()=>resolve('revise SA01: anything'),/Unknown stage/);
  assert.throws(()=>resolve('revise SA01 MID'),/describe the requested change/);
});
test('unknown or unapproved future scope is blocked; publication has no generation packet',()=>{
  assert.throws(()=>resolve('build AF01'),/reserved key/);
  assert.throws(()=>resolve('build landscape AS'),/outside Phase 8/);
  assert.throws(()=>resolve('build character claude'),/registration required/);
  assert.equal(help('character').state,'registration-required');
  assert.equal(resolve('publish SA02').jobs,undefined);
  assert.equal(resolve('resume SA02').jobs,undefined);
  assert.equal(resolve('status OC01').state,'specification-required');
  assert.throws(()=>resolve('regenerate NA01 SKY'),/Unknown layer/);
  assert.throws(()=>route('regenerate NA01 FAR',{active:{stage:'SA02'},approvedRevisions:{}}),/Active checkpoint/);
});
