// Real runtime canvas at real-time playback. This is not a browser/DOM recording.
import fs from 'node:fs';import {spawn} from 'node:child_process';import {once} from 'node:events';import {createRequire} from 'node:module';
import {make,manifest,items,catalog} from './secret-fixture.mjs';
import {drawSecret,electricalState} from '../dist/workbench-next/secret-renderer.mjs';
const {createCanvas,loadImage}=createRequire(import.meta.url)('@napi-rs/canvas');
const images=Object.fromEntries(await Promise.all([...Object.keys(manifest.assets).map(n=>['secret:'+n,'dist/assets/secret-level/'+n]),...[...new Set([...items.filter(i=>i.type==='character').map(i=>i.asset),'stars'])].map(k=>[k,'dist/workbench-next/'+catalog.assets[k]])].map(async([k,p])=>[k,await loadImage(p.split('?')[0])])));
const path=process.argv[2]||'./Boss_Electrical_V2_Runtime_Review.mp4';
const encoder=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate','30','-vcodec','png','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',path],{stdio:['pipe','inherit','inherit']});
const raw=createCanvas(960,540),out=createCanvas(960,596),ctx=out.getContext('2d');
for(const [who,seek,seconds] of [['claude',57.5,8],['constance',117.5,8],['claude',178,8],['constance',178,8]]){
 const r=make(who);r.unlimitedLives=true;r.start();r.previewPhase(seek);
 for(let i=0;i<seconds*30;i++){
  drawSecret(raw,r,images);ctx.drawImage(raw,0,0);ctx.fillStyle='#071d32';ctx.fillRect(0,540,960,56);ctx.fillStyle='#fff2cd';ctx.font='18px monospace';
  const s=electricalState(r),state=r.status==='complete'?(r.resultReady?'RESULT PANEL NOW PERMITTED':r.motion.state==='celebrate'?'CELEBRATION':'FINAL CAPTURE'):r.milestone?.state?.toUpperCase()||(s.emitter?'CHARGING':'RUNNING');
  ctx.fillText(`${who.toUpperCase()}  |  ${r.time.toFixed(2)}s  |  Shields: ${r.shields}  |  ${state}`,16,562);
  ctx.font='13px monospace';ctx.fillText('Actual game canvas · 1× playback · HUD/menu DOM excluded from this animation review',16,584);
  if(i===120&&seek===57.5)fs.writeFileSync('./v2-runtime-stun.png',out.toBuffer('image/png'));
  if(!encoder.stdin.write(out.toBuffer('image/png')))await once(encoder.stdin,'drain');
  r.advance(1/30);
 }
}
encoder.stdin.end();const [code]=await once(encoder,'close');if(code)throw Error('Video encoding failed');console.log(path);
