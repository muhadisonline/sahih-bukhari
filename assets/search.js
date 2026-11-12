var AR="٠١٢٣٤٥٦٧٨٩";
function ar(n){return String(n).replace(/\d/g,function(d){return AR[d]})}
function escHtml(s){return String(s).replace(/&/g,"&"+"amp;").replace(/</g,"&"+"lt;").replace(/>/g,"&"+"gt;")}
function west(s){return String(s).replace(/[٠-٩]/g,function(d){return AR.indexOf(d)}).replace(/[۰-۹]/g,function(d){return "۰۱۲۳۴۵۶۷۸۹".indexOf(d)})}
function norm(s){return String(s).replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ؤ/g,"و").replace(/ئ/g,"ي").replace(/ة/g,"ه").replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim()}
var BASE="";
var BOOKS={"buxari":"صحيح البخاري","muslim":"صحيح مسلم","abudawud":"سنن أبي داود","tirmidhi":"جامع الترمذي","nasai":"سنن النسائي","ibnmajah":"سنن ابن ماجه","malik":"موطأ مالك","darimi":"سنن الدارمي","adab":"الأدب المفرد","riyad":"رياض الصالحين"};
var box=document.getElementById("results");
var status=document.getElementById("status");
var input=document.getElementById("qq");
var bookSel=document.getElementById("book");
function wanted(row){return !bookSel.value || row[0]===bookSel.value}
function address(){
  var q=input.value;
  var slug=bookSel.value;
  return "?q="+encodeURIComponent(q)+(slug?"&book="+encodeURIComponent(slug):"");
}
function render(q){
  q=west(q).trim();
  if(!q){status.textContent="";box.innerHTML="";return}
  status.textContent="…";
  fetch(BASE+"/search-index.json?v=2").then(function(r){return r.json()}).then(function(rows){
    var hits=[];
    if(/^\d+$/.test(q)){
      var no=Number(q);
      for(var i=0;i<rows.length && hits.length<40;i++){if(rows[i][1]===no && wanted(rows[i])) hits.push(rows[i])}
    }else{
      var nq=norm(q);
      if(nq.length>=2){
        for(var j=0;j<rows.length && hits.length<40;j++){
          var row=rows[j];
          if(wanted(row) && row[3].indexOf(nq)!==-1) hits.push(row);
        }
      }
    }
    status.textContent=hits.length?ar(hits.length)+" نتيجة"+(hits.length>=40?" — تُعرض أول أربعين":""):"لا يوجد حديث مطابق";
    box.innerHTML=hits.map(function(h){
      var href=h[0]==="buxari"?"https://muhadisonline.github.io/buxari/"+h[1]+"/":BASE+"/"+h[0]+"/"+h[1]+"/";
      return '<li><a href="'+href+'"><span class="hit-no">'+escHtml(BOOKS[h[0]]||"")+' · الحديث '+ar(h[1])+'</span><span class="hit-k">'+escHtml(h[4]||"")+'</span><span class="hit-s">'+escHtml(h[2])+'</span></a></li>';
    }).join("");
  });
}
var params=new URLSearchParams(location.search);
if(params.get("book")) bookSel.value=params.get("book");
if(params.get("q")){input.value=params.get("q");render(params.get("q"))}
document.getElementById("sform").addEventListener("submit",function(e){
  e.preventDefault();
  history.replaceState(null,"",address());
  render(input.value);
});
bookSel.addEventListener("change",function(){
  history.replaceState(null,"",address());
  render(input.value);
});
