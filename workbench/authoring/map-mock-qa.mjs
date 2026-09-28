import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {descriptors} from '../dist/workbench-next/model.mjs';
import {landscapeDescriptors} from '../dist/workbench-next/landscape.mjs';
import {ProjectDraft,projectProvenance} from '../dist/workbench-next/project.mjs';
import {runtimeSnapshot,PlayRuntime} from '../dist/workbench-next/play-runtime.mjs';
const c={window:{}};vm.createContext(c);
for(const f of JSON.parse(fs.readFileSync('authoring/workbench-next/source-files.json')))vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);
const w=c.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);
const items=descriptors(config,w.GAME_SCHEMA),stages=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog=JSON.parse(fs.readFileSync('dist/workbench-next/asset-catalog.json'));
const draft=new ProjectDraft(items,stages,catalog.dimensions,projectProvenance(catalog,items,stages),catalog.migrations,config);

import {createRequire} from 'node:module';
import {drawDesignScene} from '../dist/workbench-next/scene-model.mjs';
import {travelPoint,flightRouteMarks,mapPoint} from '../dist/workbench-next/map-travel.mjs';
const {createCanvas,loadImage}=createRequire(import.meta.url)('@napi-rs/canvas');
const layout=JSON.parse(fs.readFileSync('dist/assets/global-ui/map_layout.json'));
for(const route of Object.keys(layout.flight_routes))for(const phone of [false,true]){
 const [a,b]=route.split(':');
 for(const [t,id] of [[0,a],[1,b]]){const p=travelPoint(layout,a,b,phone,t);assert.deepEqual([p.x,p.y],mapPoint(layout,id,phone));}
 for(const t of [.1,.3,.5,.7,.9]){const p=travelPoint(layout,a,b,phone,t),q=travelPoint(layout,a,b,phone,t+.00001);assert(Math.abs(p.heading-Math.atan2((q.y-p.y)*683,(q.x-p.x)*2048))<.001);}
 for(const p of flightRouteMarks(layout,a,b,phone))for(const c of Object.values(layout.continents))for(const [x,y] of phone?c.phone_stage_centers:c.stage_centers)assert(Math.hypot((x-p.x)*2048,(y-p.y)*683)>40);
}
for(const who of ['claude','constance']){
 const character=items.find(x=>x.id===`character:${who}:run`),hazard=items.find(x=>x.id==='hazard:na01:0');
 const images={};for(const [key,item] of Object.entries({character,hazard}))images[key]=await loadImage(new URL('../dist/workbench-next/'+catalog.assets[item.asset],import.meta.url));
 draft.placement[hazard.id].xOffset=config.characterX-config.objectQA.x;
 const canvas=createCanvas(960,540),ctx=canvas.getContext('2d'),calls=[],original=ctx.drawImage.bind(ctx);ctx.drawImage=(im,...args)=>{calls.push(im);original(im,...args);};
 const g=drawDesignScene(canvas,{config,contract:w.CC_LANDSCAPE_CONTRACT,stage:'na01',draft,character,hazard,images,travel:false,guides:false});
 assert(calls.indexOf(images.hazard)<calls.indexOf(images.character));
 assert(g.character.dest.x<g.hazard.dest.x+g.hazard.dest.w&&g.character.dest.x+g.character.dest.w>g.hazard.dest.x,'actual overlapping horizontal placement');
}
console.log('Six route endpoints/tangents, node clearance, and overlapping Design draw order for both characters passed.');
