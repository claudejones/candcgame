import {spawnSync} from 'node:child_process';
function run(file,args=[],cwd=process.cwd()){const r=spawnSync(process.execPath,[file,...args],{cwd,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);}
run('scripts/check-workbench.mjs');run('mobile-game/verify-package.mjs',['mobile-game']);
const wb=process.cwd()+'/workbench';
for(const name of ['player-state','global-game','screens','audio','finish-grounding','combination-planner','secret-conveyor','play-runtime'])run('authoring/'+name+'-qa.mjs',[],wb);
run('authoring/mobile-game/verify.mjs', ['../mobile-game'], wb);
run('authoring/mobile-game/host-qa.mjs', ['../mobile-game'], wb);
