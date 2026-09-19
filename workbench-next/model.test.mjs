import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {AssetSelection,Draft,descriptors,sourceFrame,validateAtlas,STORAGE_KEY} from './model.mjs';
const context={window:{}}; vm.createContext(context);
for(const file of JSON.parse(fs.readFileSync(new URL('./source-files.json',import.meta.url),'utf8'))) vm.runInContext(fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8'),context);
const items=descriptors(context.window.GAME_CONFIG,context.window.GAME_SCHEMA);

test('stage and character navigation remember independent assets, states and frames',()=>{
  const selection=new AssetSelection(items);
  const remember=(id,frame)=>selection.remember(items.find(item=>item.id===id),frame);
  remember('character:constance:slide',1);
  remember('hazard:sa03:2',0);
  remember('hazard:na01:1',0);
  assert.equal(selection.characterId(),'character:constance:slide');
  assert.equal(selection.frameFor(selection.characterId()),1);
  assert.equal(selection.stageId('sa03'),'hazard:sa03:2');
  assert.equal(selection.stageId('na01'),'hazard:na01:1');
  remember('character:claude:jump',2);
  assert.equal(selection.characterId('constance'),'character:constance:slide');
  assert.equal(selection.characterId('claude'),'character:claude:jump');
  assert.equal(selection.stageId('sa03'),'hazard:sa03:2');
});

test('every character/state and hazard descriptor addresses a real PNG frame',()=>{
  const catalog=JSON.parse(fs.readFileSync(new URL('./asset-catalog.json',import.meta.url)));
  assert.equal(items.filter(i=>i.type==='character').length,12);
  assert.equal(items.filter(i=>i.type==='hazard').length,30);
  for(const item of items){
    const data=fs.readFileSync(new URL(catalog.assets[item.asset].split('?')[0],import.meta.url));
    assert.equal(data.toString('ascii',1,4),'PNG');
    validateAtlas(item,data.readUInt32BE(16),data.readUInt32BE(20));
    for(let frame=0;frame<item.frames;frame++) assert.ok(sourceFrame(item,frame).w>0);
  }
});
test('Constance slide frame 2 keeps approved crop and edits stay independent',()=>{
  const draft=new Draft(items),id='character:constance:slide';
  assert.equal(draft.crop(id,1).l,55); assert.equal(draft.crop(id,0).l,0);
  draft.edit(id,1,{l:60,r:0,t:0,b:0});
  assert.equal(draft.crop(id,0).l,0);assert.equal(draft.crop('character:claude:slide',1).l,0);
  draft.undo();assert.equal(draft.crop(id,1).l,55);
  draft.redo();assert.equal(draft.crop(id,1).l,60);
});
test('save/reload round trip uses only candidate storage and failed write stays dirty',()=>{
  const draft=new Draft(items);draft.edit(items[0].id,0,{l:5,r:0,t:0,b:0});
  assert.throws(()=>draft.save({setItem(){throw new Error('quota')}}));assert.equal(draft.dirty,true);
  let saved;draft.save({setItem(key,value){assert.equal(key,STORAGE_KEY);saved=value;}});
  assert.equal(draft.dirty,false);const next=new Draft(items);next.restore(JSON.parse(saved));assert.deepEqual(next.value,draft.value);
});
test('invalid payload/crop is rejected atomically and cannot destroy current draft',()=>{
  const draft=new Draft(items);const before=JSON.stringify(draft.value),payload=draft.export();
  payload.crops[items[0].id][0].l=99999;
  assert.throws(()=>draft.restore(payload));assert.equal(JSON.stringify(draft.value),before);
  assert.throws(()=>draft.edit(items[0].id,0,{l:NaN,r:0,t:0,b:0}));
  assert.throws(()=>draft.restore({...draft.export(),format:'game-config'}));
});
