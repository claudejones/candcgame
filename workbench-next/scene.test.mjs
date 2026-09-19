import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {descriptors} from './model.mjs';
import {landscapeDescriptors} from './landscape.mjs';
import {defaultBounds} from './frame-editor.mjs';
import {ProjectDraft,projectProvenance,PROJECT_STORAGE_KEY,PREVIOUS_PROJECT_FORMAT} from './project.mjs';
import {SceneClock,STEP,characterGeometry,hazardGeometry,poseFrame} from './scene-model.mjs';
const context={window:{}};vm.createContext(context);
for(const f of ['game-config.js','config-schema.js','landscape-registry.js','landscape-contract.js'])vm.runInContext(fs.readFileSync(new URL('../src/js/'+f,import.meta.url),'utf8'),context);
const w=context.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);
const items=descriptors(config,w.GAME_SCHEMA),landscapes=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog=JSON.parse(fs.readFileSync(new URL('./asset-catalog.json',import.meta.url)));
const make=()=>new ProjectDraft(items,landscapes,catalog.dimensions,projectProvenance(catalog,items,landscapes),catalog.migrations,config);
const memory=()=>{const map=new Map();return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};};
const runtime=fs.readFileSync(new URL('../src/js/game-runtime.js',import.meta.url),'utf8');
const charClass=runtime.slice(runtime.indexOf('class CharacterMachine{'),runtime.indexOf('class ObjectQA{'));
const objectClass=runtime.slice(runtime.indexOf('class ObjectQA{'),runtime.indexOf('class GameplayDirector{'));
const calls=geometry=>[geometry.source.x,geometry.source.y,geometry.source.w,geometry.source.h,...['x','y','w','h'].map(k=>Math.round(geometry.dest[k]))];

test('every character pose matches production draw geometry; stage grounding is independent of artwork offsets',()=>{
  const draft=make(),cfg=structuredClone(config);
  const Character=new Function('CONFIG','CHAR','worldSourceW',charClass+';return CharacterMachine;')(cfg,{claude:{row:0},constance:{row:1}},()=>cfg.worldProfiles[cfg.activeWorld].sourceW||cfg.worldContract.sourceW);
  for(const stage of ['na01','sa03','eu03'])for(const item of items.filter(i=>i.type==='character'))for(let frame=0;frame<item.frames;frame++) {
    cfg.activeWorld=stage;const who=item.id.split(':')[1],expected=[];
    const actor=new Character({[item.state]:{}});Object.assign(actor,{character:who,state:item.state,frame});actor.starsVisible=()=>false;
    actor.draw({drawImage(...args){expected.push(args.slice(1));}});
    const g=characterGeometry(cfg,item,frame,defaultBounds(item,frame),item.crops[frame],{...draft.placement,groundOffset:draft.placement[`grounding:${stage}:${who}`].groundOffset});
    assert.deepEqual(calls(g),expected[0],`${stage}/${item.id}/${frame}`);
    const shifted=characterGeometry(cfg,item,frame,defaultBounds(item,frame),item.crops[frame],{...draft.placement,groundOffset:11});
    assert.equal(shifted.foot-g.foot,11);assert.ok(Math.abs(shifted.dest.y-g.dest.y-11)<1e-8);
  }
});

test('all hazard poses, HIGH/LOW anchors and traveling passes match production geometry and collision boxes',()=>{
  const draft=make(),cfg=structuredClone(config);cfg.objectQA.showBounds=false;cfg.objectQA.scrollWithWorld=true;
  const ObjectQA=new Function('CONFIG',objectClass+';return ObjectQA;')(cfg);
  for(const item of items.filter(i=>i.type==='hazard'))for(const flight of ['high','low'])for(const time of [0,2,8,25])for(let frame=0;frame<item.frames;frame++) {
    cfg.activeWorld=item.stage;cfg.objectQA.activeIndex[item.stage]=Number(item.id.split(':')[2]);
    Object.assign(cfg.objectQA.flying,{frame,travel:time*cfg.objectQA.flying.speed,mode:flight});
    const expected=[],scene={worldX:time*cfg.worldSpeed,lastRenderedSurfaceY:410};
    const object=new ObjectQA({drawImage(...args){expected.push(args.slice(1));}},{[item.asset]:{}},scene,{});object.characterBox=()=>({x:0,y:0,w:1,h:1});object.draw();
    const g=hazardGeometry(cfg,item,frame,defaultBounds(item,frame),item.crops[frame],draft.placement[item.id],{time,flight});
    assert.deepEqual(calls(g),expected[0],`${item.id}/${frame}/${flight}/${time}`);
    for(const k of ['x','y','w','h'])assert.ok(Math.abs(g.collision[k]-object.lastObjectBox[k])<1e-8,k);
  }
});

