/* Carnet d'entretien: keeps the app on the phone so it opens without network.
   The entries themselves are in the browser's storage (localStorage), not here. */
var CACHE='opc-entretien-1.2.0';
var FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png',
  'fonts/Archivo-400.woff2','fonts/Archivo-600.woff2','fonts/ArchivoNarrow-700.woff2'];
self.addEventListener('install',function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES.map(function(f){return new Request(f,{cache:'no-cache'})}))}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k.indexOf('opc-entretien-')===0&&k!==CACHE}).map(function(k){return caches.delete(k)}));
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
