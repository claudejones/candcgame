// node build.mjs --source <Site checkout> --config <Export All.json> --out <new directory>
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import crypto from 'node:crypto';import {pathToFileURL,fileURLToPath} from 'node:url';
const args=Object.fromEntries(process.argv.slice(2).reduce((a,v,i,l)=>i%2?a:[...a,[v.replace(/^--/,''),l[i+1]]],[]));
if(!args.source||!args.config||!args.out)throw Error('Required: --source <Site checkout> --config <Export All.json> --out <new directory>');
const root=path.resolve(args.source),out=path.resolve(args.out),source=path.join(root,'dist/workbench-next'),templates=path.dirname(fileURLToPath(import.meta.url)),app=path.join(out,'play');
if(fs.existsSync(out))throw Error('Output already exists. Use a new build directory to preserve the previous artifact.');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),load=async name=>import(pathToFileURL(path.join(source,name)));
const ctx={window:{}};vm.createContext(ctx);for(const f of read(path.join(root,'authoring/workbench-next/source-files.json')))vm.runInContext(fs.readFileSync(path.join(root,'dist',f),'utf8'),ctx);
const w=ctx.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);
const {descriptors}=await load('model.mjs'),{landscapeDescriptors}=await load('landscape.mjs'),{ProjectDraft,projectProvenance}=await load('project.mjs');
const {analyzeHazard,makeSequence}=await load('calibration-engine.mjs'),{runtimeSnapshot,runtimeAssetKeys}=await load('play-runtime.mjs');
const items=descriptors(config,w.GAME_SCHEMA),landscapes=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog=read(path.join(source,'asset-catalog.json'));
const project=new ProjectDraft(items,landscapes,catalog.dimensions,projectProvenance(catalog,items,landscapes),catalog.migrations,config),payload=read(args.config),decoded=project.decode(payload);
const draft={...decoded.state,value:decoded.state.crops,provenance:project.provenance};delete draft.crops;
const inputHash=crypto.createHash('sha256').update(fs.readFileSync(args.config)).digest('hex');
fs.mkdirSync(path.join(app,'plans'),{recursive:true});const keys=new Set();let plans=0;
for(const {stage} of landscapes)for(const difficulty of ['easy','standard','hard']){
 const d={...draft,calibration:{...draft.calibration,profile:difficulty}},reports=items.filter(i=>i.type==='hazard'&&i.stage===stage&&d.calibration.hazards[i.id].enabled).map(item=>{const reports=(item.kind==='flying'?['high','low']:['high']).map(flight=>analyzeHazard({config,draft:d,items,item,flight}));return {id:item.id,stage,reports,ready:reports.every(r=>r.pass)};});
 if(reports.some(r=>!r.ready))throw Error(`Calibration requires review: ${stage} ${difficulty}. Return to Design and Save All; build never changes overrides.`);
 const sequence=makeSequence({config,draft:d,items,reports,stage,seed:config.spawnDirector.seed});if(!sequence.verified)throw Error(`Unchecked sequence: ${stage} ${difficulty}`);
 fs.writeFileSync(path.join(app,'plans',stage+'-'+difficulty+'.json'),JSON.stringify(sequence));plans++;
 for(const character of ['claude','constance'])for(const key of runtimeAssetKeys(runtimeSnapshot({config,draft,items,catalog,stage,character,difficulty,sequence})))keys.add(key);
}
for(const i of items)keys.add(i.asset);for(const k of ['stars','hudHearts','hudCharacters','hudPath'])keys.add(k);
const slim={assets:{},hashes:{},dimensions:{}};for(const key of keys)for(const field of Object.keys(slim))slim[field][key]=catalog[field][key];
fs.writeFileSync(path.join(app,'release.json'),JSON.stringify({version:1,inputHash,config,draft,items,catalog:slim}));
const copied=new Set();function moduleCopy(file){if(copied.has(file))return;copied.add(file);const template=['mobile-main.mjs'].includes(file),p=path.join(template?templates:source,file),text=fs.readFileSync(p,'utf8');fs.copyFileSync(p,path.join(app,file));for(const m of text.matchAll(/(?:from\s*|import\s*\()\s*['"]\.\/([^'"]+)['"]/g))moduleCopy(m[1]);}
moduleCopy('mobile-main.mjs');for(const f of ['index.html','mobile.css'])fs.copyFileSync(path.join(templates,f),path.join(app,f));for(const f of ['global-game.css','game-hud.css'])fs.copyFileSync(path.join(source,f),path.join(app,f));fs.copyFileSync(path.join(root,'dist/src/js/landscape-contract.js'),path.join(app,'landscape-contract.js'));
const assetPaths=new Set(Object.values(slim.assets).map(url=>path.posix.normalize('play/'+url.split('?')[0])));
function metadata(dir,file){const data=read(path.join(root,'dist/assets',dir,file));assetPaths.add(`assets/${dir}/${file}`);return data;}
const globals=metadata('global-ui','manifest.json');for(const record of Object.values(globals))assetPaths.add('assets/global-ui/'+record.file);for(const f of ['stages.json','map_layout.json'])assetPaths.add('assets/global-ui/'+f);
const secret=metadata('secret-level','asset_manifest.json');for(const name of Object.keys(secret.assets))assetPaths.add('assets/secret-level/'+name);assetPaths.add('assets/secret-level/encounter_config.json');
const {AUDIO_ASSETS}=await load('audio-manifest.mjs');for(const a of Object.values(AUDIO_ASSETS))assetPaths.add(path.posix.normalize('play/'+a.url.split('?')[0]));
for(const f of ['global-game.css','game-hud.css'])for(const m of fs.readFileSync(path.join(app,f),'utf8').matchAll(/url\(['"]?(\.\.\/assets\/[^)'"?]+)/g))assetPaths.add(path.posix.normalize('play/'+m[1]));
const files=[];for(const rel of assetPaths){if(!rel.startsWith('assets/'))throw Error('Asset outside release root');const src=path.join(root,'dist',rel),dest=path.join(out,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(src,dest);const bytes=fs.readFileSync(dest);files.push({path:rel,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}
fs.writeFileSync(path.join(out,'index.html'),'<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./play/"><title>Claude &amp; Constance</title><a href="./play/">Play Claude &amp; Constance</a>');
const totals={};for(const f of files){const group=f.path.split('/')[1];totals[group]=(totals[group]||0)+f.bytes;}
const report={format:'candc-mobile-build-v1',inputHash,configuration:path.basename(args.config),configurationNotes:decoded.notes,plans,assetFiles:files.length,assetBytes:files.reduce((n,f)=>n+f.bytes,0),byGroup:totals,files};fs.writeFileSync(path.join(out,'build-report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({out,inputHash,plans,assetFiles:files.length,assetBytes:report.assetBytes,byGroup:totals}));

for(const name of ['README.md','verify-package.mjs'])fs.copyFileSync(path.join(templates,name),path.join(out,name));
