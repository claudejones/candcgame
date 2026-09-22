// Generated from src/js/game-runtime.js by build-runtime-rules.mjs. Do not hand-edit.
// Production movement and contact rules; no legacy UI or gameplay side effects.
export const intersects=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export function createMotion(CONFIG,state='run'){
 class Motion {
 constructor(){this.state='run';this.frame=0;this.elapsed=0;this.y=0;this.vy=0;this.hitT=0;this.starT=0;this.starMode='auto';this.slideT=0;this.timedSlide=false;}

 setState(state){
   if(!CONFIG.state[state])return;
   this.state=state;this.frame=0;this.elapsed=0;this.hitT=0;
   this.timedSlide=false;this.slideT=0;
   if(state!=="jump"){this.y=0;this.vy=0}
 }

 triggerJump(){
   if(this.state==="jump")return;
   this.state="jump";this.frame=0;this.elapsed=0;this.y=0;this.vy=CONFIG.jump.launch;
 }

 triggerSlide(){
   // Gameplay Slide is self-contained: enter immediately, hold for the configured
   // window, then return to Run. Re-pressing Slide restarts the full window.
   if(this.state!=="slide"){this.state="slide";this.frame=0;this.elapsed=0;this.y=0;this.vy=0}
   this.timedSlide=true;
   this.slideT=Math.max(.20,CONFIG.actions.slideDuration);
 }

 starsVisible(){return this.state==="hit"&&(this.starMode==="on"||(this.starMode==="auto"&&this.frame===1))}

 update(dt){
   this.elapsed+=dt;
   const cfg=CONFIG.state[this.state];

   if(this.state==="run"||this.state==="idle"||this.state==="celebrate")
     this.frame=Math.floor(this.elapsed*cfg.fps)%cfg.frames;

   if(this.state==="slide"){
     this.frame=Math.min(1,Math.floor(this.elapsed*cfg.fps));
     if(this.timedSlide){
       this.slideT-=dt;
       if(this.slideT<=0){this.setState("run");return;}
     }
   }

   if(this.state==="jump"){
     this.vy+=CONFIG.jump.gravity*dt;
     this.y+=this.vy*dt;
     if(this.vy<-110)this.frame=0;
     else if(this.vy<110)this.frame=1;
     else this.frame=2;
     if(this.y>=0&&this.vy>0){this.y=0;this.setState("run")}
   }

   if(this.state==="hit"){
     // A failed run freezes the character in the readable stunned pose.
     // Frame 1 is the approved stars frame when starMode is Auto.
     if(CONFIG.spawnDirector.failed){
       this.frame=1;
       this.hitT=0;
     }else{
       this.hitT+=dt;
       const hd=Math.max(.35,CONFIG.hitRecovery.recoveryDuration);
       if(this.hitT<hd*.14)this.frame=0;
       else if(this.hitT<hd*.75)this.frame=1;
       else if(this.hitT<hd)this.frame=2;
       else this.setState("run");
     }
   }

   if(this.starsVisible())this.starT+=dt;
 }
 }
 const motion=new Motion();
 if(state==='jump')motion.triggerJump();else if(state==='slide')motion.triggerSlide();else motion.setState(state);
 return motion;
}
