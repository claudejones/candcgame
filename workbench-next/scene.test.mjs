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
for(const f of JSON.parse(fs.readFileSync(new URL('./source-files.json',import.meta.url),'utf8')))vm.runInContext(fs.readFileSync(new URL('../'+f,import.meta.url),'utf8'),context);
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
  const Character=new Function('CONFIG','CHAR','worldSourceW','window',charClass+';return CharacterMachine;')(cfg,{claude:{row:0},constance:{row:1}},()=>cfg.worldProfiles[cfg.activeWorld].sourceW||cfg.worldContract.sourceW,w);
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
  const runtimeWindow={...w,CC_STAGE_CONTRACT:{...w.CC_STAGE_CONTRACT,drawSprite(ctx,img,g,flipX){ctx.facing=flipX===true;ctx.drawImage(img,g.sx,g.sy,g.sw,g.sh,Math.round(g.dx),Math.round(g.dy),Math.round(g.dw),Math.round(g.dh));}}};
  const ObjectQA=new Function('CONFIG','window',objectClass+';return ObjectQA;')(cfg,runtimeWindow);
  for(const item of items.filter(i=>i.type==='hazard'))for(const flight of ['high','low'])for(const time of [0,2,8,25])for(let frame=0;frame<item.frames;frame++) {
    cfg.activeWorld=item.stage;cfg.objectQA.activeIndex[item.stage]=Number(item.id.split(':')[2]);
    Object.assign(cfg.objectQA.flying,{frame,travel:time*cfg.objectQA.flying.speed,mode:flight});
    const expected=[],scene={worldX:time*cfg.worldSpeed,lastRenderedSurfaceY:410};
    const object=new ObjectQA({drawImage(...args){expected.push(args.slice(1));}},{[item.asset]:{}},scene,{});object.characterBox=()=>({x:0,y:0,w:1,h:1});object.draw();
    const g=hazardGeometry(cfg,item,frame,defaultBounds(item,frame),item.crops[frame],draft.placement[item.id],{time,flight});
    assert.deepEqual(calls(g),expected[0],`${item.id}/${frame}/${flight}/${time}`);assert.equal(g.flipX,object.ctx.facing);
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
  const payload=original.export();payload.format=PREVIOUS_PROJECT_FORMAT;delete payload.placement;delete payload.calibration;
  const raw=JSON.stringify(payload),store=memory();store.setItem(PREVIOUS_PROJECT_FORMAT,raw);
  const upgraded=make();upgraded.load(store);assert.equal(upgraded.dirty,true);assert.equal(upgraded.crop('character:constance:slide',1).l,65);assert.equal(upgraded.transform('eu03','mid').y,13);
  assert.deepEqual(upgraded.placement,upgraded.placementBaseline);upgraded.editPlacement('grounding:eu03:claude',{groundOffset:-5});upgraded.save(store);
  assert.equal(store.getItem(PREVIOUS_PROJECT_FORMAT),raw);assert.ok(store.getItem(PROJECT_STORAGE_KEY));
  const reloaded=make();reloaded.load(store);assert.equal(reloaded.placement['grounding:eu03:claude'].groundOffset,-5);assert.equal(reloaded.dirty,false);
  const review=reloaded.prepareImport(payload);assert.ok(review.rows.some(r=>r.element==='Placement'&&r.after===0));
});

const {createMotion,intersects}=await import('./runtime-rules.mjs');
const {sceneGeometry,ContactPass}=await import('./scene-model.mjs');
const {dragBox,placementForBox}=await import('./hitbox-editor.mjs');

test('generated action adapter stays identical to production source and movement through Jump/Slide/landing',async()=>{
  const {execFileSync}=await import('node:child_process');execFileSync(process.execPath,[new URL('./build-runtime-rules.mjs',import.meta.url).pathname,'--check']);
  const cfg=structuredClone(config),Character=new Function('CONFIG','CHAR','worldSourceW','window',charClass+';return CharacterMachine;')(cfg,{},()=>2048);
  for(const initial of Object.keys(config.state)){
    const actual=createMotion(cfg,initial),expected=new Character({});
    if(initial==='jump')expected.triggerJump();else if(initial==='slide')expected.triggerSlide();else expected.setState(initial);
    for(let i=0;i<300;i++){
      if(i===100){actual.triggerJump();expected.triggerJump();}
      if(i===130||i===135){actual.triggerSlide();expected.triggerSlide();}
      actual.update(STEP);expected.update(STEP);
      for(const key of ['state','frame','elapsed','y','vy','slideT','timedSlide','hitT'])assert.equal(actual[key],expected[key],`${initial}/${i}/${key}`);
    }
  }
  assert.equal(intersects({x:0,y:0,w:10,h:10},{x:10,y:0,w:1,h:1}),false,'touching edges are not contact');
});

test('catch-up checks every fixed step and freezes on the exact first contact, not the displayed RAF endpoint',()=>{
  let callback,samples=[];
  const clock=new SceneClock({available:()=>true,paint(){},request:cb=>{callback=cb;return 1;},cancel(){},advance:(time,step)=>{samples.push(step);return step!==15;}});
  clock.play();callback(0);callback(1000);assert.equal(clock.steps,15);assert.equal(clock.running,false);assert.equal(samples.length,15);
  clock.step();assert.equal(clock.steps,16);clock.play();callback(5000);callback(6000);assert.equal(clock.steps,76);clock.pause();
});

