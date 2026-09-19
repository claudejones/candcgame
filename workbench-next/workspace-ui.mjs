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
  const observer=new ResizeObserver(fit);for(const node of document.querySelectorAll('.canvas-scroll'))observer.observe(node);
  $('zoom').onchange=fit;
  document.addEventListener('pointerdown',event=>{if(!$('view-options').contains(event.target))$('view-options').open=false;});
  window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.querySelector('dialog[open]')){$('view-options').open=false;focus(false);}});
  return {fit};
}
