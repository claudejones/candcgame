(() => {
  "use strict";
  if(!window.CC_APP?.isDevelopment)throw new Error("Landscape editor requires development bootstrap");
  if(!window.CC_DESIGN_SELECTION||!window.CC_DESIGN_DRAFT)throw new Error("Landscape editor dependencies missing");

  const state={far:true,clouds:true,mid:true,ground:true,guides:true};
  function frame(){return document.getElementById("sharedRuntime");}
  function setLayer(doc,id,want){const b=doc.getElementById(id);if(!b)return;const isOn=b.classList.contains("active");if(isOn!==want)b.click();}
  function apply(){
    if(window.CC_APP.mode!=="design")return;
    const f=frame(),rw=f?.contentWindow,doc=f?.contentDocument;if(!rw?.GAME_CONFIG||!doc)return;
    const s=window.CC_DESIGN_SELECTION.current,stage=window.CC_DESIGN_DRAFT.getStage(s.stageId),cfg=rw.GAME_CONFIG,p=cfg.worldProfiles[s.stageId];if(!p)return;
    if(cfg.activeWorld!==s.stageId){const select=doc.getElementById("stageSelect");if(select){select.value=s.stageId;select.dispatchEvent(new Event("change",{bubbles:true}));}else cfg.activeWorld=s.stageId;}
    const baseScale=cfg.canvas.w/cfg.worldContract.sourceW;
    p.farScale=stage.landscape.far.transform.scale/baseScale;p.farY=stage.landscape.far.transform.offsetY;
    p.midScale=stage.landscape.mid.transform.scale/baseScale;p.midYOffset=stage.landscape.mid.transform.offsetY;p.midParallax=stage.landscape.mid.transform.parallax;
    p.groundScale=stage.landscape.ground.transform.scale/baseScale;p.groundYOffset=stage.landscape.ground.transform.offsetY;p.groundParallax=stage.landscape.ground.transform.parallax;
    cfg.worldContract.showGuides=state.guides;
    setLayer(doc,"qaFarToggle",state.far);setLayer(doc,"qaCloudsToggle",state.clouds);setLayer(doc,"qaMidToggle",state.mid);setLayer(doc,"qaGroundToggle",state.ground);
  }
  function ensureTools(){
    if(window.CC_APP.mode!=="design"||document.getElementById("phase7LandscapeTools"))return;
    const nav=document.getElementById("phase7AssetNavigator");if(!nav)return;const tools=document.createElement("section");tools.id="phase7LandscapeTools";tools.className="landscape-tools";
    const h=document.createElement("div");h.className="asset-nav-section-title";h.textContent="LANDSCAPE VIEW";tools.appendChild(h);
    for(const key of ["far","clouds","mid","ground","guides"]){const label=document.createElement("label");label.className="landscape-toggle";const input=document.createElement("input");input.type="checkbox";input.checked=state[key];input.onchange=()=>{state[key]=input.checked;apply();};label.append(input,document.createTextNode(key.toUpperCase()));tools.appendChild(label);}
    nav.appendChild(tools);
  }
  function refresh(){ensureTools();apply();}
  function mount(){frame()?.addEventListener("load",refresh);window.CC_DESIGN_SELECTION.onChange(refresh);window.CC_DESIGN_DRAFT.onChange(apply);window.CC_APP.onModeChange(refresh);refresh();}
  window.CC_LANDSCAPE_EDITOR=Object.freeze({get layers(){return{...state};},refresh});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();
