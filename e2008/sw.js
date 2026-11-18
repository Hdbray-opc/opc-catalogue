/* Carnet d'entretien E-2008: keeps the app on the phone so it opens without network.
   The entries themselves are in the browser's storage (localStorage), not here.
   Fonts are shared with the Insignia log (../entretien/fonts). */
var CACHE='e2008-entretien-1.1.0';
var FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png',
  '../entretien/fonts/Archivo-400.woff2','../entretien/fonts/Archivo-600.woff2','../entretien/fonts/ArchivoNarrow-700.woff2'];
self.addEventListener('install',function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES.map(function(f){return new Request(f,{cache:'no-cache'})}))}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k.indexOf('e2008-entretien-')===0&&k!==CACHE}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});
// network first (so updates arrive), cached copy when offline
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(function(r){
    if(r.ok){var copy=r.clone();caches.open(CACHE).then(function(c){c.put(e.request,copy)})}
    return r;
  }).catch(function(){
    return caches.match(e.request,{ignoreSearch:true}).then(function(hit){return hit||(e.request.mode==='navigate'?caches.match('index.html'):Response.error())});
  }));
});
