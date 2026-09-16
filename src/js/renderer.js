import { WorldRenderer } from './world.js';

export class Renderer {
  constructor(canvas,assets,options={}){
    this.canvas=canvas; this.ctx=canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled=false;
    this.world=new WorldRenderer(this.ctx,assets,options);
  }
  clear(){ this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height); }
  render(stageKey){ this.clear(); this.world.render(stageKey); }
}
