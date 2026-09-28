const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const {load,read}=require('../landscape-runtime-state.cjs');

function runtimeClasses(loaded){
  const source=read('src/js/game-runtime.js');
  loaded.context.CONFIG=loaded.config;
  vm.runInContext(`
    const CHAR={claude:{row:0,label:'CLAUDE'},constance:{row:1,label:'CONSTANCE'}};
    const worldSourceW=()=>CONFIG.worldProfiles[CONFIG.activeWorld]?.sourceW||CONFIG.worldContract.sourceW;
    ${source.slice(source.indexOf('class CharacterMachine{'),source.indexOf('class Lab{'))}
    this.Character=CharacterMachine;this.ObjectPreview=ObjectQA;this.Director=GameplayDirector;
  `,loaded.context);
}

function characterFoot(loaded){
  const machine=new loaded.context.Character({run:{},stars:{}}),draws=[];
  machine.character='claude';machine.state='run';machine.frame=0;
  machine.draw({drawImage(...args){draws.push(args);},save(){},restore(){}});
  assert.equal(draws.length,1);
  return machine.last.footY;
}

test('active landscape contract fixes character, hazard, and finish anchors at registry ground Y',()=>{
  const active=load('runtime');runtimeClasses(active);active.config.activeWorld='na01';
  const profile=active.config.worldProfiles.na01;
  profile.seamY=487;profile.groundYOffset=63;
  assert.equal(characterFoot(active),active.registry.viewport.groundSurfaceY+active.config.worldContract.footOffset.claude);

  const scene={lastRenderedSurfaceY:550},character={last:{},character:'claude',state:'run'};
  const preview=new active.context.ObjectPreview({}, {}, scene, character);
  assert.equal(preview.surfaceY(),410);
  const director=Object.create(active.context.Director.prototype);
  director.objectQA=preview;director.cfg=()=>({stageDuration:90,elapsed:87,finishRelease:5});
  director.finishCfg=()=>({scale:.22,groundOffset:24,xOffset:-4});director.a={finishMarker:{width:100,height:200}};
  const finish=director.finishGeom();
  assert.equal(finish.dy+finish.dh,410+24);
});

test('packaged legacy anchors retain rendered seam and offset behavior',()=>{
  const legacy=load('baseline');runtimeClasses(legacy);legacy.config.activeWorld='na01';
  const profile=legacy.config.worldProfiles.na01;
  profile.seamY=487;profile.groundYOffset=63;
  assert.equal(characterFoot(legacy),487+63+legacy.config.worldContract.footOffset.claude);
  const preview=new legacy.context.ObjectPreview({}, {}, {lastRenderedSurfaceY:550},{last:{},character:'claude',state:'run'});
  assert.equal(preview.surfaceY(),550);
  const director=Object.create(legacy.context.Director.prototype);
  director.objectQA=preview;director.cfg=()=>({stageDuration:90,elapsed:87,finishRelease:5});
  director.finishCfg=()=>({scale:.22,groundOffset:24,xOffset:-4});director.a={finishMarker:{width:100,height:200}};
  const finish=director.finishGeom();
  assert.equal(finish.dy+finish.dh,550+24);
});
