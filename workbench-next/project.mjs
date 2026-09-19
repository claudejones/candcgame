import {FrameDraft,FRAME_FORMAT,FRAME_STORAGE_KEY} from './frame-editor.mjs';
import {Draft,FORMAT,STORAGE_KEY,same} from './model.mjs';
import {DESIGN_FORMAT,DESIGN_STORAGE_KEY,LAYERS} from './landscape.mjs';
import {placementDefaults,validatePlacement} from './scene-model.mjs';
import {calibrationDefaults,validateCalibration,upgradeCalibration,characterPathShift} from './calibration-settings.mjs';

export const PREVIOUS_PROJECT_FORMAT='cc-workbench-next-project-v4';
export const PRE_CALIBRATION_FORMAT='cc-workbench-next-project-v5';
export const PRE_CHARACTER_LINK_FORMAT='cc-workbench-next-project-v6';
export const PRE_FACING_FORMAT='cc-workbench-next-project-v7';
export const PROJECT_FORMAT='cc-workbench-next-project-v8';
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
  setCharacterFollow(stage,who,follow){
    const policy=this.calibration.stages[stage];
    if(!policy||!Object.hasOwn(policy.characterFollow,who)||typeof follow!=='boolean')throw new Error('Choose a valid stage and character link.');
    if(policy.characterFollow[who]===follow)return;
    const calibration=clone(this.calibration),placement=clone(this.placement),id=`grounding:${stage}:${who}`;
    const total=placement[id].groundOffset+characterPathShift(this,stage,who);
    calibration.stages[stage].characterFollow[who]=follow;
    placement[id].groundOffset=total-characterPathShift({...this,calibration},stage,who);
    if(placement[id].groundOffset < -300 || placement[id].groundOffset > 300)throw new Error('This link change would exceed the character stage offset range (-300 to 300). Adjust the stage pathway or character offset first. Nothing changed.');
    this.editCalibration(calibration,placement);
  }
  export(){return {format:PROJECT_FORMAT,purpose:'All editable Workbench Next settings. Artwork stays in the project; Test/Game configuration integration is pending.',provenance:clone(this.provenance),placement:clone(this.placement),calibration:clone(this.calibration),design:super.export()};}
  decode(payload) {
    let design=payload,legacy=true,migration=null;
    const supported=this.migrations.filter(item=>same(item.toProvenance,this.provenance));
    const projectFormats=[PROJECT_FORMAT,PRE_FACING_FORMAT,PRE_CHARACTER_LINK_FORMAT,PRE_CALIBRATION_FORMAT,PREVIOUS_PROJECT_FORMAT];
    const placementFormats=projectFormats.filter(f=>f!==PREVIOUS_PROJECT_FORMAT);
    const calibrationFormats=[PROJECT_FORMAT,PRE_FACING_FORMAT,PRE_CHARACTER_LINK_FORMAT];
    if(projectFormats.includes(payload?.format)) {
      const fields=['format','purpose','provenance','design','savedAt'],required=['format','provenance','design'];
      if(placementFormats.includes(payload.format)){fields.push('placement');required.push('placement');}
      if(calibrationFormats.includes(payload.format)){fields.push('calibration');required.push('calibration');}
      keys(payload,fields,required);
      if(!same(payload.provenance,this.provenance)) {
        migration=supported.find(item=>same(item.fromProvenance,payload.provenance));
        if(!migration)throw new Error('This project uses different artwork or source defaults. Keep the file for a compatible editor; nothing has been changed.');
      }
      if(payload.savedAt!==undefined&&(typeof payload.savedAt!=='string'||!Number.isFinite(Date.parse(payload.savedAt))))throw new Error('Saved date is invalid.');
      design=payload.design;legacy=false;
      if(design?.format!==FRAME_FORMAT)throw new Error('Project configuration version is invalid.');
    }
    validateShape(design);
    if(legacy&&design.format!==FORMAT&&!same(design.landscapeRevision,this.landscapeRevision))migration=supported.find(item=>same(item.landscapeRevision,design.landscapeRevision)&&(design.format===DESIGN_FORMAT||same(item.atlasDimensions,design.atlasDimensions)));
    const allItems=[...this.items.values()],sourceItemsFor=m=>allItems.filter(i=>i.type==='character'||Object.hasOwn(m.landscapeRevision,i.stage));
    if(legacy&&design.format===FORMAT&&!same(Object.keys(design.crops).sort(),allItems.map(i=>i.id).sort()))migration=supported.find(m=>same(Object.keys(design.crops).sort(),sourceItemsFor(m).map(i=>i.id).sort()));
    const sourceItems=migration?sourceItemsFor(migration):allItems;
    const definitions=migration?this.definitions.filter(i=>Object.hasOwn(migration.landscapeRevision,i.stage)).map(i=>({...i,...clone(migration.landscapeRevision[i.stage])})):this.definitions;
    const candidate=new FrameDraft(sourceItems,definitions,migration?.atlasDimensions||this.dimensions);
    if(design.format===FORMAT){const sprites=new Draft(sourceItems);sprites.restore(design);candidate.value=clone(sprites.value);}else candidate.restore(design);
    const notes=[];
    if(legacy)notes.push('Older draft: source hashes were not recorded. Available baseline, frame and landscape checks passed.');
    if(design.format===DESIGN_FORMAT||design.format===FORMAT)notes.push('This older file has no atlas boundary edits. Boundaries use the baseline; resulting resets appear below.');
    if(design.format===FORMAT)notes.push('This sprite-only file has no landscapes. Landscape values use the baseline.');
    if(migration){
      const updated=[];
      for(const stage of Object.keys(candidate.landscapes)){
        const before=migration.landscapeRevision[stage];if(same(before,this.landscapeRevision[stage]))continue;updated.push(stage.toUpperCase());
        for(const layer of LAYERS)for(const field of Object.keys(before.baseline[layer]))if(candidate.landscapes[stage][layer][field]===before.baseline[layer][field])candidate.landscapes[stage][layer][field]=this.landscapeBaseline[stage][layer][field];
      }
      if(updated.length)notes.push(`Landscape artwork updated for ${updated.join(' and ')}. Untouched settings use new defaults; custom adjustments and sprite edits are retained. Review Source & status for artwork approval.`);
    }
    const stageIds=new Set(definitions.map(i=>i.stage)),itemIds=new Set(sourceItems.map(i=>i.id));
    const sourcePlacement=Object.fromEntries(Object.entries(this.placementBaseline).filter(([id])=>id.startsWith('character:')||itemIds.has(id)||(id.startsWith('grounding:')&&stageIds.has(id.split(':')[1]))).map(([id,p])=>[id,clone(p)]));
    if(payload?.format!==PROJECT_FORMAT)for(const [id,p] of Object.entries(sourcePlacement))if(id.startsWith('hazard:'))for(const key of ['flipX','highOffsetY','lowOffsetY'])delete p[key];
    const hasPlacement=placementFormats.includes(payload?.format),hasCalibration=calibrationFormats.includes(payload?.format);
    candidate.placement=hasPlacement?clone(validatePlacement(payload.placement,sourcePlacement)):clone(sourcePlacement);
    const sourceCalibration=calibrationDefaults(candidate.placement,definitions,this.config);
    candidate.calibration=hasCalibration?(payload.format===PRE_CHARACTER_LINK_FORMAT?upgradeCalibration(payload.calibration,sourceCalibration,candidate.placement):clone(validateCalibration(payload.calibration,sourceCalibration,candidate.placement))):sourceCalibration;
    if(!hasCalibration)for(const [id,h] of Object.entries(candidate.calibration.hazards))h.locks=Object.keys(candidate.placement[id]).filter(k=>candidate.placement[id][k]!==sourcePlacement[id][k]);
    // Validate the old stage set first, then add only genuinely new defaults.
    // Imports remain whole-project replacements; every addition/reset is reviewable.
    const state={crops:{...clone(this.baseline),...candidate.value},frames:{...clone(this.frameBaseline),...candidate.frames},landscapes:{...clone(this.landscapeBaseline),...candidate.landscapes},placement:clone(this.placementBaseline),calibration:{...clone(candidate.calibration),stages:{...clone(this.calibrationBaseline.stages),...candidate.calibration.stages},hazards:{...clone(this.calibrationBaseline.hazards),...candidate.calibration.hazards}}};
    for(const [id,p] of Object.entries(candidate.placement))state.placement[id]={...state.placement[id],...p};
    validatePlacement(state.placement,this.placementBaseline);validateCalibration(state.calibration,this.calibrationBaseline,state.placement);
    const check=new FrameDraft(allItems,this.definitions,this.dimensions);check.restore({...check.export(),sprites:{...check.export().sprites,crops:state.crops},frames:state.frames,landscapes:state.landscapes});
    const added=this.definitions.filter(i=>!stageIds.has(i.stage));
    if(added.length)notes.unshift(`Added ${added.map(i=>i.stage.toUpperCase()).join(', ')} with starting settings. Existing stages, crops, bounds, placement, pathway links, difficulty profiles and hazard locks are retained.${added.some(i=>this.config?.workbenchAssetReady?.[i.stage])?' Imported asset-ready stages need calibration.':''}`);
    const upgraded=payload?.format!==PROJECT_FORMAT;
    if(upgraded)notes.unshift('Updated project format. Existing edits are retained. Missing facing and flight corrections inherit the integrated defaults; new certificates require rechecking.');
    if(payload?.format===PRE_CHARACTER_LINK_FORMAT)notes.push('Both characters keep following their stage pathway; positions are preserved.');
    if(!hasCalibration)notes.push('Calibration starts from your current settings; manually changed hazard fields stay locked against optimization.');
    return {state,notes,legacy,migrated:Boolean(migration)||upgraded};
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
    const choices=[[PROJECT_STORAGE_KEY,this.expectedRaw],[PRE_FACING_FORMAT,storage.getItem(PRE_FACING_FORMAT)],[PRE_CHARACTER_LINK_FORMAT,storage.getItem(PRE_CHARACTER_LINK_FORMAT)],[PRE_CALIBRATION_FORMAT,storage.getItem(PRE_CALIBRATION_FORMAT)],[PREVIOUS_PROJECT_FORMAT,storage.getItem(PREVIOUS_PROJECT_FORMAT)],[FRAME_STORAGE_KEY,storage.getItem(FRAME_STORAGE_KEY)],[DESIGN_STORAGE_KEY,storage.getItem(DESIGN_STORAGE_KEY)],[STORAGE_KEY,storage.getItem(STORAGE_KEY)]];
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
  constructor(landscapes,registry,stageCatalog=null) {
    this.groups=new Map();this.last=new Map();
    for(const item of landscapes) {
      const label=registry.stages[item.stage]?.label;
      if(!label?.includes('—'))throw new Error(`Continent label missing for ${item.stage}.`);
      const continent=stageCatalog?.continents.find(c=>c.stages.includes(item.stage))?.label||label.split('—')[0].trim();
      if(!this.groups.has(continent))this.groups.set(continent,[]);
      this.groups.get(continent).push({id:item.stage,label:label.startsWith(continent+' —')?label.split('—').slice(1).join('—').trim():label});
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
