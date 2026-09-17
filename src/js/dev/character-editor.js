(() => {
  "use strict";
  if(!window.CC_APP?.isDevelopment)throw new Error("Character editor requires development bootstrap");
  let character="claude",state="run";
  const runtime=()=>document.getElementById("sharedRuntime")?.contentWindow;
  function apply(){
    if(window.CC_APP.mode!=="design"||window.CC_DESIGN_SELECTION.current.type!=="character")return;
    const w=runtime();if(!w?.GAME_CONFIG)return;const g=window.CC_DESIGN_DRAFT.getGlobals().character,s=window.CC_DESIGN_SELECTION.current,stage=window.CC_DESIGN_DRAFT.getStage(s.stageId);
    w.GAME_CONFIG.activeWorld=s.stageId;w.GAME_CONFIG.masterScale[character]=g.masterScale[character];w.GAME_CONFIG.stateScale[character][state]=g.stateScale[character][state];w.GAME_CONFIG.renderOffsetX[character][state]=g.renderOffsetX[character][state];w.GAME_CONFIG.renderOffsetY[character][state]=g.renderOffsetY[character][state];w.GAME_CONFIG.objectQA.characterCollision[character][state]={...g.collision[character][state]};w.GAME_CONFIG.worldProfiles[s.stageId].characterGrounding[character]=stage.character.grounding[character];
    const doc=w.document,stateButton=doc.querySelector(`[data-state="${state}"]`);stateButton?.click();
    const label=doc.getElementById("characterLabel");if(label&&label.textContent.toLowerCase()!==character)doc.getElementById("characterBtn")?.click();
  }
  function select(who,nextState){character=who;state=nextState;document.dispatchEvent(new CustomEvent("cc-character-selection"));apply();}
  window.CC_CHARACTER_EDITOR=Object.freeze({get character(){return character;},get state(){return state;},select,refresh:apply});
  window.CC_DESIGN_SELECTION.onChange(apply);window.CC_DESIGN_DRAFT.onChange(apply);window.CC_APP.onModeChange(apply);document.getElementById("sharedRuntime")?.addEventListener("load",apply);
})();
