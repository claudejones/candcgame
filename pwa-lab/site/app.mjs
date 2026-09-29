const $ = id => document.getElementById(id);
const PLAY_URL = $("play-now").href;
const OFFLINE_CACHE_PREFIX = "candc-pwa-release-";
const OFFLINE_MARKER_PREFIX = "candc-pwa-offline-ready-";
let releasePointer = null;
let releaseManifest = null;
let deferredInstallPrompt = null;
let downloadBusy = false;

function formatBytes(value) {
  const mib=value/(1024*1024);
  return mib>=1 ? mib.toFixed(1)+" MiB" : (value/1024).toFixed(0)+" KiB";
}
function standalone() {
  return matchMedia("(display-mode: standalone)").matches ||
    matchMedia("(display-mode: fullscreen)").matches || navigator.standalone===true;
}
function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);
}
function isSafariOnIOS() {
  return isIOS() && /Safari/i.test(navigator.userAgent) &&
    !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(navigator.userAgent);
}
function updateConnection() {
  const node=$("connection");
  node.textContent=navigator.onLine ? "Online" : "Offline";
  node.classList.toggle("offline",!navigator.onLine);
}
async function loadRelease() {
  const response=await fetch("./current-release.json",{cache:"no-store"});
  if(!response.ok) throw new Error("The current release information could not be loaded.");
  const pointer=await response.json();
  if(!pointer.releaseId || !pointer.manifestUrl || !pointer.playUrl) throw new Error("The release information is incomplete.");
  const manifestResponse=await fetch(pointer.manifestUrl,{cache:"no-store"});
  if(!manifestResponse.ok) throw new Error("The game download list could not be loaded.");
  const manifest=await manifestResponse.json();
  if(!Array.isArray(manifest.files) || !Number.isFinite(manifest.totalBytes)) throw new Error("The game download list is incomplete.");
  releasePointer=pointer;
  releaseManifest=manifest;
  $("play-now").href=pointer.playUrl;
  $("download-estimate").textContent="Estimated download: "+formatBytes(manifest.totalBytes)+
    " across "+manifest.files.length.toLocaleString()+" files.";
  const previouslyLaunched=localStorage.getItem("candc-pwa-last-played-release");
  if(previouslyLaunched && previouslyLaunched!==pointer.releaseId) {
    $("update-notice").hidden=false;
    $("update-notice").textContent="A new game release is ready. This page starts it from the title screen; any game already open keeps using its current version until you leave it.";
  }
  const ready=localStorage.getItem(OFFLINE_MARKER_PREFIX+pointer.releaseId)==="true";
  $("offline-status").textContent=ready
    ? "Offline ready: this complete game release is stored on this device."
    : "Not downloaded. The game will use its normal on-demand network loading when you press PLAY NOW.";
  $("remove-offline").hidden=!ready;
}
function showInstallGuidance() {
  $("install-card").hidden=true;
  $("ios-card").hidden=true;
  if(standalone()) return;
  if(isSafariOnIOS()) { $("ios-card").hidden=false; return; }
  if(/Android/i.test(navigator.userAgent)) {
    $("install-card").hidden=false;
    $("install-copy").textContent=deferredInstallPrompt
      ? "Install the game for a Home Screen icon and a standalone launch."
      : "Use your browser menu and choose Install app or Add to Home screen.";
  }
}
async function waitForController() {
  if(!("serviceWorker" in navigator)) return;
  await navigator.serviceWorker.ready;
  if(navigator.serviceWorker.controller) return;
  await Promise.race([
    new Promise(resolve=>navigator.serviceWorker.addEventListener("controllerchange",resolve,{once:true})),
    new Promise(resolve=>setTimeout(resolve,1200))
  ]);
}
$("play-now").addEventListener("click",async event=>{
  event.preventDefault();
  $("play-now").setAttribute("aria-busy","true");
  await waitForController();
  const playUrl=releasePointer?.playUrl||PLAY_URL;
  if(releasePointer) localStorage.setItem("candc-pwa-last-played-release",releasePointer.releaseId);
  location.assign(playUrl);
});
window.addEventListener("beforeinstallprompt",event=>{
  event.preventDefault(); deferredInstallPrompt=event; showInstallGuidance();
});
window.addEventListener("appinstalled",()=>{deferredInstallPrompt=null;showInstallGuidance();});
$("install-game").addEventListener("click",async()=>{
  if(!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt=null;
  showInstallGuidance();
});
async function cacheDownload() {
  if(downloadBusy||!releaseManifest||!releasePointer) return;
  if(!("caches" in window)||!("serviceWorker" in navigator)) {
    $("offline-status").textContent="Offline storage is not supported by this browser."; return;
  }
  if(!navigator.onLine) { $("offline-status").textContent="Connect to the internet before downloading the complete game."; return; }
  downloadBusy=true;
  const button=$("download-offline");
  button.disabled=true;
  $("download-progress").hidden=false;
  $("progress").value=0;
  let completed=0,completedBytes=0;
  const totalBytes=releaseManifest.totalBytes;
  function updateProgress() {
    const percent=totalBytes?Math.min(100,completedBytes/totalBytes*100):100;
    $("progress").value=percent;
    $("progress-copy").textContent=percent.toFixed(1)+"% · "+formatBytes(Math.min(completedBytes,totalBytes))+
      " of "+formatBytes(totalBytes)+" · "+completed.toLocaleString()+
      " of "+releaseManifest.files.length.toLocaleString()+" files";
  }
  try {
    const estimate=await navigator.storage?.estimate?.();
    if(estimate&&Number.isFinite(estimate.quota)) {
      const free=estimate.quota-estimate.usage;
      if(free<totalBytes*1.05) {
        $("offline-status").textContent="This browser reports limited free storage. Free space, then try again; the source game files are unchanged.";
        return;
      }
    }
    await navigator.storage?.persist?.();
    const cache=await caches.open(OFFLINE_CACHE_PREFIX+releasePointer.releaseId);
    for(const file of releaseManifest.files) {
      const url=new URL(file.url,location.href).href;
      const request=new Request(url,{method:"GET"});
      const found=await cache.match(request);
      if(found) completedBytes+=file.bytes;
      else {
        const response=await fetch(request);
        if(!response.ok) throw new Error("Download failed for "+file.url);
        const writing=cache.put(request,response.clone());
        if(response.body) {
          const reader=response.body.getReader();
          for(;;) {
            const part=await reader.read();
            if(part.done) break;
            completedBytes+=part.value.byteLength;
            updateProgress();
          }
        } else completedBytes+=file.bytes;
        await writing;
      }
      completed++;
      updateProgress();
    }
    localStorage.setItem(OFFLINE_MARKER_PREFIX+releasePointer.releaseId,"true");
    $("offline-status").textContent="Offline ready. The complete game and this release’s artwork and audio are stored on this device.";
    $("remove-offline").hidden=false;
  } catch(error) {
    $("offline-status").textContent="Download paused at "+completed.toLocaleString()+" of "+
      releaseManifest.files.length.toLocaleString()+" files. "+(error?.message||"Check the connection and retry.");
  } finally {
    downloadBusy=false;
    button.disabled=false;
    $("download-progress").hidden=false;
  }
}
$("download-offline").addEventListener("click",cacheDownload);
$("remove-offline").addEventListener("click",async()=>{
  if(!releasePointer) return;
  await caches.delete(OFFLINE_CACHE_PREFIX+releasePointer.releaseId);
  localStorage.removeItem(OFFLINE_MARKER_PREFIX+releasePointer.releaseId);
  $("offline-status").textContent="The offline copy was removed. Your game progress and settings are kept separately.";
  $("remove-offline").hidden=true;
});
addEventListener("online",updateConnection);
addEventListener("offline",updateConnection);
updateConnection();
showInstallGuidance();
if("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(error=>{
    $("offline-status").textContent="The game still plays online, but offline support could not start: "+error.message;
  });
}
loadRelease().catch(error=>{
  $("download-estimate").textContent="Size estimate is unavailable while release information cannot be reached.";
  $("offline-status").textContent=error.message+" You can retry when you are online.";
});
