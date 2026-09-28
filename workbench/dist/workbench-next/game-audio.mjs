import {sharedAudio} from './audio-engine.mjs';
export class GameAudio{
 constructor({engine=sharedAudio,enabled=false}={}){this.engine=engine;this.enabled=enabled;this.settings={music:true,sound:true};this.screenName='start';this.run=null;this.cursor=0;this.stunned=false;this.completed=false;this.captured=false;this.resultKey=null;this.world=false;}
 enable(value){this.enabled=value;if(value){this.engine.claim(this);this.engine.settings(this.settings);}else if(this.engine.owner===this)this.engine.stop();}
 configure(settings){this.settings=settings;if(this.enabled){this.engine.claim(this);this.engine.settings(settings);}}
 unlock(){if(!this.enabled)return;this.engine.claim(this);void this.engine.unlock().then(ok=>{if(ok&&this.enabled&&this.engine.owner===this){this.engine.warmEffects();this.engine.resumeMusic();}});}
 effect(id,options){if(this.enabled&&this.engine.owner===this)void this.engine.effect(id,options);}
 button(launch=false){this.unlock();this.effect(launch?'UI_START_CONTINUE_CONFIRM':'UI_BUTTON_CONFIRM');}
 track(id,options){if(this.enabled){this.engine.claim(this);this.engine.musicTrack(id,options);}}
 screen(name){this.screenName=name;if(!this.enabled)return;this.engine.claim(this);
  if(name==='start'){this.run=null;this.engine.setPaused(false);this.track('C_AND_C_TITLE',{loop:false,force:this.engine.track?.id!=='C_AND_C_TITLE'||this.engine.track?.ended===true});}
  else if(name==='map'||name==='travel'){this.run=null;this.engine.setPaused(false);this.track('WORLD_MAP');}
  else if(name==='loading'){this.run=null;this.engine.setPaused(false);this.track(null);}
  // Gameplay pause state is applied by update(), never by merely showing the screen.
 }
 update(run){if(!this.enabled||!run?.events||!run?.motion||!['game','demo','result'].includes(this.screenName))return;
  if(this.run!==run){this.run=run;this.cursor=0;this.stunned=false;this.completed=false;this.captured=false;this.resultKey=null;this.world=false;this.track(run.kind==='secret'?'SECRET_BOSS_THEME':run.stage.toUpperCase()+'_THEME',{force:true});}
  this.engine.setPaused(run.status==='paused');
  for(const e of run.events.slice(this.cursor)){
   if(e.type==='action')this.effect(e.action==='jump'?'PLAYER_JUMP':'PLAYER_SLIDE');
   if(e.type==='hit'){this.stunned=false;this.effect('PLAYER_HIT');}
   if(e.type==='release')this.effect(e.lane==='high'?'BOSS_WEAPON_FIRE_HIGH':'BOSS_WEAPON_FIRE_LOW');
   if(e.type==='pulse')this.effect('BOSS_HIT');
  }this.cursor=run.events.length;
  if(run.motion.state==='hit'&&run.motion.frame>=1&&!this.stunned){this.stunned=true;this.effect('PLAYER_STUNNED');}
  if(run.status==='failed'){if(!this.completed){this.completed=true;this.track(null);}return;}
  if(run.status==='complete'&&!this.completed){this.completed=true;if(run.kind==='secret')this.track(null);else this.fanfare('STAGE_COMPLETE');}
  if(run.kind==='secret'&&run.status==='complete'&&run.captureTime>=run.captureDuration&&!this.captured){this.captured=true;this.fanfare('BOSS_COMPLETE');}
 }
 fanfare(id){this.track(id,{loop:false,stinger:true,onended:()=>{if(this.world&&this.enabled)this.track('GAME_COMPLETE',{loop:false});}});}
 result(result,entry=null,{preview=false}={}){if(!this.enabled)return;this.screenName='result';this.engine.setPaused(false);
  if(preview&&this.resultKey!==result){this.resultKey=result;if(result.complete)this.fanfare(result.secret?'BOSS_COMPLETE':'STAGE_COMPLETE');else this.track(null);}
  if(entry?.kind==='world'){this.world=true;const t=this.engine.track;if(!t||t.ended||!t.stinger)this.track('GAME_COMPLETE',{loop:false});}
 }
 audition(id,music=false){this.unlock();if(music)this.track(id,{loop:false,force:true,stinger:id.endsWith('_COMPLETE')&&id!=='GAME_COMPLETE'});else this.effect(id,{audition:true});}
 stop(){this.enable(false);this.run=null;this.resultKey=null;this.world=false;}
}
