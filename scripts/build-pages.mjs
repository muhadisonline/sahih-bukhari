import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT = process.argv[2] || "/tmp/bukhari-pages";
const BASE = "/sahih-bukhari";
const ORIGIN = "https://muhadisonline.github.io";
const SITE = ORIGIN + BASE;

const kitabs = JSON.parse(read(join(ROOT, "src/data/bukhari/kitabs.json")));
const order = JSON.parse(read(join(ROOT, "src/data/bukhari/order.json")));
const indexOf = new Map(order.map((n, i) => [n, i]));

const shards = [];
for (let i = 0; i < 26; i++) {
  shards.push(JSON.parse(read(join(ROOT, `src/data/bukhari/shards/${i}.json`))));
}
const kitabPages = new Map();
for (const k of kitabs) {
  kitabPages.set(k.i, JSON.parse(read(join(ROOT, `src/data/bukhari/kitab/${k.i}.json`))));
}
const byNo = new Map();
for (const shard of shards) {
  for (const h of Object.values(shard)) byNo.set(h.no, h);
}

function read(path) {
  return readFileSync(path, "utf8");
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "assets"), { recursive: true });

const AR = "٠١٢٣٤٥٦٧٨٩";
const ar = (n) => String(n).replace(/\d/g, (d) => AR[Number(d)]);
const AMP = "&" + "amp;";
const LT = "&" + "lt;";
const GT = "&" + "gt;";
const QUOT = "&" + "quot;";
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, AMP)
    .replace(/</g, LT)
    .replace(/>/g, GT)
    .replace(/"/g, QUOT);
const href = (path) => `${BASE}${path}`;
const abs = (path) => `${SITE}${path}`;

function clip(s, n) {
  const t = String(s).replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…";
}
function shortTitle(text) {
  const i = text.indexOf("«");
  const j = i >= 0 ? text.indexOf("»", i + 1) : -1;
  let raw = i >= 0 && j > i ? text.slice(i + 1, j) : text;
  raw = raw
    .replace(/صلى الله عليه وسلم/g, "")
    .replace(/رضي الله عنها/g, "")
    .replace(/رضي الله عنهما/g, "")
    .replace(/رضي الله عنهم/g, "")
    .replace(/رضي الله عنهن/g, "")
    .replace(/رضي الله عنه/g, "")
    .replace(/عليه السلام/g, "");
  return clip(raw, 52);
}

function quoteOf(text) {
  const i = text.indexOf("«");
  const j = i >= 0 ? text.indexOf("»", i + 1) : -1;
  const raw = i >= 0 && j > i ? text.slice(i + 1, j) : text;
  return clip(raw, 72);
}

const css = `:root{--paper:#fbfbf9;--ink:#1c1915;--muted:#6f6a63;--line:#e4dfd6;--accent:#0f6b4c}
*{box-sizing:border-box}
html{background:var(--paper);color:var(--ink);font-size:15px}
html[data-size="1"]{font-size:17px}
html[data-size="2"]{font-size:19px}
html[data-size="3"]{font-size:21px}
body{margin:0;min-height:100vh;display:flex;flex-direction:column;font-family:"IBM Plex Sans Arabic","Noto Naskh Arabic",sans-serif;text-rendering:optimizeLegibility}
a{color:inherit;text-decoration:none}
button,input{font:inherit;color:inherit}
button{cursor:pointer}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.wrap{width:min(48rem,100%);margin-inline:auto;padding-inline:1.25rem}
header{position:sticky;top:0;z-index:10;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--paper) 94%,transparent);backdrop-filter:blur(8px)}
.bar{display:flex;align-items:center;gap:1rem;min-height:4.25rem}
.brand{display:flex;align-items:center;gap:.75rem}
.mark{width:2.25rem;height:2.25rem;display:grid;place-items:center;background:var(--accent);color:var(--paper);font-family:Amiri,serif;font-size:1.25rem}
.brand-name{font-family:Amiri,serif;font-size:1.15rem}
.set{position:relative;flex:none}
.gear{width:2.75rem;height:2.75rem;border:1px solid var(--line);background:transparent;display:grid;place-items:center;color:var(--ink)}
.set-panel{position:absolute;top:calc(100% + .45rem);inset-inline-end:0;z-index:20;background:var(--paper);border:1px solid var(--line);padding:.45rem .55rem;align-items:center;gap:.4rem;white-space:nowrap;font-size:.85rem}
.set-panel button{width:2.75rem;height:2.75rem;border:1px solid var(--line);background:transparent}
.search{margin-inline-start:auto;display:flex;gap:.5rem;width:min(22rem,100%)}
input{height:2.75rem;width:100%;border:1px solid var(--line);background:var(--paper);padding-inline:.75rem}
.btn{height:2.75rem;display:inline-flex;align-items:center;justify-content:center;background:var(--accent);color:var(--paper);border:0;padding-inline:1rem;white-space:nowrap}
.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}
.mobile-search{display:none;margin-inline-start:auto;color:var(--accent)}
main{flex:1;padding-block:2.5rem}
footer{border-top:1px solid var(--line);color:var(--muted);font-size:.875rem;line-height:2;padding-block:2rem}
.kicker{color:var(--accent);font-size:.875rem;margin:0}
h1{font-family:Amiri,serif;font-weight:400;line-height:1.45}
.title{font-size:2.15rem;margin:.5rem 0 0}
.lead{color:var(--muted);line-height:1.8;max-width:38rem}
.meta{font-size:.9rem}
.jump{margin-top:2rem;border:1px solid var(--line);padding:1rem;display:flex;gap:.75rem;align-items:end}
.jump label{flex:1;display:flex;flex-direction:column;gap:.5rem;font-size:.875rem}
h2.books-h{font-family:Amiri,serif;font-weight:400;font-size:1.4rem;margin:2.4rem 0 0}
ol.books{list-style:none;padding:0;margin:.4rem 0 0}
ol.books a{display:flex;gap:1rem;align-items:baseline;min-height:3.5rem;padding-block:.7rem;border-bottom:1px solid var(--line)}
.idx{width:2rem;flex:none;color:var(--muted);font-size:.875rem}
.name{font-family:Amiri,serif;font-size:1.12rem;line-height:1.65}
.count{margin-inline-start:auto;color:var(--muted);font-size:.875rem}
.crumbs{display:flex;flex-wrap:wrap;gap:.45rem;align-items:baseline;color:var(--muted);font-size:.875rem}
.crumbs a{color:var(--accent);font-family:Amiri,serif;font-size:1.15rem}
.basmala{text-align:center;font-family:Amiri,serif;font-size:1.45rem;margin:0}
.bab{margin:1rem 0 0;font-size:1.2rem}
.no{display:block;margin-bottom:.45rem;color:var(--accent);font-family:"IBM Plex Sans Arabic",sans-serif;font-size:.8rem}
.front{font-family:Amiri,serif;font-size:1.02rem;line-height:1.75;color:var(--muted)}
.matn{font-family:Amiri,serif;font-size:1.22rem;line-height:1.9;white-space:pre-wrap;margin-top:1.25rem}
.note{margin-top:2rem;border-top:1px solid var(--line);padding-top:1rem;color:var(--muted);font-size:.875rem;line-height:2}
.pager{margin-top:2.5rem;border-top:1px solid var(--line);padding-top:1.4rem;display:flex;justify-content:space-between;align-items:center;gap:.75rem}
.pager a{color:var(--accent);min-height:2.75rem;display:inline-flex;align-items:center}
.section{margin-top:0}
.six{list-style:none;padding:0;margin:1.2rem 0 0}
.six a{display:flex;gap:1rem;align-items:baseline;padding-block:.95rem;border-bottom:1px solid var(--line)}
.six .nm{font-family:Amiri,serif;font-size:1.45rem;line-height:1.5}
.six .au{display:block;margin-top:.15rem;color:var(--muted);font-size:.82rem}
.six .ct{margin-inline-start:auto;color:var(--muted);font-size:.85rem;white-space:nowrap}
.entry{display:flex;gap:.75rem;align-items:baseline;min-height:2.85rem;padding-block:.4rem;border-bottom:1px solid var(--line)}
.entry .n{width:2.5rem;flex:none;color:var(--accent);font-size:.85rem}
.entry .ttl{font-family:Amiri,serif;font-size:1.05rem;line-height:1.6}
.bab-label{margin:1.75rem 0 .35rem;color:var(--accent);font-family:Amiri,serif;font-size:1.15rem;line-height:1.7;font-weight:400;text-align:center}
.nums{display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}
.nums a{min-height:2.75rem;display:flex;align-items:center;justify-content:center;font-size:.9rem}
.nums a:hover{color:var(--accent)}
.hits{list-style:none;padding:0;margin:1rem 0 0}
.hits a{display:block;padding-block:1rem;border-bottom:1px solid var(--line)}
.hit-no{color:var(--accent);font-size:.875rem}
.hit-k{display:block;margin-top:.25rem;font-family:Amiri,serif;font-size:1.15rem;line-height:1.8}
.hit-s{display:block;margin-top:.35rem;font-family:Amiri,serif;font-size:1.05rem;line-height:1.9}
.sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}
::selection{background:#e7f3ed}
@media(max-width:640px){
  .search{display:none}
  .mobile-search{display:inline-flex}
  .jump{flex-direction:column;align-items:stretch}
  .title{font-size:1.85rem}
}
@media(min-width:640px){
  .nums{grid-template-columns:repeat(8,minmax(0,1fr))}
}`;

writeFileSync(join(OUT, "assets/site.css"), css);
cpSync(join(ROOT, "public/favicon.svg"), join(OUT, "favicon.svg"));
writeFileSync(join(OUT, ".nojekyll"), "");

const font =
  "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap";

function shell({ title, desc, path, body, extra = "" }) {
  const canonical = abs(path);
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="article">
<meta property="og:locale" content="ar_AR">
<meta property="og:url" content="${esc(canonical)}">
<meta name="theme-color" content="#fbfbf9">
<link rel="icon" href="${href("/favicon.svg")}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${font}">
<link rel="stylesheet" href="${href("/assets/site.css")}?v=7">
<script>try{var n=localStorage.getItem("bukhari-size");if(n)document.documentElement.setAttribute("data-size",n)}catch(e){}</script>
</head>
<body>
<header>
  <div class="wrap bar">
    <a class="brand" href="${href("/")}">
      <span class="mark">ك</span>
      <span class="brand-name">الكتب الستة</span>
    </a>
    <form class="search" action="${href("/axtar/")}" method="get" role="search">
      <label class="sr" for="q">بحث في الأحاديث</label>
      <input id="q" name="q" placeholder="رقم الحديث أو كلمة">
      <button class="btn" type="submit">بحث</button>
    </form>
    <a class="mobile-search" href="${href("/axtar/")}">بحث</a>
    <div class="set">
      <button class="gear" type="button" id="gear" aria-label="حجم الخط" aria-expanded="false">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/></svg>
      </button>
      <div class="set-panel" id="set-panel" style="display:none">
        <span>حجم الخط</span>
        <button type="button" id="size-down" aria-label="أصغر">−</button>
        <button type="button" id="size-up" aria-label="أكبر">+</button>
      </div>
    </div>
  </div>
</header>
<main class="wrap">
${body}
</main>
<footer>
  <p class="wrap">الكتب الستة. المتن بالعربية كما ورد في طبعاته، دون ترجمة.</p>
</footer>
<script>
(function () {
  var key = "bukhari-size";
  function get() {
    var n = Number(localStorage.getItem(key) || "0");
    return n >= 0 && n <= 3 ? n : 0;
  }
  function apply(n) {
    document.documentElement.setAttribute("data-size", String(n));
    localStorage.setItem(key, String(n));
  }
  var gear = document.getElementById("gear");
  var panel = document.getElementById("set-panel");
  gear.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = panel.style.display === "none";
    panel.style.display = open ? "flex" : "none";
    gear.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.addEventListener("click", function () {
    panel.style.display = "none";
    gear.setAttribute("aria-expanded", "false");
  });
  panel.addEventListener("click", function (e) { e.stopPropagation(); });
  document.getElementById("size-down").addEventListener("click", function () { apply(Math.max(0, get() - 1)); });
  document.getElementById("size-up").addEventListener("click", function () { apply(Math.min(3, get() + 1)); });
})();
</script>
${extra}
</body>
</html>
`;
}

function put(rel, html) {
  const file = join(OUT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const total = kitabs.reduce((n, k) => n + k.count, 0);
const homeDesc = "صحيح البخاري: ستة وتسعون كتابًا و٧٣٤٩ حديثًا. كل حديث في صفحة مستقلة. ترقيم محمد فؤاد عبد الباقي.";
put(
  "index.html",
  shell({
    title: "صحيح البخاري",
    desc: homeDesc,
    path: "/",
    body: `<p class="kicker">الكتب الستة</p>
<h1 class="title">صحيح البخاري</h1>
<p class="meta">${ar(kitabs.length)} كتابًا · ${ar(total)} حديثًا</p>
<h2 class="books-h">الكتب</h2>
<ol class="books">
${kitabs
  .map(
    (k) => `<li><a href="${href(`/buxari/kitab/${k.i}/`)}"><span class="idx">${ar(k.i)}</span><span class="name">${esc(k.short)}</span><span class="count">${ar(k.count)}</span></a></li>`,
  )
  .join("\n")}
</ol>`,
  }),
);

function hadithHtml(h) {
  const i = indexOf.get(h.no);
  const prev = i > 0 ? order[i - 1] : null;
  const next = i + 1 < order.length ? order[i + 1] : null;
  const quote = quoteOf(h.t);
  const title = `الحديث ${h.ar} — ${quote} | صحيح البخاري`;
  const desc = clip(`الحديث ${h.ar} من صحيح البخاري، ${h.k}، ${h.b}. ${h.t}`, 240);
  const front = (h.f || [])
    .map((item) => {
      if (item.kind === "basmala") return `<p class="basmala">${esc(item.text)}</p>`;
      if (item.kind === "kitab") return "";
      if (item.kind === "bab")
        return `<h1 class="bab"><span class="no">الحديث ${esc(h.ar)}</span>${esc(item.text)}</h1>`;
      return `<p class="front">${esc(item.text)}</p>`;
    })
    .join("\n");
  const babInFront = (h.f || []).some((item) => item.kind === "bab");
  const heading = babInFront
    ? ""
    : `<h1 class="bab"><span class="no">الحديث ${esc(h.ar)}</span>${esc(h.b)}</h1>`;
  const note =
    h.bg || h.g || h.s
      ? `<p class="note">${h.bg ? `ترقيم البغا ${esc(h.bg)}` : ""}${h.g ? `${h.bg ? " · " : ""}${esc(h.g)}` : ""}${h.s ? `<span style="display:block">${esc(h.s)}</span>` : ""}</p>`
      : "";
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    inLanguage: "ar",
    isPartOf: {
      "@type": "Book",
      name: "صحيح البخاري",
      inLanguage: "ar",
      author: { "@type": "Person", name: "محمد بن إسماعيل البخاري" },
    },
    position: h.no,
    articleBody: h.t,
  };
  return shell({
    title,
    desc,
    path: `/buxari/${h.no}/`,
    extra: `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`,
    body: `<nav class="crumbs" aria-label="المسار"><a href="${href("/buxari/")}">صحيح البخاري</a><span aria-hidden="true">/</span><a href="${href(`/buxari/kitab/${h.ki}/`)}">${esc(h.k)}</a></nav>
<article>
${front}
${heading}
<p class="matn" id="matn">${esc(h.t)}</p>
${note}
</article>
<nav class="pager" aria-label="الأحاديث المجاورة">
  ${prev ? `<a href="${href(`/buxari/${prev}/`)}">السابق</a>` : "<span></span>"}
  <button class="btn ghost" type="button" id="copy">انسخ المتن</button>
  ${next ? `<a href="${href(`/buxari/${next}/`)}">التالي</a>` : "<span></span>"}
</nav>
<script>
document.getElementById("copy").addEventListener("click", function () {
  var btn = this;
  navigator.clipboard.writeText(document.getElementById("matn").innerText).then(function () {
    btn.textContent = "تم النسخ";
    setTimeout(function () { btn.textContent = "انسخ المتن"; }, 1600);
  });
});
</script>`,
  });
}

const index = [];
let pages = 0;
for (const shard of shards) {
  for (const h of Object.values(shard)) {
    put(`buxari/${h.no}/index.html`, hadithHtml(h));
    index.push(["buxari", h.no, clip(h.t, 140), h.q, kitabs.find((k) => k.i === h.ki)?.short || ""]);
    pages++;
  }
}
index.sort((a, b) => a[0] - b[0]);
writeFileSync(join(OUT, "search-index.json"), JSON.stringify(index));

for (const k of kitabs) {
  const page = kitabPages.get(k.i);
  const title = `${k.title} — صحيح البخاري`;
  const desc = clip(`${k.title} من صحيح البخاري. ${k.count} حديثًا، من ${k.first} إلى ${k.last}.`, 220);
  const body = `<nav class="crumbs"><a href="${href("/")}">الكتب الستة</a></nav>
<h1 class="title" style="font-size:1.7rem">${esc(page.title)}</h1>
<p class="meta">${ar(page.count)} حديثًا</p>
${page.babs
  .map((bab) => {
    const rows = bab.nums
      .map((n) => {
        const h = byNo.get(n);
        const label = h ? shortTitle(h.t) : "";
        const num = h && h.ar ? h.ar : ar(n);
        return `<a class="entry" href="${href(`/buxari/${n}/`)}"><span class="n">${esc(num)}</span><span class="ttl">${esc(label)}</span></a>`;
      })
      .join("");
    return `<h2 class="bab-label">${esc(clip(bab.title, 80))}</h2>${rows}`;
  })
  .join("\n")}`;
  put(`buxari/kitab/${k.i}/index.html`, shell({ title, desc, path: `/buxari/kitab/${k.i}/`, body }));
}
put(
  "buxari/index.html",
  shell({
    title: "صحيح البخاري",
    desc: homeDesc,
    path: "/buxari/",
    body: `<p class="kicker">الكتب الستة</p>
<h1 class="title">صحيح البخاري</h1>
<p class="meta">${ar(kitabs.length)} كتابًا · ${ar(total)} حديثًا</p>
<h2 class="books-h">الكتب</h2>
<ol class="books">
${kitabs
  .map(
    (k) => `<li><a href="${href(`/buxari/kitab/${k.i}/`)}"><span class="idx">${ar(k.i)}</span><span class="name">${esc(k.short)}</span><span class="count">${ar(k.count)}</span></a></li>`,
  )
  .join("\n")}
</ol>`,
  }),
);

const searchJs = `var AR="٠١٢٣٤٥٦٧٨٩";
function ar(n){return String(n).replace(/\\d/g,function(d){return AR[d]})}
function escHtml(s){return String(s).replace(/&/g,"&"+"amp;").replace(/</g,"&"+"lt;").replace(/>/g,"&"+"gt;")}
function west(s){return String(s).replace(/[٠-٩]/g,function(d){return AR.indexOf(d)}).replace(/[۰-۹]/g,function(d){return "۰۱۲۳۴۵۶۷۸۹".indexOf(d)})}
function norm(s){return String(s).replace(/[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ؤ/g,"و").replace(/ئ/g,"ي").replace(/ة/g,"ه").replace(/[^\\p{L}\\p{N}\\s]/gu," ").replace(/\\s+/g," ").trim()}
var BASE=${JSON.stringify(BASE)};
var kitabs=${JSON.stringify(kitabs.map((k) => k.short))};
var box=document.getElementById("results");
var status=document.getElementById("status");
var input=document.getElementById("qq");
function render(q){
  q=west(q).trim();
  if(!q){status.textContent="";box.innerHTML="";return}
  status.textContent="…";
  fetch(BASE+"/search-index.json").then(function(r){return r.json()}).then(function(rows){
    var hits=[];
    if(/^\\d+$/.test(q)){
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
`;
writeFileSync(join(OUT, "assets/search.js"), searchJs);

put(
  "axtar/index.html",
  shell({
    title: "بحث — الكتب الستة",
    desc: "ابحث في الكتب الستة برقم الحديث أو بكلمة من المتن العربي.",
    path: "/axtar/",
    extra: `<script src="${href("/assets/search.js")}" defer></script>`,
    body: `<h1 class="title">البحث</h1>
<p class="lead">رقم الحديث، مثل ١، أو كلمة من المتن.</p>
<form class="jump" id="sform" role="search">
  <label>عبارة البحث<input id="qq" name="q" placeholder="إنما الأعمال أو ١"></label>
  <button class="btn" type="submit">بحث</button>
</form>
<p class="meta" id="status"></p>
<ul class="hits" id="results"></ul>`,
  }),
);

put(
  "404.html",
  shell({
    title: "الصفحة غير موجودة",
    desc: "هذا العنوان غير موجود.",
    path: "/404.html",
    body: `<h1 class="title">الصفحة غير موجودة</h1>
<p><a class="btn" href="${href("/")}">العودة إلى الكتب الستة</a></p>`,
  }),
);

const locs = [`${SITE}/`, ...kitabs.map((k) => `${SITE}/buxari/kitab/${k.i}/`), ...order.map((n) => `${SITE}/buxari/${n}/`)];
writeFileSync(
  join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    locs.map((loc) => `<url><loc>${loc}</loc></url>`).join("\n") +
    `\n</urlset>\n`,
);
writeFileSync(join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(JSON.stringify({ pages, kitabs: kitabs.length, out: OUT }));
