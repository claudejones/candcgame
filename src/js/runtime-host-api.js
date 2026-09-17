(() => {
  "use strict";
  const BUILD_LABEL="PHASE 7 • QA";
  const frame=()=>document.getElementById("sharedRuntime")||document.getElementById("productionRuntime");
  const win=()=>frame()?.contentWindow,doc=()=>frame()?.contentDocument;
  const el=id=>doc()?.getElementById(id),click=id=>el(id)?.click();
  function suppressLegacyChrome(){const d=doc();if(!d||d.getElementById("phase7HostedRuntimeStyle"))return;const s=d.createElement("style");s.id="phase7HostedRuntimeStyle";s.textContent=`.debug,.tuner,.tuner-tab,.status,.legend,.build-id{display:none!important}.wrap{width:100%!important;max-width:none!important;margin:0!important;padding:0!important}.board{border:0!important;width:100%!important;aspect-ratio:16/9!important}body{overflow:hidden!important}`;d.head.appendChild(s);}
  function setStage(id){const w=win(),d=doc();if(!w?.GAME_CONFIG?.worldProfiles?.[id])return false;const s=d?.getElementById("stageSelect");if(s){s.value=id;s.dispatchEvent(new Event("change",{bubbles:true}));}else w.GAME_CONFIG.activeWorld=id;return true;}
  function setCharacter(who){const d=doc();if(!d)return false;const current=d.getElementById("characterLabel")?.textContent?.trim().toLowerCase();if(current!==who)click("characterBtn");return true;}
  function setCharacterState(state){const b=doc()?.querySelector(`[data-state="${state}"]`);if(!b)return false;b.click();return true;}
  function startRun(){click("runStageBtn");}
  function resetRun(){const d=doc();if(!d)return;const sp=win()?.GAME_CONFIG?.spawnDirector;if(sp?.failed)click("exitRunBtn");click("resetStageBtn");}
  function setCollisionBounds(on){const w=win();if(!w?.GAME_CONFIG)return;w.GAME_CONFIG.objectQA.showBounds=!!on;w.GAME_CONFIG.characterQA.showCollisionBounds=!!on;}
  function setGroundGuide(on){const w=win();if(!w?.GAME_CONFIG)return;w.GAME_CONFIG.worldContract.showGuides=!!on;}
  function setWorldLayers(layers){const d=doc();if(!d)return;for(const [key,id] of Object.entries({far:"qaFarToggle",clouds:"qaCloudsToggle",mid:"qaMidToggle",ground:"qaGroundToggle"})){if(typeof layers[key]!=="boolean")continue;const b=d.getElementById(id);if(b&&b.classList.contains("active")!==layers[key])b.click();}}
  function getState(){const w=win(),d=doc(),cfg=w?.GAME_CONFIG;if(!cfg||!d)return null;const text=id=>d.getElementById(id)?.textContent?.trim()||"—",stage=cfg.activeWorld,profile=cfg.worldProfiles?.[stage],idx=cfg.objectQA?.activeIndex?.[stage]||0,h=cfg.objectQA?.defs?.[stage]?.[idx],sp=cfg.spawnDirector||{};return{build:BUILD_LABEL,stage,stageLabel:profile?.label||stage,character:text("characterLabel"),characterState:text("stateLabel"),frame:text("frameLabel"),renderedSurface:text("worldRenderedSurface"),scroll:text("scrollLabel"),hazard:h?.name||"—",collision:text("objectCollisionState"),spawnTime:text("spawnTime"),spawnPhase:text("spawnPhase"),activeCount:sp.active?.length??0,cleared:sp.cleared??0,hits:sp.hits??0,lastEvent:sp.lastEvent||"—",runEnabled:!!sp.enabled,runPaused:!!sp.paused,runFailed:!!sp.failed,runFinished:!!sp.finished};}
  function refresh(){suppressLegacyChrome();}
  const api=Object.freeze({BUILD_LABEL,frame,win,doc,refresh,setStage,setCharacter,setCharacterState,startRun,resetRun,setCollisionBounds,setGroundGuide,setWorldLayers,getState});
  window.CC_RUNTIME_API=api;
  window.addEventListener("DOMContentLoaded",()=>{frame()?.addEventListener("load",refresh);refresh();});
})();