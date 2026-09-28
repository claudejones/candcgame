// Design-only transport. The slider is a deterministic preview timeline;
// pausing freezes the whole preview for inspection, not the gameplay runtime.
export class LandscapePlayback {
  constructor({speed,end,read,write,available,changed=()=>{},request=cb=>requestAnimationFrame(cb),cancel=id=>cancelAnimationFrame(id)}) {
    if(!Number.isFinite(speed)||speed<=0||!Number.isFinite(end)||end<=0)throw new Error('Preview speed and range must be positive.');
    Object.assign(this,{speed,end,read,write,available,changed,request,cancel});
    this.running=false;this.handle=null;this.last=null;this.generation=0;
  }
  pause() {
    this.generation++;
    if(this.handle!==null)this.cancel(this.handle);
    this.handle=null;this.running=false;this.last=null;this.changed();
  }
  seek(position) {
    this.pause();
    if(!Number.isFinite(position))return;
    this.write(Math.max(0,Math.min(this.end,position)));this.changed();
  }
  play(restart=false) {
    if(!this.available()){this.pause();return;}
    if(this.running&&!restart)return;
    this.pause();
    if(restart||this.read()>=this.end)this.write(0);
    this.running=true;this.changed();
    const generation=this.generation;
    const tick=now=>{
      if(!this.running||generation!==this.generation)return;
      this.handle=null;
      if(!this.available()){this.pause();return;}
      const seconds=this.last===null?0:Math.max(0,(now-this.last)/1000);this.last=now;
      const next=Math.min(this.end,this.read()+seconds*this.speed);
      this.write(next);
      if(next>=this.end){this.pause();return;}
      if(this.running&&generation===this.generation)this.handle=this.request(tick);
    };
    this.handle=this.request(tick);
  }
}
