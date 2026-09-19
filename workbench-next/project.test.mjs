import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {Draft,descriptors,STORAGE_KEY} from './model.mjs';
import {DesignDraft,DESIGN_STORAGE_KEY,landscapeDescriptors} from './landscape.mjs';
import {FrameDraft,FRAME_STORAGE_KEY} from './frame-editor.mjs';
import {ProjectDraft,StageSelection,projectProvenance,PROJECT_STORAGE_KEY,RECOVERY_KEY,UNREADABLE_KEY,ARTWORK_RECOVERY_KEY} from './project.mjs';
const context={window:{}};vm.createContext(context);
for(const file of JSON.parse(fs.readFileSync(new URL('./source-files.json',import.meta.url),'utf8')))vm.runInContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),context);
const config=context.window.GAME_CONFIG,registry=context.window.CC_LANDSCAPE_REGISTRY,contract=context.window.CC_LANDSCAPE_CONTRACT;
contract.apply(config,registry);
const sprites=descriptors(config,context.window.GAME_SCHEMA),landscapes=landscapeDescriptors(config,registry,contract);
const catalog=JSON.parse(fs.readFileSync(new URL('./asset-catalog.json',import.meta.url)));
const provenance=projectProvenance(catalog,sprites,landscapes);
const create=()=>new ProjectDraft(sprites,landscapes,catalog.dimensions,provenance,catalog.migrations,config);
function storage(entries=[]) {const data=new Map(entries);return {data,getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};}
function revise(draft) {
  draft.editLayer('na01','ground',{...draft.transform('na01','ground'),x:-18,y:9});
  draft.editLayer('sa03','mid',{...draft.transform('sa03','mid'),scale:1.3});
  draft.edit('character:constance:slide',1,{l:61,r:0,t:0,b:0});
  draft.edit('character:claude:run',2,{l:4,r:5,t:0,b:3});
  draft.editBounds('hazard:eu01:1',3,{x:1574,y:0,w:598,h:724});
  draft.edit('hazard:eu01:1',3,{l:550,r:0,t:0,b:0});
}
test('whole-project export/import/save/reload includes unvisited stages, both characters and expanded atlas crops',()=>{
  const source=create();revise(source);const target=create(),saved=storage();target.load(saved);
  const original=target.export(),review=target.prepareImport(JSON.parse(JSON.stringify(source.export())));
  assert.ok(review.rows.some(row=>row.scope.startsWith('SA03')));assert.ok(review.rows.some(row=>row.scope.startsWith('Constance')));
  assert.deepEqual(target.export(),original);assert.equal(saved.data.size,0);
  target.applyImport(review,saved);assert.deepEqual(target.export(),source.export());assert.equal(target.dirty,true);
  assert.equal(saved.getItem(PROJECT_STORAGE_KEY),null);assert.deepEqual(JSON.parse(saved.getItem(RECOVERY_KEY)).project,original);
  target.save(saved);assert.equal(target.dirty,false);const restored=create();restored.load(saved);
  assert.deepEqual(restored.export(),source.export());assert.equal(restored.dirty,false);
});
test('import is one undo step across scopes, preserves previous edits and keeps saved-state semantics',()=>{
  const target=create(),saved=storage();target.load(saved);
  target.editLayer('eu02','far',{...target.transform('eu02','far'),x:12});target.save(saved);
  const before=target.export(),source=create();revise(source);
  const review=target.prepareImport(source.export());assert.ok(review.rows.some(row=>row.scope==='EU02'&&row.before===12&&row.after===0));
  target.applyImport(review,saved);assert.equal(target.past.length,2);
  target.undo();assert.deepEqual(target.export(),before);assert.equal(target.dirty,false);
  target.redo();assert.deepEqual(target.export(),source.export());target.save(saved);
  target.undo();assert.equal(target.dirty,true);assert.deepEqual(target.export(),before);
  const restored=create();restored.load(saved);const recovered=restored.prepareImport(JSON.parse(saved.getItem(RECOVERY_KEY)).project);
  restored.applyImport(recovered,saved);assert.deepEqual(restored.export(),before);
});
test('invalid payloads and artwork mismatches cannot mutate the working draft or browser save',()=>{
  const target=create(),saved=storage();target.load(saved);revise(target);target.save(saved);
  const before=target.export(),history=structuredClone(target.past),stored=[...saved.data];
  const invalid=[
    p=>p.format='game-config',p=>p.design.extra=true,p=>p.provenance.assets.run.sha256='wrong',
    p=>p.design.frames['hazard:eu01:1'][3].x=-2,
    p=>p.design.sprites.crops['character:claude:run']={length:4},
    p=>delete p.design.landscapes.na01,
    p=>p.design.landscapes.na01.mid.scale='1',
    p=>p.design.sprites.crops['character:constance:slide'][1].l=9999,
    p=>p.design.sprites.baseline='different',p=>p.savedAt='yesterday',
    p=>p.design.frames['character:claude:run'].push({x:0,y:0,w:1,h:1})
  ];
  for(const mutate of invalid){const payload=target.export();mutate(payload);assert.throws(()=>target.prepareImport(payload));assert.deepEqual(target.export(),before);assert.deepEqual(target.past,history);assert.deepEqual([...saved.data],stored);}
  const review=target.prepareImport(create().export());target.editLayer('eu01','mid',{...target.transform('eu01','mid'),x:1});
  assert.throws(()=>target.applyImport(review,saved),/working draft changed/);
});
test('quota failure and another tab cannot overwrite a save or apply an import without recovery',()=>{
  const target=create(),saved=storage();target.load(saved);target.save(saved);const prior=saved.getItem(PROJECT_STORAGE_KEY);
  const source=create();revise(source);const review=target.prepareImport(source.export()),original=target.export();
  const failing={getItem:saved.getItem,setItem(){throw new Error('quota');}};
  assert.throws(()=>target.applyImport(review,failing),/quota/);assert.deepEqual(target.export(),original);assert.equal(target.past.length,0);
  revise(target);assert.throws(()=>target.save(failing),/quota/);assert.equal(target.dirty,true);assert.equal(saved.getItem(PROJECT_STORAGE_KEY),prior);
  saved.setItem(PROJECT_STORAGE_KEY,'newer tab save');
  assert.throws(()=>target.save(saved),/Another tab/);assert.throws(()=>target.applyImport(target.prepareImport(create().export()),saved),/Another tab/);
  assert.equal(saved.getItem(PROJECT_STORAGE_KEY),'newer tab save');
});
test('v1, v2 and v3 browser drafts migrate without modifying the original keys',()=>{
  for(const [Type,key] of [[Draft,STORAGE_KEY],[DesignDraft,DESIGN_STORAGE_KEY],[FrameDraft,FRAME_STORAGE_KEY]]) {
    const old=new Type(sprites,landscapes,catalog.dimensions);old.edit('character:constance:slide',1,{l:62,r:0,t:0,b:0});
    if(old.editLayer)old.editLayer('na03','ground',{...old.transform('na03','ground'),x:3});
    const raw=JSON.stringify(old.export()),saved=storage([[key,raw]]),target=create();target.load(saved);
    assert.equal(target.crop('character:constance:slide',1).l,62);assert.equal(target.dirty,true);
    const review=target.prepareImport(old.export());assert.ok(review.notes.length);
    target.save(saved);assert.equal(saved.getItem(key),raw);assert.equal(create().decode(JSON.parse(saved.getItem(PROJECT_STORAGE_KEY))).state.crops['character:constance:slide'][1].l,62);
  }
});
test('unreadable saves remain recoverable and JSON key order does not affect compatibility',()=>{
  const raw='{broken',saved=storage([[PROJECT_STORAGE_KEY,raw]]),target=create();
  assert.throws(()=>target.load(saved));assert.equal(saved.getItem(PROJECT_STORAGE_KEY),raw);
  revise(target);target.save(saved);assert.equal(saved.getItem(UNREADABLE_KEY),raw);
  const reorder=value=>Array.isArray(value)?value.map(reorder):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).reverse().map(key=>[key,reorder(value[key])])):value;
  assert.equal(target.prepareImport(reorder(target.export())).rows.length,0);
});
test('Continent → Stage remembers each continent and includes only available stages',()=>{
  const selection=new StageSelection(landscapes,registry,context.window.CC_STAGE_CATALOG);
  assert.equal(selection.groups.size,4);assert.equal(selection.groups.get('Europe').length,3);
  selection.remember('na03');assert.equal(selection.choose('South America'),'sa01');selection.remember('sa02');
  assert.equal(selection.choose('North America'),'na03');assert.equal(selection.choose('South America'),'sa02');
  assert.equal(selection.choose('Europe'),'eu01');assert.equal(selection.choose('Africa'),'af01');assert.throws(()=>selection.remember('af02'));assert.throws(()=>selection.choose('Unavailable'));
  assert.equal(landscapes.length,10);
});

