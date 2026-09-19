const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const {load,read}=require('../landscape-runtime-state.cjs');
const stageContract=require('../../src/js/stage-contract.js');
const {build}=require('../stage-catalog.cjs');
const clone=x=>JSON.parse(JSON.stringify(x));
function fixture(){
  const catalog=build(),registry=clone(load().registry),stage=catalog.stages.af01;
  stage.status='integrated';registry.stages.af01.status='integrated';
  for(const layer of Object.values(registry.stages.af01.layers))layer.cacheKey='aaaaaaaa';
  stage.release={status:'integrated',assets:Object.fromEntries(Object.entries(stage.files).map(([k,path])=>[k,{path,sha256:'a'.repeat(64)}])),checks:Object.fromEntries(['technical','composition','contacts','animation','collision','finish'].map(k=>[k,true])),finish:{scale:.22,groundOffset:24,xOffset:-4},signature:[{time:75.2,hazard:'GROUND1',speedClass:'normal'},{time:78,hazard:'FLYING',mode:'high',speedClass:'normal'}],hazards:[0,1,2].map(i=>({name:'Synthetic fixture '+i,kind:i<2?'ground':'flying',atlasKey:'af01'+(i<2?'Hazards':'Bird'),...(i<2?{rect:{x:i*1086,y:0,w:1086,h:724},groundOffset:0}:{frames:4,frameW:543,frameH:724,fps:8}),sourceAnchor:i<2?{x:543,y:620}:{x:271,y:362},scale:.3,cw:.4,ch:.3,cx:0,cy:0,crop:{l:0,r:0,t:0,b:0}}))};
  return {catalog,registry};
}
test('all 21 keys registered; pending images are neither loaded nor selectable',()=>{
  const catalog=build();assert.equal(Object.keys(catalog.stages).length,21);
  const c=load('host');assert.equal(Object.keys(c.config.worldProfiles).length,9);
  assert.equal(c.config.worldProfiles.af01,undefined);assert.deepEqual(stageContract.sources(catalog),{});
  assert.equal(stageContract.continents(catalog,c.config).length,3);
});
test('complete new stage activates identically in host and inner runtime; incomplete release fails',()=>{
  const {catalog,registry}=fixture();
  for(const mode of ['host','runtime','baseline']){
    const c=load(mode,registry,catalog);c.contract.assertCanonical(c.config,c.registry,'af01');
    if(mode==='baseline')assert.equal(c.config.worldProfiles.na01.sourceW,undefined);
    assert.equal(c.config.objectQA.defs.af01.length,3);
    assert.equal(stageContract.continents(catalog,c.config).at(-1).id,'africa');
    assert.equal(stageContract.sources(catalog).af01Bird,'../'+catalog.stages.af01.files.FLYING+'?v=aaaaaaaa');
  }
  const broken=clone(catalog);broken.stages.af01.release.checks.contacts=false;
  assert.throws(()=>load('runtime',registry,broken),/contacts/);
  const wrong=clone(catalog);wrong.stages.af01.release.assets.FLYING.path='elsewhere.png';
  assert.throws(()=>load('runtime',registry,wrong),/mismatched/);
});
test('source anchors preserve ground/flight contacts through scale and asymmetric crop',()=>{
  for(const anchor of [{x:543,y:620},{x:271,y:362}])for(const scale of [.12,.3,.8]){
    const crop={l:33,t:50},p=stageContract.place({sourceAnchor:anchor},650,410,crop,scale,{});
    assert.equal(p.dx+(anchor.x-crop.l)*scale,650);assert.equal(p.dy+(anchor.y-crop.t)*scale,410);
  }
  assert.deepEqual(stageContract.place({},650,410,{},.3,{dx:12,dy:24}),{dx:12,dy:24});
});
test('old nine-stage authoring imports retain edits and gain defaults for new active stage',()=>{
  const old=load('host');vm.runInContext(read('src/js/config-schema.js'),old.context);
  const payload=clone(old.context.window.GAME_SCHEMA.buildCompatibilityView(old.config));payload.stages.na01.hazards[0].crop.l=3;
  payload.stages.af02={savedFutureData:'preserve without making playable'};
  const {catalog,registry}=fixture(),c=load('host',registry,catalog);
  vm.runInContext(read('src/js/config-schema.js'),c.context);
  c.context.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
  vm.runInContext(read('src/js/dev/design-draft.js'),c.context);
  const result=c.context.window.CC_DESIGN_DRAFT.importGame(payload,{save:false});
  assert.equal(result.stages.na01.hazards[0].crop.l,3);assert.equal(result.stages.af01.hazards.length,3);
  assert.equal(result.stages.af02.savedFutureData,'preserve without making playable');
  assert.equal(c.config.worldProfiles.af02,undefined);
  assert.deepEqual(clone(result.stages.af01.hazards[0].atlas.sourceAnchor),{x:543,y:620});
  delete payload.stages.na01;assert.throws(()=>c.context.window.CC_DESIGN_DRAFT.importGame(payload),/missing na01/);
});
test('real object preview and gameplay renderers agree on new ground and flight anchors',()=>{
  const {catalog,registry}=fixture(),c=load('runtime',registry,catalog),source=read('src/js/game-runtime.js');
  c.context.CONFIG=c.config;
  vm.runInContext(source.slice(source.indexOf('class ObjectQA{'),source.indexOf('class Lab{'))+'\nthis.Preview=ObjectQA;this.Director=GameplayDirector;',c.context);
  c.config.activeWorld='af01';
  for(const index of [0,2]){
    const d=c.config.objectQA.defs.af01[index];d.crop={l:40,r:32,t:45,b:32};
    if(index===2)d.frameCrops=[{l:60,r:35,t:70,b:35},d.crop,d.crop,d.crop];
    c.config.objectQA.activeIndex.af01=index;c.config.objectQA.showBounds=false;c.config.objectQA.x=650;
    const draws=[],ctx={drawImage(...v){draws.push(v);}},scene={lastRenderedSurfaceY:410},character={last:{},character:'claude',state:'run'};
    const preview=new c.context.Preview(ctx,{[d.atlasKey]:{}},scene,character);preview.draw();
    const director=Object.create(c.context.Director.prototype);director.objectQA=preview;
    const g=director.geom({x:650,frame:0,mode:c.config.objectQA.flying.mode},d),draw=draws[0];
    assert.equal(draw[5],Math.round(g.dx));assert.equal(draw[6],Math.round(g.dy));
  }
});
test('older full QA snapshot preserves integrated additions and cannot inject pending profiles',()=>{
  const {catalog,registry}=fixture(),c=load('runtime',registry,catalog),source=read('src/js/game-runtime.js');
  const old=load('baseline').config;
  const snapshot={schema:'CC_WORLD_QA_SNAPSHOT_12',world:{profiles:clone(old.worldProfiles)},hazards:{definitions:clone(old.objectQA.defs)},gameplay:{finish:clone(old.finish)},activeContext:{stage:'af01'}};
  snapshot.world.profiles.af02={label:'must not become playable'};
  c.context.CONFIG=c.config;c.context.PHASE8_PILOT=true;c.context.performance={now:()=>0};
  c.context.lab={character:{setState(){}},scene:{},objectQA:{resetPass(){}},gameplay:{reset(){}},draw(){},renderUI(){}};
  const start=source.indexOf('   const applyFullQASnapshot=(snap)=>{'),end=source.indexOf('\n   $("debugToggle")',start);
  vm.runInContext('(function(){'+source.slice(start,end)+'this.applySnapshot=applyFullQASnapshot;}).call(lab);',c.context);
  c.context.lab.applySnapshot(snapshot);
  assert.equal(c.config.worldProfiles.af01.label,catalog.stages.af01.label);
  assert.equal(c.config.worldProfiles.af02,undefined);
  assert.equal(c.config.objectQA.defs.af01.length,3);
  assert.equal(c.config.finish.stages.af01.scale,.22);
  c.contract.assertCanonical(c.config,c.registry,'af01');
});
test('release rejects illegal crop, wrong frame layout, and unmeasured finish/signature',()=>{
  for(const mutate of [s=>s.release.hazards[0].crop.t=621,s=>s.release.hazards[2].frames=3,s=>delete s.release.finish.scale,s=>s.release.signature[0].time=90]){
    const s=fixture().catalog.stages.af01;mutate(s);assert.throws(()=>stageContract.validateRelease(s));
  }
});
