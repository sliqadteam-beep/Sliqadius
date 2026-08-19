(function(g){
'use strict';
var supported={de:1,en:1,fr:1,es:1,it:1,nl:1,pl:1,tr:1,pt:1,ru:1,ja:1,ko:1,zh:1};
var loading={};g.SliqI18nLangs=g.SliqI18nLangs||{};
function norm(code){code=String(code||'').slice(0,2).toLowerCase();return supported[code]?code:'en'}
function load(code){code=norm(code);if(g.SliqI18nLangs[code])return Promise.resolve(g.SliqI18nLangs[code]);if(loading[code])return loading[code];loading[code]=new Promise(function(resolve,reject){var s=document.createElement('script');s.src='i18n/'+code+'.js?v=10';s.async=true;s.onload=function(){var d=g.SliqI18nLangs[code];d?resolve(d):reject(new Error('I18N_EMPTY_'+code))};s.onerror=function(){reject(new Error('I18N_LOAD_'+code))};document.head.appendChild(s)}).catch(function(e){if(code!=='en')return load('en');throw e});return loading[code]}
g.SliqI18nLoader={load:load,norm:norm,supported:Object.keys(supported)};
})(window);
