(() => {
  "use strict";
  if(!window.CC_APP?.isDevelopment)throw new Error("Runtime Monitor requires development bootstrap");
  const text=(doc,id)=>doc.getElementById(id)?.textContent?.trim()||"—";
  function mount(){
    if(document.getElementById("phase7RuntimeMonitor"))return;const panel=document.createElement("section");panel.id="phase7RuntimeMonitor";panel.className="runtime-monitor collapsed";
    const head=document.createElement("button");head.type="button";head.className="runtime-monitor-toggle";head.innerHTML="<strong>RUNTIME MONITOR</strong><span>+</span>";const body=document.createElement("div");body.className="runtime-monitor-body";panel.append(head,body);document.body.appendChild(panel);
    head.onclick=()=>{panel.classList.toggle("collapsed");head.querySelector("span").textContent=panel.classList.contains("collapsed")?"+":"−";};
    function render(){
      panel.hidden=window.CC_APP.mode==="game";if(panel.hidden)return;const w=document.getElementById("sharedRuntime")?.contentWindow,doc=w?.document,cfg=w?.GAME_CONFIG;if(!doc||!cfg)return;
      const stage=cfg.activeWorld,profile=cfg.worldProfiles?.[stage],idx=cfg.objectQA?.activeIndex?.[stage]||0,hazard=cfg.objectQA?.defs?.[stage]?.[idx],sp=cfg.spawnDirector||{};
      body.innerHTML=`<div><b>Build</b><span>PHASE 7G–7I • QA</span></div><div><b>Stage</b><span>${profile?.label||stage}</span></div><div><b>Character</b><span>${text(doc,"characterLabel")} / ${text(doc,"stateLabel")} / frame ${text(doc,"frameLabel")}</span></div><div><b>Ground</b><span>canonical Y=${window.GAME_SCHEMA.GROUND_SURFACE_Y} • rendered ${text(doc,"worldRenderedSurface")}</span></div><div><b>World</b><span>scroll ${text(doc,"scrollLabel")} • ${text(doc,"spawnTime")}</span></div><div><b>Hazard</b><span>${hazard?.name||"—"} • ${text(doc,"objectCollisionState")}</span></div><div><b>Spawn</b><span>${text(doc,"spawnPhase")} • active ${sp.active?.length??0} • cleared ${sp.cleared??0} • hits ${sp.hits??0}</span></div><div><b>Event</b><span>${sp.lastEvent||"—"}</span></div>`;
    }
    setInterval(render,250);window.CC_APP.onModeChange(render);document.getElementById("sharedRuntime")?.addEventListener("load",render);render();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();
