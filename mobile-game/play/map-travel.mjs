// Shared real travel and Screens preview geometry. Coordinates stay normalized.
export const TRAVEL_DEFAULTS={stageDurationMs:1600,continentDurationMs:3200,arrivalHoldMs:2000,propellerFrameMs:120,reducedArrivalMs:600};
export function mapPoint(layout,id,phone=false){const c=layout.continents[id.slice(0,2)];return (phone?c.phone_stage_centers:c.stage_centers)[Number(id.slice(2))-1];}
export function travelPoint(layout,fromId,toId,phone,progress){
 const a=mapPoint(layout,fromId,phone),b=mapPoint(layout,toId,phone),t=Math.max(0,Math.min(1,progress)),f=t*t*(3-2*t),cross=fromId.slice(0,2)!==toId.slice(0,2);
 const route=cross?layout.flight_routes?.[`${fromId}:${toId}`]:null;
 let x,y,dx,dy;
 if(route){const [c,d]=route,u=1-f;x=u*u*u*a[0]+3*u*u*f*c[0]+3*u*f*f*d[0]+f*f*f*b[0];y=u*u*u*a[1]+3*u*u*f*c[1]+3*u*f*f*d[1]+f*f*f*b[1];dx=3*u*u*(c[0]-a[0])+6*u*f*(d[0]-c[0])+3*f*f*(b[0]-d[0]);dy=3*u*u*(c[1]-a[1])+6*u*f*(d[1]-c[1])+3*f*f*(b[1]-d[1]);}
 else{x=a[0]+(b[0]-a[0])*f;y=a[1]+(b[1]-a[1])*f-(cross?Math.sin(Math.PI*f)*.10:0);dx=b[0]-a[0];dy=b[1]-a[1]-(cross?Math.PI*.10*Math.cos(Math.PI*f):0);}
 return {x,y,heading:Math.atan2(dy*layout.native_map_size[1],dx*layout.native_map_size[0]),leftward:dx<0,cross};
}
export function travelState(layout,from,to,elapsed,reduced=false){const c={...TRAVEL_DEFAULTS,...layout.travel},cross=from.slice(0,2)!==to.slice(0,2),duration=reduced?0:cross?c.continentDurationMs:c.stageDurationMs,hold=reduced?c.reducedArrivalMs:c.arrivalHoldMs;return {progress:duration?Math.min(1,elapsed/duration):1,arrived:elapsed>=duration,done:elapsed>=duration+hold,frame:Math.floor(elapsed/c.propellerFrameMs)%2,total:duration+hold};}

// Leave visible breathing room around every destination, including other stages.
export function flightRouteMarks(layout,from,to,phone=false){const nodes=Object.values(layout.continents).flatMap(c=>phone?c.phone_stage_centers:c.stage_centers);return Array.from({length:21},(_,i)=>travelPoint(layout,from,to,phone,(i+1)/22)).filter(p=>nodes.every(([x,y])=>Math.hypot((p.x-x)*layout.native_map_size[0],(p.y-y)*layout.native_map_size[1])>40));}
