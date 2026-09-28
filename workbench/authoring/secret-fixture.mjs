import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {descriptors} from '../dist/workbench-next/model.mjs';import {landscapeDescriptors} from '../dist/workbench-next/landscape.mjs';import {ProjectDraft,projectProvenance} from '../dist/workbench-next/project.mjs';
import {secretSnapshot,SecretRuntime} from '../dist/workbench-next/secret-runtime.mjs';import {drawSecret} from '../dist/workbench-next/secret-renderer.mjs';
const context={window:{}};vm.createContext(context);for(const file of JSON.parse(fs.readFileSync('authoring/workbench-next/source-files.json')))vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
const w=context.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);
const items=descriptors(config,w.GAME_SCHEMA),landscapes=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog=JSON.parse(fs.readFileSync('dist/workbench-next/asset-catalog.json')),draft=new ProjectDraft(items,landscapes,catalog.dimensions,projectProvenance(catalog,items,landscapes),catalog.migrations,config);
const manifest=JSON.parse(fs.readFileSync('dist/assets/secret-level/asset_manifest.json')),tuning=JSON.parse(fs.readFileSync('dist/assets/secret-level/encounter_config.json'));
const before=JSON.stringify(draft.export());
const make=who=>new SecretRuntime(secretSnapshot({config,draft,items,catalog,character:who},manifest,tuning));


export {make,manifest,tuning,config,draft,items,catalog};
