// Transitional read-only catalog bridge. Does not execute the game runtime.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const text = fs.readFileSync(path.join(root, 'src/js/game-runtime.js'), 'utf8');
const block = text.split('let ASSET_SOURCES={')[1]?.split('\n};')[0];
if (!block) throw new Error('Runtime asset map changed; review catalog extraction.');
let assets = Object.fromEntries([...block.matchAll(/(\w+):"([^"]+)"/g)].map(([, key, source]) => {
  const file = path.resolve(root, 'src', source);
  if (!fs.existsSync(file)) throw new Error(`Missing asset: ${source}`);
  return [key, '../' + path.relative(root, file).split(path.sep).join('/')];
}));
const context={window:{}}; vm.createContext(context);
for(const file of JSON.parse(fs.readFileSync(path.join(__dirname,'source-files.json'),'utf8')))vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
Object.assign(assets,context.window.CC_STAGE_CONTRACT.sources(context.window.CC_STAGE_CATALOG));
Object.assign(assets,context.window.CC_WORKBENCH_ASSET_READY_SOURCES||{});
assets=context.window.CC_LANDSCAPE_CONTRACT.sources(context.window.GAME_CONFIG,context.window.CC_LANDSCAPE_REGISTRY,assets);
for(const source of Object.values(assets))if(!fs.existsSync(path.resolve(__dirname,source.split('?')[0])))throw new Error(`Missing selected asset: ${source}`);
if (!assets.run || !assets.na01Bird) throw new Error('Incomplete catalog.');
const dimensions=Object.fromEntries(Object.entries(assets).map(([key,source])=>{const data=fs.readFileSync(path.resolve(__dirname,source.split('?')[0]));return [key,{width:data.readUInt32BE(16),height:data.readUInt32BE(20)}];}));
const hashes=Object.fromEntries(Object.entries(assets).map(([key,source])=>[key,crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,source.split('?')[0]))).digest('hex')]));
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