function beforeArtworkRefresh(Type=FrameDraft,previous=catalog.migrations[0]) {
  const definitions=landscapes.filter(i=>previous.landscapeRevision[i.stage]).map(item=>({...item,...previous.landscapeRevision[item.stage]}));
  return new Type(sprites.filter(i=>i.type==='character'||previous.landscapeRevision[i.stage]),definitions,previous.atlasDimensions);
}
function historicalProject(design,migration){
 const p=create().export();p.format='cc-workbench-next-project-v7';p.provenance=structuredClone(migration.fromProvenance);p.design=design;
 for(const id of Object.keys(p.placement)){const [type,stage]=id.split(':');if((type==='hazard'||type==='grounding')&&!migration.landscapeRevision[stage])delete p.placement[id];else if(type==='hazard')for(const k of ['flipX','highOffsetY','lowOffsetY'])delete p.placement[id][k];}
 for(const id of Object.keys(p.calibration.stages))if(!migration.landscapeRevision[id])delete p.calibration.stages[id];
 for(const id of Object.keys(p.calibration.hazards))if(!migration.landscapeRevision[id.split(':')[1]])delete p.calibration.hazards[id];return p;
}
test('approved landscape refresh preserves saved sprite edits and custom settings while migrating untouched defaults',()=>{
  const old=beforeArtworkRefresh();old.editBounds('hazard:eu01:1',3,{x:1574,y:0,w:598,h:724});
  old.edit('character:constance:slide',1,{l:63,r:0,t:0,b:0});
  old.editLayer('sa03','mid',{...old.transform('sa03','mid'),y:17});
  old.editLayer('na01','ground',{...old.transform('na01','ground'),x:21});
  const previous={...historicalProject(old.export(),catalog.migrations[0]),savedAt:'2026-09-19T05:00:00.000Z'};
  const raw=JSON.stringify(previous),saved=storage([[PROJECT_STORAGE_KEY,raw]]),target=create();
  assert.match(target.load(saved),/Landscape artwork updated/);assert.equal(target.dirty,true);
  assert.equal(target.crop('character:constance:slide',1).l,63);assert.equal(target.bounds('hazard:eu01:1',3).x,1574);
  assert.equal(target.transform('sa03','mid').y,17);assert.equal(target.transform('na01','ground').x,21);
  for(const layer of ['far','mid','ground'])assert.deepEqual(target.transform('eu01',layer),target.landscapeBaseline.eu01[layer]);
  assert.equal(saved.getItem(PROJECT_STORAGE_KEY),raw);
  assert.throws(()=>target.save({getItem:saved.getItem,setItem(){throw new Error('quota');}}));assert.equal(saved.getItem(PROJECT_STORAGE_KEY),raw);
  target.save(saved);assert.equal(saved.getItem(ARTWORK_RECOVERY_KEY),raw);assert.equal(target.dirty,false);
  const restored=create();restored.load(saved);assert.deepEqual(restored.export(),target.export());assert.equal(restored.migrated,false);
});
test('older Design imports receive the same bounded artwork migration; unknown source revisions remain rejected',()=>{
  for(const Type of [DesignDraft,FrameDraft]) {
    const old=beforeArtworkRefresh(Type);old.edit('character:claude:run',1,{l:9,r:0,t:0,b:0});
    const target=create(),review=target.prepareImport(old.export());
    assert.ok(review.notes.some(note=>note.includes('Landscape artwork updated')));
    target.applyImport(review,storage());assert.equal(target.crop('character:claude:run',1).l,9);
    assert.equal(target.transform('eu01','far').y,0);assert.equal(target.transform('sa03','ground').y,0);
  }
  const payload=historicalProject(beforeArtworkRefresh().export(),catalog.migrations[0]);
  payload.provenance.assets.run.sha256='unexpected';assert.throws(()=>create().prepareImport(payload),/different artwork/);
  const target=create();target.provenance.baseline='future-unsupported-source';assert.throws(()=>target.prepareImport({...payload,provenance:catalog.migrations[0].fromProvenance}),/different artwork/);
});

