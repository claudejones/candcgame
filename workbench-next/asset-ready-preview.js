// Workbench-only adapter. It registers asset-ready stages for Design preview and
// calibration without changing the production catalog state or release checks.
(() => {
  const handoffs=window.CC_WORKBENCH_ASSET_HANDOFFS||{},config=window.GAME_CONFIG;
  // Register released stages before appending preview-only stages. The schema
  // captures this complete list, and existing continent navigation stays stable.
  window.CC_STAGE_CONTRACT.install(config,window.CC_STAGE_CATALOG,window.CC_LANDSCAPE_REGISTRY);
  const sources={}; config.workbenchAssetReady=config.workbenchAssetReady||{};
  const crop=value=>({l:value?.l||0,r:value?.r||0,t:value?.t||0,b:value?.b||0});
  for(const [id,bundle] of Object.entries(handoffs)){
    const registered=window.CC_STAGE_CATALOG?.stages?.[id];
    if(config.worldProfiles[id])continue; // Existing AF01 keeps its accepted defaults.
    const assetKey={FAR:id+'Far',MID:id+'Mid',GROUND:id+'Ground',OBJECT_ATLAS:id+'Hazards',FLYING:id+'Bird'};
    for(const [kind,asset] of Object.entries(bundle.assets))sources[assetKey[kind]]=`../${asset.path}?v=${asset.sha256.slice(0,8)}`;
    const layers=bundle.landscape.layers;
    config.worldProfiles[id]={label:registered?.label||id.toUpperCase(),farKey:assetKey.FAR,midKey:assetKey.MID,groundKey:assetKey.GROUND,
      landscapeContract:bundle.landscape.contractVersion,sourceW:bundle.landscape.source.width,seamY:410,
      farY:layers.FAR.sourceY,farScale:layers.FAR.scale,midYOffset:layers.MID.offsetY,midScale:layers.MID.scale,midParallax:.2,
      groundYOffset:layers.GROUND.offsetY,groundScale:layers.GROUND.scale,groundParallax:1,characterGrounding:{claude:0,constance:0},clouds:true};
    config.objectQA.defs[id]=bundle.hazards.map((h,index)=>({name:h.name,kind:h.kind,atlasKey:index<2?assetKey.OBJECT_ATLAS:assetKey.FLYING,
      ...(h.rect?{rect:{...h.rect}}:{frameW:h.frameW,frameH:h.frameH}),...(h.frames?{frames:h.frames}:{}),...(h.fps?{fps:h.fps}:{}),
      sourceAnchor:{...h.sourceAnchor},scale:h.scale,crop:crop(h.crop),...(h.frameCrops?{frameCrops:h.frameCrops.map(crop)}:{}),
      cw:h.cw,ch:h.ch,cx:h.cx,cy:h.cy,...(h.groundOffset!==undefined?{groundOffset:h.groundOffset}:{}),
      ...(h.flightOffsetY?{flightOffsetY:{...h.flightOffsetY}}:{}),flipX:h.sourceFacing!=='none'&&h.sourceFacing!==h.gameplayFacing}));
    config.objectQA.activeIndex[id]=0;
    // Required only by the legacy compatibility view; it is explicitly not a finish calibration.
    config.finish.stages[id]={scale:1,groundOffset:0,xOffset:0,workbenchPlaceholder:true};
    config.workbenchAssetReady[id]=bundle;
  }
  window.CC_WORKBENCH_ASSET_READY_SOURCES=Object.freeze(sources);
})();
