import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {Draft,descriptors,STORAGE_KEY} from './model.mjs';
import {DesignDraft,DESIGN_STORAGE_KEY,landscapeDescriptors} from './landscape.mjs';
import {FrameDraft,FRAME_STORAGE_KEY,frameViewBox,drawSprite,hitBounds,dragBounds} from './frame-editor.mjs';
import {fitSize} from './workspace-ui.mjs';
const context={window:{}};vm.createContext(context);
for(const file of ['game-config.js','config-schema.js','landscape-registry.js','landscape-contract.js'])vm.runInContext(fs.readFileSync(new URL('../src/js/'+file,import.meta.url),'utf8'),context);
const config=context.window.GAME_CONFIG,registry=context.window.CC_LANDSCAPE_REGISTRY,contract=context.window.CC_LANDSCAPE_CONTRACT;
contract.apply(config,registry);
const sprites=descriptors(config,context.window.GAME_SCHEMA),landscapes=landscapeDescriptors(config,registry,contract);
const catalog=JSON.parse(fs.readFileSync(new URL('./asset-catalog.json',import.meta.url)));
const create=()=>new FrameDraft(sprites,landscapes,catalog.dimensions);

test('barrel boundary can recover the left edge while other frames and registration stay fixed',()=>{
  const draft=create(),id='hazard:eu01:1',item=draft.items.get(id),before=structuredClone(draft.frames[id]);
  const box=frameViewBox(item,before);
  // Last barrel begins near x=1603, before its old equal-cell boundary at 1629.
  draft.editBounds(id,3,{...draft.bounds(id,3),x:1574,w:598});
  assert.deepEqual(draft.frames[id].slice(0,3),before.slice(0,3));
  assert.deepEqual(frameViewBox(item,draft.frames[id]),box);
  const calls=[],canvas={getContext(){return {drawImage(...args){calls.push(args);}};}};
  drawSprite(canvas,{},item,3,draft.bounds(id,3),draft.crop(id,3),box);
  const [,sx,sy,sw,sh,dx,dy,dw,dh]=calls[0];
  assert.equal(sx,1574);assert.equal(dx,1574-1629-box.x);
  assert.equal(sw,dw);assert.equal(sh,dh);assert.equal(sy,0);assert.equal(dy,-box.y);
  draft.undo();assert.deepEqual(draft.frames[id],before);draft.redo();assert.equal(draft.bounds(id,3).x,1574);
});
test('character rows, neighboring poses and approved fine crop remain independent',()=>{
  const draft=create(),id='character:constance:slide';
  draft.editBounds(id,1,{...draft.bounds(id,1),x:690,w:710});
  assert.equal(draft.crop(id,1).l,55);assert.equal(draft.crop(id,0).l,0);
  assert.equal(draft.bounds(id,0).x,0);assert.equal(draft.bounds('character:claude:slide',1).x,700);
  assert.equal(draft.bounds(id,1).y,700);
  assert.throws(()=>draft.editBounds(id,1,{...draft.bounds(id,1),w:40}));
  assert.throws(()=>draft.edit(id,1,{l:-1,r:0,t:0,b:0}));
});
test('dragging clamps to atlas, keeps crop valid and commits one undo step',()=>{
  const draft=create(),id='hazard:eu01:1',start=draft.bounds(id,3),size=draft.size(id),crop=draft.crop(id,3);
  assert.equal(hitBounds({x:1629,y:300},start,8),'w');
  assert.equal(hitBounds({x:1800,y:300},start,8),'move');
  assert.equal(hitBounds({x:1500,y:300},start,8),null);
  let next;for(let dx=-1;dx>=-55;dx--)next=dragBounds(start,'w',dx,0,size,crop);
  assert.equal(draft.past.length,0);draft.editBounds(id,3,next);assert.equal(draft.past.length,1);
  assert.equal(next.x,1574);assert.equal(next.w,598);
  assert.equal(dragBounds(start,'move',900,900,size,crop).x,1629);
  assert.equal(dragBounds(start,'w',900,0,size,{l:55,r:0,t:0,b:0}).w,56);
});
test('v3 boundaries/crops/layers save together; invalid restores are atomic',()=>{
  const draft=create(),id='hazard:eu01:1';
  draft.editBounds(id,3,{x:1574,y:0,w:598,h:724});
  // Valid crop larger than the old cell width must restore against the edited boundary.
  draft.edit(id,3,{l:550,r:0,t:0,b:0});
  draft.editLayer('sa02','mid',{...draft.transform('sa02','mid'),y:8});
  assert.throws(()=>draft.save({setItem(){throw new Error('quota');}}));assert.equal(draft.dirty,true);
  let saved;draft.save({setItem(key,value){assert.equal(key,FRAME_STORAGE_KEY);saved=value;}});
  const restored=create();restored.restore(JSON.parse(saved));assert.deepEqual(restored.export(),draft.export());assert.equal(restored.dirty,false);
  for(const change of [p=>p.frames[id][3].x=-1,p=>p.frames[id][3].w=9000,p=>p.sprites.crops[id][3].l=-1,p=>p.sprites.crops.extra=[]]){
    const payload=draft.export(),before=JSON.stringify(restored.export());change(payload);
    assert.throws(()=>restored.restore(payload));assert.equal(JSON.stringify(restored.export()),before);
  }
});
test('v1/v2 recovery retains older keys and adds boundaries without losing prior edits',()=>{
  const old=new DesignDraft(sprites,landscapes);old.edit('character:constance:slide',1,{l:60,r:0,t:0,b:0});old.editLayer('na01','ground',{...old.transform('na01','ground'),y:5});
  const storage=new Map([[DESIGN_STORAGE_KEY,JSON.stringify(old.export())]]),before=storage.get(DESIGN_STORAGE_KEY);
  const draft=create();draft.restore(JSON.parse(before));assert.equal(draft.dirty,true);
  assert.equal(draft.crop('character:constance:slide',1).l,60);assert.equal(draft.transform('na01','ground').y,5);
  draft.save({setItem:(key,value)=>storage.set(key,value)});assert.equal(storage.get(DESIGN_STORAGE_KEY),before);
  const v1=new Draft(sprites);v1.edit('character:constance:slide',1,{l:59,r:0,t:0,b:0});
  storage.set(STORAGE_KEY,JSON.stringify(v1.export()));const recovered=create();recovered.restoreSpriteDraft(JSON.parse(storage.get(STORAGE_KEY)));
  assert.equal(recovered.crop('character:constance:slide',1).l,59);assert.equal(recovered.dirty,true);
});
test('fit respects both dimensions at laptop, short-window, comparison and focus sizes',()=>{
  for(const [width,height] of [[760,310],[480,180],[320,380],[1320,650]])for(const [sw,sh] of [[960,540],[700,700],[2172,724]]){
    const size=fitSize(width,height,sw,sh);
    assert.ok(size.width<=width+0.001&&size.height<=height+0.001);assert.ok(Math.abs(size.width/size.height-sw/sh)<0.001);
  }
  assert.deepEqual(fitSize(400,200,960,540,'1'),{width:960,height:540});
});
