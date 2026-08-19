(function(){
'use strict';
var localKeys=['sliq-google-client-id','sliq-google-profile','sliq-google-sync-key'];
var sessionKeys=['sliq-google-token','sliq-google-token-exp','sliq-google-scope'];
try{localKeys.forEach(function(k){localStorage.removeItem(k)})}catch(e){}
try{sessionKeys.forEach(function(k){sessionStorage.removeItem(k)})}catch(e){}
function removeGoogleUi(){
  ['sliqGoogleHomeBtn','sliqGoogleBtn','sliqGoogleShade','sliqGoogleWarn','sliqLoginToast','sliqGTitle','sliqGProfile'].forEach(function(id){var e=document.getElementById(id);if(e)e.remove()});
  document.querySelectorAll('.sliq-google-home,.sliq-gbtn,.sliq-gshade,.sliq-google-warn,.sliq-login-toast').forEach(function(e){e.remove()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',removeGoogleUi);else removeGoogleUi();
new MutationObserver(removeGoogleUi).observe(document.documentElement,{childList:true,subtree:true});
try{delete window.SliqGoogle}catch(e){window.SliqGoogle=undefined}
})();
