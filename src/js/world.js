import { LEGACY_WORLD_CONFIG, UNIFIED_WORLD_TARGET } from './config/worlds.js';

export class WorldRenderer {
  constructor(ctx, assets, {mode='legacy'}={}) {
    this.ctx=ctx; this.assets=assets; this.mode=mode; this.scroll=0;
    this.visibility={far:true,clouds:true,mid:true,ground:true};
  }
  setLayerVisibility(next){ Object.assign(this.visibility,next); }
  update(dt,{paused=false}={}){
    if(!paused) this.scroll += 120*dt;
  }
  render(stageKey){
    if(this.mode==='legacy') return this.renderLegacy(stageKey);
    return this.renderUnified(stageKey);
  }
  renderLegacy(stageKey){
    const p=LEGACY_WORLD_CONFIG.profiles[stageKey];
    if(!p) throw new Error(`Unknown stage ${stageKey}`);
    // Legacy geometry remains available for parity testing only.
    this.drawLayer(p.farKey,p.farY,p.farScale,0);
    if(this.visibility.clouds) this.drawClouds();
    if(this.visibility.mid) this.drawLayer(p.midKey,p.midYOffset,p.midScale,p.midParallax);
    if(this.visibility.ground) this.drawLayer(p.groundKey,p.groundYOffset,p.groundScale,p.groundParallax);
  }
  renderUnified(stageKey){
    // Target path: regenerated landscapes share one geometry; no per-stage Y/scale correction.
    const base=this.assets.worlds?.[stageKey];
    if(!base) return;
    if(this.visibility.far) this.drawImageCover(base.far,0);
    if(this.visibility.clouds) this.drawClouds();
    if(this.visibility.mid) this.drawImageCover(base.mid,0);
    if(this.visibility.ground) this.drawImageCover(base.ground,0);
  }
  drawLayer(key,y=0,scale=1,parallax=0){
    if(key==='far' && !this.visibility.far) return;
    const img=this.assets[key]; if(!img) return;
    const canvas=this.ctx.canvas, w=canvas.width*scale, h=img.height*(w/img.width);
    let x=-(this.scroll*parallax)%w;
    for(;x<canvas.width;x+=w) this.ctx.drawImage(img,x,y,w,h);
  }
  drawImageCover(img,y=0){
    if(!img) return; const c=this.ctx.canvas, w=c.width, h=img.height*(w/img.width);
    this.ctx.drawImage(img,0,y,w,h);
  }
  drawClouds(){
    const img=this.assets.clouds; if(!img) return;
    const c=LEGACY_WORLD_CONFIG.worldContract, canvas=this.ctx.canvas;
    const w=canvas.width*c.cloudScale, h=img.height*(w/img.width);
    const x=-(this.scroll*(c.cloudSpeed/120))%w;
    this.ctx.save(); this.ctx.globalAlpha=c.cloudOpacity;
    this.ctx.drawImage(img,x,c.cloudY,w,h); this.ctx.drawImage(img,x+w,c.cloudY,w,h); this.ctx.restore();
  }
}

export { UNIFIED_WORLD_TARGET };
