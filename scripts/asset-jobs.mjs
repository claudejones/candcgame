import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const READY_JOB_STATES = new Set(['completed']);
const FAILURE_CLASSES = Object.freeze({
  art:/\b(?:art|style|composition|silhouette|palette|reference|visual)\b/i,
  canvas:/\b(?:canvas|dimension|size|width|height|resolution|crop)\b/i,
  alpha:/\b(?:alpha|transparent|transparency|opaque|background)\b/i,
  anchor:/\b(?:anchor|grounding|baseline|origin|alignment)\b/i,
  access:/\b(?:access|auth|permission|credential|network|fetch|upload)\b/i
});

export const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
export const hashValue = value => sha256(JSON.stringify(value));

function assertRelative(file) {
  if (!file || path.isAbsolute(file) || file.split(/[\\/]/).includes('..')) {
    throw new Error(`Unsafe asset path '${file || ''}'.`);
  }
  return file;
}

export function fileHash(root, file) {
  const relative = assertRelative(file);
  const absolute = path.join(root, relative);
  return fs.existsSync(absolute) ? sha256(fs.readFileSync(absolute)) : null;
}

export function migrateWorkflowState(state) {
  const migrated = structuredClone(state);
  if ((migrated.schemaVersion ?? 1) > 2) throw new Error(`Unsupported workflow schema ${migrated.schemaVersion}.`);
  migrated.schemaVersion = 2;
  migrated.revision = Number.isSafeInteger(migrated.revision) ? migrated.revision : 0;
  migrated.runs ??= {};
  migrated.activeRunId ??= null;
  return migrated;
}

export function readWorkflowState(statePath) {
  return migrateWorkflowState(JSON.parse(fs.readFileSync(statePath, 'utf8')));
}

function packetDirectory(statePath,runId) {
  return path.join(path.dirname(statePath),'asset-workflow-runs',assertRelative(runId));
}

function saveWorkerPacket(statePath,runId,jobId,packet) {
  const bytes=`${JSON.stringify(packet,null,2)}\n`,hash=sha256(bytes);
  const directory=packetDirectory(statePath,runId);
  fs.mkdirSync(directory,{recursive:true});
  const file=path.join(directory,`${jobId.replace(/[^a-z0-9_-]/gi,'_').toLowerCase()}-${hash.slice(0,16)}.json`);
  if(!fs.existsSync(file))atomicWrite(file,packet);
  return {path:path.relative(path.dirname(statePath),file).split(path.sep).join('/'),sha256:hash};
}

function loadWorkerPacket(statePath,job) {
  if(job.workerPacket)return compactWorkerPacket(job.workerPacket); // schema-v2 compatibility
  if(!job.workerPacketRef)throw new Error(`Job ${job.id} has no worker packet.`);
  const file=path.join(path.dirname(statePath),assertRelative(job.workerPacketRef.path));
  const bytes=fs.readFileSync(file);
  if(sha256(bytes)!==job.workerPacketRef.sha256)throw new Error(`Worker packet changed for ${job.id}.`);
  return compactWorkerPacket(JSON.parse(bytes.toString('utf8')));
}

function selectedProfile(sharedRules,owner) {
  if(!sharedRules)return null;
  const profile=owner==='hazard-worker' && sharedRules.hazardProfile!==undefined ? sharedRules.hazardProfile : sharedRules.profile;
  return profile && typeof profile==='object' ? profile : {content:profile};
}

function workerRules(sharedRules,owner) {
  if(!sharedRules)return null;
  const geometryKeys=['landscapeContract','landscapeSource','viewport','surfaceY','landscapeOffsets','landscapeScaleMultipliers','landscapeAnchors','groundAtlas','flyingAtlas','pixelArt','artDirection'];
  const rules={profile:selectedProfile(sharedRules,owner)};
  for(const key of geometryKeys)if(sharedRules[key]!=null)rules[key]=sharedRules[key];
  return rules;
}

