/* Shared Phase 8 geometry. Data is generated from config/phase8-landscapes.json. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.CC_LANDSCAPE_CONTRACT = api;
})(typeof window === "object" ? window : globalThis, function () {
  "use strict";
  const clone = value => JSON.parse(JSON.stringify(value));
  function active(registry, id) {
    return ["integrated", "approved"].includes(registry.stages[id]?.status);
  }
  function defaults(registry) {
    const v = registry.viewport;
    return {sourceW:registry.canvas.width, seamY:v.groundSurfaceY,
      farY:0, farScale:v.farScale, midYOffset:0, midScale:v.midScale,
      groundYOffset:0, groundScale:v.groundScale, midParallax:0.20, groundParallax:1,
      landscapeContract:registry.contractVersion};
  }
  function applyStage(config, registry, id, preview = false) {
    if (!registry.stages[id] || (!preview && !active(registry, id))) return false;
    const profile = config.worldProfiles[id];
    if (!profile) throw new Error(`Missing runtime profile: ${id}`);
    Object.assign(profile, defaults(registry));
    profile.characterGrounding = {claude:0, constance:0};
    return true;
  }
  function apply(config, registry) {
    for (const id of Object.keys(registry.stages)) applyStage(config, registry, id);
  }
  function sources(config, registry, original) {
    const result = {...original};
    for (const [id, stage] of Object.entries(registry.stages)) {
      if (!active(registry, id)) continue;
      const profile = config.worldProfiles[id];
      for (const layer of ["far", "mid", "ground"]) {
        const spec = stage.layers[layer];
        if (!spec.cacheKey) throw new Error(`Missing cache key: ${id}/${layer}`);
        result[profile[`${layer}Key`]] = `../${spec.validation}?v=${spec.cacheKey}`;
      }
    }
    return result;
  }
  function geometry(config, id = config.activeWorld) {
    const p = config.worldProfiles[id], w = config.worldContract;
    const scale = config.canvas.w / (p.sourceW || w.sourceW);
    return {
      far:{scale:scale*p.farScale, y:p.farY},
      mid:{scale:scale*p.midScale, y:p.seamY-w.midBaselineSourceY*scale*p.midScale+p.midYOffset},
      ground:{scale:scale*p.groundScale, y:p.seamY-w.groundSurfaceSourceY*scale*p.groundScale+p.groundYOffset}
    };
  }
  function gameplaySurface(config, registry, id = config.activeWorld, legacySurface) {
    const profile = config.worldProfiles[id];
    if (active(registry, id) && profile?.landscapeContract === registry.contractVersion) {
      return registry.viewport.groundSurfaceY;
    }
    if (Number.isFinite(legacySurface)) return legacySurface;
    return profile.seamY + profile.groundYOffset;
  }
  function assertCanonical(config, registry, id) {
    const p = config.worldProfiles[id], expected = defaults(registry);
    for (const key of ["sourceW", "seamY", "farY", "farScale", "midYOffset", "midScale", "groundYOffset", "groundScale", "landscapeContract"]) {
      if (p?.[key] !== expected[key]) throw new Error(`${id}: ${key} must be ${expected[key]}, got ${p?.[key]}`);
    }
    if (config.canvas.w !== registry.viewport.width || config.canvas.h !== registry.viewport.height ||
        config.worldContract.midBaselineSourceY !== registry.viewport.midBaselineSourceY ||
        config.worldContract.groundSurfaceSourceY !== registry.viewport.groundSurfaceSourceY) {
      throw new Error(`${id}: viewport or source-anchor mismatch`);
    }
    return geometry(config, id);
  }
  // Old saved geometry must not overwrite new defaults. Preserve unrelated work.
  // Current-contract authoring adjustments remain editable and are caught by verify.
  function migrateStages(stages, canonical, registry) {
    const migrated = [];
    for (const id of Object.keys(registry.stages)) {
      if (!active(registry, id) || !stages[id]) continue;
      const old = stages[id].landscape, next = canonical[id].landscape;
      const incompatible = old?.contractVersion !== registry.contractVersion ||
        ["far", "mid", "ground"].some(layer => old?.[layer]?.source?.width !== next[layer].source.width) ||
        old?.mid?.source?.anchorY !== next.mid.source.anchorY || old?.ground?.source?.anchorY !== next.ground.source.anchorY;
      if (incompatible) {
        stages[id].landscape = clone(next);
        migrated.push(id);
      }
    }
    return migrated;
  }
  return Object.freeze({active, defaults, applyStage, apply, sources, geometry, gameplaySurface, assertCanonical, migrateStages});
});
