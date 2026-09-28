export const UI_STORAGE_KEY='cc-workbench-next-layout-v1';
export function fitSize(width,height,sourceWidth,sourceHeight,zoom='fit') {
  const scale=zoom==='fit'?Math.min(width/sourceWidth,height/sourceHeight):Number(zoom);
  return {width:Math.max(1,sourceWidth*scale),height:Math.max(1,sourceHeight*scale)};
}
export function setupWorkspace() {
  const $=id=>document.getElementById(id), panels=[...document.querySelectorAll('[data-pref]')];
  let preferences={};
  try{preferences=JSON.parse(localStorage.getItem(UI_STORAGE_KEY)||'{}')||{};}catch{}
  const save=()=>{try{localStorage.setItem(UI_STORAGE_KEY,JSON.stringify(preferences));}catch{}};
  for(const panel of panels){if(typeof preferences[panel.id]==='boolean')panel.open=preferences[panel.id];panel.addEventListener('toggle',()=>{preferences[panel.id]=panel.open;save();});}
  function focus(value){$('workspace').classList.toggle('focus-mode',value);$('focus-view').setAttribute('aria-pressed',String(value));$('focus-view').textContent=value?'Show panels':'Focus view';preferences.focus=value;save();}
  focus(preferences.focus===true);
  $('focus-view').onclick=()=>focus(!$('workspace').classList.contains('focus-mode'));
  function fit(){
    for(const id of ['preview','baseline']){
      const canvas=$(id),area=canvas.parentElement;if(!area.clientWidth||!area.clientHeight)continue;
      const size=fitSize(area.clientWidth,area.clientHeight,canvas.width,canvas.height,$('zoom').value);
      canvas.style.width=`${size.width}px`;canvas.style.height=`${size.height}px`;
    }
  }
  let hand=false,space=false,pan=null;
  const areas=[...document.querySelectorAll('.canvas-scroll')];
  const updateHand=()=>{for(const area of areas)area.classList.toggle('pan-ready',hand||space);$('pan-tool').setAttribute('aria-pressed',String(hand));};
  function endPan(){if(!pan)return;const old=pan;pan=null;old.area.classList.remove('panning');if(old.area.hasPointerCapture?.(old.id))old.area.releasePointerCapture(old.id);}
  $('pan-tool').onclick=()=>{hand=!hand;endPan();updateHand();};
  window.addEventListener('keydown',e=>{
    if(e.code!=='Space'||e.repeat||document.querySelector('dialog[open]')||['INPUT','SELECT','TEXTAREA','BUTTON','SUMMARY'].includes(document.activeElement?.tagName))return;
    space=true;e.preventDefault();updateHand();
  });
  window.addEventListener('keyup',e=>{if(e.code==='Space'){space=false;endPan();updateHand();}});
  window.addEventListener('blur',()=>{space=false;endPan();updateHand();});
  window.addEventListener('keydown',e=>{if(e.key==='Escape'){space=false;endPan();updateHand();}});
  for(const area of areas){
    area.addEventListener('pointerdown',e=>{
      if(!(hand||space)||e.button!==0)return;
      e.preventDefault();e.stopPropagation();area.setPointerCapture(e.pointerId);
      pan={area,id:e.pointerId,x:e.clientX,y:e.clientY,left:area.scrollLeft,top:area.scrollTop};area.classList.add('panning');
    },true);
    area.addEventListener('pointermove',e=>{if(!pan||pan.id!==e.pointerId)return;e.preventDefault();area.scrollLeft=pan.left+pan.x-e.clientX;area.scrollTop=pan.top+pan.y-e.clientY;});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])area.addEventListener(event,endPan);
  }
  const observer=new ResizeObserver(fit);for(const node of document.querySelectorAll('.canvas-scroll'))observer.observe(node);
  $('zoom').onchange=()=>{endPan();fit();if($('zoom').value==='fit')for(const area of areas){area.scrollLeft=0;area.scrollTop=0;}};
  document.addEventListener('pointerdown',event=>{if(!$('view-options').contains(event.target))$('view-options').open=false;});
  window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.querySelector('dialog[open]')){$('view-options').open=false;focus(false);}});
  return {fit};
}