export function compactWorkerPacket(packet) {
  const result=structuredClone(packet);
  result.sharedRules=workerRules(packet.sharedRules,packet.owner);
  return result;
}

function sourceKey(source) {
  return typeof source==='string'?source:`${source.path}#${(source.select??[]).join(',')}`;
}

function selectJson(value,selector) {
  return String(selector).split('.').filter(Boolean).reduce((current,key)=>current?.[key],value);
}

function sourceHash(root,source) {
  if(typeof source==='string')return fileHash(root,source);
  const file=assertRelative(source.path);
  if(!fs.existsSync(path.join(root,file)))return null;
  const value=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
  return hashValue((source.select??[]).map(selector=>[selector,selectJson(value,selector)]));
}

function atomicWrite(file, value) {
  const directory = path.dirname(file);
  const temporary = path.join(directory, `.${path.basename(file)}.${process.pid}.${crypto.randomBytes(6).toString('hex')}.tmp`);
  const data = `${JSON.stringify(value, null, 2)}\n`;
  const handle = fs.openSync(temporary, 'wx', 0o644);
  try {
    fs.writeFileSync(handle, data);
    fs.fsyncSync(handle);
  } finally {
    fs.closeSync(handle);
  }
  fs.renameSync(temporary, file);
  const directoryHandle = fs.openSync(directory, 'r');
  try { fs.fsyncSync(directoryHandle); } finally { fs.closeSync(directoryHandle); }
}

export function updateWorkflowState({statePath, expectedRevision, actor, mutate}) {
  if (actor !== 'coordinator') throw new Error('Only the coordinator may write workflow checkpoints.');
  const lockPath = `${statePath}.lock`;
  let lock;
  try {
    lock = fs.openSync(lockPath, 'wx', 0o600);
  } catch (error) {
    if (error.code === 'EEXIST') throw new Error(`Workflow state is locked: ${lockPath}`);
    throw error;
  }
  try {
    const current = readWorkflowState(statePath);
    if (!Number.isSafeInteger(expectedRevision) || current.revision !== expectedRevision) {
      throw new Error(`Stale workflow revision: expected ${expectedRevision}, current ${current.revision}.`);
    }
    const next = structuredClone(current);
    const result = mutate(next, current);
    next.revision = current.revision + 1;
    next.schemaVersion = 2;
    atomicWrite(statePath, next);
    return {state: next, result};
  } finally {
    if (lock !== undefined) fs.closeSync(lock);
    fs.rmSync(lockPath, {force: true});
  }
}

export function compactWorkflowState({statePath,expectedRevision}) {
  return updateWorkflowState({statePath,expectedRevision,actor:'coordinator',mutate(state){
    let packets=0,bytesRemoved=0;
    for(const run of Object.values(state.runs??{}))for(const job of Object.values(run.jobs??{})){
      if(!job.workerPacket)continue;
      const packet=job.workerPacket;
      bytesRemoved+=JSON.stringify(job.workerPacket).length;
      job.workerPacketRef=saveWorkerPacket(statePath,run.runId,job.id,packet);
      delete job.workerPacket;
      packets++;
    }
    return {packets,bytesRemoved,preservedRuns:Object.keys(state.runs??{}).length,preservedApprovals:Object.keys(state.approvedRevisions??{}).length};
  }});
}

function normalizedReferences(job) {
  const candidates = [job.reference, ...(job.references ?? [])].filter(Boolean);
  return [...new Set(candidates.map(assertRelative))];
}

