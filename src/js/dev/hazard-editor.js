(() => {
  "use strict";
  if(!window.CC_APP?.isDevelopment)throw new Error("Hazard editor requires development bootstrap");
  const ATLAS={
    na01Hazards:"../assets/worlds/north-america/NA01_HAZARD_ATLAS.png",na01Bird:"../assets/worlds/north-america/NA01_HAZARD_VULTURE.png",
    na02Hazards:"../assets/worlds/north-america/NA02_HAZARD_ATLAS.png",na02Bird:"../assets/worlds/north-america/NA02_HAZARD_EAGLE.png",
    na03Hazards:"../assets/worlds/north-america/NA03_HAZARD_ATLAS.png",na03Bird:"../assets/worlds/north-america/NA03_HAZARD_PIGEONS.png",
    sa01Hazards:"../assets/worlds/south-america/SA01_OBJECT_ATLAS.png",sa01Bird:"../assets/worlds/south-america/SA01_HAZARD_MACAWS.png",
    sa02Hazards:"../assets/worlds/south-america/SA02_OBJECT_ATLAS.png",sa02Bird:"../assets/worlds/south-america/SA02_HAZARD_ANDEAN_FLAMINGO.png",
    sa03Hazards:"../assets/worlds/south-america/SA03_OBJECT_ATLAS.png",sa03Bird:"../assets/worlds/south-america/SA03_HAZARD_TROPICAL_PARAKEETS.png",
    eu01Hazards:"../assets/worlds/europe/EU01_OBJECT_ATLAS_CRATE.png",eu01Barrel:"../assets/worlds/europe/EU01_HAZARD_ROLLING_BARREL.png",eu01Bird:"../assets/worlds/europe/EU01_HAZARD_AEGEAN_GULLS.png",
    eu02Hazards:"../assets/worlds/europe/EU02_OBJECT_ATLAS.png",eu02Bird:"../assets/worlds/europe/EU02_HAZARD_SWALLOWS.png",
    eu03Hazards:"../assets/worlds/europe/EU03_OBJECT_ATLAS.png",eu03Bird:"../assets/worlds/europe/EU03_HAZARD_BATS.png"
  };
  const runtime=()=>document.getElementById("sharedRuntime")?.contentWindow;
  function apply(){
    if(window.CC_APP.mode!=="design")return;const s=window.CC_DESIGN_SELECTION.current;if(s.type!=="hazard")return;
    const h=window.CC_DESIGN_DRAFT.getStage(s.stageId).hazards[s.assetIndex],w=runtime();if(!w?.GAME_CONFIG)return;
    w.GAME_CONFIG.activeWorld=s.stageId;w.GAME_CONFIG.objectQA.activeIndex[s.stageId]=s.assetIndex;
    const d=w.GAME_CONFIG.objectQA.defs[s.stageId][s.assetIndex];
    d.scale=h.transform.scale;d.crop={...h.crop};d.cw=h.collision.w;d.ch=h.collision.h;d.cx=h.collision.x;d.cy=h.collision.y;
    if(d.kind==="ground")d.groundOffset=h.gameplayAnchor.adjustmentY;
    if(d.rect)d.rect={...h.atlas.sourceRegion};else{d.frameW=h.atlas.sourceRegion.w;d.frameH=h.atlas.sourceRegion.h;}
  }
  function drawAtlas(canvas,h){
    const src=ATLAS[h.atlas.key];if(!src)return;const img=new Image();img.onload=()=>{
      const maxW=260,maxH=180,scale=Math.min(maxW/img.width,maxH/img.height);canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
      const c=canvas.getContext("2d");c.clearRect(0,0,canvas.width,canvas.height);c.drawImage(img,0,0,canvas.width,canvas.height);
      const r=h.atlas.sourceRegion;c.save();c.strokeStyle="#ffdf5d";c.lineWidth=2;c.strokeRect(r.x*scale+.5,r.y*scale+.5,r.w*scale-1,r.h*scale-1);c.restore();
    };img.src=src;
  }
  function decorate(){
    const s=window.CC_DESIGN_SELECTION.current;if(window.CC_APP.mode!=="design"||s.type!=="hazard")return;
    const panel=document.getElementById("phase7ContextualInspector");if(!panel||panel.querySelector(".full-atlas-view"))return;
    const h=window.CC_DESIGN_DRAFT.getStage(s.stageId).hazards[s.assetIndex],box=document.createElement("section");box.className="inspector-group full-atlas-view";
    const title=document.createElement("h3");title.textContent="FULL ATLAS VIEW";const canvas=document.createElement("canvas");canvas.className="atlas-canvas";const caption=document.createElement("p");caption.className="inspector-note";caption.textContent=`${h.atlas.key} • yellow rectangle = editable source region`;
    box.append(title,canvas,caption);const actions=panel.querySelector(".inspector-actions");panel.insertBefore(box,actions);drawAtlas(canvas,h);
  }
  function refresh(){apply();requestAnimationFrame(decorate);}
  window.CC_DESIGN_SELECTION.onChange(refresh);window.CC_DESIGN_DRAFT.onChange(refresh);window.CC_APP.onModeChange(refresh);document.getElementById("sharedRuntime")?.addEventListener("load",refresh);refresh();
  window.CC_HAZARD_EDITOR=Object.freeze({refresh});
})();
