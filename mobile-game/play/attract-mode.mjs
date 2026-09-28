// Title/demo timing is independent of player progression and authoring state.
export class AttractCycle{
 constructor({begin,end,musicReady,stageCount=21}){Object.assign(this,{begin,end,musicReady,stageCount});this.opened=false;this.mode='title';this.idle=0;this.elapsed=0;this.index=0;this.token=0;}
 open(){this.opened=true;this.title();}
 title(){this.token++;this.mode='title';this.elapsed=0;this.idle=0;}
 close(){this.opened=false;this.token++;this.mode='title';}
 input(){if(!this.opened)return false;this.idle=0;if(this.mode==='title')return false;this.token++;this.mode='title';this.elapsed=0;this.end();return true;}
 async tick(dt,{onTitle,visible=true}={}){
  if(!this.opened||!visible)return;
  if(this.mode==='demo'){this.elapsed+=dt;if(this.elapsed>=18){this.title();this.end();}return;}
  if(this.mode!=='title'||!onTitle)return;
  this.idle+=dt;this.elapsed+=dt;
  if(this.idle<10||!this.musicReady(this.elapsed))return;
  this.mode='loading';const token=++this.token,index=this.index++;
  try{await this.begin({index,character:index%2?'constance':'claude',stageIndex:index%this.stageCount});if(token!==this.token||!this.opened)return;this.mode='demo';this.elapsed=0;}
  catch(error){if(token===this.token&&this.opened){this.title();this.end(error);}}
 }
}
// Drive the actual checked runtime at its fixed simulation step.
export class AttractPlayback{
 constructor(run){if(!run.sequence?.verified)throw Error('A checked stage sequence is required for the demo.');this.run=run;this.carry=0;this.next=0;}
 advance(dt){this.carry+=dt;const r=this.run;while(this.carry+1e-9>=1/60&&r.status==='playing'){this.carry-=1/60;while(this.next<r.sequence.events.length&&r.time+1e-8>=r.sequence.events[this.next].start+r.sequence.events[this.next].local[r.who])r.plannedAction(r.sequence.events[this.next++]);r.advance(1/60);}}
}
