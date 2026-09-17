(() => {
  "use strict";
  if(!window.CC_APP?.isDevelopment) throw new Error("Design draft store requires development bootstrap");
  if(!window.GAME_SCHEMA) throw new Error("Design draft store requires GAME_SCHEMA");

  const STORAGE_KEY="cc-world-design-config-v1";
  const clone=value=>JSON.parse(JSON.stringify(value));
  const canonical=window.GAME_SCHEMA.buildCompatibilityView(window.GAME_CONFIG);
  const defaults=clone(canonical.stages);
  const listeners=new Set();
  const dirty=new Set();

  function loadSaved(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY); if(!raw) return clone(defaults);
      const parsed=JSON.parse(raw); if(parsed?.schemaVersion!==canonical.schemaVersion || !parsed?.stages) return clone(defaults);
      const merged=clone(defaults);
      for(const id of window.GAME_SCHEMA.STAGE_IDS) if(parsed.stages[id]) merged[id]=parsed.stages[id];
      return merged;
    }catch(error){ console.warn("Ignoring invalid local design config",error); return clone(defaults); }
  }
  let savedStages=loadSaved();
  let drafts=clone(savedStages);

  function persist(){
    localStorage.setItem(STORAGE_KEY,JSON.stringify({schemaVersion:canonical.schemaVersion,coordinateContract:canonical.coordinateContract,stages:savedStages}));
  }
  function assertStage(stageId){if(!drafts[stageId])throw new Error(`Unknown draft stage: ${stageId}`);}
  function parts(path){return Array.isArray(path)?path:String(path).split(".").filter(Boolean);}
  function getAt(root,path){return parts(path).reduce((value,key)=>value?.[key],root);}
  function setAt(root,path,value){const p=parts(path);let target=root;for(let i=0;i<p.length-1;i++)target=target[p[i]];target[p[p.length-1]]=value;}
  function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
  function notify(stageId){listeners.forEach(fn=>fn({stageId,dirty:dirty.has(stageId),dirtyCount:dirty.size}));}
  function recalc(stageId){if(same(drafts[stageId],savedStages[stageId]))dirty.delete(stageId);else dirty.add(stageId);notify(stageId);}

  const api={
    storageKey:STORAGE_KEY,
    getStage(stageId){assertStage(stageId);return drafts[stageId];},
    getValue(stageId,path){assertStage(stageId);return getAt(drafts[stageId],path);},
    setValue(stageId,path,value){assertStage(stageId);setAt(drafts[stageId],path,value);recalc(stageId);},
    isDirty(stageId){return dirty.has(stageId);},
    get dirtyCount(){return dirty.size;},
    revert(stageId){assertStage(stageId);drafts[stageId]=clone(savedStages[stageId]);dirty.delete(stageId);notify(stageId);},
    saveStage(stageId){assertStage(stageId);savedStages[stageId]=clone(drafts[stageId]);persist();dirty.delete(stageId);notify(stageId);return clone(savedStages[stageId]);},
    exportStage(stageId){assertStage(stageId);return JSON.stringify({schemaVersion:canonical.schemaVersion,coordinateContract:canonical.coordinateContract,stageId,stage:clone(drafts[stageId])},null,2);},
    exportGame(){return JSON.stringify({schemaVersion:canonical.schemaVersion,coordinateContract:canonical.coordinateContract,stages:clone(drafts)},null,2);},
    clearLocalSaves(){localStorage.removeItem(STORAGE_KEY);savedStages=clone(defaults);drafts=clone(defaults);dirty.clear();notify(null);},
    onChange(fn){listeners.add(fn);return()=>listeners.delete(fn);}
  };
  window.CC_DESIGN_DRAFT=Object.freeze(api);
})();
