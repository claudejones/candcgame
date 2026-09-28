import {freshPlayer,STAGES} from './player-state.mjs';
export const SCREEN_SCENARIOS=[
 ['secret-start','Start · secret unlocked','All seven Standard continent passports are perfect. Beneath the Ice appears on the main menu.'],
 ['secret-play','Beneath the Ice · practice','Play the real 180-second encounter with preview-only progress. Jump low orbs and slide high bolts.'],
 ['secret-capture','Beneath the Ice · capture','At 180 seconds, surviving starts containment before celebration and the result.'],
 ['secret-failed','Beneath the Ice · game over','Final hit freezes the attempt with looping stun stars.'],
 ['secret-success','Beneath the Ice · passport earned','First eligible secret completion earns one shared secret passport.'],
 ['secret-assisted','Beneath the Ice · assisted','Unlimited Health disables new secret rewards for the entire attempt.'],
 ['secret-passport','Achievements · secret passport','Preview the locked, revealed or earned passport with Reward history.'],
 ['start','Start · new player','Shown when no journey has been saved.'],
 ['continue','Start · saved journey','Continue restarts the saved stage with three hearts.'],
 ['map','World map','Shown after New Game or Back to Map.'],
 ['travel','World map · stage travel','Character marker travels within a continent, then holds at the destination. Play, pause, step or scrub the transition.'],
 ['travel-plane','World map · plane travel','Choose a flight route. The plane flies between continents, then the character appears for the two-second arrival hold. Play, pause, step or scrub to inspect.'],
 ['failed','Game over','Shown after the final hit; stun stars continue behind it.'],
 ['complete','Stage complete · first trophy','Finish an eligible stage for the first time.'],
 ['improved','Stage complete · improved best','Finish with more hearts than the previous best.'],
 ['retained','Stage complete · best retained','Finish without exceeding the previous best.'],
 ['assisted','Stage complete · assisted','Complete with Unlimited Health; no new rewards.'],
 ['passport','Passport earned','Complete all three stages of a continent.'],
 ['perfect','Perfect passport','Earn three hearts on every stage of a continent.'],
 ['world','World complete','Complete all 21 stages; Standard unlocks Hard and Level Select.'],
 ['unlock','Secret unlocked','Earn seven perfect Standard passports.'],
 ['achievements','Achievements','Opened from the start screen, map or game menu.'],
 ['secret','Secret passport','The eighth page in Achievements.'],
 ['level-select-locked','Level Select · locked','Options before completing every Standard stage.'],
 ['level-select-unlocked','Level Select · unlocked','Options after completing every Standard stage; opens the full world map.'],
 ['options','Options','Opened from the start screen, map or game menu.'],
 ['about','How to Play · Game Guide','Controls, progression and rewards.'],
 ['hazard-guide','How to Play · Hazard Guide','Browse the selected continent’s hazards, grouped by its three stages.'],
 ['menu','Game menu','Opened using the menu icon during a stage.'],
 ['confirm','Restart confirmation','Opened when Restart Stage is selected in the game menu.'],
 ['save-error','Save error','Shown when device storage rejects a save. Retry is safe in preview.'],
 ['asset-error','Image error','Shown when a global image fails to load.'],
 ['loading','Loading','Shown while preparing a stage.']
];
export function screenScenario({kind,stage,character,difficulty,hearts=3,progress='partial'}){
 if(kind==='travel-plane')stage=(stage.startsWith('AN')?'OC':stage.slice(0,2))+'03';
 if(kind==='travel'&&stage.endsWith('03'))stage=stage.slice(0,2)+'02';
 if(kind.startsWith('secret-')){
  const state=freshPlayer();if(progress!=='empty'||kind!=='secret-passport')for(const id of STAGES)state.ratings.standard[id]={[character]:3};
  state.journey={stage:'AN03',character,difficulty:'standard',visited:[...STAGES]};state.secret.earned=kind==='secret-passport'&&progress==='perfect';
  let result=null;
  if(['secret-success','secret-failed','secret-assisted'].includes(kind)){const complete=kind!=='secret-failed',eligible=kind==='secret-success';state.secret.earned=eligible;result={secret:true,stage:'SECRET01',character,difficulty:'standard',complete,eligible,newlyEarned:eligible,earned:eligible,hearts:complete?Number(hearts):0,queue:[]};}
  return {state,kind,stage:'SECRET01',character,difficulty:'standard',result,queueIndex:0};
 }
 const state=freshPlayer(),index=STAGES.indexOf(stage);
 if(kind==='level-select-unlocked')for(const id of STAGES)state.ratings.standard[id]={[character]:2};
 for(const d of [difficulty,...(difficulty==='hard'?['standard']:[])]){
  const earned=progress==='perfect'?STAGES:progress==='empty'?[]:STAGES.slice(0,index);
  for(const id of earned)state.ratings[d][id]={[character]:progress==='perfect'?3:2};
  if(difficulty==='hard')for(const id of STAGES)state.ratings.standard[id]={[character]:2};
 }
 state.journey={character,difficulty,stage,visited:[...STAGES.slice(0,index+1)]};
 if(kind==='start')state.journey=null;
 if(kind==='assisted')state.settings.unlimited=true;
 let result=null,queueIndex=0;
 if(['failed','complete','improved','retained','assisted','passport','perfect','world','unlock'].includes(kind)){
  const before=kind==='improved'?1:kind==='retained'?3:0;
  result={stage,character,difficulty,complete:kind!=='failed',eligible:kind!=='failed'&&kind!=='assisted',hearts:kind==='failed'?0:Number(hearts),before,best:Math.max(before,Number(hearts)),queue:[]};
  if(kind==='passport'||kind==='perfect')result.queue.push({kind:'passport',continent:stage.slice(0,2),perfect:kind==='perfect'});
  if(kind==='world')result.queue.push({kind:'world',difficulty,hardUnlocked:difficulty==='standard'});
  if(kind==='unlock')result.queue.push({kind:'secret'});
  if(result.queue.length)queueIndex=1;
 }
 if(kind==='level-select-locked')state.ratings.standard={};
 return {state,kind,stage,character,difficulty,result,queueIndex};
}
