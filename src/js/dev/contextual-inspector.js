(() => {
  "use strict";
  if(!window.CC_APP?.isDevelopment) throw new Error("Contextual Inspector requires development bootstrap");
  if(!window.CC_DESIGN_SELECTION || !window.CC_DESIGN_DRAFT) throw new Error("Contextual Inspector dependencies missing");

  const download=(text,name)=>{const blob=new Blob([text],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),0);};
  const field=(label,path,value,step=1,global=false)=>{
    const row=document.createElement("label");row.className="inspector-field";const title=document.createElement("span");title.textContent=label;row.appendChild(title);
    const control=document.createElement("div");control.className="numeric-control";const down=document.createElement("button");down.type="button";down.textContent="−";
    const input=document.createElement("input");input.type="number";input.step=String(step);input.value=String(value);input.dataset.path=path;const up=document.createElement("button");up.type="button";up.textContent="+";
    const commit=v=>{const n=Number(v);if(!Number.isFinite(n))return;if(global)window.CC_DESIGN_DRAFT.setGlobalValue(path,n);else window.CC_DESIGN_DRAFT.setValue(window.CC_DESIGN_SELECTION.current.stageId,path,n);};
    down.addEventListener("click",()=>{input.stepDown();commit(input.value);});up.addEventListener("click",()=>{input.stepUp();commit(input.value);});input.addEventListener("change",()=>commit(input.value));control.append(down,input,up);row.appendChild(control);return row;
  };
  const group=title=>{const el=document.createElement("section");el.className="inspector-group";const h=document.createElement("h3");h.textContent=title;el.appendChild(h);return el;};
  const note=text=>{const p=document.createElement("p");p.className="inspector-note";p.textContent=text;return p;};

  function mount(){
    if(document.getElementById("phase7ContextualInspector"))return;const host=document.querySelector(".phase7-runtime-host");if(!host)return;
    const panel=document.createElement("aside");panel.id="phase7ContextualInspector";panel.className="phase7-contextual-inspector";panel.setAttribute("aria-label","Contextual Inspector");host.appendChild(panel);
    function render(){
      panel.hidden=window.CC_APP.mode!=="design";if(panel.hidden)return;const s=window.CC_DESIGN_SELECTION.current,stage=window.CC_DESIGN_DRAFT.getStage(s.stageId);panel.replaceChildren();
      const head=document.createElement("div");head.className="inspector-heading";head.innerHTML=`<strong>CONTEXTUAL INSPECTOR</strong><span>${s.stageId.toUpperCase()} / ${s.type.toUpperCase()} / ${s.assetId.toUpperCase()}</span>`;panel.appendChild(head);
      if(s.type==="landscape"){
        const asset=stage.landscape[s.assetId],g=group(`${s.assetId.toUpperCase()} TRANSFORM`);g.append(field("Scale",`landscape.${s.assetId}.transform.scale`,asset.transform.scale,0.01),field("Offset X",`landscape.${s.assetId}.transform.offsetX`,asset.transform.offsetX,1),field("Offset Y",`landscape.${s.assetId}.transform.offsetY`,asset.transform.offsetY,1));if(Number.isFinite(asset.transform.parallax))g.append(field("Parallax",`landscape.${s.assetId}.transform.parallax`,asset.transform.parallax,0.01));panel.append(g,note("Landscape draft changes preview live in Design mode; production configuration remains untouched."));
      }else if(s.type==="hazard"){
        const h=stage.hazards[s.assetIndex],source=group("SOURCE REGION");["x","y","w","h"].forEach(k=>source.append(field(k.toUpperCase(),`hazards.${s.assetIndex}.atlas.sourceRegion.${k}`,h.atlas.sourceRegion[k],1)));
        const crop=group("FINE CROP");[["L","l"],["R","r"],["T","t"],["B","b"]].forEach(([label,k])=>crop.append(field(label,`hazards.${s.assetIndex}.crop.${k}`,h.crop[k],1)));
        const transform=group("TRANSFORM / PLACEMENT");transform.append(field("Scale",`hazards.${s.assetIndex}.transform.scale`,h.transform.scale,0.01),field("Offset X",`hazards.${s.assetIndex}.transform.offsetX`,h.transform.offsetX,1),field("Offset Y",`hazards.${s.assetIndex}.transform.offsetY`,h.transform.offsetY,1));if(h.kind==="ground")transform.append(field("Ground adjustment",`hazards.${s.assetIndex}.gameplayAnchor.adjustmentY`,h.gameplayAnchor.adjustmentY,1));
        const collision=group("COLLISION");[["Width","w"],["Height","h"],["Offset X","x"],["Offset Y","y"]].forEach(([label,k])=>collision.append(field(label,`hazards.${s.assetIndex}.collision.${k}`,h.collision[k],0.01)));panel.append(source,crop,transform,collision,note("Source region and fine crop are independent. Crop minimum remains zero; expand the source rectangle to reveal atlas artwork."));
      }else if(s.type==="character"){
        const who=window.CC_CHARACTER_EDITOR?.character||"claude",state=window.CC_CHARACTER_EDITOR?.state||"run",globals=window.CC_DESIGN_DRAFT.getGlobals().character;
        const selectGroup=group("CHARACTER / STATE"),whoSelect=document.createElement("select"),stateSelect=document.createElement("select");whoSelect.className=stateSelect.className="inspector-select";["claude","constance"].forEach(v=>whoSelect.add(new Option(v.toUpperCase(),v,v===who,v===who)));["idle","run","jump","slide","hit","celebrate"].forEach(v=>stateSelect.add(new Option(v.toUpperCase(),v,v===state,v===state)));whoSelect.onchange=()=>window.CC_CHARACTER_EDITOR?.select(whoSelect.value,state);stateSelect.onchange=()=>window.CC_CHARACTER_EDITOR?.select(who,stateSelect.value);selectGroup.append(whoSelect,stateSelect);
        const scale=group("SCALE / POSITION");scale.append(field("Master scale",`character.masterScale.${who}`,globals.masterScale[who],0.001,true),field("State scale",`character.stateScale.${who}.${state}`,globals.stateScale[who][state],0.01,true),field("Offset X",`character.renderOffsetX.${who}.${state}`,globals.renderOffsetX[who][state],1,true),field("Offset Y",`character.renderOffsetY.${who}.${state}`,globals.renderOffsetY[who][state],1,true),field("Stage grounding",`character.grounding.${who}`,stage.character.grounding[who],1));
        const col=globals.collision[who][state],collision=group("COLLISION");[["Width","w"],["Height","h"],["Offset X","x"],["Offset Y","y"]].forEach(([label,k])=>collision.append(field(label,`character.collision.${who}.${state}.${k}`,col[k],0.01,true)));
        panel.append(selectGroup,scale,collision,note(`Canonical gameplay surface Y=${stage.character.canonicalSurfaceY}. Character atlases remain unchanged.`));
      }else if(s.type==="finish"){
        const g=group("FINISH MARKER");g.append(field("Scale","finish.transform.scale",stage.finish.transform.scale,0.01),field("Offset X","finish.transform.offsetX",stage.finish.transform.offsetX,1),field("Ground adjustment","finish.gameplayAnchor.adjustmentY",stage.finish.gameplayAnchor.adjustmentY,1));panel.append(g);
      }else{const g=group("STAGE / GLOBAL");g.append(note(`Canonical ground surface Y=${window.GAME_SCHEMA.GROUND_SURFACE_Y}. Legacy seam calibration remains compatibility evidence.`));panel.append(g);}

      const actions=document.createElement("div");actions.className="inspector-actions";const status=document.createElement("span");status.className="dirty-status";status.textContent=window.CC_DESIGN_DRAFT.dirtyCount?`Unsaved changes • ${window.CC_DESIGN_DRAFT.dirtyCount} scope(s)`:"Saved locally • no unsaved changes";
      const globalMode=s.type==="character";
      const revert=document.createElement("button");revert.type="button";revert.textContent="REVERT";revert.disabled=globalMode?!window.CC_DESIGN_DRAFT.globalsDirty:!window.CC_DESIGN_DRAFT.isDirty(s.stageId);revert.onclick=()=>globalMode?window.CC_DESIGN_DRAFT.revertGlobals():window.CC_DESIGN_DRAFT.revert(s.stageId);
      const save=document.createElement("button");save.type="button";save.textContent=globalMode?"SAVE CHARACTER":"SAVE STAGE";save.disabled=globalMode?!window.CC_DESIGN_DRAFT.globalsDirty:!window.CC_DESIGN_DRAFT.isDirty(s.stageId);save.onclick=()=>globalMode?window.CC_DESIGN_DRAFT.saveGlobals():window.CC_DESIGN_DRAFT.saveStage(s.stageId);
      const stageExport=document.createElement("button");stageExport.type="button";stageExport.textContent="EXPORT STAGE";stageExport.onclick=()=>download(window.CC_DESIGN_DRAFT.exportStage(s.stageId),`${s.stageId}-design-config.json`);
      const gameExport=document.createElement("button");gameExport.type="button";gameExport.className="export-game";gameExport.textContent="EXPORT GAME CONFIG";gameExport.onclick=()=>download(window.CC_DESIGN_DRAFT.exportGame(),"cc-world-game-config.json");actions.append(status,revert,save,stageExport,gameExport);panel.appendChild(actions);
      document.dispatchEvent(new CustomEvent("cc-inspector-rendered"));
    }
    render();window.CC_DESIGN_SELECTION.onChange(render);window.CC_DESIGN_DRAFT.onChange(render);window.CC_APP.onModeChange(render);document.addEventListener("cc-character-selection",render);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();