test('contact results latch per pass; stationary, edited and partial passes never claim a clear result',()=>{
  const pass=new ContactPass(),make=(x,contact=false)=>({character:{collision:{x:200,y:300,w:50,h:100}},hazard:{dest:{x,y:300,w:50,h:100},collision:{x,y:300,w:50,h:100}},contact});
  pass.sample(make(650),0);assert.match(pass.label(make(650)),/Checking/);
  assert.equal(pass.sample(make(245,true),2),true);assert.equal(pass.sample(make(240,true),2.02),false);
  pass.sample(make(-60),6);assert.match(pass.label(make(-60)),/Contact detected · 2.00/);
  pass.reset();pass.sample(make(650),0);pass.sample(make(100),5);assert.equal(pass.complete,false);
  pass.sample(make(-60),6);assert.match(pass.label(make(-60)),/Cleared/);
  pass.invalidate();assert.match(pass.label(make(-60)),/Settings changed/);
  pass.reset();pass.sample(make(100),0);pass.sample(make(-60),2);assert.match(pass.label(make(-60)),/Incomplete/);
  pass.reset();pass.sample(make(650),0,{travel:false});assert.match(pass.label(make(650),{travel:false}),/Stationary/);
});

test('moving hitboxes invert production geometry for both actors and flight anchors, including singular full-height characters',()=>{
  const draft=make();
  for(const item of items){
    const p={...draft.placement[item.id],ch:.7},who=item.id.split(':')[1];
    const geom=value=>item.type==='character'?characterGeometry(config,item,0,draft.frames[item.id][0],draft.value[item.id][0],{...draft.placement,[item.id]:value,groundOffset:0},-31):hazardGeometry(config,item,0,draft.frames[item.id][0],draft.value[item.id][0],value,{time:1,flight:'low'});
    const g=geom(p),desired=dragBox(g.collision,'move',2,1),next=placementForBox(item,g,desired,p),actual=geom(next);
    for(const key of ['x','y','w','h'])assert.ok(Math.abs(desired[key]-actual.collision[key])<1e-7,`${item.id} ${key}`);
    const resized=dragBox(g.collision,'se',2,2),r=geom(placementForBox(item,g,resized,p));
    for(const key of ['x','y','w','h'])assert.ok(Math.abs(resized[key]-r.collision[key])<1e-7,`${item.id} resize ${key}`);
    if(item.type==='character'){
      const full={...p,ch:1},gg=geom(full),nn=placementForBox(item,gg,dragBox(gg.collision,'move',0,30),full);
      assert.ok(Object.values(nn).every(Number.isFinite));assert.equal(geom(nn).collision.y,gg.collision.y);
    }
  }
});

test('a real jump raises both drawing and collision geometry; a pass can clear with a timed jump and contact without it',()=>{
  const draft=make(),character=items.find(i=>i.id==='character:claude:run'),hazard=items.find(i=>i.id==='hazard:na01:1');
  // A narrow calibrated obstacle makes the action timing/clearance explicit.
  draft.editPlacement(hazard.id,{...draft.placement[hazard.id],cw:.2});
  function run(jump){const motion=createMotion(config),pass=new ContactPass();let largestRise=0;
    for(let step=0;step<600;step++){
      if(jump&&step===180)motion.triggerJump();if(step)motion.update(STEP);
      const actor=items.find(i=>i.id===`character:claude:${motion.state}`),g=sceneGeometry({config,draft,stage:'na01',character:actor,hazard,motion,time:step*STEP,looping:false});
      largestRise=Math.min(largestRise,motion.y);pass.sample(g,step*STEP);if(pass.complete)return {pass,g,largestRise};
    }throw new Error('Pass did not finish');
  }
  const standing=run(false),jumping=run(true);assert.notEqual(standing.pass.firstContact,null);assert.ok(jumping.largestRise<0);assert.equal(jumping.pass.firstContact,null);assert.match(jumping.pass.label(jumping.g),/Cleared/);
});

test('repeating an encounter preserves landscape and cloud positions on the continuing world clock',async()=>{
  const {drawDesignScene}=await import('./scene-model.mjs'),{drawLandscape}=await import('./landscape.mjs');
  const draft=make(),stage='na01',landscape=landscapes.find(s=>s.stage===stage),images=Object.fromEntries(Object.entries({...landscape.sources,clouds:'clouds'}).map(([key,asset])=>[key,{...catalog.dimensions[asset],asset}]));
  const record=()=>{const calls=[],ctx={drawImage:(...args)=>calls.push(args)};return {canvas:{getContext:()=>ctx},calls};};
  const actual=record(),expected=record(),initial=record(),character=items.find(i=>i.id==='character:claude:run'),hazard=items.find(i=>i.id==='hazard:na01:0');
  const options={config,contract:w.CC_LANDSCAPE_CONTRACT,stage,draft,images,character,hazard,time:0,worldTime:11,guides:false,looping:false};
  const g=drawDesignScene(actual.canvas,options);
  drawLandscape(expected.canvas,{...options,transforms:draft.landscapes[stage],scroll:11*config.worldSpeed,cloudScroll:11*config.worldContract.cloudSpeed});
  drawDesignScene(initial.canvas,{...options,worldTime:0});
  assert.deepEqual(actual.calls,expected.calls);assert.notDeepEqual(actual.calls,initial.calls);
  const origin=sceneGeometry({...options,worldTime:0});assert.deepEqual(g.hazard,origin.hazard,'hazard starts a new pass independently of world scrolling');
});
