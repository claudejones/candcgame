import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {makeDraft,items,catalog,config,stages,w} from './context.mjs';import {drawDesignScene} from '../../dist/workbench-next/scene-model.mjs';import {HAZARD_UPGRADE} from '../../dist/workbench-next/hazard-upgrade-data.mjs';
const {createCanvas,loadImage}=createRequire(import.meta.url)('@napi-rs/canvas');const draft=makeDraft(),s=draft.decode(JSON.parse(fs.readFileSync('authoring/hazard-upgrade/checked-project.json'))).state;Object.assign(draft,{...s,value:s.crops});const cache=new Map();const load=async key=>{if(!cache.has(key))cache.set(key,await loadImage(new URL('../../dist/workbench-next/'+catalog.assets[key].split('?')[0],import.meta.url)));return cache.get(key);};
const out='./hazard-visual-qa';fs.mkdirSync(out,{recursive:true});let count=0;const report=[];
for(const [id,meta]of Object.entries(HAZARD_UPGRADE)){
 const item=items.find(i=>i.id===id),stage=stages.find(i=>i.stage===item.stage),images={};for(const [layer,key]of Object.entries(stage.sources))images[layer]=await load(key);images.clouds=await load('clouds');images.hazard=await load(item.asset);
 const sheet=createCanvas(1440,584),ctx=sheet.getContext('2d');ctx.fillStyle='#111b22';ctx.fillRect(0,0,1440,584);ctx.fillStyle='white';ctx.font='20px sans-serif';ctx.fillText(id+' · '+meta.name,12,25);
 for(const [row,who]of ['claude','constance'].entries())for(const [col,t]of [0,45,88].entries()){
  const character=items.find(i=>i.id===`character:${who}:run`);images.character=await load(character.asset);const canvas=createCanvas(960,540),g=drawDesignScene(canvas,{config,contract:w.CC_LANDSCAPE_CONTRACT,stage:item.stage,images,draft,character,hazard:item,time:0,worldTime:t,hazardTime:0,travel:true,boxes:true,guides:true});
  const contact=g.hazard.dest.y+(meta.contactY-g.hazard.source.y)*g.hazard.scale;assert(Math.abs(contact-draft.calibration.stages[item.stage].pathY)<1e-6,id+' contact');
  ctx.drawImage(canvas,0,0,960,540,col*480,44+row*270,480,270);if(col===0&&row===0)fs.writeFileSync(`${out}/${id.replaceAll(':','-')}-full.png`,canvas.toBuffer('image/png'));if(row===0&&col===1&&['oc01','an02','oc03','na01'].includes(item.stage)){
   drawDesignScene(canvas,{config,contract:w.CC_LANDSCAPE_CONTRACT,stage:item.stage,images,draft,character,hazard:item,time:0,worldTime:t,hazardTime:0,travel:true,boxes:false,guides:false});
   const mobile=createCanvas(844,390),mc=mobile.getContext('2d');mc.fillStyle='#101719';mc.fillRect(0,0,844,390);mc.drawImage(canvas,75.333,0,693.333,390);fs.writeFileSync(`${out}/${id.replaceAll(':','-')}-mobile-canvas.png`,mobile.toBuffer('image/png'));
  }count++;
 }
 fs.writeFileSync(`${out}/${id.replaceAll(':','-')}.png`,sheet.toBuffer('image/png'));report.push({id,scenes:6,contact:'shared pathway',scale:draft.placement[id].scale});
}
fs.writeFileSync('authoring/hazard-upgrade/visual-report.json',JSON.stringify({scenes:count,canvas:[960,540],report},null,2));console.log('Rendered '+count+' scenes in '+out);
