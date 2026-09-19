import {FrameDraft,FRAME_FORMAT,FRAME_STORAGE_KEY} from './frame-editor.mjs';
import {Draft,FORMAT,STORAGE_KEY,same} from './model.mjs';
import {DESIGN_FORMAT,DESIGN_STORAGE_KEY,LAYERS} from './landscape.mjs';
import {placementDefaults,validatePlacement} from './scene-model.mjs';
import {calibrationDefaults,validateCalibration} from './calibration-settings.mjs';

export const PREVIOUS_PROJECT_FORMAT='cc-workbench-next-project-v4';
export const PRE_CALIBRATION_FORMAT='cc-workbench-next-project-v5';
export const PROJECT_FORMAT='cc-workbench-next-project-v6';
export const PROJECT_STORAGE_KEY=PROJECT_FORMAT;
export const RECOVERY_KEY='cc-workbench-next-before-import-v4';
export const UNREADABLE_KEY='cc-workbench-next-unreadable-save-v4';
export const ARTWORK_RECOVERY_KEY='cc-workbench-next-before-artwork-refresh-v4';
export const MAX_IMPORT_BYTES=2*1024*1024;
const clone=value=>structuredClone(value);
function keys(value,allowed,required=allowed) {
  if(!value || typeof value!=='object' || Array.isArray(value) || Object.keys(value).some(key=>!allowed.includes(key)) || required.some(key=>!Object.hasOwn(value,key)))throw new Error('Configuration has missing or unsupported fields.');
}
function validateShape(payload) {
  if(payload?.format===FORMAT) {keys(payload,['format','baseline','purpose','crops'],['format','baseline','crops']);return;}
  const allowed=['format','purpose','sprites','landscapeRevision','landscapes'];
  if(payload?.format===FRAME_FORMAT)allowed.push('frames','atlasDimensions');
  else if(payload?.format!==DESIGN_FORMAT)throw new Error('Choose an exported Workbench Next project. Production game configs use a different format.');
  keys(payload,allowed,allowed.filter(key=>key!=='purpose'));
  keys(payload.sprites,['format','baseline','purpose','crops'],['format','baseline','crops']);
}
export function projectProvenance(catalog,sprites,landscapes) {
  const ids=[...new Set([...sprites.map(item=>item.asset),...landscapes.flatMap(item=>Object.values(item.sources)),'clouds'])].sort();
  return {repository:'claudejones/candcgame',branch:'editor-next',baseline:catalog.baseline,
    assets:Object.fromEntries(ids.map(id=>[id,{...catalog.dimensions[id],sha256:catalog.hashes[id]}]))};
}
function snapshot(draft){return {crops:clone(draft.value),frames:clone(draft.frames),landscapes:clone(draft.landscapes),placement:clone(draft.placement||{}),calibration:clone(draft.calibration||{})};}
function install(draft,value){draft.value=clone(value.crops);draft.frames=clone(value.frames);draft.landscapes=clone(value.landscapes);draft.placement=clone(value.placement||{});draft.calibration=clone(value.calibration||{});}
export function changesBetween(before,after,items) {
  const rows=[];
  const diff=(scope,element,a,b)=>{for(const field of Object.keys(a))if(!same(a[field],b[field]))rows.push({scope,element,field,before:a[field],after:b[field]});};
  for(const [id,item] of items)for(let frame=0;frame<item.frames;frame++) {
    const scope=item.type==='character'?`${item.name} / ${item.state}`:`${item.stage.toUpperCase()} / ${item.name}`;
    diff(scope,`Frame ${frame+1} boundary`,before.frames[id][frame],after.frames[id][frame]);
    diff(scope,`Frame ${frame+1} crop`,before.crops[id][frame],after.crops[id][frame]);
  }
  for(const stage of Object.keys(before.landscapes))for(const layer of LAYERS)diff(stage.toUpperCase(),`${layer.toUpperCase()} landscape`,before.landscapes[stage][layer],after.landscapes[stage][layer]);
  for(const id of Object.keys(before.placement||{})) {
    const [kind,a,b]=id.split(':'),item=items.get(id);
    const scope=kind==='grounding'?`${a.toUpperCase()} / ${b} grounding`:item?item.type==='hazard'?`${item.stage.toUpperCase()} / ${item.name}`:`${item.name} / ${item.state}`:`${a[0].toUpperCase()+a.slice(1)} / shared`;
    diff(scope,'Placement',before.placement[id],after.placement[id]);
  }
  function walk(a,b,path=[]){for(const key of new Set([...Object.keys(a||{}),...Object.keys(b||{})])){if(same(a?.[key],b?.[key]))continue;if(a?.[key]&&b?.[key]&&typeof a[key]==='object'&&!Array.isArray(a[key]))walk(a[key],b[key],[...path,key]);else rows.push({scope:'Calibration / '+path.join(' / '),element:'Automation',field:key,before:a?.[key],after:b?.[key]});}}
  walk(before.calibration,after.calibration);
  return rows;
}

