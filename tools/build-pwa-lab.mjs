#!/usr/bin/env node
import {createHash} from "node:crypto";
import {createReadStream} from "node:fs";
import {cp,copyFile,mkdir,readFile,readdir,rm,stat,writeFile} from "node:fs/promises";
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import os from "node:os";
import path from "node:path";
const execFileAsync=promisify(execFile);
const repo=process.cwd();
const sourceGame=path.join(repo,"mobile-game");
const sourceSite=path.join(repo,"pwa-lab","site");
const output=path.resolve(process.argv[2]||path.join(os.tmpdir(),"candc-pwa-lab-build"));
if(output===repo||output.startsWith(repo+path.sep)) throw new Error("Build output must be outside the repository.");
const workers=Math.max(1,Math.min(Number(process.env.PWA_BENCH_WORKERS||4),os.cpus().length));
async function listFiles(root) {
 const result=[];
 async function walk(dir) {
  for(const entry of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
   const full=path.join(dir,entry.name);
   if(entry.isDirectory()) await walk(full); else if(entry.isFile()) result.push(full);
  }
 }
 await walk(root); return result;
}
async function sha256(file) {
 const hash=createHash("sha256");
 for await(const chunk of createReadStream(file)) hash.update(chunk);
 return hash.digest("hex");
}
async function parallel(items,task) {
 let next=0;
 await Promise.all(Array.from({length:workers},async()=>{
  for(;;){const i=next++;if(i>=items.length)return;await task(items[i]);}
 }));
}
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
await cp(sourceSite,output,{recursive:true});
const sourceFiles=await listFiles(sourceGame);
const identity=createHash("sha256"),sourceInfo=[];
for(const file of sourceFiles) {
 const rel=path.relative(sourceGame,file).split(path.sep).join("/");
 const digest=await sha256(file),bytes=(await stat(file)).size;
 identity.update(rel+"\0"+bytes+"\0"+digest+"\n");
 sourceInfo.push({file,rel,digest,bytes});
}
const releaseId="v"+identity.digest("hex").slice(0,16);
const gameRoot=path.join(output,"releases",releaseId,"game");
await mkdir(gameRoot,{recursive:true});
const outputFiles=[];
let originalPngBytes=0,webpBytes=0;
await parallel(sourceInfo,async item=>{
 const isPng=/\.png$/i.test(item.rel);
 const outputRel=isPng?item.rel.replace(/\.png$/i,".webp"):item.rel;
 const dest=path.join(gameRoot,...outputRel.split("/"));
 await mkdir(path.dirname(dest),{recursive:true});
 if(isPng) {
  originalPngBytes+=item.bytes;
  await execFileAsync("cwebp",["-quiet","-lossless","-z","6","-mt","-exact","-metadata","all",item.file,"-o",dest]);
  const bytes=(await stat(dest)).size;
  webpBytes+=bytes;
  outputFiles.push({rel:outputRel,dest,bytes});
 } else {
  await copyFile(item.file,dest);
  outputFiles.push({rel:outputRel,dest,bytes:item.bytes});
 }
});
outputFiles.sort((a,b)=>a.rel.localeCompare(b.rel));
const releaseFiles=[];
for(const file of outputFiles) {
 const physical="./releases/"+releaseId+"/game/"+file.rel;
 releaseFiles.push({url:physical,bytes:file.bytes,sha256:await sha256(file.dest)});
}
const totalBytes=releaseFiles.reduce((sum,item)=>sum+item.bytes,0);
const manifest={releaseId,assetFormat:"lossless-webp-exact",totalBytes,fileCount:releaseFiles.length,files:releaseFiles};
const manifestPath="./releases/"+releaseId+"/offline-manifest.json";
await writeFile(path.join(output,manifestPath.slice(2)),JSON.stringify(manifest,null,2)+"\n");
const pointer={releaseId,manifestUrl:manifestPath,playUrl:"./releases/"+releaseId+"/game/play/",totalBytes,fileCount:releaseFiles.length};
await writeFile(path.join(output,"current-release.json"),JSON.stringify(pointer,null,2)+"\n");
const indexPath=path.join(output,"index.html");
const index=(await readFile(indexPath,"utf8")).replace("__PLAY_URL__",pointer.playUrl);
if(index.includes("__PLAY_URL__")) throw new Error("Play URL placeholder was not replaced.");
await writeFile(indexPath,index);
const assets=path.join(sourceGame,"assets","global-ui"),icons=path.join(output,"icons");
await mkdir(icons,{recursive:true});
await copyFile(path.join(assets,"BRAND_PWA_ICON_192.png"),path.join(icons,"icon-192.png"));
await copyFile(path.join(assets,"BRAND_PWA_ICON_512.png"),path.join(icons,"icon-512.png"));
await copyFile(path.join(assets,"BRAND_APPLE_TOUCH_ICON.png"),path.join(icons,"apple-touch-icon.png"));
const report={releaseId,assetFormat:manifest.assetFormat,sourceFileCount:sourceFiles.length,offlineFileCount:releaseFiles.length,
 sourcePngBytes:originalPngBytes,releaseWebpBytes:webpBytes,completeOfflineBytes:totalBytes,
 completeOfflineMiB:+(totalBytes/1048576).toFixed(2),output};
await writeFile(path.join(output,"build-report.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report,null,2));
