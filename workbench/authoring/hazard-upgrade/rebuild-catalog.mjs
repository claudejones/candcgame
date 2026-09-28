import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';
const root=fs.mkdtempSync('/tmp/candc-hazard-build-');fs.cpSync('dist',root,{recursive:true});
for(const f of ['build-catalog.cjs','source-files.json','project-migrations.json'])fs.copyFileSync('authoring/workbench-next/'+f,root+'/workbench-next/'+f);
execFileSync(process.execPath,[root+'/workbench-next/build-catalog.cjs'],{stdio:'inherit'});
fs.copyFileSync(root+'/workbench-next/asset-catalog.json','dist/workbench-next/asset-catalog.json');fs.rmSync(root,{recursive:true});
