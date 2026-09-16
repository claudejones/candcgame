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
const W=480,H=270,BASELINE=205;
const $=id=>document.getElementById(id),world=$('world'),overlay=$('overlay'),ctx=world.getContext('2d'),ox=overlay.getContext('2d');
ctx.imageSmoothingEnabled=false;ox.imageSmoothingEnabled=false;
const cache=new Map();
function load(src){if(cache.has(src))return cache.get(src);const p=new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error(src));i.src=src});cache.set(src,p);return p}
function src(s,f){return ROOT+s.base+s[f]}
function placement(img,y,mult){const widthFit=W/img.width;const scale=widthFit*mult;return{x:0,y,w:img.width*scale,h:img.height*scale,scale,widthFit,mult}}
function drawLayer(img,y,mult){const b=placement(img,y,mult);ctx.drawImage(img,b.x,b.y,b.w,b.h);return b}
function coverageText(n,b,img){const bottom=b.y+b.h;const baselineSource=(BASELINE-b.y)/b.scale;return `${n}: drawY=${b.y.toFixed(1)} scale×=${b.mult.toFixed(2)} rendered=${b.w.toFixed(1)}×${b.h.toFixed(1)} bottom=${bottom.toFixed(1)} | logical Y205 maps to sourceY=${baselineSource.toFixed(1)} / ${img.height}`}
async function render(){const key=$('stage').value,s=stages[key];ctx.clearRect(0,0,W,H);ox.clearRect(0,0,W,H);$('readout').textContent='Loading '+s.name+'…';
 try{const [far,mid,ground]=await Promise.all([load(src(s,'far')),load(src(s,'mid')),load(src(s,'ground'))]);let boxes=[];
 $('groundSourceY').max=ground.height-1;
 const farY=+$('farY').value,farScale=+$('farScale').value,midY=+$('midY').value,midScale=+$('midScale').value,groundScale=+$('groundScale').value;
 let groundSourceY=Math.max(0,Math.min(ground.height-1,+$('groundSourceY').value||0));$('groundSourceY').value=groundSourceY;
 const groundPixelScale=(W/ground.width)*groundScale;
 const groundY=BASELINE-groundSourceY*groundPixelScale;$('groundY').value=groundY.toFixed(1);
 const fb=placement(far,farY,farScale),mb=placement(mid,midY,midScale),gb=placement(ground,groundY,groundScale);
 if($('farOn').checked){drawLayer(far,farY,farScale);boxes.push(['FAR',fb])}
 if($('midOn').checked){drawLayer(mid,midY,midScale);boxes.push(['MID',mb])}
 if($('groundOn').checked){drawLayer(ground,groundY,groundScale);boxes.push(['GROUND',gb])}
 if($('guides').checked){ox.save();ox.strokeStyle='#ff3b30';ox.lineWidth=1;ox.beginPath();ox.moveTo(0,BASELINE+.5);ox.lineTo(W,BASELINE+.5);ox.stroke();ox.fillStyle='#ff3b30';ox.font='8px monospace';ox.fillText('GROUND_BASELINE_Y=205',4,BASELINE-3);ox.restore()}
 if($('overscan').checked){const colors={FAR:'#00e5ff',MID:'#ff4df0',GROUND:'#ffe66d'};boxes.forEach(([n,b])=>{ox.save();ox.strokeStyle=colors[n];ox.setLineDash([4,3]);ox.strokeRect(b.x+.5,b.y+.5,b.w-1,b.h-1);ox.fillStyle=colors[n];ox.font='8px monospace';ox.fillText(n,4,10+['FAR','MID','GROUND'].indexOf(n)*10);ox.restore()})}
 const dims=`SOURCE: FAR ${far.width}×${far.height} | MID ${mid.width}×${mid.height} | GROUND ${ground.width}×${ground.height}`;
 const placements=[coverageText('FAR',fb,far),coverageText('MID',mb,mid),coverageText('GROUND',gb,ground)].join('\n');
 const bottomNeed=Math.max(0,H-(gb.y+gb.h));const bottomOver=Math.max(0,(gb.y+gb.h)-H);
 $('readout').textContent=`${key} — ${s.name}\n${dims}\n${placements}\n\nGROUND SOURCE SURFACE: sourceY=${groundSourceY} is locked to logical Y=${BASELINE}; calculated drawY=${groundY.toFixed(1)}.\nGROUND bottom: ${(gb.y+gb.h).toFixed(1)} | shortfall=${bottomNeed.toFixed(1)} logical px | overscan=${bottomOver.toFixed(1)} logical px.\nRED = canonical player baseline Y205. Change Ground Source Surface Y to identify the authored running surface; Draw Y is calculated automatically. Scale× 1.00 means fit source width to 480. Diagnostic only — no source PNG or production config is modified.`;
 }catch(e){$('readout').innerHTML=`<span class="warn">Asset load failed: ${e.message}. Serve the repository through GitHub Pages or a web/local server.</span>`}}
Object.entries(stages).forEach(([k,s])=>{const o=document.createElement('option');o.value=k;o.textContent=s.name;$('stage').appendChild(o)});
const ids=['stage','farY','farScale','midY','midScale','groundSourceY','groundScale','farOn','midOn','groundOn','guides','overscan'];ids.forEach(id=>$(id).addEventListener('input',render));
function reset(){['farY','midY'].forEach(id=>$(id).value=0);['farScale','midScale','groundScale'].forEach(id=>$(id).value=1);$('groundSourceY').value=0;$('farOn').checked=$('midOn').checked=$('groundOn').checked=$('guides').checked=true;$('overscan').checked=false;render()}
$('reset').onclick=reset;
render();
