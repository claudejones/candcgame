// Image-facing prompts only. Runtime, workflow and QA instructions stay outside.
export function imagePrompt(stage, selector, shared = {}) {
  const lines = [`Create ${stage.id} ${selector}: one crisp pixel-art PNG matching the attached style reference.`,
    `Palette: ${stage.palette || 'match the approved stage references'}. Attach the selected location/species reference as pixels; use it for identity, not photographic rendering.`,
    'No labels, guides, UI, checkerboard, blur or cast shadow outside the subject.'];
  const landscape = ['FAR','MID','GROUND'].includes(selector);
  const [w,h] = shared.landscapeSource || [2172,724];
  if (landscape) {
    lines.push(`Canvas ${w}×${h}. ${stage.landscapes?.[selector]?.direction || ''}`);
    if (selector === 'FAR') lines.push(
      `Focal point: ${stage.brief?.farFocalPoint || 'the selected local landmark or natural formation'}. Keep its recognizable silhouette away from horizontal repeat joins and visible behind the attached MID when present.`,
      'Fully opaque sky and distant scenery. Coherent distant scale; no foreground objects, characters or gameplay hazards. Match left/right horizon and edge colors for horizontal repetition.');
    if (selector === 'MID') lines.push(
      `Local life detail: ${stage.brief?.midLifeDetail || 'the selected restrained local detail'}.`,
      `Transparent sky openings; no duplicated FAR landmark or baked sky. Side-on middle-distance scenery, coherent building/plant scale. Extend authored lower scenery to the bottom without a transparent gap; source anchor ${shared.landscapeAnchors?.MID ?? 621}. Match both repeat edges. Use the attached FAR for palette and separation.`);
    if (selector === 'GROUND') lines.push(
      `Side-on terrain strip only. A straight, uninterrupted walking surface begins at source row ${shared.landscapeAnchors?.GROUND ?? 393}; everything above is transparent and terrain below is opaque to the bottom.`,
      'Level surface: no slope, perspective vanishing point, platforms, gaps, buildings, vegetation, props or animals. Match texture and surface height at both horizontal edges. Use the ground reference for structure and stage reference for material/color.');
  } else if (selector === 'OBJECT_ATLAS') {
    const a=shared.proposedGroundAtlas || {};
    lines.push(`Transparent ${a.width || w}×${a.height || h} atlas, two equal cells in one row; one static object per cell.`,
      ...['GROUND1','GROUND2'].map((k,i)=>`Cell ${i+1}: ${stage.hazards?.[k]?.label}. ${stage.hazards?.[k]?.direction || ''}`),
      `Center each complete silhouette in its own cell; contact baseline Y=${a.footAnchorY ?? 620}. At least ${a.minimumCellGutter ?? 32}px clear space at cell boundaries. Keep the entire object and all appendages inside its cell.`,
      'Consistent side view, pixel density and lighting. No scenery, pedestal or ground strip. Preserve each selected object’s characteristic proportions; do not fill the cell by stretching it.');
  } else if (selector === 'FLYING') {
    const a=shared.proposedFlyingAtlas || {}, bird=stage.hazards?.FLYING || {};
    lines.push(`Transparent ${a.width || w}×${a.height || h} atlas: four equal cells in one row. ${bird.creatures || 1} ${bird.label || 'selected flying creature'} per frame. ${bird.direction || ''}`,
      `Face ${a.facing || 'right'} in every frame. Identical body size, palette and body center at local (${a.bodyAnchor?.x ?? 271},${a.bodyAnchor?.y ?? 362}); only the wing pose changes.`,
      'Frame 1: wings raised at upstroke apex. Frame 2: wings descending forward diagonally. Frame 3: wings extended down at downstroke apex. Frame 4: wings rising swept back diagonally.',
      `Every creature must visibly change wing pose in every frame. Keep wings readable and separated; all feathers, legs and beaks remain inside each cell with at least ${a.minimumCellGutter ?? 32}px transparent clearance. No motion trails, detached marks or background.`);
  } else throw new Error(`Unknown image selector ${selector}`);
  return lines.join('\n');
}

export function revisionPrompt(defect, preserve) {
  if (!defect?.trim() || !preserve?.trim()) throw new Error('A revision requires one observed defect and explicit preservation instructions.');
  return `Edit the attached source. Correct only: ${defect.trim()}\nPreserve: ${preserve.trim()}\nKeep the same pixel-art treatment. Do not redesign unrelated content.`;
}
