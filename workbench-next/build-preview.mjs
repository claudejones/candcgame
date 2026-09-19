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
const outputRoot = path.join(target, 'dist');
// This directory is generated output. Remove stale artwork from earlier snapshots.
await fs.rm(outputRoot,{recursive:true,force:true});
await fs.mkdir(outputRoot,{recursive:true});
const context = {window:{}};
vm.createContext(context);
const dependencies=['game-config.js','config-schema.js','landscape-registry.js','landscape-contract.js'];
for (const filename of dependencies) {
  vm.runInContext(await fs.readFile(path.join(root, 'src/js', filename), 'utf8'), context);
}
const items = descriptors(context.window.GAME_CONFIG, context.window.GAME_SCHEMA);
const catalog = JSON.parse(await fs.readFile(path.join(source, 'asset-catalog.json'), 'utf8'));
const landscapeKeys=Object.values(context.window.GAME_CONFIG.worldProfiles).flatMap(p=>[p.farKey,p.midKey,p.groundKey]);
const keys = [...new Set([...items.map(item => item.asset),...landscapeKeys,'clouds'])];
const assets = Object.fromEntries(keys.map(key => [key,catalog.assets[key]]));

async function copy(relative) {
  const destination = path.join(outputRoot, relative);
  await fs.mkdir(path.dirname(destination), {recursive:true});
  await fs.copyFile(path.join(root, relative), destination);
}
for (const filename of ['index.html','app.mjs','model.mjs','landscape.mjs','frame-editor.mjs','project.mjs','project-ui.mjs','workspace-ui.mjs','asset-loader.mjs','style.css','AUDIT.md','PLAN.md']) {
  await copy(`workbench-next/${filename}`);
}
for (const filename of dependencies) await copy(`src/js/${filename}`);
for (const sourcePath of Object.values(assets)) {
  const relative = path.relative(root,path.resolve(source,sourcePath.split('?')[0]));
  if (!relative.startsWith('assets' + path.sep)) throw new Error('Unexpected asset location');
  await copy(relative);
}
await fs.writeFile(path.join(outputRoot,'workbench-next/asset-catalog.json'),JSON.stringify({...catalog,assets},null,2)+'\n');
await fs.writeFile(path.join(outputRoot,'index.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>C&C Workbench — Design Preview</title><meta http-equiv="refresh" content="0;url=./workbench-next/"><a href="./workbench-next/">Open the C&C editor preview</a></html>\n');
await fs.writeFile(path.join(target,'README.md'),'# C&C Workbench preview\n\nDerived publication of `claudejones/candcgame`, branch `editor-next`.\nEdit the GitHub source, then run its `workbench-next/build-preview.mjs` against this checkout.\nThis private preview does not replace the GitHub Pages game/editor.\n');
console.log(`Prepared Design preview: ${keys.length} images, 9 landscapes and ${items.length} sprite/state definitions. Images load on selection.`);
