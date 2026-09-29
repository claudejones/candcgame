#!/usr/bin/env node
import {createReadStream} from "node:fs";
import {createHash} from "node:crypto";
import {readFile,readdir,stat,mkdtemp,rm} from "node:fs/promises";
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import os from "node:os";
import path from "node:path";
const execFileAsync=promisify(execFile);
const repo=process.cwd(),output=path.resolve(process.argv[2]||"");
if(!output.startsWith(os.tmpdir()+path.sep)) throw new Error("Pass a build output path under the runner temp directory.");
const pointer=JSON.parse(await readFile(path.join(output,"current-release.json"),"utf8"));
const manifest=JSON.parse(await readFile(path.join(output,pointer.manifestUrl.slice(2)),"utf8"));
const sourceGame=path.join(repo,"mobile-game"),files=[];
async function walk(dir) {
 for(const entry of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
  const full=path.join(dir,entry.name);
  if(entry.isDirectory()) await walk(full); else if(entry.isFile()) files.push(full);
 }
}
async function sha256(file) {
 const hash=createHash("sha256");for await(const chunk of createReadStream(file))hash.update(chunk);return hash.digest("hex");
}
await walk(sourceGame);
if(files.length!==manifest.fileCount) throw new Error("Offline manifest count differs from the source tree.");
const byRel=new Map(manifest.files.map(item=>[item.url.replace("./releases/"+pointer.releaseId+"/game/",""),item]));
const scratch=await mkdtemp(path.join(os.tmpdir(),"candc-pwa-verify-"));
let webpCount=0,verifiedBytes=0;
try {
 for(const source of files) {
  const rel=path.relative(sourceGame,source).split(path.sep).join("/");
  const isPng=/\.png$/i.test(rel),physicalRel=isPng?rel.replace(/\.png$/i,".webp"):rel;
  const item=byRel.get(physicalRel);
  if(!item) throw new Error("Missing release file for "+rel);
  const dest=path.join(output,"releases",pointer.releaseId,"game",...physicalRel.split("/"));
  const info=await stat(dest),digest=await sha256(dest);
  if(info.size!==item.bytes||digest!==item.sha256) throw new Error("Hash/size mismatch: "+physicalRel);
  if(isPng) {
   webpCount++;
   const originalSize=(await execFileAsync("identify",["-format","%w %h",source])).stdout;
   const webpSize=(await execFileAsync("identify",["-format","%w %h",dest])).stdout;
   if(originalSize!==webpSize) throw new Error("Image dimensions changed: "+rel);
   const tmpSource=path.join(scratch,webpCount+"-source.rgba"),tmpWebp=path.join(scratch,webpCount+"-webp.rgba");
   await execFileAsync("convert",[source,"-alpha","on","-depth","8","RGBA:"+tmpSource]);
   await execFileAsync("convert",[dest,"-alpha","on","-depth","8","RGBA:"+tmpWebp]);
   const [a,b]=await Promise.all([readFile(tmpSource),readFile(tmpWebp)]);
   if(!a.equals(b)) throw new Error("Decoded RGBA pixels differ: "+rel);
  } else if(await sha256(source)!==digest) throw new Error("Non-image runtime file changed: "+rel);
  verifiedBytes+=info.size;
 }
 const releaseRoot=path.join(output,"releases",pointer.releaseId,"game","play");
 const playerState=await readFile(path.join(releaseRoot,"player-state.mjs"),"utf8");
 const main=await readFile(path.join(releaseRoot,"mobile-main.mjs"),"utf8");
 if(!playerState.includes("PLAYER_KEY='candc.player.v1'")||!main.includes("'candc.mobile-test.'+key"))
  throw new Error("The existing player save key or namespace changed.");
 if(verifiedBytes!==manifest.totalBytes) throw new Error("Offline byte total mismatch.");
 const report=JSON.parse(await readFile(path.join(output,"build-report.json"),"utf8"));
 console.log(JSON.stringify({releaseId:pointer.releaseId,files:manifest.fileCount,webpImagesVerified:webpCount,
  dimensionsChanged:0,decodedPixelMismatches:0,bytes:verifiedBytes,completeOfflineMiB:report.completeOfflineMiB,
  playerSaveKey:"candc.mobile-test.candc.player.v1"},null,2));
} finally { await rm(scratch,{recursive:true,force:true}); }
