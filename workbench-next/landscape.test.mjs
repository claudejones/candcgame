import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {Draft,AssetSelection,descriptors,STORAGE_KEY} from './model.mjs';
import {DesignDraft,DESIGN_STORAGE_KEY,LAYERS,landscapeDescriptors,layerGeometry,tileLayer,drawLandscape} from './landscape.mjs';

const context={window:{}}; vm.createContext(context);
for(const file of JSON.parse(fs.readFileSync(new URL('./source-files.json',import.meta.url),'utf8'))) {
  vm.runInContext(fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8'),context);
}
const config=context.window.GAME_CONFIG, registry=context.window.CC_LANDSCAPE_REGISTRY, contract=context.window.CC_LANDSCAPE_CONTRACT;
const legacy=JSON.parse(JSON.stringify(config.worldProfiles)); contract.apply(config,registry);
const scenes=landscapeDescriptors(config,registry,contract), sprites=descriptors(config,context.window.GAME_SCHEMA);
const catalog=JSON.parse(fs.readFileSync(new URL('./asset-catalog.json',import.meta.url)));
const png=key=>fs.readFileSync(new URL(catalog.assets[key].split('?')[0],import.meta.url));

test('all eleven landscapes resolve; active source hashes and geometry match the registry',()=>{
  assert.equal(scenes.length,11);
  for(const scene of scenes) {
    const p=config.worldProfiles[scene.stage];
    for(const layer of LAYERS) {
      const data=png(scene.sources[layer]); assert.equal(data.toString('ascii',1,4),'PNG');
      if(scene.expected) {
        assert.equal(data.readUInt32BE(16),scene.expected[layer].width);
        assert.equal(data.readUInt32BE(20),scene.expected[layer].height);
        assert.ok(createHash('sha256').update(data).digest('hex').startsWith(scene.expected[layer].cacheKey));
        assert.equal(scene.baseline[layer].y,0);
      } else assert.equal(p[layer==='far'?'farY':`${layer}YOffset`],legacy[scene.stage][layer==='far'?'farY':`${layer}YOffset`]);
    }
    const geometry=layerGeometry(config,contract,scene.stage,scene.baseline);
    assert.deepEqual(geometry,contract.geometry(config,scene.stage));
    if(scene.expected) {
      contract.assertCanonical(config,registry,scene.stage);
      assert.equal(geometry.ground.y+393*geometry.ground.scale,410);
      assert.equal(geometry.mid.y+621*geometry.mid.scale,410);
    }
  }
  assert.equal(scenes.find(s=>s.stage==='sa02').status,'approved');
});

test('candidate tile placement matches the existing renderer at rest and through a repeat',()=>{
  const runtime=fs.readFileSync(new URL('../src/js/game-runtime.js',import.meta.url),'utf8');
  const method=runtime.slice(runtime.indexOf(' tileFull('),runtime.indexOf('\n draw(){',runtime.indexOf(' tileFull(')));
  const production=new Function('CONFIG',`return ({${method}});`)(config);
  for(const scene of scenes)for(const layer of LAYERS) {
    const data=png(scene.sources[layer]), image={width:data.readUInt32BE(16),height:data.readUInt32BE(20)};
    const geometry=layerGeometry(config,contract,scene.stage,scene.baseline)[layer];
    for(const scroll of [0,480,1920,4800]) {
      const expected=[],actual=[];
      production.ctx={drawImage(...args){expected.push(args);}};
      const offset=scroll*scene.baseline[layer].parallax;
      production.tileFull(image,offset,geometry.y,geometry.scale,1);
      tileLayer({drawImage(...args){actual.push(args);}},image,geometry,offset);
      assert.deepEqual(actual,expected,`${scene.stage}/${layer} scroll ${scroll}`);
    }
  }
});

test('cloud movement matches runtime elapsed-time drift, order, opacity and stage visibility',()=>{
  const runtime=fs.readFileSync(new URL('../src/js/game-runtime.js',import.meta.url),'utf8');
  const update=runtime.slice(runtime.indexOf(' update(dt,worldScrolls='),runtime.indexOf(' analyzeRows('));
  const tile=runtime.slice(runtime.indexOf(' tileFull('),runtime.indexOf('\n draw(){',runtime.indexOf(' tileFull(')));
  const production=new Function('CONFIG',`return ({${update},${tile}});`)(config);
  const wc=config.worldContract;
  const image=key=>{const data=png(key);return {width:data.readUInt32BE(16),height:data.readUInt32BE(20)};};
  for(const scene of scenes) {
    const p=config.worldProfiles[scene.stage];
    const images={...Object.fromEntries(LAYERS.map(layer=>[layer,image(scene.sources[layer])])),clouds:image('clouds')};
    for(const seconds of [0,1,10,40,1000]) {
      production.worldX=0;production.cloudX=0;production.update(seconds,true);
      const expected=[],actual=[];
      production.ctx={drawImage(...args){expected.push([this.globalAlpha,...args]);}};
      if(p.clouds!==false)production.tileFull(images.clouds,production.cloudX,wc.cloudY,960/(p.sourceW||wc.sourceW)*wc.cloudScale,wc.cloudOpacity);
      const ctx={drawImage(...args){actual.push([this.globalAlpha,...args]);}};
      const options={config,contract,stage:scene.stage,transforms:scene.baseline,images,scroll:production.worldX};
      const canvas={getContext:()=>ctx};drawLandscape(canvas,options);
      assert.deepEqual(actual.filter(call=>call[1]===images.clouds),expected,`${scene.stage}: ${seconds}s`);
      assert.deepEqual([...new Set(actual.map(call=>call[1]))],p.clouds===false
        ?[images.far,images.mid,images.ground]:[images.far,images.clouds,images.mid,images.ground]);
      actual.length=0;drawLandscape(canvas,{...options,visible:{far:true,mid:true,ground:true,clouds:false}});
      assert.equal(actual.some(call=>call[1]===images.clouds),false);
      actual.length=0;drawLandscape(canvas,{...options,view:'layer',layer:'ground'});
      assert.ok(actual.every(call=>call[1]===images.ground));
    }
  }
});

test('mixed sprite/landscape undo, multi-stage save/reload and export retain exact values',()=>{
  const draft=new DesignDraft(sprites,scenes), id='character:constance:slide';
  draft.edit(id,1,{...draft.crop(id,1),l:60});
  draft.editLayer('na01','mid',{...draft.transform('na01','mid'),y:12,x:30});
  draft.editLayer('sa02','ground',{...draft.transform('sa02','ground'),scale:1.1});
  assert.equal(draft.changedFrames,1); assert.equal(draft.changedLayers,2);
  draft.undo(); assert.equal(draft.transform('sa02','ground').scale,1);
  draft.undo(); assert.equal(draft.transform('na01','mid').y,0);
  draft.undo(); assert.equal(draft.crop(id,1).l,55);
  draft.redo();draft.redo();draft.redo();
  let saved;
  draft.save({setItem(key,value){assert.equal(key,DESIGN_STORAGE_KEY);saved=value;}});
  assert.equal(draft.dirty,false);
  const restored=new DesignDraft(sprites,scenes); restored.restore(JSON.parse(saved));
  assert.deepEqual(restored.export(),draft.export());
  assert.equal(restored.transform('sa02','ground').scale,1.1);
  assert.equal(restored.transform('sa01','ground').scale,1);
});

test('invalid landscape restore is atomic; failed saves stay dirty; old crop saves survive migration',()=>{
  const draft=new DesignDraft(sprites,scenes), before=JSON.stringify(draft.export());
  for(const change of [p=>p.landscapes.na01.far.scale=0,p=>p.landscapes.sa02.mid.y=Infinity,
    p=>p.landscapeRevision.sa02.revision='wrong',p=>delete p.landscapes.eu03]) {
    const payload=draft.export();change(payload);assert.throws(()=>draft.restore(payload));
    assert.equal(JSON.stringify(draft.export()),before);
  }
  const old=new Draft(sprites); old.edit('character:constance:slide',1,{l:61,r:0,t:0,b:0});
  const storage=new Map([[STORAGE_KEY,JSON.stringify(old.export())]]), oldBytes=storage.get(STORAGE_KEY);
  draft.restoreSpriteDraft(JSON.parse(oldBytes)); assert.equal(draft.dirty,true);
  assert.throws(()=>draft.save({setItem(){throw new Error('quota');}}));assert.equal(draft.dirty,true);
  draft.save({setItem(key,value){storage.set(key,value);}});
  assert.equal(storage.get(STORAGE_KEY),oldBytes);assert.equal(draft.dirty,false);
  assert.equal(draft.crop('character:constance:slide',1).l,61);
});

test('Stage opens landscapes and remembers a hazard without changing Character selection',()=>{
  const selection=new AssetSelection([...scenes,...sprites]);
  assert.equal(selection.stageId('sa02'),'landscape:sa02');
  selection.remember(sprites.find(i=>i.id==='character:constance:slide'),1);
  selection.remember(sprites.find(i=>i.id==='hazard:na01:2'),3);
  selection.remember(scenes.find(i=>i.stage==='sa02'),0);
  assert.equal(selection.characterId(),'character:constance:slide');
  assert.equal(selection.frameFor(selection.characterId()),1);
  assert.equal(selection.stageId('na01'),'hazard:na01:2');
});
