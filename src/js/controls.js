export class Controls {
  constructor(root, handlers={}){
    this.root=root;
    this.handlers=handlers;
    root.addEventListener('click', (event)=>{
      const button=event.target.closest('[data-action]');
      if(!button) return;
      const action=button.dataset.action;
      const handler=this.handlers[action];
      if(handler) handler();
    });
  }
  setPaused(paused){
    for(const name of ['slide','jump']){
      const button=this.root.querySelector(`[data-action="${name}"]`);
      if(button) button.disabled=paused;
    }
    const pause=this.root.querySelector('[data-action="pause"]');
    if(pause) pause.textContent=paused ? 'Resume' : 'Pause';
  }
}
