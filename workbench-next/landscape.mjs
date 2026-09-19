import {Draft, same} from './model.mjs';

export const LAYERS = ['far', 'mid', 'ground'];
export const DESIGN_STORAGE_KEY = 'cc-workbench-next-design-draft-v2';
export const DESIGN_FORMAT = 'cc-workbench-next-design-v2';
const clone = value => JSON.parse(JSON.stringify(value));

export function landscapeDescriptors(config, registry, contract) {
  return Object.entries(config.worldProfiles).map(([stage, profile]) => {
    const preview=config.workbenchAssetReady?.[stage];
    const active = contract.active(registry, stage);
    const metadata = registry.stages[stage];
    return {id:`landscape:${stage}`, type:'landscape', stage, name:'Landscape',
      status:preview ? 'asset-ready · calibration pending' : active ? metadata.status : 'legacy',
      sources:Object.fromEntries(LAYERS.map(layer => [layer, profile[`${layer}Key`]])),
      expected:active ? clone(metadata.layers) : null,
      baseline:Object.fromEntries(LAYERS.map(layer => [layer, {
        scale:profile[`${layer}Scale`], x:0,
        y:profile[layer === 'far' ? 'farY' : `${layer}YOffset`],
        parallax:layer === 'far' ? 0 : profile[`${layer}Parallax`]
      }])),
      revision:preview ? `${preview.landscape.contractVersion}:${['FAR','MID','GROUND'].map(layer=>preview.assets[layer].sha256.slice(0,8)).join(':')}` : active ? `${registry.contractVersion}:${LAYERS.map(layer=>metadata.layers[layer].cacheKey).join(':')}` : 'legacy-world-profile-v1'
    };
  });
}

export function validateTransform(value) {
  if (!value || Object.keys(value).sort().join(',') !== 'parallax,scale,x,y') throw new Error('Layer needs scale, X, Y and parallax.');
  if (Object.values(value).some(n => !Number.isFinite(n))) throw new Error('Enter a finite number for every layer value.');
  if (value.scale < 0.1 || value.scale > 4) throw new Error('Scale must be between 0.1× and 4×.');
  if (Math.abs(value.x) > 1920 || Math.abs(value.y) > 1080) throw new Error('Offset is outside the editable scene range.');
  if (value.parallax < 0 || value.parallax > 2) throw new Error('Parallax must be between 0 and 2.');
}

// Use the production geometry function; candidate adjustments live in a copy.
export function layerGeometry(config, contract, stage, transforms) {
  const profile = {...config.worldProfiles[stage]};
  for (const layer of LAYERS) {
    validateTransform(transforms[layer]);
    profile[`${layer}Scale`] = transforms[layer].scale;
    profile[layer === 'far' ? 'farY' : `${layer}YOffset`] = transforms[layer].y;
  }
  return contract.geometry({...config, worldProfiles:{...config.worldProfiles, [stage]:profile}}, stage);
}

// Matches Scene.tileFull rounding and repetition. Offset X is an authored visual offset.
export function tileLayer(ctx, image, geometry, scroll = 0, offsetX = 0, alpha = 1) {
  const dw = image.width * geometry.scale, dh = image.height * geometry.scale;
  let x = -((((scroll - offsetX) % dw) + dw) % dw);
  ctx.globalAlpha = alpha;
  for (; x < 960; x += dw) ctx.drawImage(image, Math.round(x), Math.round(geometry.y), Math.ceil(dw), Math.ceil(dh));
  ctx.globalAlpha = 1;
}

export function drawLandscape(canvas, {config, contract, stage, transforms, images, layer='far', view='scene',
  visible={far:true,mid:true,ground:true,clouds:true}, scroll=0,
  cloudScroll=config.worldSpeed>0?scroll/config.worldSpeed*config.worldContract.cloudSpeed:0, guides=false}) {
  const ctx = canvas.getContext('2d');
  const source = images[layer];
  if (view === 'source' && source) {
    canvas.width=source.width; canvas.height=source.height;
    ctx.imageSmoothingEnabled=false; ctx.drawImage(source,0,0); return;
  }
  canvas.width=960; canvas.height=540; ctx.imageSmoothingEnabled=false;
  const geometry = layerGeometry(config,contract,stage,transforms);
  for (const name of ['far','clouds','mid','ground']) {
    if (!visible[name] || (view === 'layer' && name !== layer) || !images[name]) continue;
    if (name === 'clouds') {
      const p=config.worldProfiles[stage], wc=config.worldContract;
      if (p.clouds !== false) tileLayer(ctx,images.clouds,{scale:960/(p.sourceW||wc.sourceW)*wc.cloudScale,y:wc.cloudY},cloudScroll,0,wc.cloudOpacity);
    } else tileLayer(ctx,images[name],geometry[name],scroll*transforms[name].parallax,transforms[name].x);
  }
  if (guides) {
    ctx.save(); ctx.strokeStyle='#f5d983'; ctx.lineWidth=2; ctx.setLineDash([8,6]);
    ctx.beginPath(); ctx.moveTo(0,410); ctx.lineTo(960,410); ctx.stroke();
    ctx.setLineDash([]); ctx.font='14px system-ui'; ctx.fillStyle='#101518'; ctx.fillRect(8,384,160,22);
    ctx.fillStyle='#f5d983'; ctx.fillText('Gameplay surface · 410',14,400); ctx.restore();
  }
}

