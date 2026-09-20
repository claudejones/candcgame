'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createValidationCache}=require('../validation-cache.cjs');

function fixture(){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'validation-cache-'));
  for(const [file,value] of [['asset.bin','asset'],['validator.js','v1'],['config.json','{"v":1}']])fs.writeFileSync(path.join(root,file),value);
  return root;
}
function run(cache,count,metadata={width:1}){
  return cache.run({validator:'fixture',files:['asset.bin'],metadata,dependencies:['validator.js'],canonicalConfig:['config.json']},()=>({runs:++count.value}));
}

test('local validation cache reuses only an intact exact fingerprint',()=>{
  const root=fixture(),count={value:0},cache=createValidationCache({root,env:{}});
  assert.equal(run(cache,count).cached,false);
  assert.equal(run(cache,count).cached,true);
  assert.equal(count.value,1);
  const record=fs.readdirSync(path.join(root,'tmp/validation-cache/fixture'))[0];
  fs.writeFileSync(path.join(root,'tmp/validation-cache/fixture',record),'{}');
  assert.equal(run(cache,count).cached,false);
  assert.equal(count.value,2);
});

test('asset, metadata, validator, and canonical config changes invalidate cached passes',()=>{
  for(const change of [
    root=>fs.writeFileSync(path.join(root,'asset.bin'),'changed'),
    (root,state)=>state.metadata={width:2},
    root=>fs.writeFileSync(path.join(root,'validator.js'),'v2'),
    root=>fs.writeFileSync(path.join(root,'config.json'),'{"v":2}')
  ]){
    const root=fixture(),count={value:0},state={metadata:{width:1}},cache=createValidationCache({root,env:{}});
    run(cache,count,state.metadata);change(root,state);run(cache,count,state.metadata);
    assert.equal(count.value,2);
  }
});

test('CI=true bypasses cache reads and writes',()=>{
  const root=fixture(),count={value:0},local=createValidationCache({root,env:{}});
  run(local,count);
  const ci=createValidationCache({root,env:{CI:'true'}});
  assert.equal(run(ci,count).cached,false);
  assert.equal(run(ci,count).cached,false);
  assert.equal(count.value,3);
});
