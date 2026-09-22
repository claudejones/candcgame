import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {importAssetHandoff} from './import-asset-handoff.mjs';
import {descriptors} from './model.mjs';
import {landscapeDescriptors} from './landscape.mjs';
import {ProjectDraft,projectProvenance} from './project.mjs';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function environment(root){const context={window:{}};vm.createContext(context);const files=JSON.parse(fs.readFileSync(path.join(root,'workbench-next/source-files.json'),'utf8'));for(const file of files)vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);const w=context.window,config=structuredClone(w.GAME_CONFIG);w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);return {w,config,items:descriptors(config,w.GAME_SCHEMA),stages:landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog:JSON.parse(fs.readFileSync(path.join(root,'workbench-next/asset-catalog.json'),'utf8'))};}
function target(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'cc-handoff-target-'));fs.cpSync(path.join(repo,'workbench-next'),path.join(root,'workbench-next'),{recursive:true});fs.symlinkSync(path.join(repo,'src'),path.join(root,'src'),'dir');
 const assets=path.join(root,'assets');fs.mkdirSync(assets);for(const name of fs.readdirSync(path.join(repo,'assets')))if(name!=='worlds')fs.symlinkSync(path.join(repo,'assets',name),path.join(assets,name),'dir');
 const worlds=path.join(assets,'worlds');fs.mkdirSync(worlds);for(const name of fs.readdirSync(path.join(repo,'assets/worlds')))if(name!=='africa')fs.symlinkSync(path.join(repo,'assets/worlds',name),path.join(worlds,name),'dir');
 const africa=path.join(worlds,'africa');fs.mkdirSync(africa);for(const name of fs.readdirSync(path.join(repo,'assets/worlds/africa')))if(!name.startsWith('AF02_'))fs.symlinkSync(path.join(repo,'assets/worlds/africa',name),path.join(africa,name));
 // Exercise a new import independently of stages already imported in the repo.
 fs.writeFileSync(path.join(root,'workbench-next/imported-handoffs.json'),'{}\n');fs.writeFileSync(path.join(root,'workbench-next/imported-handoffs.js'),'window.CC_WORKBENCH_ASSET_HANDOFFS={};\n');
 const prior=JSON.parse(fs.readFileSync(path.join(repo,'workbench-next/fixtures/review11-project.json'))).provenance;
 const migrations=JSON.parse(fs.readFileSync(path.join(root,'workbench-next/project-migrations.json'))).filter(m=>!m.id.startsWith('asset-ready-')).map(m=>({...m,toProvenance:prior}));
 fs.writeFileSync(path.join(root,'workbench-next/project-migrations.json'),JSON.stringify(migrations));execFileSync(process.execPath,[path.join(root,'workbench-next/build-catalog.cjs')]);return root;
}
function fixture(){
 const source=fs.mkdtempSync(path.join(os.tmpdir(),'cc-handoff-source-')),catalog=(()=>{const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(repo,'src/js/stage-catalog.js'),'utf8'),c);return c.window.CC_STAGE_CATALOG;})(),files=catalog.stages.af02.files;
 const originals=catalog.stages.af01.files,assets={};for(const key of Object.keys(files)){const data=fs.readFileSync(path.join(repo,originals[key]));const dest=path.join(source,files[key]);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,data);assets[key]={path:files[key],sha256:createHash('sha256').update(data).digest('hex'),width:2172,height:724};}
 fs.mkdirSync(path.join(source,'docs/phase8-qa'),{recursive:true});fs.writeFileSync(path.join(source,'docs/phase8-qa/AF02_ASSET_QA.md'),'fixture');
 const crop={l:20,r:20,t:20,b:20};return {source,bundle:{schemaVersion:1,stageId:'af02',readiness:'asset-ready',downstream:{calibration:'pending',release:'pending'},assets,
  landscape:{contractVersion:'phase8-landscape-1',source:{width:2172,height:724},viewport:{width:960,height:540,groundSurfaceY:410},layers:{FAR:{sourceY:0,scale:1.25},MID:{sourceAnchorY:621,offsetY:0,scale:1},GROUND:{sourceAnchorY:393,offsetY:0,scale:1}}},
  hazards:[0,1].map((index)=>({name:index?'Oryx':'Beetle',kind:'ground',atlasKey:'af02Hazards',rect:{x:index*1086,y:0,w:1086,h:724},sourceAnchor:{x:543,y:620},scale:.2,crop,cw:.5,ch:.5,cx:0,cy:0,groundOffset:0,sourceFacing:index?'right':'none',gameplayFacing:index?'left':'none',...(index?{flipX:true}:{})})).concat({name:'Sandgrouse',kind:'flying',atlasKey:'af02Bird',frameW:543,frameH:724,frames:4,fps:8,sourceAnchor:{x:271,y:362},scale:.3,crop,frameCrops:[crop,crop,crop,crop],cw:.5,ch:.3,cx:0,cy:0,flightOffsetY:{high:0,low:0},sourceFacing:'right',gameplayFacing:'left',flipX:true}),
  checks:{technical:true,composition:true,animation:true,basicRendering:true},evidence:'docs/phase8-qa/AF02_ASSET_QA.md',knownIssues:['Gameplay calibration is pending.']}};
}
const memory=()=>{const map=new Map();return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};};

