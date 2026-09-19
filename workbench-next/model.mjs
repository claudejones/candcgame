export const STORAGE_KEY = 'cc-workbench-next-sprite-draft-v1';
export const FORMAT = 'cc-workbench-next-sprite-crops-v1';
const clone = value => JSON.parse(JSON.stringify(value));
export const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function descriptors(config, schema) {
  const items = [];
  for (const who of ['claude', 'constance']) {
    for (const [state, animation] of Object.entries(config.state)) {
      items.push({id:`character:${who}:${state}`, type:'character', name:who === 'claude' ? 'Claude' : 'Constance', state,
        asset:state, frames:animation.frames, fps:animation.fps || 3, artworkLoop:animation.fps === 0 || state === 'slide',
        region:{x:0,y:who === 'claude' ? 0 : config.cell,w:config.cell,h:config.cell},
        crops:clone(config.cropInsets[who][state])});
    }
  }
  const canonical = schema.buildCompatibilityView(config);
  for (const [stage, value] of Object.entries(canonical.stages)) {
    value.hazards.forEach((h, i) => items.push({id:`hazard:${stage}:${i}`,type:'hazard',stage,name:h.name,kind:h.kind,
      asset:h.atlas.key,frames:h.atlas.frames,fps:h.animation.fps,region:clone(h.atlas.sourceRegion),
      crops:clone(h.animation.frameCrops)}));
  }
  return items;
}

export function validateCrop(crop, region) {
  if (!crop || Object.keys(crop).sort().join(',') !== 'b,l,r,t') throw new Error('Crop must contain only L/R/T/B.');
  for (const value of Object.values(crop)) if (!Number.isFinite(value) || value < 0) throw new Error('Crop values must be finite and non-negative.');
  if (crop.l + crop.r >= region.w || crop.t + crop.b >= region.h) throw new Error('Crop must leave visible source pixels.');
  return crop;
}

export function sourceFrame(item, frame, crop = item.crops[frame]) {
  if (!Number.isInteger(frame) || frame < 0 || frame >= item.frames) throw new Error('Frame outside atlas.');
  validateCrop(crop, item.region);
  return {x:item.region.x + frame * item.region.w + crop.l, y:item.region.y + crop.t,
    w:item.region.w - crop.l - crop.r, h:item.region.h - crop.t - crop.b};
}

export function validateAtlas(item, width, height) {
  if (item.region.x < 0 || item.region.y < 0 || item.region.x + item.frames * item.region.w > width || item.region.y + item.region.h > height) {
    throw new Error('Configured frames exceed the decoded atlas dimensions.');
  }
}

export class Draft {
  constructor(items) {
    this.items = new Map(items.map(item => [item.id,item]));
    this.baseline = Object.fromEntries(items.map(item => [item.id,clone(item.crops)]));
    this.saved = clone(this.baseline); this.value = clone(this.baseline);
    this.past = []; this.future = [];
  }
  get dirty() { return !same(this.value, this.saved); }
  get changedFrames() { return [...this.items.keys()].reduce((n,id)=>n+this.value[id].filter((crop,i)=>!same(crop,this.baseline[id][i])).length,0); }
  crop(id, frame) { return clone(this.value[id][frame]); }
  edit(id, frame, crop) {
    const item = this.items.get(id);
    if (!item || !Number.isInteger(frame) || frame < 0 || frame >= item.frames) throw new Error('Unknown sprite/frame.');
    validateCrop(crop,item.region);
    if (same(this.value[id][frame],crop)) return;
    this.past.push({id,frame,before:this.crop(id,frame),after:clone(crop)});
    this.future=[]; this.value[id][frame]=clone(crop);
  }
  undo() { const edit=this.past.pop(); if(edit){this.value[edit.id][edit.frame]=clone(edit.before);this.future.push(edit);} }
  redo() { const edit=this.future.pop(); if(edit){this.value[edit.id][edit.frame]=clone(edit.after);this.past.push(edit);} }
  export() {
    return {format:FORMAT,baseline:'132955434f7835064e5d28d8761521111ce0dbf5',
      purpose:'Candidate sprite crops only; not a game-config import',crops:clone(this.value)};
  }
  restore(payload) {
    if (payload?.format !== FORMAT || payload.baseline !== this.export().baseline || !payload.crops) throw new Error('Draft format or baseline does not match this review build.');
    if (!same(Object.keys(payload.crops).sort(),[...this.items.keys()].sort())) throw new Error('Draft sprite set does not match this build.');
    const next=clone(payload.crops);
    for(const [id,item] of this.items){
      if(!Array.isArray(next[id]) || next[id].length!==item.frames) throw new Error(`Wrong frame count: ${id}`);
      next[id].forEach(crop=>validateCrop(crop,item.region));
    }
    this.saved=clone(next);this.value=next;this.past=[];this.future=[];
  }
  save(storage) {
    // Mark saved only after durable browser write succeeds.
    storage.setItem(STORAGE_KEY,JSON.stringify(this.export())); this.saved=clone(this.value);
  }
}
