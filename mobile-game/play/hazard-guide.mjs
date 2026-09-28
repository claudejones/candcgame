// Read the same descriptors, atlas frames and current crops used by Design/Game.
// Browsing the guide never changes authored configuration or player progress.
export function hazardGuideEntries({items=[],catalog,draft}={},stage){
 return items.filter(i=>i.type==='hazard'&&i.stage===stage.toLowerCase()).map(item=>{
  const b=draft?.frames?.[item.id]?.[0]||item.region,c=draft?.value?.[item.id]?.[0]||item.crops[0];
  const source={x:b.x+c.l,y:b.y+c.t,w:b.w-c.l-c.r,h:b.h-c.t-c.b};
  const flying=item.kind==='flying';
  return {id:item.id,name:item.name,source,url:catalog.assets[item.asset],size:catalog.dimensions[item.asset],flipX:item.flipX,
   action:flying?'High: Slide · Low: Jump':'Jump',
   description:flying?'Approaches through the air at different heights and speeds. Slide beneath a high flight; jump over a low flight.':'Blocks the stage pathway. Time your jump to clear the whole obstacle, then prepare for the next hazard.'};
 });
}
export function hazardGuideCard(entry,el){
 const card=el('article','global-hazard-card'),art=el('div','global-hazard-art'),crop=el('span','global-hazard-crop'),img=el('img');
 const {source:s,size}=entry;
 crop.style.aspectRatio=`${s.w} / ${s.h}`;crop.style.width=`${Math.min(180,112*s.w/s.h)}px`;
 img.src=entry.url;img.alt=entry.name;img.loading='lazy';img.style.width=`${size.width/s.w*100}%`;img.style.maxWidth='none';
 img.style.left=`${-s.x/s.w*100}%`;img.style.top=`${-s.y/s.h*100}%`;
 if(entry.flipX)crop.style.transform='scaleX(-1)';
 crop.append(img);art.append(crop);card.append(art,el('h4','',entry.name),el('p','global-hazard-action',entry.action),el('p','',entry.description));return card;
}
