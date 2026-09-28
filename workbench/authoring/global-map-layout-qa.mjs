import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {createCanvas,loadImage,GlobalFonts}=createRequire(import.meta.url)('@napi-rs/canvas');
const base='dist/assets/global-ui/',layout=JSON.parse(fs.readFileSync(base+'map_layout.json'));
GlobalFonts.registerFromPath(base+'PressStart2P-Regular.ttf','CandCPixel');
const map=await loadImage(base+'MAP_WORLD_BASE.png'),atlas=await loadImage(base+'MAP_NODE_STATES_ATLAS.png');
for(const width of [1280,844,590]){const height=width*683/2048,canvas=createCanvas(width,Math.ceil(height)),ctx=canvas.getContext('2d');ctx.drawImage(map,0,0,width,height);ctx.font='8px CandCPixel';const labels=[];const conflicts=[];
 for(const [c,loc] of Object.entries(layout.continents)){const [x,y]=width<=900?loc.phone_label_center:loc.label_center,w=ctx.measureText(loc.label).width+36;labels.push({c,x:x*width-w/2,y:y*height-(width<=900?12:15),w,h:width<=900?24:30});}
 for(const l of labels){ctx.fillStyle='#041a34';ctx.fillRect(l.x,l.y,l.w,l.h);ctx.strokeStyle='#ffdc54';ctx.strokeRect(l.x,l.y,l.w,l.h);ctx.fillStyle='#fff2cd';ctx.fillText(layout.continents[l.c].label,l.x+18,l.y+19);}
 for(const [c,loc] of Object.entries(layout.continents))for(const [i,[x,y]] of (width<=900?loc.phone_stage_centers:loc.stage_centers).entries()){const size=width<=900?14:18;ctx.drawImage(atlas,0,0,48,48,x*width-size/2,y*height-size/2,size,size);
 const pin=width<=900?20:28,rect={x:x*width-(c==='AN'?pin+10:pin/2),y:y*height-(c==='AN'?pin/2:pin+8),w:pin,h:pin};for(const l of labels)if(rect.x<l.x+l.w&&rect.x+rect.w>l.x&&rect.y<l.y+l.h&&rect.y+rect.h>l.y)conflicts.push(c+(i+1)+' / '+l.c);}
 fs.writeFileSync('./map-layout-'+width+'.png',canvas.toBuffer('image/png'));assert.deepEqual(conflicts,[],width+' pin/label overlaps');console.log(width+' map geometry passed for all21 current pins.');
}
