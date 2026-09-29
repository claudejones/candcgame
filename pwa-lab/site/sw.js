const SHELL_CACHE="candc-pwa-shell-v1";
const SHELL_FILES=["./","./index.html","./styles.css","./app.mjs","./manifest.webmanifest","./current-release.json",
  "./icons/icon-192.png","./icons/icon-512.png","./icons/apple-touch-icon.png"];
const RELEASE_CACHE_PREFIX="candc-pwa-release-";
self.addEventListener("install",event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(SHELL_CACHE);
    await cache.addAll(SHELL_FILES.map(file=>new URL(file,self.registration.scope).href));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    for(const name of await caches.keys())
      if(name.startsWith("candc-pwa-shell-")&&name!==SHELL_CACHE) await caches.delete(name);
    await self.clients.claim();
  })());
});
function route(request) {
  const logical=new URL(request.url), physical=new URL(request.url);
  const inGameAssets=/\/releases\/[^/]+\/game\/assets\//.test(physical.pathname);
  if(inGameAssets&&/\.png$/i.test(physical.pathname)) {
    physical.pathname=physical.pathname.replace(/\.png$/i,".webp");
    physical.search="";
  }
  const release=logical.pathname.match(/\/releases\/([^/]+)\//);
  return {logical,physical,isRelease:!!release,releaseId:release?.[1]};
}
self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET"||new URL(request.url).origin!==location.origin) return;
  const {logical,physical,isRelease,releaseId}=route(request);
  const key=new Request(physical.href,{method:"GET"});
  if(isRelease) {
    event.respondWith((async()=>{
      const cached=await caches.match(key);
      if(cached) return cached;
      try {
        const response=await fetch(new Request(physical.href,request));
        if(response.ok&&releaseId) {
          const cache=await caches.open(RELEASE_CACHE_PREFIX+releaseId);
          await cache.put(key,response.clone());
        }
        return response;
      } catch {
        return new Response("This game file is not available offline yet.",{status:503,statusText:"Offline"});
      }
    })());
    return;
  }
  if(request.mode==="navigate"||logical.pathname.endsWith("/current-release.json")) {
    event.respondWith((async()=>{
      const cacheKey=new Request(request.url,{method:"GET"});
      const cached=await caches.match(cacheKey);
      try {
        const response=await fetch(request);
        if(response.ok) {
          const shell=await caches.open(SHELL_CACHE);
          await shell.put(cacheKey,response.clone());
        }
        return response;
      } catch { return cached||new Response("Reconnect to load the game launch page.",{status:503}); }
    })());
  }
});
