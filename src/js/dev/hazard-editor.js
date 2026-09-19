(() => {
  "use strict";
  if(!window.CC_APP?.isDevelopment)throw new Error("Hazard editor requires development bootstrap");
  const ATLAS={na01Hazards:"../assets/worlds/north-america/NA01_HAZARD_ATLAS.png",na01Bird:"../assets/worlds/north-america/NA01_HAZARD_VULTURE.png",na02Hazards:"../assets/worlds/north-america/NA02_HAZARD_ATLAS.png",na02Bird:"../assets/worlds/north-america/NA02_HAZARD_EAGLE.png",na03Hazards:"../assets/worlds/north-america/NA03_HAZARD_ATLAS.png",na03Bird:"../assets/worlds/north-america/NA03_HAZARD_PIGEONS.png",sa01Hazards:"../assets/worlds/south-america/SA01_OBJECT_ATLAS.png",sa01Bird:"../assets/worlds/south-america/SA01_HAZARD_MACAWS.png",sa02Hazards:"../assets/worlds/south-america/SA02_OBJECT_ATLAS.png",sa02Bird:"../assets/worlds/south-america/SA02_HAZARD_ANDEAN_FLAMINGO.png",sa03Hazards:"../assets/worlds/south-america/SA03_OBJECT_ATLAS.png",sa03Bird:"../assets/worlds/south-america/SA03_HAZARD_TROPICAL_PARAKEETS.png",eu01Hazards:"../assets/worlds/europe/EU01_OBJECT_ATLAS_CRATE.png",eu01Barrel:"../assets/worlds/europe/EU01_HAZARD_ROLLING_BARREL.png",eu01Bird:"../assets/worlds/europe/EU01_HAZARD_AEGEAN_GULLS.png",eu02Hazards:"../assets/worlds/europe/EU02_OBJECT_ATLAS.png",eu02Bird:"../assets/worlds/europe/EU02_HAZARD_SWALLOWS.png",eu03Hazards:"../assets/worlds/europe/EU03_OBJECT_ATLAS.png",eu03Bird:"../assets/worlds/europe/EU03_HAZARD_BATS.png"};
  if(window.CC_STAGE_CATALOG)Object.assign(ATLAS,window.CC_STAGE_CONTRACT.sources(window.CC_STAGE_CATALOG));
  const runtime=()=>document.getElementById("sharedRuntime")?.contentWindow;
  let activeFrame=0,playing=false,timer=0,lastAdvance=0;
  const selected=()=>{const s=window.CC_DESIGN_SELECTION.current;if(s.type!=="hazard")return null;return{s,h:window.CC_DESIGN_DRAFT.getStage(s.stageId).hazards[s.assetIndex]};};
  const runtimeDef=(stageId,index)=>runtime()?.GAME_CONFIG?.objectQA?.defs?.[stageId]?.[index];

  function clearFrameOverrides(){const defs=runtime()?.GAME_CONFIG?.objectQA?.defs;if(!defs)return;for(const list of Object.values(defs))for(const d of list)delete d.previewFrame;}
  function setPreviewFrame(frame){const q=selected(),w=runtime();if(!q||!w?.GAME_CONFIG)return;const d=runtimeDef(q.s.stageId,q.s.assetIndex),fps=Math.max(1,d?.fps||q.h.animation?.fps||1);activeFrame=Math.max(0,Math.min((q.h.atlas.frames||1)-1,frame));w.GAME_CONFIG.objectQA.flying.frame=activeFrame;w.GAME_CONFIG.objectQA.flying.t=activeFrame/fps;if(d)d.previewFrame=activeFrame;}

  function syncToRuntime(stageId,index){
    const stage=window.CC_DESIGN_DRAFT.getStage(stageId),h=stage.hazards[index],w=runtime();
    if(!w?.GAME_CONFIG)return false;
    w.GAME_CONFIG.activeWorld=stageId;w.GAME_CONFIG.objectQA.activeIndex[stageId]=index;
    const d=w.GAME_CONFIG.objectQA.defs[stageId][index];
    if(h.atlas.sourceAnchor)d.sourceAnchor={...h.atlas.sourceAnchor};
    if(h.transform.flipX!==undefined)d.flipX=h.transform.flipX;
    d.scale=h.transform.scale;d.cw=h.collision.w;d.ch=h.collision.h;d.cx=h.collision.x;d.cy=h.collision.y;d.frames=h.atlas.frames;d.fps=h.animation?.fps||w.GAME_CONFIG.objectQA.flying.fps;d.frameCrops=h.animation?.frameCrops;
    if(d.kind==="ground")d.groundOffset=h.gameplayAnchor.adjustmentY+h.transform.offsetY;
    else if(h.gameplayAnchor.adjustmentByMode)d.flightOffsetY={...h.gameplayAnchor.adjustmentByMode};
    else{w.GAME_CONFIG.objectQA.flying.highClearance=window.GAME_CONFIG.objectQA.flying.highClearance-h.transform.offsetY;w.GAME_CONFIG.objectQA.flying.lowClearance=window.GAME_CONFIG.objectQA.flying.lowClearance-h.transform.offsetY;}
    if(d.rect)d.rect={...h.atlas.sourceRegion};else{d.frameW=h.atlas.sourceRegion.w;d.frameH=h.atlas.sourceRegion.h;}
    const base=h.crop,frames=h.animation?.frameCrops||[base];
    try{Object.defineProperty(d,"crop",{configurable:true,get(){const f=Number.isInteger(d.previewFrame)?d.previewFrame:(w.GAME_CONFIG.objectQA.flying.frame||0);return frames[Math.min(frames.length-1,f)]||base;},set(){/* Draft preview owns crop while attached. */}});}catch{d.crop=frames[activeFrame]||base;}
    return true;
  }

  function apply(){
    if(window.CC_APP.mode!=="design")return;
    const q=selected();if(!q)return;
    syncToRuntime(q.s.stageId,q.s.assetIndex);
    const w=runtime();if(!w?.GAME_CONFIG)return;
    w.GAME_CONFIG.objectQA.x=window.GAME_CONFIG.objectQA.x+q.h.transform.offsetX;
    if(!playing)setPreviewFrame(activeFrame);
  }

  function drawAtlas(canvas,h){
    const src=ATLAS[h.atlas.key];if(!src)return;
    const img=new Image();img.onload=()=>{const scale=Math.min(260/img.width,180/img.height);canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));const c=canvas.getContext("2d");c.imageSmoothingEnabled=false;c.drawImage(img,0,0,canvas.width,canvas.height);const r=h.atlas.sourceRegion;c.strokeStyle="#ffdf5d";c.lineWidth=2;c.strokeRect(r.x*scale+.5,r.y*scale+.5,r.w*scale-1,r.h*scale-1);if((h.atlas.frames||1)>1){const fr={x:r.x+activeFrame*r.w,y:r.y,w:r.w,h:r.h};c.strokeStyle="#63e6ff";c.lineWidth=2;c.strokeRect(fr.x*scale+2.5,fr.y*scale+2.5,fr.w*scale-5,fr.h*scale-5);}};img.src=src;
  }

  function drawCroppedFrame(canvas,h){
    const src=ATLAS[h.atlas.key];if(!src)return;
    const img=new Image();img.onload=()=>{const r=h.atlas.sourceRegion,frames=h.atlas.frames||1,crop=frames>1?h.animation.frameCrops[activeFrame]:h.crop,l=Math.max(0,crop?.l||0),rr=Math.max(0,crop?.r||0),t=Math.max(0,crop?.t||0),b=Math.max(0,crop?.b||0),sw=Math.max(1,r.w-l-rr),sh=Math.max(1,r.h-t-b),sx=r.x+(frames>1?activeFrame*r.w:0)+l,sy=r.y+t;canvas.width=260;canvas.height=150;const c=canvas.getContext("2d");c.imageSmoothingEnabled=false;c.clearRect(0,0,canvas.width,canvas.height);const scale=Math.min((canvas.width-12)/sw,(canvas.height-12)/sh),dw=Math.max(1,Math.round(sw*scale)),dh=Math.max(1,Math.round(sh*scale)),dx=Math.round((canvas.width-dw)/2),dy=Math.round((canvas.height-dh)/2);window.CC_STAGE_CONTRACT.drawSprite(c,img,{sx,sy,sw,sh,dx,dy,dw,dh},h.transform.flipX);};img.src=src;
  }

  function setPlaying(next){
    playing=!!next;lastAdvance=performance.now();setPreviewFrame(activeFrame);
    decorate();
  }

  function bindImmediate(button,action){button.onpointerdown=e=>{e.preventDefault();action();};button.onclick=e=>{if(e.detail===0)action();};}

  function decorate(){
    const q=selected();if(window.CC_APP.mode!=="design"||!q)return;
    const {h}=q,panel=document.getElementById("phase7ContextualInspector");if(!panel)return;
    panel.querySelector(".full-atlas-view")?.remove();
    const box=document.createElement("section");box.className="inspector-group full-atlas-view";box.innerHTML="<h3>FULL ATLAS VIEW</h3>";
    const canvas=document.createElement("canvas");canvas.className="atlas-canvas";const caption=document.createElement("p");caption.className="inspector-note";caption.textContent=`${h.atlas.key} • yellow = animation source • cyan = active frame`;box.append(canvas,caption);
    if((h.atlas.frames||1)>1){const controls=document.createElement("div");controls.className="animation-preview-controls";const prev=document.createElement("button"),label=document.createElement("strong"),next=document.createElement("button"),play=document.createElement("button");prev.textContent="◀";next.textContent="▶";label.textContent=`FRAME ${activeFrame+1} / ${h.atlas.frames}`;play.textContent=playing?"Ⅱ PAUSE":"▶ PLAY";bindImmediate(prev,()=>selectFrame(activeFrame-1));bindImmediate(next,()=>selectFrame(activeFrame+1));bindImmediate(play,()=>setPlaying(!playing));controls.append(prev,label,next,play);box.append(controls);}
    const cropTitle=document.createElement("h3");cropTitle.textContent=`CROPPED FRAME PREVIEW${(h.atlas.frames||1)>1?` — ${activeFrame+1}/${h.atlas.frames}`:""}`;cropTitle.className="cropped-frame-title";const cropCanvas=document.createElement("canvas");cropCanvas.className="cropped-frame-canvas";box.append(cropTitle,cropCanvas);panel.insertBefore(box,panel.querySelector(".inspector-actions"));drawAtlas(canvas,h);drawCroppedFrame(cropCanvas,h);
  }

  function selectFrame(n){const q=selected();if(!q)return;playing=false;activeFrame=(n+(q.h.atlas.frames||1))%(q.h.atlas.frames||1);setPreviewFrame(activeFrame);document.dispatchEvent(new CustomEvent("cc-hazard-frame",{detail:{frame:activeFrame}}));decorate();}
  function tick(now){const q=selected();if(playing&&q&&(q.h.atlas.frames||1)>1){const fps=Math.max(1,q.h.animation?.fps||1),interval=1000/fps;if(now-lastAdvance>=interval){lastAdvance=now-((now-lastAdvance)%interval);activeFrame=(activeFrame+1)%(q.h.atlas.frames||1);setPreviewFrame(activeFrame);document.dispatchEvent(new CustomEvent("cc-hazard-frame",{detail:{frame:activeFrame}}));decorate();}}timer=requestAnimationFrame(tick);}
  function refresh(){const q=selected();if(q&&activeFrame>=(q.h.atlas.frames||1))activeFrame=0;apply();requestAnimationFrame(decorate);}
  window.CC_DESIGN_SELECTION.onChange(()=>{clearFrameOverrides();activeFrame=0;playing=false;refresh();});
  window.CC_DESIGN_DRAFT.onChange(refresh);
  window.CC_APP.onModeChange(mode=>{if(mode!=="design"){clearFrameOverrides();playing=false;}refresh();});
  document.addEventListener("cc-inspector-rendered",decorate);
  document.getElementById("sharedRuntime")?.addEventListener("load",refresh);
  refresh();timer=requestAnimationFrame(tick);
  window.CC_HAZARD_EDITOR=Object.freeze({refresh,syncToRuntime,selectFrame,get activeFrame(){return activeFrame;},get playing(){return playing;}});
})();
