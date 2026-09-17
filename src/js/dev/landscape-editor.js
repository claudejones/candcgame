(() => {
  "use strict";
  if(!window.CC_APP?.isDevelopment) throw new Error("Landscape editor requires development bootstrap");
  if(!window.CC_DESIGN_SELECTION||!window.CC_DESIGN_DRAFT)throw new Error("Landscape editor dependencies missing");

  const state={far:true,clouds:true,mid:true,ground:true,guides:true};
  function runtime(){return document.getElementById("sharedRuntime")?.contentWindow;}
  function send(){
    if(window.CC_APP.mode!=="design")return;
    const s=window.CC_DESIGN_SELECTION.current;
    runtime()?.postMessage({type:"CC_DESIGN_LANDSCAPE_PREVIEW",stageId:s.stageId,stage:window.CC_DESIGN_DRAFT.getStage(s.stageId),layers:{...state}},location.origin);
  }
  function mount(){
    if(document.getElementById("phase7LandscapeTools"))return;
    const nav=document.getElementById("phase7AssetNavigator");if(!nav)return;
    const tools=document.createElement("section");tools.id="phase7LandscapeTools";tools.className="landscape-tools";
    const h=document.createElement("div");h.className="asset-nav-section-title";h.textContent="LANDSCAPE VIEW";tools.appendChild(h);
    for(const key of ["far","clouds","mid","ground","guides"]){
      const label=document.createElement("label");label.className="landscape-toggle";const input=document.createElement("input");input.type="checkbox";input.checked=state[key];input.onchange=()=>{state[key]=input.checked;send();};label.append(input,document.createTextNode(key.toUpperCase()));tools.appendChild(label);
    }
    nav.appendChild(tools);
    document.getElementById("sharedRuntime")?.addEventListener("load",send);
    window.CC_DESIGN_SELECTION.onChange(send);window.CC_DESIGN_DRAFT.onChange(send);window.CC_APP.onModeChange(send);
    send();
  }
  window.CC_LANDSCAPE_EDITOR=Object.freeze({get layers(){return {...state};},refresh:send});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();
