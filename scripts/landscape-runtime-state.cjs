// Exercise the real development host and inner renderer startup, then export
// their shared geometry for offline previews. This is not a browser acceptance test.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');

function load(mode = 'runtime', registryOverride) {
  const events = {}, frame = {src:'http://localhost/src/index.html'};
  const context = {URL, URLSearchParams, console,
    document:{documentElement:{dataset:{}},getElementById:()=>frame},
    history:{replaceState(){}},
    window:{location:{search:mode==='baseline'?'':'?landscapes=phase8',href:'http://localhost/src/dev.html'},
      addEventListener:(name,fn)=>{events[name]=fn;}}};
  vm.createContext(context);
  for (const file of ['game-config.js','landscape-registry.js','landscape-contract.js']) {
    vm.runInContext(read(`src/js/${file}`), context, {filename:file});
  }
  if (registryOverride) context.window.CC_LANDSCAPE_REGISTRY=structuredClone(registryOverride);
  if (mode==='host') {
    vm.runInContext(read('src/js/bootstrap/development-bootstrap.js'), context);
    events.DOMContentLoaded();
  } else {
    const runtime = read('src/js/game-runtime.js');
    const end = runtime.indexOf('const worldSourceW=');
    if (end<0) throw new Error('Runtime startup boundary missing');
    vm.runInContext(runtime.slice(0,end)+'})();', context);
  }
  return {context,config:context.window.GAME_CONFIG,registry:context.window.CC_LANDSCAPE_REGISTRY,
    contract:context.window.CC_LANDSCAPE_CONTRACT,frame};
}
function state(id, {preview=false}={}) {
  const runtime=load(), host=load('host');
  if (!runtime.registry.stages[id]) throw new Error(`Unknown landscape ${id}`);
  const active=runtime.contract.active(runtime.registry,id);
  if (!active && !preview) throw new Error(`${id}: pending; integrate the complete set before verifying runtime activation`);
  if (!active) {
    runtime.contract.applyStage(runtime.config,runtime.registry,id,true);
    host.contract.applyStage(host.config,host.registry,id,true);
  }
  const geometry=runtime.contract.assertCanonical(runtime.config,runtime.registry,id);
  const hostGeometry=host.contract.assertCanonical(host.config,host.registry,id);
  if (JSON.stringify(geometry)!==JSON.stringify(hostGeometry)) throw new Error(`${id}: host/runtime geometry differs`);
  return {stage:id,mode:active?'runtime':'prospective-preview',viewport:runtime.registry.viewport,geometry};
}
module.exports={load,state,ROOT,read};
if (require.main===module) {
  try {console.log(JSON.stringify(state((process.argv[2]||'').toLowerCase(),{preview:process.argv.includes('--preview')})));}
  catch(error){console.error(error.message);process.exitCode=1;}
}
