import { QA_CONFIG } from './config/qa.js';

export class QAHarness {
  constructor(root,{renderer,game}={}){
    this.root=root; this.renderer=renderer; this.game=game;
    root?.addEventListener('change',e=>{
      const layer=e.target.dataset.layer;
      if(layer) renderer.world.setLayerVisibility({[layer]:e.target.checked});
      if(e.target.dataset.qa==='stage') game.setStage(e.target.value);
      if(e.target.dataset.qa==='character') game.setCharacter(e.target.value);
    });
  }
  snapshot(){
    return {
      stage:this.game.stage,
      character:this.game.player.character,
      layers:{...this.renderer.world.visibility},
      qa:QA_CONFIG
    };
  }
}
