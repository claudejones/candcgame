'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const contract=require('../../src/js/asset-handoff-contract.js');
const {expectedPaths,validateBundleFile}=require('../validate-asset-handoff.cjs');
const ROOT=path.resolve(__dirname,'../..');
const bundle=()=>JSON.parse(fs.readFileSync(path.join(ROOT,'config/asset-handoffs/af01.json'),'utf8'));

test('AF01 asset-ready bundle validates exact files without becoming a release',()=>{
  const value=bundle();
  assert.equal(contract.validateAssetHandoff(value,{expectedPaths:expectedPaths('af01')}),true);
  assert.equal(validateBundleFile('config/asset-handoffs/af01.json').readiness,'asset-ready');
  assert.deepEqual(value.downstream,{calibration:'pending',release:'pending'});
  assert.equal(value.existingAcceptance.status,'approved');
});

test('handoff rejects a noncanonical source, hash, facing, and crop that excludes its anchor',()=>{
  const paths=expectedPaths('af01');
  let value=bundle();value.assets.FAR.path='assets/wrong.png';
  assert.throws(()=>contract.validateAssetHandoff(value,{expectedPaths:paths}),/canonical stage path/);
  value=bundle();value.assets.MID.sha256='A'.repeat(64);
  assert.throws(()=>contract.validateAssetHandoff(value,{expectedPaths:paths}),/lowercase SHA-256/);
  value=bundle();value.hazards[2].gameplayFacing='right';value.hazards[2].flipX=false;
  assert.throws(()=>contract.validateAssetHandoff(value,{expectedPaths:paths}),/face left/);
  value=bundle();value.hazards[1].crop.l=544;
  assert.throws(()=>contract.validateAssetHandoff(value,{expectedPaths:paths}),/excludes the source anchor/);
});

test('asset-ready cannot claim calibration or release completion',()=>{
  for(const key of ['calibration','release']){
    const value=bundle();value.downstream[key]=key==='release'?'approved':'complete';
    assert.throws(()=>contract.validateAssetHandoff(value),/must remain pending/);
  }
});

test('an asset-ready handoff cannot satisfy the playable stage release gate',()=>{
  const runtime=require('../../src/js/stage-contract.js');
  const value=bundle();
  const stage={id:'af02',legacy:false,status:'asset-ready',release:value};
  assert.equal(runtime.active(stage),false);
  assert.throws(()=>runtime.validateRelease(stage),/incomplete stage release/);
  const complete=JSON.parse(fs.readFileSync(path.join(ROOT,'config/stage-releases.json'),'utf8')).stages.af01;
  for(const key of ['contacts','collision','finish']){
    const pending=structuredClone(complete);delete pending.checks[key];
    assert.throws(()=>runtime.validateRelease({id:'af01',release:pending}),new RegExp(`missing integration check ${key}`));
  }
});
