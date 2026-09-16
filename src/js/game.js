import { GAMEPLAY_CONFIG } from './config/gameplay.js';
import { PlayerController } from './player.js';
import { Progression } from './progression.js';

export class Game {
  constructor({renderer,hud,controls,stage='sa01',character='claude'}={}){
    this.renderer=renderer; this.hud=hud; this.controls=controls; this.stage=stage;
    this.player=new PlayerController(character); this.progression=new Progression();
    this.paused=false; this.last=0; this.raf=0;
  }
  start(){ this.paused=false; this.player.run(); this.progression.start(); this.last=performance.now(); this.loop(this.last); }
  togglePause(){ this.paused=!this.paused; this.player.setPaused(this.paused); this.controls?.setPaused(this.paused); }
  slide(){ this.player.slide(); }
  jump(){ this.player.jump(); }
  setStage(stage){ this.stage=stage; }
  setCharacter(character){ this.player.setCharacter(character); }
  loop=(now)=>{
    const dt=Math.min(.05,(now-this.last)/1000||0); this.last=now;
    this.player.update(dt); this.progression.update(dt,this.paused);
    this.renderer.world.update(dt,{paused:this.paused}); this.renderer.render(this.stage);
    this.hud?.render({lives:this.progression.lives,elapsed:this.progression.elapsed,duration:GAMEPLAY_CONFIG.spawnDirector.stageDuration,character:this.player.character,paused:this.paused});
    this.raf=requestAnimationFrame(this.loop);
  };
}
