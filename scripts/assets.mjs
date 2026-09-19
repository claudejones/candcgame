#!/usr/bin/env node
// Chat command resolver and deterministic helpers. Image generation and connected
// publication are performed by the agent, not simulated by this local CLI.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {
  checkpointRun, closeRun, createRun, hashValue, readWorkflowState, recordResult,
  requeueJob, resumeReport, startJob, updateWorkflowState, verifyRecovery
} from './asset-jobs.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const json = p => JSON.parse(read(p));
export const catalog = json('config/asset-commands.json');
const registry = () => json('config/phase8-landscapes.json');
const workflowPath = path.join(ROOT,'config/asset-workflow-state.json');
const workflow = () => readWorkflowState(workflowPath);
const proposal = () => json('config/remaining-continent-proposal.json');
const fileHash = p => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, p))).digest('hex');
const layers = ['FAR', 'MID', 'GROUND'];
const hazardSelectors = ['GROUND1', 'GROUND2', 'FLYING'];
const readyValue = value => value === true || ['ready','complete','completed','approved','passed'].includes(String(value).toLowerCase());

function futureStage(input) {
  let id;
  try { id=stageKey(input); } catch { return null; }
  try { return proposal().stages?.find(stage=>stage.id===id) ?? null; }
  catch(error) { throw new Error(`Future asset catalog is unreadable; generation is blocked: ${error.message}`); }
}

function referenceFilesFor(stage,selector=null) {
  const source=stage.referenceFiles ?? stage.references;
  const values=[];
  const collect=value=>{
    if (typeof value==='string' && !/^https?:/i.test(value) && /\.(?:png|jpe?g|webp)$/i.test(value)) values.push(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value==='object') Object.values(value).forEach(collect);
  };
  if (selector && source && !Array.isArray(source) && typeof source==='object') {
    collect(source.shared);
    collect(source[selector]);
    if (selector==='OBJECT_ATLAS') { collect(source.GROUND1); collect(source.GROUND2); }
  } else collect(source);
  return [...new Set(values)];
}

function futureBlockers(plan, stage) {
  const blockers=[];
  if (plan.approval?.status !== 'approved') blockers.push('workflow/theme/atlas direction approval is pending');
  if (plan.productionEnabled !== true) blockers.push('productionEnabled is false');
  for (const key of ['landscapeContractPromotion','runtimeRegistration','hazardValidation']) {
    if (!readyValue(plan.readiness?.[key])) blockers.push(`${key} is ${plan.readiness?.[key] ?? 'missing'}`);
  }
  if (!readyValue(stage.selectionStatus)) blockers.push(`stage selectionStatus is ${stage.selectionStatus ?? 'missing'}`);
  if (stage.referencesReady !== true) blockers.push('stage referencesReady is not true');
  if (stage.referencesReady === true) {
    const references=referenceFilesFor(stage);
    if (!references.length) blockers.push('actual reference image files are missing');
    for (const file of references) if (!fs.existsSync(path.join(ROOT,file))) blockers.push(`reference image is missing: ${file}`);
  }
  if (stage.hazards?.FLYING?.selectionStatus && !readyValue(stage.hazards.FLYING.selectionStatus)) blockers.push(`FLYING selection is ${stage.hazards.FLYING.selectionStatus}`);
  return blockers;
}

function futureSharedRules(plan) {
  const shared=plan.shared ?? {};
  return {
    profile:{path:catalog.families.landscape.profile,content:read(catalog.families.landscape.profile)},
    hazardProfile:read('docs/asset-profiles/hazard.md'),
    pixelArt:'Match the established crisp pixel-art language; no photorealism, painterly blur, vector-flat redesign, smooth 3D, labels, UI or unrelated assets.',
    landscapeContract:shared.landscapeContract ?? null,
    landscapeSource:shared.landscapeSource ?? null,
    viewport:shared.viewport ?? null,
    surfaceY:shared.surfaceY ?? null,
    landscapeOffsets:shared.landscapeOffsets ?? null,
    landscapeScaleMultipliers:shared.landscapeScaleMultipliers ?? null,
    landscapeAnchors:shared.landscapeAnchors ?? null,
    groundAtlas:shared.proposedGroundAtlas ?? null,
    flyingAtlas:shared.proposedFlyingAtlas ?? null,
    artDirection:shared.artDirectionRequirements ?? null
  };
}

