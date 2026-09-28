import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import vm from 'node:vm';import {descriptors} from '../workbench/dist/workbench-next/model.mjs';
const root=path.resolve('workbench/dist'),app=path.join(root,'workbench-next');
const catalog=JSON.parse(fs.readFileSync(path.join(app,'asset-catalog.json')));
const context={window:{}};vm.createContext(context);for(const f of JSON.parse(fs.readFileSync('workbench/authoring/workbench-next/source-files.json')))vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context);
const active=new Set(descriptors(context.window.GAME_CONFIG,context.window.GAME_SCHEMA).map(i=>i.asset));
for(const [key,url] of Object.entries(catalog.assets)){
 const file=path.resolve(app,url.split('?')[0]);assert(file.startsWith(root+path.sep));
 if(!fs.existsSync(file)&&/^na0[123]Objects$/.test(key)){assert(!active.has(key),'Obsolete atlas still active: '+key);continue;}
 const b=fs.readFileSync(file);if(catalog.hashes[key])assert.equal(crypto.createHash('sha256').update(b).digest('hex'),catalog.hashes[key],key);
}
for(const file of fs.readdirSync(app).filter(f=>f.endsWith('.mjs'))){
 const s=fs.readFileSync(path.join(app,file),'utf8');for(const m of s.matchAll(/(?:from\s*|import\s*\()\s*['"]\.\/([^'"]+)['"]/g))assert(fs.existsSync(path.join(app,m[1])),file+' → '+m[1]);
}
const html=fs.readFileSync(path.join(app,'index.html'),'utf8');for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){if(/^(https?:|data:)/.test(m[1]))continue;assert(fs.existsSync(path.resolve(app,m[1])),m[1]);}
console.log('Workbench catalog hashes, entry-point resources and module imports verified.');
