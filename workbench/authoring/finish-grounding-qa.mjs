import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {descriptors} from '../dist/workbench-next/model.mjs';import {landscapeDescriptors} from '../dist/workbench-next/landscape.mjs';import {ProjectDraft,projectProvenance} from '../dist/workbench-next/project.mjs';import {analyzeProfiles,makeSequence} from '../dist/workbench-next/calibration-engine.mjs';import {runtimeSnapshot,PlayRuntime} from '../dist/workbench-next/play-runtime.mjs';import {finishGeometry,FINISH_BASE_RATIO,FINISH_PLACEMENT_VERSION} from '../dist/workbench-next/stage-settings.mjs';
const context={window:{}};vm.createContext(context);for(const f of JSON.parse(fs.readFileSync('authoring/workbench-next/source-files.json')))vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),context);
const w=context.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);const items=descriptors(config,w.GAME_SCHEMA),stages=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog=JSON.parse(fs.readFileSync('dist/workbench-next/asset-catalog.json'));
const makeDraft=()=>new ProjectDraft(items,stages,catalog.dimensions,projectProvenance(catalog,items,stages),catalog.migrations,config),draft=makeDraft();
const payload=JSON.parse(fs.readFileSync(process.argv[2]||'authoring/fixtures/combination-project-v9.json')),decoded=draft.decode(payload).state;Object.assign(draft,{value:decoded.crops,...decoded});

const marker={width:1211,height:1299};let checks=0;
for(const stage of stages.map(s=>s.stage)){
 assert.equal(draft.stageSettings[stage].finish.scale,.22);assert.equal(draft.stageSettings[stage].finish.groundOffset,0);
 for(const character of ['claude','constance']){
  const run=new PlayRuntime(runtimeSnapshot({config,draft,items,catalog,stage,character}));
  const foot=run.geometry().character.foot,flag=finishGeometry(config,run.draft,stage,89,90,120,marker,foot);
  const path=foot;
  assert(Math.abs(flag.y+flag.h*FINISH_BASE_RATIO-path)<1e-8);

  run.draft.calibration.stages[stage].pathY+=12;
  assert.equal(finishGeometry(config,run.draft,stage,89,90,120,marker,run.geometry().character.foot).y-flag.y,12);checks++;
 }
}
// Simulate saved v9 values from before this correction, including explicit overrides.
const old=draft.export();delete old.finishPlacementVersion;
for(const stage of stages.map(s=>s.stage)){const f=config.finish.stages[stage];old.stageSettings[stage].finish={scale:f.scale,groundOffset:f.groundOffset,xOffset:f.xOffset};}
old.stageSettings.as02.finish={scale:.3,groundOffset:9,xOffset:12};
const migrated=draft.decode(old);assert(migrated.migrated);
for(const stage of stages.map(s=>s.stage).filter(s=>s!=='as02')){assert.equal(migrated.state.stageSettings[stage].finish.scale,.22);assert.equal(migrated.state.stageSettings[stage].finish.groundOffset,0);}
assert.equal(migrated.state.stageSettings.as02.finish.groundOffset,0);assert.equal(migrated.state.stageSettings.as02.finish.scale,.3);assert.equal(migrated.state.stageSettings.as02.finish.xOffset,12);
assert.deepEqual(migrated.state.placement,old.placement);assert.deepEqual(migrated.state.calibration,old.calibration);
const raw=JSON.stringify(old),memory=new Map([['cc-workbench-next-project-v9',raw]]),storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
const restored=makeDraft();restored.load(storage);restored.save(storage);assert([...memory.values()].includes(raw));assert.equal(restored.export().finishPlacementVersion,FINISH_PLACEMENT_VERSION);assert(!restored.decode(restored.export()).migrated);
const settings=structuredClone(restored.stageSettings.as02);settings.finish.groundOffset=13;restored.editStageSettings('as02',settings);restored.undo();assert.equal(restored.stageSettings.as02.finish.groundOffset,0);restored.redo();assert.equal(restored.stageSettings.as02.finish.groundOffset,13);
console.log(`${checks} stage/character grounding checks passed; inherited defaults corrected, old Y offsets reset; scale/X overrides preserved, recovery/save/import and undo/redo passed.`);

const version2=structuredClone(old);version2.finishPlacementVersion=2;version2.stageSettings.na01.finish.groundOffset=8;
assert.equal(draft.decode(version2).state.stageSettings.na01.finish.groundOffset,0);
// Independent character offsets and unlinked grounding still use exactly the displayed foot guide.
for(const who of ['claude','constance']){const run=new PlayRuntime(runtimeSnapshot({config,draft,items,catalog,stage:'na01',character:who}));run.draft.calibration.stages.na01.characterFollow[who]=false;run.draft.placement[`grounding:na01:${who}`].groundOffset+=23;const foot=run.geometry().character.foot;const flag=finishGeometry(config,run.draft,'na01',89,90,120,marker,foot);assert.equal(flag.baseY,foot);run.motion.triggerJump();run.motion.update(.1);assert.equal(run.geometry().character.foot,foot);}
console.log('Version-2 offset 8 resets to automatic; independent character grounding follows exactly; jumping never lifts the flag.');