function futureFiles(stage) {
  return {
    FAR:stage.landscapes?.FAR?.path, MID:stage.landscapes?.MID?.path, GROUND:stage.landscapes?.GROUND?.path,
    OBJECT_ATLAS:stage.groundAtlas, FLYING:stage.hazards?.FLYING?.path
  };
}

function futureReadiness(stage,plan=proposal()) {
  const blockers=futureBlockers(plan,stage);
  return {
    target:stage.id, label:stage.label, state:blockers.length?'readiness-pending':'ready',
    generationAllowed:blockers.length===0, blockers,
    approvalStatus:plan.approval?.status ?? 'pending', readiness:plan.readiness ?? {},
    selectionStatus:stage.selectionStatus ?? 'missing', referencesReady:stage.referencesReady === true,
    brief:stage.brief ?? null, files:futureFiles(stage), hazardSelectors
  };
}

export function futurePacket(command, family, stage, words, state, plan=proposal()) {
  const readiness=futureReadiness(stage,plan);
  let selector=words.join(' ').trim().toUpperCase();
  if (family==='hazard' && selector && !hazardSelectors.includes(selector)) throw new Error(`Unknown hazard selector '${selector}'. Use GROUND1, GROUND2 or FLYING.`);
  if (family==='landscape' && selector) selector=layerKey(selector);
  if (family==='stage' && selector) throw new Error(`${command} stage accepts one stage key; omit the asset selector.`);
  const files=futureFiles(stage);
  let planned;
  if (family==='hazard') {
    const selected=selector ? [selector] : hazardSelectors;
    planned=[...new Set(selected.map(value=>value==='FLYING'?'FLYING':'OBJECT_ATLAS'))].map(value=>({
      selector:value, owner:'hazard-worker', output:files[value],
      selectedHazards:value==='OBJECT_ATLAS'?selected.filter(item=>item!=='FLYING'):['FLYING'],
      preserveSibling:value==='OBJECT_ATLAS'&&selected.length===1 ? (selected[0]==='GROUND1'?'GROUND2':'GROUND1') : null,
      task:value==='OBJECT_ATLAS'
        ? {hazards:Object.fromEntries(selected.filter(item=>item!=='FLYING').map(item=>[item,stage.hazards?.[item]])),atlas:plan.shared?.proposedGroundAtlas,brief:{localReference:stage.brief?.localReference,campaignDistinctiveness:stage.brief?.campaignDistinctiveness,intendedRelativeScale:stage.brief?.intendedRelativeScale}}
        : {hazard:stage.hazards?.FLYING,atlas:plan.shared?.proposedFlyingAtlas,brief:{localReference:stage.brief?.localReference,campaignDistinctiveness:stage.brief?.campaignDistinctiveness,intendedRelativeScale:stage.brief?.intendedRelativeScale}}
    }));
  } else if (family==='landscape') {
    planned=(selector?[selector]:layers).map(value=>({selector:value,owner:'landscape-worker',output:files[value],direction:stage.landscapes?.[value]?.direction,
      task:{direction:stage.landscapes?.[value]?.direction,brief:{
        ...(value==='FAR'?{farFocalPoint:stage.brief?.farFocalPoint}:{}),
        ...(value==='MID'?{midLifeDetail:stage.brief?.midLifeDetail}:{}),
        localReference:stage.brief?.localReference,campaignDistinctiveness:stage.brief?.campaignDistinctiveness,intendedRelativeScale:stage.brief?.intendedRelativeScale
      }}}));
  } else {
    planned=[...layers.map(value=>({selector:value,owner:'landscape-worker',output:files[value],direction:stage.landscapes?.[value]?.direction,
      task:{direction:stage.landscapes?.[value]?.direction,brief:{...(value==='FAR'?{farFocalPoint:stage.brief?.farFocalPoint}:{}),...(value==='MID'?{midLifeDetail:stage.brief?.midLifeDetail}:{}),localReference:stage.brief?.localReference,campaignDistinctiveness:stage.brief?.campaignDistinctiveness,intendedRelativeScale:stage.brief?.intendedRelativeScale}}})),
      {selector:'OBJECT_ATLAS',owner:'hazard-worker',output:files.OBJECT_ATLAS,selectedHazards:['GROUND1','GROUND2'],preserveSibling:null,
        task:{hazards:{GROUND1:stage.hazards?.GROUND1,GROUND2:stage.hazards?.GROUND2},atlas:plan.shared?.proposedGroundAtlas,brief:{localReference:stage.brief?.localReference,campaignDistinctiveness:stage.brief?.campaignDistinctiveness,intendedRelativeScale:stage.brief?.intendedRelativeScale}}},
      {selector:'FLYING',owner:'hazard-worker',output:files.FLYING,selectedHazards:['FLYING'],
        task:{hazard:stage.hazards?.FLYING,atlas:plan.shared?.proposedFlyingAtlas,brief:{localReference:stage.brief?.localReference,campaignDistinctiveness:stage.brief?.campaignDistinctiveness,intendedRelativeScale:stage.brief?.intendedRelativeScale}}}];
  }
  for (const job of planned) if (job.preserveSibling) {
    job.task.preserveSibling={selector:job.preserveSibling,hazard:stage.hazards?.[job.preserveSibling],requirement:'Preserve the existing sibling cell bytes and metadata exactly.'};
  }
  const assignments=[
    {owner:'landscape-worker',scope:planned.filter(job=>job.owner==='landscape-worker').map(job=>job.selector),continuityOwner:true},
    {owner:'hazard-worker',scope:planned.filter(job=>job.owner==='hazard-worker').map(job=>job.selector)}
  ].filter(item=>item.scope.length);
  const assetReferenceBlockers=[];
  if (readiness.generationAllowed) for (const job of planned) {
    const refs=referenceFilesFor(stage,job.selector);
    if (!refs.length) assetReferenceBlockers.push(`${job.selector} has no actual reference image files`);
    else for (const file of refs) if (!fs.existsSync(path.join(ROOT,file))) assetReferenceBlockers.push(`${job.selector} reference is missing: ${file}`);
    job.references=refs;
    job.prompt=`${stage.id} ${job.selector}: ${job.direction ?? ''}\n${JSON.stringify(job.task)}`.trim();
  }
  const blockers=[...readiness.blockers,...assetReferenceBlockers];
  const generationAllowed=blockers.length===0;
  const productionCommand=['build','generate','regenerate','revise'].includes(command);
  const approved=stage.status==='approved' || Boolean(state.approvedRevisions?.[stage.id.toLowerCase()]);
  const approvedBuild=approved && ['build','generate'].includes(command);
  const packet={
    command, family, target:stage.id, operation:catalog.commands[command].operation,
    generationAllowed, blockers,
    stageSpec:stage, sharedRules:futureSharedRules(plan), plannedJobs:planned, assignments,
    coordination:{maxWorkers:2,manager:'coordinator',nestedManagers:false,supportModel:'Luna only when needed'},
    readiness:readiness.readiness, selectionStatus:readiness.selectionStatus, referencesReady:readiness.referencesReady,
    message:generationAllowed?'Prerequisites and actual reference pixels are ready.':'No generation may start while any listed prerequisite is pending.'
  };
  if (productionCommand && !generationAllowed) packet.operation='blocked';
  if (approvedBuild) {
    packet.operation='read';
    packet.generationAllowed=false;
    packet.message='Already approved. Explicit regenerate or revise is required to reopen this target.';
  }
  if (productionCommand && generationAllowed && !approvedBuild) {
    packet.jobs=planned;
    packet.protectedOutputs=Object.values(files).filter(Boolean);
    packet.continuityOutputs=layers.map(layer=>files[layer]).filter(Boolean);
    packet.specHash=hashValue(stage);
    packet.specSources=['config/remaining-continent-proposal.json',plan.plan,plan.shared?.landscapeContract,catalog.families.landscape.profile,'docs/asset-profiles/hazard.md'].filter(Boolean);
  }
  return packet;
}