test('real AF01 bytes are a compatibility no-op that preserves Workbench settings',()=>{
 const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(repo,'src/js/stage-catalog.js'),'utf8'),context);const stage=context.window.CC_STAGE_CATALOG.stages.af01,release=stage.release;
 const assets=Object.fromEntries(Object.entries(release.assets).map(([key,item])=>[key,{...item,width:2172,height:724}]));
 const hazards=release.hazards.map((hazard,index)=>({...hazard,sourceFacing:index===0?'none':'right',gameplayFacing:index===0?'none':'left'}));
 const bundle={schemaVersion:1,stageId:'af01',readiness:'asset-ready',downstream:{calibration:'pending',release:'pending'},assets,
  landscape:{contractVersion:'phase8-landscape-1',source:{width:2172,height:724},viewport:{width:960,height:540,groundSurfaceY:410},layers:{FAR:{sourceY:0,scale:1.25},MID:{sourceAnchorY:621,offsetY:0,scale:1},GROUND:{sourceAnchorY:393,offsetY:0,scale:1}}},hazards,
  checks:{technical:true,composition:true,animation:true,basicRendering:true},evidence:release.evidence};
 const before=fs.readFileSync(path.join(repo,'workbench-next/source-config.js'),'utf8'),state=fs.readFileSync(path.join(repo,'workbench-next/imported-handoffs.json'),'utf8');
 assert.deepEqual(importAssetHandoff({bundle,sourceRoot:repo,targetRoot:repo}),{stageId:'af01',status:'compatible-existing-stage',calibration:'preserved'});
 assert.throws(()=>importAssetHandoff({bundle,sourceRoot:repo,targetRoot:repo,refresh:true}),/released and cannot/);
 assert.equal(fs.readFileSync(path.join(repo,'workbench-next/source-config.js'),'utf8'),before);assert.equal(fs.readFileSync(path.join(repo,'workbench-next/imported-handoffs.json'),'utf8'),state);
});

