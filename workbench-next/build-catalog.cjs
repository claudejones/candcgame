// Transitional read-only catalog bridge. Does not execute the game runtime.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const text = fs.readFileSync(path.join(root, 'src/js/game-runtime.js'), 'utf8');
const block = text.split('let ASSET_SOURCES={')[1]?.split('\n};')[0];
if (!block) throw new Error('Runtime asset map changed; review catalog extraction.');
const assets = Object.fromEntries([...block.matchAll(/(\w+):"([^"]+)"/g)].map(([, key, source]) => {
  const file = path.resolve(root, 'src', source);
  if (!fs.existsSync(file)) throw new Error(`Missing asset: ${source}`);
  return [key, '../' + path.relative(root, file).split(path.sep).join('/')];
}));
if (!assets.run || !assets.na01Bird) throw new Error('Incomplete catalog.');
const output = JSON.stringify({ source: 'src/js/game-runtime.js ASSET_SOURCES', assets }, null, 2) + '\n';
const target = path.join(__dirname, 'asset-catalog.json');
if (process.argv.includes('--check')) {
  if (fs.readFileSync(target, 'utf8') !== output) throw new Error('Candidate catalog is stale.');
  console.log(`Catalog verified: ${Object.keys(assets).length} paths exist.`);
} else fs.writeFileSync(target, output);
