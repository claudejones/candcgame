export class HUD {
  constructor(root=document){ this.root=root; this.marker=root.querySelector('#progressMarker'); this.lifeHud=root.querySelector('#lifeHud'); this.title=root.querySelector('#stageTitle'); }
  render({lives=3,elapsed=0,duration=90,character='claude',stageTitle='',paused=false}={}){
    const p=Math.max(0,Math.min(1,elapsed/duration));
    if(this.marker){ this.marker.style.left=`${4.8+p*86.95}%`; this.marker.className=`progress-marker ${character}`; }
    if(this.title && stageTitle) this.title.textContent=stageTitle;
    if(this.lifeHud){ [...this.lifeHud.children].forEach((heart,i)=>{ heart.classList.toggle('full',i<lives); heart.classList.toggle('empty',i>=lives); heart.classList.toggle('active',i===Math.max(0,lives-1)&&lives>0&&!paused); }); }
  }
}
