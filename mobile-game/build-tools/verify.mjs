import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import crypto from 'node:crypto';import {pathToFileURL} from 'node:url';
const root=path.resolve(process.argv[2]),app=path.join(root,'play'),read=p=>JSON.parse(fs.readFileSync(p));
const data=read(path.join(app,'release.json')),report=read(path.join(root,'build-report.json'));
for(const f of report.files){const bytes=fs.readFileSync(path.join(root,f.path));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),f.sha256);}
const {runtimeSnapshot,PlayRuntime}=await import(pathToFileURL(path.join(app,'play-runtime.mjs'))),{AttractPlayback}=await import(pathToFileURL(path.join(app,'attract-mode.mjs')));
let runs=0;for(const f of fs.readdirSync(path.join(app,'plans'))){const sequence=read(path.join(app,'plans',f));for(const character of ['claude','constance']){
 const run=new PlayRuntime(runtimeSnapshot({...data,stage:sequence.stage,difficulty:sequence.profile,character,sequence}));run.start();const auto=new AttractPlayback(run);for(let n=0;n<5400;n++)auto.advance(1/60);assert.equal(run.time,90);assert.equal(run.status,'complete');assert.equal(run.hits,0,sequence.stage+' '+sequence.profile+' '+character);runs++;
}}
for(const f of fs.readdirSync(app).filter(f=>f.endsWith('.mjs'))){const s=fs.readFileSync(path.join(app,f),'utf8');for(const m of s.matchAll(/(?:from\s*|import\s*\()\s*['"]\.\/([^'"]+)['"]/g))assert(fs.existsSync(path.join(app,m[1])),m[1]);}
const html=fs.readFileSync(path.join(app,'index.html'),'utf8');assert(!/workbench|app\.mjs|mode-design|inspector|project-dialog/i.test(html));assert(html.includes('viewport-fit=cover'));
console.log(JSON.stringify({assetsVerified:report.files.length,fullRuns:runs,duration:90,hits:0,independentModulePaths:true}));
