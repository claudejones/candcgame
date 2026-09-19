import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {descriptors} from './model.mjs';
import {landscapeDescriptors} from './landscape.mjs';
import {ProjectDraft,projectProvenance,PRE_FACING_FORMAT,PROJECT_STORAGE_KEY} from './project.mjs';
import {defaultBounds,drawSprite,frameViewBox} from './frame-editor.mjs';
import {hazardGeometry} from './scene-model.mjs';
import {placementForBox} from './hitbox-editor.mjs';
const ctx={window:{}};vm.createContext(ctx);
for(const f of JSON.parse(fs.readFileSync(new URL('./source-files.json',import.meta.url))))vm.runInContext(fs.readFileSync(new URL('../'+f,import.meta.url),'utf8'),ctx);
const w=ctx.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);
const items=descriptors(config,w.GAME_SCHEMA),stages=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog=JSON.parse(fs.readFileSync(new URL('./asset-catalog.json',import.meta.url)));
const make=()=>new ProjectDraft(items,stages,catalog.dimensions,projectProvenance(catalog,items,stages),catalog.migrations,config);
const legacy=()=>JSON.parse(fs.readFileSync(new URL('./fixtures/review10-project.json',import.meta.url)));
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);

test('AF01 integrates exactly its five released images; pending stages stay absent and prior tuning stays unchanged',()=>{
 const release=w.CC_STAGE_CATALOG.stages.af01.release;assert.equal(stages.length,10);assert.equal(items.filter(i=>i.type==='hazard').length,30);
 for(const asset of Object.values(release.assets)){const data=fs.readFileSync(new URL('../'+asset.path,import.meta.url));assert.equal(createHash('sha256').update(data).digest('hex'),asset.sha256);}
 assert.equal(config.worldProfiles.af02,undefined);assert.equal(catalog.assets.af02Bird,undefined);
 const d=make();for(const [id,p] of Object.entries(legacy().placement))for(const [k,v] of Object.entries(p))assert.equal(d.placement[id][k],v,`${id}/${k} preserved`);
 assert.deepEqual(items.filter(i=>i.type==='hazard'&&d.placement[i.id].flipX).map(i=>i.id),['hazard:sa02:1','hazard:eu02:1','hazard:af01:1','hazard:af01:2']);
 assert.equal(d.placement['hazard:af01:2'].highOffsetY,22);assert.equal(d.placement['hazard:af01:2'].highClearance,68);
});

test('real nine-stage v7 save gains AF01 without losing custom calibration, locks, crops, frames or profiles',()=>{
 const p=legacy();p.placement['hazard:eu02:1'].cx=.234;p.placement['grounding:na01:claude'].groundOffset=-17;
 p.calibration.stages.na01.pathY+=31;p.calibration.stages.na01.characterFollow.claude=false;p.calibration.hazards['hazard:eu02:1'].locks=['cx'];p.calibration.hazards['hazard:eu02:1'].follow=false;p.calibration.profiles.hard.count=15;
 p.design.frames['hazard:eu01:1'][2]={x:1010,y:0,w:619,h:724};p.design.sprites.crops['character:claude:run'][0].l=9;p.design.landscapes.sa02.mid.y=11;
 const raw=JSON.stringify(p),store=memory();store.setItem(PRE_FACING_FORMAT,raw);const d=make();d.load(store);
 for(const [id,value] of Object.entries(p.placement))for(const [k,v] of Object.entries(value))assert.equal(d.placement[id][k],v);
 for(const [stage,c] of Object.entries(p.calibration.stages))assert.deepEqual(d.calibration.stages[stage],c);
 for(const [id,c] of Object.entries(p.calibration.hazards))assert.deepEqual(d.calibration.hazards[id],c);
 assert.deepEqual(d.calibration.profiles,p.calibration.profiles);
 for(const [id,frames] of Object.entries(p.design.frames))assert.deepEqual(d.frames[id],frames);
 for(const [id,crops] of Object.entries(p.design.sprites.crops))assert.deepEqual(d.value[id],crops);
 for(const [id,layers] of Object.entries(p.design.landscapes))assert.deepEqual(d.landscapes[id],layers);
 assert.deepEqual(d.placement['hazard:af01:2'],d.placementBaseline['hazard:af01:2']);d.save(store);assert.equal(store.getItem(PRE_FACING_FORMAT),raw);assert.ok(store.getItem(PROJECT_STORAGE_KEY));
 const loaded=make();loaded.load(store);assert.deepEqual(loaded.export(),d.export());
 const imported=make(),before=imported.export();imported.applyImport(imported.prepareImport(p),memory());assert.deepEqual(imported.export(),d.export());imported.undo();assert.deepEqual(imported.export(),before);imported.redo();assert.deepEqual(imported.export(),d.export());
 for(const change of [x=>delete x.placement['hazard:na01:0'],x=>delete x.design.frames['hazard:na01:0'],x=>x.provenance.assets.na01Bird.sha256='wrong',x=>x.design.landscapes.af02=x.design.landscapes.na01]){const bad=structuredClone(p);change(bad);assert.throws(()=>loaded.prepareImport(bad));assert.deepEqual(loaded.export(),d.export());}
});

