(() => {
  "use strict";
  if(!window.CC_APP?.isDevelopment)throw new Error("Test mode requires development bootstrap");
  const runtime=()=>document.getElementById("sharedRuntime")?.contentWindow;
  const click=id=>runtime()?.document.getElementById(id)?.click();
  function mount(){
    const host=document.querySelector(".phase7-runtime-host");if(!host||document.getElementById("phase7TestControls"))return;
    const panel=document.createElement("aside");panel.id="phase7TestControls";panel.className="phase7-test-controls";panel.innerHTML=`<strong>TEST MODE</strong><label>Stage<select id="testStage"></select></label><label>Character<select id="testCharacter"><option value="claude">Claude</option><option value="constance">Constance</option></select></label><div class="test-actions"><button data-action="run">RUN</button><button data-action="reset">RESET</button></div><label class="test-check"><input id="testUnlimited" type="checkbox"> Unlimited Lives</label><div class="test-actions"><button data-action="collision">COLLISION BOUNDS</button><button data-action="ground">GROUND GUIDE</button></div><p>Focused gameplay validation only. Authoring controls are not available in Test mode.</p>`;host.prepend(panel);
    const stage=panel.querySelector("#testStage");for(const id of window.GAME_SCHEMA.STAGE_IDS){const o=document.createElement("option");o.value=id;o.textContent=window.GAME_CONFIG.worldProfiles[id].label;stage.appendChild(o);}
    stage.onchange=()=>{const w=runtime();if(!w?.GAME_CONFIG)return;w.GAME_CONFIG.activeWorld=stage.value;const s=w.document.getElementById("stageSelect");if(s){s.value=stage.value;s.dispatchEvent(new Event("change",{bubbles:true}));}};
    panel.querySelector("#testCharacter").onchange=e=>{const w=runtime();if(!w?.document)return;const current=w.document.getElementById("characterLabel")?.textContent?.toLowerCase();if(current!==e.target.value)click("characterBtn");};
    panel.querySelector("#testUnlimited").onchange=e=>{const w=runtime();if(!w?.GAME_CONFIG)return;w.GAME_CONFIG.spawnDirector.unlimitedLives=e.target.checked;};
    panel.addEventListener("click",e=>{const a=e.target.dataset.action;if(!a)return;if(a==="run")click("runStageBtn");else if(a==="reset")click("resetStageBtn")||click("exitRunBtn");else if(a==="collision")click("objectBoundsToggle");else if(a==="ground")click("guidesToggle");});
    function sync(mode){panel.hidden=mode!=="test";if(panel.hidden)return;const w=runtime();if(!w?.GAME_CONFIG)return;stage.value=w.GAME_CONFIG.activeWorld;panel.querySelector("#testUnlimited").checked=!!w.GAME_CONFIG.spawnDirector.unlimitedLives;}
    window.CC_APP.onModeChange(sync);document.getElementById("sharedRuntime")?.addEventListener("load",()=>sync(window.CC_APP.mode));sync(window.CC_APP.mode);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();