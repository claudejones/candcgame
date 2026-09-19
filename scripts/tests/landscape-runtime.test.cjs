const test=require('node:test'), assert=require('node:assert/strict'), vm=require('node:vm');
const {load,state,read}=require('../landscape-runtime-state.cjs');
const {versionScripts}=require('../sync-landscape-registry.cjs');
const clone=value=>JSON.parse(JSON.stringify(value));

test('actual host and inner startup agree for every active stage; pending stays legacy',()=>{
  for(const mode of ['host','runtime']) {
    const {config,registry,contract,frame}=load(mode);
    for(const [id,s] of Object.entries(registry.stages)) {
      if(['approved','integrated'].includes(s.status)) contract.assertCanonical(config,registry,id);
    }
    const legacy=load('baseline').config;
    for(const [id,s] of Object.entries(registry.stages)) {
      if(s.status==='pending') assert.deepEqual(clone(config.worldProfiles[id]),clone(legacy.worldProfiles[id]));
    }
    if(mode==='host') assert.equal(new URL(frame.src).searchParams.get('landscapes'),'phase8');
  }
  const pending=Object.entries(load().registry.stages).find(([,s])=>s.status==='pending')?.[0];
  if(pending) {
    assert.throws(()=>state(pending),/pending/);
    assert.equal(state(pending,{preview:true}).mode,'prospective-preview');
  }
});
test('activating any registered future stage requires no additional hardcoded stage list',()=>{
  const registry=clone(load().registry);
  for(const s of Object.values(registry.stages)) s.status='integrated';
  for(const mode of ['runtime','host']) {
    const c=load(mode,registry);
    for(const id of Object.keys(registry.stages)) c.contract.assertCanonical(c.config,registry,id);
  }
});
test('bad source width, offsets or scale fail the actual runtime geometry gate',()=>{
  for(const [key,value] of Object.entries({sourceW:2048,farY:-14,midYOffset:-42,groundYOffset:-8,farScale:1,midScale:0.9})) {
    const c=load(); c.config.worldProfiles.sa01[key]=value;
    assert.throws(()=>c.contract.assertCanonical(c.config,c.registry,'sa01'),new RegExp(key));
  }
});
test('real Scene.draw consumes the same geometry as offline QA',()=>{
  const c=load(), runtime=read('src/js/game-runtime.js');
  c.config.worldContract.showGuides=false;
  c.context.CONFIG=c.config;
  c.context.worldSourceW=()=>c.config.worldProfiles[c.config.activeWorld].sourceW||c.config.worldContract.sourceW;
  c.context.WORLD_LAYER_QA={far:true,clouds:false,mid:true,ground:true};
  vm.runInContext(runtime.slice(runtime.indexOf('class Scene{'),runtime.indexOf('class CharacterMachine{'))+'\nthis.TestScene=Scene;',c.context);
  const sources=c.contract.sources(c.config,c.registry,{});
  for(const [id,s] of Object.entries(c.registry.stages)) {
    if(!c.contract.active(c.registry,id))continue;
    c.config.activeWorld=id;
    const p=c.config.worldProfiles[id],images=Object.fromEntries(['far','mid','ground'].map(l=>[p[`${l}Key`],{layer:l}]));
    const scene=new c.context.TestScene({clearRect(){}},images), calls=[];
    scene.tileFull=(image,x,y,scale)=>calls.push({layer:image.layer,y,scale});
    scene.draw();
    const expected=c.contract.assertCanonical(c.config,c.registry,id);
    for(const call of calls) {
      assert.equal(call.y,expected[call.layer].y);
      assert.equal(call.scale,expected[call.layer].scale);
      assert.equal(sources[p[`${call.layer}Key`]],`../${s.layers[call.layer].validation}?v=${s.layers[call.layer].cacheKey}`);
    }
    assert.equal(scene.lastRenderedSurfaceY,410);
  }
});
test('world reset restores the canonical active stage rather than legacy offsets',()=>{
  const c=load(),controls={}, runtime=read('src/js/game-runtime.js');
  const reset=runtime.split('\n').find(line=>line.includes('$("worldReset").onclick='));
  Object.assign(c.context,{CONFIG:c.config,PHASE8_PILOT:true,$:id=>controls[id]??={},
    world:()=>c.config.worldProfiles[c.config.activeWorld],defaults:{},redrawWorld(){}});
  vm.runInContext(reset,c.context);
  for(const id of ['na01','na02','na03','sa01']) {
    c.config.activeWorld=id;c.config.worldProfiles[id].midYOffset=-42;
    controls.worldReset.onclick();
    c.contract.assertCanonical(c.config,c.registry,id);
  }
});
test('saved legacy landscapes and imports migrate, preserving unrelated edits',()=>{
  const c=load('host');
  vm.runInContext(read('src/js/config-schema.js'),c.context);
  const canonical=c.context.window.GAME_SCHEMA.buildCompatibilityView(c.config), payload=clone(canonical);
  payload.stages.sa01.landscape.mid.source.width=2048;
  payload.stages.sa01.landscape.mid.transform.offsetY=-42;
  delete payload.stages.sa01.landscape.contractVersion;
  payload.stages.sa01.character.grounding.claude=7;
  payload.stages.sa01.hazards[0].crop.l=3;
  // Current-contract intentional authoring edits remain editable, not silently reset.
  payload.stages.na01.landscape.mid.transform.offsetY=2;
  c.context.localStorage={getItem:()=>JSON.stringify(payload),setItem(){},removeItem(){}};
  vm.runInContext(read('src/js/dev/design-draft.js'),c.context);
  const draft=c.context.window.CC_DESIGN_DRAFT;
  assert.equal(draft.getStage('sa01').landscape.mid.transform.offsetY,0);
  assert.equal(draft.getStage('sa01').landscape.mid.source.width,2172);
  assert.equal(draft.getStage('sa01').character.grounding.claude,7);
  assert.equal(draft.getStage('sa01').hazards[0].crop.l,3);
  assert.equal(draft.getStage('na01').landscape.mid.transform.offsetY,2);
  assert.deepEqual(clone(draft.migratedLandscapes),['sa01']);
  const imported=draft.importGame(payload,{save:false});
  assert.equal(imported.stages.sa01.landscape.mid.transform.offsetY,0);
  const invalid=clone(payload);invalid.coordinateContract.groundSurfaceY=411;
  assert.throws(()=>draft.importGame(invalid),/Incompatible/);
});
test('packaged baseline remains legacy; scripts load before their consumers',()=>{
  const c=load('baseline');
  assert.equal(c.config.worldProfiles.sa01.midYOffset,-42);
  assert.equal(c.config.worldProfiles.na01.sourceW,undefined);
  for(const [file,consumer] of [['src/index.html','game-runtime.js'],['src/dev.html','development-bootstrap.js']]) {
    const text=read(file);
    for(const dependency of ['landscape-registry.js','landscape-contract.js']) {
      assert.ok(text.indexOf(dependency)>0 && text.indexOf(dependency)<text.indexOf(consumer));
    }
  }
});
test('a registry revision invalidates both entry-page script references',()=>{
  const old='<script src="./js/landscape-registry.js?v=stale"></script>';
  const first=versionScripts(old,'registry-one');
  assert.notEqual(first,old);
  assert.equal(versionScripts(first,'registry-one'),first);
  assert.notEqual(versionScripts(first,'registry-two'),first);
});
