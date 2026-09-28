import {AUDIO_ASSETS,AUDIO_MIX} from './audio-manifest.mjs';
const safeStop=n=>{try{n.stop();}catch{}};
// Original MP3s are decoded on demand. Keep effects and at most the active music buffer.
export class AudioEngine{
 constructor({contextFactory=()=>{const C=globalThis.AudioContext||globalThis.webkitAudioContext;return C?new C():null;},fetcher=(...a)=>fetch(...a),clock=()=>Date.now(),schedule=(f,t)=>setTimeout(f,t),cancel=id=>clearTimeout(id)}={}){
  Object.assign(this,{contextFactory,fetcher,clock,schedule,cancel});this.ctx=null;this.prefetched=new Map();this.cache=new Map();this.effects=[];this.musicVoices=new Set();this.track=null;this.owner=null;this.music=true;this.sound=true;this.paused=false;this.hidden=false;this.generation=0;this.effectGeneration=0;this.lastError='';
 }
 claim(owner){if(this.owner!==owner){this.stop();this.owner=owner;this.paused=false;}}
 async unlock(){try{this.ctx??=this.contextFactory();if(!this.ctx)return false;if(!this.output){this.output=this.ctx.createDynamicsCompressor?.()||this.ctx.destination;if(this.output!==this.ctx.destination){this.output.threshold.value=-6;this.output.knee.value=6;this.output.ratio.value=12;this.output.attack.value=.003;this.output.release.value=.12;this.output.connect(this.ctx.destination);}}await this.ctx.resume();if(!this.hidden&&!this.paused)this.resumeMusic();return true;}catch(e){this.lastError=e.message;return false;}}
 // Fetch compressed title audio before a gesture; decoding/playback still require unlock.
 prefetch(id){if(!AUDIO_ASSETS[id])return Promise.resolve(null);if(!this.prefetched.has(id)){const a=AUDIO_ASSETS[id];this.prefetched.set(id,this.fetcher(a.url+'?v='+a.hash.slice(0,12)).then(r=>{if(!r.ok)throw Error('Audio unavailable: '+id);return r.arrayBuffer();}).catch(()=>{this.prefetched.delete(id);return null;}));}return this.prefetched.get(id);}
 load(id){if(!AUDIO_ASSETS[id]||!this.ctx)return Promise.resolve(null);if(!this.cache.has(id)){const p=this.prefetch(id).then(b=>{this.prefetched.delete(id);if(!b)throw Error('Audio unavailable: '+id);return this.ctx.decodeAudioData(b);}).catch(e=>{this.cache.delete(id);this.lastError=e.message;return null;});this.cache.set(id,p);}return this.cache.get(id);}
 warmEffects(){for(const id of Object.keys(AUDIO_ASSETS).filter(id=>/^(PLAYER_|UI_|BOSS_HIT|BOSS_WEAPON)/.test(id)))void this.load(id);}
 settings({music=true,sound=true}){this.music=music;this.sound=sound;if(!sound)this.clearEffects();if(!music)this.pauseMusic();else this.resumeMusic();}
 blocked(){return this.hidden||this.paused;}
 setPaused(value){if(this.paused===value)return;this.paused=value;if(value){this.pauseMusic();this.clearEffects();}else this.resumeMusic();}
 visibility(value){this.hidden=value;if(value){this.pauseMusic();this.clearEffects();}else this.resumeMusic();}
 clearEffects(){this.effectGeneration++;for(const v of [...this.effects])this.removeEffect(v);}
 async effect(id,{audition=false}={}){
  if(!this.sound||this.hidden||(this.paused&&!id.startsWith('UI_'))||!this.ctx)return;
  const token=this.effectGeneration,owner=this.owner,requested=this.clock(),buffer=await this.load(id);
  if(!buffer||token!==this.effectGeneration||owner!==this.owner||!this.sound||this.hidden||(this.paused&&!id.startsWith('UI_'))||(!audition&&this.clock()-requested>500))return;
  const group=id.startsWith('UI_')?'ui':id.startsWith('BOSS_WEAPON')?'weapon':id,limit=group==='ui'?1:group==='weapon'?3:1;
  for(const v of this.effects.filter(v=>v.group===group).slice(0,Math.max(0,this.effects.filter(v=>v.group===group).length-limit+1)))this.removeEffect(v);
  while(this.effects.length>=AUDIO_MIX.maxEffects)this.removeEffect(this.effects[0]);
  const source=this.ctx.createBufferSource(),gain=this.ctx.createGain();source.buffer=buffer;gain.gain.value=group==='ui'?AUDIO_MIX.ui:AUDIO_MIX.sfx;source.connect(gain);gain.connect(this.output||this.ctx.destination);const v={source,gain,group};this.effects.push(v);source.onended=()=>this.removeEffect(v);source.start();
 }
 removeEffect(v){const i=this.effects.indexOf(v);if(i<0)return;this.effects.splice(i,1);v.source.onended=null;safeStop(v.source);v.source.disconnect();v.gain.disconnect();}
 musicFinished(id){
  const t=this.track;if(!t||t.id!==id||t.loop)return false;
  if(t.ended)return true;
  // AudioBufferSource.onended can arrive after the audio clock reaches the end.
  // Use the live voice's decoded duration too; paused/hidden time never counts.
  const v=t.voice;
  return Boolean(v&&this.ctx?.state!=='suspended'&&!this.blocked()&&this.ctx.currentTime-v.started+v.offset>=v.buffer.duration);
 }
 musicTrack(id,{loop=true,stinger=false,force=false,onended=null}={}){
  if(this.track?.id===id&&!force)return;
  this.generation++;this.fadeVoices();this.track=id?{id,loop,stinger,onended,offset:0,voice:null,ended:false}:null;
  for(const key of this.cache.keys())if(!/^(PLAYER_|UI_|BOSS_HIT|BOSS_WEAPON)/.test(key)&&key!==id)this.cache.delete(key);
  this.resumeMusic();
 }
 fadeVoices(immediate=false){for(const v of [...this.musicVoices]){this.cancel(v.timer);if(immediate||!this.ctx){safeStop(v.source);this.musicVoices.delete(v);}else{const now=this.ctx.currentTime;v.gain.gain.cancelScheduledValues(now);v.gain.gain.setValueAtTime(v.gain.gain.value,now);v.gain.gain.linearRampToValueAtTime(0,now+AUDIO_MIX.fade);try{v.source.stop(now+AUDIO_MIX.fade);}catch{}}}if(this.track)this.track.voice=null;}
 pauseMusic(){const t=this.track;if(t?.voice){t.offset=Math.min(t.voice.buffer.duration,t.voice.offset+this.ctx.currentTime-t.voice.started);t.voice=null;}this.fadeVoices(true);}
 async resumeMusic(){const t=this.track,token=this.generation;if(!t||t.voice||t.loading||t.ended||!this.ctx||!this.music||this.blocked())return;t.loading=true;const buffer=await this.load(t.id);t.loading=false;if(!buffer||this.track!==t||token!==this.generation||!this.music||this.blocked()||t.voice)return;if(t.offset>=buffer.duration){if(t.loop)t.offset=0;else{t.ended=true;t.onended?.();return;}}this.startVoice(t,buffer,t.offset);}
 startVoice(t,buffer,offset=0){
  const source=this.ctx.createBufferSource(),gain=this.ctx.createGain(),now=this.ctx.currentTime;source.buffer=buffer;source.connect(gain);gain.connect(this.output||this.ctx.destination);gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(t.stinger?AUDIO_MIX.stinger:AUDIO_MIX.music,now+AUDIO_MIX.fade);
  const v={source,gain,buffer,offset,started:now,timer:null};t.voice=v;this.musicVoices.add(v);
  source.onended=()=>{this.musicVoices.delete(v);source.disconnect();gain.disconnect();if(this.track===t&&t.voice===v){t.voice=null;if(!t.loop){t.ended=true;t.onended?.();}}};
  source.start(0,offset);
  if(t.loop)v.timer=this.schedule(()=>{if(this.track!==t||t.voice!==v||this.blocked()||!this.music)return;this.fadeVoices();t.offset=0;this.startVoice(t,buffer);},Math.max(20,(buffer.duration-offset-AUDIO_MIX.fade)*1000));
 }
 stop(){this.generation++;this.clearEffects();this.fadeVoices(true);this.track=null;for(const id of this.cache.keys())if(!/^(PLAYER_|UI_|BOSS_HIT|BOSS_WEAPON)/.test(id))this.cache.delete(id);}
}
export const sharedAudio=new AudioEngine();
if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>sharedAudio.visibility(document.hidden));
