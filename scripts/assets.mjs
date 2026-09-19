#!/usr/bin/env node
// Chat command resolver and deterministic helpers. Image generation and connected
// publication are performed by the agent, not simulated by this local CLI.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const json = p => JSON.parse(read(p));
export const catalog = json('config/asset-commands.json');
const registry = () => json('config/phase8-landscapes.json');
const workflow = () => json('config/asset-workflow-state.json');
const fileHash = p => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, p))).digest('hex');
const layers = ['FAR', 'MID', 'GROUND'];

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
function nextStage(prefix) {
  const state = workflow();
  if (state.active && (!prefix || state.active.stage.startsWith(prefix))) return {command:'resume', stage:state.active.stage};
  const entry = Object.entries(registry().stages).find(([id, s]) => s.status !== 'approved' && (!prefix || id.toUpperCase().startsWith(prefix)));
  return entry ? {command:'build landscape', stage:entry[0].toUpperCase()} : null;
}
export function handoff() {
  const next = nextStage();
  return next ? `In ${catalog.repository}: ${next.command} ${next.stage}. Follow AGENTS.md.` :
    'Phase 8 registered landscapes are approved. Complete the continent gates; define and approve the next production scope before generating other assets.';
}
function stageSummary(id) {
  const s = registry().stages[id.toLowerCase()];
  return {stage:id, label:s?.label ?? 'Theme and references not yet specified', state:s?.status ?? 'specification-required',
    layers:s ? Object.fromEntries(Object.entries(s.layers).map(([k,v]) => [k.toUpperCase(), {path:v.validation, exists:fs.existsSync(path.join(ROOT,v.validation))}])) : undefined};
}
export function help(topic = '') {
  const family = Object.entries(catalog.families).find(([id,v]) => id===topic.toLowerCase() || v.aliases?.includes(topic.toLowerCase()));
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
  if (catalog.families[family].state !== 'ready') throw new Error(`${family}: registration required. Use help ${family}.`);
  const rawTarget = words.shift();
  if (!rawTarget) throw new Error(`${command} requires a stage. Use help keys.`);
  let id;
  const prefix = continentKey(rawTarget);
  if (prefix) {
    if (command==='status') return help(prefix);
    if (!['build','generate'].includes(command)) throw new Error(`${command} requires one stage, not a continent. Use help ${prefix}.`);
    if (!catalog.continents[prefix].phase8) throw new Error(`${prefix}: outside Phase 8; approved specifications and references are required.`);
    const next = nextStage(prefix);
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
    next:handoff(), executor:'agent', instructions:catalog.runbook};
  if (command==='status') return {...stageSummary(id),checkpoint,next:handoff()};
  if (['build','generate'].includes(command) && stage.status==='approved') return {...packet,operation:'read',message:'Already approved. Explicit regenerate or revise is required to reopen this target.'};
  if (['generate','regenerate','revise','build'].includes(command)) {
    const manifest=read('docs/PHASE8_LANDSCAPE_PROMPT_MANIFEST.md');
    const shared=manifest.match(/## Shared Contract[^\n]*\n([\s\S]*?)(?=\n## Layer directives)/)?.[1]?.trim();
    if (!shared) throw new Error('Shared landscape prompt is missing.');
    packet.profile=read(catalog.families.landscape.profile);
    packet.sharedPrompt=shared;
    packet.jobs=selected.map(layer=>({layer,...stage.layers[layer.toLowerCase()],
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
  const state=workflow();
  if (state.active && state.active.stage!==stage) throw new Error(`Finish or explicitly abandon ${state.active.stage} before starting another stage.`);
  state.active={stage,phase,command,selectedLayers:packet.selectedLayers,files,stageSpec:crypto.createHash('sha256').update(JSON.stringify(spec)).digest('hex'),
    recoveryBranch:`work/assets/${id}`,baseCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim()};
  fs.writeFileSync(path.join(ROOT,'config/asset-workflow-state.json'),JSON.stringify(state,null,2)+'\n');
  return {checkpoint:state.active,durable:false,next:'Commit the final assets and this checkpoint, then verify its non-force remote branch update. Local save alone is not durable.'};
}
function run(args) {return execFileSync(process.execPath,args,{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();}
function main(args) {
  if (args[0]==='handoff') return handoff();
  if (args[0]==='checkpoint') return checkpoint(args[1],args[2],args.slice(3).join(' '));
  if (args[0]==='check') {
    const stage=stageKey(args[1]||'').toLowerCase();
    const layer=args[2]?layerKey(args[2]).toLowerCase():null;
    run(['scripts/sync-landscape-registry.cjs','--check']);
    run(['scripts/validate-phase8-pngs.js','--stage',stage,...(layer?['--layer',layer]:[])]);
    run(['scripts/landscape-runtime-state.cjs',stage]);
    execFileSync('python',['scripts/phase8-stage-qa.py',stage,'--skip-png',...(layer?['--layer',layer]:[])],{cwd:ROOT,stdio:['ignore','pipe','pipe']});
    return {stage:stage.toUpperCase(),localChecks:'passed',previews:`tmp/phase8-qa/${stage}/`,remaining:'Inspect the composite and repeat previews, then verify the deployed runtime and user acceptance.'};
  }
  return resolve(args);
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {const result=main(process.argv.slice(2));console.log(typeof result==='string'?result:JSON.stringify(result,null,2));}
  catch(error){console.error(error.stderr?.toString().trim()||error.message);process.exitCode=1;}
}
