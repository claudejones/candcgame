import { GAMEPLAY_CONFIG } from './config/gameplay.js';

export class Progression {
  constructor(){ this.reset(); }
  reset(){ this.elapsed=0; this.running=false; this.complete=false; this.lives=GAMEPLAY_CONFIG.spawnDirector.startingLives; }
  start(){ this.reset(); this.running=true; }
  update(dt,paused=false){
    if(!this.running || paused || this.complete) return;
    this.elapsed=Math.min(GAMEPLAY_CONFIG.spawnDirector.stageDuration,this.elapsed+dt);
    if(this.elapsed>=GAMEPLAY_CONFIG.spawnDirector.stageDuration){ this.complete=true; this.running=false; }
  }
  get progress(){ return this.elapsed/GAMEPLAY_CONFIG.spawnDirector.stageDuration; }
}
