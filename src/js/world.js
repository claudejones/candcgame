import {LEGACY_WORLD_CONFIG,UNIFIED_WORLD_TARGET} from './config/worlds.js';
export class WorldRenderer{
 constructor(ctx,assets,{mode='legacy'}={}){this.ctx=ctx;this.assets=assets;this.mode=mode;this.worldX=0;this.cloudX=0;this.visibility={far:true,clouds:true,mid:true,ground:true};this.lastRenderedSurfaceY=0;}
 setLayerVisibility(v){Object.assign(this.visibility,v)}
 update(dt,{paused=false,worldScrolls=true}={}){if(!paused&&worldScrolls)this.worldX+=120*dt;this.cloudX+=LEGACY_WORLD_CONFIG.worldContract.cloudSpeed*dt;}
 tileFull(img,offsetX,drawY,scale,alpha=1){if(!img)return;const W=this.ctx.canvas.width,dw=img.width*scale,dh=img.height*scale;let x=-((((offsetX)%dw)+dw)%dw);this.ctx.save();this.ctx.globalAlpha=alpha;for(;x<W;x+=dw)this.ctx.drawImage(img,Math.round(x),Math.round(drawY),Math.ceil(dw),Math.ceil(dh));this.ctx.restore();}
 render(stage){this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);return this.mode==='legacy'?this.renderLegacy(stage):this.renderUnified(stage)}
 renderLegacy(stage){const p=LEGACY_WORLD_CONFIG.profiles[stage],wc=LEGACY_WORLD_CONFIG.worldContract,W=this.ctx.canvas.width,base=W/wc.sourceW;if(!p)return;
  if(this.visibility.far)this.tileFull(this.assets[p.farKey],0,p.farY,base*p.farScale,1);
  if(this.visibility.clouds&&p.clouds!==false)this.tileFull(this.assets.clouds,this.cloudX,wc.cloudY,base*wc.cloudScale,wc.cloudOpacity);
  const midScale=base*p.midScale,midY=p.seamY-wc.midBaselineSourceY*midScale+p.midYOffset;if(this.visibility.mid)this.tileFull(this.assets[p.midKey],this.worldX*p.midParallax,midY,midScale,1);
  const gScale=base*p.groundScale,gY=p.seamY-wc.groundSurfaceSourceY*gScale+p.groundYOffset;this.lastRenderedSurfaceY=gY+wc.groundSurfaceSourceY*gScale;if(this.visibility.ground)this.tileFull(this.assets[p.groundKey],this.worldX*p.groundParallax,gY,gScale,1);
 }
 renderUnified(stage){const w=this.assets.worlds?.[stage];if(!w)return;const c=this.ctx.canvas,W=c.width,H=c.height,base=W/UNIFIED_WORLD_TARGET.sourceCanvas.w,surface=UNIFIED_WORLD_TARGET.runningSurfaceY*2; if(this.visibility.far)this.tileFull(w.far,0,0,base,1);if(this.visibility.clouds)this.tileFull(this.assets.clouds,this.cloudX,0,base*.65,.75);if(this.visibility.mid)this.tileFull(w.mid,this.worldX*.2,0,base,1);const gy=surface-393*base;this.lastRenderedSurfaceY=surface;if(this.visibility.ground)this.tileFull(w.ground,this.worldX,gy,base,1);}
}
export{UNIFIED_WORLD_TARGET};