export function continentKey(input) {
  const key = input.toUpperCase();
  return Object.entries(catalog.continents).find(([id, spec]) => id === key || spec.aliases?.includes(key))?.[0];
}
export function stageKey(input) {
  const match = /^([a-z]{2})-?0?([1-3])$/i.exec(input);
  const prefix = match && continentKey(match[1]);
  if (!prefix) throw new Error(`Unknown stage '${input}'. Use help keys; stage numbers are 01, 02, 03.`);
  return `${prefix}0${match[2]}`;
}
function layerKey(input) {
  const key = input.toUpperCase();
  const found = Object.entries(catalog.families.landscape.layers).find(([id, aliases]) => id === key || aliases.includes(key));
  if (!found) throw new Error(`Unknown layer '${input}'. Use FAR, MID or GROUND.`);
  return found[0];
}
function nextStage(prefix,state=workflow()) {
  if (state.activeRunId && state.runs?.[state.activeRunId] && (!prefix || state.runs[state.activeRunId].target.startsWith(prefix))) {
    return {command:'resume',stage:state.runs[state.activeRunId].target};
  }
  if (state.active && (!prefix || state.active.stage.startsWith(prefix))) return {command:'resume', stage:state.active.stage};
  const entry = Object.entries(registry().stages).find(([id, s]) => s.status !== 'approved' && s.scope!=='full-stage' && (!prefix || id.toUpperCase().startsWith(prefix)));
  return entry ? {command:'build landscape', stage:entry[0].toUpperCase()} : null;
}
export function handoff(state=workflow()) {
  const next = nextStage(undefined,state);
  if (next) return `In ${catalog.repository}: ${next.command} ${next.stage}.`;
  try {
    const first=proposal().stages?.find(stage=>stage.status!=='approved'&&!state.approvedRevisions?.[stage.id.toLowerCase()]);
    if (first) return `In ${catalog.repository}: ${futureReadiness(first).generationAllowed?'build stage':'status'} ${first.id}.`;
  } catch {}
  return 'Phase 8 registered landscapes are approved. Complete the required readiness gates before generating other assets.';
}
function stageSummary(id) {
  const planned=futureStage(id);if(planned)return futureReadiness(planned);
  const s = registry().stages[id.toLowerCase()];
  if (!s) {
    const future=futureStage(id);
    if (future) return futureReadiness(future);
  }
  return {stage:id, label:s?.label ?? 'Theme and references not yet specified', state:s?.status ?? 'specification-required',
    layers:s ? Object.fromEntries(Object.entries(s.layers).map(([k,v]) => [k.toUpperCase(), {path:v.validation, exists:fs.existsSync(path.join(ROOT,v.validation))}])) : undefined};
}
export function help(topic = '') {
  const family = Object.entries(catalog.families).find(([id,v]) => id===topic.toLowerCase() || v.aliases?.includes(topic.toLowerCase()));
  if (family && ['hazard','stage'].includes(family[0])) return {family:family[0], ...family[1], selectors:family[0]==='hazard'?hazardSelectors:undefined,
    coordination:catalog.coordination,message:'Future stage assets are discoverable through focused readiness packets. Generation remains blocked until every explicit prerequisite is ready.'};
  if (family && family[0] !== 'landscape') return {family:family[0], ...family[1], message:'Keys and generation profile must be registered from the approved specifications before execution. Existing assets remain locked.'};
  const prefix = continentKey(topic);
  if (/^[a-z]{2}-?0?[1-3]$/i.test(topic)) return stageSummary(stageKey(topic));
  if (topic && !prefix && !family && !['keys','stages','commands'].includes(topic.toLowerCase())) throw new Error(`Unknown help topic '${topic}'. Use help keys.`);
  return {repository:catalog.repository, commands:topic==='keys'||topic==='stages' ? undefined : catalog.commands,
    continents:Object.fromEntries(Object.entries(catalog.continents).filter(([id]) => !prefix || id===prefix).map(([id,v]) => [id,{...v,stages:catalog.stageNumbers.map(n=>`${id}${n}`)}])),
    layerKeys:catalog.families.landscape.layers,
    stages:Object.keys(registry().stages).filter(id=>!prefix||id.toUpperCase().startsWith(prefix)).map(id=>({stage:id.toUpperCase(),label:registry().stages[id].label,status:registry().stages[id].status})),
    families:!prefix ? Object.fromEntries(Object.entries(catalog.families).map(([k,v])=>[k,v.state])) : undefined,
    next:handoff(), note:'Reserved continents are discoverable, not authorized for generation. NAXX is notation; use a concrete key such as NA01.'};
}
function section(text, heading) {
  const marker = `### ${heading}`;
  const start = text.indexOf(marker);
  if (start < 0) throw new Error(`Missing prompt section: ${heading}`);
  const end = text.indexOf('\n##', start + marker.length);
  return text.slice(start, end < 0 ? undefined : end).trim();
}
export function resolve(input, state=workflow()) {
  const words = (Array.isArray(input) ? input.join(' ') : input).trim().split(/\s+/);
  const command = (words.shift() || 'help').toLowerCase();
  if (command === 'help') return help(words.join(' '));
  const def = catalog.commands[command];
  if (!def) throw new Error(`Unknown command '${command}'. Use help.`);
  const familyEntry = Object.entries(catalog.families).find(([id,v]) => id===words[0]?.toLowerCase() || v.aliases?.includes(words[0]?.toLowerCase()));
  const family = familyEntry?.[0] ?? 'landscape';
  if (familyEntry) words.shift();
  const rawTarget = words.shift();
  if (!rawTarget) throw new Error(`${command} requires a stage. Use help keys.`);
  const planned=futureStage(rawTarget);
  if (planned) {
    if (command==='status') return futureReadiness(planned);
    const tail=words.join(' '), colon=tail.indexOf(':');
    const selection=(colon<0?tail:tail.slice(0,colon)).trim();
    const direction=colon<0?'':tail.slice(colon+1).trim();
    if (direction && command!=='revise') throw new Error('Use revise for written change directions.');
    if (command==='revise' && (!selection || !direction)) throw new Error('Use revise hazard AF01 FLYING: describe the requested change.');
    if (!['stage','landscape','hazard'].includes(family)) throw new Error(`${family}: registration required. Use help ${family}.`);
    const effectiveFamily=['resume','publish','approve','rollback','verify'].includes(command)?'stage':family;
    const packet=futurePacket(command,effectiveFamily,planned,selection?[selection]:[],state);
    if (direction) packet.direction=direction;
    if (command==='resume') {
      const active=state.activeRunId ? state.runs?.[state.activeRunId] : null;
      const matches=active?.target===planned.id;
      packet.activeRun=matches ? active.runId : null;
      packet.recovery=matches ? resumeReport(ROOT,active) : {completed:[],missing:[],pending:[],autoRegenerate:false};
      packet.message=matches?'Inspect saved results and recovery evidence. Missing or changed completed jobs must be recovered; they are never regenerated silently.':`No active ${planned.id} work exists. Generation remains blocked by the listed readiness prerequisites.`;
    }
    return packet;
  }
  if (catalog.families[family].state !== 'ready') throw new Error(`${family}: registration required. Use help ${family}.`);
  let id;
  const prefix = continentKey(rawTarget);
  if (prefix) {
    if (command==='status') return help(prefix);
    if (!['build','generate'].includes(command)) throw new Error(`${command} requires one stage, not a continent. Use help ${prefix}.`);
    if (!catalog.continents[prefix].phase8) throw new Error(`${prefix}: outside Phase 8; approved specifications and references are required.`);
    const next = nextStage(prefix,state);
    if (!next) return {state:'approved',message:`${prefix}: all registered stages are approved.`,next:handoff()};
    if (next.command==='resume') return resolve(`resume ${next.stage}`,state);
    id=next.stage;
  } else id=stageKey(rawTarget);
  const stage=registry().stages[id.toLowerCase()];
  if (!stage) {
    if (command==='status') return stageSummary(id);
    throw new Error(`${id}: reserved key; theme, references, asset profile and phase authorization are required before production.`);
  }
  const tail=words.join(' '), colon=tail.indexOf(':');
  const selection=(colon<0?tail:tail.slice(0,colon)).trim();
  const direction=colon<0?'':tail.slice(colon+1).trim();
  const selected=selection ? [layerKey(selection)] : layers;
  if (command==='revise' && (!selection || !direction)) throw new Error('Use revise landscape SA01 MID: describe the requested change.');
  if (direction && command!=='revise') throw new Error('Use revise for written change directions.');
  if (['approve','rollback','resume','status','publish'].includes(command) && selection) throw new Error(`${command} operates on a stage snapshot; omit the layer.`);
  const checkpoint=state.active?.stage===id ? state.active : null;
  if (state.active && state.active.stage!==id && def.operation!=='read') throw new Error(`Active checkpoint is ${state.active.stage}. Resume it or explicitly resolve it before starting ${id}.`);
  const packet={command, family, target:id, operation:def.operation, status:stage.status,
    selectedLayers:selected, scope:selected.map(k=>stage.layers[k.toLowerCase()].validation),
    checkpoint, approvedRevision:state.approvedRevisions[id.toLowerCase()]??null,
    next:handoff(), executor:'agent', instructions:catalog.runbook, generationAllowed:true,
    stageSpec:stage, specHash:hashValue(stage),
    specSources:['config/phase8-landscapes.json','docs/PHASE8_LANDSCAPE_PROMPT_MANIFEST.md',catalog.families.landscape.profile],
    protectedOutputs:Object.values(stage.layers).map(layer=>layer.validation),
    continuityOutputs:Object.values(stage.layers).map(layer=>layer.validation)};
  if (command==='status') return {...stageSummary(id),checkpoint,next:handoff()};
  if (['build','generate'].includes(command) && stage.status==='approved') return {...packet,operation:'read',message:'Already approved. Explicit regenerate or revise is required to reopen this target.'};
  if (['generate','regenerate','revise','build'].includes(command)) {
    const manifest=read('docs/PHASE8_LANDSCAPE_PROMPT_MANIFEST.md');
    const shared=manifest.match(/## Shared Contract[^\n]*\n([\s\S]*?)(?=\n## Layer directives)/)?.[1]?.trim();
    if (!shared) throw new Error('Shared landscape prompt is missing.');
    packet.profile=read(catalog.families.landscape.profile);
    packet.sharedPrompt=shared;
    packet.sharedRules={profile:packet.profile,sharedPrompt:shared};
    packet.jobs=selected.map(layer=>({layer,selector:layer,owner:'landscape-worker',output:stage.layers[layer.toLowerCase()].validation,...stage.layers[layer.toLowerCase()],
      prompt:section(manifest,`${layer} directive`)+'\n\n'+section(manifest,`P8-${id}-${layer} `),
      editingSource:command==='revise'?stage.layers[layer.toLowerCase()].validation:null}));
    packet.direction=direction||null;
    packet.stop='Deployed integrated stage awaiting user visual approval.';
    packet.reopensApprovedAsset=stage.status==='approved';
  }
  if (command==='resume' && checkpoint) {
    packet.localCheckpointMatches=Object.entries(checkpoint.files).every(([p,sha])=>fs.existsSync(path.join(ROOT,p))&&fileHash(p)===sha) && checkpoint.stageSpec===crypto.createHash('sha256').update(JSON.stringify(stage)).digest('hex');
    packet.recovery='Recheck remote heads/recovery branch and file hashes. Resume the next operation; do not regenerate missing work automatically.';
  }
  if (command==='resume' && state.activeRunId && state.runs?.[state.activeRunId]?.target===id) {
    packet.jobRecovery=resumeReport(ROOT,state.runs[state.activeRunId]);
    packet.recovery='Recover missing or changed saved job bytes; resume pending jobs explicitly. Never regenerate a saved completed job silently.';
  }
  return packet;
}

export function checkpoint(stageInput, phase, command) {
  const stage=stageKey(stageInput), id=stage.toLowerCase(), spec=registry().stages[id];
  if (!spec) throw new Error('Only registered stages can be checkpointed.');
  if (!['working','ready-to-publish','awaiting-approval'].includes(phase)) throw new Error('Checkpoint phase must be working, ready-to-publish or awaiting-approval.');
  if (!command) throw new Error('Checkpoint requires the original command as a quoted argument.');
  const packet=resolve(command);
  if (packet.target!==stage || !['produce-and-publish','produce-only','edit-and-publish','publish-only'].includes(packet.operation)) throw new Error('Checkpoint command does not authorize this stage operation.');
  const files=Object.fromEntries(Object.values(spec.layers).filter(v=>fs.existsSync(path.join(ROOT,v.validation))).map(v=>[v.validation,fileHash(v.validation)]));
  if (phase!=='working' && Object.keys(files).length!==3) throw new Error('A publication checkpoint requires all three layers.');
  const current=workflow();
  const saved=updateWorkflowState({statePath:workflowPath,expectedRevision:current.revision,actor:'coordinator',mutate(state) {
    if (state.active && state.active.stage!==stage) throw new Error(`Finish or explicitly abandon ${state.active.stage} before starting another stage.`);
    state.active={stage,phase,command,selectedLayers:packet.selectedLayers,files,stageSpec:crypto.createHash('sha256').update(JSON.stringify(spec)).digest('hex'),
      recoveryBranch:`work/assets/${id}`,baseCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim()};
    return state.active;
  }});
  return {checkpoint:saved.result,revision:saved.state.revision,durable:false,next:'Commit the final assets and this checkpoint, then verify its non-force remote branch update. Local save alone is not durable.'};
}
function run(args) {return execFileSync(process.execPath,args,{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();}
function mutationResult(value) { return {revision:value.state.revision,...value.result}; }
function coordinator(args) {
  const action=args.shift();
  if (action==='start') {
    const expectedRevision=Number(args.shift()), command=args.join(' ').trim();
    if (!command) throw new Error('Use coordinator start <expectedRevision> "<asset command>".');
    const packet=resolve(command,workflow());
    const value=createRun({root:ROOT,statePath:workflowPath,expectedRevision,command,packet,
      baseCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim()});
    return mutationResult(value);
  }
  if (action==='start-job') {
    const [runId,jobId,revision]=args;
    return mutationResult(startJob({root:ROOT,statePath:workflowPath,runId,jobId,expectedRevision:Number(revision)}));
  }
  if (action==='result') {
    const [runId,jobId,revision,manifestPath]=args;
    if (!manifestPath) throw new Error('Use coordinator result <runId> <jobId> <expectedRevision> <result-manifest.json>.');
    const manifest=JSON.parse(fs.readFileSync(path.resolve(ROOT,manifestPath),'utf8'));
    return mutationResult(recordResult({root:ROOT,statePath:workflowPath,runId,jobId,expectedRevision:Number(revision),manifest}));
  }
  if (action==='requeue') {
    const [runId,jobId,revision]=args;
    return mutationResult(requeueJob({root:ROOT,statePath:workflowPath,runId,jobId,expectedRevision:Number(revision)}));
  }
  if (action==='verify-recovery') {
    const [runId,jobId,revision,remoteRef]=args;
    if (!remoteRef) throw new Error('Use coordinator verify-recovery <runId> <jobId> <expectedRevision> <fetchedRemoteRef>.');
    return mutationResult(verifyRecovery({root:ROOT,statePath:workflowPath,runId,jobId,expectedRevision:Number(revision),remoteRef}));
  }
  if (action==='checkpoint') {
    const [runId,phase,revision,recoveryRef]=args;
    return mutationResult(checkpointRun({root:ROOT,statePath:workflowPath,runId,phase,expectedRevision:Number(revision),recoveryRef}));
  }
  if (action==='close') {
    const [runId,revision]=args;
    return mutationResult(closeRun({statePath:workflowPath,runId,expectedRevision:Number(revision)}));
  }
  throw new Error('Coordinator actions: start, start-job, requeue, result, verify-recovery, checkpoint, close.');
}
function main(args) {
  if (args[0]==='handoff') return handoff();
  if (args[0]==='coordinator') return coordinator(args.slice(1));
  if (args[0]==='checkpoint') return checkpoint(args[1],args[2],args.slice(3).join(' '));
  if (args[0]==='check') {
    const stage=stageKey(args[1]||'').toLowerCase();
    const layer=args[2]?layerKey(args[2]).toLowerCase():null;
    run(['scripts/sync-landscape-registry.cjs','--check']);
    run(['scripts/validate-phase8-pngs.js','--stage',stage,...(layer?['--layer',layer]:[])]);
    run(['scripts/landscape-runtime-state.cjs',stage]);
    if(futureStage(stage))run(['scripts/validate-stage-assets.cjs',stage]);
    execFileSync('python',['scripts/phase8-stage-qa.py',stage,'--skip-png',...(layer?['--layer',layer]:[])],{cwd:ROOT,stdio:['ignore','pipe','pipe']});
    return {stage:stage.toUpperCase(),localChecks:'passed',previews:`tmp/phase8-qa/${stage}/`,remaining:'Inspect the composite and repeat previews, then verify the deployed runtime and user acceptance.'};
  }
  return resolve(args);
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {const result=main(process.argv.slice(2));console.log(typeof result==='string'?result:JSON.stringify(result,null,2));}
  catch(error){console.error(error.stderr?.toString().trim()||error.message);process.exitCode=1;}
}
