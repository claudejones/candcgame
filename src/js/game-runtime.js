
(() => {
"use strict";

const CONFIG=window.GAME_CONFIG;

const PHASE8_PILOT=new URLSearchParams(window.location.search).get("phase8Pilot")==="na01";
if(PHASE8_PILOT){
 for(const id of ["na01","na02"]){
  const p=CONFIG.worldProfiles[id];
  Object.assign(p,{sourceW:2172,seamY:410,farY:0,farScale:1.25,midYOffset:0,midScale:1,groundYOffset:0,groundScale:1,characterGrounding:{claude:0,constance:0}});
 }
 CONFIG.activeWorld="na01";
}
const worldSourceW=()=>CONFIG.worldProfiles[CONFIG.activeWorld]?.sourceW||CONFIG.worldContract.sourceW;

for(const p of Object.values(CONFIG.worldProfiles)){p.characterGrounding=p.characterGrounding||{claude:0,constance:0};}
for(const list of Object.values(CONFIG.objectQA.defs)){for(const d of list){d.crop=d.crop||{l:0,r:0,t:0,b:0};}}

const CHAR={
 claude:{row:0,label:"CLAUDE"},
 constance:{row:1,label:"CONSTANCE"}
};

class AssetStore{
 constructor(src){this.src=src;this.images={}}
 async load(){
   await Promise.all(Object.entries(this.src).map(([k,s])=>new Promise((resolve,reject)=>{
     const img=new Image();
     img.onload=()=>{this.images[k]=img;resolve()};
     img.onerror=()=>reject(new Error("Asset failed: "+k));
     img.src=s;
   })));
   return this.images;
 }
}

/*
WORLD VISUAL OWNERSHIP / COMPOSITING CONTRACT
Landscape appearance is controlled exclusively by authored world assets.
Render order: FAR -> CLOUDS -> MID -> GROUND.
No stage-, biome-, or continent-specific synthetic world backing is permitted.
FAR is the base visual layer; CLOUDS, MID and GROUND composite over it.
UI/HUD/debug colors remain component-local.
WORLD_LAYER_QA is transient QA state and is excluded from saved/exported config.
*/
const WORLD_LAYER_QA={far:true,clouds:true,mid:true,ground:true};

class Scene{
 constructor(ctx,a){
   this.ctx=ctx;this.a=a;this.worldX=0;this.cloudX=0;
   // WORLD_LAYER_CONTRACT_01 — authored geometry, never inferred from alpha.
   this.geometry={
     na01:{midBaseSourceY:621,groundSurfaceSourceY:393},
     na02:{midBaseSourceY:621,groundSurfaceSourceY:393},
     na03:{midBaseSourceY:621,groundSurfaceSourceY:393},
     sa01:{midBaseSourceY:621,groundSurfaceSourceY:393},
     sa02:{midBaseSourceY:621,groundSurfaceSourceY:393},
     sa03:{midBaseSourceY:621,groundSurfaceSourceY:393},
     eu01:{midBaseSourceY:621,groundSurfaceSourceY:393},
     eu02:{midBaseSourceY:621,groundSurfaceSourceY:393},
     eu03:{midBaseSourceY:621,groundSurfaceSourceY:393}
   };
 }
 profile(){return CONFIG.worldProfiles[CONFIG.activeWorld]}
 update(dt,worldScrolls=true){
   if(worldScrolls)this.worldX+=CONFIG.worldSpeed*dt;
   this.cloudX+=CONFIG.worldContract.cloudSpeed*dt;
 }
 analyzeRows(img){
   const cv=document.createElement("canvas");
   cv.width=img.width;cv.height=img.height;
   const x=cv.getContext("2d",{willReadFrequently:true});
   x.drawImage(img,0,0);
   const data=x.getImageData(0,0,cv.width,cv.height).data;
   const cov=new Float32Array(cv.height);
   for(let y=0;y<cv.height;y++){
     let n=0, row=y*cv.width*4;
     for(let px=0;px<cv.width;px++){
       if(data[row+px*4+3]>10)n++;
     }
     cov[y]=n/cv.width;
   }
   return cov;
 }
 firstCoverage(cov,t=.98){
   for(let y=0;y<cov.length;y++)if(cov[y]>=t)return y;
   for(let y=0;y<cov.length;y++)if(cov[y]>=.90)return y;
   return 0;
 }
 lastCoverage(cov,t=.98){
   for(let y=cov.length-1;y>=0;y--)if(cov[y]>=t)return y;
   for(let y=cov.length-1;y>=0;y--)if(cov[y]>=.90)return y;
   return cov.length-1;
 }
 analyzeAll(){
   for(const [id,p] of Object.entries(CONFIG.worldProfiles)){
     const mid=this.a[p.midKey], ground=this.a[p.groundKey];
     const mc=this.analyzeRows(mid), gc=this.analyzeRows(ground);
     this.geometry[id]={
       midBaseSourceY:this.lastCoverage(mc,.98),
       groundSurfaceSourceY:this.firstCoverage(gc,.98)
     };
   }
 }
 geom(){return this.geometry[CONFIG.activeWorld]}
 groundFillColor(img){
   if(img.__fillColor)return img.__fillColor;
   const cv=document.createElement("canvas"); cv.width=64; cv.height=32;
   const x=cv.getContext("2d",{willReadFrequently:true});
   x.drawImage(img,0,Math.max(0,img.height-160),img.width,160,0,0,64,32);
   const d=x.getImageData(0,0,64,32).data; let r=0,g=0,b=0,n=0;
   for(let i=0;i<d.length;i+=4){if(d[i+3]>64){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}}
   img.__fillColor=n?`rgb(${Math.round(r/n)},${Math.round(g/n)},${Math.round(b/n)})`:"#38291f";
   return img.__fillColor;
 }
 tileFull(img,offsetX,drawY,scale,alpha=1){
   const c=this.ctx,W=CONFIG.canvas.w;
   const dw=img.width*scale,dh=img.height*scale;
   let x=-((((offsetX)%dw)+dw)%dw);
   c.globalAlpha=alpha;
   for(;x<W;x+=dw){
     c.drawImage(img,Math.round(x),Math.round(drawY),Math.ceil(dw),Math.ceil(dh));
   }
   c.globalAlpha=1;
 }
 draw(){
   const c=this.ctx,W=CONFIG.canvas.w,p=this.profile(),wc=CONFIG.worldContract;
   c.clearRect(0,0,CONFIG.canvas.w,CONFIG.canvas.h);
   const baseScale=W/worldSourceW();
   const far=this.a[p.farKey];
   const farScale=baseScale*p.farScale;
   if(WORLD_LAYER_QA.far)this.tileFull(far,0,p.farY,farScale,1);
   if(WORLD_LAYER_QA.clouds&&p.clouds!==false){
     const clouds=this.a.clouds;
     const cloudScale=baseScale*wc.cloudScale;
     this.tileFull(clouds,this.cloudX,wc.cloudY,cloudScale,wc.cloudOpacity);
   }
   const mid=this.a[p.midKey];
   const midScale=baseScale*p.midScale;
   const midY=p.seamY-wc.midBaselineSourceY*midScale+p.midYOffset;
   if(WORLD_LAYER_QA.mid)this.tileFull(mid,this.worldX*p.midParallax,midY,midScale,1);
   const ground=this.a[p.groundKey];
   const groundScale=baseScale*p.groundScale;
   const groundY=p.seamY-wc.groundSurfaceSourceY*groundScale+p.groundYOffset;
   const renderedSurfaceY=groundY+wc.groundSurfaceSourceY*groundScale;
   // Production ground assets are transparent overlays. Do not synthesize or paint
   // a sampled fill behind them; let the approved world layers remain visible.
   if(WORLD_LAYER_QA.ground)this.tileFull(ground,this.worldX*p.groundParallax,groundY,groundScale,1);
   if(wc.showGuides){
     c.save(); c.lineWidth=1;
     c.strokeStyle="#ffdf5d"; c.beginPath(); c.moveTo(0,p.seamY+.5); c.lineTo(W,p.seamY+.5); c.stroke();
     c.strokeStyle="#ff6b6b"; c.beginPath(); c.moveTo(0,renderedSurfaceY+.5); c.lineTo(W,renderedSurfaceY+.5); c.stroke();
     const renderedMidBase=midY+wc.midBaselineSourceY*midScale;
     c.strokeStyle="#66e0ff"; c.beginPath(); c.moveTo(0,renderedMidBase+.5); c.lineTo(W,renderedMidBase+.5); c.stroke();
     c.restore();
   }
   this.lastRenderedSurfaceY=renderedSurfaceY;
 }
}

class CharacterMachine{
 constructor(a){
   this.a=a; this.character="claude"; this.state="run"; this.frame=0;
   this.elapsed=0; this.y=0; this.vy=0; this.hitT=0; this.starT=0; this.starMode="auto";
   this.slideT=0; this.timedSlide=false;
   this.last={visibleTop:0};
   this.alphaBoundsCache={};
 }
 toggleCharacter(){this.character=this.character==="claude"?"constance":"claude";this.setState("run")}
 setState(state){
   if(!CONFIG.state[state])return;
   this.state=state;this.frame=0;this.elapsed=0;this.hitT=0;
   this.timedSlide=false;this.slideT=0;
   if(state!=="jump"){this.y=0;this.vy=0}
 }
 triggerJump(){
   if(this.state==="jump")return;
   this.state="jump";this.frame=0;this.elapsed=0;this.y=0;this.vy=CONFIG.jump.launch;
 }
 setSlide(on){
   if(on){this.state="slide";this.frame=0;this.elapsed=0;this.timedSlide=false;this.slideT=0}
   else if(this.state==="slide")this.setState("run");
 }
 triggerSlide(){
   // Gameplay Slide is self-contained: enter immediately, hold for the configured
   // window, then return to Run. Re-pressing Slide restarts the full window.
   if(this.state!=="slide"){this.state="slide";this.frame=0;this.elapsed=0;this.y=0;this.vy=0}
   this.timedSlide=true;
   this.slideT=Math.max(.20,CONFIG.actions.slideDuration);
 }
 triggerHit(){this.state="hit";this.frame=0;this.elapsed=0;this.hitT=0;this.starT=0}
 worldScrolls(){return CONFIG.state[this.state].scroll}
 cycleStars(){this.starMode=this.starMode==="auto"?"on":this.starMode==="on"?"off":"auto"}
 starsVisible(){return this.state==="hit"&&(this.starMode==="on"||(this.starMode==="auto"&&this.frame===1))}

 update(dt){
   this.elapsed+=dt;
   const cfg=CONFIG.state[this.state];

   if(this.state==="run"||this.state==="idle"||this.state==="celebrate")
     this.frame=Math.floor(this.elapsed*cfg.fps)%cfg.frames;

   if(this.state==="slide"){
     this.frame=Math.min(1,Math.floor(this.elapsed*cfg.fps));
     if(this.timedSlide){
       this.slideT-=dt;
       if(this.slideT<=0){this.setState("run");return;}
     }
   }

   if(this.state==="jump"){
     this.vy+=CONFIG.jump.gravity*dt;
     this.y+=this.vy*dt;
     if(this.vy<-110)this.frame=0;
     else if(this.vy<110)this.frame=1;
     else this.frame=2;
     if(this.y>=0&&this.vy>0){this.y=0;this.setState("run")}
   }

   if(this.state==="hit"){
     // A failed run freezes the character in the readable stunned pose.
     // Frame 1 is the approved stars frame when starMode is Auto.
     if(CONFIG.spawnDirector.failed){
       this.frame=1;
       this.hitT=0;
     }else{
       this.hitT+=dt;
       const hd=Math.max(.35,CONFIG.hitRecovery.recoveryDuration);
       if(this.hitT<hd*.14)this.frame=0;
       else if(this.hitT<hd*.75)this.frame=1;
       else if(this.hitT<hd)this.frame=2;
       else this.setState("run");
     }
   }

   if(this.starsVisible())this.starT+=dt;
 }
 step(){this.frame=(this.frame+1)%CONFIG.state[this.state].frames}

 alphaBounds(img,state,row,frame){
   const key=state+":"+row+":"+frame;
   if(this.alphaBoundsCache[key])return this.alphaBoundsCache[key];
   const cell=CONFIG.cell,cv=document.createElement("canvas");cv.width=cell;cv.height=cell;
   const cx=cv.getContext("2d",{willReadFrequently:true});
   cx.clearRect(0,0,cell,cell);cx.drawImage(img,frame*cell,row*cell,cell,cell,0,0,cell,cell);
   const data=cx.getImageData(0,0,cell,cell).data;
   let minX=cell,minY=cell,maxX=-1,maxY=-1;
   for(let y=0;y<cell;y++){for(let x=0;x<cell;x++){if(data[(y*cell+x)*4+3]>2){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;}}}
   const b=maxX<0?{x:0,y:0,w:cell,h:cell}:{x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1};
   this.alphaBoundsCache[key]=b;return b;
 }

 draw(ctx){
   const img=this.a[this.state];
   const row=CHAR[this.character].row;
   const masterScale=CONFIG.masterScale[this.character];
   const stateMultiplier=CONFIG.stateScale[this.character][this.state];
   const scale=masterScale*stateMultiplier;
   const cell=CONFIG.cell;
   const sx=this.frame*cell, sy=row*cell;
   const dw=cell*scale, dh=cell*scale;
   const ci=(CONFIG.cropInsets?.[this.character]?.[this.state]?.[this.frame])||{l:0,r:0,t:0,b:0};
   const cL=Math.max(0,Math.min(cell-1,ci.l||0)), cR=Math.max(0,Math.min(cell-1,ci.r||0));
   const cT=Math.max(0,Math.min(cell-1,ci.t||0)), cB=Math.max(0,Math.min(cell-1,ci.b||0));
   const srcW=Math.max(1,cell-cL-cR), srcH=Math.max(1,cell-cT-cB);
   const stateRenderX=(CONFIG.renderOffsetX?.[this.character]?.[this.state]||0);
   const stateRenderY=(CONFIG.renderOffsetY?.[this.character]?.[this.state]||0);
   const dx=CONFIG.characterX-dw/2+stateRenderX;
   const p=CONFIG.worldProfiles[CONFIG.activeWorld];
   const baseScale=CONFIG.canvas.w/worldSourceW();
   const gScale=baseScale*p.groundScale;
   const gY=p.seamY-CONFIG.worldContract.groundSurfaceSourceY*gScale+p.groundYOffset;
   const renderedSurfaceY=gY+CONFIG.worldContract.groundSurfaceSourceY*gScale;
   const footY=renderedSurfaceY+CONFIG.worldContract.footOffset[this.character]+(p.characterGrounding?.[this.character]||0);
   const dy=footY-dh+this.y+stateRenderY;

   ctx.drawImage(img,sx+cL,sy+cT,srcW,srcH,
                 Math.round(dx+cL*scale),Math.round(dy+cT*scale),Math.round(srcW*scale),Math.round(srcH*scale));
   if(CONFIG.worldContract.showGuides){
     ctx.save(); ctx.strokeStyle="#ffffff"; ctx.lineWidth=1;
     ctx.beginPath(); ctx.moveTo(CONFIG.characterX-28,footY+.5); ctx.lineTo(CONFIG.characterX+28,footY+.5); ctx.stroke(); ctx.restore();
   }

   const meta=CONFIG.visibleMeta[this.state][row][this.frame];
   const visibleTop=dy+meta.top*scale;
   this.last.visibleTop=visibleTop;
   this.last.footY=footY;
   this.last.centerX=CONFIG.characterX;
   this.last.renderScale=scale;
   this.last.visibleHeight=meta.h*scale;
   this.last.visibleWidth=meta.w*scale;

   if(CONFIG.characterQA.showCropBounds||CONFIG.characterQA.showCollisionBounds){
     ctx.save();ctx.lineWidth=2;
     if(CONFIG.characterQA.showCropBounds){
       ctx.strokeStyle="#ffb84d";
       ctx.strokeRect(Math.round(dx+cL*scale)+.5,Math.round(dy+cT*scale)+.5,Math.round(srcW*scale),Math.round(srcH*scale));
     }
     if(CONFIG.characterQA.showCollisionBounds){
       const q=CONFIG.objectQA.characterCollision[this.character][this.state];
       const vw=Math.max(8,this.last.visibleWidth||40),vh=Math.max(8,this.last.visibleHeight||70);
       const top=this.last.visibleTop??(footY-vh),w=vw*q.w,h=vh*q.h,cx=CONFIG.characterX+(q.x*vw),y=top+(vh-h)*(1-q.y);
       ctx.strokeStyle="#64d9ff";
       ctx.strokeRect(Math.round(cx-w/2)+.5,Math.round(y)+.5,Math.round(w),Math.round(h));
     }
     ctx.restore();
   }

   if(this.starsVisible()){
     const sim=this.a.stars;
     const sf=Math.floor(this.starT*CONFIG.starFPS)%4;
     const sw=CONFIG.starCell.w, sh=CONFIG.starCell.h;
     const ssx=sf*sw, ssy=row*sh;
     const starScale=CONFIG.starScale[this.character];
     const sdw=sw*starScale;
     const sdh=sh*starScale;

     // Center directly over character X, with clear head separation.
     const sdx=CONFIG.characterX-sdw/2;
     const sdy=visibleTop-sdh*0.88+CONFIG.starYOffset[this.character];

     ctx.drawImage(sim,ssx,ssy,sw,sh,
                   Math.round(sdx),Math.round(sdy),Math.round(sdw),Math.round(sdh));
   }
 }
}


class ObjectQA{
 constructor(ctx,a,scene,character){this.ctx=ctx;this.a=a;this.scene=scene;this.character=character;this.lastCollision=false;this.collisionLatched=false;this.lastObjectBox=null;this.lastCharacterBox=null;}
 defs(){return CONFIG.objectQA.defs[CONFIG.activeWorld]||[]}
 active(){const list=this.defs();if(!list.length)return null;const i=Math.max(0,Math.min(list.length-1,CONFIG.objectQA.activeIndex[CONFIG.activeWorld]||0));return list[i]}
 setIndex(delta){const list=this.defs();if(!list.length)return;let i=CONFIG.objectQA.activeIndex[CONFIG.activeWorld]||0;i=(i+delta+list.length)%list.length;CONFIG.objectQA.activeIndex[CONFIG.activeWorld]=i;CONFIG.objectQA.flying.t=0;CONFIG.objectQA.flying.frame=0;CONFIG.objectQA.flying.travel=0;this.collisionLatched=false;this.lastCollision=false;}
 resetPass(){CONFIG.objectQA.scrollOrigin=this.scene.worldX;CONFIG.objectQA.x=650;CONFIG.objectQA.flying.t=0;CONFIG.objectQA.flying.travel=0;this.collisionLatched=false;this.lastCollision=false;this.lastObjectBox=null;}
 surfaceY(){return this.scene.lastRenderedSurfaceY ?? CONFIG.worldProfiles[CONFIG.activeWorld].seamY}
 screenX(drawW){if(!CONFIG.objectQA.scrollWithWorld)return CONFIG.objectQA.x;const q=CONFIG.objectQA;const phase=((this.scene.worldX-q.scrollOrigin)%q.loopDistance+q.loopDistance)%q.loopDistance;let x=q.x-phase;while(x < -drawW-30)x += q.loopDistance;return x;}
 characterBox(){const who=this.character.character,state=this.character.state,q=CONFIG.objectQA.characterCollision[who][state];const vw=Math.max(8,this.character.last.visibleWidth||40),vh=Math.max(8,this.character.last.visibleHeight||70);const top=this.character.last.visibleTop??((this.character.last.footY??this.surfaceY())-vh);const w=vw*q.w,h=vh*q.h,cx=(this.character.last.centerX??CONFIG.characterX)+(q.x*vw),y=top+(vh-h)*(1-q.y);return{x:cx-w/2,y,w,h};}
 intersects(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
 update(dt){const d=this.active();if(!d)return;const f=CONFIG.objectQA.flying;if(d.frames){if(Number.isInteger(d.previewFrame))f.frame=Math.max(0,Math.min(d.frames-1,d.previewFrame));else{f.t+=dt;f.frame=Math.floor(f.t*f.fps)%d.frames;}}if(d.kind==="flying"&&CONFIG.objectQA.scrollWithWorld)f.travel+=dt*f.speed;}
 draw(){
   const d=this.active();if(!d)return;const img=this.a[d.atlasKey];if(!img)return;const baseScale=CONFIG.canvas.w/CONFIG.worldContract.sourceW;const s=baseScale*d.scale;let sw,sh,sx,sy,dw,dh,dx,dy,anchorY,cL=0,cR=0,cT=0,cB=0;
   const crop=d.crop||(d.crop={l:0,r:0,t:0,b:0});
   if(d.kind==="flying"){
     const cellW=d.frameW,cellH=d.frameH;cL=Math.max(0,Math.min(cellW-1,crop.l||0));cR=Math.max(0,Math.min(cellW-1-cL,crop.r||0));cT=Math.max(0,Math.min(cellH-1,crop.t||0));cB=Math.max(0,Math.min(cellH-1-cT,crop.b||0));
     sw=Math.max(1,cellW-cL-cR);sh=Math.max(1,cellH-cT-cB);sx=CONFIG.objectQA.flying.frame*cellW+cL;sy=cT;dw=sw*s;dh=sh*s;const f=CONFIG.objectQA.flying;let centerX=CONFIG.objectQA.scrollWithWorld?CONFIG.objectQA.x-f.travel:CONFIG.objectQA.x;while(centerX < -dw-30){f.travel-=CONFIG.objectQA.loopDistance;centerX=CONFIG.objectQA.x-f.travel;}dx=centerX-dw/2;const clearance=f.mode==="high"?f.highClearance:f.lowClearance;anchorY=this.surfaceY()-clearance;dy=anchorY-dh/2;
   }else{
     const r=d.rect||{x:0,y:0,w:d.frameW,h:d.frameH},rw=d.frames&&d.frameW?d.frameW:r.w,rh=d.frames&&d.frameH?d.frameH:r.h;cL=Math.max(0,Math.min(rw-1,crop.l||0));cR=Math.max(0,Math.min(rw-1-cL,crop.r||0));cT=Math.max(0,Math.min(rh-1,crop.t||0));cB=Math.max(0,Math.min(rh-1-cT,crop.b||0));sw=Math.max(1,rw-cL-cR);sh=Math.max(1,rh-cT-cB);sx=(d.frames&&d.frameW?CONFIG.objectQA.flying.frame*d.frameW:r.x)+cL;sy=(d.frames&&d.frameH?0:r.y)+cT;dw=sw*s;dh=sh*s;const centerX=this.screenX(dw);const groundOffset=Number.isFinite(d.groundOffset)?d.groundOffset:CONFIG.objectQA.groundOffset;anchorY=this.surfaceY()+groundOffset;dx=centerX-dw/2;dy=anchorY-dh;
   }
   this.ctx.drawImage(img,sx,sy,sw,sh,Math.round(dx),Math.round(dy),Math.round(dw),Math.round(dh));
   const cw=Math.max(4,dw*d.cw),ch=Math.max(4,dh*d.ch),cx=dx+(dw-cw)/2+d.cx*dw,cy=d.kind==="flying"?dy+(dh-ch)/2+d.cy*dh:anchorY-ch+d.cy*dh;const ob={x:cx,y:cy,w:cw,h:ch},cb=this.characterBox();
   // A new pass is detected when the looping hazard jumps from off-screen left back to the right.
   if(this.lastObjectBox && ob.x>this.lastObjectBox.x+CONFIG.objectQA.loopDistance*.5)this.collisionLatched=false;
   this.lastObjectBox=ob;this.lastCharacterBox=cb;this.lastCollision=this.intersects(ob,cb);
   if(this.lastCollision)this.collisionLatched=true;
   if(CONFIG.objectQA.showBounds){const c=this.ctx;c.save();c.lineWidth=2;c.strokeStyle="rgba(255,214,70,.95)";c.strokeRect(Math.round(dx)+.5,Math.round(dy)+.5,Math.round(dw),Math.round(dh));c.strokeStyle=this.collisionLatched?"#ff4d4d":"#43e07b";c.strokeRect(Math.round(ob.x)+.5,Math.round(ob.y)+.5,Math.round(ob.w),Math.round(ob.h));c.strokeStyle="#64d9ff";c.strokeRect(Math.round(cb.x)+.5,Math.round(cb.y)+.5,Math.round(cb.w),Math.round(cb.h));c.restore();}
 }
}


class GameplayDirector{
 constructor(ctx,a,scene,character,objectQA){
   this.ctx=ctx;this.a=a;this.scene=scene;this.character=character;this.objectQA=objectQA;
   this.invulnT=0;this.recoveryT=0;this.finished=false;this.lastFinishBox=null;this.rngState=CONFIG.spawnDirector.seed>>>0;
   this.buildPlan();
 }
 cfg(){return CONFIG.spawnDirector}
 finishCfg(){return CONFIG.finish.stages[CONFIG.activeWorld]}
 rand(){this.rngState=(1664525*this.rngState+1013904223)>>>0;return this.rngState/4294967296}
 stageSeed(){const offsets={na01:101,na02:202,na03:303,sa01:401,sa02:502,sa03:603,eu01:701,eu02:802,eu03:903};return (this.cfg().seed+(offsets[CONFIG.activeWorld]||0))>>>0}
 phaseAt(t){const s=this.cfg();if(t<s.phases.warmup[1])return "WARM-UP";if(t<s.phases.establish[1])return "ESTABLISH";if(t<s.phases.develop[1])return "DEVELOP";if(t<s.phases.pressure[1])return "PRESSURE";if(t<s.phases.signature[1])return "SIGNATURE";return "FINISH RELEASE"}
 defs(){return CONFIG.objectQA.defs[CONFIG.activeWorld]||[]}
 buildPlan(){
   const s=this.cfg();this.rngState=this.stageSeed();
   const defs=this.defs(),g=defs.filter(d=>d.kind==="ground"),bird=defs.find(d=>d.kind==="flying");
   if(g.length<2||!bird){s.planned=[];return}
   const g1=g[0].name,g2=g[1].name,b=bird.name,plan=[];
   const add=(time,defName,mode=null,speedClass="normal",pattern="SINGLE")=>plan.push({time,defName,mode,speedClass,pattern,spawned:false});
   const chooseAltitude=()=>{const m=s.altitudeMix||{high:55,low:45};const total=Math.max(1,(m.high||0)+(m.low||0));return this.rand()*total<(m.high||0)?"high":"low"};
   const chooseFlySpeed=(mode)=>{const r=this.rand();if(mode==="low")return r<.65?"normal":"fast";return r<.25?"slow":r<.72?"normal":"fast"};
   const templates={
     singleGround:(base)=>add(base,this.rand()<.5?g1:g2,null,"normal","SINGLE"),
     singleBird:(base)=>{const mode=chooseAltitude();add(base,b,mode,chooseFlySpeed(mode),mode==="high"?"SINGLE FLYER / SLIDE":"SINGLE FLYER / JUMP")},
     doubleJump:(base)=>{add(base,g1,null,"normal","DOUBLE JUMP");add(base+1.55,g2,null,"normal","DOUBLE JUMP")},
     jumpSlide:(base)=>{add(base,this.rand()<.5?g1:g2,null,"normal","JUMP→SLIDE");add(base+1.75,b,"high",this.rand()<.5?"normal":"fast","JUMP→SLIDE")},
     slideJump:(base)=>{add(base,b,"high",this.rand()<.5?"slow":"normal","SLIDE→JUMP");add(base+1.75,this.rand()<.5?g1:g2,null,"normal","SLIDE→JUMP")},
     groundLow:(base)=>{add(base,this.rand()<.5?g1:g2,null,"normal","JUMP→LOW JUMP");add(base+1.62,b,"low",chooseFlySpeed("low"),"JUMP→LOW JUMP")},
     lowGround:(base)=>{add(base,b,"low",chooseFlySpeed("low"),"LOW JUMP→JUMP");add(base+1.70,this.rand()<.5?g1:g2,null,"normal","LOW JUMP→JUMP")},
     highLow:(base)=>{add(base,b,"high",this.rand()<.5?"slow":"normal","SLIDE→LOW JUMP");add(base+1.72,b,"low",this.rand()<.5?"normal":"fast","SLIDE→LOW JUMP")},
     lowHigh:(base)=>{add(base,b,"low",this.rand()<.65?"normal":"fast","LOW JUMP→SLIDE");add(base+1.72,b,"high",this.rand()<.5?"normal":"fast","LOW JUMP→SLIDE")},
     arc:(base)=>{add(base,g1,null,"normal","ARC TIMING");add(base+1.22,b,"low",this.rand()<.5?"normal":"fast","ARC TIMING")},
     triple:(base)=>{const lowFirst=this.rand()<.45;add(base,g1,null,"normal","TRIPLE");add(base+1.65,b,lowFirst?"low":"high","fast","TRIPLE");add(base+3.35,g2,null,"normal","TRIPLE")}
   };
   // Fixed structural beats; seeded choices inside slots preserve learnability while allowing controlled course variants.
   templates.singleGround(8.0);
   (this.rand()<.5?templates.singleBird:templates.singleGround)(14.5);
   const establish=[templates.doubleJump,templates.jumpSlide,templates.slideJump,templates.groundLow,templates.lowGround];
   establish[Math.floor(this.rand()*establish.length)](21.0);
   establish[Math.floor(this.rand()*establish.length)](28.0);
   const develop=[templates.doubleJump,templates.jumpSlide,templates.slideJump,templates.groundLow,templates.lowGround,templates.highLow,templates.lowHigh,templates.arc];
   develop[Math.floor(this.rand()*develop.length)](35.0);
   develop[Math.floor(this.rand()*develop.length)](43.0);
   develop[Math.floor(this.rand()*develop.length)](51.0);
   const pressure=[templates.jumpSlide,templates.slideJump,templates.groundLow,templates.lowGround,templates.highLow,templates.lowHigh,templates.arc,templates.triple];
   pressure[Math.floor(this.rand()*pressure.length)](58.5);
   pressure[Math.floor(this.rand()*pressure.length)](66.0);
   // Stage signature: fixed timing identity per environment.
   if(CONFIG.activeWorld==="na01"){
     add(75.4,g1,null,"normal","NA01 SIGNATURE");add(77.0,b,"high","fast","NA01 SIGNATURE");add(79.0,g2,null,"normal","NA01 SIGNATURE");add(81.2,b,"low","normal","NA01 SIGNATURE");add(83.0,g1,null,"normal","NA01 SIGNATURE");
   }else if(CONFIG.activeWorld==="na02"){
     add(75.4,g2,null,"normal","NA02 SIGNATURE");add(77.1,b,"high","normal","NA02 SIGNATURE");add(79.1,g1,null,"normal","NA02 SIGNATURE");add(81.1,b,"low","fast","NA02 SIGNATURE");add(83.0,g2,null,"normal","NA02 SIGNATURE");
   }else if(CONFIG.activeWorld==="na03"){
     add(75.2,g1,null,"normal","NA03 SIGNATURE");add(77.1,b,"high","normal","NA03 SIGNATURE");add(79.2,g2,null,"normal","NA03 SIGNATURE");add(81.2,b,"low","normal","NA03 SIGNATURE");add(82.9,g1,null,"normal","NA03 SIGNATURE");add(84.6,g1,null,"normal","NA03 SIGNATURE");
   }else if(CONFIG.activeWorld==="sa01"){
     add(75.2,b,"high","fast","SA01 SIGNATURE");add(77.2,g1,null,"normal","SA01 SIGNATURE");add(79.3,g2,null,"normal","SA01 SIGNATURE");add(81.4,b,"low","normal","SA01 SIGNATURE");add(83.4,g1,null,"normal","SA01 SIGNATURE");
   }else if(CONFIG.activeWorld==="sa02"){
     add(75.2,g2,null,"normal","SA02 SIGNATURE");add(77.4,b,"low","fast","SA02 SIGNATURE");add(79.5,g1,null,"normal","SA02 SIGNATURE");add(81.7,b,"high","normal","SA02 SIGNATURE");add(83.6,g2,null,"normal","SA02 SIGNATURE");
   }else if(CONFIG.activeWorld==="sa03"){
     add(75.2,b,"high","normal","SA03 SIGNATURE");add(77.3,g1,null,"normal","SA03 SIGNATURE");add(79.5,b,"low","fast","SA03 SIGNATURE");add(81.7,g2,null,"normal","SA03 SIGNATURE");add(83.7,g1,null,"normal","SA03 SIGNATURE");
   }else if(CONFIG.activeWorld==="eu01"){
     add(75.2,g1,null,"normal","EU01 SIGNATURE");add(77.1,b,"high","normal","EU01 SIGNATURE");add(79.1,g2,null,"normal","EU01 SIGNATURE");add(81.2,b,"low","fast","EU01 SIGNATURE");add(83.4,g1,null,"normal","EU01 SIGNATURE");
   }else if(CONFIG.activeWorld==="eu02"){
     add(75.2,b,"high","normal","EU02 SIGNATURE");add(77.2,g1,null,"normal","EU02 SIGNATURE");add(79.3,g2,null,"normal","EU02 SIGNATURE");add(81.4,b,"low","fast","EU02 SIGNATURE");add(83.5,g1,null,"normal","EU02 SIGNATURE");
   }else{
     add(75.2,g2,null,"normal","EU03 SIGNATURE");add(77.2,b,"low","fast","EU03 SIGNATURE");add(79.3,g1,null,"normal","EU03 SIGNATURE");add(81.4,b,"high","normal","EU03 SIGNATURE");add(83.5,g2,null,"normal","EU03 SIGNATURE");
   }
   s.planned=this.enforceReactionQueue(plan.sort((a,b)=>a.time-b.time));s.nextPlanIndex=0;
 }
 enforceReactionQueue(plan){
   const s=this.cfg(),limit=Math.max(1,Math.floor(s.maxVisible||2)),window=Math.max(.1,s.reactionLead||2.2),minGap=.05;
   // Visual Queue Contract: no more than `maxVisible` hazard arrivals may occupy the immediate reaction window.
   // Hazards may still be visible farther down-course because ground hazards scroll at world speed, but only the nearest
   // queue is allowed to demand simultaneous timing decisions. Later events are pushed just enough to preserve readability.
   for(let i=limit;i<plan.length;i++){
     const anchor=plan[i-limit];
     const earliest=anchor.time+window+minGap;
     if(plan[i].time<earliest)plan[i].time=Number(earliest.toFixed(2));
   }
   return plan.sort((a,b)=>a.time-b.time);
 }
 reset(){
   const s=this.cfg();s.enabled=false;s.paused=false;s.failed=false;s.elapsed=0;s.active=[];s.hits=0;s.cleared=0;s.lastEvent="Ready";s.lives=s.startingLives;s.nextPlanIndex=0;
   this.invulnT=0;this.recoveryT=0;this.finished=false;this.buildPlan();this.character.setState("run");
 }
 start(){const s=this.cfg();if(this.finished||s.failed||s.elapsed<=0)this.reset();s.enabled=true;s.paused=false;s.lastEvent="90-second run started";this.character.setState("run")}
 togglePause(){const s=this.cfg();if(!s.enabled||s.failed||this.finished)return;s.paused=!s.paused;s.lastEvent=s.paused?"Run paused":"Run resumed";this.character.setState(s.paused?"idle":"run")}
 isRecovering(){return this.recoveryT>0}
 defFor(inst){return this.defs().find(d=>d.name===inst.defName)}
 speedFor(inst,d){return d.kind==="flying"?(this.cfg().speedClasses[inst.speedClass]||this.cfg().speedClasses.normal):CONFIG.worldSpeed}
 spawnXFor(d){
   // Spawn by visual bounds, not collider center, so the entire sprite begins off-screen.
   const baseScale=CONFIG.canvas.w/CONFIG.worldContract.sourceW,sc=baseScale*d.scale;
   const crop=d.crop||{l:0,r:0,t:0,b:0};
   const fullW=(d.kind==="flying"||(d.frames&&d.frameW))?d.frameW:d.rect.w;
   const sw=Math.max(1,fullW-(crop.l||0)-(crop.r||0));
   const dw=sw*sc;
   const padding=Math.max(48,Math.min(120,dw*.18));
   return CONFIG.canvas.w+dw/2+padding;
 }
 travelLeadFor(ev,d){
   const speed=this.speedFor(ev,d);
   return Math.max(.1,(this.spawnXFor(d)-CONFIG.characterX)/speed);
 }
 spawnPlanned(ev){
   const s=this.cfg(),d=this.defs().find(x=>x.name===ev.defName);if(!d)return;
   const x=this.spawnXFor(d);
   s.active.push({defName:ev.defName,x,mode:ev.mode,t:0,frame:0,hit:false,passed:false,speedClass:ev.speedClass,pattern:ev.pattern,targetTime:ev.time});
   ev.spawned=true;s.lastEvent=`${ev.pattern}: ${ev.defName}${ev.mode?` ${ev.mode.toUpperCase()}`:""}${d.kind==="flying"?` / ${ev.speedClass.toUpperCase()}`:""}`;
 }
 geom(inst,d){
   const baseScale=CONFIG.canvas.w/CONFIG.worldContract.sourceW,sc=baseScale*d.scale;let sw,sh,sx,sy,dw,dh,dx,dy,anchorY;
   const crop=d.crop||(d.crop={l:0,r:0,t:0,b:0});
   if(d.kind==="flying"){
     const cellW=d.frameW,cellH=d.frameH,cL=Math.max(0,Math.min(cellW-1,crop.l||0)),cR=Math.max(0,Math.min(cellW-1-cL,crop.r||0)),cT=Math.max(0,Math.min(cellH-1,crop.t||0)),cB=Math.max(0,Math.min(cellH-1-cT,crop.b||0));
     sw=Math.max(1,cellW-cL-cR);sh=Math.max(1,cellH-cT-cB);sx=inst.frame*cellW+cL;sy=cT;dw=sw*sc;dh=sh*sc;dx=inst.x-dw/2;
     const clearance=inst.mode==="high"?CONFIG.objectQA.flying.highClearance:CONFIG.objectQA.flying.lowClearance;anchorY=this.objectQA.surfaceY()-clearance;dy=anchorY-dh/2;
   }else{
     const r=d.rect||{x:0,y:0,w:d.frameW,h:d.frameH},rw=d.frames&&d.frameW?d.frameW:r.w,rh=d.frames&&d.frameH?d.frameH:r.h,cL=Math.max(0,Math.min(rw-1,crop.l||0)),cR=Math.max(0,Math.min(rw-1-cL,crop.r||0)),cT=Math.max(0,Math.min(rh-1,crop.t||0)),cB=Math.max(0,Math.min(rh-1-cT,crop.b||0));
     sw=Math.max(1,rw-cL-cR);sh=Math.max(1,rh-cT-cB);sx=(d.frames&&d.frameW?inst.frame*d.frameW:r.x)+cL;sy=(d.frames&&d.frameH?0:r.y)+cT;dw=sw*sc;dh=sh*sc;dx=inst.x-dw/2;anchorY=this.objectQA.surfaceY()+(Number.isFinite(d.groundOffset)?d.groundOffset:CONFIG.objectQA.groundOffset);dy=anchorY-dh;
   }
   const cw=Math.max(4,dw*d.cw),ch=Math.max(4,dh*d.ch),cx=dx+(dw-cw)/2+d.cx*dw,cy=d.kind==="flying"?dy+(dh-ch)/2+d.cy*dh:anchorY-ch+d.cy*dh;
   return{sw,sh,sx,sy,dw,dh,dx,dy,box:{x:cx,y:cy,w:cw,h:ch}};
 }
 triggerHit(inst){
   const s=this.cfg();if(this.invulnT>0||inst.hit||s.failed)return;inst.hit=true;s.hits++;if(!s.unlimitedLives)s.lives=Math.max(0,s.lives-1);else s.lives=s.startingLives;s.lastEvent=s.unlimitedLives?`HIT — ${inst.defName} — QA UNLIMITED LIVES`:`HIT — ${inst.defName} — ${s.lives} ${s.lives===1?"life":"lives"} left`;
   this.recoveryT=CONFIG.hitRecovery.recoveryDuration;this.invulnT=CONFIG.hitRecovery.invulnerabilityDuration;this.character.setState("hit");
   if(!s.unlimitedLives&&s.lives<=0){s.failed=true;s.enabled=false;s.lastEvent="RUN FAILED — no lives remaining";}
 }
 update(dt){
   const s=this.cfg();
   if(!s.enabled||s.paused||this.finished||s.failed)return;
   if(this.invulnT>0)this.invulnT=Math.max(0,this.invulnT-dt);if(this.recoveryT>0)this.recoveryT=Math.max(0,this.recoveryT-dt);
   // Normal hit recovery locks player avoidance input, but the course keeps moving.
   // Only final RUN FAILED freezes the world/hazards (handled by the early return above).
   const canAdvance=true;s.elapsed=Math.min(s.stageDuration,s.elapsed+dt);
   // Each authored event has a target arrival time at the player. Spawn early enough that
   // the COMPLETE hazard starts beyond the right edge, then naturally enters the viewport.
   // Off-screen queued hazards do not consume the on-screen visibility budget.
   while(s.nextPlanIndex<s.planned.length){
     const ev=s.planned[s.nextPlanIndex],d=this.defs().find(x=>x.name===ev.defName);
     if(!d){s.nextPlanIndex++;continue}
     const lead=this.travelLeadFor(ev,d);
     if(ev.time-s.elapsed<=lead){this.spawnPlanned(ev);s.nextPlanIndex++;}
     else break;
   }
   const cb=this.objectQA.characterBox();
   for(const inst of s.active){const d=this.defFor(inst);if(!d)continue;const speed=this.speedFor(inst,d);if(d.frames){inst.t+=dt;inst.frame=Math.floor(inst.t*CONFIG.objectQA.flying.fps)%d.frames;}if(canAdvance)inst.x-=speed*dt;const g=this.geom(inst,d);if(this.objectQA.intersects(g.box,cb))this.triggerHit(inst);if(!inst.passed&&inst.x<CONFIG.characterX-90){inst.passed=true;s.cleared++;}}
   s.active=s.active.filter(inst=>inst.x>-260);
   if(this.recoveryT<=0&&this.character.state==="hit"&&!s.failed)this.character.setState("run");
   if(s.elapsed>=s.stageDuration){this.finished=true;s.enabled=false;s.lastEvent=`FINISH — ${CONFIG.worldProfiles[CONFIG.activeWorld].label}`;this.character.setState("celebrate");}
 }
 finishGeom(){
   const s=this.cfg(),fc=this.finishCfg(),img=this.a.finishMarker;if(!img)return null;const remaining=Math.max(0,s.stageDuration-s.elapsed);if(remaining>s.finishRelease)return null;
   const baseScale=CONFIG.canvas.w/CONFIG.worldContract.sourceW,sc=baseScale*fc.scale,dw=img.width*sc,dh=img.height*sc;const x=CONFIG.characterX+remaining*CONFIG.worldSpeed+fc.xOffset;const surface=this.objectQA.surfaceY()+fc.groundOffset;
   return{img,dw,dh,dx:x-dw/2,dy:surface-dh,trigger:{x:x-CONFIG.finish.triggerWidth/2,y:0,w:CONFIG.finish.triggerWidth,h:CONFIG.canvas.h}};
 }
 drawHUD(){
   const s=this.cfg(),hud=document.getElementById("gameplayHud"),fail=document.getElementById("runFail"),actions=document.getElementById("gameplayActions");if(!hud)return;const active=s.enabled||this.finished||s.failed||s.elapsed>0;hud.classList.toggle("hidden",!active);fail&&fail.classList.toggle("show",!!s.failed);actions&&actions.classList.toggle("show",!!s.enabled&&!s.failed&&!this.finished);const jumpBtn=document.getElementById("gameJumpBtn"),slideBtn=document.getElementById("gameSlideBtn"),pauseBtn=document.getElementById("gamePauseBtn");if(jumpBtn)jumpBtn.disabled=!!s.paused;if(slideBtn)slideBtn.disabled=!!s.paused;if(pauseBtn){pauseBtn.textContent=s.paused?"RESUME":"PAUSE";pauseBtn.setAttribute("aria-label",s.paused?"Resume game":"Pause game");}if(!active)return;
   const lifeHud=document.getElementById("lifeHud");if(lifeHud){const lives=Math.max(0,Math.min(s.startingLives,s.lives));lifeHud.classList.remove("lives-3","lives-2","lives-1","lives-0");lifeHud.classList.add("lives-"+lives);const hearts=lifeHud.querySelectorAll(".life-heart");const pulseMap={3:"1.35s",2:".90s",1:".58s"};hearts.forEach((h,i)=>{const isFull=i<lives;const isActive=isFull&&i===lives-1;h.classList.toggle("full",isFull);h.classList.toggle("empty",!isFull);h.classList.toggle("active",isActive);h.style.setProperty("--pulse-speed",pulseMap[lives]||"1.35s");});}
   const stageTitle=document.getElementById("stageHudTitle");if(stageTitle){const stageMap={na01:"NORTH AMERICA • STAGE 1",na02:"NORTH AMERICA • STAGE 2",na03:"NORTH AMERICA • STAGE 3",sa01:"SOUTH AMERICA • STAGE 1",sa02:"SOUTH AMERICA • STAGE 2",sa03:"SOUTH AMERICA • STAGE 3",eu01:"EUROPE • STAGE 1",eu02:"EUROPE • STAGE 2",eu03:"EUROPE • STAGE 3"};stageTitle.textContent=stageMap[CONFIG.activeWorld]||"AROUND THE WORLD";}
   const marker=document.getElementById("progressMarker");if(marker){const p=Math.max(0,Math.min(1,s.elapsed/Math.max(.001,s.stageDuration)));marker.style.left=`${4.8+p*86.95}%`;marker.classList.toggle("claude",this.character.character==="claude");marker.classList.toggle("constance",this.character.character==="constance");}
 }
 draw(){
   const s=this.cfg();if(!s.enabled&&!this.finished&&!s.failed&&s.elapsed<=0){this.drawHUD();return}
   for(const inst of s.active){const d=this.defFor(inst);if(!d)continue;const img=this.a[d.atlasKey],g=this.geom(inst,d);this.ctx.drawImage(img,g.sx,g.sy,g.sw,g.sh,Math.round(g.dx),Math.round(g.dy),Math.round(g.dw),Math.round(g.dh));if(CONFIG.objectQA.showBounds){this.ctx.save();this.ctx.strokeStyle=inst.hit?"#ff4d4d":"#43e07b";this.ctx.lineWidth=2;this.ctx.strokeRect(g.box.x+.5,g.box.y+.5,g.box.w,g.box.h);this.ctx.restore();}}
   const fg=this.finishGeom();if(fg&&fg.dx<CONFIG.canvas.w+200&&fg.dx+fg.dw>-200){this.ctx.drawImage(fg.img,Math.round(fg.dx),Math.round(fg.dy),Math.round(fg.dw),Math.round(fg.dh));this.lastFinishBox=fg.trigger;if(CONFIG.finish.showBounds){this.ctx.save();this.ctx.strokeStyle="#ffd646";this.ctx.lineWidth=2;this.ctx.strokeRect(fg.trigger.x+.5,fg.trigger.y+.5,fg.trigger.w,fg.trigger.h);this.ctx.restore();}}
   this.drawHUD();
 }
}

class Lab{
 constructor(canvas,a){
   this.canvas=canvas;this.ctx=canvas.getContext("2d");this.ctx.imageSmoothingEnabled=false;
   this.scene=new Scene(this.ctx,a);this.character=new CharacterMachine(a);this.character.character="claude";this.character.setState("run");this.objectQA=new ObjectQA(this.ctx,a,this.scene,this.character);this.gameplay=new GameplayDirector(this.ctx,a,this.scene,this.character,this.objectQA);
   this.paused=false;this.slow=false;this.calibrationMode=true;this.last=performance.now();this.timer=null;
   this.bindUI();this.organizeControlCenter();this.draw();this.renderUI();
 }
 organizeControlCenter(){
   document.querySelectorAll("#tunerPanel > .control-section").forEach((sec)=>{
     const label=sec.querySelector(":scope > .control-label:first-child"); if(!label)return;
     sec.classList.add("foldable");
     if(sec.dataset.defaultOpen!=="true")sec.classList.add("folded");
     label.title="Expand / collapse section";
     label.addEventListener("click",()=>sec.classList.toggle("folded"));
   });
 }
 bindUI(){
   const $=id=>document.getElementById(id);

   const tunerPanel=$("tunerPanel");
   const tunerToggle=$("tunerToggle");
   const openPanel=()=>{
     tunerPanel.classList.remove("collapsed");
     tunerToggle.setAttribute("aria-expanded","true");
   };
   const closePanel=()=>{
     tunerPanel.classList.add("collapsed");
     tunerToggle.setAttribute("aria-expanded","false");
   };
   tunerToggle.onclick=openPanel;
   $("panelClose").onclick=closePanel;

   $("characterBtn").onclick=()=>{
     this.character.toggleCharacter();
     $("characterBtn").textContent=this.character.character==="claude"?"Switch to Constance":"Switch to Claude";
     this.draw();this.renderUI();
   };

   const setJumpInspectionPose=(frame=0)=>{
     const frames=CONFIG.state.jump.frames;
     const f=((frame%frames)+frames)%frames;
     const g=CONFIG.jump.gravity;
     const launch=Math.abs(CONFIG.jump.launch);
     const apex=(launch*launch)/(2*g);
     this.character.state="jump";
     this.character.frame=f;
     this.character.elapsed=0;
     if(f===0){
       this.character.y=-Math.max(24,apex*0.38);
       this.character.vy=-launch*0.72;
     }else if(f===1){
       this.character.y=-apex;
       this.character.vy=0;
     }else{
       this.character.y=-Math.max(24,apex*0.38);
       this.character.vy=launch*0.72;
     }
   };

   const selectState=(state)=>{
     if(this.gameplay&&(this.gameplay.isRecovering()||CONFIG.spawnDirector.failed)&&(state==="jump"||state==="slide")){$("status").textContent=CONFIG.spawnDirector.failed?"Run failed — choose TRY AGAIN or EXIT RUN.":"Recovery active — avoidance input is temporarily locked.";return;}
     // Jump honors the current Pause state. If the preview is paused, selecting Jump
     // enters a paused airborne inspection pose so Next Frame can cycle the full jump
     // atlas. If the preview is running, selecting Jump performs the real physics arc.
     if(state==="jump"){
       if(this.paused){
         setJumpInspectionPose(0);
         $("pauseBtn").textContent="Resume";
       }else{
         this.character.setState("run");
         this.character.triggerJump();
         $("pauseBtn").textContent="Pause";
       }
     }else{
       this.character.setState(state);
       if(this.calibrationMode){
         this.paused=true;
         $("pauseBtn").textContent="Resume";
       }else{
         this.paused=false;
         $("pauseBtn").textContent="Pause";
       }
     }
     this.draw();this.renderUI();
     $("status").textContent=state==="jump"
       ? (this.paused
          ? `${CHAR[this.character.character].label} JUMP paused inspection — frame 1/${CONFIG.state.jump.frames}. Use Next Frame to inspect the airborne cycle, then Resume to continue.`
          : `${CHAR[this.character.character].label} JUMP live preview — full physics arc playing.`)
       : (this.calibrationMode
          ? `${CHAR[this.character.character].label} ${state.toUpperCase()} selected for calibration. Use Smaller/Larger and Next Frame.`
          : `${CHAR[this.character.character].label} ${state.toUpperCase()} live preview.`);
   };

   document.querySelectorAll("[data-state]").forEach(btn=>btn.onclick=()=>selectState(btn.dataset.state));
   $("runBtn").onclick=()=>selectState("run");

   $("quickRunBtn").onclick=()=>{
     if(this.gameplay.isRecovering()){$("status").textContent="Recovery active — input temporarily locked.";return;}
     this.character.setState("run");this.paused=false;$("pauseBtn").textContent="Pause";
     $("status").textContent="RUN test active.";this.draw();this.renderUI();
   };
   $("quickJumpBtn").onclick=()=>{
     if(this.gameplay.isRecovering()){$("status").textContent="Recovery active — input temporarily locked.";return;}
     this.character.triggerJump();this.paused=false;$("pauseBtn").textContent="Pause";
     $("status").textContent="JUMP test active — full physics arc playing.";this.draw();this.renderUI();
   };
   $("quickSlideBtn").onclick=()=>{
     if(this.gameplay.isRecovering()){$("status").textContent="Recovery active — input temporarily locked.";return;}
     this.character.triggerSlide();this.paused=false;$("pauseBtn").textContent="Pause";
     $("status").textContent=`SLIDE active for ${CONFIG.actions.slideDuration.toFixed(2)} s — auto-return to Run. Press Slide again to extend.`;this.draw();this.renderUI();
   };

   const gameplayAction=(action)=>{
     const sp=CONFIG.spawnDirector;
     if(!sp.enabled||sp.paused||sp.failed||this.gameplay.finished)return;
     if(this.gameplay.isRecovering()){$("status").textContent="Recovery active — avoidance input is temporarily locked.";return;}
     if(action==="jump"){this.character.triggerJump();$("status").textContent="Gameplay JUMP";}
     else{this.character.triggerSlide();$("status").textContent=`Gameplay SLIDE — ${CONFIG.actions.slideDuration.toFixed(2)} s`;}
   };
   $("gameJumpBtn").onclick=()=>gameplayAction("jump");
   $("gameSlideBtn").onclick=()=>gameplayAction("slide");
   $("gamePauseBtn").onclick=()=>{this.gameplay.togglePause();$("status").textContent=CONFIG.spawnDirector.lastEvent;this.draw();this.renderUI();};
   const setKeyVisual=(id,on)=>{const el=$(id);if(el)el.classList.toggle("key-active",on);};
   window.addEventListener("keydown",(e)=>{
     if(e.key!=="ArrowUp"&&e.key!=="ArrowDown")return;
     if(["INPUT","SELECT","TEXTAREA"].includes(document.activeElement?.tagName))return;
     e.preventDefault();
     if(e.repeat)return;
     if(e.key==="ArrowUp"){setKeyVisual("gameJumpBtn",true);gameplayAction("jump");}
     else{setKeyVisual("gameSlideBtn",true);gameplayAction("slide");}
   },{passive:false});
   window.addEventListener("keyup",(e)=>{
     if(e.key==="ArrowUp")setKeyVisual("gameJumpBtn",false);
     if(e.key==="ArrowDown")setKeyVisual("gameSlideBtn",false);
   });
   $("retryRunBtn").onclick=()=>{this.gameplay.start();this.paused=false;document.activeElement?.blur?.();$("pauseBtn").textContent="Pause";$("status").textContent="Run restarted from the beginning.";this.draw();this.renderUI();};
   $("exitRunBtn").onclick=()=>{this.gameplay.reset();this.paused=false;$("pauseBtn").textContent="Pause";$("runFail").classList.remove("show");$("gameplayActions").classList.remove("show");$("gameplayHud").classList.add("hidden");$("status").textContent="Exited gameplay run. Calibration/testing controls are available.";this.draw();this.renderUI();};

   $("calibrationModeBtn").onclick=()=>{
     this.calibrationMode=!this.calibrationMode;
     const btn=$("calibrationModeBtn");
     btn.textContent="Calibration Mode: "+(this.calibrationMode?"ON":"OFF");
     btn.classList.toggle("active",this.calibrationMode);
     if(this.calibrationMode){
       this.paused=true;
       $("pauseBtn").textContent="Resume";
       $("status").textContent="Calibration Mode ON: static states stay frozen for tuning. Jump honors Pause: while paused it becomes an airborne frame-inspection state; while running it plays the full physics arc.";
     }else{
       this.paused=false;
       $("pauseBtn").textContent="Pause";
       this.character.setState("run");
       $("status").textContent="Calibration Mode OFF: normal live state behavior.";
     }
     this.draw();this.renderUI();
   };

   $("starsBtn").onclick=()=>{
     this.character.cycleStars();
     $("starsBtn").textContent="Stun Stars: "+this.character.starMode[0].toUpperCase()+this.character.starMode.slice(1);
     this.draw();this.renderUI();
   };

   const adjustStateScale=(delta)=>{
     const who=this.character.character;
     const state=this.character.state;
     if(state==="run"){
       $("status").textContent="RUN scale is locked at 1.000. Select another state to calibrate.";
       return;
     }
     const next=Math.max(0.70,Math.min(1.20,CONFIG.stateScale[who][state]+delta));
     CONFIG.stateScale[who][state]=Math.round(next*1000)/1000;
     $("status").textContent=`${CHAR[who].label} ${state.toUpperCase()} size setting = ${CONFIG.stateScale[who][state].toFixed(3)}`;
     this.draw();this.renderUI();
   };

   $("sizeSmaller").onclick=()=>adjustStateScale(-0.010);
   $("sizeLarger").onclick=()=>adjustStateScale(0.010);
   $("fineSmaller").onclick=()=>adjustStateScale(-0.005);
   $("fineLarger").onclick=()=>adjustStateScale(0.005);

   
   
   
   
   $("sizeReset").onclick=()=>{
     const who=this.character.character;
     const state=this.character.state;
     if(state==="run"){
       $("status").textContent="RUN scale is locked at 1.000.";
       return;
     }
     CONFIG.stateScale[who][state]=1.000;
     $("status").textContent=`${CHAR[who].label} ${state.toUpperCase()} size reset to 1.000`;
     this.draw();this.renderUI();
   };

   $("starSmaller").onclick=()=>{
     const who=this.character.character;
     CONFIG.starScale[who]=Math.max(0.20,Math.round((CONFIG.starScale[who]-0.02)*100)/100);
     $("status").textContent=`${CHAR[who].label} star size = ${CONFIG.starScale[who].toFixed(2)}`;
     this.draw();this.renderUI();
   };
   $("starLarger").onclick=()=>{
     const who=this.character.character;
     CONFIG.starScale[who]=Math.min(1.00,Math.round((CONFIG.starScale[who]+0.02)*100)/100);
     $("status").textContent=`${CHAR[who].label} star size = ${CONFIG.starScale[who].toFixed(2)}`;
     this.draw();this.renderUI();
   };

   $("starUp").onclick=()=>{
     const who=this.character.character;
     CONFIG.starYOffset[who]-=2;
     $("status").textContent=`${CHAR[who].label} star Y offset = ${CONFIG.starYOffset[who]} px`;
     this.draw();this.renderUI();
   };
   $("starDown").onclick=()=>{
     const who=this.character.character;
     CONFIG.starYOffset[who]+=2;
     $("status").textContent=`${CHAR[who].label} star Y offset = ${CONFIG.starYOffset[who]} px`;
     this.draw();this.renderUI();
   };

   const buildFullQASnapshot=()=>({
     schema:"CC_WORLD_QA_SNAPSHOT_12",
     activeContext:{
       continent:CONFIG.activeWorld.startsWith("eu")?"europe":(CONFIG.activeWorld.startsWith("sa")?"south-america":"north-america"),
       stage:CONFIG.activeWorld,
       character:this.character.character,
       characterState:this.character.state,
       selectedHazardIndex:CONFIG.objectQA.activeIndex[CONFIG.activeWorld]||0,
       selectedHazard:this.objectQA.active()?.name||null
     },
     character:{
       characterX:CONFIG.characterX,
       worldSpeed:CONFIG.worldSpeed,
       masterScale:JSON.parse(JSON.stringify(CONFIG.masterScale)),
       stateScale:JSON.parse(JSON.stringify(CONFIG.stateScale)),
       renderOffsetX:JSON.parse(JSON.stringify(CONFIG.renderOffsetX)),
       renderOffsetY:JSON.parse(JSON.stringify(CONFIG.renderOffsetY)),
       cropInsets:JSON.parse(JSON.stringify(CONFIG.cropInsets)),
       characterQA:JSON.parse(JSON.stringify(CONFIG.characterQA)),
       jump:JSON.parse(JSON.stringify(CONFIG.jump)),
       animationStates:JSON.parse(JSON.stringify(CONFIG.state)),
       starScale:JSON.parse(JSON.stringify(CONFIG.starScale)),
       starYOffset:JSON.parse(JSON.stringify(CONFIG.starYOffset)),
       characterCollision:JSON.parse(JSON.stringify(CONFIG.objectQA.characterCollision))
     },
     world:{
       contract:JSON.parse(JSON.stringify(CONFIG.worldContract)),
       profiles:JSON.parse(JSON.stringify(CONFIG.worldProfiles))
     },
     hazards:{
       definitions:JSON.parse(JSON.stringify(CONFIG.objectQA.defs)),
       flying:JSON.parse(JSON.stringify({
         mode:CONFIG.objectQA.flying.mode,
         highClearance:CONFIG.objectQA.flying.highClearance,
         lowClearance:CONFIG.objectQA.flying.lowClearance,
         speed:CONFIG.objectQA.flying.speed,
         fps:CONFIG.objectQA.flying.fps
       })),
       qaPreview:{
         x:CONFIG.objectQA.x,
         legacyGroundOffsetFallback:CONFIG.objectQA.groundOffset,
         loopDistance:CONFIG.objectQA.loopDistance,
         showBounds:CONFIG.objectQA.showBounds
       }
     },
     gameplay:{
       spawnDirector:JSON.parse(JSON.stringify(CONFIG.spawnDirector)),
       hitRecovery:JSON.parse(JSON.stringify(CONFIG.hitRecovery)),
       actions:JSON.parse(JSON.stringify(CONFIG.actions)),
       finish:JSON.parse(JSON.stringify(CONFIG.finish))
     }
   });

   const LOCAL_CONFIG_KEY="CC_WORLD_QA_LOCAL_CONFIG_14_SIGNATURE_VISUAL_QUEUE";
   const localSaveMeta={savedAt:null};

   const formatSavedAt=(iso)=>{
     if(!iso)return "No saved configuration.";
     try{return "Saved locally: "+new Date(iso).toLocaleString();}
     catch{return "Saved locally.";}
   };

   const updateLocalSaveStatus=()=>{
     const el=$("localSaveStatus"); if(!el)return;
     try{
       const raw=localStorage.getItem(LOCAL_CONFIG_KEY);
       if(!raw){el.textContent="No saved configuration.";return;}
       const parsed=JSON.parse(raw);
       el.textContent=formatSavedAt(parsed.savedAt||null);
     }catch(err){
       el.textContent="Local storage unavailable in this browser/viewer.";
     }
   };

   const applyFullQASnapshot=(snap)=>{
     if(!snap||!["CC_WORLD_QA_SNAPSHOT_01","CC_WORLD_QA_SNAPSHOT_02","CC_WORLD_QA_SNAPSHOT_03","CC_WORLD_QA_SNAPSHOT_04","CC_WORLD_QA_SNAPSHOT_05","CC_WORLD_QA_SNAPSHOT_06","CC_WORLD_QA_SNAPSHOT_07","CC_WORLD_QA_SNAPSHOT_08","CC_WORLD_QA_SNAPSHOT_09","CC_WORLD_QA_SNAPSHOT_10","CC_WORLD_QA_SNAPSHOT_12","CC_WORLD_QA_SNAPSHOT_12"].includes(snap.schema))throw new Error("Unsupported QA snapshot schema");
     const c=snap.character||{}, w=snap.world||{}, h=snap.hazards||{}, ctx=snap.activeContext||{};

     // Legacy migration: Snapshot 05 and earlier used the action/state name "duck".
     // LAB24F canonicalizes that state to "slide" while preserving old QA snapshots.
     const migrateStateMap=(obj)=>{
       if(!obj||typeof obj!=="object")return obj;
       Object.values(obj).forEach(v=>{if(v&&typeof v==="object"&&Object.prototype.hasOwnProperty.call(v,"duck")&&!Object.prototype.hasOwnProperty.call(v,"slide")){v.slide=v.duck;delete v.duck;}});
       return obj;
     };
     if(snap.schema!=="CC_WORLD_QA_SNAPSHOT_07"){
       if(c.stateScale)migrateStateMap(c.stateScale);
       if(c.characterCollision)migrateStateMap(c.characterCollision);
       if(c.animationStates&&c.animationStates.duck&&!c.animationStates.slide){c.animationStates.slide=c.animationStates.duck;delete c.animationStates.duck;}
       if(ctx.characterState==="duck")ctx.characterState="slide";
       if(snap.gameplay&&snap.gameplay.actions&&Number.isFinite(snap.gameplay.actions.duckDuration)&&!Number.isFinite(snap.gameplay.actions.slideDuration)){
         snap.gameplay.actions.slideDuration=snap.gameplay.actions.duckDuration;delete snap.gameplay.actions.duckDuration;
       }
       if(snap.gameplay&&snap.gameplay.spawnDirector&&Array.isArray(snap.gameplay.spawnDirector.planned)){
         snap.gameplay.spawnDirector.planned.forEach(e=>{if(typeof e.pattern==="string")e.pattern=e.pattern.replaceAll("DUCK","SLIDE");});
       }
     }

     if(c.masterScale)CONFIG.masterScale=JSON.parse(JSON.stringify(c.masterScale));
     if(c.stateScale)CONFIG.stateScale=JSON.parse(JSON.stringify(c.stateScale));
     if(c.renderOffsetX)CONFIG.renderOffsetX=JSON.parse(JSON.stringify(c.renderOffsetX));
     if(c.renderOffsetY)CONFIG.renderOffsetY=JSON.parse(JSON.stringify(c.renderOffsetY));
     if(c.cropInsets)CONFIG.cropInsets=JSON.parse(JSON.stringify(c.cropInsets));
     if(c.characterQA)Object.assign(CONFIG.characterQA,c.characterQA);
     if(c.jump)CONFIG.jump=JSON.parse(JSON.stringify(c.jump));
     if(c.animationStates)CONFIG.state=JSON.parse(JSON.stringify(c.animationStates));
     if(c.starScale)CONFIG.starScale=JSON.parse(JSON.stringify(c.starScale));
     if(c.starYOffset)CONFIG.starYOffset=JSON.parse(JSON.stringify(c.starYOffset));
     if(c.characterCollision)CONFIG.objectQA.characterCollision=JSON.parse(JSON.stringify(c.characterCollision));
     if(Number.isFinite(c.characterX))CONFIG.characterX=c.characterX;
     if(Number.isFinite(c.worldSpeed))CONFIG.worldSpeed=c.worldSpeed;

     if(w.contract)CONFIG.worldContract=JSON.parse(JSON.stringify(w.contract));
     if(w.profiles)CONFIG.worldProfiles=JSON.parse(JSON.stringify(w.profiles));

     if(h.definitions){
       CONFIG.objectQA.defs=JSON.parse(JSON.stringify(h.definitions));
       const legacyGround=(h.qaPreview&&Number.isFinite(h.qaPreview.groundOffset))?h.qaPreview.groundOffset:((h.qaPreview&&Number.isFinite(h.qaPreview.legacyGroundOffsetFallback))?h.qaPreview.legacyGroundOffsetFallback:CONFIG.objectQA.groundOffset);
       Object.values(CONFIG.objectQA.defs).flat().forEach(d=>{if(d.kind==="ground"&&!Number.isFinite(d.groundOffset))d.groundOffset=legacyGround;});
     }
     if(h.flying){
       const f=h.flying;
       if(f.mode)CONFIG.objectQA.flying.mode=f.mode;
       if(Number.isFinite(f.highClearance))CONFIG.objectQA.flying.highClearance=f.highClearance;
       if(Number.isFinite(f.lowClearance))CONFIG.objectQA.flying.lowClearance=f.lowClearance;
       if(Number.isFinite(f.speed))CONFIG.objectQA.flying.speed=f.speed;
       if(Number.isFinite(f.fps))CONFIG.objectQA.flying.fps=f.fps;
     }
     if(h.qaPreview){
       const q=h.qaPreview;
       if(Number.isFinite(q.x))CONFIG.objectQA.x=q.x;
       if(Number.isFinite(q.groundOffset))CONFIG.objectQA.groundOffset=q.groundOffset;
       if(Number.isFinite(q.legacyGroundOffsetFallback))CONFIG.objectQA.groundOffset=q.legacyGroundOffsetFallback;
       if(Number.isFinite(q.loopDistance))CONFIG.objectQA.loopDistance=q.loopDistance;
       if(typeof q.showBounds==="boolean")CONFIG.objectQA.showBounds=q.showBounds;
     }

     if(snap.gameplay){
       if(snap.gameplay.spawnDirector){const incoming=JSON.parse(JSON.stringify(snap.gameplay.spawnDirector));incoming.enabled=false;incoming.paused=false;incoming.active=[];incoming.distance=0;incoming.elapsed=0;CONFIG.spawnDirector={...CONFIG.spawnDirector,...incoming};}
       if(snap.gameplay.hitRecovery)CONFIG.hitRecovery={...CONFIG.hitRecovery,...JSON.parse(JSON.stringify(snap.gameplay.hitRecovery))};
       if(snap.gameplay.actions)CONFIG.actions={...CONFIG.actions,...JSON.parse(JSON.stringify(snap.gameplay.actions))};
       if(snap.gameplay.finish)CONFIG.finish=JSON.parse(JSON.stringify(snap.gameplay.finish));
     }
     for(const p of Object.values(CONFIG.worldProfiles)){p.characterGrounding=p.characterGrounding||{claude:0,constance:0};if(!Number.isFinite(p.characterGrounding.claude))p.characterGrounding.claude=0;if(!Number.isFinite(p.characterGrounding.constance))p.characterGrounding.constance=0;}
     for(const list of Object.values(CONFIG.objectQA.defs)){for(const d of list){d.crop=d.crop||{l:0,r:0,t:0,b:0};}}
     if(ctx.stage&&CONFIG.worldProfiles[ctx.stage])CONFIG.activeWorld=ctx.stage;
     if(ctx.character&&(ctx.character==="claude"||ctx.character==="constance"))this.character.character=ctx.character;
     const restoredState=(ctx.characterState&&CONFIG.state[ctx.characterState])?ctx.characterState:"run";
     this.character.setState(restoredState==="jump"?"run":restoredState);
     if(Number.isInteger(ctx.selectedHazardIndex))CONFIG.objectQA.activeIndex[CONFIG.activeWorld]=ctx.selectedHazardIndex;

     this.scene.worldX=0;
     CONFIG.objectQA.scrollWithWorld=false;
     this.objectQA.resetPass();
     this.gameplay.reset();
     this.paused=false;
     this.slow=false;
     this.last=performance.now();
     this.draw();
     this.renderUI();
   };

   $("debugToggle").onclick=()=>{const p=$("debugPanel"),collapsed=p.classList.toggle("collapsed");$("debugToggle").textContent=collapsed?"+":"−";$("debugToggle").setAttribute("aria-expanded",String(!collapsed));};

   $("saveLocalConfig").onclick=()=>{
     try{
       const savedAt=new Date().toISOString();
       const payload={savedAt,snapshot:buildFullQASnapshot()};
       localStorage.setItem(LOCAL_CONFIG_KEY,JSON.stringify(payload));
       localSaveMeta.savedAt=savedAt;
       updateLocalSaveStatus();
       $("status").textContent="Complete QA configuration saved locally as a recovery checkpoint.";
     }catch(err){
       $("status").textContent="Could not save locally in this browser/viewer. Use Copy Full QA Snapshot as the backup.";
       updateLocalSaveStatus();
     }
   };

   $("restoreLocalConfig").onclick=()=>{
     try{
       const raw=localStorage.getItem(LOCAL_CONFIG_KEY);
       if(!raw){$("status").textContent="No locally saved QA configuration found.";updateLocalSaveStatus();return;}
       const payload=JSON.parse(raw);
       applyFullQASnapshot(payload.snapshot);
       localSaveMeta.savedAt=payload.savedAt||null;
       updateLocalSaveStatus();
       $("status").textContent="Locally saved QA configuration restored across character, world and hazard systems.";
     }catch(err){
       $("status").textContent="Saved configuration could not be restored: "+err.message;
     }
   };

   $("deleteLocalConfig").onclick=()=>{
     try{
       localStorage.removeItem(LOCAL_CONFIG_KEY);
       localSaveMeta.savedAt=null;
       updateLocalSaveStatus();
       $("status").textContent="Locally saved checkpoint deleted. Current in-memory settings were not changed.";
     }catch(err){
       $("status").textContent="Could not delete the local checkpoint in this browser/viewer.";
     }
   };

   updateLocalSaveStatus();

   $("copyCalibration").onclick=async()=>{
     const payload=JSON.stringify(buildFullQASnapshot(),null,2);
     try{
       await navigator.clipboard.writeText(payload);
       $("status").textContent="Full QA snapshot copied — includes global character grounding, every per-hazard ground offset, world profiles, hitboxes and shared flying configuration.";
     }catch{
       $("status").textContent=payload;
     }
   };


   $("jumpLower").onclick=()=>{
     CONFIG.jump.launch=Math.min(-120,CONFIG.jump.launch+10);
     $("status").textContent=`Jump power = ${Math.abs(CONFIG.jump.launch)} (lower)`;
     this.renderUI();
   };
   $("jumpHigher").onclick=()=>{
     CONFIG.jump.launch=Math.max(-520,CONFIG.jump.launch-10);
     $("status").textContent=`Jump power = ${Math.abs(CONFIG.jump.launch)} (higher)`;
     this.renderUI();
   };
   $("gravityLower").onclick=()=>{
     CONFIG.jump.gravity=Math.max(400,CONFIG.jump.gravity-25);
     $("status").textContent=`Gravity = ${CONFIG.jump.gravity} (slower fall)`;
     this.renderUI();
   };
   $("gravityHigher").onclick=()=>{
     CONFIG.jump.gravity=Math.min(1400,CONFIG.jump.gravity+25);
     $("status").textContent=`Gravity = ${CONFIG.jump.gravity} (faster fall)`;
     this.renderUI();
   };
   $("playFullJump").onclick=()=>{
     this.character.triggerJump();
     this.paused=false;
     $("pauseBtn").textContent="Pause";
     $("status").textContent="Playing full jump animation with current physics.";
     this.renderUI();
   };

   const world=()=>CONFIG.worldProfiles[CONFIG.activeWorld];
   const redrawWorld=()=>{this.draw();this.renderUI();};
    const syncWorldLayerQA=()=>{
      [["qaFarToggle","far","FAR"],["qaCloudsToggle","clouds","CLOUDS"],["qaMidToggle","mid","MID"],["qaGroundToggle","ground","GROUND"]].forEach(([id,key,label])=>{
        const b=$(id); if(!b)return; b.classList.toggle("active",!!WORLD_LAYER_QA[key]); b.textContent=label+" "+(WORLD_LAYER_QA[key]?"ON":"OFF");
      });
      const a=$("worldBackingAssertion"); if(a)a.textContent="TRANSPARENT";
    };
    [["qaFarToggle","far"],["qaCloudsToggle","clouds"],["qaMidToggle","mid"],["qaGroundToggle","ground"]].forEach(([id,key])=>{
      $(id).onclick=()=>{WORLD_LAYER_QA[key]=!WORLD_LAYER_QA[key];syncWorldLayerQA();redrawWorld();};
    });
    $("qaLayersAllOn").onclick=()=>{WORLD_LAYER_QA.far=true;WORLD_LAYER_QA.clouds=true;WORLD_LAYER_QA.mid=true;WORLD_LAYER_QA.ground=true;syncWorldLayerQA();redrawWorld();};
    syncWorldLayerQA();

   $("stageSelect").onchange=()=>{
     CONFIG.activeWorld=$("stageSelect").value;
     this.scene.worldX=0;
     CONFIG.objectQA.activeIndex[CONFIG.activeWorld]=0;
     CONFIG.objectQA.scrollWithWorld=false;
     this.objectQA.resetPass();
     this.gameplay.reset();
     $("status").textContent=world().label+" selected. World profile, hazard set and gameplay context synchronized.";
     redrawWorld();
   };

   $("seamUp").onclick=()=>{world().seamY-=2;redrawWorld();};
   $("seamDown").onclick=()=>{world().seamY+=2;redrawWorld();};
   $("guidesToggle").onclick=()=>{CONFIG.worldContract.showGuides=!CONFIG.worldContract.showGuides;redrawWorld();};
   $("farUp").onclick=()=>{world().farY-=2;redrawWorld();};
   $("farDown").onclick=()=>{world().farY+=2;redrawWorld();};
   $("farSmaller").onclick=()=>{world().farScale=Math.max(.60,+(world().farScale-.02).toFixed(2));redrawWorld();};
   $("farLarger").onclick=()=>{world().farScale=Math.min(1.60,+(world().farScale+.02).toFixed(2));redrawWorld();};
   $("midUp").onclick=()=>{world().midYOffset-=2;redrawWorld();};
   $("midDown").onclick=()=>{world().midYOffset+=2;redrawWorld();};
   $("midScaleLess").onclick=()=>{world().midScale=Math.max(.60,+(world().midScale-.02).toFixed(2));redrawWorld();};
   $("midScaleMore").onclick=()=>{world().midScale=Math.min(1.60,+(world().midScale+.02).toFixed(2));redrawWorld();};
   $("midParallaxLess").onclick=()=>{world().midParallax=Math.max(0,+(world().midParallax-.02).toFixed(2));redrawWorld();};
   $("midParallaxMore").onclick=()=>{world().midParallax=Math.min(1,+(world().midParallax+.02).toFixed(2));redrawWorld();};
   $("groundUp").onclick=()=>{world().groundYOffset-=2;redrawWorld();};
   $("groundDown").onclick=()=>{world().groundYOffset+=2;redrawWorld();};
   $("groundScaleLess").onclick=()=>{world().groundScale=Math.max(.60,+(world().groundScale-.02).toFixed(2));redrawWorld();};
   $("groundScaleMore").onclick=()=>{world().groundScale=Math.min(1.60,+(world().groundScale+.02).toFixed(2));redrawWorld();};
   $("groundParallaxLess").onclick=()=>{world().groundParallax=Math.max(.20,+(world().groundParallax-.05).toFixed(2));redrawWorld();};
   $("groundParallaxMore").onclick=()=>{world().groundParallax=Math.min(2,+(world().groundParallax+.05).toFixed(2));redrawWorld();};
   $("claudeFootUp").onclick=()=>{CONFIG.worldContract.footOffset.claude-=1;redrawWorld();};
   $("claudeFootDown").onclick=()=>{CONFIG.worldContract.footOffset.claude+=1;redrawWorld();};
   $("constanceFootUp").onclick=()=>{CONFIG.worldContract.footOffset.constance-=1;redrawWorld();};
   $("constanceFootDown").onclick=()=>{CONFIG.worldContract.footOffset.constance+=1;redrawWorld();};
   $("claudeStageFootUp").onclick=()=>{const p=world();p.characterGrounding=p.characterGrounding||{claude:0,constance:0};p.characterGrounding.claude-=1;redrawWorld();};
   $("claudeStageFootDown").onclick=()=>{const p=world();p.characterGrounding=p.characterGrounding||{claude:0,constance:0};p.characterGrounding.claude+=1;redrawWorld();};
   $("constanceStageFootUp").onclick=()=>{const p=world();p.characterGrounding=p.characterGrounding||{claude:0,constance:0};p.characterGrounding.constance-=1;redrawWorld();};
   $("constanceStageFootDown").onclick=()=>{const p=world();p.characterGrounding=p.characterGrounding||{claude:0,constance:0};p.characterGrounding.constance+=1;redrawWorld();};
   $("cloudSlower").onclick=()=>{CONFIG.worldContract.cloudSpeed=Math.max(0,CONFIG.worldContract.cloudSpeed-1);redrawWorld();};
   $("cloudFaster").onclick=()=>{CONFIG.worldContract.cloudSpeed=Math.min(30,CONFIG.worldContract.cloudSpeed+1);redrawWorld();};
   $("cloudUp").onclick=()=>{CONFIG.worldContract.cloudY-=1;redrawWorld();};
   $("cloudDown").onclick=()=>{CONFIG.worldContract.cloudY+=1;redrawWorld();};
   $("cloudSmaller").onclick=()=>{CONFIG.worldContract.cloudScale=Math.max(.30,+(CONFIG.worldContract.cloudScale-.05).toFixed(2));redrawWorld();};
   $("cloudLarger").onclick=()=>{CONFIG.worldContract.cloudScale=Math.min(1.50,+(CONFIG.worldContract.cloudScale+.05).toFixed(2));redrawWorld();};
   $("cloudFainter").onclick=()=>{CONFIG.worldContract.cloudOpacity=Math.max(.10,+(CONFIG.worldContract.cloudOpacity-.05).toFixed(2));redrawWorld();};
   $("cloudStronger").onclick=()=>{CONFIG.worldContract.cloudOpacity=Math.min(1.00,+(CONFIG.worldContract.cloudOpacity+.05).toFixed(2));redrawWorld();};
   $("copyWorldProfile").onclick=async()=>{
     const p=world();
     const obj={id:CONFIG.activeWorld.toUpperCase()+"_WORLD_PROFILE",seamY:p.seamY,farY:p.farY,farScale:p.farScale,midYOffset:p.midYOffset,midScale:p.midScale,midParallax:p.midParallax,groundYOffset:p.groundYOffset,groundScale:p.groundScale,groundParallax:p.groundParallax,stageCharacterGrounding:JSON.parse(JSON.stringify(p.characterGrounding||{claude:0,constance:0})),claudeFootOffset:CONFIG.worldContract.footOffset.claude,constanceFootOffset:CONFIG.worldContract.footOffset.constance,cloud:{speed:CONFIG.worldContract.cloudSpeed,y:CONFIG.worldContract.cloudY,scale:CONFIG.worldContract.cloudScale,opacity:CONFIG.worldContract.cloudOpacity}};
     const txt=JSON.stringify(obj,null,2);
     try{await navigator.clipboard.writeText(txt);$("status").textContent="Copied current world profile.";}catch(e){$("status").textContent=txt;}
   };
   const defaults={na01:{seamY:408,farY:58,farScale:1,midYOffset:0,midScale:1,midParallax:.20,groundYOffset:0,groundScale:1,groundParallax:1},na02:{seamY:428,farY:74,farScale:1,midYOffset:-35,midScale:1,midParallax:.20,groundYOffset:-43,groundScale:1,groundParallax:1},na03:{seamY:407,farY:66,farScale:1,midYOffset:22,midScale:1,midParallax:.20,groundYOffset:0,groundScale:1,groundParallax:1},sa01:{seamY:408,farY:-8,farScale:1,midYOffset:-34,midScale:1,midParallax:.20,groundYOffset:-8,groundScale:1,groundParallax:1},sa02:{seamY:420,farY:0,farScale:1,midYOffset:-30,midScale:1,midParallax:.20,groundYOffset:-70,groundScale:1,groundParallax:1},sa03:{seamY:408,farY:0,farScale:1,midYOffset:-40,midScale:1,midParallax:.20,groundYOffset:-30,groundScale:1,groundParallax:1},eu01:{seamY:408,farY:0,farScale:1,midYOffset:0,midScale:1,midParallax:.20,groundYOffset:0,groundScale:1,groundParallax:1},eu02:{seamY:408,farY:0,farScale:1,midYOffset:0,midScale:1,midParallax:.20,groundYOffset:0,groundScale:1,groundParallax:1},eu03:{seamY:408,farY:0,farScale:1,midYOffset:0,midScale:1,midParallax:.20,groundYOffset:0,groundScale:1,groundParallax:1}};
   $("worldReset").onclick=()=>{Object.assign(world(),defaults[CONFIG.activeWorld]);world().characterGrounding={claude:0,constance:0};redrawWorld();};


   const objectRedraw=()=>{this.draw();this.renderUI();};
   const hitbox=()=>CONFIG.objectQA.characterCollision[this.character.character][this.character.state];
   $("charBoxNarrow").onclick=()=>{let q=hitbox();q.w=Math.max(.20,+(q.w-.02).toFixed(2));objectRedraw();};
   $("charBoxWide").onclick=()=>{let q=hitbox();q.w=Math.min(1.10,+(q.w+.02).toFixed(2));objectRedraw();};
   $("charBoxShort").onclick=()=>{let q=hitbox();q.h=Math.max(.20,+(q.h-.02).toFixed(2));objectRedraw();};
   $("charBoxTall").onclick=()=>{let q=hitbox();q.h=Math.min(1.10,+(q.h+.02).toFixed(2));objectRedraw();};
   $("charBoxLeft").onclick=()=>{let q=hitbox();q.x=+(q.x-.02).toFixed(2);objectRedraw();};
   $("charBoxRight").onclick=()=>{let q=hitbox();q.x=+(q.x+.02).toFixed(2);objectRedraw();};
   $("charBoxUp").onclick=()=>{let q=hitbox();q.y=Math.min(1,+(q.y+.02).toFixed(2));objectRedraw();};
   $("charBoxDown").onclick=()=>{let q=hitbox();q.y=Math.max(-1,+(q.y-.02).toFixed(2));objectRedraw();};
   $("copyCharHitbox").onclick=async()=>{const who=this.character.character,state=this.character.state,q=hitbox();const txt=JSON.stringify({character:who,state,hitbox:q},null,2);try{await navigator.clipboard.writeText(txt);$("status").textContent="Copied state-aware character hitbox profile."}catch(e){$("status").textContent=txt}};
   $("objectPrev").onclick=()=>{this.objectQA.setIndex(-1);CONFIG.objectQA.scrollWithWorld=this.objectQA.active()?.kind==="flying";this.objectQA.resetPass();objectRedraw();};
   $("objectNext").onclick=()=>{this.objectQA.setIndex(1);CONFIG.objectQA.scrollWithWorld=this.objectQA.active()?.kind==="flying";this.objectQA.resetPass();objectRedraw();};
   $("hazardSelect").onchange=()=>{
     CONFIG.objectQA.activeIndex[CONFIG.activeWorld]=+$("hazardSelect").value;
     const d=this.objectQA.active();
     CONFIG.objectQA.scrollWithWorld=!!(d&&d.kind==="flying");
     this.objectQA.resetPass();
     $("status").textContent=d&&d.kind==="flying"?`${d.name} selected — flight pass started automatically.`:`${d?.name||"Hazard"} selected — use Play Pass when ready.`;
     objectRedraw();
   };
   $("flightModeSelect").onchange=()=>{CONFIG.objectQA.flying.mode=$("flightModeSelect").value;objectRedraw();};
   $("flightUp").onclick=()=>{const f=CONFIG.objectQA.flying;if(f.mode==="high")f.highClearance+=4;else f.lowClearance+=4;objectRedraw();};
   $("flightDown").onclick=()=>{const f=CONFIG.objectQA.flying;if(f.mode==="high")f.highClearance=Math.max(0,f.highClearance-4);else f.lowClearance=Math.max(0,f.lowClearance-4);objectRedraw();};
   $("flightSlower").onclick=()=>{CONFIG.objectQA.flying.speed=Math.max(40,CONFIG.objectQA.flying.speed-10);this.renderUI();};
   $("flightFaster").onclick=()=>{CONFIG.objectQA.flying.speed=Math.min(320,CONFIG.objectQA.flying.speed+10);this.renderUI();};
   $("flightFPSDown").onclick=()=>{CONFIG.objectQA.flying.fps=Math.max(2,CONFIG.objectQA.flying.fps-1);this.renderUI();};
   $("flightFPSUp").onclick=()=>{CONFIG.objectQA.flying.fps=Math.min(18,CONFIG.objectQA.flying.fps+1);this.renderUI();};
   $("objectLeft").onclick=()=>{CONFIG.objectQA.x-=10;objectRedraw();};
   $("objectRight").onclick=()=>{CONFIG.objectQA.x+=10;objectRedraw();};
   $("objectUp").onclick=()=>{const d=this.objectQA.active();if(d&&d.kind==="ground"){d.groundOffset=(Number.isFinite(d.groundOffset)?d.groundOffset:CONFIG.objectQA.groundOffset)-2;objectRedraw();}};
   $("objectDown").onclick=()=>{const d=this.objectQA.active();if(d&&d.kind==="ground"){d.groundOffset=(Number.isFinite(d.groundOffset)?d.groundOffset:CONFIG.objectQA.groundOffset)+2;objectRedraw();}};
   $("objectSmaller").onclick=()=>{const d=this.objectQA.active();if(d)d.scale=Math.max(.15,+(d.scale-.02).toFixed(2));objectRedraw();};
   $("objectLarger").onclick=()=>{const d=this.objectQA.active();if(d)d.scale=Math.min(1.50,+(d.scale+.02).toFixed(2));objectRedraw();};
   const adjustHazardCrop=(side,delta)=>{const d=this.objectQA.active();if(!d)return;const maxW=(d.kind==="flying"||(d.frames&&d.frameW))?d.frameW:d.rect.w,maxH=(d.kind==="flying"||(d.frames&&d.frameH))?d.frameH:d.rect.h;d.crop=d.crop||{l:0,r:0,t:0,b:0};const limit=(side==="l"||side==="r")?maxW-2:maxH-2;d.crop[side]=Math.max(0,Math.min(limit,(d.crop[side]||0)+delta));this.draw();this.renderUI();};
   $("hazardCropLeftLess").onclick=()=>adjustHazardCrop("l",-1);$("hazardCropLeftMore").onclick=()=>adjustHazardCrop("l",1);
   $("hazardCropRightLess").onclick=()=>adjustHazardCrop("r",-1);$("hazardCropRightMore").onclick=()=>adjustHazardCrop("r",1);
   $("hazardCropTopLess").onclick=()=>adjustHazardCrop("t",-1);$("hazardCropTopMore").onclick=()=>adjustHazardCrop("t",1);
   $("hazardCropBottomLess").onclick=()=>adjustHazardCrop("b",-1);$("hazardCropBottomMore").onclick=()=>adjustHazardCrop("b",1);
   $("collisionNarrower").onclick=()=>{const d=this.objectQA.active();if(d)d.cw=Math.max(.10,+(d.cw-.04).toFixed(2));objectRedraw();};
   $("collisionWider").onclick=()=>{const d=this.objectQA.active();if(d)d.cw=Math.min(1.20,+(d.cw+.04).toFixed(2));objectRedraw();};
   $("collisionShorter").onclick=()=>{const d=this.objectQA.active();if(d)d.ch=Math.max(.10,+(d.ch-.04).toFixed(2));objectRedraw();};
   $("collisionTaller").onclick=()=>{const d=this.objectQA.active();if(d)d.ch=Math.min(1.20,+(d.ch+.04).toFixed(2));objectRedraw();};
   $("collisionLeft").onclick=()=>{const d=this.objectQA.active();if(d)d.cx=+(d.cx-.02).toFixed(2);objectRedraw();};
   $("collisionRight").onclick=()=>{const d=this.objectQA.active();if(d)d.cx=+(d.cx+.02).toFixed(2);objectRedraw();};
   $("collisionUp").onclick=()=>{const d=this.objectQA.active();if(d)d.cy=+(d.cy-.02).toFixed(2);objectRedraw();};
   $("collisionDown").onclick=()=>{const d=this.objectQA.active();if(d)d.cy=+(d.cy+.02).toFixed(2);objectRedraw();};
   $("objectBoundsToggle").onclick=()=>{CONFIG.objectQA.showBounds=!CONFIG.objectQA.showBounds;objectRedraw();};
   $("hazardPlayBtn").onclick=()=>{CONFIG.objectQA.scrollWithWorld=true;this.paused=false;$("pauseBtn").textContent="Pause";$("status").textContent="Hazard pass playing.";objectRedraw();};
   $("hazardPauseBtn").onclick=()=>{CONFIG.objectQA.scrollWithWorld=false;$("status").textContent="Hazard pass paused.";objectRedraw();};
   $("objectScrollToggle").onclick=()=>{CONFIG.objectQA.scrollWithWorld=!CONFIG.objectQA.scrollWithWorld;this.objectQA.resetPass();objectRedraw();};
   $("objectResetPass").onclick=()=>{this.objectQA.resetPass();objectRedraw();};
   $("copyObjectQA").onclick=async()=>{
     const d=this.objectQA.active();
     const payload={
       schema:"CC_SELECTED_HAZARD_CONFIG_01",
       world:CONFIG.activeWorld,
       hazardIndex:CONFIG.objectQA.activeIndex[CONFIG.activeWorld]||0,
       hazard:d?JSON.parse(JSON.stringify(d)):null,
       flying:d?.kind==="flying"?{
         mode:CONFIG.objectQA.flying.mode,
         highClearance:CONFIG.objectQA.flying.highClearance,
         lowClearance:CONFIG.objectQA.flying.lowClearance,
         speed:CONFIG.objectQA.flying.speed,
         fps:CONFIG.objectQA.flying.fps
       }:null,
       qaPreview:{
         screenX:CONFIG.objectQA.x,
         loopDistance:CONFIG.objectQA.loopDistance
       },
       selectedGroundOffset:d?.kind==="ground"?(Number.isFinite(d.groundOffset)?d.groundOffset:CONFIG.objectQA.groundOffset):null,
       characterCollision:JSON.parse(JSON.stringify(CONFIG.objectQA.characterCollision))
     };
     const txt=JSON.stringify(payload,null,2);
     try{await navigator.clipboard.writeText(txt);$("status").textContent="Selected hazard config copied with scale, per-hazard grounding (when applicable), hitbox and shared flying settings.";}
     catch(e){$("status").textContent=txt;}
   };

   $("pauseBtn").onclick=()=>{
     if(this.paused && this.character.state==="jump"){
       // Resume a paused jump from its actual physics position rather than resetting
       // it back to Run or silently restarting from the ground.
       this.paused=false;
       $("pauseBtn").textContent="Pause";
       $("status").textContent="Jump resumed from the paused position.";
     }else{
       this.paused=!this.paused;
       $("pauseBtn").textContent=this.paused?"Resume":"Pause";
       $("status").textContent=this.paused
         ? "Preview paused. Use Next Frame to inspect the current state."
         : "Preview running.";
     }
     this.renderUI();
   };

   $("slowBtn").onclick=()=>{
     this.slow=!this.slow;
     $("slowBtn").textContent=this.slow?"Normal Speed":"Slow Motion";
     this.renderUI();
   };

   $("stepBtn").onclick=()=>{
     this.paused=true;$("pauseBtn").textContent="Resume";
     if(this.character.state==="jump"){
       // Jump frame stepping stays paused and uses meaningful airborne inspection
       // positions. Resume continues from the selected point in the physics arc.
       setJumpInspectionPose(this.character.frame+1);
     }else{
       this.character.step();
     }
     this.draw();this.renderUI();
     $("status").textContent=`${CHAR[this.character.character].label} ${this.character.state.toUpperCase()} frame ${this.character.frame+1}/${CONFIG.state[this.character.state].frames}`;
   };

   $("spawnStart").onclick=()=>{this.gameplay.start();this.paused=false;document.activeElement?.blur?.();$("pauseBtn").textContent="Pause";$("status").textContent="90-second pattern run started. Desktop QA: ↑ Jump / ↓ Slide.";};
   $("spawnPause").onclick=()=>{this.gameplay.togglePause();$("status").textContent=CONFIG.spawnDirector.lastEvent;};
   $("spawnReset").onclick=()=>{this.gameplay.reset();$("status").textContent="Pattern run reset.";this.draw();this.renderUI();};
   $("unlimitedLivesToggle").onclick=()=>{const sp=CONFIG.spawnDirector;sp.unlimitedLives=!sp.unlimitedLives;if(sp.unlimitedLives){sp.lives=sp.startingLives;sp.failed=false;}$("status").textContent=sp.unlimitedLives?"QA Unlimited Lives ON — hits still register, but lives will not decrease and the run cannot fail from damage.":"QA Unlimited Lives OFF — normal life loss and fail state restored.";this.draw();this.renderUI();};
   const setDuration=(v)=>{const sp=CONFIG.spawnDirector;sp.stageDuration=Math.max(45,Math.min(120,v));const k=sp.stageDuration/90;sp.signatureStart=Math.round(75*k*10)/10;sp.phases={warmup:[0,10*k],establish:[10*k,30*k],develop:[30*k,55*k],pressure:[55*k,75*k],signature:[75*k,sp.stageDuration-sp.finishRelease],finish:[sp.stageDuration-sp.finishRelease,sp.stageDuration]};this.gameplay.reset()};
   $("durationDown").onclick=()=>setDuration(CONFIG.spawnDirector.stageDuration-5);
   $("durationUp").onclick=()=>setDuration(CONFIG.spawnDirector.stageDuration+5);
   $("livesDown").onclick=()=>{CONFIG.spawnDirector.startingLives=Math.max(1,CONFIG.spawnDirector.startingLives-1);this.gameplay.reset()};
   $("livesUp").onclick=()=>{CONFIG.spawnDirector.startingLives=Math.min(5,CONFIG.spawnDirector.startingLives+1);this.gameplay.reset()};
   $("releaseDown").onclick=()=>{const sp=CONFIG.spawnDirector;sp.finishRelease=Math.max(3,sp.finishRelease-1);sp.phases.signature[1]=sp.stageDuration-sp.finishRelease;sp.phases.finish=[sp.stageDuration-sp.finishRelease,sp.stageDuration];this.gameplay.reset()};
   $("releaseUp").onclick=()=>{const sp=CONFIG.spawnDirector;sp.finishRelease=Math.min(10,sp.finishRelease+1);sp.phases.signature[1]=sp.stageDuration-sp.finishRelease;sp.phases.finish=[sp.stageDuration-sp.finishRelease,sp.stageDuration];this.gameplay.reset()};
   const speedStep=(k,d)=>{CONFIG.spawnDirector.speedClasses[k]=Math.max(80,Math.min(280,CONFIG.spawnDirector.speedClasses[k]+d));this.gameplay.reset()};
   const altitudeMixStep=(delta)=>{const m=CONFIG.spawnDirector.altitudeMix||(CONFIG.spawnDirector.altitudeMix={high:55,low:45});m.high=Math.max(0,Math.min(100,m.high+delta));m.low=100-m.high;this.gameplay.reset();updateControlReadouts();};
   $("highMixDown").onclick=()=>altitudeMixStep(-5);
   $("highMixUp").onclick=()=>altitudeMixStep(5);
   $("altitudeMixReset").onclick=()=>{CONFIG.spawnDirector.altitudeMix={high:55,low:45};this.gameplay.reset();updateControlReadouts();};
   $("slowDown").onclick=()=>speedStep("slow",-5);$("slowUp").onclick=()=>speedStep("slow",5);$("normalDown").onclick=()=>speedStep("normal",-5);$("normalUp").onclick=()=>speedStep("normal",5);$("fastDown").onclick=()=>speedStep("fast",-5);$("fastUp").onclick=()=>speedStep("fast",5);
   $("seedDown").onclick=()=>{CONFIG.spawnDirector.seed=Math.max(1,CONFIG.spawnDirector.seed-1);this.gameplay.reset()};$("seedUp").onclick=()=>{CONFIG.spawnDirector.seed++;this.gameplay.reset()};$("rebuildPattern").onclick=()=>{this.gameplay.reset();$("status").textContent=`Pattern rebuilt from seed ${CONFIG.spawnDirector.seed}.`;};
   $("slideDurationDown").onclick=()=>{CONFIG.actions.slideDuration=Math.max(.30,Math.round((CONFIG.actions.slideDuration-.05)*100)/100);this.renderUI()};
   $("slideDurationUp").onclick=()=>{CONFIG.actions.slideDuration=Math.min(1.20,Math.round((CONFIG.actions.slideDuration+.05)*100)/100);this.renderUI()};

   const cropTarget=()=>({who:this.character.character,state:this.character.state,frame:this.character.frame});
   const cropObj=()=>{const t=cropTarget();return CONFIG.cropInsets[t.who][t.state][t.frame];};
   const adjustCrop=(side,delta)=>{const c=cropObj(),cell=CONFIG.cell; c[side]=Math.max(0,Math.min(cell-20,(c[side]||0)+delta)); const pair=(side==="l"?"r":side==="r"?"l":side==="t"?"b":"t"); if(c[side]+c[pair]>cell-20)c[side]=Math.max(0,cell-20-c[pair]); this.draw();this.renderUI();};
   $("cropLeftMore").onclick=()=>adjustCrop("l",5); $("cropLeftLess").onclick=()=>adjustCrop("l",-5);
   $("cropRightMore").onclick=()=>adjustCrop("r",5); $("cropRightLess").onclick=()=>adjustCrop("r",-5);
   $("cropTopMore").onclick=()=>adjustCrop("t",5); $("cropTopLess").onclick=()=>adjustCrop("t",-5);
   $("cropBottomMore").onclick=()=>adjustCrop("b",5); $("cropBottomLess").onclick=()=>adjustCrop("b",-5);
   $("cropReset").onclick=()=>{const c=cropObj();c.l=c.r=c.t=c.b=0;this.draw();this.renderUI();};
   $("cropBoundsToggle").onclick=()=>{CONFIG.characterQA.showCropBounds=!CONFIG.characterQA.showCropBounds;this.draw();this.renderUI();};
   $("charCollisionBoundsToggle").onclick=()=>{CONFIG.characterQA.showCollisionBounds=!CONFIG.characterQA.showCollisionBounds;this.draw();this.renderUI();};
   $("copyCropProfile").onclick=async()=>{const t=cropTarget(),c=cropObj(),v={character:t.who,state:t.state,frame:t.frame+1,crop:{left:c.l,right:c.r,top:c.t,bottom:c.b}};await navigator.clipboard.writeText(JSON.stringify(v,null,2));$("status").textContent="Crop profile copied.";};
   $("recoveryDown").onclick=()=>{CONFIG.hitRecovery.recoveryDuration=Math.max(.4,CONFIG.hitRecovery.recoveryDuration-.1)};
   $("recoveryUp").onclick=()=>{CONFIG.hitRecovery.recoveryDuration=Math.min(3,CONFIG.hitRecovery.recoveryDuration+.1)};
   $("invulnDown").onclick=()=>{CONFIG.hitRecovery.invulnerabilityDuration=Math.max(.5,CONFIG.hitRecovery.invulnerabilityDuration-.1)};
   $("invulnUp").onclick=()=>{CONFIG.hitRecovery.invulnerabilityDuration=Math.min(4,CONFIG.hitRecovery.invulnerabilityDuration+.1)};
   const finishCfg=()=>CONFIG.finish.stages[CONFIG.activeWorld];
   $("finishScaleDown").onclick=()=>{finishCfg().scale=Math.max(.08,finishCfg().scale-.01)};
   $("finishScaleUp").onclick=()=>{finishCfg().scale=Math.min(.60,finishCfg().scale+.01)};
   $("finishUp").onclick=()=>{finishCfg().groundOffset-=2};
   $("finishDown").onclick=()=>{finishCfg().groundOffset+=2};
   $("finishLeft").onclick=()=>{finishCfg().xOffset-=4};
   $("finishRight").onclick=()=>{finishCfg().xOffset+=4};
   $("finishBoundsToggle").onclick=()=>{CONFIG.finish.showBounds=!CONFIG.finish.showBounds};
 }
 update(dt){
   const hasGameplay=CONFIG.spawnDirector.enabled||this.gameplay.finished||CONFIG.spawnDirector.failed||CONFIG.spawnDirector.elapsed>0;
   const moveGameplay=CONFIG.spawnDirector.enabled&&!CONFIG.spawnDirector.paused;
   this.scene.update(dt,hasGameplay?moveGameplay:this.character.worldScrolls());
   this.character.update(dt);
   if(hasGameplay)this.gameplay.update(dt);else this.objectQA.update(dt);
 }
 draw(){this.scene.draw();if(CONFIG.spawnDirector.enabled||this.gameplay.finished||CONFIG.spawnDirector.failed||CONFIG.spawnDirector.elapsed>0)this.gameplay.draw();else this.objectQA.draw();const blinkInvulnerable=CONFIG.spawnDirector.enabled&&!CONFIG.spawnDirector.paused&&!CONFIG.spawnDirector.failed&&!this.gameplay.finished&&this.gameplay.invulnT>0&&(this.character.state!=="hit"||this.character.frame>=1);const showCharacter=!blinkInvulnerable||(Math.floor(performance.now()/65)%2===0);if(showCharacter)this.character.draw(this.ctx)}
 renderUI(){
   const $=id=>document.getElementById(id);
   const cfg=CONFIG.state[this.character.state];
   $("characterLabel").textContent=CHAR[this.character.character].label;
   $("stateLabel").textContent=this.character.state.toUpperCase();
   $("frameLabel").textContent=(this.character.frame+1)+" / "+cfg.frames;
   const who=this.character.character;
   const state=this.character.state;
   const master=CONFIG.masterScale[who];
   const mult=CONFIG.stateScale[who][state];
   const effective=master*mult;
   $("masterScaleLabel").textContent=master.toFixed(3);
   $("stateScaleLabel").textContent=mult.toFixed(3);
   $("effectiveScaleLabel").textContent=effective.toFixed(4);
   $("starYOffsetLabel").textContent=CONFIG.starYOffset[who].toFixed(0);
   $("tuneTarget").textContent=CHAR[who].label+" / "+state.toUpperCase();
   $("tuneScale").textContent=mult.toFixed(3);
   $("tuneStarY").textContent=CONFIG.starYOffset[who].toFixed(0)+" px";
   $("tuneStarScale").textContent=CONFIG.starScale[who].toFixed(2);
   $("jumpPowerValue").textContent=Math.abs(CONFIG.jump.launch).toFixed(0);
   $("jumpGravityValue").textContent=CONFIG.jump.gravity.toFixed(0);
   const wp=CONFIG.worldProfiles[CONFIG.activeWorld];
   const p=wp;
   $("worldLabel").textContent=wp.label;
   const baseScale=CONFIG.canvas.w/worldSourceW();
   const gScale=baseScale*wp.groundScale;
   const gY=wp.seamY-CONFIG.worldContract.groundSurfaceSourceY*gScale+wp.groundYOffset;
   const renderedSurfaceY=gY+CONFIG.worldContract.groundSurfaceSourceY*gScale;
   $("worldSeamY").textContent=wp.seamY.toFixed(0);
   $("worldRenderedSurface").textContent=renderedSurfaceY.toFixed(0);
   $("farYValue").textContent=wp.farY.toFixed(0);
   $("farScaleValue").textContent=wp.farScale.toFixed(2);
   $("midYValue").textContent=wp.midYOffset.toFixed(0);
   $("groundYValue").textContent=wp.groundYOffset.toFixed(0);
   $("worldMidScale").textContent=wp.midScale.toFixed(2);
   $("worldGroundScale").textContent=wp.groundScale.toFixed(2);
   $("worldMidParallax").textContent=wp.midParallax.toFixed(2);
   $("worldGroundParallax").textContent=wp.groundParallax.toFixed(2);
   $("claudeFootValue").textContent=CONFIG.worldContract.footOffset.claude.toFixed(0);
   $("constanceFootValue").textContent=CONFIG.worldContract.footOffset.constance.toFixed(0);
   $("cloudSpeedValue").textContent=CONFIG.worldContract.cloudSpeed.toFixed(0);
   $("cloudYValue").textContent=CONFIG.worldContract.cloudY.toFixed(0);
   $("cloudScaleValue").textContent=CONFIG.worldContract.cloudScale.toFixed(2);
   $("cloudOpacityValue").textContent=CONFIG.worldContract.cloudOpacity.toFixed(2);
   $("claudeGlobalFootValue").textContent=CONFIG.worldContract.footOffset.claude;$("constanceGlobalFootValue").textContent=CONFIG.worldContract.footOffset.constance;
   const stageGround=CONFIG.worldProfiles[CONFIG.activeWorld].characterGrounding||(CONFIG.worldProfiles[CONFIG.activeWorld].characterGrounding={claude:0,constance:0});$("claudeStageFootValue").textContent=stageGround.claude||0;$("constanceStageFootValue").textContent=stageGround.constance||0;
   $("continentSelect").value=CONFIG.activeWorld.startsWith("eu")?"europe":(CONFIG.activeWorld.startsWith("sa")?"south-america":"north-america");
   const hazardCrop=(this.objectQA.active()?.crop)||{l:0,r:0,t:0,b:0};$("hazardCropValue").textContent=`${hazardCrop.l||0} / ${hazardCrop.r||0} / ${hazardCrop.t||0} / ${hazardCrop.b||0}`;
   $("guidesToggle").textContent=CONFIG.worldContract.showGuides?"Hide Calibration Guides":"Show Calibration Guides";
   const hq=CONFIG.objectQA.characterCollision[who][state];
   $("charHitboxProfile").textContent=CHAR[who].label+" / "+state.toUpperCase();
   $("charHitboxW").textContent=(hq.w*100).toFixed(0)+"% sprite width";
   $("charHitboxH").textContent=(hq.h*100).toFixed(0)+"% sprite height";
   $("charHitboxX").textContent=(hq.x*100).toFixed(0)+"%";
   $("charHitboxY").textContent=(hq.y*100).toFixed(0)+"%";
   const od=this.objectQA.active();
   $("objectLabel").textContent=od?od.name:"—";
   $("hazardTypeValue").textContent=od?(od.kind==="flying"?"FLYING — "+CONFIG.objectQA.flying.mode.toUpperCase():"GROUND — JUMP"):"—";
   $("stageSelect").value=CONFIG.activeWorld;$("navStageLabel").textContent=p.label;
   const hs=$("hazardSelect"),defs=CONFIG.objectQA.defs[CONFIG.activeWorld]||[];if(hs.options.length!==defs.length||[...hs.options].some((o,i)=>o.textContent!==defs[i].name)){hs.innerHTML=defs.map((x,i)=>`<option value="${i}">${x.name}</option>`).join("");}hs.value=CONFIG.objectQA.activeIndex[CONFIG.activeWorld]||0;
   const isFlying=!!(od&&od.kind==="flying");
   $("flyingControls").style.display=isFlying?"block":"none";
   $("flyingQuickControls").style.display=isFlying?"block":"none";
   $("flightModeSelect").value=CONFIG.objectQA.flying.mode;const ff=CONFIG.objectQA.flying;$("flightAltitudeValue").textContent=(ff.mode==="high"?ff.highClearance:ff.lowClearance)+" px clearance";$("flightSpeedValue").textContent=ff.speed;$("flightFPSValue").textContent=ff.fps+" FPS";
   $("objectScaleValue").textContent=od?od.scale.toFixed(2):"—";
   $("objectXValue").textContent=CONFIG.objectQA.x.toFixed(0);
   $("objectGroundOffsetValue").textContent=od&&od.kind==="ground"?((Number.isFinite(od.groundOffset)?od.groundOffset:CONFIG.objectQA.groundOffset).toFixed(0)+" px"):("SHARED FLYING");
   $("objectUp").disabled=!(od&&od.kind==="ground");$("objectDown").disabled=!(od&&od.kind==="ground");
   $("groundOffsetScopeNote").textContent=od&&od.kind==="ground"?`${od.name}: this ground offset is saved only on this hazard.`:"Flying hazards use the shared HIGH/LOW clearance system; no per-bird ground offset is used.";
   $("collisionWidthValue").textContent=od?(od.cw*100).toFixed(0)+"%":"—";
   $("collisionHeightValue").textContent=od?(od.ch*100).toFixed(0)+"%":"—";
   $("collisionXValue").textContent=od?(od.cx*100).toFixed(0)+"%":"—";
   $("collisionYValue").textContent=od?(od.cy*100).toFixed(0)+"%":"—";
   $("objectCollisionState").textContent=this.objectQA.lastCollision?"COLLISION":"CLEAR";
   $("objectCollisionState").style.color=this.objectQA.lastCollision?"#ff6666":"#62e889";
   $("objectBoundsToggle").textContent=CONFIG.objectQA.showBounds?"Bounds: ON":"Bounds: OFF";
   const sp=CONFIG.spawnDirector,fc=CONFIG.finish.stages[CONFIG.activeWorld];
   const rem=Math.max(0,sp.stageDuration-sp.elapsed),rt=Math.ceil(rem),rm=Math.floor(rt/60),rsec=rt%60;
   $("spawnTime").textContent=`${rm}:${String(rsec).padStart(2,"0")}`;$("spawnLives").textContent=sp.unlimitedLives?`${sp.startingLives} / ${sp.startingLives} ∞ QA`:`${sp.lives} / ${sp.startingLives}`;$("spawnPhase").textContent=this.gameplay.phaseAt(sp.elapsed);$("spawnActive").textContent=sp.active.length;$("spawnCleared").textContent=sp.cleared;$("spawnHits").textContent=sp.hits;$("spawnEvent").textContent=sp.lastEvent;
   $("stageDurationValue").textContent=sp.stageDuration+" s";$("startingLivesValue").textContent=sp.startingLives;$("finishReleaseValue").textContent=sp.finishRelease+" s";$("maxVisibleValue").textContent=sp.maxVisible;$("flySlowValue").textContent=sp.speedClasses.slow;$("flyNormalValue").textContent=sp.speedClasses.normal;$("flyFastValue").textContent=sp.speedClasses.fast;const am=sp.altitudeMix||{high:55,low:45};$("flyHighMixValue").textContent=am.high+"%";$("flyLowMixValue").textContent=am.low+"%";$("patternSeedValue").textContent=sp.seed;$("plannedHazardsValue").textContent=sp.planned.length;$("signatureStartValue").textContent=sp.signatureStart+" s";
   const counts={};sp.planned.forEach(e=>counts[e.pattern]=(counts[e.pattern]||0)+1);$("patternSummary").textContent=Object.entries(counts).map(([k,v])=>`${k}: ${v}`).join(" • ");
   $("spawnPause").textContent=sp.paused?"Resume Run":"Pause Run";const ult=$("unlimitedLivesToggle");if(ult){ult.textContent=sp.unlimitedLives?"QA Unlimited Lives: ON":"QA Unlimited Lives: OFF";ult.classList.toggle("active",!!sp.unlimitedLives);}
   $("slideDurationValue").textContent=CONFIG.actions.slideDuration.toFixed(2)+" s";
   const ftWho=this.character.character,ftState=this.character.state,ftFrame=this.character.frame;
   const crop=(CONFIG.cropInsets?.[ftWho]?.[ftState]?.[ftFrame])||{l:0,r:0,t:0,b:0};
   $("cropProfile").textContent=`${CHAR[ftWho].label} / ${ftState.toUpperCase()} / FRAME ${ftFrame+1}`;
   $("cropLeftValue").textContent=(crop.l||0)+" px";
   $("cropRightValue").textContent=(crop.r||0)+" px";
   $("cropTopValue").textContent=(crop.t||0)+" px";
   $("cropBottomValue").textContent=(crop.b||0)+" px";
   $("cropBoundsToggle").textContent=CONFIG.characterQA.showCropBounds?"Crop Bounds: ON":"Crop Bounds: OFF";
   $("charCollisionBoundsToggle").textContent=CONFIG.characterQA.showCollisionBounds?"Collision Bounds: ON":"Collision Bounds: OFF";
   $("recoveryDuration").textContent=CONFIG.hitRecovery.recoveryDuration.toFixed(2)+" s";$("invulnDuration").textContent=CONFIG.hitRecovery.invulnerabilityDuration.toFixed(2)+" s";
   $("finishScale").textContent=fc.scale.toFixed(2);$("finishGround").textContent=fc.groundOffset.toFixed(0)+" px";$("finishXOffset").textContent=fc.xOffset.toFixed(0)+" px";
   $("finishBoundsToggle").textContent=CONFIG.finish.showBounds?"Trigger Bounds: ON":"Trigger Bounds: OFF";
   $("objectScrollToggle").textContent="Pass Motion: "+(CONFIG.objectQA.scrollWithWorld?"ON":"OFF");
   $("hazardPlayBtn").classList.toggle("active",CONFIG.objectQA.scrollWithWorld);
   $("hazardPauseBtn").classList.toggle("active",!CONFIG.objectQA.scrollWithWorld);
   $("scrollLabel").textContent=this.character.worldScrolls()?"ON":"STOPPED";
   document.querySelectorAll("[data-state]").forEach(btn=>btn.classList.toggle("active",btn.dataset.state===this.character.state));
   $("quickRunBtn").classList.toggle("active",this.character.state==="run");
   $("quickJumpBtn").classList.toggle("active",this.character.state==="jump");
   $("quickSlideBtn").classList.toggle("active",this.character.state==="slide");
 }
 tick(){
   const now=performance.now();
   const raw=Math.min((now-this.last)/1000,.05);
   this.last=now;
   if(!this.paused)this.update(raw*(this.slow?.35:1));
   this.draw();this.renderUI();
 }
 start(){
   this.paused=true;this.last=performance.now();this.draw();this.renderUI();
   document.getElementById("pauseBtn").textContent="Resume";
   if(this.timer)clearInterval(this.timer);
   this.timer=setInterval(()=>this.tick(),1000/60);
 }
}

const store=new AssetStore({
 eu01Far:"../assets/worlds/europe/EU01_BG_DISTANT_GREECE.png",
 eu01Mid:"../assets/worlds/europe/EU01_BG_MID_GREECE.png",
 eu01Ground:"../assets/worlds/europe/EU01_GROUND_GREECE.png",
 eu01Hazards:"../assets/worlds/europe/EU01_OBJECT_ATLAS_CRATE.png",
 eu01Barrel:"../assets/worlds/europe/EU01_HAZARD_ROLLING_BARREL.png",
 eu01Bird:"../assets/worlds/europe/EU01_HAZARD_AEGEAN_GULLS.png",
 eu02Far:"../assets/worlds/europe/EU02_BG_DISTANT_PARIS.png",
 eu02Mid:"../assets/worlds/europe/EU02_BG_MID_PARIS.png",
 eu02Ground:"../assets/worlds/europe/EU02_GROUND_PARIS.png",
 eu02Hazards:"../assets/worlds/europe/EU02_OBJECT_ATLAS.png",
 eu02Bird:"../assets/worlds/europe/EU02_HAZARD_SWALLOWS.png",
 eu03Far:"../assets/worlds/europe/EU03_BG_DISTANT_BARCELONA.png",
 eu03Mid:"../assets/worlds/europe/EU03_BG_MID_BARCELONA.png",
 eu03Ground:"../assets/worlds/europe/EU03_GROUND_BARCELONA.png",
 eu03Hazards:"../assets/worlds/europe/EU03_OBJECT_ATLAS.png",
 eu03Bird:"../assets/worlds/europe/EU03_HAZARD_BATS.png",
 sa01Far:"../assets/worlds/south-america/SA01_BG_DISTANT_AMAZON.png",
 sa01Mid:"../assets/worlds/south-america/SA01_BG_MID_AMAZON.png",
 sa01Ground:"../assets/worlds/south-america/SA01_GROUND_AMAZON.png",
 sa01Hazards:"../assets/worlds/south-america/SA01_OBJECT_ATLAS.png",
 sa01Bird:"../assets/worlds/south-america/SA01_HAZARD_MACAWS.png",
 sa02Far:"../assets/worlds/south-america/SA02_BG_DISTANT_ANDES.png",
 sa02Mid:"../assets/worlds/south-america/SA02_BG_MID_ANDES.png",
 sa02Ground:"../assets/worlds/south-america/SA02_GROUND_ANDES.png",
 sa02Hazards:"../assets/worlds/south-america/SA02_OBJECT_ATLAS.png",
 sa02Bird:"../assets/worlds/south-america/SA02_HAZARD_ANDEAN_FLAMINGO.png",
 sa03Far:"../assets/worlds/south-america/SA03_BG_DISTANT_RIO.png",
 sa03Mid:"../assets/worlds/south-america/SA03_BG_MID_RIO.png",
 sa03Ground:"../assets/worlds/south-america/SA03_GROUND_RIO.png",
 sa03Hazards:"../assets/worlds/south-america/SA03_OBJECT_ATLAS.png",
 sa03Bird:"../assets/worlds/south-america/SA03_HAZARD_TROPICAL_PARAKEETS.png",

 finishMarker:"../assets/shared/NA_STAGE_FINISH_MARKER.png",
 na01Hazards:"../assets/worlds/north-america/NA01_HAZARD_ATLAS.png",
 na01Bird:"../assets/worlds/north-america/NA01_HAZARD_VULTURE.png",
 na02Hazards:"../assets/worlds/north-america/NA02_HAZARD_ATLAS.png",
 na02Bird:"../assets/worlds/north-america/NA02_HAZARD_EAGLE.png",
 na03Hazards:"../assets/worlds/north-america/NA03_HAZARD_ATLAS.png",
 na03Bird:"../assets/worlds/north-america/NA03_HAZARD_PIGEONS.png",
 run:"../assets/characters/G1A_RUN_CYCLE_ATLAS.png",
 idle:"../assets/characters/G1B_IDLE_ATLAS.png",
 jump:"../assets/characters/G1C_JUMP_ATLAS.png",
 slide:"../assets/characters/G1D_SLIDE_ATLAS.png",
 hit:"../assets/characters/G1E_HIT_ATLAS.png",
 celebrate:"../assets/characters/G1F_CELEBRATE_ATLAS.png",
 stars:"../assets/characters/FX_STUN_STARS_ATLAS.png",
 mid:PHASE8_PILOT?"../assets/phase8-validation/north-america/NA01_BG_MID_DESERT.png":"../assets/worlds/north-america/NA01_BG_MID_DESERT.png",
 ground:PHASE8_PILOT?"../assets/phase8-validation/north-america/NA01_GROUND_DESERT.png":"../assets/worlds/north-america/NA01_GROUND_DESERT.png",
 na02Far:PHASE8_PILOT?"../assets/phase8-validation/north-america/NA02_BG_DISTANT_MOUNTAINS.png?v=259b8f38":"../assets/worlds/north-america/NA02_BG_DISTANT_MOUNTAINS.png",
 na02Mid:PHASE8_PILOT?"../assets/phase8-validation/north-america/NA02_BG_MID_PINES.png?v=cc4a6f43":"../assets/worlds/north-america/NA02_BG_MID_PINES.png",
 na02Ground:PHASE8_PILOT?"../assets/phase8-validation/north-america/NA02_GROUND_TRAIL.png?v=f6ada52c":"../assets/worlds/north-america/NA02_GROUND_TRAIL.png",
 na03Far:"../assets/worlds/north-america/NA03_BG_DISTANT_NYC.png",
 na03Mid:"../assets/worlds/north-america/NA03_BG_MID_CITY.png",
 na03Ground:"../assets/worlds/north-america/NA03_GROUND_CITY.png",
 far:PHASE8_PILOT?"../assets/phase8-validation/north-america/NA01_BG_DISTANT_MESAS.png":"../assets/worlds/north-america/NA01_BG_DISTANT_MESAS.png",
 clouds:"../assets/shared/NA_CLOUD_LAYER.png"
,
 na01Objects:"../assets/worlds/north-america/NA01_OBJECT_ATLAS.png",
 na02Objects:"../assets/worlds/north-america/NA02_OBJECT_ATLAS.png",
 na03Objects:"../assets/worlds/north-america/NA03_OBJECT_ATLAS.png"
});

store.load()
 .then(a=>new Lab(document.getElementById("game"),a).start())
 .catch(err=>{
   document.getElementById("status").textContent=err.message;
   console.error(err);
 });
})();
