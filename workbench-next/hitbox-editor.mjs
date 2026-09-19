import {PLACEMENT_FIELDS} from './scene-model.mjs';
export const contains=(p,b)=>p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h;
export function dragBox(start,handle,dx,dy){
  const b={...start};
  if(handle==='move'){b.x+=dx;b.y+=dy;return b;}
  if(handle.includes('w')){b.x=Math.min(start.x+dx,start.x+start.w-1);b.w=start.x+start.w-b.x;}
  if(handle.includes('e'))b.w=Math.max(1,start.w+dx);
  if(handle.includes('n')){b.y=Math.min(start.y+dy,start.y+start.h-1);b.h=start.y+start.h-b.y;}
  if(handle.includes('s'))b.h=Math.max(1,start.h+dy);
  return b;
}
export function placementForBox(item,g,box,p){
  const r=g.hitReference,next={...p};
  const clamp=(key,n)=>Math.max(PLACEMENT_FIELDS[key][1],Math.min(PLACEMENT_FIELDS[key][2],n));
  next.cw=clamp('cw',box.w/r.w);next.ch=clamp('ch',box.h/r.h);
  const w=item.type==='character'?r.w*next.cw:Math.max(4,r.w*next.cw),h=item.type==='character'?r.h*next.ch:Math.max(4,r.h*next.ch);
  if(item.type==='character'){
    next.cx=clamp('cx',(box.x+w/2-r.x)/r.w);
    // Production Y is a proportion of spare visible height. At exactly 100%
    // height there is no spare height, so its vertical position is fixed.
    next.cy=Math.abs(r.h-h)<1e-8?p.cy:clamp('cy',1-(box.y-r.top)/(r.h-h));
  }else{
    next.cx=clamp('cx',(box.x-r.x-(r.w-w)/2)/r.w);
    next.cy=clamp('cy',(box.y-(r.kind==='flying'?r.y+(r.h-h)/2:r.anchor-h))/r.h);
  }
  return next;
}
export function drawHandles(canvas,box){
  const ctx=canvas.getContext('2d'),scale=canvas.width/(canvas.getBoundingClientRect().width||canvas.width),size=7*scale;
  ctx.save();ctx.strokeStyle='#fff';ctx.lineWidth=scale;ctx.strokeRect(box.x,box.y,box.w,box.h);ctx.fillStyle='#fff';
  for(const [x,y] of [[0,0],[.5,0],[1,0],[0,.5],[1,.5],[0,1],[.5,1],[1,1]])ctx.fillRect(box.x+x*box.w-size/2,box.y+y*box.h-size/2,size,size);
  ctx.restore();
}
