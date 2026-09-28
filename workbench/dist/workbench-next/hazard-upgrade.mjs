import {HAZARD_UPGRADE} from './hazard-upgrade-data.mjs';
import {hazardGeometry} from './scene-model.mjs';
import {effectivePlacement} from './calibration-settings.mjs';
export function refitUpgradedHazards(state,items,config,ids=Object.keys(HAZARD_UPGRADE)){
 const draft={...state,value:state.crops??state.value};
 for(const id of ids){const h=HAZARD_UPGRADE[id],item=items.find(i=>i.id===id);if(!h||!item)continue;
  const p=state.placement[id],policy=state.calibration.hazards[id],b=state.frames[id][0],c=draft.value[id][0];
  // Expand only what the new silhouette needs; keep custom crops elsewhere.
  for(const [k,v] of Object.entries(h.crop))c[k]=Math.min(c[k],v);
  if(['hazard:oc01:1','hazard:an02:0'].includes(id)&&['x','y','w','h'].every(k=>b[k]===h.referenceFrame[k]))Object.assign(c,h.crop);
  const geom=()=>hazardGeometry(config,item,0,b,c,{...effectivePlacement(draft,item),flipX:false},{travel:false});
  let g=geom();const contact=g.dest.y+(h.contactY-g.source.y)*g.scale;
  p.groundOffset+=state.calibration.stages[item.stage].pathY-contact;g=geom();
  const [l,t,r,bot]=h.core,x1=Math.max(g.source.x,l),x2=Math.min(g.source.x+g.source.w,r),y1=Math.max(g.source.y,t),y2=Math.min(g.source.y+g.source.h,bot);
  p.cw=(x2-x1)/g.source.w;p.ch=(y2-y1)/g.source.h;p.cx=((x1+x2)/2-g.source.x)/g.source.w-.5;
  p.cy=(g.dest.y+(y2-g.source.y)*g.scale-g.anchor)/g.dest.h;
  policy.locks=policy.locks.filter(k=>!['cw','ch','cx','cy','groundOffset'].includes(k));policy.stamp='';delete policy.speeds;
 }
}
