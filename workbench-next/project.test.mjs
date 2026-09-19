import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {Draft,descriptors,STORAGE_KEY} from './model.mjs';
import {DesignDraft,DESIGN_STORAGE_KEY,landscapeDescriptors} from './landscape.mjs';
import {FrameDraft,FRAME_STORAGE_KEY} from './frame-editor.mjs';
import {ProjectDraft,StageSelection,projectProvenance,PROJECT_STORAGE_KEY,RECOVERY_KEY,UNREADABLE_KEY} from './project.mjs';
const context={window:{}};vm.createContext(context);
for(const file of ['game-config.js','config-schema.js','landscape-registry.js','landscape-contract.js'])vm.runInContext(fs.readFileSync(new URL('../src/js/'+file,import.meta.url),'utf8'),context);
const config=context.window.GAME_CONFIG,registry=context.window.CC_LANDSCAPE_REGISTRY,contract=context.window.CC_LANDSCAPE_CONTRACT;
contract.apply(config,registry);
const sprites=descriptors(config,context.window.GAME_SCHEMA),landscapes=landscapeDescriptors(config,registry,contract);
const catalog=JSON.parse(fs.readFileSync(new URL('./asset-catalog.json',import.meta.url)));
const provenance=projectProvenance(catalog,sprites,landscapes);
const create=()=>new ProjectDraft(sprites,landscapes,catalog.dimensions,provenance);
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
  const selection=new StageSelection(landscapes,registry);
  assert.equal(selection.groups.size,3);assert.equal(selection.groups.get('Europe').length,3);
  selection.remember('na03');assert.equal(selection.choose('South America'),'sa01');selection.remember('sa02');
  assert.equal(selection.choose('North America'),'na03');assert.equal(selection.choose('South America'),'sa02');
  assert.equal(selection.choose('Europe'),'eu01');assert.throws(()=>selection.choose('Unavailable'));
  assert.equal(landscapes.length,9);
});
