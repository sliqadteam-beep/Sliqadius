(function(){
'use strict';
var nativeFetch=window.fetch.bind(window);
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function isGroq(input){var u=typeof input==='string'?input:(input&&input.url)||'';return u.indexOf('https://api.groq.com/openai/v1/chat/completions')===0}
function trimMessages(b){
  if(!Array.isArray(b.messages)||b.messages.length<=20)return;
  var first=(b.messages[0]&&b.messages[0].role==='system')?[b.messages[0]]:[];
  var rest=b.messages.slice(first.length).slice(-18);
  b.messages=first.concat(rest);
}
function normalizeBody(raw){
  if(typeof raw!=='string')return raw;
  try{
    var b=JSON.parse(raw),m=String(b.model||'');
    trimMessages(b);
    b.stream=false;
    if(m.indexOf('openai/gpt-oss-')===0){
      delete b.reasoning_format;
      b.include_reasoning=false;
      if(['low','medium','high'].indexOf(b.reasoning_effort)<0)b.reasoning_effort='medium';
      b.max_completion_tokens=Math.min(Math.max(256,Number(b.max_completion_tokens||1800)),2600);
      b.temperature=Math.min(0.7,Math.max(0.2,Number(b.temperature||0.5)));
      b.top_p=Number(b.top_p||0.95);
    }else if(m==='qwen/qwen3.6-27b'){
      delete b.include_reasoning;
      b.reasoning_format='hidden';
      if(['none','default'].indexOf(b.reasoning_effort)<0)b.reasoning_effort='default';
      b.max_completion_tokens=Math.min(Math.max(256,Number(b.max_completion_tokens||1200)),1900);
      b.temperature=Math.min(0.8,Math.max(0.2,Number(b.temperature||0.6)));
      b.top_p=Number(b.top_p||0.95);
    }
    return JSON.stringify(b);
  }catch(e){return raw}
}
function cloneOpts(opts){
  var o=Object.assign({},opts||{}),h=new Headers((opts&&opts.headers)||{});
  o.headers=h;o.cache='no-store';o.body=normalizeBody(o.body);delete o.signal;
  return o;
}
function retryAfterMs(r){
  var ra=(r.headers.get('retry-after')||'').trim();
  if(!ra)return 0;
  if(isFinite(Number(ra)))return Math.max(0,Number(ra)*1000);
  var d=Date.parse(ra);return isFinite(d)?Math.max(0,d-Date.now()):0;
}
async function hardLimit(r){
  if(r.status!==429)return false;
  try{
    var txt=(await r.clone().text()).toLowerCase();
    return /tokens per day|requests per day|\btpd\b|\brpd\b|daily limit|spend limit|billing hard limit/.test(txt);
  }catch(e){return false}
}
window.fetch=async function(input,opts){
  if(!isGroq(input))return nativeFetch(input,opts);
  var base=cloneOpts(opts),last=null;
  for(var attempt=0;attempt<3;attempt++){
    var controller=new AbortController(),timer=setTimeout(function(){controller.abort()},90000);
    var o=Object.assign({},base,{signal:controller.signal});
    try{
      var r=await nativeFetch(input,o);clearTimeout(timer);
      if(r.ok)return r;
      if([408,425,429,500,502,503,504].indexOf(r.status)<0||attempt===2||await hardLimit(r))return r;
      var wait=retryAfterMs(r);
      if(wait>12000)return r;
      await sleep((wait||Math.min(6000,900*Math.pow(2,attempt)))+Math.floor(Math.random()*250));
      last=r;
    }catch(e){
      clearTimeout(timer);last=e;
      if(attempt===2)throw e;
      await sleep(800*(attempt+1));
    }
  }
  if(last instanceof Response)return last;
  throw last||new Error('Groq request failed');
};
})();
