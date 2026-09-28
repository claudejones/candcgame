(() => {
  "use strict";

  if(!window.CC_APP || !window.CC_APP.isDevelopment) throw new Error("Asset Navigator requires development bootstrap");

  const CONTINENTS = Object.freeze(window.CC_STAGE_CATALOG?window.CC_STAGE_CONTRACT.continents(window.CC_STAGE_CATALOG,window.GAME_CONFIG):[
    {id:"north-america", label:"North America", stages:["na01","na02","na03"]},
    {id:"south-america", label:"South America", stages:["sa01","sa02","sa03"]},
    {id:"europe", label:"Europe", stages:["eu01","eu02","eu03"]}
  ]);
  const LANDSCAPE = Object.freeze([
    {id:"far", label:"FAR"}, {id:"mid", label:"MID"}, {id:"ground", label:"GROUND"}
  ]);
  const STATIC = Object.freeze([
    {type:"character", id:"character", label:"Character"},
    {type:"finish", id:"finish", label:"Finish Marker"},
    {type:"stage", id:"stage", label:"Stage / Global"}
  ]);

  let selection = Object.freeze({continentId:"north-america", stageId:"na01", type:"landscape", assetId:"far", assetIndex:null});
  const listeners = new Set();

  function stageData(stageId){
    const cfg = window.GAME_CONFIG;
    const profile = cfg?.worldProfiles?.[stageId];
    if(!profile) return null;
    return {
      id:stageId,
      label:profile.label,
      hazards:(cfg.objectQA?.defs?.[stageId] || []).map((hazard,index) => ({id:`hazard-${index}`, index, label:hazard.name, kind:hazard.kind}))
    };
  }

  function normalize(next){
    const continent = CONTINENTS.find(c => c.id === next.continentId) || CONTINENTS[0];
    const stageId = continent.stages.includes(next.stageId) ? next.stageId : continent.stages[0];
    const stage = stageData(stageId);
    let type = next.type || "landscape";
    let assetId = next.assetId || "far";
    let assetIndex = Number.isInteger(next.assetIndex) ? next.assetIndex : null;
    if(type === "landscape" && !LANDSCAPE.some(a => a.id === assetId)) assetId = "far";
    if(type === "hazard") {
      if(!stage?.hazards.length) { type="landscape"; assetId="far"; assetIndex=null; }
      else {
        const hazard = stage.hazards.find(h => h.index === assetIndex) || stage.hazards[0];
        assetIndex = hazard.index; assetId = hazard.id;
      }
    }
    if(["character","finish","stage"].includes(type)) { assetId=type; assetIndex=null; }
    return Object.freeze({continentId:continent.id, stageId, type, assetId, assetIndex});
  }

  function setSelection(patch){
    const next = normalize({...selection, ...patch});
    const changed = Object.keys(next).some(key => next[key] !== selection[key]);
    if(!changed) return;
    selection = next;
    listeners.forEach(fn => fn(selection));
  }

  window.CC_DESIGN_SELECTION = Object.freeze({
    get current(){ return selection; },
    set:setSelection,
    onChange(fn){ listeners.add(fn); return () => listeners.delete(fn); },
    continents:CONTINENTS
  });

  function button(label, data, active, onClick, extraClass=""){
    const el=document.createElement("button");
    el.type="button";
    el.className=`asset-nav-item ${extraClass}`.trim();
    el.textContent=label;
    Object.assign(el.dataset,data);
    el.classList.toggle("active",active);
    el.setAttribute("aria-pressed",String(active));
    el.addEventListener("click",onClick);
    return el;
  }

  function mount(){
    if(document.getElementById("phase7AssetNavigator")) return;
    const host=document.querySelector(".phase7-runtime-host");
    if(!host) return;
    const nav=document.createElement("aside");
    nav.id="phase7AssetNavigator";
    nav.className="phase7-asset-navigator";
    nav.setAttribute("aria-label","Design Asset Navigator");
    host.prepend(nav);

    function render(){
      nav.hidden = window.CC_APP.mode !== "design";
      if(nav.hidden) return;
      const s=selection;
      const continent=CONTINENTS.find(c=>c.id===s.continentId);
      const stage=stageData(s.stageId);
      nav.replaceChildren();

      const heading=document.createElement("div"); heading.className="asset-nav-heading";
      heading.innerHTML="<strong>ASSET NAVIGATOR</strong><span>Authoring selection only</span>";
      nav.appendChild(heading);

      const continentLabel=document.createElement("label"); continentLabel.className="asset-nav-field"; continentLabel.textContent="CONTINENT";
      const continentSelect=document.createElement("select");
      CONTINENTS.forEach(c=>{const o=document.createElement("option");o.value=c.id;o.textContent=c.label;o.selected=c.id===s.continentId;continentSelect.appendChild(o);});
      continentSelect.addEventListener("change",()=>setSelection({continentId:continentSelect.value,stageId:CONTINENTS.find(c=>c.id===continentSelect.value).stages[0]}));
      continentLabel.appendChild(continentSelect); nav.appendChild(continentLabel);

      const stageLabel=document.createElement("label"); stageLabel.className="asset-nav-field"; stageLabel.textContent="STAGE";
      const stageSelect=document.createElement("select");
      continent.stages.forEach(id=>{const d=stageData(id);const o=document.createElement("option");o.value=id;o.textContent=d?.label||id.toUpperCase();o.selected=id===s.stageId;stageSelect.appendChild(o);});
      stageSelect.addEventListener("change",()=>setSelection({stageId:stageSelect.value}));
      stageLabel.appendChild(stageSelect); nav.appendChild(stageLabel);

      const section=(title)=>{const h=document.createElement("div");h.className="asset-nav-section-title";h.textContent=title;nav.appendChild(h);};
      section("LANDSCAPE");
      LANDSCAPE.forEach(a=>nav.appendChild(button(a.label,{assetType:"landscape",assetId:a.id},s.type==="landscape"&&s.assetId===a.id,()=>setSelection({type:"landscape",assetId:a.id,assetIndex:null}))));

      section("HAZARDS");
      stage.hazards.forEach(h=>nav.appendChild(button(h.label,{assetType:"hazard",assetIndex:String(h.index)},s.type==="hazard"&&s.assetIndex===h.index,()=>setSelection({type:"hazard",assetId:h.id,assetIndex:h.index}),h.kind)));

      section("OTHER");
      STATIC.forEach(a=>nav.appendChild(button(a.label,{assetType:a.type},s.type===a.type,()=>setSelection({type:a.type,assetId:a.id,assetIndex:null}))));

      const footer=document.createElement("div");footer.className="asset-nav-selection";
      footer.textContent=`Selected: ${s.stageId.toUpperCase()} / ${s.type.toUpperCase()} / ${s.assetId.toUpperCase()}`;
      nav.appendChild(footer);
    }

    render();
    window.CC_DESIGN_SELECTION.onChange(render);
    window.CC_APP.onModeChange(render);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",mount,{once:true}); else mount();
})();
