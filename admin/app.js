(function(){
'use strict';
var AH='f8ecf8b0b925141f82336383233c2f0521984efb5c208c1a9a4acde981a65700';
var PM={url:'https://isvqwafixlmusmuqqnyk.supabase.co',key:'sb_publishable_UnQ35pj_GatInq-7lhFGgQ_DnRoUnDC'},PS={url:'https://vjkyjcbefekflqpnqnen.supabase.co',key:'sb_publishable_O2Ci6QlcINYOBIAaG7_bng_NpR-AevE'};
var HOME=/(^|\.)sunan\.online$/.test(location.hostname)?'s':'m';
var SITES=[
 {h:'mushafuk.online',n:'Əsas sayt',r:'mushafuk-online-site',d:'Quran, tərcümə və oxu'},
 {h:'tafsir.mushafuk.online',n:'Təfsir',r:'mushafuk-tafsir',d:'Təfsir kitabxanası'},
 {h:'t2.mushafuk.online',n:'Təfsir 2',r:'mushafuk-tafsir-2',d:'Əlavə təfsirlər'},
 {h:'t3.mushafuk.online',n:'Elmlər',r:'mushafuk-ulum',d:'Üsul və elm kitabları'},
 {h:'t.mushafuk.online',n:'Tərcümələr',r:'mushafuk-translations',d:'Quran tərcümələri'},
 {h:'t1.mushafuk.online',n:'Tərcümələr 2',r:'mushafuk-translations-extra',d:'Əlavə tərcümələr'},
 {h:'quran.mushafuk.online',n:'Quran (təcvid)',r:'tecvidtest',d:'Təcvid tətbiqi',track:false},
 {h:'sunan.online',n:'Sunan · Əsas sayt',r:'sahih-bukhari',d:'Hədis kitabxanası',o:'muhadisonline',g:'s'},
 {h:'buxari.sunan.online',n:'Sunan · Buxari',r:'buxari',d:'Səhih əl-Buxari',o:'muhadisonline',g:'s'},
 {h:'ruwat.sunan.online',n:'Sunan · Rəvilər',r:'ruwat',d:'Hədis rəviləri',o:'muhadisonline',g:'s'}
];
function own(h){return ((HOME==='s')===(h==='*sunan'||/(^|\.)sunan\.online$/.test(h||'')))?0:1} /* 0 = this panel's own site */
SITES=SITES.map(function(x,i){return{x:x,i:i}}).sort(function(a,b){return own(a.x.h)-own(b.x.h)||a.i-b.i}).map(function(o){return o.x});
var NAME={};SITES.forEach(function(s){NAME[s.h]=s.n});NAME['*sunan']='Sunan · ümumi';
var $=function(i){return document.getElementById(i)};
var AO={auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}};
var CM=supabase.createClient(PM.url,PM.key,AO),CS=supabase.createClient(PS.url,PS.key,AO);
var sb=HOME==='s'?CS:CM,sb2=HOME==='s'?CM:CS; /* sb = bu saytın layihəsi (giriş qapısı), sb2 = digər sayt */
function cl(h){return (h==='*sunan'||/(^|\.)sunan\.online$/.test(h||''))?CS:CM}
function ph(h){return h==='*sunan'?null:h}
var st={p:'week',h:HOME==='s'?'*sunan':null,chart:null,busy:false,timer:null};
var AZM=['Yan','Fev','Mar','Apr','May','İyn','İyl','Avq','Sen','Okt','Noy','Dek'];
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function fmt(n){n=Number(n)||0;return n.toLocaleString('az')}
function show(login){$('login').classList.toggle('hide',!login);$('app').classList.toggle('hide',login)}

/* ---------- auth ---------- */
async function isAdmin(e){try{var b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(e));return Array.prototype.map.call(new Uint8Array(b),function(x){return ('0'+x.toString(16)).slice(-2)}).join('')===AH}catch(x){return false}}
function setMsg(t,c){var m=$('lmsg');m.textContent=t||'';m.className='msg '+(c||'')}
$('eye').onclick=function(){var p=$('pass'),h=p.type==='password';p.type=h?'text':'password';this.setAttribute('aria-pressed',h);this.setAttribute('aria-label',h?'Şifrəni gizlət':'Şifrəni göstər')};
$('lf').onsubmit=async function(e){
  e.preventDefault();
  var em=$('email').value.trim().toLowerCase(),pw=$('pass').value,btn=$('send');
  if(!em||!pw){setMsg('E-poçt və şifrəni daxil edin.','err');return}
  if(!(await isAdmin(em))){setMsg('Bu panel yalnız sahibi üçündür.','err');return}
  btn.disabled=true;btn.textContent='Yoxlanılır…';setMsg('');
  try{await sb2.auth.signInWithPassword({email:em,password:pw})}catch(x){}
  var r;try{r=await sb.auth.signInWithPassword({email:em,password:pw})}catch(x){r={error:{message:'network',status:0}}}
  btn.disabled=false;btn.textContent='Daxil ol';
  if(r.error){
    var m=String(r.error.message||''),c=r.error.code||'';
    setMsg(/invalid login|invalid_credentials/i.test(m+c)?'E-poçt və ya şifrə yanlışdır.':
      /not confirmed|email_not_confirmed/i.test(m+c)?'E-poçt hələ təsdiqlənməyib.':
      /rate|too many|over_request/i.test(m+c)?'Çox sayda cəhd edildi. Bir az gözləyib yenidən cəhd edin.':
      /network|fetch|Failed/i.test(m)||r.error.status===0?'Şəbəkə xətası. İnternet bağlantısını yoxlayın.':
      'Giriş alınmadı: '+m,'err');
    $('pass').value='';$('pass').focus();return}
  $('pass').value='';
};
$('out').onclick=async function(){try{await sb2.auth.signOut()}catch(x){}await sb.auth.signOut();setMsg('Çıxış edildi.','ok')};
async function gate(session){
  if(!session){show(true);return}
  var em=(session.user&&session.user.email||'').toLowerCase();
  if(!(await isAdmin(em))){await sb.auth.signOut();show(true);setMsg('Bu hesabın icazəsi yoxdur.','err');return}
  $('me').textContent=em;show(false);
  buildChips();buildSites();load();loadLive();
  [st.timer,st.t2,st.t3].forEach(clearInterval);
  function live(){return !document.hidden&&!$('app').classList.contains('hide')}
  st.timer=setInterval(function(){if(live())load(true)},60000);
  st.t2=setInterval(function(){if(live())loadLive()},30000);
  st.t3=setInterval(function(){if(live())checkHealth()},300000);
}
sb.auth.onAuthStateChange(function(ev,s){if(ev==='SIGNED_OUT'){show(true)}else if(ev==='SIGNED_IN'||ev==='INITIAL_SESSION'){gate(s)}});

