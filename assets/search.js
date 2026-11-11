var AR="٠١٢٣٤٥٦٧٨٩";
function ar(n){return String(n).replace(/\d/g,function(d){return AR[d]})}
function escHtml(s){return String(s).replace(/&/g,"&"+"amp;").replace(/</g,"&"+"lt;").replace(/>/g,"&"+"gt;")}
function west(s){return String(s).replace(/[٠-٩]/g,function(d){return AR.indexOf(d)}).replace(/[۰-۹]/g,function(d){return "۰۱۲۳۴۵۶۷۸۹".indexOf(d)})}
function norm(s){return String(s).replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ؤ/g,"و").replace(/ئ/g,"ي").replace(/ة/g,"ه").replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim()}
var BASE="/sahih-bukhari";
var kitabs=["بدء الوحي","كتاب الإيمان","كتاب العلم","كتاب الوضوء","كتاب الغسل","كتاب الحيض","كتاب التيمم","كتاب الصلاة","كتاب مواقيت الصلاة","كتاب الأذان","كتاب الجمعة","أبواب صلاة الخوف","كتاب العيدين","كتاب الوتر","كتاب الاستسقاء","كتاب الكسوف","أبواب سجود القرآن","أبواب تقصير الصلاة","أبواب التهجد","كتاب فضل الصلاة في مسجد مكة والمدينة","كتاب العمل في الصلاة","كتاب السهو","كتاب الجنائز","كتاب الزكاة","كتاب الحج","أبواب العمرة","أبواب المحصر وجزاء الصيد","فضائل المدينة","كتاب الصوم","كتاب صلاة التراويح","كتاب فضل ليلة القدر","أبواب الاعتكاف","كتاب البيوع","كتاب السلم","كتاب الشفعة","كتاب الإجارة","كتاب الحولات","كتاب الكفالة","كتاب الوكالة","كتاب الحرث والمزارعة","كتاب الشرب والمساقاة","كتاب في الاستقراض","كتاب الإشخاص والخصومات","كتاب في اللقطة","كتاب المظالم","كتاب الشركة","كتاب الرهن","كتاب العتق","كتاب المكاتب","كتاب الهبة وفضلها","كتاب الشهادات","كتاب الصلح","كتاب الشروط","كتاب الوصايا","كتاب الجهاد والسير","كتاب فرض الخمس","كتاب الجزية","كتاب بدء الخلق","كتاب أحاديث الأنبياء","كتاب المناقب","كتاب فضائل الصحابة","كتاب مناقب الأنصار","كتاب المغازي","كتاب تفسير القرآن","كتاب فضائل القرآن","كتاب النكاح","كتاب الطلاق","كتاب النفقات","كتاب الأطعمة","كتاب العقيقة","كتاب الذبائح والصيد","كتاب الأضاحي","كتاب الأشربة","كتاب المرضى","كتاب الطب","كتاب اللباس","كتاب الأدب","كتاب الاستئذان","كتاب الدعوات","كتاب الرقاق","كتاب القدر","كتاب الأيمان والنذور","كتاب كفارات الأيمان","كتاب الفرائض","كتاب الحدود وما يحذر من الحدود","كتاب الديات","كتاب استتابة المرتدين والمعاندين وقتالهم","كتاب الإكراه","كتاب الحيل","كتاب التعبير","كتاب الفتن","كتاب الأحكام","كتاب التمني","كتاب أخبار الآحاد","كتاب الاعتصام بالكتاب والسنة","كتاب التوحيد"];
var box=document.getElementById("results");
var status=document.getElementById("status");
var input=document.getElementById("qq");
function render(q){
  q=west(q).trim();
  if(!q){status.textContent="";box.innerHTML="";return}
  status.textContent="…";
  fetch(BASE+"/search-index.json").then(function(r){return r.json()}).then(function(rows){
    var hits=[];
    if(/^\d+$/.test(q)){
      var no=Number(q);
      for(var i=0;i<rows.length && hits.length<40;i++){if(rows[i][1]===no) hits.push(rows[i])}
    }else{
      var nq=norm(q);
      if(nq.length>=2){
        for(var j=0;j<rows.length && hits.length<40;j++){
          var row=rows[j];
          if(row[3].indexOf(nq)!==-1) hits.push(row);
        }
      }
    }
    status.textContent=hits.length?ar(hits.length)+" نتيجة"+(hits.length>=40?" — تُعرض أول أربعين":""):"لا يوجد حديث مطابق";
    box.innerHTML=hits.map(function(h){
      return '<li><a href="'+BASE+'/'+h[0]+'/'+h[1]+'/"><span class="hit-no">الحديث '+ar(h[1])+'</span><span class="hit-k">'+escHtml(h[4]||"")+'</span><span class="hit-s">'+escHtml(h[2])+'</span></a></li>';
    }).join("");
  });
}
var params=new URLSearchParams(location.search);
if(params.get("q")){input.value=params.get("q");render(params.get("q"))}
document.getElementById("sform").addEventListener("submit",function(e){
  e.preventDefault();
  var q=input.value;
  history.replaceState(null,"","?q="+encodeURIComponent(q));
  render(q);
});