test('explicit AF02 artwork refresh preserves authored work and invalidates only affected certificates',()=>{
 const root=target(),{source,bundle}=fixture();importAssetHandoff({bundle,sourceRoot:source,targetRoot:root});
 const before=environment(root),old=new ProjectDraft(before.items,before.stages,before.catalog.dimensions,projectProvenance(before.catalog,before.items,before.stages),before.catalog.migrations,before.config);
 const id='hazard:af02:0',crop={...old.crop(id,0),l:old.crop(id,0).l+1};old.edit(id,0,crop);
 const bounds={...old.bounds(id,0),x:old.bounds(id,0).x+1,w:old.bounds(id,0).w-1};old.editBounds(id,0,bounds);
 old.editPlacement(id,{...old.placement[id],cx:.123});old.editLayer('af02','mid',{...old.transform('af02','mid'),x:17});
 const calibration=structuredClone(old.calibration);calibration.hazards[id].locks=['cx'];calibration.hazards[id].stamp='af02-reviewed';calibration.hazards['hazard:eu02:1'].stamp='unrelated-reviewed';calibration.stages.af02.pathY+=13;old.editCalibration(calibration);const saved=old.export();
 const refreshed=structuredClone(bundle),replacement=fs.readFileSync(path.join(source,bundle.assets.MID.path)),far=path.join(source,bundle.assets.FAR.path);fs.writeFileSync(far,replacement);refreshed.assets.FAR.sha256=createHash('sha256').update(replacement).digest('hex');refreshed.knownIssues=['Refreshed synthetic artwork needs review.'];
 assert.throws(()=>importAssetHandoff({bundle:refreshed,sourceRoot:source,targetRoot:root}),/explicit artwork refresh/);
 assert.deepEqual(importAssetHandoff({bundle:refreshed,sourceRoot:source,targetRoot:root,refresh:true}),{stageId:'af02',status:'refreshed',assets:5,calibration:'pending',release:'pending',artworkReview:'required'});
 const after=environment(root),next=new ProjectDraft(after.items,after.stages,after.catalog.dimensions,projectProvenance(after.catalog,after.items,after.stages),after.catalog.migrations,after.config),review=next.prepareImport(saved);next.applyImport(review,memory());
 assert.deepEqual(next.crop(id,0),crop);assert.deepEqual(next.bounds(id,0),bounds);assert.equal(next.placement[id].cx,.123);assert.deepEqual(next.calibration.hazards[id].locks,['cx']);assert.equal(next.transform('af02','mid').x,17);assert.equal(next.calibration.stages.af02.pathY,calibration.stages.af02.pathY);
 assert.equal(next.calibration.hazards[id].stamp,'');assert.equal(next.calibration.hazards['hazard:eu02:1'].stamp,'unrelated-reviewed');assert.ok(review.notes.some(note=>/artwork needs review/i.test(note)));
 const migration=after.catalog.migrations.at(-1);assert.ok(migration.landscapeRevision.af02,'refresh migration retains its source stage');assert.deepEqual(migration.artworkRefreshStages,['af02']);
 const direct=after.catalog.migrations.filter(item=>item.id!==migration.id&&item.toProvenance.baseline===after.catalog.baseline);assert.ok(direct.length);assert.ok(direct.every(item=>item.artworkRefreshStages?.includes('af02')),'retargeted older routes carry certificate invalidation');
 const older=JSON.parse(fs.readFileSync(path.join(repo,'workbench-next/fixtures/review10-project.json')));older.placement['hazard:na01:0'].scale=.27;const oldImport=next.prepareImport(older);assert.equal(oldImport.after.placement['hazard:na01:0'].scale,.27,'known older routes point directly to refreshed provenance');assert.equal(oldImport.after.calibration.hazards['hazard:af02:0'].stamp,'');
 const snapshot=fs.readFileSync(path.join(root,'workbench-next/imported-handoffs.json'),'utf8');assert.equal(importAssetHandoff({bundle:refreshed,sourceRoot:source,targetRoot:root,refresh:true}).status,'already-imported');assert.equal(fs.readFileSync(path.join(root,'workbench-next/imported-handoffs.json'),'utf8'),snapshot);
 const unchanged=Object.fromEntries(Object.entries(refreshed.assets).map(([key,item])=>[key,fs.statSync(path.join(root,item.path)).ino])),metadataOnly=structuredClone(refreshed);metadataOnly.knownIssues=['Metadata-only refresh also needs review.'];const firstId=migration.id;importAssetHandoff({bundle:metadataOnly,sourceRoot:source,targetRoot:root,refresh:true});for(const [key,item] of Object.entries(metadataOnly.assets))assert.equal(fs.statSync(path.join(root,item.path)).ino,unchanged[key],`${key} was not rewritten`);const metadataMigration=JSON.parse(fs.readFileSync(path.join(root,'workbench-next/project-migrations.json'))).at(-1);assert.notEqual(metadataMigration.id,firstId,'metadata participates in refresh identity');
 fs.rmSync(root,{recursive:true,force:true});fs.rmSync(source,{recursive:true,force:true});
});

test('refresh rejects stale destination bytes and rolls back every write after a failure',()=>{
 const make=()=>{const root=target(),data=fixture();importAssetHandoff({bundle:data.bundle,sourceRoot:data.source,targetRoot:root});const refreshed=structuredClone(data.bundle),far=path.join(data.source,data.bundle.assets.FAR.path),original=fs.readFileSync(far),replacement=fs.readFileSync(path.join(data.source,data.bundle.assets.MID.path));fs.writeFileSync(far,replacement);refreshed.assets.FAR.sha256=createHash('sha256').update(replacement).digest('hex');return {root,...data,refreshed,original,replacement};};
 const stale=make(),dest=path.join(stale.root,stale.bundle.assets.FAR.path),sourceFar=path.join(stale.source,stale.bundle.assets.FAR.path);fs.writeFileSync(dest,'unexpected local edit');const state=fs.readFileSync(path.join(stale.root,'workbench-next/imported-handoffs.json'),'utf8');fs.writeFileSync(sourceFar,stale.original);assert.throws(()=>importAssetHandoff({bundle:stale.bundle,sourceRoot:stale.source,targetRoot:stale.root}),/no longer matches/);fs.writeFileSync(sourceFar,stale.replacement);assert.throws(()=>importAssetHandoff({bundle:stale.refreshed,sourceRoot:stale.source,targetRoot:stale.root,refresh:true}),/changed since the prior import/);assert.equal(fs.readFileSync(dest,'utf8'),'unexpected local edit');assert.equal(fs.readFileSync(path.join(stale.root,'workbench-next/imported-handoffs.json'),'utf8'),state);
 const failed=make(),tracked=['workbench-next/imported-handoffs.json','workbench-next/imported-handoffs.js','workbench-next/asset-catalog.json','workbench-next/project-migrations.json',...Object.values(failed.bundle.assets).map(item=>item.path)],before=Object.fromEntries(tracked.map(file=>[file,fs.readFileSync(path.join(failed.root,file))]));
 let builds=0;assert.throws(()=>importAssetHandoff({bundle:failed.refreshed,sourceRoot:failed.source,targetRoot:failed.root,refresh:true,buildCatalog:root=>{if(++builds===2)throw new Error('synthetic catalog failure');execFileSync(process.execPath,[path.join(root,'workbench-next/build-catalog.cjs')],{cwd:root,stdio:'pipe'});}}),/synthetic catalog failure/);assert.equal(builds,2);
 for(const [file,data] of Object.entries(before))assert.ok(fs.readFileSync(path.join(failed.root,file)).equals(data),`${file} rolled back`);
 for(const item of [stale,failed]){fs.rmSync(item.root,{recursive:true,force:true});fs.rmSync(item.source,{recursive:true,force:true});}
});

