import {encounterProgress} from './encounter-pacing.mjs';
const CONTINENTS={na:'NORTH AMERICA',sa:'SOUTH AMERICA',eu:'EUROPE',af:'AFRICA',as:'ASIA',oc:'OCEANIA',an:'ANTARCTICA'};
export function paintGameHud(hud,run,images){
 hud.classList.toggle('secret-hud',run.kind==='secret');
 const progress=encounterProgress(run),health=hud.querySelector('.life-hud');
 health.setAttribute('aria-label',`${run.lives} lives remaining`);
 health.querySelectorAll('.life-heart').forEach((heart,i)=>{heart.classList.toggle('full',i<run.lives);heart.classList.toggle('empty',i>=run.lives);heart.classList.toggle('active',i===run.lives-1);heart.style.setProperty('--pulse-speed',({3:'1.35s',2:'.90s',1:'.58s'})[run.lives]||'1.35s');});
 if(run.kind==='secret')paintSecretStatus(hud,run);
 hud.querySelector('.stage-title').textContent=run.kind==='secret'?'Beneath the Ice':`${CONTINENTS[run.stage.slice(0,2)]} • STAGE ${Number(run.stage.slice(2))}`;
 hud.querySelector('.progress-track').setAttribute('aria-valuetext',`Difficulty section ${Math.min(5,Math.floor(progress*5)+1)} of 5`);
 hud.querySelector('.progress-track').setAttribute('aria-valuenow',String(Math.round(progress*100)));
 const marker=hud.querySelector('.progress-marker');marker.style.left=`${(88+Math.max(0,Math.min(1,progress))*1840)/2048*100}%`;marker.classList.toggle('claude',run.who==='claude');marker.classList.toggle('constance',run.who==='constance');
 if(images){hud.style.setProperty('--heart-sprite',`url("${images.hudHearts.src}")`);hud.style.setProperty('--character-sprite',`url("${images.hudCharacters.src}")`);hud.querySelector('.progress-path').src=images.hudPath.src;}
}
function paintSecretStatus(hud,run){
 let status=hud.querySelector('.secret-status');
 if(!status){status=document.createElement('div');status.className='secret-status';const timer=document.createElement('span');timer.className='secret-timer';timer.setAttribute('aria-label','Time remaining');const shields=document.createElement('span');shields.className='secret-shields';shields.setAttribute('aria-label','Containment shields');for(let i=0;i<3;i++){const s=document.createElement('span');s.className='secret-shield';shields.append(s);}status.append(timer,shields);hud.querySelector('.hud-panel').append(status);}
 const seconds=Math.max(0,Math.ceil(run.duration-run.time));status.querySelector('.secret-timer').textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
 const shields=status.querySelector('.secret-shields');shields.setAttribute('aria-label',`${run.shields} containment shields remaining`);
 shields.querySelectorAll('.secret-shield').forEach((s,i)=>{const age=run.status==='complete'?run.captureTime:run.time-(run.pulses.at(-1)??-100);const frame=i<run.shields?0:i===run.shields&&age<.2?age<.08?1:2:3;s.style.backgroundPosition=`${frame/3*100}% 0`;s.classList.toggle('breaking',i===run.shields&&age<.2);s.style.setProperty('--break-frame',`${Math.min(3,Math.floor(age/.05))/3*100}%`);});
}