test('mirrored anchored hazards retain body/contact positions through bounds and crop edits and invert hitbox drags',()=>{
 const d=make();for(const id of ['hazard:af01:0','hazard:af01:1','hazard:af01:2']){
  const item=items.find(i=>i.id===id),p=d.placement[id];
  for(let frame=0;frame<item.frames;frame++)for(const flight of ['high','low']){
   const base=d.frames[id][frame],crop=d.value[id][frame],args={travel:false,startX:650,flight};
   const g=hazardGeometry(config,item,frame,base,crop,{...p,flipX:false},args),flipped=hazardGeometry(config,item,frame,base,crop,{...p,flipX:true},args);
   near(flipped.dest.x+flipped.dest.w,1300-g.dest.x);near(flipped.collision.x+flipped.collision.w,1300-g.collision.x);near(flipped.dest.y,g.dest.y);
   const moved=hazardGeometry(config,item,frame,{...base,x:base.x+10,w:base.w-10},{...crop,l:crop.l-10},p,args);assert.deepEqual(moved,hazardGeometry(config,item,frame,base,crop,p,args));
   const box={...flipped.collision,x:flipped.collision.x+7},next=placementForBox(item,flipped,box,{...p,flipX:true}),edited=hazardGeometry(config,item,frame,base,crop,next,args);near(edited.collision.x,box.x);near(edited.collision.w,box.w);
  }
  const before=d.export();assert.throws(()=>d.edit(id,0,{l:0,r:0,t:item.sourceAnchor.y+1,b:0}),/anchor/);assert.deepEqual(d.export(),before);
 }
});

test('frame preview mirrors source pixels around their registration anchor and restores the canvas transform',()=>{
 const d=make(),item=items.find(i=>i.id==='hazard:af01:2');let sign=1,tx=0,ty=0;const stack=[],draws=[];
 const canvas={getContext:()=>({save(){stack.push([sign,tx,ty]);},restore(){[sign,tx,ty]=stack.pop();},translate(x,y){tx+=sign*x;ty+=y;},scale(x){sign*=x;},drawImage(img,sx,sy,sw,sh,x,y,width,height){draws.push({source:[sx,sy,sw,sh],left:tx+sign*x,right:tx+sign*(x+width),top:ty+y,height});}})};
 for(let frame=0;frame<4;frame++){const b=d.frames[item.id][frame],crop=d.value[item.id][frame];drawSprite(canvas,{},item,frame,b,crop,frameViewBox(item,d.frames[item.id]),false,true);const draw=draws.at(-1);assert.ok(draw.left>draw.right);assert.deepEqual(draw.source,[b.x+crop.l,b.y+crop.t,b.w-crop.l-crop.r,b.h-crop.t-crop.b]);assert.equal(sign,1);assert.equal(tx,0);assert.equal(ty,0);}
 const p=d.export();p.placement[item.id].flipX='true';assert.throws(()=>make().prepareImport(p),/mirror/);
});