export class ProjectDraft extends FrameDraft {
  constructor(items,landscapes,dimensions,provenance,migrations=[],config=null) {
    super(items,landscapes,dimensions);this.provenance=clone(provenance);this.migrations=clone(migrations);this.savedAt=null;this.expectedRaw=null;this.unreadable=false;
    this.placementBaseline=placementDefaults(config,items);this.placement=clone(this.placementBaseline);this.savedPlacement=clone(this.placement);this.config=config;this.calibrationBaseline=calibrationDefaults(this.placement,landscapes,config);this.calibration=clone(this.calibrationBaseline);this.savedCalibration=clone(this.calibration);
  }
  get dirty(){return super.dirty || !same(this.placement,this.savedPlacement)||!same(this.calibration,this.savedCalibration);}
  editPlacement(id,value){
    validatePlacement({...this.placement,[id]:value},this.placementBaseline);
    if(same(value,this.placement[id]))return;
    const beforeCalibration=clone(this.calibration);if(this.calibration.hazards[id])for(const k of Object.keys(value))if(value[k]!==this.placement[id][k]&&!this.calibration.hazards[id].locks.includes(k))this.calibration.hazards[id].locks.push(k);
    this.past.push({kind:'placement',id,before:clone(this.placement[id]),after:clone(value),beforeCalibration,afterCalibration:clone(this.calibration)});this.future=[];this.placement[id]=clone(value);
  }
  editCalibration(value,placements=this.placement){
    validatePlacement(placements,this.placementBaseline);validateCalibration(value,this.calibrationBaseline,placements);
    const before=snapshot(this),after={...before,placement:clone(placements),calibration:clone(value)};if(same(before,after))return;
    this.past.push({kind:'project',before,after});this.future=[];install(this,after);
  }
  export(){return {format:PROJECT_FORMAT,purpose:'All editable Workbench Next settings. Artwork stays in the project; Test/Game configuration integration is pending.',provenance:clone(this.provenance),placement:clone(this.placement),calibration:clone(this.calibration),design:super.export()};}
  decode(payload) {
    let design=payload,legacy=true,migration=null;
    const supported=this.migrations.filter(item=>same(item.toProvenance,this.provenance));
    if([PROJECT_FORMAT,PRE_CALIBRATION_FORMAT,PREVIOUS_PROJECT_FORMAT].includes(payload?.format)) {
      const fields=['format','purpose','provenance','design','savedAt'],required=['format','provenance','design'];
      if([PROJECT_FORMAT,PRE_CALIBRATION_FORMAT].includes(payload.format)){fields.push('placement');required.push('placement');}
      if(payload.format===PROJECT_FORMAT){fields.push('calibration');required.push('calibration');}
      keys(payload,fields,required);
      if(!same(payload.provenance,this.provenance)) {
        migration=supported.find(item=>same(item.fromProvenance,payload.provenance));
        if(!migration)throw new Error('This project uses different artwork or source defaults. Keep the file for a compatible editor; nothing has been changed.');
      }
      if(payload.savedAt!==undefined && (typeof payload.savedAt!=='string' || !Number.isFinite(Date.parse(payload.savedAt))))throw new Error('Saved date is invalid.');
      design=payload.design;legacy=false;
      if(design?.format!==FRAME_FORMAT)throw new Error('Project configuration version is invalid.');
    }
    validateShape(design);
    if(legacy && design.format!==FORMAT && !same(design.landscapeRevision,this.landscapeRevision))migration=supported.find(item=>same(item.landscapeRevision,design.landscapeRevision) && (design.format===DESIGN_FORMAT || same(item.atlasDimensions,design.atlasDimensions)));
    const definitions=migration?this.definitions.map(item=>({...item,baseline:migration.landscapeRevision[item.stage].baseline,revision:migration.landscapeRevision[item.stage].revision})):this.definitions;
    const candidate=new FrameDraft([...this.items.values()],definitions,migration?.atlasDimensions||this.dimensions);
    if(design.format===FORMAT) {
      const sprites=new Draft([...this.items.values()]);sprites.restore(design);
      candidate.value=clone(sprites.value);
    }else candidate.restore(design);
    const notes=[];
    if(legacy)notes.push('Older draft: source hashes were not recorded. Available baseline, frame and landscape checks passed.');
    if(design.format===DESIGN_FORMAT || design.format===FORMAT)notes.push('This older file has no atlas boundary edits. Boundaries will use the baseline; any resets appear below.');
    if(design.format===FORMAT)notes.push('This sprite-only file has no landscapes. Landscape values will use the baseline; any resets appear below.');
    if(migration) {
      const updated=[];
      for(const stage of Object.keys(this.landscapeBaseline)) {
        const before=migration.landscapeRevision[stage];
        if(same(before,this.landscapeRevision[stage]))continue;
        updated.push(stage.toUpperCase());
        for(const layer of LAYERS)for(const field of Object.keys(before.baseline[layer])) {
          // Adopt new defaults only where the user left the old default unchanged.
          if(candidate.landscapes[stage][layer][field]===before.baseline[layer][field])candidate.landscapes[stage][layer][field]=this.landscapeBaseline[stage][layer][field];
        }
      }
      const converted={...candidate.export(),landscapeRevision:clone(this.landscapeRevision),atlasDimensions:clone(this.dimensions)};
      const check=new FrameDraft([...this.items.values()],this.definitions,this.dimensions);check.restore(converted);
      notes.push(`Landscape artwork updated for ${updated.join(' and ')}. Untouched settings now use the new baseline defaults; your custom adjustments and all sprite edits are retained. Review adjusted landscapes with the new artwork; see Source & status for artwork approval.`);
    }
    candidate.placement=[PROJECT_FORMAT,PRE_CALIBRATION_FORMAT].includes(payload?.format)?clone(validatePlacement(payload.placement,this.placementBaseline)):clone(this.placementBaseline);
    candidate.calibration=payload?.format===PROJECT_FORMAT?clone(validateCalibration(payload.calibration,this.calibrationBaseline,candidate.placement)):calibrationDefaults(candidate.placement,this.definitions,this.config);
    if(payload?.format!==PROJECT_FORMAT)for(const [id,h] of Object.entries(candidate.calibration.hazards))h.locks=Object.keys(candidate.placement[id]).filter(k=>candidate.placement[id][k]!==this.placementBaseline[id][k]);
    const upgraded=payload?.format!==PROJECT_FORMAT;
    if(upgraded)notes.unshift('Earlier project: calibration starts from your current settings. Existing edits are retained; manually changed hazard fields are locked against optimization.');
    return {state:snapshot(candidate),notes,legacy,migrated:Boolean(migration)||upgraded};
  }
  prepareImport(payload) {
    const decoded=this.decode(payload),before=snapshot(this);
    return {payload:clone(payload),before,after:decoded.state,notes:decoded.notes,rows:changesBetween(before,decoded.state,this.items)};
  }
  assertStorage(storage) {
    if(storage.getItem(PROJECT_STORAGE_KEY)!==this.expectedRaw)throw new Error('Another tab changed the browser save. Export your current work, then reload before saving or importing.');
  }
  applyImport(review,storage) {
    if(!same(snapshot(this),review.before))throw new Error('The working draft changed. Open the file again to refresh its comparison.');
    const checked=this.prepareImport(review.payload);
    if(!checked.rows.length)return false;
    this.assertStorage(storage);
    // Required recovery write happens before any draft/history mutation.
    storage.setItem(RECOVERY_KEY,JSON.stringify({createdAt:new Date().toISOString(),project:this.export()}));
    this.past.push({kind:'project',before:checked.before,after:checked.after});this.future=[];
    install(this,checked.after);return true;
  }
  undo(){const e=this.past.at(-1);if(e?.kind==='placement'){this.past.pop();this.placement[e.id]=clone(e.before);if(e.beforeCalibration)this.calibration=clone(e.beforeCalibration);this.future.push(e);return;}if(e?.kind!=='project')return super.undo();this.past.pop();install(this,e.before);this.future.push(e);}
  redo(){const e=this.future.at(-1);if(e?.kind==='placement'){this.future.pop();this.placement[e.id]=clone(e.after);if(e.afterCalibration)this.calibration=clone(e.afterCalibration);this.past.push(e);return;}if(e?.kind!=='project')return super.redo();this.future.pop();install(this,e.after);this.past.push(e);}
  changedRows(){return changesBetween({crops:this.baseline,frames:this.frameBaseline,landscapes:this.landscapeBaseline,placement:this.placementBaseline,calibration:this.calibrationBaseline},snapshot(this),this.items);}
  load(storage) {
    this.expectedRaw=storage.getItem(PROJECT_STORAGE_KEY);
    const choices=[[PROJECT_STORAGE_KEY,this.expectedRaw],[PRE_CALIBRATION_FORMAT,storage.getItem(PRE_CALIBRATION_FORMAT)],[PREVIOUS_PROJECT_FORMAT,storage.getItem(PREVIOUS_PROJECT_FORMAT)],[FRAME_STORAGE_KEY,storage.getItem(FRAME_STORAGE_KEY)],[DESIGN_STORAGE_KEY,storage.getItem(DESIGN_STORAGE_KEY)],[STORAGE_KEY,storage.getItem(STORAGE_KEY)]];
    const entry=choices.find(([,raw])=>raw!==null);
    if(!entry)return 'Ready. Save all keeps every editable setting in this browser.';
    try {
      const payload=JSON.parse(entry[1]),decoded=this.decode(payload);
      install(this,decoded.state);this.saved=clone(this.value);this.savedFrames=clone(this.frames);this.savedLandscapes=clone(this.landscapes);this.savedPlacement=clone(this.placement);this.savedCalibration=clone(this.calibration);
      this.migrated=entry[0]!==PROJECT_STORAGE_KEY||decoded.migrated;this.savedAt=payload.savedAt||null;this.past=[];this.future=[];
      if(decoded.migrated)return `${decoded.notes.at(-1)} Save all keeps the updated project; your previous saved copy is preserved.`;
      return this.migrated?'Recovered your earlier draft. Save all creates the new project copy and retains the old save.':'Restored all settings from this browser.';
    }catch(error){this.unreadable=entry[0]===PROJECT_STORAGE_KEY;this.failedSave=entry[1];throw error;}
  }
  save(storage) {
    this.assertStorage(storage);
    // Preserve a malformed/incompatible save before an explicit Save all replaces it.
    if(this.unreadable && this.expectedRaw!==null)storage.setItem(UNREADABLE_KEY,this.expectedRaw);
    if(this.migrated && this.expectedRaw!==null)storage.setItem(ARTWORK_RECOVERY_KEY,this.expectedRaw);
    const savedAt=new Date().toISOString(),raw=JSON.stringify({...this.export(),savedAt});
    storage.setItem(PROJECT_STORAGE_KEY,raw);
    this.expectedRaw=raw;this.savedAt=savedAt;this.saved=clone(this.value);this.savedFrames=clone(this.frames);this.savedLandscapes=clone(this.landscapes);this.savedPlacement=clone(this.placement);this.savedCalibration=clone(this.calibration);this.migrated=false;this.unreadable=false;
  }
}

// Navigation is derived from available stage metadata, with one remembered stage per continent.
export class StageSelection {
  constructor(landscapes,registry) {
    this.groups=new Map();this.last=new Map();
    for(const item of landscapes) {
      const label=registry.stages[item.stage]?.label;
      if(!label?.includes('—'))throw new Error(`Continent label missing for ${item.stage}.`);
      const continent=label.split('—')[0].trim();
      if(!this.groups.has(continent))this.groups.set(continent,[]);
      this.groups.get(continent).push({id:item.stage,label:label.split('—').slice(1).join('—').trim()});
    }
    this.stage=landscapes[0].stage;this.remember(this.stage);
  }
  remember(stage) {
    const continent=[...this.groups.keys()].find(key=>this.groups.get(key).some(item=>item.id===stage));
    if(!continent)throw new Error('Stage is not available.');
    this.continent=continent;this.stage=stage;this.last.set(continent,stage);
  }
  choose(continent) {
    if(!this.groups.has(continent))throw new Error('Continent is not available.');
    const stage=this.last.get(continent)||this.groups.get(continent)[0].id;this.remember(stage);return stage;
  }
}