test('EU02/EU03 refresh retains Review 05.1/05.2 saved edits and recovers the previous checkpoint',()=>{
  const migration=catalog.migrations.find(m=>m.id==='review051-052-to-europe-refresh');assert.ok(migration);
  const old=beforeArtworkRefresh(FrameDraft,migration);
  old.editLayer('eu02','mid',{...old.transform('eu02','mid'),y:19,parallax:0.35});
  old.editLayer('eu03','ground',{...old.transform('eu03','ground'),x:31});
  old.editLayer('eu01','far',{...old.transform('eu01','far'),scale:1.3});
  old.editBounds('hazard:eu01:1',3,{x:1574,y:0,w:598,h:724});
  old.edit('character:claude:run',0,{l:7,r:0,t:0,b:0});
  const raw=JSON.stringify({...historicalProject(old.export(),migration),savedAt:'2026-09-19T06:00:00.000Z'});
  const saved=storage([[PROJECT_STORAGE_KEY,raw]]),target=create();
  assert.match(target.load(saved),/EU02 and EU03/);assert.equal(target.dirty,true);
  assert.equal(target.transform('eu02','mid').y,19);assert.equal(target.transform('eu02','mid').parallax,0.35);
  assert.equal(target.transform('eu03','ground').x,31);assert.equal(target.transform('eu03','ground').y,0);
  assert.equal(target.transform('eu01','far').scale,1.3);
  assert.deepEqual(target.transform('eu02','far'),target.landscapeBaseline.eu02.far);
  assert.deepEqual(target.transform('eu03','mid'),target.landscapeBaseline.eu03.mid);
  assert.equal(target.bounds('hazard:eu01:1',3).x,1574);assert.equal(target.crop('character:claude:run',0).l,7);
  assert.equal(saved.getItem(PROJECT_STORAGE_KEY),raw);
  target.save(saved);assert.equal(saved.getItem(ARTWORK_RECOVERY_KEY),raw);
  const restored=create();restored.load(saved);assert.deepEqual(restored.export(),target.export());
  assert.equal(restored.migrated,false);assert.equal(restored.dirty,false);
});

test('every supported pre-refresh Design export receives Europe defaults without losing custom values',()=>{
  for(const migration of catalog.migrations)for(const Type of [DesignDraft,FrameDraft]) {
    const old=beforeArtworkRefresh(Type,migration);old.editLayer('eu03','mid',{...old.transform('eu03','mid'),y:23});
    old.edit('character:constance:slide',1,{l:62,r:0,t:0,b:0});
    const target=create(),review=target.prepareImport(old.export());target.applyImport(review,storage());
    assert.equal(target.transform('eu03','mid').y,23);assert.equal(target.crop('character:constance:slide',1).l,62);
    for(const stage of ['eu02','eu03'])assert.deepEqual(target.transform(stage,'far'),target.landscapeBaseline[stage].far);
    assert.equal(target.transform('eu03','ground').y,0);
    assert.ok(review.notes.some(note=>note.includes('Source & status')||note.includes('Added AF01')));
  }
});
