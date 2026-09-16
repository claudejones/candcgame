const ROOT='../../assets-original/current-generated/';
const stages={
 NA01:{name:'NA01 Desert',base:'NA-assets/',far:'NA01_BG_DISTANT_MESAS.png',mid:'NA01_BG_MID_DESERT.png',ground:'NA01_GROUND_DESERT.png'},
 NA02:{name:'NA02 Pines / Stream',base:'NA-assets/',far:'NA02_BG_DISTANT_MOUNTAINS.png',mid:'NA02_BG_MID_PINES.png',ground:'NA02_GROUND_TRAIL.png'},
 NA03:{name:'NA03 City',base:'NA-assets/',far:'NA03_BG_DISTANT_NYC.png',mid:'NA03_BG_MID_CITY.png',ground:'NA03_GROUND_CITY.png'},
 SA01:{name:'SA01 Amazon',base:'SA-assets/',far:'SA01_BG_DISTANT_AMAZON.png',mid:'SA01_BG_MID_AMAZON.png',ground:'SA01_GROUND_AMAZON.png'},
 SA02:{name:'SA02 Andes',base:'SA-assets/',far:'SA02_BG_DISTANT_ANDES.png',mid:'SA02_BG_MID_ANDES.png',ground:'SA02_GROUND_ANDES.png'},
 SA03:{name:'SA03 Rio',base:'SA-assets/',far:'SA03_BG_DISTANT_RIO.png',mid:'SA03_BG_MID_RIO.png',ground:'SA03_GROUND_RIO.png'},
 EU01:{name:'EU01 Greece',base:'EU-assets/',far:'EU01_BG_DISTANT_GREECE.png',mid:'EU01_BG_MID_GREECE.png',ground:'EU01_GROUND_GREECE.png'},
 EU02:{name:'EU02 Paris',base:'EU-assets/',far:'EU02_BG_DISTANT_PARIS.png',mid:'EU02_BG_MID_PARIS.png',ground:'EU02_GROUND_PARIS.png'},
 EU03:{name:'EU03 Barcelona',base:'EU-assets/',far:'EU03_BG_DISTANT_BARCELONA.png',mid:'EU03_BG_MID_BARCELONA.png',ground:'EU03_GROUND_BARCELONA.png'}
};
const W=480,H=270,BASELINE=205,MID_BASE_SOURCE_Y=621,GROUND_SURFACE_SOURCE_Y=393;
const $=id=>document.getElementById(id),world=$('world'),overlay=$('overlay'),ctx=world.getContext('2d'),ox=overlay.getContext('2d');
ctx.imageSmoothingEnabled=false;ox.imageSmoothingEnabled=false;
const cache=new Map();
function load(src){if(cache.has(src))return cache.get(src);const p=new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error(src));i.src=src});cache.set(src,p);return p}
function src(s,f){return ROOT+s.base+s[f]}
function fitWidth(img){const scale=W/img.width;return {scale,w:W,h:img.height*scale}}
function drawAt(img,y){const b=fitWidth(img);ctx.drawImage(img,0,y,b.w,b.h);return {x:0,y,...b}}
function anchoredY(img,sourceY,targetY,offset=0){return targetY-sourceY*(W/img.width)+offset}
async function render(){const key=$('stage').value,s=stages[key];ctx.clearRect(0,0,W,H);ox.clearRect(0,0,W,H);$('readout').textContent='Loading '+s.name+'…';
 try{const [far,mid,ground]=await Promise.all([load(src(s,'far')),load(src(s,'mid')),load(src(s,'ground'))]);let boxes=[];
 const farY=+$('farY').value;
 const midY=anchoredY(mid,MID_BASE_SOURCE_Y,BASELINE,+$('midY').value);
 const groundY=anchoredY(ground,GROUND_SURFACE_SOURCE_Y,+$('groundY').value,0);
 if($('farOn').checked)boxes.push(['FAR',drawAt(far,farY)]);
 if($('midOn').checked)boxes.push(['MID',drawAt(mid,midY)]);
 if($('groundOn').checked)boxes.push(['GROUND',drawAt(ground,groundY)]);
 if($('guides').checked){ox.save();ox.strokeStyle='#ff3b30';ox.lineWidth=1;ox.beginPath();ox.moveTo(0,BASELINE+.5);ox.lineTo(W,BASELINE+.5);ox.stroke();ox.fillStyle='#ff3b30';ox.font='8px monospace';ox.fillText('GROUND_BASELINE_Y=205',4,BASELINE-3);ox.restore()}
 if($('overscan').checked){const colors=['#00e5ff','#ff4df0','#ffe66d'];boxes.forEach(([n,b],i)=>{ox.save();ox.strokeStyle=colors[i];ox.setLineDash([4,3]);ox.strokeRect(b.x+.5,b.y+.5,b.w-1,b.h-1);ox.fillStyle=colors[i];ox.font='8px monospace';ox.fillText(n,4,10+i*10);ox.restore()})}
 const dims=`FAR ${far.width}×${far.height} | MID ${mid.width}×${mid.height} | GROUND ${ground.width}×${ground.height}`;
 const placements=boxes.map(([n,b])=>`${n}: drawY=${b.y.toFixed(1)} renderedH=${b.h.toFixed(1)} scale=${b.scale.toFixed(4)}`).join('\n');
 $('readout').textContent=`${key} — ${s.name}\n${dims}\n${placements}\n\nReconciliation anchors: MID sourceY 621 → logical Y205; GROUND sourceY 393 → selected logical surface Y (${$('groundY').value}). FAR begins at selected Y.\nRED = canonical player ground baseline. Checkerboard visible inside frame = no authored layer covers that pixel.`;
 }catch(e){$('readout').innerHTML=`<span class="warn">Asset load failed: ${e.message}. Serve the repository through a web/local server; do not open this HTML as an isolated download.</span>`}}
Object.entries(stages).forEach(([k,s])=>{const o=document.createElement('option');o.value=k;o.textContent=s.name;$('stage').appendChild(o)});
['stage','farY','midY','groundY','farOn','midOn','groundOn','guides','overscan'].forEach(id=>$(id).addEventListener('input',render));
$('reset').onclick=()=>{$('farY').value=0;$('midY').value=0;$('groundY').value=205;$('farOn').checked=$('midOn').checked=$('groundOn').checked=$('guides').checked=true;$('overscan').checked=false;render()};
render();
