// Five progress intervals share one pacing contract in Game and sequence authoring.
export const PACING_VERSION=7;
export function encounterPacing(progress,profile,config,difficulty='standard'){
 const phase=Math.min(4,Math.max(0,Math.floor(progress*5)));
 const airborne=Math.abs(config.jump.launch)*2/config.jump.gravity;
 const margin={easy:.3,standard:.18,hard:.1}[difficulty]??.18;
 const reset=Math.max(airborne,config.actions.slideDuration)+margin;
 const curves={easy:[1.65,1.4,1.2,1,.9],standard:[1.4,1.1,.9,.72,.58],hard:[1.1,.9,.72,.58,.46]}[difficulty];
 return {phase,spacing:Math.max(reset,profile.spacingSeconds*curves[phase]),
  actionGap:Math.max(reset,profile.reactionSeconds*curves[phase]),
  maxVisible:Math.min(8,profile.maxVisible+[0,1,1,2,3][phase]),
  pair:phase>=1};
}
export function encounterProgress(run){
 const bounds=run.sequence?.pacingBoundaries;if(!bounds)return Math.min(1,run.time/run.duration);
 const ends=[...bounds,run.duration];let phase=0;while(phase<4&&run.time>=ends[phase+1])phase++;
 return Math.min(1,(phase+Math.max(0,Math.min(1,(run.time-ends[phase])/Math.max(.001,ends[phase+1]-ends[phase]))))/5);
}

// Stage/difficulty identity is stable across replays and independent of character.
export function encounterSeed(stage,difficulty,seed=1){let value=seed>>>0;for(const c of `${stage}:${difficulty}`)value=Math.imul(value^c.charCodeAt(0),16777619)>>>0;return value;}
export function encounterVariation(index,phase,difficulty='standard',stage=''){
 const seed=encounterSeed(stage,difficulty),block=Math.floor(index/6);
 // Every block begins and ends on ground: no boundary can create a flying streak.
 const motifs=[['ground','high','low','ground','high','ground'],['ground','low','ground','high','high','ground'],['ground','high','ground','low','high','ground'],['ground','low','high','ground','low','ground']];
 const kind=motifs[(seed+block)%motifs.length][index%6];
 const ramp={easy:[1,1.03,1.06,1.09,1.12],standard:[1,1.08,1.16,1.24,1.32],hard:[1.04,1.15,1.26,1.37,1.48]}[difficulty];
 const speed=[.9,1.04,.96,1.12,1,.94,1.08],gap=[1.08,.96,1.16,1,.94,1.12];
 return {kind,action:kind==='high'?'slide':'jump',speedFactor:ramp[phase]*speed[(index+seed)%speed.length],gapFactor:index%6===0?1.35:gap[(index+seed+phase)%gap.length]};
}