export class DesignDraft extends Draft {
  constructor(items, landscapes) {
    super(items);
    this.landscapeBaseline=Object.fromEntries(landscapes.map(item=>[item.stage,clone(item.baseline)]));
    this.landscapes=clone(this.landscapeBaseline); this.savedLandscapes=clone(this.landscapeBaseline);
    this.landscapeRevision=Object.fromEntries(landscapes.map(item=>[item.stage,{revision:item.revision,baseline:item.baseline}]));
    this.migrated=false;
  }
  get dirty() { return super.dirty || !same(this.landscapes,this.savedLandscapes) || this.migrated; }
  get changedLayers() { return Object.keys(this.landscapes).reduce((count,stage)=>count+LAYERS.filter(layer=>!same(this.landscapes[stage][layer],this.landscapeBaseline[stage][layer])).length,0); }
  transform(stage,layer) { return clone(this.landscapes[stage][layer]); }
  editLayer(stage,layer,after) {
    if (!this.landscapes[stage]?.[layer]) throw new Error('Unknown stage/layer.');
    validateTransform(after);
    const before=this.transform(stage,layer); if(same(before,after))return;
    this.past.push({kind:'landscape',stage,layer,before,after:clone(after)});
    this.future=[]; this.landscapes[stage][layer]=clone(after);
  }
  undo() {
    const edit=this.past.at(-1); if(!edit)return;
    if(edit.kind!=='landscape')return super.undo();
    this.past.pop(); this.landscapes[edit.stage][edit.layer]=clone(edit.before); this.future.push(edit);
  }
  redo() {
    const edit=this.future.at(-1); if(!edit)return;
    if(edit.kind!=='landscape')return super.redo();
    this.future.pop(); this.landscapes[edit.stage][edit.layer]=clone(edit.after); this.past.push(edit);
  }
  export() {
    return {format:DESIGN_FORMAT, purpose:'Candidate landscape transforms and sprite crops; not a production game-config import',
      sprites:super.export(),landscapeRevision:clone(this.landscapeRevision),landscapes:clone(this.landscapes)};
  }
  restore(payload) {
    if(payload?.format!==DESIGN_FORMAT || !same(payload.landscapeRevision,this.landscapeRevision)) throw new Error('Design draft artwork/defaults do not match this review build.');
    const sprites=new Draft([...this.items.values()]); sprites.restore(payload.sprites);
    if(!payload.landscapes || !same(Object.keys(payload.landscapes).sort(),Object.keys(this.landscapeBaseline).sort())) throw new Error('Design draft stage set does not match.');
    for(const layers of Object.values(payload.landscapes)) {
      if(!layers || !same(Object.keys(layers).sort(),[...LAYERS].sort()))throw new Error('Design draft layer set does not match.');
      for(const value of Object.values(layers))validateTransform(value);
    }
    this.value=clone(sprites.value); this.saved=clone(sprites.value);
    this.landscapes=clone(payload.landscapes); this.savedLandscapes=clone(this.landscapes);
    this.past=[]; this.future=[]; this.migrated=false;
  }
  restoreSpriteDraft(payload) {
    const sprites=new Draft([...this.items.values()]); sprites.restore(payload);
    this.value=clone(sprites.value); this.saved=clone(sprites.value); this.migrated=true;
  }
  save(storage) {
    storage.setItem(DESIGN_STORAGE_KEY,JSON.stringify(this.export()));
    this.saved=clone(this.value); this.savedLandscapes=clone(this.landscapes); this.migrated=false;
  }
}
