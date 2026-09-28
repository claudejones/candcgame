import fs from 'node:fs';import vm from 'node:vm';import {createRequire} from 'node:module';import assert from 'node:assert/strict';
import {descriptors} from './workbench-next/model.mjs';import {landscapeDescriptors,drawLandscape} from './workbench-next/landscape.mjs';import {ProjectDraft,projectProvenance} from './workbench-next/project.mjs';import {measureArtwork,optimizeHazard} from './workbench-next/calibration-engine.mjs';
const {createCanvas,loadImage}=createRequire(import.meta.url)('@napi-rs/canvas');
const ctx={window:{}};vm.createContext(ctx);for(const f of JSON.parse(fs.readFileSync('workbench-next/source-files.json')))vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
const w=ctx.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);const items=descriptors(config,w.GAME_SCHEMA),stages=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),cat=JSON.parse(fs.readFileSync('workbench-next/asset-catalog.json'));const draft=new ProjectDraft(items,stages,cat.dimensions,projectProvenance(cat,items,stages),cat.migrations,config);

import {drawDesignScene} from './workbench-next/scene-model.mjs';
const prior=JSON.parse(fs.readFileSync('../oc01-before.json')),decoded=draft.decode(prior);
assert.deepEqual(decoded.state.landscapes,prior.design.landscapes);
for(const [id,p] of Object.entries(prior.placement))assert.deepEqual(decoded.state.placement[id],p);
const images={};for(const [layer,key] of Object.entries({far:'oc01Far',mid:'oc01Mid',ground:'oc01Ground'}))images[layer]=await loadImage(new URL(cat.assets[key],new URL('./workbench-next/',import.meta.url)));
const sheet=createCanvas(1440,540),sc=sheet.getContext('2d');let i=0;
for(const who of ['claude','constance'])for(const [j,scroll] of [0,2400,4800].entries()){
 const character=items.find(x=>x.id==='character:'+who+':run'),hazard=items.find(x=>x.id==='hazard:oc01:'+j);
 images.character=await loadImage(new URL(cat.assets[character.asset],new URL('./workbench-next/',import.meta.url)));images.hazard=await loadImage(new URL(cat.assets[hazard.asset],new URL('./workbench-next/',import.meta.url)));
 const canvas=createCanvas(960,540);drawDesignScene(canvas,{config,contract:w.CC_LANDSCAPE_CONTRACT,stage:'oc01',images,draft,character,hazard,time:0,worldTime:scroll/config.worldSpeed,hazardTime:0,travel:true,guides:false});
 sc.drawImage(canvas,(i%3)*480,Math.floor(i/3)*270,480,270);i++;
}
fs.writeFileSync('../oc01-mid-separation.png',sheet.toBuffer('image/png'));console.log('All saved landscape and placement settings preserved; rendered both characters and all three hazards across scroll positions.');
