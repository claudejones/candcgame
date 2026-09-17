(() => {
  "use strict";
  if(!window.CC_APP?.isDevelopment) throw new Error("Design draft store requires development bootstrap");
  if(!window.GAME_SCHEMA) throw new Error("Design draft store requires GAME_SCHEMA");

  const clone = value => JSON.parse(JSON.stringify(value));
  const canonical = window.GAME_SCHEMA.buildCompatibilityView(window.GAME_CONFIG);
  const savedStages = clone(canonical.stages);
  const drafts = clone(savedStages);
  const dirty = new Set();
  const listeners = new Set();

  function assertStage(stageId){ if(!drafts[stageId]) throw new Error(`Unknown draft stage: ${stageId}`); }
  function pathParts(path){ return Array.isArray(path) ? path : String(path).split(".").filter(Boolean); }
  function getAt(root,path){ return pathParts(path).reduce((value,key)=>value?.[key],root); }
  function setAt(root,path,value){
    const parts=pathParts(path); let target=root;
    for(let i=0;i<parts.length-1;i++) target=target[parts[i]];
    target[parts[parts.length-1]]=value;
  }
  function same(a,b){ return JSON.stringify(a)===JSON.stringify(b); }
  function notify(stageId){ listeners.forEach(fn=>fn({stageId,dirty:dirty.has(stageId),dirtyCount:dirty.size})); }
  function recalc(stageId){
    if(same(drafts[stageId],savedStages[stageId])) dirty.delete(stageId); else dirty.add(stageId);
    notify(stageId);
  }

  const api={
    getStage(stageId){ assertStage(stageId); return drafts[stageId]; },
    getValue(stageId,path){ assertStage(stageId); return getAt(drafts[stageId],path); },
    setValue(stageId,path,value){ assertStage(stageId); setAt(drafts[stageId],path,value); recalc(stageId); },
    isDirty(stageId){ return dirty.has(stageId); },
    get dirtyCount(){ return dirty.size; },
    revert(stageId){ assertStage(stageId); drafts[stageId]=clone(savedStages[stageId]); dirty.delete(stageId); notify(stageId); },
    saveStage(stageId){
      assertStage(stageId);
      savedStages[stageId]=clone(drafts[stageId]);
      dirty.delete(stageId); notify(stageId);
      return clone(savedStages[stageId]);
    },
    exportStage(stageId){ assertStage(stageId); return JSON.stringify({schemaVersion:canonical.schemaVersion,stageId,stage:clone(drafts[stageId])},null,2); },
    onChange(fn){ listeners.add(fn); return ()=>listeners.delete(fn); }
  };
  window.CC_DESIGN_DRAFT=Object.freeze(api);
})();