/* ---------- controls ---------- */
$('seg').onclick=function(e){var b=e.target.closest('button');if(!b)return;st.p=b.dataset.p;[].forEach.call($('seg').children,function(x){x.classList.toggle('on',x===b)});load()};
function buildChips(extra){
  var GM=[{h:null,n:'Mushafuk · ümumi'}].concat(SITES.filter(function(x){return x.track!==false&&x.g!=='s'})),GS=[{h:'*sunan',n:'Sunan · ümumi'}].concat(SITES.filter(function(x){return x.g==='s'}));
  var list=HOME==='s'?GS.concat(GM):GM.concat(GS);
  (extra||[]).forEach(function(h){if(!NAME[h])list.push({h:h,n:h})});
  $('chips').innerHTML=list.map(function(s){return '<button class="chip'+(s.h===st.h?' on':'')+'" data-h="'+esc(s.h||'')+'">'+esc(s.n)+'</button>'}).join('');
}
$('chips').onclick=function(e){var b=e.target.closest('.chip');if(!b)return;st.h=b.dataset.h||null;[].forEach.call($('chips').children,function(x){x.classList.toggle('on',(x.dataset.h||null)===st.h)});load()};
$('refresh').onclick=function(){load();loadLive();checkHealth()};

/* ---------- data ---------- */
var SURAH=['Fatihə','Bəqərə','Ali-İmran','Nisa','Maidə','Ənam','Əraf','Ənfal','Tövbə','Yunus','Hud','Yusif','Rəd','İbrahim','Hicr','Nəhl','İsra','Kəhf','Məryəm','Taha','Ənbiya','Həcc','Muminun','Nur','Furqan','Şuəra','Nəml','Qəsəs','Ənkəbut','Rum','Loqman','Səcdə','Əhzab','Səba','Fatir','Yasin','Saffat','Sad','Zümər','Ğafir','Fussilət','Şura','Zuxruf','Duxan','Casiyə','Əhqaf','Muhəmməd','Fəth','Hucurat','Qaf','Zariyat','Tur','Nəcm','Qəmər','Rəhman','Vaqiə','Hədid','Mücadilə','Həşr','Mümtəhinə','Səff','Cumə','Munafiqun','Təğabun','Talaq','Təhrim','Mülk','Qələm','Haqqə','Məaric','Nuh','Cin','Muzzəmmil','Muddəssir','Qiyamə','İnsan','Mürsəlat','Nəbə','Naziat','Əbəsə','Təkvir','İnfitar','Mutəffifin','İnşiqaq','Buruc','Tariq','Əla','Ğaşiyə','Fəcr','Bələd','Şəms','Leyl','Duha','İnşirah','Tin','Ələq','Qədr','Beyyinə','Zilzal','Adiyat','Qariə','Təkasür','Əsr','Huməzə','Fil','Qureyş','Maun','Kövsər','Kafirun','Nəsr','Məsəd','İxlas','Fələq','Nas'];
var WORK={aysar:'Əl-Aysər',baghawi:'Bağəvi',tabari:'Təbəri',shawkani:'Şövkani',jawzi:'İbn əl-Cövzi',qasimi:'Qasimi',muyassar:'Müyəssər',uthaymeen:'İbn Useymin',qayyim:'İbn əl-Qəyyim',samani:'Səmani',saadi:'Sə\u2019di',ibnkathir:'İbn Kəsir',mukhtasar:'Muxtəsər',shinqiti:'Şinqiti',zamanin:'İbn Əbi Zəmənin',ibnhatim:'İbn Əbi Hatim',thawri:'Səvri',all:'Birləşmiş təfsir',mujahid:'Mücahid',mundhir:'İbn əl-Münzir',rajab:'İbn Rəcəb',razzaq:'Əbdürrəzzaq',taymiyyah:'İbn Teymiyyə',tabarani:'Təbərani'};
var CN=null;try{CN=new Intl.DisplayNames(['az'],{type:'region'})}catch(e){}
function flag(c){return c&&c.length===2&&c!=='??'?String.fromCodePoint(127397+c.charCodeAt(0),127397+c.charCodeAt(1)):'\uD83C\uDF10'}
function cname(c){if(c==='??')return 'Bilinmir';try{return CN?CN.of(c):c}catch(e){return c}}
function pretty(k){k=String(k||'').replace(/[-_]+/g,' ');return k.charAt(0).toUpperCase()+k.slice(1)}
function wname(w){var p=String(w).split('|'),k=p[1]||'';return (WORK[k]||pretty(k))+(/^t1?\./.test(p[0])?' · tərcümə':'')}
function sname(s,a){return (SURAH[s-1]||'Surə '+s)+' '+s+(a?':'+a:'')}
function delta(c,p){c=+c||0;p=+p||0;if(!p&&!c)return '<span class="dl0">\u2014</span>';if(!p)return '<span class="dup">\u25B2 yeni</span>';var d=Math.round((c-p)*100/p);return d>=0?'<span class="dup">\u25B2 '+d+'%</span>':'<span class="ddn">\u25BC '+Math.abs(d)+'%</span>'}
function barList(rows){
  if(!rows.length)return '<div class="empty">Hələ məlumat yoxdur</div>';
  var mx=Math.max.apply(null,[1].concat(rows.map(function(r){return r[1]})));
  return rows.map(function(r){return '<div class="bar" style="cursor:default"><div class="t"><span>'+r[0]+'</span><span>'+fmt(r[1])+'</span></div><div class="tr"><i style="width:'+Math.max(2,Math.round(r[1]/mx*100))+'%"></i></div></div>'}).join('')}

