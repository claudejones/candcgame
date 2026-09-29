import {hazardGuideEntries,hazardGuideCard} from './hazard-guide.mjs';
import {AttractCycle} from './attract-mode.mjs';
import {GameAudio} from './game-audio.mjs';
import {travelPoint,travelState,flightRouteMarks} from './map-travel.mjs';
import {loadSecretData} from './level-runtime.mjs';
import {PlayerStore,CONTINENTS,STAGES,DIFFICULTIES,best,passport,unlocks,available} from './player-state.mjs';
const BASE='../assets/global-ui/';
const el=(tag,className,text)=>{const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;};
function positionMapPin(pin,layout,fromId,toId,phone,f){if(!pin)return;const p=travelPoint(layout,fromId,toId,phone,f);pin.style.left=p.x*100+'%';pin.style.top=p.y*100+'%';pin.classList.toggle('antarctica-pin',toId.startsWith('AN')&&f===1);}
const title=s=>s[0].toUpperCase()+s.slice(1);
export async function setupGlobalGame({panel,surface,launch,pause,resume,restart,getRun,backDesign,cancelDemo=()=>{},previewStore=null,playerStorage=null,guideData=null,prepareWorld=null,isVisible=()=>!document.hidden,audio=new GameAudio()}){
 const [manifest,stages,layout]=await Promise.all(['manifest.json','stages.json','map_layout.json'].map(async file=>{const r=await fetch(BASE+file);if(!r.ok)throw Error(`Could not load ${file}`);return r.json();}));
 const [secretManifest]=await loadSecretData();
 let storage;try{storage=playerStorage||(previewStore?previewStore.storage:localStorage);}catch{storage={getItem(){throw Error('Browser storage is unavailable.');},setItem(){throw Error('Browser storage is unavailable.');}};}
 const store=previewStore||new PlayerStore(storage),root=el('section','global-game'),results=el('section','global-game global-result'),bar=el('div','global-run-menu');
 root.id=previewStore?'screens-global-game':'global-game';root.setAttribute('aria-label','Game menus');const heading=panel.querySelector('.play-heading');if(heading)heading.after(root);else panel.prepend(root);surface.append(results);results.hidden=true;
 const menuButton=button('',()=>{pause();openMenu();});menuButton.setAttribute('aria-label','Menu');menuButton.title='Menu';menuButton.append(picture('UI_ICON_MENU.png','','global-menu-icon'));bar.append(menuButton);surface.append(bar);
 const demoHint=el('p','global-demo-hint','Demo · Tap or press any key to return');demoHint.hidden=true;surface.append(demoHint);
 const notice=el('div','global-notice');notice.setAttribute('role','dialog');notice.setAttribute('aria-modal','true');notice.setAttribute('aria-label','Game message');panel.append(notice);notice.hidden=true;
 let attract=null,attractFrame=0,attractLast=null,opened=false;
 let activeRun=null,loading=false,resultDestination=null,entryToken=0,previewTravel=null,previewTravelDuration=0;
 let worldReady=!prepareWorld,worldRequest=0;
 let screen='start',character='claude',difficulty='standard',continent='NA',page=0,rewardDifficulty='standard',attempt=null,shownOutcome=null,committedResult=null,travelTimer=0,travelTarget=null,optionsBack=null;
 const stageName=id=>stages.find(s=>s.id===id)?.name||'Stage';
 const stageLabel=id=>`Stage ${Number(id.slice(2))} · ${stageName(id)}`;
 function asset(name){const record=manifest[name]||secretManifest.assets[name];if(!manifest[name]&&record)return '../assets/secret-level/'+name+'?v='+record.sha256.slice(0,12);if(!record)throw Error(`Missing global asset ${name}`);return BASE+record.file+'?v='+record.sha256.slice(0,12);}
 function picture(name,alt='',className=''){const n=el('img',className);n.src=asset(name);n.alt=alt;n.onerror=()=>tell('An image could not load. Refresh to retry.');return n;}
 function sprite(name,col,row,cols,rows,className=''){const n=el('span','global-sprite '+className);n.style.backgroundImage=`url("${asset(name)}")`;n.style.backgroundSize=`${cols*100}% ${rows*100}%`;n.style.backgroundPosition=`${cols===1?0:col/(cols-1)*100}% ${rows===1?0:row/(rows-1)*100}%`;n.setAttribute('aria-hidden','true');return n;}
 function button(text,fn,primary=false){const n=el('button','global-button'+(primary?' primary':''),text);n.type='button';n.onclick=e=>{if(n.disabled)return;audio.configure(store.state.settings);const launchCue=/^(Start|Continue|Play|Replay|New Game|Beneath)|^Retry$/.test(n.textContent);audio.unlock();const result=fn(e);audio.button(launchCue);return result;};return n;}
 let messageFocus=null;
 function tell(text){
  if(!text){notice.hidden=true;notice.replaceChildren();messageFocus?.focus();messageFocus=null;return;}
  if(notice.hidden)messageFocus=document.activeElement;
  if(getRun())pause();notice.replaceChildren();const box=frame('Notice');box.classList.add('global-message-panel');box.append(el('p','',text),button('Close',()=>tell('')));notice.append(box);notice.hidden=false;box.querySelector('button').focus();
 }
 notice.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();tell('');}if(e.key==='Tab'){const buttons=notice.querySelectorAll('button'),first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};
 function saved(control=null){
  if(store.status==='error'){tell('Could not save. Your progress is still available until you close this page.');const box=notice.querySelector('.global-message-panel');box.querySelector('button').remove();box.append(button('Retry Save',()=>{store.save();saved();}),button('Continue without saving',()=>tell('')));box.querySelector('button').focus();}
  else{tell('');if(control){control.textContent='Saved';control.setAttribute('aria-live','polite');setTimeout(()=>{control.textContent='Save';},1800);}}
 }
 function saveButton(){let b;b=button('Save',()=>{store.save();saved(b);});return b;}
 function header(text,back){const h=el('header','global-header');if(back)h.append(button('Back',back));h.append(el('h2','',text));return h;}
 function frame(text){const f=el('div','global-panel');if(text)f.append(el('h3','',text));return f;}
 function show(next){previewTravel=null;previewTravelDuration=0;screen=next;audio.configure(store.state.settings);audio.screen(next);surface.dataset.globalScreen=next;demoHint.hidden=next!=='demo';queueMicrotask(()=>{if(previewStore)return;const target=next==='result'?results:root;target.querySelector('button')?.focus({preventScroll:true});});clearTimeout(travelTimer);travelTarget=null;root.hidden=next==='game'||next==='demo'||next==='result';surface.hidden=!root.hidden;results.hidden=next!=='result';for(const control of surface.querySelectorAll('.gameplay-actions'))control.inert=next!=='game';bar.hidden=next!=='game';root.replaceChildren();root.removeAttribute('role');root.removeAttribute('aria-modal');tell('');}
 function footer(){const n=el('nav','global-footer');n.append(button('Achievements',()=>achievements(start)),button('Options',()=>options(start)),button('How to Play',()=>about(start)));return n;}
 function start(){show('start');root.className='global-game global-start';root.append(picture('BRAND_GAME_LOGO.png','Claude & Constance — Around the World','global-logo'));
  const content=el('div','global-start-columns'),chars=frame('Choose your character'),portraits=el('div','global-portraits');
  for(const c of ['claude','constance']){const b=button('',()=>{character=c;start();});b.classList.toggle('selected',c===character);b.setAttribute('aria-pressed',String(c===character));b.append(sprite('G1B_CHARACTER_SELECT_ATLAS.png',c==='claude'?0:1,0,2,1,'global-portrait global-portrait-'+c),el('span','',title(c)+(c===character?' ✓':'')));portraits.append(b);}chars.append(portraits);
  const actions=frame('Difficulty'),diff=el('div','global-difficulties'),difficultyHelp=el('p','global-help global-difficulty-help',{easy:'Easy gives you more time to react and wider gaps.',standard:'Standard balances reaction time and challenge.',hard:'Hard brings faster, denser encounters.'}[difficulty]);actions.classList.add('global-start-actions');difficultyHelp.setAttribute('role','status');for(const d of DIFFICULTIES){const b=button(title(d),()=>{if(d==='hard'&&!unlocks(store.state).hard){difficultyHelp.textContent='Complete all 21 stages on Standard without Unlimited Health to unlock Hard.';return;}difficulty=d;start();});b.classList.toggle('selected',d===difficulty);b.setAttribute('aria-pressed',String(d===difficulty));if(d==='hard'&&!unlocks(store.state).hard)b.append(picture('UI_ICON_LOCK.png','Locked','global-icon'));diff.append(b);}actions.append(diff,difficultyHelp);
  const j=store.state.journey,secretContinue=store.state.resumeTarget==='secret'&&store.state.secret?.attempt,cont=button('',continueJourney,true);cont.classList.add('global-continue');cont.textContent='Continue';cont.disabled=!j&&!secretContinue;
  if(j||secretContinue)actions.append(cont);actions.append(button('New Game',()=>{const go=()=>{store.newJourney(character,difficulty);attempt=null;activeRun=null;continent='NA';const ready=map();saved();return ready;};if(j)confirm('Start a new journey?','Your earned trophies, passports and unlocks will be kept.',go,start);else return go();}));
  if(store.state.settings.unlimited)actions.append(el('p','global-assistance','Assisted play · Unlimited Health'));
  if(unlocks(store.state).secret)actions.append(button('Beneath the Ice',()=>enterSecret(character)));
  content.append(chars,actions);root.append(content,footer());if(store.status==='error')saved();
 }
 async function continueJourney(){
  if(loading)return;if(store.state.resumeTarget==='secret'&&store.state.secret?.attempt){await enterSecret(store.state.secret.attempt.character);return;}if(!store.state.journey)return;
  continent=store.state.journey.stage.slice(0,2);
  await enter(store.state.journey.stage);
 }
 function hearts(n){const h=el('span','global-hearts');h.setAttribute('aria-label',`${n} of 3 hearts`);for(let i=0;i<3;i++)h.append(sprite('UI_REWARD_UTILITIES_ATLAS.png',i<n?1:0,0,3,1,'global-heart'));return h;}
 function trophy(stage,n){return sprite(`TROPHY_${stage.slice(0,2)}_ATLAS.png`,Number(stage.slice(2))-1,n?1:0,3,2,'global-reward-art');}
 function stamp(c,n){const wrap=el('span','global-reward-art global-passport-art');wrap.append(sprite('PASS_STAMPS_ATLAS.png',CONTINENTS.indexOf(c),n?1:0,7,2,'global-passport-stamp'));if(n===2)wrap.append(sprite('UI_REWARD_UTILITIES_ATLAS.png',2,0,3,1,'global-passport-star'));return wrap;}
 function allowed(stage){const j=store.state.journey;return j&&(available(store.state,j.difficulty,stage)||j.visited.includes(stage));}
 function map(drawerOpen=false){if(!worldReady)return waitWorld(()=>map(drawerOpen));drawerOpen=drawerOpen===true;if(!store.state.journey){start();return;}show('map');root.className='global-game global-map';const j=store.state.journey;
  const nav=header('WORLD MAP',start),drawerToggle=button('Stages',()=>setDrawer(section.hidden));drawerToggle.setAttribute('aria-expanded',String(Boolean(drawerOpen)));nav.append(drawerToggle,button('Achievements',()=>achievements(map)),button('Options',()=>options(map)),saveButton());root.append(nav);
  const region=el('div','global-map-region'),art=el('div','global-map-art');art.append(picture('MAP_WORLD_BASE.png','','global-geography'));
  const phone=(previewStore?Number(panel.dataset.previewWidth||960)<=900:matchMedia('(max-height:550px), (max-width:900px)').matches);
  const clouds=el('div','global-map-clouds');clouds.setAttribute('aria-hidden','true');art.append(clouds);
  const flow=el('div','global-cloud-flow');clouds.append(flow);for(const repeat of [0,1])layout.cloud_centers.forEach(([x,y],i)=>{const cloud=sprite('MAP_CLOUDS_ATLAS.png',i%3,0,3,1,'global-cloud');cloud.style.left=(x+repeat)*100+'%';cloud.style.top=y*100+'%';flow.append(cloud);});
  for(let i=0;i<CONTINENTS.length-1;i++){const from=CONTINENTS[i]+'03',to=CONTINENTS[i+1]+'01';for(const p of flightRouteMarks(layout,from,to,phone)){const dot=el('span','global-continent-route-dot');dot.setAttribute('aria-hidden','true');dot.style.left=p.x*100+'%';dot.style.top=p.y*100+'%';dot.style.transform=`translate(-50%,-50%) rotate(${p.heading}rad)`;art.append(dot);}}

  for(const c of CONTINENTS){const loc=layout.continents[c],xy=phone?loc.phone_label_center:loc.label_center;
   const plate=button(loc.label,()=>{continent=c;map(true);});plate.className='global-continent';plate.setAttribute('aria-pressed',String(c===continent));plate.style.left=xy[0]*100+'%';plate.style.top=xy[1]*100+'%';const complete=passport(store.state,j.difficulty,c)>0,locked=!allowed(c+'01');plate.style.setProperty('--continent-plate',`url("${asset('UI_CONTINENT_PLATE_'+(locked?'LOCKED':complete?'COMPLETE':'NORMAL')+'.png')}")`);if(locked)plate.prepend(picture('UI_ICON_LOCK.png','','global-icon'));const order=CONTINENTS.indexOf(c)+1,badge=el('span','global-continent-order',String(order));badge.setAttribute('aria-hidden','true');plate.append(badge);plate.setAttribute('aria-label',`${loc.label} · Continent ${order} of 7`);art.append(plate);
   const coords=phone?loc.phone_stage_centers:loc.stage_centers;
   for(let i=0;i<coords.length-1;i++){const [x,y]=coords[i],[nx,ny]=coords[i+1],dx=nx-x,dy=(ny-y)*layout.native_map_size[1]/layout.native_map_size[0],route=el('span','global-stage-route');route.setAttribute('aria-hidden','true');route.style.left=x*100+'%';route.style.top=y*100+'%';route.style.width=Math.hypot(dx,dy)*100+'%';route.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;art.append(route);}

   coords.forEach(([x,y],i)=>{const id=`${c}0${i+1}`,score=best(store.state,j.difficulty,id),node=sprite('MAP_NODE_STATES_ATLAS.png',score?2:allowed(id)?1:0,0,5,1,'global-node');node.setAttribute('aria-hidden','false');node.setAttribute('role','img');node.setAttribute('aria-label',stageLabel(id)+(score?' · Completed':allowed(id)?' · Available':' · Locked'));node.style.left=x*100+'%';node.style.top=y*100+'%';art.append(node);
    if(allowed(id)){const target=el('button','global-stage-target');target.type='button';target.setAttribute('aria-label',`Play ${stageLabel(id)}`);target.style.left=x*100+'%';target.style.top=y*100+'%';target.style.width=`min(30px,${Math.min(...coords.filter((_,j)=>j!==i).map(([ox,oy])=>Math.hypot(ox-x,(oy-y)*layout.native_map_size[1]/layout.native_map_size[0])))*94}%)`;target.onclick=()=>{if(loading)return;audio.unlock();const result=enter(id);audio.button(true);return result;};art.append(target);}
    if(id===j.stage){const ring=sprite('MAP_NODE_STATES_ATLAS.png',4,0,5,1,'global-ring'),pin=sprite('MAP_HEAD_PINS_ATLAS.png',j.character==='claude'?0:1,0,2,1,'global-pin');for(const n of [ring,pin]){n.style.left=x*100+'%';n.style.top=y*100+'%';art.append(n);}pin.id='global-map-pin';pin.classList.toggle('antarctica-pin',c==='AN');ring.id='global-map-ring';}
   });
  }
  const mapBody=el('div','global-map-body');region.append(art);mapBody.append(region);root.append(mapBody);
  const section=el('section','global-stage-panel global-stage-drawer');section.id=previewStore?'preview-stage-drawer':'game-stage-drawer';section.hidden=!drawerOpen;section.setAttribute('aria-label',`${layout.continents[continent].label} stages`);drawerToggle.setAttribute('aria-controls',section.id);
  const drawerHeader=el('div','global-drawer-header'),closeDrawer=button('Close',()=>setDrawer(false));closeDrawer.setAttribute('aria-label','Close stage drawer');drawerHeader.append(el('h3','',`${layout.continents[continent].label} · ${title(j.difficulty)}`),closeDrawer);section.append(drawerHeader);const cards=el('div','global-stage-cards');
  function setDrawer(open){section.hidden=!open;drawerToggle.setAttribute('aria-expanded',String(open));(open?closeDrawer:drawerToggle).focus({preventScroll:true});}
  section.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();setDrawer(false);}};
  // Fit the game viewport, while Screens keeps its own predictable preview size.
  queueMicrotask(()=>{if(!previewStore&&root.getBoundingClientRect&&typeof window!=='undefined'){root.style.setProperty('--map-available-height',`${Math.max(220,window.innerHeight-root.getBoundingClientRect().top-12)}px`);}});

  for(const id of STAGES.filter(s=>s.startsWith(continent))){const n=best(store.state,j.difficulty,id),locked=!allowed(id),card=el('article','global-stage-card'+(locked?' locked':''));card.style.backgroundImage=`url("${asset('UI_STAGE_CARD_'+(locked?'LOCKED':id===j.stage?'CURRENT':n?'COMPLETE':'NORMAL')+'.png')}")`;
   const thumb=sprite('MAP_STAGE_THUMBNAILS_ATLAS.png',Number(id.slice(2))-1,CONTINENTS.indexOf(continent),3,7,'global-thumb'),body=el('div','global-stage-body');body.append(el('h4','',`Stage ${Number(id.slice(2))}`),el('p','',stageName(id)));
   if(locked){const lock=button('Locked',()=>{const text=`Finish ${stageLabel(STAGES[STAGES.indexOf(id)-1])} to unlock this stage.`;let help=section.querySelector('.global-stage-requirement');if(!help){help=el('p','global-stage-requirement');help.setAttribute('role','status');section.append(help);}help.textContent=text;});lock.prepend(picture('UI_ICON_LOCK.png','','global-icon'));lock.setAttribute('aria-label',`${stageLabel(id)} locked. Show unlock requirement`);body.append(lock);}else{body.append(hearts(n),button(n?'Replay':'Play',()=>enter(id),true));}card.append(thumb,body);cards.append(card);
  }section.append(cards);mapBody.append(section);root.append(el('p','global-map-help',store.state.settings.unlimited?'Assisted play · No new rewards. Select a continent to view its stages.':'Select a continent to view its stages.'));
 }
 function waitWorld(ready){
  const token=++worldRequest;showLoading('Loading world…');
  return prepareWorld().then(()=>{worldReady=true;if(token===worldRequest&&screen==='loading')ready();}).catch(()=>{if(token!==worldRequest||screen!=='loading')return;root.replaceChildren();const f=frame('World could not load');f.append(el('p','','Check your connection and try again.'),button('Retry',()=>waitWorld(ready),true),button('Main Menu',start));root.append(f);});
 }
 function showLoading(title='Loading stage…'){show('loading');root.className='global-game global-menu global-loading';const f=frame(title);f.setAttribute('role','status');f.append(el('p','','Preparing your adventure'));root.append(f);}
 async function enter(id){if(loading||!allowed(id))return;await enterLevel(id);}
 async function enterSecret(who=character){if(loading)return;await enterLevel('SECRET01',who);}
 async function enterLevel(id,who){
  const current=++entryToken;loading=true;activeRun=null;
  try{attempt=id==='SECRET01'?store.beginSecret(who):store.begin(id);shownOutcome=null;committedResult=null;resultDestination=null;showLoading();if(audio.enabled&&audio.settings.music)void audio.engine.load(id==='SECRET01'?'SECRET_BOSS_THEME':id+'_THEME');
   await launch({stage:id.toLowerCase(),character:attempt.character,difficulty:attempt.difficulty||'standard',unlimited:store.state.settings.unlimited});
   if(current!==entryToken)return;activeRun=getRun();show('game');if(store.status==='error')saved();
  }catch(e){if(current===entryToken){id==='SECRET01'?start():map();tell(e.message);}}finally{if(current===entryToken)loading=false;}
 }
 function restartCurrent(){return attempt?.stage==='SECRET01'?enterSecret(attempt.character):enter(store.state.journey.stage);}
 function confirm(heading,description,yes,no){show('confirm');root.className='global-game global-menu global-confirm';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');const f=frame(heading);f.append(el('p','',description),button('Confirm',yes,true),button('Cancel',no));root.append(f);f.querySelector('button').focus();}
 function options(back){optionsBack=back;show('options');root.className='global-game global-menu';root.append(header('OPTIONS',back));const f=frame();
  for(const [key,label] of [['music','Music'],['sound','Sound Effects'],['continuousSlide','Continuous Slide'],['unlimited','Unlimited Health']]){const row=el('div','global-option-row'),on=store.state.settings[key],b=button('',()=>{const change=()=>{store.setOption(key,!on);audio.configure(store.state.settings);const run=getRun();if(run)run.unlimitedLives=store.state.settings.unlimited;options(back);saved();};if(key==='unlimited'&&!on)confirm('Enable Unlimited Health?','This attempt cannot earn or improve trophies, passports or permanent unlocks. Existing rewards are kept.',change,()=>options(back));else change();});b.className='global-switch';b.setAttribute('role','switch');b.setAttribute('aria-checked',String(on));b.setAttribute('aria-label',label);b.append(sprite('UI05_SWITCHES_ATLAS.png',0,on?1:0,4,2));row.append(el('span','',label),b);f.append(row);}
  f.append(button('Game Soundtrack',()=>soundtrack(()=>options(back))));const unlocked=unlocks(store.state).levelSelect,help=el('p','global-help global-level-select-help',unlocked?'Choose any stage from the world map.':'Complete all 21 stages on Standard without Unlimited Health to unlock Level Select.');help.setAttribute('role','status');const select=button('Level Select',()=>{if(unlocks(store.state).levelSelect){if(!store.state.journey)store.newJourney(character,difficulty);map();}else help.textContent='Level Select is locked. Complete all 21 Standard stages without Unlimited Health.';});if(!unlocked)select.append(picture('UI_ICON_LOCK.png','Locked','global-icon'));select.setAttribute('aria-describedby','level-select-help'+(previewStore?'-preview':''));help.id='level-select-help'+(previewStore?'-preview':'');f.append(el('p','global-help','Unlimited Health disables new achievements and permanent unlocks for this attempt.'),select,help);root.append(f);
 }
 let guideStage='NA01';
 function about(back,tab='game'){
  show('about');root.className='global-game global-menu global-about';root.append(header('HOW TO PLAY',back));
  const tabs=el('div','global-guide-tabs'),body=el('div','global-guide-body');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','How to Play');
  const prefix=previewStore?'preview-guide':'game-guide';
  for(const [id,label] of [['game','Game Guide'],['hazards','Hazard Guide']]){
   const b=button(label,()=>{about(back,id);root.querySelector('#'+prefix+'-'+id).focus();});b.id=prefix+'-'+id;b.classList.toggle('selected',id===tab);b.setAttribute('role','tab');b.setAttribute('aria-selected',String(id===tab));b.setAttribute('aria-controls',prefix+'-panel');b.tabIndex=id===tab?0:-1;
   b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const target=e.key==='Home'?'game':e.key==='End'?'hazards':id==='game'?'hazards':'game';about(back,target);root.querySelector('#'+prefix+'-'+target).focus();}};tabs.append(b);
  }
  body.id=prefix+'-panel';body.setAttribute('role','tabpanel');body.setAttribute('aria-labelledby',prefix+'-'+tab);body.tabIndex=0;root.append(tabs,body);
  if(tab==='hazards'){
   const nav=el('nav','global-pages global-guide-pages'),heading=el('h3'),groups=el('div','global-hazard-groups');nav.setAttribute('aria-label','Hazard guide continents');heading.setAttribute('aria-live','polite');
   function turnPage(delta){const current=CONTINENTS.indexOf(guideStage.slice(0,2));guideStage=CONTINENTS[(current+delta+CONTINENTS.length)%CONTINENTS.length]+'01';drawPage();body.scrollTop=0;}
   nav.append(button('Previous',()=>turnPage(-1)),heading,button('Next',()=>turnPage(1)));
   function drawPage(){
    groups.replaceChildren();const c=guideStage.slice(0,2);heading.textContent=`${layout.continents[c].label} · ${CONTINENTS.indexOf(c)+1}/${CONTINENTS.length}`;
    for(const id of STAGES.filter(id=>id.startsWith(c))){
     const group=el('section','global-hazard-stage'),stageHeading=el('h3','',stageLabel(id)),cards=el('div','global-hazard-cards');stageHeading.id=prefix+'-'+id;group.setAttribute('aria-labelledby',stageHeading.id);
     const entries=hazardGuideEntries(guideData||{},id);for(const entry of entries)cards.append(hazardGuideCard(entry,el));if(!entries.length)cards.append(el('p','','Hazard artwork is unavailable. Reopen How to Play after the stage data loads.'));
     group.append(stageHeading,cards);groups.append(group);
    }
   }
   body.append(nav,el('p','global-help','Scroll down to see all hazards for this continent, grouped by stage.'),groups);drawPage();return;
  }
  const f=frame('Around the World');
  f.append(el('p','','Travel through seven continents and twenty-one stages. Reach the finish with at least one heart to pass. Each of the five sections becomes more challenging.'));
  const sections=[
   ['Desktop controls','Jump: Space, ↑ or W. Slide: ↓ or S. Pause or resume: P. You can also click the on-screen controls.'],
   ['Mobile controls','Turn your device sideways. Tap JUMP to clear low obstacles and SLIDE to pass beneath high birds or blasts. Use PAUSE / RESUME to take a break; the menu opens game options.'],
   ['Hearts and trophies','Start a stage with three hearts. A hit costs one heart and briefly protects you from another hit. Finish with one, two or three hearts to record your best stage rating. Three hearts earns a Perfect Stage Run. Your best result is kept when you replay.'],
   ['Continent passports','Complete all three stages in a continent to earn its passport. Record a three-heart best on each stage for a perfect passport. Replays can improve your results; you do not need one uninterrupted perfect journey.'],
   ['Unlock Hard and Level Select','Complete all 21 stages on Standard without Unlimited Health. Hard adds more demanding timing and encounters. Level Select lets you replay any stage from the world map. Easy completion does not unlock these features.'],
   ['Unlock Beneath the Ice','Earn all seven perfect Standard passports: a three-heart best on every Standard stage without Unlimited Health. The secret level then appears on the main menu. Survive its three-minute boss encounter without assistance to earn the secret passport.'],
   ['Saving and assisted play','Progress is saved automatically in this browser on this device. Continue restarts an unfinished stage with three hearts. Unlimited Health is useful for practice, but that attempt cannot earn trophies, passports or unlocks. Previously earned rewards are kept.']
  ];for(const [heading,text] of sections){const section=el('section','global-about-section');section.append(el('h4','',heading),el('p','',text));f.append(section);}body.append(f);
 }
   function soundtrack(back){
   show('soundtrack');root.className='global-game global-menu global-soundtrack';
   let index=0,playing=false,generation=0;
   const tracks=STAGES.map(id=>({id,track:id+'_THEME',label:stageLabel(id)}));
   const leave=()=>{playing=false;generation++;audio.track(null);back();};
   root.append(header('GAME SOUNDTRACK',leave));
   const f=frame('Claude & Constance · Stage Themes');
   const status=el('p','global-soundtrack-status','Choose a track to begin.');status.setAttribute('aria-live','polite');
   const controls=el('div','global-soundtrack-controls');
   const previous=button('Previous',()=>select(index-1,playing));
   const toggle=button('Play',togglePlayback,true);
   const next=button('Next',()=>select(index+1,playing));
   controls.append(previous,toggle,next);f.append(status,controls);
   const list=el('ol','global-soundtrack-list');
   const rows=tracks.map((track,i)=>{
    const row=el('li','global-soundtrack-track'),b=button(`${String(i+1).padStart(2,'0')} · ${track.label}`,()=>select(i,true));
    b.setAttribute('aria-current','false');row.append(b);list.append(row);return {row,button:b};
   });
   function render(message=''){
    const track=tracks[index];status.textContent=message||`${playing?'Now playing':'Selected'} · ${track.label}`;
    toggle.textContent=playing?'Pause':'Play';toggle.setAttribute('aria-label',playing?'Pause soundtrack':'Play selected track');
    rows.forEach((entry,i)=>{const selected=i===index;entry.row.classList.toggle('selected',selected);entry.button.setAttribute('aria-current',String(selected));});
   }
   function playSelected(){
    if(!store.state.settings.music){playing=false;render('Music is off. Turn Music on in Options to listen.');return;}
    index=(index+tracks.length)%tracks.length;const track=tracks[index],token=++generation;playing=true;audio.engine.setPaused(false);
    audio.track(track.track,{loop:false,force:true,onended:()=>{if(generation!==token||!playing)return;select((index+1)%tracks.length,true);}});
    render();
   }
   function select(next,autoplay=false){index=(next+tracks.length)%tracks.length;if(autoplay)playSelected();else render();}
   function togglePlayback(){
    if(playing){playing=false;generation++;audio.engine.setPaused(true);render();return;}
    if(!store.state.settings.music){render('Music is off. Turn Music on in Options to listen.');return;}
    const id=tracks[index].track;
    if(audio.engine.track?.id===id&&!audio.engine.track.ended){playing=true;generation++;audio.engine.setPaused(false);render();}
    else playSelected();
   }
   render();root.append(f,list,el('p','global-help global-soundtrack-help','Tracks play in order and repeat from the beginning after the final stage.'));
  }
  function achievements(back){
   show('achievements');root.className='global-game global-achievements';root.append(header('ACHIEVEMENTS',back));
   const tabs=el('nav','global-difficulties');
   for(const d of DIFFICULTIES){const b=button(title(d),()=>{rewardDifficulty=d;achievements(back);});b.classList.toggle('selected',d===rewardDifficulty);b.setAttribute('aria-pressed',String(d===rewardDifficulty));tabs.append(b);}
   root.append(tabs,el('p','global-help global-reward-mode-help',rewardDifficulty==='hard'&&!unlocks(store.state).hard?'Hard unlocks after completing all 21 Standard stages without Unlimited Health.':`${title(rewardDifficulty)} trophies and passports · Your best results are kept.`),el('p','global-help global-scroll-help','Scroll down to see your achievements.'));
   for(const c of CONTINENTS){
    const group=el('section','global-reward-continent');group.append(el('h3','',layout.continents[c].label));
    const cards=el('div','global-reward-cards global-continent-rewards');
    for(const id of STAGES.filter(s=>s.startsWith(c))){
     const n=best(store.state,rewardDifficulty,id),b=button('',()=>detail(id,n,()=>achievements(back)));
     b.className='global-reward-card global-reward-stage';b.setAttribute('aria-label',`${stageLabel(id)} achievement. ${n===3?'Perfect':n?`Best: ${n} of 3 hearts`:'Not earned'}`);
     b.append(trophy(id,n),el('h4','',`Stage ${Number(id.slice(2))}`),el('p','',stageName(id)),hearts(n),el('p','',n===3?'Perfect':n?`Best: ${n}/3`:'Not earned'));cards.append(b);
    }
    const n=passport(store.state,rewardDifficulty,c),b=button('',()=>detail(c,n,()=>achievements(back)));
    b.className='global-reward-card global-reward-passport';b.append(stamp(c,n),el('h4','','Continent Passport'),el('p','',n===2?'Perfect':n?'Earned':'Not earned'));cards.append(b);
    group.append(cards);root.append(group);
   }
   const secret=el('section','global-reward-continent global-secret-rewards'),f=frame('Beneath the Ice'),unlocked=unlocks(store.state).secret,earned=store.state.secret?.earned===true;
   secret.append(el('h3','','Secret Level'));f.append(picture(earned?'PASS_SECRET_EARNED.png':unlocked?'PASS_SECRET_UNEARNED.png':'PASS_SECRET_LOCKED.png',earned?'Secret passport earned':unlocked?'Secret passport not earned':'Secret passport locked','global-secret-art'),el('p','',earned?'Secret passport earned.':unlocked?'Survive the three-minute encounter without assistance to earn this passport.':'Earn seven perfect Standard passports to unlock entry.'),el('p','',`${CONTINENTS.filter(x=>passport(store.state,'standard',x)===2).length}/7 perfect Standard passports`));
   secret.append(f);root.append(secret,el('p','global-help','Select a reward to see its requirements and progress.'));
  }
 function detail(id,n,back){show('detail');root.className='global-game global-menu';root.append(header(id.length===4?stageLabel(id):layout.continents[id].label,back));const f=frame(id.length===4?'Stage Trophy':'Continent Passport');f.append(id.length===4?trophy(id,n):stamp(id,n),el('p','',id.length===4?'Finish this stage without assistance. Remaining hearts set your best rating.':'Complete all three stages without assistance. Earn three hearts on every stage for a perfect passport.'),el('p','',id.length===4?`Best: ${n}/3`:n===2?'Perfect passport earned':n?'Passport earned':'Not earned'));root.append(f);}
 function openMenu(){show('menu');root.className='global-game global-menu';root.append(header('GAME MENU',returnRun));const f=frame();f.append(button('Back to Game',returnRun,true),button('Back to map',()=>confirm('Return to the map?','This unfinished stage will restart from the beginning. Your earned rewards are kept.',()=>{continent=(attempt?.stage==='SECRET01'?store.state.journey?.stage:attempt?.stage)?.slice(0,2)||'NA';map();},openMenu)),button('Restart Stage',()=>confirm('Restart stage?','Start this stage again with three hearts.',restartCurrent,openMenu)),button('Achievements',()=>achievements(openMenu)),button('Options',()=>options(openMenu)),saveButton(),button('Main Menu',()=>confirm('Leave this stage?','Continue will restart this unfinished stage. Your earned rewards are kept.',start,openMenu)));root.append(f);}
 function returnRun(){show('game');}
 function travelVisual(from,to,phone){
  const pin=root.querySelector('#global-map-pin'),ring=root.querySelector('#global-map-ring'),cross=from.slice(0,2)!==to.slice(0,2);let plane=null;
  if(cross){plane=sprite('MAP_TRAVEL_PLANE_ATLAS.png',0,0,2,1,'global-travel-plane');root.querySelector('.global-map-art').append(plane);}
  return (elapsed,reduced=false)=>{const state=travelState(layout,from,to,elapsed,reduced),p=travelPoint(layout,from,to,phone,state.progress);
   if(pin){pin.hidden=cross&&!state.arrived;positionMapPin(pin,layout,from,to,phone,state.progress);}
   if(ring){ring.hidden=!state.arrived;if(state.arrived){ring.style.left=p.x*100+'%';ring.style.top=p.y*100+'%';}}
   if(plane){plane.hidden=state.arrived;plane.style.left=p.x*100+'%';plane.style.top=p.y*100+'%';plane.style.transform=`translate(-50%,-50%) rotate(${p.heading}rad)`;plane.style.backgroundPosition=`${state.frame*100}% 0`;}
   return state;
  };
 }
 function travel(next){if(!worldReady)return waitWorld(()=>travel(next));const origin=store.state.journey.stage;map(false);screen='travel';travelTarget=next;root.inert=true;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,phone=(previewStore?Number(panel.dataset.previewWidth||960)<=900:matchMedia('(max-height:550px), (max-width:900px)').matches),render=travelVisual(origin,next,phone);
  const skip=button('Skip travel',finishTravel);skip.className+=' global-skip';root.after(skip);const done=()=>{skip.remove();root.inert=false;};
  function finishTravel(){if(!travelTarget)return;const id=travelTarget;travelTarget=null;done();enter(id);}
  let elapsed=0,last=null;render(0,reduced);
  function animate(now){if(travelTarget!==next){done();return;}if(last!==null&&!document.hidden)elapsed+=Math.min(100,now-last);last=now;const state=render(elapsed,reduced);if(state.done)finishTravel();else requestAnimationFrame(animate);}requestAnimationFrame(animate);
 }
 function renderResult(result,queueIndex=0){show('result');results.setAttribute('role','dialog');results.setAttribute('aria-modal','true');results.setAttribute('aria-label','Stage results');results.replaceChildren();if(result.secret){renderSecretResult(result);return;}const box=el('div','global-result-panel'),entry=queueIndex?result.queue[queueIndex-1]:null;audio.result(result,entry,{preview:!!previewStore});
  box.append(el('h2','',entry?entry.kind==='passport'?(entry.perfect?'PERFECT PASSPORT':'PASSPORT EARNED'):entry.kind==='world'?'WORLD COMPLETE':'SECRET LEVEL UNLOCKED':result.complete?'STAGE COMPLETE':'GAME OVER'));
  if(!entry){box.append(el('p','',`${stageLabel(result.stage)} · ${title(result.difficulty)}`));if(result.complete&&result.eligible){const row=el('div','global-result-reward');row.append(trophy(result.stage,result.best));const scores=el('div','');scores.append(el('h3','',result.hearts===3?'Perfect Stage Run!':result.best>result.before?'New Personal Best!':'Stage Complete!'),el('p','','This run'),hearts(result.hearts),el('p','',`Best: ${result.best}/3`));row.append(scores);box.append(row);}else box.append(el('p','',result.complete?'Assisted or practice completion · No new rewards or unlocks.':'Give it another go.'));
  }else if(entry.kind==='passport'){box.append(stamp(entry.continent,entry.perfect?2:1),el('p','',layout.continents[entry.continent].label));}
  else if(entry.kind==='world')box.append(el('p','',entry.hardUnlocked?'Hard and Level Select are now unlocked.':`${title(entry.difficulty)} journey complete.`));
  else box.append(el('p','','Seven perfect Standard passports earned. Beneath the Ice is now available from the main menu.'));
  const actions=el('nav','global-result-actions');
  const advance=(destination)=>{resultDestination??=destination;store.dismissNotice();if(queueIndex<result.queue.length){renderResult(result,queueIndex+1);return;}const go=resultDestination;resultDestination=null;go();};
  if(result.complete){const next=STAGES[STAGES.indexOf(result.stage)+1];actions.append(button(queueIndex<result.queue.length?'Continue':next?(result.stage.endsWith('03')?'Next Continent':'Next Stage'):'World Map',()=>advance(()=>next?travel(next):map()),true),button('Replay',()=>advance(()=>enter(result.stage))),button('Map',()=>advance(map)));}
  else actions.append(button('Retry',()=>{store.dismissNotice();enter(result.stage);},true),button('Map',()=>{store.dismissNotice();map();}),button('Main Menu',()=>{store.dismissNotice();start();}));
  box.append(actions);results.append(box);if(store.status==='error')saved();
 }
 function renderSecretResult(result){
  audio.result(result,null,{preview:!!previewStore});
  const box=el('div','global-result-panel global-secret-result-panel');box.append(el('h2','',result.complete?'SECRET COMPLETE':'GAME OVER'),el('p','','Beneath the Ice'));
  if(result.complete){box.append(picture(result.earned?'PASS_SECRET_EARNED.png':'PASS_SECRET_UNEARNED.png',result.earned?'Secret passport earned':'Secret passport not earned','global-secret-art'),el('p','',!result.eligible?'Rewards disabled while Unlimited Health is on':result.newlyEarned?'Secret passport earned!':'Secret passport already earned.'));}
  else box.append(el('p','','Give it another go.'));
  const actions=el('nav','global-result-actions');actions.append(button(result.complete?'Replay Secret Level':'Retry',()=>enterSecret(result.character),true),button('Main Menu',start));box.append(actions);results.append(box);if(store.status==='error')saved();
 }
 if(!previewStore&&typeof window!=='undefined'){
  attract=new AttractCycle({stageCount:STAGES.length,
   musicReady:elapsed=>{const e=audio.engine,t=e.track;if(!audio.settings.music||!e.ctx||e.ctx.state==='suspended'||(!t?.voice&&e.lastError))return elapsed>=20;return e.musicFinished?.('C_AND_C_TITLE')??(t?.id==='C_AND_C_TITLE'&&t.ended);},
   begin:async choice=>{const token=++entryToken;activeRun=null;attempt=null;shownOutcome=null;committedResult=null;loading=true;showLoading();
    try{await launch({stage:STAGES[choice.stageIndex].toLowerCase(),character:choice.character,difficulty:'standard',unlimited:true,demo:true});if(token!==entryToken||!opened)return;show('demo');}finally{if(token===entryToken)loading=false;}
   },end:error=>{entryToken++;loading=false;cancelDemo();start();if(error)tell('The idle demo could not start: '+error.message+'. You can still start or continue your game.');}
  });
  let suppressClickUntil=0;const wake=e=>{if(!opened)return;if((e.type==='click'||e.type==='keyup'||(e.type==='keydown'&&e.repeat))&&Date.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();return;}if(attract.input()){suppressClickUntil=Date.now()+700;e.preventDefault();e.stopImmediatePropagation();}};
  for(const type of ['pointerdown','click','keydown','keyup'])window.addEventListener(type,wake,true);
 }
 function attractTick(now){attractFrame=0;if(!opened)return;const dt=attractLast===null?0:Math.max(0,(now-attractLast)/1000);attractLast=now;void attract?.tick(dt,{onTitle:screen==='start'&&notice.hidden,visible:isVisible()});attractFrame=requestAnimationFrame(attractTick);}
 if(!previewStore&&typeof window!=='undefined')window.addEventListener('resize',()=>{if(screen==='map'&&root.getBoundingClientRect)root.style.setProperty('--map-available-height',`${Math.max(220,window.innerHeight-root.getBoundingClientRect().top-12)}px`);});
 document.addEventListener('visibilitychange',()=>{attractLast=null;root.classList.toggle('global-motion-hidden',document.hidden);});
 return {
  preview:previewStore?({state,kind,stage,character:who,difficulty:diff,result=null,queueIndex=0,travelProgress=0})=>{
   store.state=structuredClone(state);store.status='unsaved';store.blocked=false;
   character=who;difficulty=diff;rewardDifficulty=diff;continent=stage==='SECRET01'?'AN':stage.slice(0,2);page=CONTINENTS.indexOf(continent);
   attempt=null;activeRun=null;shownOutcome=null;committedResult=null;resultDestination=null;
   if(kind==='secret-play')return enterSecret(who);
   if(kind==='secret-capture'){show('game');return;}
   if(kind==='secret-passport'){page=7;achievements(start);return;}
   if(result){renderResult(result,queueIndex);return;}
   if(kind==='travel'||kind==='travel-plane'){map(false);const next=STAGES[Math.min(STAGES.length-1,STAGES.indexOf(stage)+1)];previewTravelDuration=travelState(layout,stage,next,0).total;previewTravel=travelVisual(stage,next,Number(panel.dataset.previewWidth||960)<=900);previewTravel(travelProgress*previewTravelDuration);}
   else if(kind==='map')map();else if(kind==='achievements')achievements(start);
   else if(kind==='secret'){page=7;achievements(start);}
   else if(['options','level-select-locked','level-select-unlocked'].includes(kind))options(start);else if(kind==='about'||kind==='hazard-guide'){guideStage=stage==='SECRET01'?'AN03':stage;about(start,kind==='hazard-guide'?'hazards':'game');}
   else if(kind==='menu')openMenu();
   else if(kind==='confirm')confirm('Restart stage?','Start this stage again with three hearts.',()=>enter(stage),openMenu);
   else if(kind==='save-error'){store.status='error';start();}
   else if(kind==='asset-error'){map();tell('An image could not load. Refresh to retry.');}
   else if(kind==='loading')showLoading();
   else start();
  }:undefined,
  setTravelProgress:previewStore?(value)=>previewTravel?.(Math.max(0,Math.min(1,value))*previewTravelDuration):undefined,
  travelDuration:()=>previewTravelDuration,
  audio,open(){opened=true;attract?.open();if(attract){cancelAnimationFrame(attractFrame);attractLast=null;attractFrame=requestAnimationFrame(attractTick);}audio.enable(true);audio.configure(store.state.settings);audio.unlock();start();},close(){opened=false;attract?.close();if(attract)cancelAnimationFrame(attractFrame);cancelDemo();audio.stop();entryToken++;loading=false;travelTarget=null;clearTimeout(travelTimer);root.hidden=true;results.hidden=true;notice.hidden=true;bar.hidden=true;demoHint.hidden=true;surface.hidden=false;},
  presenting:()=>screen==='game'||screen==='demo'||screen==='result',blocked:()=>screen!=='game',
  update(run){if(screen==='demo'){audio.update(run);return;}if(run===activeRun&&attempt)audio.update(run);if(run!==activeRun||!attempt||shownOutcome===attempt.id||!['complete','failed'].includes(run.status))return;
   committedResult??=(attempt.stage==='SECRET01'?store.finishSecret.bind(store):store.finish.bind(store))(attempt.id,{complete:run.status==='complete',hearts:run.lives});
   if(run.kind==='secret'&&!run.resultReady)return;
   if(run.kind!=='secret'&&run.status==='complete'&&run.celebrationTime<2*run.config.state.celebrate.frames/run.config.state.celebrate.fps)return;
   shownOutcome=attempt.id;renderResult(committedResult);
  },store
 };
}
