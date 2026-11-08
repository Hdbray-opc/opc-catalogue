/* Licence screen of the phone version: checks the licence key with the browser's crypto
   (PBKDF2-SHA256 then AES-256-GCM on a small control block from lock.json), then keeps the
   AES key, non-exportable, in IndexedDB for the service worker, and the licence key for the
   settings page ("Licence" tab). */
(function(){
  'use strict';
  function b64(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
  function db(){return new Promise(function(ok,ko){var r=indexedDB.open('opc-licence',1);r.onupgradeneeded=function(){r.result.createObjectStore('k')};r.onsuccess=function(){ok(r.result)};r.onerror=function(){ko(r.error)}})}
  // the licence key itself is not kept in clear: it is sealed with a random AES key that
  // this browser keeps non-exportable (raw key bytes can never be read out of it)
  function seal(k){return crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']).then(function(wk){
    var iv=crypto.getRandomValues(new Uint8Array(12));
    return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},wk,new TextEncoder().encode(k)).then(function(ct){return {wk:wk,lic:{iv:iv,ct:new Uint8Array(ct)}}});
  })}
  function put(v,k){return seal(k).then(function(s){return db().then(function(d){return new Promise(function(ok,ko){var t=d.transaction('k','readwrite'),o=t.objectStore('k');o.put(v,'aes');o.put(s.wk,'wk');o.put(s.lic,'lic');t.oncomplete=ok;t.onerror=function(){ko(t.error)}})})})}
  function get(){return db().then(function(d){return new Promise(function(ok){var t=d.transaction('k').objectStore('k').get('aes');t.onsuccess=function(){ok(t.result||null)};t.onerror=function(){ok(null)}})}).catch(function(){return null})}
  var lockInfo=fetch('lock.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error('réseau');return r.json()});
  function check(key){return lockInfo.then(function(L){var c=b64(L.check);return crypto.subtle.decrypt({name:'AES-GCM',iv:c.slice(0,12)},key,c.slice(12))})}
  function controlled(){
    if(!('serviceWorker' in navigator))return Promise.reject(new Error('navigateur trop ancien'));
    if(navigator.serviceWorker.controller)return Promise.resolve();
    return new Promise(function(ok){navigator.serviceWorker.addEventListener('controllerchange',ok);navigator.serviceWorker.ready.then(function(){if(navigator.serviceWorker.controller)ok()})});
  }
  window.OPC_LOCK={
    unlock:function(k){
      return lockInfo.then(function(L){
        return crypto.subtle.importKey('raw',new TextEncoder().encode(k),'PBKDF2',false,['deriveKey']).then(function(base){
          return crypto.subtle.deriveKey({name:'PBKDF2',salt:b64(L.salt),iterations:L.iter,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['decrypt']);
        });
      }).then(function(key){return check(key).then(function(){return put(key,k)},function(){throw new Error('bad')})});
    },
    done:function(){return controlled().then(function(){location.replace('intro.html')})}
  };
  // already unlocked on this phone: go straight in
  get().then(function(key){if(key)return check(key).then(function(){return window.OPC_LOCK.done()})}).catch(function(){});
})();