test('fixed scene steps, slow motion, freeze/resume, restart and unavailable scenes share one clock',()=>{
  let available=true,paints=0;const queue=new Map();let id=0;
  const c=new SceneClock({available:()=>available,paint:()=>paints++,request:cb=>{queue.set(++id,cb);return id;},cancel:id=>queue.delete(id)});
  const tick=now=>{assert.equal(queue.size,1);const [id,cb]=queue.entries().next().value;queue.delete(id);cb(now);};
  c.step();assert.equal(c.steps,1);assert.equal(c.time,STEP);assert.equal(c.running,false);
  c.play();c.play();tick(0);tick(1000);assert.equal(c.steps,61);
  const stale=queue.values().next().value;c.pause();stale(2000);assert.equal(c.steps,61);assert.equal(queue.size,0);
  c.setSpeed(.25);c.play();tick(10000);tick(11000);assert.equal(c.steps,76);
  c.step();assert.equal(c.steps,77);assert.equal(c.running,false);assert.equal(queue.size,0);
  c.restart();assert.equal(c.steps,0);assert.equal(c.running,false);
  c.play();tick(12000);available=false;tick(13000);assert.equal(c.steps,0);assert.equal(c.running,false);
  c.step();c.play();assert.equal(c.steps,0);assert.equal(queue.size,0);assert.ok(paints>0);
  assert.equal(poseFrame(items.find(i=>i.id==='character:claude:run'),1),1);
});

test('placement scopes join crop/landscape history and whole-project round trips atomically',()=>{
  const draft=make(),store=memory(),old=draft.export();
  const edits=[['character:claude',{masterScale:.21,footOffset:8}],['character:constance:slide',{offsetY:-4,cw:.63}],['grounding:eu03:claude',{groundOffset:-12}],['hazard:eu02:2',{lowClearance:25,scale:.37,fps:11}]];
  for(const [id,value] of edits)draft.editPlacement(id,{...draft.placement[id],...value});
  draft.edit('character:claude:run',1,{l:5,r:0,t:0,b:0});draft.editLayer('na01','far',{...draft.transform('na01','far'),x:2});
  assert.equal(draft.placement['grounding:eu02:claude'].groundOffset,0);
  const edited=draft.export();for(let i=0;i<6;i++)draft.undo();assert.deepEqual(draft.export(),old);
  for(let i=0;i<6;i++)draft.redo();assert.deepEqual(draft.export(),edited);
  draft.save(store);const reloaded=make();reloaded.load(store);assert.deepEqual(reloaded.export(),edited);assert.equal(reloaded.dirty,false);
  const target=make(),review=target.prepareImport(edited);assert.ok(review.rows.some(r=>r.element==='Placement'));
  target.applyImport(review,memory());assert.deepEqual(target.export(),edited);target.undo();assert.deepEqual(target.export(),old);target.redo();assert.deepEqual(target.export(),edited);
  for(const invalid of [p=>delete p.placement['hazard:na01:0'],p=>p.placement['character:claude'].masterScale=NaN,p=>p.placement['grounding:eu03:claude'].groundOffset=Infinity,p=>p.placement['hazard:eu02:2'].fps=0]) {
    const p=structuredClone(edited);invalid(p);assert.throws(()=>target.prepareImport(p));assert.deepEqual(target.export(),edited);
  }
  assert.throws(()=>target.save({getItem:()=>null,setItem(){throw new Error('quota');}}));assert.equal(target.dirty,true);
});

test('actual v4 saved projects upgrade without modifying their old record or existing edits',()=>{
  const original=make();original.edit('character:constance:slide',1,{l:65,r:0,t:0,b:0});original.editLayer('eu03','mid',{...original.transform('eu03','mid'),y:13});
  const payload=original.export();payload.format=PREVIOUS_PROJECT_FORMAT;delete payload.placement;
  const raw=JSON.stringify(payload),store=memory();store.setItem(PREVIOUS_PROJECT_FORMAT,raw);
  const upgraded=make();upgraded.load(store);assert.equal(upgraded.dirty,true);assert.equal(upgraded.crop('character:constance:slide',1).l,65);assert.equal(upgraded.transform('eu03','mid').y,13);
  assert.deepEqual(upgraded.placement,upgraded.placementBaseline);upgraded.editPlacement('grounding:eu03:claude',{groundOffset:-5});upgraded.save(store);
  assert.equal(store.getItem(PREVIOUS_PROJECT_FORMAT),raw);assert.ok(store.getItem(PROJECT_STORAGE_KEY));
  const reloaded=make();reloaded.load(store);assert.equal(reloaded.placement['grounding:eu03:claude'].groundOffset,-5);assert.equal(reloaded.dirty,false);
  const review=reloaded.prepareImport(payload);assert.ok(review.rows.some(r=>r.element==='Placement'&&r.after===0));
});