function normalizeJob(root, statePath, runId, target, job, allOutputs, continuityOutputs, specHash, specSourceHashes, specSources, sharedRules, direction, baseCommit) {
  const output = assertRelative(job.output ?? job.validation ?? job.path);
  const selector = String(job.selector ?? job.layer ?? job.asset ?? path.basename(output)).toUpperCase();
  const id = String(job.id ?? `${target}:${selector}`).toUpperCase();
  const references = normalizedReferences(job);
  if (references.length === 0) throw new Error(`Job ${id} requires actual reference image files.`);
  const referenceHashes = Object.fromEntries(references.map(file => [file, fileHash(root, file)]));
  const missingReference = Object.entries(referenceHashes).find(([, hash]) => hash === null);
  if (missingReference) throw new Error(`Missing reference for ${id}: ${missingReference[0]}.`);
  const owner = job.owner ?? (['FAR', 'MID', 'GROUND'].includes(selector) ? 'landscape-worker' : 'hazard-worker');
  const baseHash = fileHash(root, output);
  const workerPacket = {
    runId, jobId: id, target, selector, owner, output, baseCommit, baseHash, specHash,
    referenceHashes, sharedRules:workerRules(sharedRules,owner),
    prompt: job.prompt ?? null,
    direction: job.direction ?? direction ?? null,
    task:job.task ?? null,
    selectedHazards:job.selectedHazards ?? null,
    preserveSibling:job.preserveSibling ?? null,
    editingSource:job.editingSource ?? null,
    continuityFiles: owner === 'landscape-worker' ? continuityOutputs.filter(file => file !== output) : []
  };
  const workerPacketRef=saveWorkerPacket(statePath,runId,id,workerPacket);
  return {
    id, runId, selector, owner, output, baseHash, specHash,
    specSourceHashes: {...specSourceHashes}, specSources:structuredClone(specSources), referenceHashes,
    siblingHashes: Object.fromEntries(allOutputs.filter(file => file !== output).map(file => [file, fileHash(root, file)])),
    workerPacketRef,
    attempts: 0, dispatches: 0, interruptions: 0, status: 'pending', resultHash: null, recoveryRef: null
  };
}

function verifyStaticInputs(root, job) {
  for (const [file, expected] of Object.entries(job.referenceHashes)) {
    if (fileHash(root, file) !== expected) throw new Error(`Stale reference for ${job.id}: ${file}.`);
  }
  const sources=job.specSources??Object.keys(job.specSourceHashes);
  for (const source of sources) {
    const key=sourceKey(source),expected=job.specSourceHashes[key];
    if (sourceHash(root,source) !== expected) throw new Error(`Stale specification for ${job.id}: ${key}.`);
  }
}

function expectedSiblingHash(run, file, fallback) {
  const owner = Object.values(run.jobs).find(job => job.output === file);
  return owner ? (owner.status === 'completed' ? owner.resultHash : owner.baseHash) : fallback;
}

function verifySiblings(root, run, job) {
  for (const file of Object.keys(job.siblingHashes)) {
    const actual = fileHash(root, file);
    const expected = expectedSiblingHash(run, file, job.siblingHashes[file]);
    if (actual !== expected) {
      throw new Error(`Unowned output changed while completing ${job.id}: ${file}.`);
    }
  }
}

