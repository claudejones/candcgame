// Transitional read-only catalog bridge. Does not execute the game runtime.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
// Seed from the deployed catalog; retired runtime aliases need not be present.
const priorCatalog = JSON.parse(fs.readFileSync(path.join(__dirname,'asset-catalog.json'),'utf8'));
let assets = {...priorCatalog.assets};
const context={window:{}}; vm.createContext(context);
for(const file of JSON.parse(fs.readFileSync(path.join(__dirname,'source-files.json'),'utf8')))vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
Object.assign(assets,context.window.CC_STAGE_CONTRACT.sources(context.window.CC_STAGE_CATALOG));
Object.assign(assets,context.window.CC_WORKBENCH_ASSET_READY_SOURCES||{});
assets=context.window.CC_LANDSCAPE_CONTRACT.sources(context.window.GAME_CONFIG,context.window.CC_LANDSCAPE_REGISTRY,assets);
for(const [key,source] of Object.entries(assets))if(!fs.existsSync(path.resolve(__dirname,source.split('?')[0])) && source!==priorCatalog.assets[key])throw new Error(`Missing new asset: ${source}`);
if (!assets.run || !assets.na01Bird) throw new Error('Incomplete catalog.');
const dimensions=Object.fromEntries(Object.entries(assets).map(([key,source])=>{const file=path.resolve(__dirname,source.split('?')[0]);if(!fs.existsSync(file))return [key,priorCatalog.dimensions[key]];const data=fs.readFileSync(file);return [key,{width:data.readUInt32BE(16),height:data.readUInt32BE(20)}];}));
const hashes=Object.fromEntries(Object.entries(assets).map(([key,source])=>[key,fs.existsSync(path.resolve(__dirname,source.split('?')[0]))?crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,source.split('?')[0]))).digest('hex'):priorCatalog.hashes[key]]));
// Content-address every runtime path, including legacy hazard atlases.
for(const key of Object.keys(assets))assets[key]=assets[key].split('?')[0]+'?v='+hashes[key].slice(0,12);
const handoffs=context.window.CC_WORKBENCH_ASSET_HANDOFFS||{};
const handoffStamp=Object.keys(handoffs).sort().map(id=>`${id}:${Object.values(handoffs[id].assets).map(a=>a.sha256.slice(0,12)).join(':')}`).join('|');
const baseline=context.window.CC_WORKBENCH_SOURCE_REVISION+(handoffStamp?`+asset-ready:${handoffStamp}`:'');
const migrations=JSON.parse(fs.readFileSync(path.join(__dirname,'project-migrations.json'),'utf8'));
const output = JSON.stringify({ source: 'game-runtime ASSET_SOURCES + active landscape registry', baseline, assets, dimensions, hashes, migrations }, null, 2) + '\n';
const target = path.join(__dirname, 'asset-catalog.json');
if (process.argv.includes('--check')) {
  if (fs.readFileSync(target, 'utf8') !== output) throw new Error('Candidate catalog is stale.');
  console.log(`Catalog verified: ${Object.keys(assets).length} paths exist.`);
} else fs.writeFileSync(target, output);