async function load(quiet){
  if(st.busy)return;st.busy=true;$('refresh').classList.add('spin');
  if(!quiet)skeleton();
  var a={p_period:st.p,p_host:ph(st.h)};
  var c=cl(st.h),oc=c===CM?CS:CM;
  var r=await Promise.all([c.rpc('admin_dashboard',a),c.rpc('admin_content',a),c.rpc('admin_events',a),oc.rpc('admin_dashboard',{p_period:st.p,p_host:null})]);
  st.busy=false;$('refresh').classList.remove('spin');
  for(var i=0;i<3;i++){var e=r[i].error;if(e&&(e.code==='42501'||/forbidden|JWT|permission/i.test(e.message))){
    if(c===sb){await sb2.auth.signOut().catch(function(){});await sb.auth.signOut();show(true);setMsg('Giriş icazəsi yoxdur.','err');return}
    $('kpis').innerHTML='<div class="empty" style="grid-column:1/-1">Bu saytın layihəsinə giriş yoxdur. Çıxıb eyni e-poçt və şifrə ilə yenidən daxil olun.</div>';return}}
  if(r[0].error){$('kpis').innerHTML='<div class="empty" style="grid-column:1/-1">Məlumat yüklənmədi: '+esc(r[0].error.message)+'</div>';return}
  var od=r[3]&&!r[3].error&&r[3].data&&r[3].data.hosts;
  if(od){var have={};(r[0].data.hosts||[]).forEach(function(h){have[h.host]=1});r[0].data.hosts=(r[0].data.hosts||[]).concat(od.filter(function(h){return !have[h.host]}))}
  (r[0].data.hosts||[]).sort(function(a,b){return own(a.host)-own(b.host)||b.views-a.views});st.dash=r[0].data;render(st.dash);
  st.content=r[1].error?null:r[1].data;renderContent(st.content,r[1].error);
  st.events=r[2].error?null:r[2].data;renderEvents(st.events,r[2].error);
}
function skeleton(){
  var k=['Bu gün','Bu həftə','Bu ay','Bu il','Ümumi'];
  $('kpis').innerHTML=k.map(function(l,i){return '<div class="kpi'+(i==4?' tot':'')+'"><label>'+l+'</label><div class="v sk">0000</div><div class="s sk">\u2026</div></div>'}).join('');
}
function render(d){
  var K=d.kpis,names=[['today','Bu gün'],['week','Bu həftə'],['month','Bu ay'],['year','Bu il'],['total','Ümumi']];
  $('kt').textContent=st.h?(NAME[st.h]||st.h):'Mushafuk · ümumi';
  var q=$('quranSec');if(q)q.style.display=cl(st.h)===CS?'none':'';
  $('kpis').innerHTML=names.map(function(n,i){var x=K[n[0]],t=n[0]==='total';
    return '<div class="kpi'+(t?' tot':'')+'"'+(t?'':' title="Əvvəlki müqayisə dövrü: '+fmt(x.pviews)+' baxış, '+fmt(x.pvisitors)+' ziyarətçi"')+'><label>'+n[1]+(t?'':' '+delta(x.views,x.pviews))+'</label><div class="v">'+fmt(x.views)+' <small style="font:500 .8rem system-ui;color:var(--mut)">baxış</small></div><div class="s"><b>'+fmt(x.visitors)+'</b> ziyarətçi'+(t?'':' · '+delta(x.visitors,x.pvisitors))+'</div></div>'}).join('');
  $('upd').textContent='yeniləndi '+new Date().toLocaleTimeString('az',{hour:'2-digit',minute:'2-digit'});
  var rl={day:'son 24 saat',week:'son 7 gün',month:'son 30 gün',year:'son 12 ay'}[d.period];
  $('rng').textContent=rl;
  var w=d.win;$('cmp').innerHTML='<b>'+rl+'</b> əvvəlki eyni müddətlə müqayisədə: '+fmt(w.views)+' baxış '+delta(w.views,w.pviews)+' <small>(əvvəl '+fmt(w.pviews)+')</small> · '+fmt(w.visitors)+' ziyarətçi '+delta(w.visitors,w.pvisitors)+' <small>(əvvəl '+fmt(w.pvisitors)+')</small>';
  drawChart(d);
  var hs=d.hosts||[],mx=Math.max.apply(null,[1].concat(hs.map(function(h){return h.views})));
  var rows=SITES.filter(function(s){return s.track!==false}).map(function(s){return hs.filter(function(h){return h.host===s.h})[0]||{host:s.h,views:0,visitors:0}});
  hs.forEach(function(h){if(!NAME[h.host])rows.push(h)});
  rows.sort(function(a,b){return own(a.host)-own(b.host)||b.views-a.views});
  $('hosts').innerHTML=rows.map(function(h){return '<button class="bar'+(st.h===h.host?' on':'')+'" data-h="'+esc(h.host)+'"><div class="t"><span>'+esc(NAME[h.host]||h.host)+' <small>'+esc(h.host)+'</small></span><span>'+fmt(h.views)+' <small>· '+fmt(h.visitors)+' z.</small></span></div><div class="tr"><i style="width:'+Math.max(h.views?2:0,Math.round(h.views/mx*100))+'%"></i></div></button>'}).join('');
  var P=d.pages||[];
  $('pages').innerHTML=P.length?P.map(function(p){return '<div class="pg"><div><div class="p">'+esc(p.path)+'</div><div class="h">'+esc(NAME[p.host]||p.host)+'</div></div><b>'+fmt(p.views)+'</b></div>'}).join(''):'<div class="empty">Hələ məlumat yoxdur</div>';
  var R=d.referrers||[],rr=R.map(function(x){return [esc(x.ref),x.views]});if(d.direct)rr.unshift(['Birbaşa / bilinmir',d.direct]);
  $('refs').innerHTML=barList(rr);
  var D=d.devices||[],tot=D.reduce(function(a,x){return a+x.views},0),dm={mobile:['Mobil','#c9a24a'],desktop:['Kompüter','#34b183']};
  $('devs').innerHTML=tot?'<div class="dev">'+D.map(function(x){return '<i style="width:'+(x.views/tot*100)+'%;background:'+(dm[x.device]||['','#888'])[1]+'"></i>'}).join('')+'</div><div class="dl">'+D.map(function(x){var m=dm[x.device]||[x.device,'#888'];return '<span><i style="background:'+m[1]+'"></i>'+esc(m[0])+' <b>'+Math.round(x.views/tot*100)+'%</b> <small style="color:var(--mut)">('+fmt(x.views)+')</small></span>'}).join('')+'</div>':'<div class="empty">Hələ məlumat yoxdur</div>';
}
function renderContent(c,err){
  var ids=['surahs','ayahs','tafsirs','books','ctry'];
  if(!c){ids.forEach(function(i){$(i).innerHTML='<div class="empty">'+(err?'Yüklənmədi: '+esc(err.message):'—')+'</div>'});return}
  $('surahs').innerHTML=barList(c.surahs.map(function(x){return [esc(sname(x.sura)),x.views]}));
  $('ayahs').innerHTML=barList(c.ayahs.map(function(x){return [esc(sname(x.sura,x.ayah)),x.views]}));
  $('tafsirs').innerHTML=barList(c.tafsirs.map(function(x){return [esc(wname(x.work))+' <small style="color:var(--mut)">'+esc(String(x.work).split('|')[0])+'</small>',x.views]}));
  $('books').innerHTML=barList(c.books.map(function(x){return [esc(pretty(x.book)),x.views]}));
  $('ctry').innerHTML=barList(c.countries.map(function(x){return [flag(x.c)+' '+esc(cname(x.c)),x.views]}));
}
function renderEvents(e,err){
  if(!e){['nf','qs','zq'].forEach(function(i){$(i).innerHTML='<div class="empty">'+(err?'Yüklənmədi: '+esc(err.message):'—')+'</div>'});return}
  $('nf-t').textContent=fmt(e.nf_total)+' hit';
  $('nf').innerHTML=e.not_found.length?e.not_found.map(function(x){return '<div class="pg"><div><div class="p">'+esc(x.path)+'</div><div class="h">'+esc(x.host)+(x.ref?' \u00B7 \u2190 '+esc(x.ref):'')+' \u00B7 '+new Date(x.last).toLocaleString('az',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+'</div></div><b>'+fmt(x.n)+'</b></div>'}).join(''):'<div class="empty">Qırıq keçid qeydə alınmayıb \uD83C\uDF89</div>';
  var zr=e.q_total?Math.round(e.q_zero*100/e.q_total):0;
  $('q-t').textContent=fmt(e.q_total)+' axtarış \u00B7 nəticəsiz '+fmt(e.q_zero)+' ('+zr+'%)';
  $('qs').innerHTML=e.queries.length?e.queries.map(function(x){return '<div class="pg"><div class="p" style="direction:auto">'+esc(x.q)+'</div><b>'+fmt(x.n)+(x.zero?' <small class="ddn">('+x.zero+' boş)</small>':'')+'</b></div>'}).join(''):'<div class="empty">Hələ axtarış yoxdur</div>';
  $('zq').innerHTML=e.zero.length?e.zero.map(function(x){return '<div class="pg"><div class="p" style="direction:auto">'+esc(x.q)+'</div><b>'+fmt(x.n)+'</b></div>'}).join(''):'<div class="empty">Nəticəsiz axtarış yoxdur</div>';
}
$('hosts').onclick=function(e){var b=e.target.closest('.bar');if(!b)return;st.h=b.dataset.h;[].forEach.call($('chips').children,function(x){x.classList.toggle('on',(x.dataset.h||null)===st.h)});load();window.scrollTo({top:0,behavior:'smooth'})};

function lbl(t,per){var m=t.match(/(\d+)-(\d+)-(\d+)T(\d+):/);if(!m)return t;
  if(per==='day')return m[4]+':00';if(per==='year')return AZM[+m[2]-1]+' '+m[1].slice(2);return +m[3]+' '+AZM[+m[2]-1]}
function drawChart(d){
  var L=d.series.map(function(x){return lbl(x.t,d.period)}),V=d.series.map(function(x){return x.views}),U=d.series.map(function(x){return x.visitors});
  var ctx=$('chart').getContext('2d'),g=ctx.createLinearGradient(0,0,0,300);g.addColorStop(0,'rgba(201,162,74,.38)');g.addColorStop(1,'rgba(201,162,74,0)');
  if(st.chart)st.chart.destroy();
  st.chart=new Chart(ctx,{type:'line',data:{labels:L,datasets:[
    {label:'Baxışlar',data:V,borderColor:'#c9a24a',backgroundColor:g,fill:true,tension:.35,borderWidth:2.5,pointRadius:L.length>14?0:3,pointHoverRadius:5,pointBackgroundColor:'#c9a24a'},
    {label:'Ziyarətçilər',data:U,borderColor:'#34b183',backgroundColor:'transparent',tension:.35,borderWidth:2,pointRadius:L.length>14?0:3,pointHoverRadius:5,pointBackgroundColor:'#34b183'}]},
   options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},
    plugins:{legend:{display:false},tooltip:{backgroundColor:'#0b1d15',borderColor:'#c9a24a',borderWidth:1,titleColor:'#e6c878',bodyColor:'#f2ede1',padding:10}},
    scales:{x:{grid:{display:false},ticks:{color:'#8da598',maxRotation:0,autoSkip:true,maxTicksLimit:7}},y:{beginAtZero:true,grid:{color:'rgba(255,255,255,.06)'},ticks:{color:'#8da598',precision:0,maxTicksLimit:5}}}}});
}