export function createRun({root, statePath, expectedRevision, command, packet, baseCommit = null, now = new Date()}) {
  if (packet.generationAllowed === false || packet.operation === 'blocked') {
    throw new Error(`${packet.target ?? 'Target'} generation is blocked: ${(packet.blockers ?? ['prerequisites pending']).join('; ')}`);
  }
  if (!packet.target || !Array.isArray(packet.jobs) || packet.jobs.length === 0) throw new Error('Coordinator start requires a runnable generation packet.');
  const outputs = packet.jobs.map(job => assertRelative(job.output ?? job.validation ?? job.path));
  const protectedOutputs = [...new Set((packet.protectedOutputs ?? outputs).map(assertRelative))];
  const continuityOutputs = [...new Set((packet.continuityOutputs ?? packet.jobs.filter(job=>job.owner==='landscape-worker').map(job=>job.output ?? job.validation ?? job.path)).map(assertRelative))];
  if (new Set(outputs).size !== outputs.length) throw new Error('Each asset job must own one unique output file.');
  const runId = `${packet.target.toLowerCase()}-${now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${crypto.randomBytes(3).toString('hex')}`;
  const specHash = packet.specHash ?? hashValue(packet.stageSpec ?? {target: packet.target, selectedLayers: packet.selectedLayers, direction: packet.direction});
  const specSources=[];
  for(const source of packet.specSources??[]){
    const normalized=typeof source==='string'?assertRelative(source):{path:assertRelative(source.path),select:[...(source.select??[])]};
    if(!specSources.some(item=>sourceKey(item)===sourceKey(normalized)))specSources.push(normalized);
  }
  const specSourceHashes = Object.fromEntries(specSources.map(source => [sourceKey(source), sourceHash(root,source)]));
  const missingSpec = Object.entries(specSourceHashes).find(([, hash]) => hash === null);
  if (missingSpec) throw new Error(`Missing specification source: ${missingSpec[0]}.`);
  return updateWorkflowState({statePath, expectedRevision, actor: 'coordinator', mutate(state) {
    if (state.activeRunId) throw new Error(`Active coordinator run is ${state.activeRunId}.`);
    if (state.active && state.active.stage !== packet.target) throw new Error(`Legacy active checkpoint is ${state.active.stage}.`);
    const jobs = Object.fromEntries(packet.jobs.map(job => {
      const normalized = normalizeJob(root, statePath, runId, packet.target, job, protectedOutputs, continuityOutputs, specHash, specSourceHashes, specSources, packet.sharedRules ?? null, packet.direction, baseCommit);
      return [normalized.id, normalized];
    }));
    state.runs[runId] = {
      runId, target: packet.target, command, operation: packet.operation,
      status: 'working', baseCommit, specHash, createdAt: now.toISOString(),
      maxWorkers: 2, nestedManagers: false, recoveryRefs: [], jobs
    };
    state.activeRunId = runId;
    return {runId, jobs: Object.keys(jobs)};
  }});
}

export function startJob({root, statePath, expectedRevision, runId, jobId}) {
  return updateWorkflowState({statePath, expectedRevision, actor: 'coordinator', mutate(state) {
    const run = state.runs[runId];
    const job = run?.jobs[jobId.toUpperCase()];
    if (!run || !job) throw new Error(`Unknown job ${runId}/${jobId}.`);
    if (job.status !== 'pending') throw new Error(`${job.id} is ${job.status}; it cannot be started again.`);
    const running=Object.values(run.jobs).filter(candidate=>candidate.status==='running');
    if (running.length >= run.maxWorkers) throw new Error(`Run ${runId} already has ${run.maxWorkers} active workers.`);
    if (running.some(candidate=>candidate.owner===job.owner)) throw new Error(`${job.owner} already has a running job; one owner may run only one job at a time.`);
    verifyStaticInputs(root, job);
    verifySiblings(root, run, job);
    const currentOutput = fileHash(root, job.output);
    if (currentOutput !== job.baseHash) throw new Error(`Owned output changed before ${job.id} started: ${job.output}.`);
    job.dispatches += 1;
    job.status = 'running';
    return {runId, jobId: job.id, owner: job.owner, output: job.output, dispatch: job.dispatches, packet: loadWorkerPacket(statePath,job)};
  }});
}

export function workerBrief({statePath,runId,jobId}) {
  const state=readWorkflowState(statePath),run=state.runs?.[runId],job=run?.jobs?.[String(jobId).toUpperCase()];
  if(!run||!job)throw new Error(`Unknown job ${runId}/${jobId}.`);
  return loadWorkerPacket(statePath,job);
}

export function classifyFailure(detail='') {
  return Object.entries(FAILURE_CLASSES).find(([,pattern])=>pattern.test(detail))?.[0]??'technical';
}

