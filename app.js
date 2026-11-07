/* OPC Catalogue Pièces – version téléphone (PWA).
   Remplace le petit serveur de l'application Windows : les données (listes, étapes cochées, réglages)
   sont gardées dans le stockage du navigateur, et le service worker garde tout le catalogue (chiffré) hors ligne. */
(function(){
  'use strict';
  var KEY='opc-catalogue-pieces.state';
  window.IS_APP=true;
  try{window.__STATE=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){window.__STATE={}}
  if(!window.__STATE||typeof window.__STATE!=='object')window.__STATE={};
  var realFetch=window.fetch.bind(window);
  // settings page, "Licence" tab: the key kept on this phone at activation, or forget it
  function idb(){return new Promise(function(ok,ko){var r=indexedDB.open('opc-licence',1);r.onupgradeneeded=function(){r.result.createObjectStore('k')};r.onsuccess=function(){ok(r.result)};r.onerror=function(){ko(r.error)}})}
  function licence(m){
    return idb().then(function(d){return new Promise(function(ok){
      if(m==='DELETE'){var t=d.transaction('k','readwrite');t.objectStore('k').delete('aes');t.objectStore('k').delete('lic');t.oncomplete=function(){ok(new Response(null,{status:204}))};t.onerror=t.oncomplete;return}
      var g=d.transaction('k').objectStore('k').get('lic');g.onsuccess=function(){ok(new Response(JSON.stringify({key:g.result||''}),{status:200,headers:{'Content-Type':'application/json'}}))};g.onerror=function(){ok(new Response('{}',{status:200}))};
    })});
  }
  window.fetch=function(u,o){
    var s=typeof u==='string'?u:(u&&u.url)||'';
    if(/\/api\/licence$/.test(s))return licence(o&&o.method);
    if(/\/api\/state$/.test(s)){
      try{
        if(o&&o.method==='POST'){JSON.parse(o.body);localStorage.setItem(KEY,o.body);return Promise.resolve(new Response(null,{status:204}))}
        return Promise.resolve(new Response(localStorage.getItem(KEY)||'{}',{status:200,headers:{'Content-Type':'application/json'}}));
      }catch(e){return Promise.resolve(new Response('stockage plein ou bloqué',{status:507}))}
    }
    return realFetch(u,o);
  };
  // ask the browser to keep the data even when space runs low
  try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
  if('serviceWorker' in navigator){
    var root=document.currentScript.src.replace(/app\.js(\?.*)?$/,'');
    window.addEventListener('load',function(){
      navigator.serviceWorker.register(root+'sw.js',{scope:root}).catch(function(){});
      // ask the worker to keep the whole (encrypted) catalogue on the phone; files already kept are skipped
      navigator.serviceWorker.ready.then(function(r){if(r.active)r.active.postMessage('precache')});
      navigator.serviceWorker.addEventListener('message',function(ev){var d=ev.data||{};if(d.type==='opc-cache')show(d)});
      function show(d){
        var b=document.getElementById('opc-dl');
        if(!b){b=document.createElement('div');b.id='opc-dl';b.setAttribute('role','status');
          b.style.cssText='position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:9999;background:#123a6d;color:#fff;font:500 13px/1.3 system-ui,sans-serif;padding:9px 14px;border-radius:999px;box-shadow:0 4px 14px rgba(0,0,0,.25);max-width:calc(100vw - 32px);text-align:center';
          document.body.appendChild(b)}
        if(d.done){b.textContent=d.failed?('Hors ligne incomplet ('+d.failed+' fichiers manquants) : rouvrez l\'app avec du réseau.'):'Catalogue enregistré : utilisable hors ligne.';setTimeout(function(){b.remove()},d.failed?8000:3500)}
        else b.textContent='Téléchargement pour le hors ligne… '+Math.round(100*d.n/d.total)+' %';
      }
    });
  }
})();
