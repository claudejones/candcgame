/* Pending catalog records never become runtime profiles or image requests. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CC_STAGE_CONTRACT=api;})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  const clone=value=>JSON.parse(JSON.stringify(value));
  const active=stage=>stage.legacy || ['integrated','approved'].includes(stage.status);
  function validateRelease(stage){
    const r=stage.release;
    if(!r || !r.hazards || r.hazards.length!==3 || !r.finish || !r.assets)throw new Error(`${stage.id}: incomplete stage release`);
    if(!['integrated','approved'].includes(r.status))throw new Error(`${stage.id}: invalid release state`);
    if(Object.keys(r.assets).length!==5)throw new Error(`${stage.id}: expected five physical assets`);
    if(r.hazards.some(h=>typeof h.name!=='string'||!h.name.trim())||new Set(r.hazards.map(h=>h.name)).size!==3)throw new Error(`${stage.id}: unique hazard names required`);
    for(const flag of ['technical','composition','contacts','animation','collision','finish'])if(r.checks?.[flag]!==true)throw new Error(`${stage.id}: missing integration check ${flag}`);
    if(!Array.isArray(r.signature)||!r.signature.length)throw new Error(`${stage.id}: missing stage signature`);
    for(const e of r.signature)if(!Number.isFinite(e.time)||e.time<75||e.time>=85||!['GROUND1','GROUND2','FLYING'].includes(e.hazard)||!['slow','normal','fast'].includes(e.speedClass)||(e.hazard==='FLYING'&&!['high','low'].includes(e.mode)))throw new Error(`${stage.id}: invalid stage signature`);
    for(const key of ['FAR','MID','GROUND','OBJECT_ATLAS','FLYING'])if(!/^[a-f0-9]{64}$/.test(r.assets[key]?.sha256||'') || r.assets[key]?.path!==stage.files[key])throw new Error(`${stage.id}: missing or mismatched ${key}`);
    for(const [i,h] of r.hazards.entries()){
      const cell=i<2?{x:i*1086,y:0,w:1086,h:724}:{x:0,y:0,w:543,h:724};
      if(h.kind!==(i<2?'ground':'flying') || h.atlasKey!==stage.id+(i<2?'Hazards':'Bird'))throw new Error(`${stage.id}: hazard identity ${i}`);
      const source=h.rect||{x:0,y:0,w:h.frameW,h:h.frameH};
      if(Object.keys(cell).some(k=>source[k]!==cell[k]))throw new Error(`${stage.id}: source cell ${i}`);
      if(i===2&&(h.frames!==4||!(h.fps>0)))throw new Error(`${stage.id}: flying frames/fps`);
      const anchor=i<2?{x:543,y:620}:{x:271,y:362};
      if(h.sourceAnchor?.x!==anchor.x||h.sourceAnchor?.y!==anchor.y)throw new Error(`${stage.id}: source anchor ${i}`);
      if(!Number.isFinite(h.scale)||h.scale<=0)throw new Error(`${stage.id}: scale ${i}`);
      if(h.flipX!==undefined&&typeof h.flipX!=='boolean')throw new Error(`${stage.id}: flipX ${i}`);
      if(h.flightOffsetY)for(const mode of ['high','low'])if(!Number.isFinite(h.flightOffsetY[mode]))throw new Error(`${stage.id}: flight offset ${mode}`);
      for(const k of ['cw','ch','cx','cy'])if(!Number.isFinite(h[k]))throw new Error(`${stage.id}: collision ${i}/${k}`);
      if(h.cw<=0||h.ch<=0||h.cw>1||h.ch>1)throw new Error(`${stage.id}: collision dimensions ${i}`);
      for(const crop of [h.crop||{},...(h.frameCrops||[])]){
        for(const k of ['l','r','t','b'])if(!Number.isFinite(crop[k]??0)||(crop[k]??0)<0)throw new Error(`${stage.id}: crop ${i}`);
        if((crop.l||0)>anchor.x || cell.w-(crop.r||0)<=anchor.x || (crop.t||0)>anchor.y || cell.h-(crop.b||0)<=anchor.y)throw new Error(`${stage.id}: crop excludes anchor ${i}`);
      }
    }
    for(const k of ['scale','groundOffset','xOffset'])if(!Number.isFinite(r.finish[k]))throw new Error(`${stage.id}: finish ${k}`);
    if(r.finish.scale<=0)throw new Error(`${stage.id}: finish scale`);
    return true;
  }
  function install(config,catalog,landscapes){
    for(const stage of Object.values(catalog.stages)){
      if(stage.legacy||!active(stage))continue;
      validateRelease(stage);
      if(!['integrated','approved'].includes(landscapes.stages[stage.id]?.status))throw new Error(`${stage.id}: landscape set not integrated`);
      const id=stage.id;
      config.worldProfiles[id]={label:stage.label,farKey:id+'Far',midKey:id+'Mid',groundKey:id+'Ground',landscapeContract:landscapes.contractVersion,sourceW:2172,seamY:410,farY:0,farScale:1.25,midYOffset:0,midScale:1,midParallax:.20,groundYOffset:0,groundScale:1,groundParallax:1,characterGrounding:{claude:0,constance:0},clouds:true};
      config.objectQA.defs[id]=clone(stage.release.hazards);
      config.objectQA.activeIndex[id]=0;
      config.finish.stages[id]=clone(stage.release.finish);
    }
    return config;
  }
  function sources(catalog){
    const result={};
    for(const stage of Object.values(catalog.stages)){
      if(stage.legacy||!active(stage))continue;
      validateRelease(stage);
      for(const [selector,suffix] of Object.entries({FAR:'Far',MID:'Mid',GROUND:'Ground',OBJECT_ATLAS:'Hazards',FLYING:'Bird'})){
        const asset=stage.release.assets[selector];result[stage.id+suffix]=`../${asset.path}?v=${asset.sha256.slice(0,8)}`;
      }
    }
    return result;
  }
  function continents(catalog,config){return catalog.continents.map(c=>({...c,stages:c.stages.filter(id=>active(catalog.stages[id])&&config.worldProfiles[id])})).filter(c=>c.stages.length);}
  function place(def,centerX,targetY,crop,scale,legacy){
    if(!def.sourceAnchor)return legacy;
    const anchorX=def.sourceAnchor.x-(crop.l||0);
    const width=(def.rect?.w??def.frameW)-(crop.l||0)-(crop.r||0);
    return {dx:centerX-(def.flipX?width-anchorX:anchorX)*scale,dy:targetY-(def.sourceAnchor.y-(crop.t||0))*scale};
  }
  function drawSprite(ctx,img,g,flipX){
    const x=Math.round(g.dx),y=Math.round(g.dy),w=Math.round(g.dw),h=Math.round(g.dh);
    if(flipX){
      ctx.save();ctx.translate(x+w,y);ctx.scale(-1,1);
      ctx.drawImage(img,g.sx,g.sy,g.sw,g.sh,0,0,w,h);ctx.restore();
    }else ctx.drawImage(img,g.sx,g.sy,g.sw,g.sh,x,y,w,h);
  }
  function mergeKnown(current,incoming){
    const result=clone(current);
    for(const [id,value] of Object.entries(incoming))if(Object.hasOwn(current,id))result[id]=Array.isArray(value)?value.map(item=>{
      const saved=clone(item),fallback=current[id].find(def=>def.name===item.name);
      if(saved.flipX===undefined&&fallback?.flipX!==undefined)saved.flipX=fallback.flipX;
      return saved;
    }):{...result[id],...clone(value)};
    return result;
  }
  return Object.freeze({active,validateRelease,install,sources,continents,place,drawSprite,mergeKnown});
});