export function recordFailure({statePath,expectedRevision,runId,jobId,detail,classification=null}) {
  return updateWorkflowState({statePath,expectedRevision,actor:'coordinator',mutate(state){
    const run=state.runs?.[runId],job=run?.jobs?.[String(jobId).toUpperCase()];
    if(!run||!job)throw new Error(`Unknown job ${runId}/${jobId}.`);
    if(job.status!=='running')throw new Error(`${job.id} is ${job.status}; only a running job can record a failure.`);
    const kind=classification??classifyFailure(detail);
    if(![...Object.keys(FAILURE_CLASSES),'technical'].includes(kind))throw new Error(`Unknown failure classification '${kind}'.`);
    job.failures??={};job.failures[kind]=(job.failures[kind]??0)+1;
    job.lastFailure={classification:kind,detail:String(detail),at:new Date().toISOString()};
    job.status='pending';
    const repeated=job.failures[kind]>=2;
    job.nextAction=repeated?'diagnose-or-approved-finishing':'retry-after-correction';
    return {runId,jobId:job.id,classification:kind,count:job.failures[kind],repeated,nextAction:job.nextAction,autoAccept:false,relaxStandards:false};
  }});
}

export function requeueJob({root, statePath, expectedRevision, runId, jobId}) {
  return updateWorkflowState({statePath, expectedRevision, actor:'coordinator',mutate(state) {
    const run=state.runs[runId];
    const job=run?.jobs[jobId.toUpperCase()];
    if (!run || !job) throw new Error(`Unknown job ${runId}/${jobId}.`);
    if (job.status !== 'running') throw new Error(`${job.id} is ${job.status}; only an interrupted running job can be requeued.`);
    verifyStaticInputs(root,job);
    verifySiblings(root,run,job);
    if (fileHash(root,job.output) !== job.baseHash) throw new Error(`${job.id} has changed output bytes; recover or submit them instead of requeueing generation.`);
    job.status='pending';
    job.interruptions=(job.interruptions ?? 0)+1;
    return {runId,jobId:job.id,status:'pending',interruptions:job.interruptions,autoRegenerate:false};
  }});
}

function assertManifest(job, run, runId, manifest) {
  if (!manifest || typeof manifest !== 'object') throw new Error('Result requires a worker result manifest.');
  const required = ['runId', 'jobId', 'path', 'sha256', 'baseCommit', 'baseHash', 'specHash', 'referenceHashes', 'attempts'];
  const missing = required.filter(key => !(key in manifest));
  if (missing.length) throw new Error(`Result manifest is missing: ${missing.join(', ')}.`);
  if (manifest.runId !== runId || String(manifest.jobId).toUpperCase() !== job.id || manifest.path !== job.output) {
    throw new Error(`Result manifest does not own ${runId}/${job.id}/${job.output}.`);
  }
  if (manifest.baseHash !== job.baseHash || manifest.specHash !== job.specHash || hashValue(manifest.referenceHashes) !== hashValue(job.referenceHashes)) {
    throw new Error(`Result manifest has stale base/spec/reference hashes for ${job.id}.`);
  }
  if (manifest.baseCommit !== run.baseCommit) throw new Error(`Result manifest has stale baseCommit for ${job.id}.`);
  if (!Number.isSafeInteger(manifest.attempts) || manifest.attempts < 1) throw new Error(`Result manifest attempts must be a positive integer for ${job.id}.`);
}

function gitBlobHash(root, commit, file) {
  try {
    const bytes = execFileSync('git', ['show', `${commit}:${file}`], {cwd: root, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer:32*1024*1024});
    return sha256(bytes);
  } catch {
    return null;
  }
}

function normalizeRecoveryEvidence(root, output, recovery, resultHash) {
  if (!recovery) return null;
  if (recovery.verified === true || recovery.remoteRefVerified === true) {
    throw new Error('A worker result cannot claim remote recovery verification; the coordinator must verify the fetched remote ref.');
  }
  const evidence = {
    ref: recovery.ref ?? null,
    commit: recovery.commit ?? null,
    contentHash: recovery.contentHash ?? null,
    localCommitVerified: false,
    remoteRefVerified: false,
    verifiedAt: null
  };
  if (evidence.commit || evidence.contentHash) {
    if (!/^[0-9a-f]{40}$/i.test(evidence.commit ?? '') || evidence.contentHash !== resultHash || gitBlobHash(root, evidence.commit, output) !== resultHash) {
      throw new Error('Recovery evidence must identify an immutable local commit whose path bytes match the result hash.');
    }
    evidence.localCommitVerified = true;
  }
  return evidence;
}

