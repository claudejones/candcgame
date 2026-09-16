export class HUD {
  constructor(root){ this.root=root; }
  render({lives=3,elapsed=0,duration=90,character='claude',paused=false}={}){
    const progress=Math.max(0,Math.min(1,elapsed/duration));
    const livesEl=this.root.querySelector('[data-hud="lives"]');
    const marker=this.root.querySelector('[data-hud="marker"]');
    const status=this.root.querySelector('[data-hud="status"]');
    if(livesEl) livesEl.textContent=`Lives ${lives}`;
    if(marker){ marker.style.left=`${4.8+progress*86.95}%`; marker.dataset.character=character; }
    if(status) status.textContent=paused?'PAUSED':'';
  }
}
