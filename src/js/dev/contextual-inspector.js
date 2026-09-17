(() => {
  "use strict";
  if(!window.CC_APP?.isDevelopment) throw new Error("Contextual Inspector requires development bootstrap");
  if(!window.CC_DESIGN_SELECTION || !window.CC_DESIGN_DRAFT) throw new Error("Contextual Inspector dependencies missing");

  const field=(label,path,value,step=1)=>{
    const row=document.createElement("label"); row.className="inspector-field";
    const title=document.createElement("span"); title.textContent=label; row.appendChild(title);
    const control=document.createElement("div"); control.className="numeric-control";
    const down=document.createElement("button"); down.type="button"; down.textContent="−";
    const input=document.createElement("input"); input.type="number"; input.step=String(step); input.value=String(value); input.dataset.path=path;
    const up=document.createElement("button"); up.type="button"; up.textContent="+";
    const commit=v=>{ const n=Number(v); if(Number.isFinite(n)) window.CC_DESIGN_DRAFT.setValue(window.CC_DESIGN_SELECTION.current.stageId,path,n); };
    down.addEventListener("click",()=>{input.stepDown();commit(input.value);});
    up.addEventListener("click",()=>{input.stepUp();commit(input.value);});
    input.addEventListener("change",()=>commit(input.value));
    control.append(down,input,up); row.appendChild(control); return row;
  };
  const group=(title)=>{const el=document.createElement("section");el.className="inspector-group";const h=document.createElement("h3");h.textContent=title;el.appendChild(h);return el;};
  const note=text=>{const p=document.createElement("p");p.className="inspector-note";p.textContent=text;return p;};

  function mount(){
    if(document.getElementById("phase7ContextualInspector")) return;
    const host=document.querySelector(".phase7-runtime-host"); if(!host) return;
    const panel=document.createElement("aside"); panel.id="phase7ContextualInspector"; panel.className="phase7-contextual-inspector"; panel.setAttribute("aria-label","Contextual Inspector"); host.appendChild(panel);

    function render(){
      panel.hidden=window.CC_APP.mode!=="design"; if(panel.hidden) return;
      const s=window.CC_DESIGN_SELECTION.current;
      const stage=window.CC_DESIGN_DRAFT.getStage(s.stageId);
      panel.replaceChildren();
      const head=document.createElement("div");head.className="inspector-heading";head.innerHTML=`<strong>CONTEXTUAL INSPECTOR</strong><span>${s.stageId.toUpperCase()} / ${s.type.toUpperCase()} / ${s.assetId.toUpperCase()}</span>`;panel.appendChild(head);

      if(s.type==="landscape"){
        const asset=stage.landscape[s.assetId]; const g=group(`${s.assetId.toUpperCase()} TRANSFORM`);
        g.append(field("Scale",`landscape.${s.assetId}.transform.scale`,asset.transform.scale,0.01),field("Offset X",`landscape.${s.assetId}.transform.offsetX`,asset.transform.offsetX,1),field("Offset Y",`landscape.${s.assetId}.transform.offsetY`,asset.transform.offsetY,1));
        if(Number.isFinite(asset.transform.parallax)) g.append(field("Parallax",`landscape.${s.assetId}.transform.parallax`,asset.transform.parallax,0.01));
        panel.append(g,note("7E edits an isolated draft. Landscape preview wiring arrives in 7F."));
      } else if(s.type==="hazard"){
        const h=stage.hazards[s.assetIndex];
        const source=group("SOURCE REGION"); ["x","y","w","h"].forEach(k=>source.append(field(k.toUpperCase(),`hazards.${s.assetIndex}.atlas.sourceRegion.${k}`,h.atlas.sourceRegion[k],1)));
        const crop=group("FINE CROP"); [["L","l"],["R","r"],["T","t"],["B","b"]].forEach(([label,k])=>crop.append(field(label,`hazards.${s.assetIndex}.crop.${k}`,h.crop[k],1)));
        const transform=group("TRANSFORM"); transform.append(field("Scale",`hazards.${s.assetIndex}.transform.scale`,h.transform.scale,0.01),field("Offset X",`hazards.${s.assetIndex}.transform.offsetX`,h.transform.offsetX,1),field("Offset Y",`hazards.${s.assetIndex}.transform.offsetY`,h.transform.offsetY,1));
        const collision=group("COLLISION"); [["Width","w"],["Height","h"],["Offset X","x"],["Offset Y","y"]].forEach(([label,k])=>collision.append(field(label,`hazards.${s.assetIndex}.collision.${k}`,h.collision[k],0.01)));
        panel.append(source,crop,transform,collision,note("Atlas source region is separate from fine crop, so source boundaries can be corrected without abandoning atlases."));
      } else if(s.type==="character"){
        const g=group("CHARACTER GROUNDING"); g.append(field("Claude adjustment",`character.grounding.claude`,stage.character.grounding.claude,1),field("Constance adjustment",`character.grounding.constance`,stage.character.grounding.constance,1)); panel.append(g,note(`Canonical gameplay surface: Y=${stage.character.canonicalSurfaceY}.`));
      } else if(s.type==="finish"){
        const g=group("FINISH MARKER"); g.append(field("Scale","finish.transform.scale",stage.finish.transform.scale,0.01),field("Offset X","finish.transform.offsetX",stage.finish.transform.offsetX,1),field("Ground adjustment","finish.gameplayAnchor.adjustmentY",stage.finish.gameplayAnchor.adjustmentY,1)); panel.append(g);
      } else {
        const g=group("STAGE / GLOBAL"); g.append(note(`Canonical ground surface Y=${window.GAME_SCHEMA.GROUND_SURFACE_Y}. Legacy seam calibration remains compatibility evidence and is not edited here.`)); panel.append(g);
      }

      const actions=document.createElement("div");actions.className="inspector-actions";
      const status=document.createElement("span");status.className="dirty-status";status.textContent=window.CC_DESIGN_DRAFT.isDirty(s.stageId)?`Unsaved changes • ${window.CC_DESIGN_DRAFT.dirtyCount} stage(s)`:"No unsaved changes";
      const revert=document.createElement("button");revert.type="button";revert.textContent="REVERT";revert.disabled=!window.CC_DESIGN_DRAFT.isDirty(s.stageId);revert.onclick=()=>window.CC_DESIGN_DRAFT.revert(s.stageId);
      const save=document.createElement("button");save.type="button";save.textContent="SAVE STAGE";save.disabled=!window.CC_DESIGN_DRAFT.isDirty(s.stageId);save.onclick=()=>window.CC_DESIGN_DRAFT.saveStage(s.stageId);
      const exp=document.createElement("button");exp.type="button";exp.textContent="EXPORT";exp.onclick=()=>{const blob=new Blob([window.CC_DESIGN_DRAFT.exportStage(s.stageId)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`${s.stageId}-design-config.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),0);};
      actions.append(status,revert,save,exp);panel.appendChild(actions);
    }
    render(); window.CC_DESIGN_SELECTION.onChange(render); window.CC_DESIGN_DRAFT.onChange(render); window.CC_APP.onModeChange(render);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",mount,{once:true}); else mount();
})();
