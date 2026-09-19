// Build a minimal, independent static preview from the GitHub candidate source.
// Existing game/editor entry points and source artwork are read-only inputs.
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {descriptors} from './model.mjs';

const source = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(source);
const target = process.argv[2] && path.resolve(process.argv[2]);
if (!target || target === root || target.startsWith(root + path.sep)) {
  throw new Error('Use an explicit preview checkout outside the game repository.');
}
const publicRoot = path.join(target, 'public');
const context = {window:{}};
vm.createContext(context);
for (const filename of ['game-config.js', 'config-schema.js']) {
  vm.runInContext(await fs.readFile(path.join(root, 'src/js', filename), 'utf8'), context);
}
const items = descriptors(context.window.GAME_CONFIG, context.window.GAME_SCHEMA);
const catalog = JSON.parse(await fs.readFile(path.join(source, 'asset-catalog.json'), 'utf8'));
const keys = [...new Set(items.map(item => item.asset))];
const assets = Object.fromEntries(keys.map(key => [key,catalog.assets[key]]));

async function copy(relative) {
  const destination = path.join(publicRoot, relative);
  await fs.mkdir(path.dirname(destination), {recursive:true});
  await fs.copyFile(path.join(root, relative), destination);
}
for (const filename of ['index.html','app.mjs','model.mjs','style.css','AUDIT.md','PLAN.md']) {
  await copy(`workbench-next/${filename}`);
}
for (const filename of ['game-config.js','config-schema.js']) await copy(`src/js/${filename}`);
for (const sourcePath of Object.values(assets)) {
  const relative = path.relative(root,path.resolve(source,sourcePath));
  if (!relative.startsWith('assets' + path.sep)) throw new Error('Unexpected asset location');
  await copy(relative);
}
await fs.writeFile(path.join(publicRoot,'workbench-next/asset-catalog.json'),JSON.stringify({source:catalog.source,assets},null,2)+'\n');
await fs.writeFile(path.join(publicRoot,'index.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>C&C Workbench — Design Preview</title><meta http-equiv="refresh" content="0;url=./workbench-next/"><a href="./workbench-next/">Open the C&C editor preview</a></html>\n');
await fs.writeFile(path.join(target,'README.md'),'# C&C Workbench preview\n\nDerived publication of `claudejones/candcgame`, branch `editor-next`.\nEdit the GitHub source, then run its `workbench-next/build-preview.mjs` against this checkout.\nThis private preview does not replace the GitHub Pages game/editor.\n');
console.log(`Prepared sprite preview: ${keys.length} images, ${items.length} sprite/state definitions.`);