export function recordResult({root, statePath, expectedRevision, runId, jobId, manifest}) {
  return updateWorkflowState({statePath, expectedRevision, actor: 'coordinator', mutate(state) {
    const run = state.runs[runId];
    const job = run?.jobs[jobId.toUpperCase()];
    if (!run || !job) throw new Error(`Unknown job ${runId}/${jobId}.`);
    if (job.status !== 'running') throw new Error(`${job.id} is ${job.status}; start-job is required before result.`);
    assertManifest(job, run, runId, manifest);
    verifyStaticInputs(root, job);
    verifySiblings(root, run, job);
    const resultHash = fileHash(root, job.output);
    if (!resultHash) throw new Error(`Missing owned output for ${job.id}: ${job.output}.`);
    if (manifest.sha256 !== resultHash) throw new Error(`Result manifest hash does not match ${job.output}.`);
    const recoveryEvidence = normalizeRecoveryEvidence(root, job.output, manifest.recovery, resultHash);
    job.status = 'completed';
    job.attempts += manifest.attempts;
    job.resultHash = resultHash;
    job.recoveryRef = recoveryEvidence?.ref ?? null;
    job.recoveryEvidence = recoveryEvidence;
    job.durable = false;
    job.completedAt = new Date().toISOString();
    if (recoveryEvidence?.ref && !run.recoveryRefs.includes(recoveryEvidence.ref)) run.recoveryRefs.push(recoveryEvidence.ref);
    return {runId, jobId: job.id, resultHash, recoveryEvidence, durable: job.durable};
  }});
}

