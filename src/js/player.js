import { GAMEPLAY_CONFIG } from './config/gameplay.js';

export class PlayerController {
  constructor(character='claude'){
    this.character=character; this.state='idle'; this.stateTime=0; this.paused=false;
    this.invulnerable=0; this.recovery=0; this.visible=true;
  }
  setCharacter(character){ this.character=character; }
  setPaused(paused){ this.paused=paused; if(paused) this.enter('idle'); }
  enter(state){ this.state=state; this.stateTime=0; }
  run(){ if(!this.paused) this.enter('run'); }
  jump(){ if(!this.paused) this.enter('jump'); }
  slide(){ if(!this.paused) this.enter('slide'); }
  hit(){
    this.enter('hit');
    this.recovery=GAMEPLAY_CONFIG.hitRecovery.recoveryDuration;
    this.invulnerable=GAMEPLAY_CONFIG.hitRecovery.invulnerabilityDuration;
  }
  update(dt){
    if(this.paused) return;
    this.stateTime+=dt;
    this.recovery=Math.max(0,this.recovery-dt);
    this.invulnerable=Math.max(0,this.invulnerable-dt);
    if(this.state==='slide' && this.stateTime>=GAMEPLAY_CONFIG.actions.slideDuration) this.enter('run');
    if(this.invulnerable>0) this.visible=(Math.floor(this.stateTime*12)%2)===0;
    else this.visible=true;
  }
}
