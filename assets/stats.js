/* sunan.online – yüngül ziyarət statistikası (Supabase REST, yalnız publishable/anon açar). */
(function(){try{
if(window.__sunStats)return;window.__sunStats=1;
var l=location,h=l.hostname,n=navigator,p=l.pathname.slice(0,300),
U='https://vjkyjcbefekflqpnqnen.supabase.co',K='sb_publishable_O2Ci6QlcINYOBIAaG7_bng_NpR-AevE',
M=/(^|\.)sunan\.online$/;
if(!M.test(h)||/^\/admin(\/|$)/.test(p)||n.webdriver||/bot|crawl|spider|slurp|preview|headless|lighthouse/i.test(n.userAgent))return;
function S(t,o){fetch(U+'/rest/v1/'+t,{method:'POST',keepalive:true,headers:{apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(o)}).catch(function(){})}
var r='';try{r=new URL(document.referrer).hostname}catch(e){}
if(M.test(r))r='';r=r||null;
var vid=null;try{vid=localStorage.getItem('sn_vid');if(!vid){vid=Math.random().toString(36).slice(2,10)+Date.now().toString(36);localStorage.setItem('sn_vid',vid)}}catch(e){}
var c=document.querySelector('link[rel=canonical]');
if(c&&/\/404\.html$/.test(c.getAttribute('href')||'')){S('events',{host:h,kind:'404',path:p,ref_host:r});return}
var q0='';
function Q(q){q=String(q||'').trim().slice(0,100);if(q&&q!==q0){q0=q;S('events',{host:h,kind:'search',path:p,q:q,ref_host:r})}}
S('pageviews',{host:h,path:p,ref_host:r,vid:vid,lang:(document.documentElement.lang||n.language||'').slice(0,12),device:innerWidth<768?'mobile':'desktop'});
if(/^\/axtar(\/|$)/.test(p)){
  try{Q(new URLSearchParams(l.search).get('q'))}catch(e){}
  document.addEventListener('submit',function(e){var f=e.target;if(f&&f.id==='sform'){var i=f.querySelector('input[type=search],input[type=text],input:not([type])');setTimeout(function(){Q(i&&i.value)},0)}},true);
}
}catch(e){}})();
