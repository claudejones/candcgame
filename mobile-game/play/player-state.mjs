// Player records deliberately never share Design's draft/configuration storage.
export const PLAYER_KEY='candc.player.v1';
export const CONTINENTS=['NA','SA','EU','AF','AS','OC','AN'];
export const STAGES=CONTINENTS.flatMap(c=>[1,2,3].map(n=>`${c}0${n}`));
export const DIFFICULTIES=['easy','standard','hard'];
// Stage-start Continue is confirmed; ownership/reset/assistance remain review defaults.
export const PLAYER_POLICY=Object.freeze({rewards:'shared',checkpoint:'stage-start',newGame:'journey-only',assistance:'sticky-attempt'});
export const freshSecret=()=>({earned:false,character:null,attempt:null,outcomes:{}});
export const freshPlayer=()=>({version:1,ratings:{easy:{},standard:{},hard:{}},journey:null,attempt:null,settings:{music:true,sound:true,unlimited:false},outcomes:{},pending:[],secret:freshSecret(),resumeTarget:'journey'});
export function best(state,difficulty,stage,character){const r=state.ratings[difficulty]?.[stage]||{};return character?r[character]||0:Math.max(0,...Object.values(r));}
export function passport(state,difficulty,continent){const scores=STAGES.filter(s=>s.startsWith(continent)).map(s=>best(state,difficulty,s));return scores.every(n=>n===3)?2:scores.every(n=>n>0)?1:0;}
export function unlocks(state){return {hard:STAGES.every(s=>best(state,'standard',s)>0),levelSelect:STAGES.every(s=>best(state,'standard',s)>0),secret:CONTINENTS.every(c=>passport(state,'standard',c)===2)};}
export function available(state,difficulty,stage){const n=STAGES.indexOf(stage);return n>=0&&(difficulty!=='hard'||unlocks(state).hard)&&(unlocks(state).levelSelect||n===0||best(state,difficulty,stage)>0||STAGES.slice(0,n).every(s=>best(state,difficulty,s)>0));}
function validate(s){
 if(s?.version!==1||!s.ratings||!s.settings||!s.outcomes||!Array.isArray(s.pending))throw Error('Unrecognized player save. Existing data has been preserved.');
 for(const d of DIFFICULTIES){if(!s.ratings[d])throw Error('Incomplete player save.');for(const [stage,r] of Object.entries(s.ratings[d])){if(!STAGES.includes(stage)||Object.entries(r).some(([c,n])=>!['claude','constance'].includes(c)||!Number.isInteger(n)||n<1||n>3))throw Error('Invalid reward record.');}}
 if(s.journey&&(!STAGES.includes(s.journey.stage)||!DIFFICULTIES.includes(s.journey.difficulty)||!['claude','constance'].includes(s.journey.character)))throw Error('Invalid journey record.');
 // Additive migration retains ordinary progress and never manufactures entitlement.
 if(s.secret===undefined)s.secret=freshSecret();
 if(!s.secret||typeof s.secret.earned!=='boolean'||!s.secret.outcomes||Array.isArray(s.secret.outcomes))throw Error('Invalid secret progress.');
 if(s.secret.attempt&&(!['claude','constance'].includes(s.secret.attempt.character)||s.secret.attempt.stage!=='SECRET01'||typeof s.secret.attempt.id!=='string'||typeof s.secret.attempt.assisted!=='boolean'))throw Error('Invalid secret attempt.');
 if(s.resumeTarget===undefined)s.resumeTarget='journey';
 if(!['journey','secret'].includes(s.resumeTarget)||s.resumeTarget==='secret'&&!s.secret.attempt)throw Error('Invalid continue target.');
 return s;
}
export class PlayerStore{
 constructor(storage){this.storage=storage;this.state=freshPlayer();this.status='unsaved';this.error='';this.blocked=false;
  try{const raw=storage.getItem(PLAYER_KEY);if(raw){this.state=validate(JSON.parse(raw));this.status='saved';}}catch(e){this.error=e.message;this.status='error';this.blocked=true;}
 }
 save(){try{if(this.blocked)throw Error('Existing save could not be read; it will not be overwritten.');this.storage.setItem(PLAYER_KEY,JSON.stringify(this.state));this.status='saved';this.error='';return true;}catch(e){this.status='error';this.error=e.message;return false;}}
 newJourney(character,difficulty){if(!['claude','constance'].includes(character)||!DIFFICULTIES.includes(difficulty)||difficulty==='hard'&&!unlocks(this.state).hard)throw Error('Difficulty is locked.');this.state.resumeTarget='journey';this.state.journey={character,difficulty,stage:'NA01',visited:['NA01']};this.state.attempt=null;this.state.pending=[];this.save();}
 begin(stage){const j=this.state.journey;if(!j||!STAGES.includes(stage)||!(available(this.state,j.difficulty,stage)||j.visited.includes(stage)))throw Error('Complete the preceding stage first.');j.stage=stage;this.state.resumeTarget='journey';
  this.state.attempt={id:globalThis.crypto.randomUUID(),stage,character:j.character,difficulty:j.difficulty,assisted:this.state.settings.unlimited,eligible:available(this.state,j.difficulty,stage)};this.state.pending=[];this.save();return structuredClone(this.state.attempt);
 }
 setOption(key,value){if(!['music','sound','unlimited'].includes(key))throw Error('Unknown option.');this.state.settings[key]=!!value;if(key==='unlimited'&&value){const a=this.state.resumeTarget==='secret'?this.state.secret?.attempt:this.state.attempt;if(a)a.assisted=true;}this.save();}
 finish(id,{complete,hearts}){
  if(this.state.outcomes[id])return structuredClone(this.state.outcomes[id]);
  const a=this.state.attempt;if(!a||a.id!==id)throw Error('Unknown attempt.');
  if(!Number.isInteger(hearts)||hearts<0||hearts>3||complete&&hearts===0)throw Error('Invalid health outcome.');
  const before=best(this.state,a.difficulty,a.stage),oldPass=passport(this.state,a.difficulty,a.stage.slice(0,2)),oldUnlock=unlocks(this.state),wasWorld=STAGES.every(s=>best(this.state,a.difficulty,s)>0);
  const eligible=complete&&!a.assisted&&a.eligible;
  if(eligible){const r=this.state.ratings[a.difficulty][a.stage]??={};r[a.character]=Math.max(r[a.character]||0,hearts);}
  const result={...a,complete,hearts,eligible,before,best:best(this.state,a.difficulty,a.stage),queue:[]};
  const pass=passport(this.state,a.difficulty,a.stage.slice(0,2)),now=unlocks(this.state);
  if(eligible&&pass>oldPass)result.queue.push({kind:'passport',continent:a.stage.slice(0,2),perfect:pass===2});
  if(eligible&&!wasWorld&&STAGES.every(s=>best(this.state,a.difficulty,s)>0))result.queue.push({kind:'world',difficulty:a.difficulty,hardUnlocked:!oldUnlock.hard&&now.hard});
  if(eligible&&!oldUnlock.secret&&now.secret)result.queue.push({kind:'secret'});
  if(complete){const next=STAGES[STAGES.indexOf(a.stage)+1];if(next&&!this.state.journey.visited.includes(next))this.state.journey.visited.push(next);}
  this.state.outcomes[id]=result;this.state.pending=[{kind:'stage',outcome:id},...result.queue.map(q=>({...q,outcome:id}))];this.save();return structuredClone(result);
 }
 beginSecret(character){
  if(!unlocks(this.state).secret)throw Error('Earn all seven perfect Standard passports first.');
  if(!['claude','constance'].includes(character))throw Error('Choose a character.');
  this.state.secret??=freshSecret();const attempt={id:globalThis.crypto.randomUUID(),stage:'SECRET01',character,difficulty:'standard',assisted:this.state.settings.unlimited,eligible:true};
  this.state.secret.attempt=attempt;this.state.resumeTarget='secret';this.save();return structuredClone(attempt);
 }
 finishSecret(id,{complete,hearts}){
  const secret=this.state.secret;if(secret?.outcomes[id])return structuredClone(secret.outcomes[id]);
  const a=secret?.attempt;if(!a||a.id!==id)throw Error('Unknown secret attempt.');
  if(!Number.isInteger(hearts)||hearts<0||hearts>3||complete&&hearts===0)throw Error('Invalid health outcome.');
  const eligible=complete&&!a.assisted&&a.eligible&&unlocks(this.state).secret,newlyEarned=eligible&&!secret.earned;
  if(eligible){secret.earned=true;secret.character??=a.character;}
  const result={...a,secret:true,complete,hearts,eligible,newlyEarned,earned:secret.earned,queue:[]};secret.outcomes[id]=result;this.save();return structuredClone(result);
 }
 dismissNotice(){this.state.pending.shift();this.save();}
}
