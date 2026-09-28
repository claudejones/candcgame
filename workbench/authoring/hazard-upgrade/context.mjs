import fs from 'node:fs';import vm from 'node:vm';
import {descriptors} from '../../dist/workbench-next/model.mjs';import {landscapeDescriptors} from '../../dist/workbench-next/landscape.mjs';import {ProjectDraft,projectProvenance} from '../../dist/workbench-next/project.mjs';
const c={window:{}};vm.createContext(c);for(const f of JSON.parse(fs.readFileSync('authoring/workbench-next/source-files.json')))vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);
export const w=c.window,config=w.GAME_CONFIG;w.CC_LANDSCAPE_CONTRACT.apply(config,w.CC_LANDSCAPE_REGISTRY);
export const items=descriptors(config,w.GAME_SCHEMA),stages=landscapeDescriptors(config,w.CC_LANDSCAPE_REGISTRY,w.CC_LANDSCAPE_CONTRACT),catalog=JSON.parse(fs.readFileSync('dist/workbench-next/asset-catalog.json'));
export const makeDraft=()=>new ProjectDraft(items,stages,catalog.dimensions,projectProvenance(catalog,items,stages),catalog.migrations,config);