test('synthetic AF02 asset-ready import is preview-only, migrates old calibration, and is idempotent',()=>{
 const root=target(),{source,bundle}=fixture(),before=environment(root),old=new ProjectDraft(before.items,before.stages,before.catalog.dimensions,projectProvenance(before.catalog,before.items,before.stages),before.catalog.migrations,before.config);
 old.editPlacement('hazard:eu02:1',{...old.placement['hazard:eu02:1'],cx:.234});const calibration=structuredClone(old.calibration);calibration.hazards['hazard:eu02:1'].locks=['cx'];calibration.stages.na01.pathY+=19;old.editCalibration(calibration);const saved=old.export();
 const result=importAssetHandoff({bundle,sourceRoot:source,targetRoot:root});assert.deepEqual(result,{stageId:'af02',status:'imported',assets:5,calibration:'pending',release:'pending'});
 const after=environment(root);assert.ok(after.config.worldProfiles.af02);assert.equal(after.w.CC_STAGE_CATALOG.stages.af02.status,'pending');assert.equal(after.config.workbenchAssetReady.af02.downstream.release,'pending');assert.equal(after.items.filter(item=>item.stage==='af02'&&item.type==='hazard').length,3);
 const next=new ProjectDraft(after.items,after.stages,after.catalog.dimensions,projectProvenance(after.catalog,after.items,after.stages),after.catalog.migrations,after.config),store=memory();next.applyImport(next.prepareImport(saved),store);
 assert.equal(next.placement['hazard:eu02:1'].cx,.234);assert.deepEqual(next.calibration.hazards['hazard:eu02:1'].locks,['cx']);assert.equal(next.calibration.stages.na01.pathY,calibration.stages.na01.pathY);assert.ok(next.calibration.stages.af02);assert.equal(next.calibration.hazards['hazard:af02:0'].stamp,'');
 const older=JSON.parse(fs.readFileSync(path.join(repo,'workbench-next/fixtures/review10-project.json')));older.placement['hazard:na01:0'].scale=.27;
 assert.equal(next.prepareImport(older).after.placement['hazard:na01:0'].scale,.27,'known pre-AF01 saves survive a later stage import');
 assert.equal(importAssetHandoff({bundle,sourceRoot:source,targetRoot:root}).status,'already-imported');const changed=structuredClone(bundle);changed.knownIssues=['Different note'];assert.throws(()=>importAssetHandoff({bundle:changed,sourceRoot:source,targetRoot:root}),/different bytes or metadata/);fs.rmSync(root,{recursive:true,force:true});fs.rmSync(source,{recursive:true,force:true});
});

test('malformed and hash-mismatched handoffs fail without changing the Workbench',()=>{
 const root=target(),{source,bundle}=fixture(),snapshot=()=>['imported-handoffs.json','imported-handoffs.js','asset-catalog.json','project-migrations.json'].map(file=>fs.readFileSync(path.join(root,'workbench-next',file),'utf8'));
 const before=snapshot(),bad=structuredClone(bundle);bad.downstream.release='approved';assert.throws(()=>importAssetHandoff({bundle:bad,sourceRoot:source,targetRoot:root}),/remain pending/);assert.deepEqual(snapshot(),before);
 const hash=structuredClone(bundle);hash.assets.FAR.sha256='0'.repeat(64);assert.throws(()=>importAssetHandoff({bundle:hash,sourceRoot:source,targetRoot:root}),/SHA-256 mismatch/);assert.deepEqual(snapshot(),before);assert.equal(fs.existsSync(path.join(root,bundle.assets.FAR.path)),false);
 const conflict=path.join(root,bundle.assets.FAR.path);fs.mkdirSync(path.dirname(conflict),{recursive:true});fs.writeFileSync(conflict,'different');assert.throws(()=>importAssetHandoff({bundle,sourceRoot:source,targetRoot:root}),/destination already exists with different bytes/);assert.deepEqual(snapshot(),before);assert.equal(fs.readFileSync(conflict,'utf8'),'different');
 fs.rmSync(root,{recursive:true,force:true});fs.rmSync(source,{recursive:true,force:true});
});
