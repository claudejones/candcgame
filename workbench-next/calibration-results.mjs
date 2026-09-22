import {PROFILES} from './calibration-settings.mjs';
import {meetsProfile} from './calibration-engine.mjs';
const $=id=>document.getElementById(id);
const node=(tag,text,className)=>{const el=document.createElement(tag);if(text)el.textContent=text;if(className)el.className=className;return el;};
export function resultStatus(row,referenceFresh,checksFresh){
 if(!referenceFresh||!checksFresh)return 'stale';
 if(row.applied)return row.ready?'applied':'applied-attention';
 return row.ready?'ready':'attention';
}
export function filterResults(rows,{query='',continent='',filter='all',metadata,status}){
 const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 return rows.filter(r=>{const m=metadata.get(r.stage),s=status(r),search=`${r.name} ${r.stage} ${m.continent} ${m.label}`.toLowerCase();
  return (!continent||m.continent===continent)&&words.every(w=>search.includes(w))&&(filter==='all'||filter==='attention'&&['stale','attention','applied-attention'].includes(s)||filter==='ready'&&s==='ready'||filter==='selected'&&r.reviewed&&!r.applied||filter==='applied'&&r.applied);
 });
}
export function setupCalibrationResults({stageGroups,getStage,status,profileFresh,review,select}){
 const metadata=new Map(),openGroups=new Map();let current={rows:[],active:null,busy:false},visible=[];
 for(const [continent,stages] of stageGroups){$('cal-continent').add(new Option(continent,continent));for(const s of stages)metadata.set(s.id,{continent,label:s.label});}
 function render(value=current){
  current=value;const {rows,active,busy}=current,list=$('cal-results'),scroll=list.scrollTop,focus=document.activeElement?.dataset.resultControl;
  visible=filterResults(rows,{query:$('cal-search').value,continent:$('cal-continent').value,filter:$('cal-filter').value,metadata,status});
  const attention=rows.filter(r=>['stale','attention','applied-attention'].includes(status(r))).length,ready=rows.filter(r=>['ready','applied'].includes(status(r))).length,applied=rows.filter(r=>r.applied).length;
  $('cal-counts').textContent=rows.length?`${rows.length} results · ${attention} need attention · ${ready} pass all targets · ${applied} applied`:'';
  $('cal-showing').textContent=rows.length?`Showing ${visible.length} of ${rows.length} hazards`:'';
  $('cal-result-tools').hidden=!rows.length;$('cal-empty').hidden=!rows.length||Boolean(visible.length);
  list.replaceChildren();
  for(const [continent,stages] of stageGroups){
   const matches=visible.filter(r=>metadata.get(r.stage).continent===continent);if(!matches.length)continue;
   const continentSection=node('section',null,'cal-continent-group');continentSection.append(node('h4',`${continent} · ${matches.length}`));list.append(continentSection);
   for(const stage of stages){
    const entries=matches.filter(r=>r.stage===stage.id);if(!entries.length)continue;
    const group=node('details',null,'cal-stage-group');group.dataset.stage=stage.id;
    group.open=Boolean($('cal-search').value.trim())||(openGroups.get(stage.id)??stage.id===getStage());
    const summary=node('summary');summary.append(node('span',`${stage.id.toUpperCase()} · ${stage.label}`));
    const needs=entries.filter(r=>['stale','attention','applied-attention'].includes(status(r))).length;
    summary.append(node('small',`${entries.length} hazards${needs?' · '+needs+' need attention':''}`));group.append(summary);
    group.ontoggle=()=>{if(group.isConnected)openGroups.set(stage.id,group.open);};
    const content=node('div',null,'cal-stage-results');group.append(content);continentSection.append(group);
    for(const r of entries){
     const state=status(r),selected=active===r,card=node('article',null,'cal-result');card.dataset.resultId=r.id;card.classList.toggle('active',selected);
     card.append(node('strong',r.name));
     const label=state==='stale'?'Needs recheck':state==='applied'?'Applied · all difficulties pass':state==='applied-attention'?'Applied · needs adjustment':state==='ready'?(!r.changes.length?'Current settings pass all difficulties':'Ready · all difficulties pass'):'Needs adjustment · see difficulty results';
     card.append(node('p',label,'cal-verdict'));
     const badges=node('div',null,'cal-profile-badges');
     for(const profile of PROFILES){const valid=profileFresh(r,profile),passed=valid&&meetsProfile(r.profiles[profile]);const badge=node('span',`${profile[0].toUpperCase()+profile.slice(1)} ${!valid?'Recheck':passed?'✓':'!'}`);badge.className=!valid?'stale':passed?'pass':'attention';badge.title=`${profile}: ${!valid?'needs recheck':passed?'proposed settings meet target':'proposed settings need adjustment'}`;badges.append(badge);}
     card.append(badges);
     const button=node('button',r.applied?'Applied':selected?'Close comparison':'Review proposal →');button.disabled=busy||state==='stale'||r.applied;button.dataset.resultControl='review:'+r.id;button.setAttribute('aria-label',`${button.textContent} · ${r.stage.toUpperCase()} · ${r.name}`);button.setAttribute('aria-expanded',String(selected));button.setAttribute('aria-controls','proposal-review');button.onclick=()=>review(r);card.append(button);
     const choose=node('label',null,'check'),box=node('input');box.type='checkbox';box.checked=r.reviewed;box.disabled=busy||state==='stale'||r.applied;box.dataset.resultControl='select:'+r.id;box.onchange=()=>select(r,box.checked);choose.append(box,document.createTextNode('Reviewed · select to apply'));card.append(choose);content.append(card);
    }
   }
  }
  list.scrollTop=scroll;
  if(focus){const match=[...list.querySelectorAll('[data-result-control]')].find(el=>el.dataset.resultControl===focus);match?.focus({preventScroll:true});}
 }
 const update=()=>{render();select(null,null);};
 $('cal-search').oninput=update;for(const id of ['cal-continent','cal-filter'])$(id).onchange=update;
 $('cal-clear-filters').onclick=()=>{$('cal-search').value='';$('cal-continent').value='';$('cal-filter').value='all';update();};
 for(const [id,open] of [['cal-expand',true],['cal-collapse',false]])$(id).onclick=()=>{for(const r of visible)openGroups.set(r.stage,open);render();};
 return {render,shown:()=>visible,openStage:stage=>openGroups.set(stage,true)};
}
