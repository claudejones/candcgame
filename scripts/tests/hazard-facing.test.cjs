const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const {load,read}=require('../landscape-runtime-state.cjs');
const contract=require('../../src/js/stage-contract.js');
const clone=value=>JSON.parse(JSON.stringify(value));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);

function canvas(){
  let matrix={x:1,y:1,tx:0,ty:0};const stack=[],draws=[];
  return {draws,save(){stack.push({...matrix});},restore(){matrix=stack.pop();},
    translate(x,y){matrix.tx+=matrix.x*x;matrix.ty+=matrix.y*y;},
    scale(x,y){matrix.x*=x;matrix.y*=y;},
    drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh){draws.push({source:[sx,sy,sw,sh],
      leftSourceX:matrix.tx+matrix.x*dx,rightSourceX:matrix.tx+matrix.x*(dx+dw),
      top:matrix.ty+matrix.y*dy,bottom:matrix.ty+matrix.y*(dy+dh)});}};
}

test('AF01 preview and game mirror every animal frame and collider around the fixed source anchor',()=>{
  const c=load('runtime'),source=read('src/js/game-runtime.js');c.context.CONFIG=c.config;
  vm.runInContext(source.slice(source.indexOf('class ObjectQA{'),source.indexOf('class Lab{'))+'\nthis.Preview=ObjectQA;this.Director=GameplayDirector;',c.context);
  c.config.activeWorld='af01';c.config.objectQA.x=650;c.config.objectQA.showBounds=false;c.config.objectQA.scrollWithWorld=false;
  for(const index of [1,2]){
    const d=c.config.objectQA.defs.af01[index];assert.equal(d.flipX,true);
    c.config.objectQA.activeIndex.af01=index;
    for(const mode of d.kind==='flying'?['high','low']:[null])for(let frame=0;frame<(d.frames||1);frame++){
      c.config.objectQA.flying.mode=mode;c.config.objectQA.flying.frame=frame;
      const ctx=canvas(),assets={[d.atlasKey]:{}},character={last:{},character:'claude',state:'run'};
      const preview=new c.context.Preview(ctx,assets,{lastRenderedSurfaceY:410},character);
      const director=Object.create(c.context.Director.prototype),inst={x:650,frame,mode,defName:d.name};
      Object.assign(director,{objectQA:preview,ctx,a:assets,cfg:()=>({enabled:true,elapsed:1,active:[inst]}),finishGeom:()=>null,drawHUD(){}});
      const g=director.geom(inst,d),original=director.geom(inst,{...d,flipX:false});
      near(g.dx+g.dw,1300-original.dx);near(g.dy,original.dy);
      near(g.box.x+g.box.w,1300-original.box.x);
      for(const key of ['w','h','y'])near(g.box[key],original.box[key]);
      preview.draw();director.draw();
      assert.deepEqual(ctx.draws[0],ctx.draws[1]);
      const draw=ctx.draws[0];assert.ok(draw.leftSourceX>draw.rightSourceX,'source nose/right edge must render on the left');
      assert.deepEqual(draw.source,[g.sx,g.sy,g.sw,g.sh]);
      assert.deepEqual(clone(preview.lastObjectBox),clone(g.box));
      // Mirroring is scoped to this sprite; following canvas content stays upright.
      ctx.drawImage({},0,0,1,1,10,20,30,40);assert.equal(ctx.draws.at(-1).leftSourceX,10);
    }
  }
});

test('facing defaults apply only to the two AF01 animals and survive old saved designs',()=>{
  const c=load('host');vm.runInContext(read('src/js/config-schema.js'),c.context);
  const view=clone(c.context.window.GAME_SCHEMA.buildCompatibilityView(c.config));
  for(const [id,stage] of Object.entries(view.stages))for(const [index,h] of stage.hazards.entries())
    assert.equal(h.transform.flipX,id==='af01'&&index>0?true:undefined);
  const old=clone(view);for(const h of old.stages.af01.hazards)delete h.transform.flipX;
  old.stages.af01.hazards[1].crop.l+=3;old.stages.na01.hazards[0].collision.x=.123;
  let saved=JSON.stringify(old);
  c.context.localStorage={getItem:()=>saved,setItem:(key,value)=>{saved=value;},removeItem(){}};
  vm.runInContext(read('src/js/dev/design-draft.js'),c.context);
  const drafts=c.context.window.CC_DESIGN_DRAFT;
  assert.equal(drafts.getStage('af01').hazards[1].transform.flipX,true);
  assert.equal(drafts.getStage('af01').hazards[1].crop.l,old.stages.af01.hazards[1].crop.l);
  assert.equal(drafts.getStage('na01').hazards[0].collision.x,.123);
  drafts.saveAll();assert.equal(JSON.parse(saved).stages.af01.hazards[2].transform.flipX,true);
  old.stages.af01.hazards[1].transform.flipX=false;
  drafts.importGame(old,{save:false});
  assert.equal(drafts.getStage('af01').hazards[1].transform.flipX,false);
  assert.equal(drafts.getStage('af01').hazards[2].transform.flipX,true);
  const exported=JSON.parse(drafts.exportGame());drafts.importGame(exported);
  assert.equal(drafts.getStage('af01').hazards[1].transform.flipX,false);
});

test('old full QA snapshots inherit missing facing while explicit settings and calibration survive',()=>{
  const defs=load('runtime').config.objectQA.defs,old=clone(defs);
  delete old.af01[1].flipX;old.af01[1].scale=.21;old.af01[2].flipX=false;
  const merged=contract.mergeKnown(defs,old);
  assert.equal(merged.af01[1].flipX,true);assert.equal(merged.af01[1].scale,.21);
  assert.equal(merged.af01[2].flipX,false);assert.deepEqual(merged.na01,clone(defs.na01));
  const stage=clone(load('runtime').context.window.CC_STAGE_CATALOG.stages.af01);
  stage.release.hazards[1].flipX='true';assert.throws(()=>contract.validateRelease(stage),/flipX/);
});