/* ---------- live ---------- */
async function loadLive(){
  var rs=await Promise.all([CM.rpc('admin_live'),CS.rpc('admin_live')]),ds=rs.filter(function(x){return !x.error&&x.data}).map(function(x){return x.data});
  if(!ds.length)return;
  var d={active:0,views5:0,by_host:[],countries:[],pages:[],spark:[]},cm={},sp={};
  ds.forEach(function(x){d.active+=x.active||0;d.views5+=x.views5||0;d.by_host=d.by_host.concat(x.by_host||[]);d.pages=d.pages.concat(x.pages||[]);
    (x.countries||[]).forEach(function(c){cm[c.c]=(cm[c.c]||0)+c.n});(x.spark||[]).forEach(function(q){sp[q.m]=(sp[q.m]||0)+q.n})});
  d.by_host.sort(function(a,b){return own(a.host)-own(b.host)||b.n-a.n});d.pages.sort(function(a,b){return b.n-a.n});d.pages=d.pages.slice(0,8);
  d.countries=Object.keys(cm).map(function(k){return{c:k,n:cm[k]}}).sort(function(a,b){return b.n-a.n}).slice(0,8);
  d.spark=Object.keys(sp).map(function(k){return{m:+k,n:sp[k]}}).sort(function(a,b){return b.m-a.m});
  $('lv-n').textContent=fmt(d.active);$('lv-v').textContent=fmt(d.views5);
  $('lv-hosts').innerHTML=d.by_host.map(function(h){return '<span class="chip on" style="cursor:default">'+esc(NAME[h.host]||h.host)+' <b>'+h.n+'</b></span>'}).join('')+d.countries.map(function(c){return '<span class="chip" style="cursor:default">'+flag(c.c)+' '+esc(c.c)+' <b>'+c.n+'</b></span>'}).join('');
  $('lv-pages').innerHTML=d.pages.length?d.pages.map(function(p){return '<div class="pg"><div><div class="p">'+esc(p.path)+'</div><div class="h">'+esc(NAME[p.host]||p.host)+'</div></div><b>'+p.n+'</b></div>'}).join(''):'<div class="empty">Hazırda aktiv ziyarətçi yoxdur</div>';
  var mx=Math.max.apply(null,[1].concat(d.spark.map(function(s){return s.n})));
  $('spark').innerHTML=d.spark.map(function(s){return '<i style="height:'+Math.max(6,Math.round(s.n/mx*100))+'%;opacity:'+(s.n?1:.25)+'" title="'+s.m+' dəq əvvəl: '+s.n+'"></i>'}).join('');
  $('liveu').textContent='yeniləndi '+new Date().toLocaleTimeString('az',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
}

/* ---------- site cards + health ---------- */
var HEALTH={},DEPLOY={};
function buildSites(){
  $('sites').innerHTML=SITES.map(function(s){return '<div class="site"><h3><span>'+esc(s.n)+'</span><span class="st" id="st-'+esc(s.r)+'">\u2026</span></h3><div class="u">'+esc(s.h)+' \u2014 '+esc(s.d)+'</div><div class="hl"><span class="st" id="hs-'+esc(s.r)+'">\u2026</span>'+(s.track===false?'<span class="st">sayğac yoxdur</span>':'')+'</div><div class="row"><a href="https://'+esc(s.h)+'/" target="_blank" rel="noopener">Saytı aç</a><a href="https://github.com/'+esc(s.o||'nihomaho9-ui')+'/'+esc(s.r)+'" target="_blank" rel="noopener">GitHub</a></div><div class="n" id="nt-'+esc(s.r)+'"></div></div>'}).join('');
  SITES.forEach(function(s){deploy(s)});checkHealth();
}
async function deploy(s){
  var k='mfk-dep-'+s.r,c=null;
  try{c=JSON.parse(sessionStorage.getItem(k)||'null')}catch(e){}
  if(!c||Date.now()-c.t>300000){
    try{var x=await fetch('https://api.github.com/repos/'+(s.o||'nihomaho9-ui')+'/'+s.r+'/pages/builds/latest');if(x.ok){var j=await x.json();c={t:Date.now(),s:j.status,u:j.updated_at,c:(j.commit||'').slice(0,7)};sessionStorage.setItem(k,JSON.stringify(c))}}catch(e){}
  }
  DEPLOY[s.r]=c;paintSite(s);paintAlert();
}
async function checkHealth(){
  await Promise.all(SITES.map(async function(s){
    var t0=performance.now(),o={},ctl=new AbortController(),to=setTimeout(function(){ctl.abort()},8000);
    try{var res=await fetch('https://'+s.h+'/?_='+Date.now(),{cache:'no-store',signal:ctl.signal});o.code=res.status;o.ok=res.ok;o.https=res.url.indexOf('https://')===0}
    catch(e){try{await fetch('https://'+s.h+'/?_='+Date.now(),{mode:'no-cors',cache:'no-store',signal:ctl.signal});o.opaque=true;o.ok=true;o.https=true}catch(e2){o.err=true}}
    clearTimeout(to);o.ms=Math.round(performance.now()-t0);HEALTH[s.h]=o;paintSite(s);
  }));paintAlert();
}
function problems(){
  var p=[];SITES.forEach(function(s){var H=HEALTH[s.h],D=DEPLOY[s.r];
    if(H){if(H.err)p.push(s.h+': əlçatmazdır');else if(!H.ok)p.push(s.h+': HTTP '+H.code);else if(!H.https)p.push(s.h+': HTTPS yoxdur');else if(H.ms>4000)p.push(s.h+': çox yavaşdır ('+H.ms+' ms)')}
    if(D&&D.s==='errored')p.push(s.h+': son yayım xəta ilə bitib')});
  return p}
function paintAlert(){
  var p=problems(),a=$('alert'),n=Object.keys(HEALTH).length;
  if(p.length){a.className='alert bad';a.innerHTML='\u26A0 <b>Problem aşkarlandı:</b> '+p.map(esc).join(' \u00B7 ')}
  else if(n>=SITES.length){a.className='alert ok';a.innerHTML='\u2714 Bütün saytlar işləyir ('+SITES.length+'/'+SITES.length+')'}
}
function paintSite(s){
  var H=HEALTH[s.h],D=DEPLOY[s.r],hs=$('hs-'+s.r),el=$('st-'+s.r),nt=$('nt-'+s.r);
  if(hs&&H){
    if(H.err){hs.textContent='Əlçatmaz';hs.className='st bad'}
    else if(H.opaque){hs.textContent='Cavab var · '+H.ms+' ms · HTTPS';hs.className='st ok'}
    else{hs.textContent='HTTP '+H.code+' · '+H.ms+' ms'+(H.https?' · HTTPS':' · HTTP!');hs.className='st '+(!H.ok||!H.https?'bad':H.ms>4000?'run':'ok')}
  }
  if(el){
    if(!D){el.textContent='\u2014'}
    else{var m={built:['Canlı','ok'],building:['Yenilənir','run'],queued:['Növbədə','run'],errored:['Yayım xətası','bad']}[D.s]||[D.s,''];el.textContent=m[0];el.className='st '+m[1];
      if(D.u&&nt)nt.textContent='Son yayım: '+new Date(D.u).toLocaleString('az',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+(D.c?' \u00B7 '+D.c:'')}
  }
}

/* ---------- CSV export ---------- */
function cell(v){v=v==null?'':String(v);if(/^[=+\-@\t\r]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'}
$('csv').onclick=function(){
  var d=st.dash;if(!d)return;var R=[];
  function add(a){R.push(a.map(cell).join(','))}
  function sec(t,h){R.push('');add(['# '+t]);if(h)add(h)}
  add(['Statistika']);add(['Sayt',st.h||'Ümumi']);add(['Dövr',st.p,'Başlanğıc (UTC)',d.since,'Qurşaq',d.tz,'Yaradıldı',new Date().toISOString()]);
  sec('KPI',['Dövr','Baxış','Ziyarətçi','Əvvəlki baxış','Əvvəlki ziyarətçi']);
  ['today','week','month','year'].forEach(function(k){var x=d.kpis[k];add([{today:'Bu gün',week:'Bu həftə',month:'Bu ay',year:'Bu il'}[k],x.views,x.visitors,x.pviews,x.pvisitors])});
  add(['Ümumi',d.kpis.total.views,d.kpis.total.visitors,'','']);
  add(['Seçilmiş dövr',d.win.views,d.win.visitors,d.win.pviews,d.win.pvisitors]);
  sec('Zaman seriyası',['Vaxt','Baxış','Ziyarətçi']);d.series.forEach(function(x){add([x.t,x.views,x.visitors])});
  sec('Saytlar (seçilmiş dövr)',['Sayt','Baxış','Ziyarətçi']);d.hosts.forEach(function(x){add([x.host,x.views,x.visitors])});
  sec('Səhifələr',['Sayt','Yol','Baxış','Ziyarətçi']);d.pages.forEach(function(x){add([x.host,x.path,x.views,x.visitors])});
  sec('Mənbələr',['Mənbə','Baxış']);add(['(birbaşa)',d.direct]);d.referrers.forEach(function(x){add([x.ref,x.views])});
  sec('Cihazlar',['Cihaz','Baxış']);d.devices.forEach(function(x){add([x.device,x.views])});
  var c=st.content;if(c){
    sec('Surələr',['Surə №','Ad','Baxış']);c.surahs.forEach(function(x){add([x.sura,SURAH[x.sura-1],x.views])});
    sec('Ayələr',['Surə','Ayə','Baxış']);c.ayahs.forEach(function(x){add([x.sura,x.ayah,x.views])});
    sec('Təfsirlər',['Sayt','Kitab','Baxış']);c.tafsirs.forEach(function(x){var p=String(x.work).split('|');add([p[0],wname(x.work),x.views])});
    sec('Kitablar (t3)',['Kitab','Baxış']);c.books.forEach(function(x){add([x.book,x.views])});
    sec('Ölkələr',['Kod','Ölkə','Baxış']);c.countries.forEach(function(x){add([x.c,cname(x.c),x.views])});
  }
  var e=st.events;if(e){
    sec('404 qırıq keçidlər (cəmi '+e.nf_total+')',['Sayt','Yol','Say','Son','Mənbə']);e.not_found.forEach(function(x){add([x.host,x.path,x.n,x.last,x.ref])});
    sec('Axtarışlar (cəmi '+e.q_total+', nəticəsiz '+e.q_zero+')',['Sorğu','Say','Nəticəsiz']);e.queries.forEach(function(x){add([x.q,x.n,x.zero])});
    sec('Nəticəsiz sorğular',['Sorğu','Say']);e.zero.forEach(function(x){add([x.q,x.n])});
  }
  var blob=new Blob(['\uFEFF'+R.join('\r\n')],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='stats-'+(st.h?st.h.replace(/[^a-z0-9]+/gi,'-'):'mushafuk-umumi')+'-'+st.p+'-'+new Date().toISOString().slice(0,10)+'.csv';
  document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},2000);
};

/* ---------- SSO hand-off between the two panels ---------- */
var OTHER=HOME==='s'?{n:'Mushafuk',u:'https://mushafuk.online/admin/'}:{n:'Sunan',u:'https://sunan.online/admin/'};
$('sw').querySelector('.swl').textContent=OTHER.n;$('sw').title=OTHER.n+' panelinə keç';$('sw').setAttribute('aria-label',OTHER.n+' panelinə keç');
function b64u(o){var b=new TextEncoder().encode(JSON.stringify(o)),s='';b.forEach(function(x){s+=String.fromCharCode(x)});return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function unb64u(t){t=t.replace(/-/g,'+').replace(/_/g,'/');while(t.length%4)t+='=';var s=atob(t),a=new Uint8Array(s.length);for(var i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return JSON.parse(new TextDecoder().decode(a))}
async function freshToken(c){ /* refresh so the receiver gets a full-lifetime access token; refresh token stays here */
  try{var r=await c.auth.refreshSession();if(r.data&&r.data.session)return r.data.session.access_token}catch(x){}
  try{var g=await c.auth.getSession();return g.data.session?g.data.session.access_token:null}catch(x){return null}
}
$('sw').onclick=async function(){
  var b=this;b.disabled=true;
  var m=await freshToken(CM),s=await freshToken(CS);
  if(!m&&!s){b.disabled=false;setMsg('Sessiya tapılmadı, yenidən daxil olun.','err');return}
  location.assign(OTHER.u+'#sso='+b64u({v:1,m:m,s:s}));
  setTimeout(function(){b.disabled=false},4000);
};
async function receiveSSO(){
  var h=location.hash,p=h.indexOf('sso=');if(p<0)return;
  history.replaceState(null,'',location.pathname+location.search); /* drop tokens from URL at once */
  var o;try{o=unb64u(h.slice(p+4).split('&')[0])}catch(x){return}
  if(!o||o.v!==1)return;
  var pairs=[[sb,HOME==='s'?o.s:o.m],[sb2,HOME==='s'?o.m:o.s]];
  for(var i=0;i<pairs.length;i++){
    var c=pairs[i][0],t=pairs[i][1];if(typeof t!=='string'||t.length<20||t.length>6000)continue;
    try{
      var ex=await c.auth.getSession();if(ex.data&&ex.data.session)continue; /* already signed in here: keep the long-lived session */
      var r=await c.auth.setSession({access_token:t,refresh_token:'sso-no-refresh'}); /* validates token server-side; refresh token never shared */
      var em=r.data&&r.data.user&&r.data.user.email||'';
      if(r.error||!(await isAdmin(em.toLowerCase()))){await c.auth.signOut().catch(function(){})}
    }catch(x){}
  }
}

/* ---------- boot ---------- */
receiveSSO().then(function(){return sb.auth.getSession()}).then(function(r){if(!r.data.session)show(true)});
})();