export function verifyRecovery({root, statePath, expectedRevision, runId, jobId, remoteRef}) {
  if (!/^refs\/remotes\/[^/]+\/(?!HEAD$).+/.test(remoteRef ?? '')) {
    throw new Error('Recovery verification requires an explicit fetched remote-tracking ref, not HEAD, a local branch or a raw commit.');
  }
  return updateWorkflowState({statePath, expectedRevision, actor: 'coordinator', mutate(state) {
    const run = state.runs[runId];
    const job = run?.jobs[jobId.toUpperCase()];
    if (!run || !job) throw new Error(`Unknown job ${runId}/${jobId}.`);
    if (job.status !== 'completed' || !job.recoveryEvidence?.localCommitVerified) {
      throw new Error(`${job?.id ?? jobId} has no locally verified immutable recovery commit.`);
    }
    let remoteCommit;
    try {
      remoteCommit = execFileSync('git', ['rev-parse', '--verify', remoteRef], {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).trim();
    } catch {
      throw new Error(`Recovery ref is not present in the fetched repository: ${remoteRef}.`);
    }
    if (remoteCommit !== job.recoveryEvidence.commit || gitBlobHash(root, remoteCommit, job.output) !== job.resultHash) {
      throw new Error(`Recovery ref ${remoteRef} does not preserve ${job.output} at the recorded commit/hash.`);
    }
    job.recoveryEvidence.ref = remoteRef;
    job.recoveryEvidence.remoteRefVerified = true;
    job.recoveryEvidence.verifiedAt = new Date().toISOString();
    job.recoveryRef = remoteRef;
    job.durable = true;
    if (!run.recoveryRefs.includes(remoteRef)) run.recoveryRefs.push(remoteRef);
    return {runId, jobId: job.id, durable: true, recoveryEvidence: job.recoveryEvidence};
  }});
}

export function resumeReport(root, run) {
  const report = {completed: [], failedQaCleanup: [], missing: [], pending: [], autoRegenerate: false};
  if (!run) return report;
  for (const job of Object.values(run.jobs)) {
    if(job.status==='failed-qa-cleanup'){report.failedQaCleanup.push(job.id);continue;}
    const actual = fileHash(root, job.output);
    let staleInput=null;
    try { verifyStaticInputs(root,job); } catch(error) { staleInput=error.message; }
    if (staleInput) report.missing.push({job:job.id,path:job.output,reason:'stale-input',detail:staleInput,recoveryRef:job.recoveryRef});
    else if (READY_JOB_STATES.has(job.status) && actual === job.resultHash) report.completed.push(job.id);
    else if (READY_JOB_STATES.has(job.status)) report.missing.push({job: job.id, path: job.output, reason: actual ? 'changed' : 'missing', recoveryRef: job.recoveryRef});
    else report.pending.push(job.id);
  }
  return report;
}

export function closeRun({statePath, expectedRevision, runId}) {
  return updateWorkflowState({statePath, expectedRevision, actor:'coordinator', mutate(state) {
    const run=state.runs[runId];
    if (!run) throw new Error(`Unknown run ${runId}.`);
    if (state.activeRunId !== runId) throw new Error(`${runId} is not the active run.`);
    if (!['awaiting-approval','asset-ready'].includes(run.status)) throw new Error(`Run ${runId} must be awaiting-approval or asset-ready before closeout.`);
    const approved=run.status==='awaiting-approval';
    run.status=approved?'approved':'ready-for-calibration';
    run.closedAt=new Date().toISOString();
    state.activeRunId=null;
    return {runId,status:run.status,activeRunId:null};
  }});
}

export function checkpointRun({root, statePath, expectedRevision, runId, phase, recoveryRef = null, handoffPath = null, handoffRecoveryRef = null}) {
  const phases = new Set(['working', 'ready-to-publish', 'asset-ready', 'awaiting-approval']);
  if (!phases.has(phase)) throw new Error('Checkpoint phase must be working, ready-to-publish, asset-ready or awaiting-approval.');
  return updateWorkflowState({statePath, expectedRevision, actor: 'coordinator', mutate(state) {
    const run = state.runs[runId];
    if (!run) throw new Error(`Unknown run ${runId}.`);
    const report = resumeReport(root, run);
    if (phase !== 'working' && (report.missing.length || report.pending.length || report.failedQaCleanup.length)) {
      throw new Error(`${phase} requires every saved job: ${report.missing.length} missing/changed, ${report.pending.length} pending, ${report.failedQaCleanup.length} failed-QA cleanup.`);
    }
    if (phase === 'asset-ready' || phase === 'awaiting-approval') {
      const nonDurable = Object.values(run.jobs).filter(job => !job.durable).map(job => job.id);
      if (nonDurable.length) throw new Error(`${phase} requires verified remote recovery evidence for: ${nonDurable.join(', ')}.`);
    }
    if (phase === 'asset-ready') {
      if (!handoffPath) throw new Error('asset-ready requires a validated handoff path.');
      const relative=assertRelative(handoffPath),hash=fileHash(root,relative);
      if (!hash) throw new Error(`asset-ready handoff is missing: ${relative}.`);
      if(!/^refs\/remotes\/[^/]+\/(?!HEAD$).+/.test(handoffRecoveryRef??''))throw new Error('asset-ready requires an explicit fetched remote-tracking ref for the handoff bundle.');
      let commit;
      try{commit=execFileSync('git',['rev-parse','--verify',handoffRecoveryRef],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}
      catch{throw new Error(`Handoff recovery ref is not present in the fetched repository: ${handoffRecoveryRef}.`);}
      if(gitBlobHash(root,commit,relative)!==hash)throw new Error(`Handoff recovery ref ${handoffRecoveryRef} does not preserve ${relative} at the recorded hash.`);
      run.handoff={path:relative,sha256:hash,recoveryRef:handoffRecoveryRef,commit,remoteRefVerified:true};
    }
    if (recoveryRef && !run.recoveryRefs.includes(recoveryRef)) run.recoveryRefs.push(recoveryRef);
    run.status = phase;
    run.updatedAt = new Date().toISOString();
    return {runId, phase, recoveryRefs: run.recoveryRefs, ...report};
  }});
}
