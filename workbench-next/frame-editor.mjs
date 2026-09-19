import {same,validateCrop} from './model.mjs';
import {DesignDraft,DESIGN_FORMAT} from './landscape.mjs';
export const FRAME_FORMAT='cc-workbench-next-design-v3';
export const FRAME_STORAGE_KEY='cc-workbench-next-design-draft-v3';
const clone=value=>structuredClone(value);
export const defaultBounds=(item,frame)=>({...item.region,x:item.region.x+frame*item.region.w});

export function validateBounds(bounds,size,crop={l:0,r:0,t:0,b:0}) {
  if(!bounds || Object.keys(bounds).sort().join(',')!=='h,w,x,y' || Object.values(bounds).some(n=>!Number.isFinite(n)))throw new Error('Frame bounds need finite X, Y, width and height.');
  if(bounds.x<0 || bounds.y<0 || bounds.w<1 || bounds.h<1 || bounds.x+bounds.w>size.width || bounds.y+bounds.h>size.height)throw new Error('Frame bounds must stay inside the atlas.');
  validateCrop(crop,bounds);
}
export function croppedBounds(bounds,crop) {
  validateCrop(crop,bounds);
  return {x:bounds.x+crop.l,y:bounds.y+crop.t,w:bounds.w-crop.l-crop.r,h:bounds.h-crop.t-crop.b};
}
export function frameViewBox(item,frames) {
  // One common registration space for every pose, with room beyond the original cell.
  let x=-64,y=-64,right=item.region.w+64,bottom=item.region.h+64;
  frames.forEach((b,i)=>{const base=defaultBounds(item,i);x=Math.min(x,b.x-base.x);y=Math.min(y,b.y-base.y);right=Math.max(right,b.x-base.x+b.w);bottom=Math.max(bottom,b.y-base.y+b.h);});
  if(item.type==='hazard'){const ax=item.sourceAnchor?.x??item.region.w/2,left=x;x=Math.min(x,2*ax-right);right=Math.max(right,2*ax-left);}
  return {x,y,w:right-x,h:bottom-y};
}
export function drawSprite(canvas,image,item,frame,bounds,crop,box,outline=false,flipX=false) {
  canvas.width=Math.ceil(box.w);canvas.height=Math.ceil(box.h);
  const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;if(!image)return;
  const source=croppedBounds(bounds,crop),base=defaultBounds(item,frame);
  const ax=item.sourceAnchor?.x??item.region.w/2;
  const x=(flipX?2*ax-(source.x-base.x)-source.w:source.x-base.x)-box.x,y=source.y-base.y-box.y;
  if(flipX){ctx.save();ctx.translate(x+source.w,y);ctx.scale(-1,1);ctx.drawImage(image,source.x,source.y,source.w,source.h,0,0,source.w,source.h);ctx.restore();}else ctx.drawImage(image,source.x,source.y,source.w,source.h,x,y,source.w,source.h);
  if(outline){ctx.strokeStyle='#c9ed8a';ctx.lineWidth=2;ctx.strokeRect(x,y,source.w,source.h);}
}
function validateFrame(item,frame,bounds,crop,size){
  validateBounds(bounds,size,crop);
  if(item.sourceAnchor){const base=defaultBounds(item,frame),source=croppedBounds(bounds,crop),x=base.x+item.sourceAnchor.x,y=base.y+item.sourceAnchor.y;
    if(x<source.x||x>=source.x+source.w||y<source.y||y>=source.y+source.h)throw new Error('The frame and crop must retain the hazard source anchor.');
  }
}
export function hitBounds(point,bounds,tolerance) {
  const {x,y,w,h}=bounds;
  if(point.x<x-tolerance || point.x>x+w+tolerance || point.y<y-tolerance || point.y>y+h+tolerance)return null;
  const horizontal=Math.abs(point.x-x)<=tolerance?'w':Math.abs(point.x-x-w)<=tolerance?'e':'';
  const vertical=Math.abs(point.y-y)<=tolerance?'n':Math.abs(point.y-y-h)<=tolerance?'s':'';
  return vertical+horizontal || 'move';
}
export function dragBounds(start,handle,dx,dy,size,crop) {
  const b={...start},minW=Math.max(1,crop.l+crop.r+1),minH=Math.max(1,crop.t+crop.b+1);
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  dx=Math.round(dx);dy=Math.round(dy);
  if(handle==='move'){b.x=clamp(start.x+dx,0,size.width-b.w);b.y=clamp(start.y+dy,0,size.height-b.h);}
  else {
    if(handle.includes('w')){b.x=clamp(start.x+dx,0,start.x+start.w-minW);b.w=start.x+start.w-b.x;}
    if(handle.includes('e'))b.w=clamp(start.w+dx,minW,size.width-start.x);
    if(handle.includes('n')){b.y=clamp(start.y+dy,0,start.y+start.h-minH);b.h=start.y+start.h-b.y;}
    if(handle.includes('s'))b.h=clamp(start.h+dy,minH,size.height-start.y);
  }
  return b;
}
export class FrameDraft extends DesignDraft {
  constructor(items,landscapes,dimensions) {
    super(items,landscapes);this.definitions=landscapes;this.dimensions=dimensions;
    this.frameBaseline=Object.fromEntries(items.map(item=>[item.id,Array.from({length:item.frames},(_,i)=>defaultBounds(item,i))]));
    this.frames=clone(this.frameBaseline);this.savedFrames=clone(this.frames);
    for(const item of items)for(const [i,bounds] of this.frames[item.id].entries())validateFrame(item,i,bounds,this.crop(item.id,i),this.size(item.id));
  }
  size(id){return this.dimensions[this.items.get(id).asset];}
  bounds(id,frame){return clone(this.frames[id][frame]);}
  get dirty(){return super.dirty || !same(this.frames,this.savedFrames);}
  get changedFrames(){return [...this.items.keys()].reduce((n,id)=>n+this.frames[id].filter((b,i)=>!same(b,this.frameBaseline[id][i])||!same(this.value[id][i],this.baseline[id][i])).length,0);}
  edit(id,frame,crop) {
    if(!this.frames[id]?.[frame])throw new Error('Unknown frame.');
    validateFrame(this.items.get(id),frame,this.frames[id][frame],crop,this.size(id));
    if(same(crop,this.value[id][frame]))return;
    this.past.push({id,frame,before:this.crop(id,frame),after:clone(crop)});this.future=[];this.value[id][frame]=clone(crop);
  }
  editBounds(id,frame,bounds) {
    if(!this.frames[id]?.[frame])throw new Error('Unknown frame.');
    validateFrame(this.items.get(id),frame,bounds,this.crop(id,frame),this.size(id));
    if(same(bounds,this.frames[id][frame]))return;
    this.past.push({kind:'bounds',id,frame,before:this.bounds(id,frame),after:clone(bounds)});this.future=[];this.frames[id][frame]=clone(bounds);
  }
  undo(){const e=this.past.at(-1);if(e?.kind!=='bounds')return super.undo();this.past.pop();this.frames[e.id][e.frame]=clone(e.before);this.future.push(e);}
  redo(){const e=this.future.at(-1);if(e?.kind!=='bounds')return super.redo();this.future.pop();this.frames[e.id][e.frame]=clone(e.after);this.past.push(e);}
  export(){return {...super.export(),format:FRAME_FORMAT,frames:clone(this.frames),atlasDimensions:clone(this.dimensions)};}
  restore(payload) {
    const migrating=payload?.format===DESIGN_FORMAT;
    if(!migrating && payload?.format!==FRAME_FORMAT)throw new Error('Unknown Design draft format.');
    if(!migrating && !same(payload.atlasDimensions,this.dimensions))throw new Error('Atlas dimensions changed; the saved copy is retained.');
    const frames=migrating?clone(this.frameBaseline):payload.frames;
    if(!frames || !same(Object.keys(frames).sort(),[...this.items.keys()].sort()))throw new Error('Frame set does not match this editor.');
    if(!payload.sprites?.crops || !same(Object.keys(payload.sprites.crops).sort(),[...this.items.keys()].sort()))throw new Error('Sprite crop set does not match this editor.');
    for(const [id,item] of this.items) {
      if(!Array.isArray(frames[id]) || frames[id].length!==item.frames || !Array.isArray(payload.sprites.crops[id]) || payload.sprites.crops[id].length!==item.frames)throw new Error('Wrong frame count.');
      frames[id].forEach((b,i)=>validateFrame(item,i,b,payload.sprites.crops[id][i],this.size(id)));
    }
    // Validate landscape/provenance independently; new fine crops use the edited bounds.
    const check=new DesignDraft([...this.items.values()],this.definitions);
    check.restore({...payload,format:DESIGN_FORMAT,sprites:{...payload.sprites,crops:clone(this.baseline)}});
    this.value=clone(payload.sprites.crops);this.saved=clone(this.value);
    this.landscapes=clone(check.landscapes);this.savedLandscapes=clone(this.landscapes);
    this.frames=clone(frames);this.savedFrames=clone(frames);this.past=[];this.future=[];this.migrated=migrating;
  }
  save(storage){storage.setItem(FRAME_STORAGE_KEY,JSON.stringify(this.export()));this.saved=clone(this.value);this.savedLandscapes=clone(this.landscapes);this.savedFrames=clone(this.frames);this.migrated=false;}
}
