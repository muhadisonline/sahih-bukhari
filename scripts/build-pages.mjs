import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT = process.argv[2] || "/tmp/bukhari-pages";
const BASE = "/sahih-bukhari";
const ORIGIN = "https://muhadisonline.github.io";
const SITE = ORIGIN + BASE;

const BOOKS = [
  ["buxari", "صحيح البخاري"],
  ["muslim", "صحيح مسلم"],
  ["abudawud", "سنن أبي داود"],
  ["tirmidhi", "جامع الترمذي"],
  ["nasai", "سنن النسائي"],
  ["ibnmajah", "سنن ابن ماجه"],
  ["malik", "موطأ مالك"],
  ["darimi", "سنن الدارمي"],
  ["adab", "الأدب المفرد"],
  ["riyad", "رياض الصالحين"],
];
const bookName = Object.fromEntries(BOOKS);

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

const HOME_ONLY = process.argv.includes("--home");
if (!HOME_ONLY) rmSync(OUT, { recursive: true, force: true });
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
  let raw = text;
  const i = text.indexOf("«");
  const j = i >= 0 ? text.indexOf("»", i + 1) : -1;
  if (i >= 0 && j > i) raw = text.slice(i + 1, j);
  else {
    const a = text.indexOf('"');
    const b = a >= 0 ? text.indexOf('"', a + 1) : -1;
    if (a >= 0 && b > a) raw = text.slice(a + 1, b);
  }
  raw = raw
    .replace(/صلى الله عليه وسلم/g, "")
    .replace(/صلي الله عليه وسلم/g, "")
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
  if (i >= 0 && j > i) return clip(text.slice(i + 1, j), 72);
  const a = text.indexOf('"');
  const b = a >= 0 ? text.indexOf('"', a + 1) : -1;
  const raw = a >= 0 && b > a ? text.slice(a + 1, b) : text;
  return clip(raw, 72);
}

function fold(s) {
  return String(s)
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const css = `:root{--paper:#f7f5f2;--ink:#161513;--muted:#6e675f;--line:#e6e1d8;--accent:#16382c;--card:#ffffff}
*{box-sizing:border-box}
html{background:var(--paper);color:var(--ink);font-size:15px}
html[data-size="1"]{font-size:17px}
html[data-size="2"]{font-size:19px}
html[data-size="3"]{font-size:21px}
body{margin:0;min-height:100vh;display:flex;flex-direction:column;font-family:"IBM Plex Sans Arabic","Noto Naskh Arabic",sans-serif;text-rendering:optimizeLegibility}
a{color:inherit;text-decoration:none}
button,input{font:inherit;color:inherit}
button{cursor:pointer}
:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.wrap{width:min(48rem,100%);margin-inline:auto;padding-inline:1.25rem}
.wrap.wide{width:min(72rem,100%)}
header{position:sticky;top:0;z-index:10;color:var(--ink);background:rgba(247,245,242,.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.bar{display:flex;align-items:center;gap:1rem;min-height:4.25rem}
.brand{display:flex;align-items:center;gap:.75rem}
.mark{width:2.15rem;height:2.15rem;display:grid;place-items:center;background:var(--ink);color:var(--paper);font-family:Amiri,serif;font-size:1.15rem}
.brand-name{font-family:Amiri,serif;font-size:1.2rem}
.set{position:relative;flex:none}
.gear{width:2.75rem;height:2.75rem;border:1px solid var(--line);background:transparent;display:grid;place-items:center;color:var(--ink)}
.set-panel{position:absolute;top:calc(100% + .45rem);inset-inline-end:0;z-index:20;background:var(--paper);color:var(--ink);border:1px solid var(--line);padding:.45rem .55rem;align-items:center;gap:.4rem;white-space:nowrap;font-size:.85rem}
.set-panel button{width:2.75rem;height:2.75rem;border:1px solid var(--line);background:transparent;color:var(--ink)}
.search{margin-inline-start:auto;display:flex;gap:.5rem;width:min(22rem,100%)}
header .search input{background:transparent;color:var(--ink);border-color:var(--line)}
header .btn{background:var(--ink);color:var(--paper)}
input{height:2.75rem;width:100%;border:1px solid var(--line);background:transparent;padding-inline:.75rem}
.btn{height:2.75rem;display:inline-flex;align-items:center;justify-content:center;background:var(--ink);color:var(--paper);border:0;padding-inline:1rem;white-space:nowrap}
.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}
.mobile-search{display:none;margin-inline-start:auto;color:var(--ink)}
main{flex:1;padding-block:2.2rem 3rem}
footer{background:transparent;color:var(--muted);border-top:1px solid var(--line);font-size:.875rem;line-height:2;padding-block:1.6rem}
.kicker{color:var(--muted);font-size:.8rem;margin:0}
h1{font-family:Amiri,serif;font-weight:400;line-height:1.45}
.title{font-size:2.15rem;margin:.5rem 0 0}
.lead{color:var(--muted);line-height:1.8;max-width:38rem}
.meta{font-size:.9rem;color:var(--muted)}
.jump{margin-top:2rem;border:1px solid var(--line);background:transparent;padding:1rem;display:flex;gap:.75rem;align-items:end}
.jump label{flex:1;display:flex;flex-direction:column;gap:.5rem;font-size:.875rem}
.jump label.book{flex:0 1 16rem}
select{height:2.75rem;width:100%;border:1px solid var(--line);background:transparent;padding-inline:.6rem;color:var(--ink);font:inherit}
h2.books-h{font-family:Amiri,serif;font-weight:400;font-size:1.4rem;margin:2.4rem 0 0}
ol.books{list-style:none;padding:0;margin:.4rem 0 0}
ol.books a,ol.books .row{display:flex;gap:1rem;align-items:baseline;min-height:3.5rem;padding-block:.7rem;border-bottom:1px solid var(--line)}
ol.books a:hover .name{color:var(--accent)}
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
.entry:hover .ttl{color:var(--accent)}
.hero{padding-top:1.5rem}
.eyebrow{margin:0;color:var(--muted);font-size:.78rem}
.hero-title{font-family:Amiri,serif;font-weight:400;font-size:clamp(3.4rem,8vw,6.4rem);line-height:.92;margin:.35rem 0 0}
.deck{margin:.85rem 0 0;max-width:28rem;color:var(--muted);font-size:1rem;line-height:1.7}
.home-search{margin:1.7rem 0 0;display:flex;align-items:center;gap:.5rem;width:min(32rem,100%);border-bottom:1px solid var(--ink);background:transparent}
.home-search input{border:0;background:transparent;height:3rem;padding-inline:0}
.home-search .btn{background:transparent;color:var(--ink);padding-inline:.2rem}
.library{list-style:none;padding:0;margin:3.2rem 0 0;display:grid;grid-template-columns:1fr;gap:.7rem}
.volume{position:relative;display:flex;flex-direction:column;min-height:16rem;padding:1.3rem 1.3rem 1.2rem;overflow:hidden;background:#fff;border:1px solid rgba(22,21,19,.08);transition:background .18s ease,color .18s ease}
.vol-idx{position:absolute;top:-.35rem;inset-inline-end:.45rem;font-family:Amiri,serif;font-size:5.6rem;line-height:1;color:rgba(22,21,19,.07);pointer-events:none}
.vol-name{margin-top:auto;position:relative;font-family:Amiri,serif;font-size:2.05rem;line-height:1.25}
.vol-au{margin-top:.3rem;color:var(--muted);font-size:.82rem}
.vol-ct{margin-top:1.15rem;font-size:.8rem}
.volume:hover{background:#161513;color:#f7f5f2}
.volume:hover .vol-au,.volume:hover .vol-ct{color:rgba(247,245,242,.64)}
.volume:hover .vol-idx{color:rgba(247,245,242,.1)}
.foot nav{display:flex;flex-wrap:wrap;gap:.2rem 1.1rem}
.foot a:hover{color:var(--ink)}
.foot p{margin:.2rem 0 0;color:var(--muted)}
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
::selection{background:#e7e2da}
@media(max-width:640px){
  .search{display:none}
  .mobile-search{display:inline-flex}
  .jump{flex-direction:column;align-items:stretch}
  .title{font-size:1.85rem}
  .volume{min-height:13rem}
}
@media(min-width:640px){
  .nums{grid-template-columns:repeat(8,minmax(0,1fr))}
}
@media(min-width:900px){
  .library{grid-template-columns:1fr 1fr 1fr}
}
body.home{background:#f3eee6;color:#1c3f32}
body.home header{position:static;background:transparent;border:0;backdrop-filter:none;color:inherit}
body.home main{padding:0}
body.home footer{border:0;background:#143528;color:#f4efe6;padding:0}
body.home .gear{width:2.45rem;height:2.45rem;border-color:transparent;color:#f4efe6}
body.home .set-panel{color:#161513}
.mh{background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><g fill='none' stroke='%231c4536' stroke-opacity='.08' stroke-width='.7'><path d='M80 22l8 50 50 8-50 8-8 50-8-50-50-8 50-8z'/></g></svg>");background-size:180px 180px}
.mh-nav{width:min(68rem,calc(100% - 1.25rem));margin:.85rem auto 0;min-height:3.8rem;padding:.55rem .7rem;display:flex;align-items:center;gap:.25rem;background:#1c4536;color:#f6f1e7;border-radius:999px}
.mh-logo{font-family:"IBM Plex Sans Arabic",sans-serif;font-weight:600;font-size:1.35rem;line-height:1;padding-inline:.75rem .3rem;color:#f6f1e7;flex:none;white-space:nowrap}
.mh-links{display:flex;align-items:center;gap:.15rem;margin-inline-start:auto}
.mh-links a{display:inline-flex;align-items:center;gap:.4rem;padding:.4rem .55rem;color:#f6f1e7;font-size:.95rem;white-space:nowrap}
.mh-pill{background:#f4efe6;color:#1c3f32 !important;border-radius:999px;padding:.48rem .9rem !important}
.mh-hero{text-align:center;padding:2.6rem 1.1rem 0}
.mh-hero h1{margin:0;font-family:"IBM Plex Sans Arabic",sans-serif;font-weight:600;font-size:clamp(3.2rem,8vw,5.2rem);line-height:1.15;color:#1a3d30;white-space:nowrap}
.mh-sub{margin:.55rem 0 0;font-family:Amiri,serif;font-size:clamp(1.45rem,3vw,1.85rem);color:#1a3d30}
.mh-rule{display:flex;align-items:center;justify-content:center;gap:.7rem;margin:1rem auto 0;width:min(16rem,70%)}
.mh-rule i{flex:1;height:1px;background:#cfc6b8}
.mh-rule b{width:.42rem;height:.42rem;background:#1c4536;transform:rotate(45deg)}
.mh-lead{margin:.95rem auto 0;max-width:36rem;color:#3d4a43;font-size:1.05rem;line-height:1.8}
.mh-search{width:min(38rem,calc(100% - .5rem));margin:1.35rem auto 0;height:3.45rem;display:flex;align-items:center;gap:.55rem;padding-inline:.35rem 1.15rem;background:#fbf8f4;border:1px solid #efe8dc;border-radius:999px;box-shadow:0 10px 28px rgba(28,69,54,.06)}
.mh-search span{display:grid;place-items:center;width:2.4rem;height:2.4rem;color:#1c4536;flex:none}
.mh-search input{border:0;background:transparent;height:100%;width:auto;flex:1;min-width:0;padding:0;color:#1c3f32}
.mh-search input::placeholder{color:#9a9288}
.mh-daily{display:block;width:min(38rem,calc(100% - .5rem));margin:1rem auto 0;padding:.95rem 1.2rem 1.05rem;background:#faf6f0;border:1px solid #e7e0d4;border-radius:1.15rem;text-align:center}
.mh-daily .k{color:#1c4536;font-size:.82rem}
.mh-daily p{margin:.35rem 0 0;font-family:Amiri,serif;font-size:1.28rem;line-height:1.85;color:#1a3d30}
.mh-daily .m{display:block;margin-top:.35rem;color:#6e675f;font-size:.82rem}
.mh-sec{width:min(68rem,calc(100% - 1.5rem));margin:2.6rem auto 0}
.mh-h{display:flex;align-items:center;justify-content:center;gap:1rem;margin:0;font-family:Amiri,serif;font-weight:400;font-size:1.65rem;color:#1a3d30}
.mh-h:before,.mh-h:after{content:"";height:1px;width:min(7.5rem,16vw);background:#d5cdc0}
.mh-feats,.mh-cats,.mh-books{list-style:none;padding:0;margin:1.15rem 0 0;display:grid;gap:.8rem}
.mh-feats{grid-template-columns:1fr 1fr}
.mh-feats a,.mh-feats li,.mh-card{background:#faf7f2;border:1px solid #e8e1d6;border-radius:1.15rem;box-shadow:0 1px 0 rgba(28,63,50,.03)}
.mh-feat{min-height:8.5rem;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.75rem;text-align:center;padding:1rem;color:#1c3f32}
.mh-feat svg{color:#1c4536}
.mh-feat span{font-size:.98rem}
.mh-cats{grid-template-columns:1fr}
.mh-cat{display:flex;align-items:center;gap:.75rem;min-height:4.15rem;padding:.75rem 1rem;color:#1c3f32}
.mh-cat .chev{margin-inline-start:auto;color:#8a837a}
.mh-cat:hover{border-color:#cfc6b6}
.mh-books{grid-template-columns:1fr 1fr}
.mh-book{min-height:7.4rem;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.7rem;text-align:center;padding:.9rem .5rem;color:#1c3f32;font-family:Amiri,serif;font-size:1.2rem;line-height:1.45}
.mh-book:hover{border-color:#1c4536}
.mh-foot{padding:2.5rem 1rem 2.7rem;text-align:center}
.mh-foot p{margin:.85rem 0 0;font-family:Amiri,serif;font-size:1.4rem;color:#f6f1e7}
.mh-foot .mh-rule i{background:rgba(246,241,231,.55)}
.mh-foot .mh-rule b{background:#f6f1e7}
@media(max-width:760px){
  .mh-links .lbl{display:none}
  .mh-pill .lbl{display:inline}
  .mh-links a{padding-inline:.4rem}
}
@media(min-width:760px){
  .mh-feats{grid-template-columns:repeat(4,1fr)}
  .mh-cats{grid-template-columns:repeat(3,1fr)}
  .mh-books{grid-template-columns:repeat(5,1fr)}
}`;

writeFileSync(join(OUT, "assets/site.css"), css);
cpSync(join(ROOT, "src/data/daily.json"), join(OUT, "assets/daily.json"));
cpSync(join(ROOT, "public/favicon.svg"), join(OUT, "favicon.svg"));
writeFileSync(join(OUT, ".nojekyll"), "");

const font =
  "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap";

function shell({ title, desc, path, body, extra = "", wide = false, home = false }) {
  const canonical = abs(path);
  const svg = (d) =>
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">${d}</svg>`;
  const homeHead = `<header>
  <div class="mh-nav">
    <a class="mh-logo" href="${href("/")}">مُحَدِّث</a>
    <nav class="mh-links" aria-label="التنقل">
      <a href="${href("/axtar/")}" aria-label="بحث">${svg('<circle cx="11" cy="11" r="6.5"/><path d="M16 16.5 20 20.5"/>')}</a>
      <a href="${href("/axtar/")}"><span class="lbl">المواضيع</span>${svg('<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>')}</a>
      <a href="#kutub"><span class="lbl">كتب الحديث</span>${svg('<path d="M5 5.5h6.2A2.8 2.8 0 0 1 14 8.3V19a2.2 2.2 0 0 0-2.2-2.2H5z"/><path d="M19 5.5h-6.2A2.8 2.8 0 0 0 10 8.3V19a2.2 2.2 0 0 1 2.2-2.2H19z"/>')}</a>
      <a href="${href("/axtar/")}"><span class="lbl">الأحاديث</span>${svg('<path d="M6 4.5h9.5A2.5 2.5 0 0 1 18 7v12.5H8.2A2.2 2.2 0 0 0 6 21.7z"/><path d="M6 4.5v17"/>')}</a>
      <a class="mh-pill" href="${href("/")}"><span class="lbl">الرئيسية</span>${svg('<path d="M4 11.5 12 5l8 6.5"/><path d="M7 10.5V19h10v-8.5"/>')}</a>
    </nav>
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
</header>`;
  const homeFoot = `<footer>
  <div class="mh-foot">
    <div class="mh-rule" aria-hidden="true"><i></i><b></b><i></i></div>
    <p>السنة النبوية .. نور يهدي إلى الحق</p>
  </div>
</footer>`;
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
<meta name="theme-color" content="${home ? "#1c4536" : "#f7f5f2"}">
<link rel="icon" href="${href("/favicon.svg")}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${font}">
<link rel="stylesheet" href="${href("/assets/site.css")}?v=${home ? 12 : 11}">
<script>try{var n=localStorage.getItem("bukhari-size");if(n)document.documentElement.setAttribute("data-size",n)}catch(e){}</script>
</head>
<body${home ? ' class="home"' : ""}>
${home ? homeHead : `<header>
  <div class="wrap bar">
    <a class="brand" href="${href("/")}">
      <span class="mark">ك</span>
      <span class="brand-name">مكتبة الحديث</span>
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
</header>`}
<main class="${home ? "mh" : `wrap${wide ? " wide" : ""}`}">
${body}
</main>
${home ? homeFoot : `<footer>
  <div class="wrap foot">
    <nav>
      <a href="${href("/buxari/")}">البخاري</a>
      <a href="${href("/muslim/")}">مسلم</a>
      <a href="${href("/abudawud/")}">أبو داود</a>
      <a href="${href("/tirmidhi/")}">الترمذي</a>
      <a href="${href("/nasai/")}">النسائي</a>
      <a href="${href("/ibnmajah/")}">ابن ماجه</a>
      <a href="${href("/malik/")}">الموطأ</a>
      <a href="${href("/darimi/")}">الدارمي</a>
      <a href="${href("/adab/")}">الأدب المفرد</a>
      <a href="${href("/riyad/")}">رياض الصالحين</a>
    </nav>
    <p>المتن بالعربية كما ورد في طبعاته، دون ترجمة.</p>
  </div>
</footer>`}
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
const homeDesc = "مُحَدِّث: موسوعة الحديث النبوي. الكتب الستة، وموطأ مالك، والدارمي، والأدب المفرد، ورياض الصالحين.";
const bookIco = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 5h6.2A2.8 2.8 0 0 1 14 7.8V19a2.2 2.2 0 0 0-2.2-2.2H5z"/><path d="M19 5h-6.2A2.8 2.8 0 0 0 10 7.8V19a2.2 2.2 0 0 1 2.2-2.2H19z"/></svg>`;
const shieldIco = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 3.5 19 6.2v5.4c0 4.2-2.8 7.2-7 8.9-4.2-1.7-7-4.7-7-8.9V6.2z"/><path d="m8.8 12 2.1 2.1 4.3-4.4"/></svg>`;
const boltIco = `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>`;
const menuIco = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/></svg>`;
const gridIco = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="4" y="4" width="6.2" height="6.2" rx="1"/><rect x="13.8" y="4" width="6.2" height="6.2" rx="1"/><rect x="4" y="13.8" width="6.2" height="6.2" rx="1"/><rect x="13.8" y="13.8" width="6.2" height="6.2" rx="1"/></svg>`;
const alertIco = `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor"/><path d="M12 7.2v6" stroke="#f6f1e7" stroke-width="1.8"/><circle cx="12" cy="16.4" r="1" fill="#f6f1e7"/></svg>`;
const peopleIco = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="8" r="2.3"/><circle cx="16" cy="9" r="1.8"/><path d="M4.5 18.2c.4-2.6 2.4-4 4.6-4s4.2 1.4 4.6 4z"/><path d="M13.2 14.4c1.6-.2 3.4.7 4 3.4"/></svg>`;
const chev = `<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg>`;
const homeBooks = [
  ["/buxari/", "صحيح البخاري"],
  ["/muslim/", "صحيح مسلم"],
  ["/abudawud/", "سنن أبي داود"],
  ["/tirmidhi/", "جامع الترمذي"],
  ["/nasai/", "سنن النسائي"],
  ["/ibnmajah/", "سنن ابن ماجه"],
  ["/malik/", "موطأ مالك"],
  ["/darimi/", "سنن الدارمي"],
  ["/adab/", "الأدب المفرد"],
  ["/riyad/", "رياض الصالحين"],
];
put(
  "index.html",
  shell({
    title: "مُحَدِّث — موسوعة الحديث النبوي",
    desc: homeDesc,
    path: "/",
    home: true,
    extra: `<script>
(function(){
  var AR="٠١٢٣٤٥٦٧٨٩";
  function ar(n){return String(n).replace(/\\d/g,function(d){return AR[d]})}
  var now=new Date();
  var start=Date.UTC(now.getFullYear(),0,1);
  var day=Math.floor((Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())-start)/86400000);
  fetch(${JSON.stringify(href("/assets/daily.json"))}).then(function(r){return r.json()}).then(function(rows){
    if(!rows.length) return;
    var h=rows[day%rows.length];
    var a=document.getElementById("daily");
    a.href=${JSON.stringify(BASE)}+"/"+h[0]+"/"+h[1]+"/";
    document.getElementById("daily-text").textContent=h[2];
    document.getElementById("daily-meta").textContent=h[3]+" · الحديث "+ar(h[1]);
  });
})();
</script>`,
    body: `<section class="mh-hero">
<h1>مُحَدِّث</h1>
<p class="mh-sub">موسوعة الحديث النبوي</p>
<div class="mh-rule" aria-hidden="true"><i></i><b></b><i></i></div>
<p class="mh-lead">اقرأ الأحاديث النبوية، وابحث عنها، وتعرّف على مصادرها</p>
<form class="mh-search" action="${href("/axtar/")}" method="get" role="search">
  <label class="sr" for="hq">بحث في الأحاديث</label>
  <span aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6.5"/><path d="M16 16.5 20 20.5"/></svg></span>
  <input id="hq" name="q" placeholder="ابحث في الأحاديث النبوية ...">
</form>
<a class="mh-daily" id="daily" href="${href("/buxari/1/")}">
  <span class="k">حديث اليوم</span>
  <p id="daily-text">«إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ»</p>
  <span class="m" id="daily-meta">صحيح البخاري · الحديث ١</span>
</a>
</section>
<section class="mh-sec" aria-labelledby="feats">
<h2 class="mh-h" id="feats">مميزات مُحَدِّث</h2>
<ul class="mh-feats">
<li class="mh-feat">${boltIco}<span>سرعة في البحث</span></li>
<li class="mh-feat">${shieldIco}<span>محتوى موثوق</span></li>
<li class="mh-feat">${bookIco}<span>مصادر متنوعة</span></li>
<li class="mh-feat">${menuIco}<span>واجهة بسيطة</span></li>
</ul>
</section>
<section class="mh-sec" aria-labelledby="parts">
<h2 class="mh-h" id="parts">أقسام الموسوعة</h2>
<ul class="mh-cats">
<li><a class="mh-cat mh-card" href="#kutub">${bookIco}<span>كتب الحديث</span>${chev}</a></li>
<li><a class="mh-cat mh-card" href="#kutub">${shieldIco}<span>الأحاديث الصحيحة</span>${chev}</a></li>
<li><a class="mh-cat mh-card" href="${href("/axtar/")}">${alertIco}<span>الضعيفة</span>${chev}</a></li>
<li><a class="mh-cat mh-card" href="${href("/axtar/")}">${gridIco}<span>الموضوعات</span>${chev}</a></li>
<li><a class="mh-cat mh-card" href="${href("/axtar/")}">${peopleIco}<span>الصحابة والتابعين</span>${chev}</a></li>
<li><a class="mh-cat mh-card" href="${href("/axtar/")}">${bookIco}<span>مصطلح الحديث</span>${chev}</a></li>
</ul>
</section>
<section class="mh-sec" id="kutub" aria-labelledby="books">
<h2 class="mh-h" id="books">مؤلفات الحديث</h2>
<ul class="mh-books">
${homeBooks.map(([path, name]) => `<li><a class="mh-book mh-card" href="${href(path)}">${bookIco}<span>${name}</span></a></li>`).join("\n")}
</ul>
</section>`,
  }),
);
if (HOME_ONLY) {
  console.log(JSON.stringify({ home: true, out: OUT }));
  process.exit(0);
}

function hadithHtml(h, book) {
  const i = book.indexOf.get(h.no);
  const prev = i > 0 ? book.order[i - 1] : null;
  const next = i + 1 < book.order.length ? book.order[i + 1] : null;
  const quote = quoteOf(h.t);
  const title = `الحديث ${h.ar} — ${quote} | ${book.name}`;
  const desc = clip(`الحديث ${h.ar} من ${book.name}، ${h.k}، ${h.b}. ${h.t}`, 240);
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
      name: book.name,
      inLanguage: "ar",
      author: { "@type": "Person", name: book.author },
    },
    position: h.no,
    articleBody: h.t,
  };
  return shell({
    title,
    desc,
    path: `/${book.slug}/${h.no}/`,
    extra: `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`,
    body: `<nav class="crumbs" aria-label="المسار"><a href="${href(`/${book.slug}/`)}">${esc(book.name)}</a><span aria-hidden="true">/</span><a href="${href(`/${book.slug}/kitab/${h.ki}/`)}">${esc(h.k)}</a></nav>
<article>
${front}
${heading}
<p class="matn" id="matn">${esc(h.t)}</p>
${note}
</article>
<nav class="pager" aria-label="الأحاديث المجاورة">
  ${prev ? `<a href="${href(`/${book.slug}/${prev}/`)}">السابق</a>` : "<span></span>"}
  <button class="btn ghost" type="button" id="copy" data-cite="${esc(`${book.name} — الحديث ${h.ar}`)}" data-url="${esc(abs(`/${book.slug}/${h.no}/`))}">انسخ المتن</button>
  ${next ? `<a href="${href(`/${book.slug}/${next}/`)}">التالي</a>` : "<span></span>"}
</nav>
<script>
document.getElementById("copy").addEventListener("click", function () {
  var btn = this;
  var text = btn.getAttribute("data-cite") + "\\n" + btn.getAttribute("data-url") + "\\n\\n" + document.getElementById("matn").innerText;
  navigator.clipboard.writeText(text).then(function () {
    btn.textContent = "تم النسخ";
    setTimeout(function () { btn.textContent = "انسخ المتن"; }, 1600);
  });
});
</script>`,
  });
}

const bukhariBook = {
  slug: "buxari",
  name: "صحيح البخاري",
  author: "محمد بن إسماعيل البخاري",
  order,
  indexOf,
};
const index = [];
let pages = 0;
for (const shard of shards) {
  for (const h of Object.values(shard)) {
    put(`buxari/${h.no}/index.html`, hadithHtml(h, bukhariBook));
    index.push(["buxari", h.no, clip(h.t, 140), fold(h.q), kitabs.find((k) => k.i === h.ki)?.short || ""]);
    pages++;
  }
}

for (const k of kitabs) {
  const page = kitabPages.get(k.i);
  const title = `${k.title} — صحيح البخاري`;
  const desc = clip(`${k.title} من صحيح البخاري. ${k.count} حديثًا، من ${k.first} إلى ${k.last}.`, 220);
  const body = `<nav class="crumbs"><a href="${href("/")}">مكتبة الحديث</a></nav>
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
    body: `<nav class="crumbs"><a href="${href("/")}">مكتبة الحديث</a></nav>
<h1 class="title">صحيح البخاري</h1>
<p class="meta">محمد بن إسماعيل البخاري · ${ar(kitabs.length)} كتابًا · ${ar(total)} حديثًا</p>
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

function emitCollection(dir, book) {
  const list = JSON.parse(read(join(ROOT, `src/data/${dir}/kitabs.json`)));
  const bookOrder = JSON.parse(read(join(ROOT, `src/data/${dir}/order.json`)));
  const full = { ...book, order: bookOrder, indexOf: new Map(bookOrder.map((n, i) => [n, i])) };
  const byNo = new Map();
  for (let i = 0; ; i++) {
    let shard;
    try {
      shard = JSON.parse(read(join(ROOT, `src/data/${dir}/shards/${i}.json`)));
    } catch {
      break;
    }
    for (const h of Object.values(shard)) {
      byNo.set(h.no, h);
      put(`${book.slug}/${h.no}/index.html`, hadithHtml(h, full));
      index.push([book.slug, h.no, clip(h.t, 140), fold(h.q), list.find((k) => k.i === h.ki)?.short || ""]);
      pages++;
    }
  }
  for (const k of list) {
    const page = JSON.parse(read(join(ROOT, `src/data/${dir}/kitab/${k.i}.json`)));
    const title = `${k.title} — ${book.name}`;
    const desc = clip(`${k.title} من ${book.name}. ${k.count} حديثًا، من ${k.first} إلى ${k.last}.`, 220);
    const body = `<nav class="crumbs"><a href="${href("/")}">مكتبة الحديث</a></nav>
<h1 class="title" style="font-size:1.7rem">${esc(page.title)}</h1>
<p class="meta">${ar(page.count)} حديثًا</p>
${page.babs
  .map((bab) => {
    const rows = bab.nums
      .map((n) => {
        const h = byNo.get(n);
        const label = h ? shortTitle(h.t) : "";
        const num = h && h.ar ? h.ar : ar(n);
        return `<a class="entry" href="${href(`/${book.slug}/${n}/`)}"><span class="n">${esc(num)}</span><span class="ttl">${esc(label)}</span></a>`;
      })
      .join("");
    const head = bab.title ? `<h2 class="bab-label">${esc(clip(bab.title, 80))}</h2>` : "";
    return `${head}${rows}`;
  })
  .join("\n")}`;
    put(`${book.slug}/kitab/${k.i}/index.html`, shell({ title, desc, path: `/${book.slug}/kitab/${k.i}/`, body }));
  }
  const bookTotal = list.reduce((n, k) => n + k.count, 0);
  put(
    `${book.slug}/index.html`,
    shell({
      title: book.name,
      desc: `${book.name}: ${list.length} كتابًا و${bookTotal} حديثًا.`,
      path: `/${book.slug}/`,
      body: `<nav class="crumbs"><a href="${href("/")}">مكتبة الحديث</a></nav>
<h1 class="title">${esc(book.name)}</h1>
<p class="meta">${esc(book.author)} · ${ar(list.length)} كتابًا · ${ar(bookTotal)} حديثًا</p>
<h2 class="books-h">الكتب</h2>
<ol class="books">
${list
  .map(
    (k) => `<li><a href="${href(`/${book.slug}/kitab/${k.i}/`)}"><span class="idx">${ar(k.i)}</span><span class="name">${esc(k.short)}</span><span class="count">${ar(k.count)}</span></a></li>`,
  )
  .join("\n")}
</ol>`,
    }),
  );
  return { kitabs: list, order: bookOrder };
}

const muslim = emitCollection("muslim", { slug: "muslim", name: "صحيح مسلم", author: "مسلم بن الحجاج" });
const dawud = emitCollection("abudawud", { slug: "abudawud", name: "سنن أبي داود", author: "أبو داود السجستاني" });
const tirmidhi = emitCollection("tirmidhi", { slug: "tirmidhi", name: "جامع الترمذي", author: "محمد بن عيسى الترمذي" });
const nasai = emitCollection("nasai", { slug: "nasai", name: "سنن النسائي", author: "أحمد بن شعيب النسائي" });
const majah = emitCollection("ibnmajah", { slug: "ibnmajah", name: "سنن ابن ماجه", author: "محمد بن يزيد ابن ماجه" });
const malik = emitCollection("malik", { slug: "malik", name: "موطأ مالك", author: "مالك بن أنس، رواية يحيى بن يحيى الليثي" });
const darimi = emitCollection("darimi", { slug: "darimi", name: "سنن الدارمي", author: "عبد الله بن عبد الرحمن الدارمي" });
const adab = emitCollection("adab", { slug: "adab", name: "الأدب المفرد", author: "محمد بن إسماعيل البخاري" });
const riyad = emitCollection("riyad", { slug: "riyad", name: "رياض الصالحين", author: "يحيى بن شرف النووي" });
writeFileSync(join(OUT, "search-index.json"), JSON.stringify(index));

const searchJs = `var AR="٠١٢٣٤٥٦٧٨٩";
function ar(n){return String(n).replace(/\\d/g,function(d){return AR[d]})}
function escHtml(s){return String(s).replace(/&/g,"&"+"amp;").replace(/</g,"&"+"lt;").replace(/>/g,"&"+"gt;")}
function west(s){return String(s).replace(/[٠-٩]/g,function(d){return AR.indexOf(d)}).replace(/[۰-۹]/g,function(d){return "۰۱۲۳۴۵۶۷۸۹".indexOf(d)})}
function norm(s){return String(s).replace(/[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ؤ/g,"و").replace(/ئ/g,"ي").replace(/ة/g,"ه").replace(/[^\\p{L}\\p{N}\\s]/gu," ").replace(/\\s+/g," ").trim()}
var BASE=${JSON.stringify(BASE)};
var BOOKS=${JSON.stringify(bookName)};
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
    if(/^\\d+$/.test(q)){
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
      return '<li><a href="'+BASE+'/'+h[0]+'/'+h[1]+'/"><span class="hit-no">'+escHtml(BOOKS[h[0]]||"")+' · الحديث '+ar(h[1])+'</span><span class="hit-k">'+escHtml(h[4]||"")+'</span><span class="hit-s">'+escHtml(h[2])+'</span></a></li>';
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
`;
writeFileSync(join(OUT, "assets/search.js"), searchJs);

put(
  "axtar/index.html",
  shell({
    title: "بحث — مكتبة الحديث",
    desc: "ابحث في مكتبة الحديث برقم الحديث أو بكلمة من المتن العربي.",
    path: "/axtar/",
    extra: `<script src="${href("/assets/search.js")}?v=2" defer></script>`,
    body: `<h1 class="title">البحث</h1>
<p class="lead">رقم الحديث، مثل ١، أو كلمة من المتن.</p>
<form class="jump" id="sform" role="search">
  <label>عبارة البحث<input id="qq" name="q" placeholder="إنما الأعمال أو ١"></label>
  <label class="book">الكتاب<select id="book" name="book"><option value="">الكتب كلها</option>${BOOKS.map(([slug, name]) => `<option value="${slug}">${esc(name)}</option>`).join("")}</select></label>
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
<p><a class="btn" href="${href("/")}">العودة إلى مكتبة الحديث</a></p>`,
  }),
);

const locs = [
  `${SITE}/`,
  `${SITE}/buxari/`,
  `${SITE}/muslim/`,
  `${SITE}/abudawud/`,
  `${SITE}/tirmidhi/`,
  `${SITE}/nasai/`,
  `${SITE}/ibnmajah/`,
  `${SITE}/malik/`,
  `${SITE}/darimi/`,
  `${SITE}/adab/`,
  `${SITE}/riyad/`,
  ...kitabs.map((k) => `${SITE}/buxari/kitab/${k.i}/`),
  ...order.map((n) => `${SITE}/buxari/${n}/`),
  ...muslim.kitabs.map((k) => `${SITE}/muslim/kitab/${k.i}/`),
  ...muslim.order.map((n) => `${SITE}/muslim/${n}/`),
  ...dawud.kitabs.map((k) => `${SITE}/abudawud/kitab/${k.i}/`),
  ...dawud.order.map((n) => `${SITE}/abudawud/${n}/`),
  ...tirmidhi.kitabs.map((k) => `${SITE}/tirmidhi/kitab/${k.i}/`),
  ...tirmidhi.order.map((n) => `${SITE}/tirmidhi/${n}/`),
  ...nasai.kitabs.map((k) => `${SITE}/nasai/kitab/${k.i}/`),
  ...nasai.order.map((n) => `${SITE}/nasai/${n}/`),
  ...majah.kitabs.map((k) => `${SITE}/ibnmajah/kitab/${k.i}/`),
  ...majah.order.map((n) => `${SITE}/ibnmajah/${n}/`),
  ...malik.kitabs.map((k) => `${SITE}/malik/kitab/${k.i}/`),
  ...malik.order.map((n) => `${SITE}/malik/${n}/`),
  ...darimi.kitabs.map((k) => `${SITE}/darimi/kitab/${k.i}/`),
  ...darimi.order.map((n) => `${SITE}/darimi/${n}/`),
  ...adab.kitabs.map((k) => `${SITE}/adab/kitab/${k.i}/`),
  ...adab.order.map((n) => `${SITE}/adab/${n}/`),
  ...riyad.kitabs.map((k) => `${SITE}/riyad/kitab/${k.i}/`),
  ...riyad.order.map((n) => `${SITE}/riyad/${n}/`),
];
writeFileSync(
  join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    locs.map((loc) => `<url><loc>${loc}</loc></url>`).join("\n") +
    `\n</urlset>\n`,
);
writeFileSync(join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

const agentBooks = [
  { slug: "buxari", name: "صحيح البخاري", author: "محمد بن إسماعيل البخاري", kitabs, order },
  { slug: "muslim", name: "صحيح مسلم", author: "مسلم بن الحجاج", ...muslim },
  { slug: "abudawud", name: "سنن أبي داود", author: "أبو داود السجستاني", ...dawud },
  { slug: "tirmidhi", name: "جامع الترمذي", author: "محمد بن عيسى الترمذي", ...tirmidhi },
  { slug: "nasai", name: "سنن النسائي", author: "أحمد بن شعيب النسائي", ...nasai },
  { slug: "ibnmajah", name: "سنن ابن ماجه", author: "محمد بن يزيد ابن ماجه", ...majah },
  { slug: "malik", name: "موطأ مالك", author: "مالك بن أنس، رواية يحيى بن يحيى الليثي", ...malik },
  { slug: "darimi", name: "سنن الدارمي", author: "عبد الله بن عبد الرحمن الدارمي", ...darimi },
  { slug: "adab", name: "الأدب المفرد", author: "محمد بن إسماعيل البخاري", ...adab },
  { slug: "riyad", name: "رياض الصالحين", author: "يحيى بن شرف النووي", ...riyad },
];

function gapsOf(nums) {
  if (!nums.length) return 0;
  return nums[nums.length - 1] - nums[0] + 1 - nums.length;
}

for (const book of agentBooks) {
  const missing = gapsOf(book.order);
  const span = missing
    ? `${book.order.length} حديثًا، والأرقام من ${book.order[0]} إلى ${book.order[book.order.length - 1]}، والناقص منها بلا صفحة.`
    : `${book.order.length} حديثًا، مرقمة من ${book.order[0]} إلى ${book.order[book.order.length - 1]}.`;
  const lines = [
    `# ${book.name}`,
    "",
    `> ${book.name}، ${book.author}. ${span} ${book.kitabs.length} كتابًا.`,
    "",
    `صفحة الحديث: ${SITE}/${book.slug}/{number}/`,
    `صفحة الكتاب: ${SITE}/${book.slug}/kitab/{id}/`,
    "انقل المتن من الصفحة. لا تترجم، ولا تكمل رقمًا ناقصًا.",
    "",
    "## الكتب",
    "",
    ...book.kitabs.map(
      (k) =>
        `- [${k.short}](${SITE}/${book.slug}/kitab/${k.i}/): ${k.count} حديثًا، من ${k.first} إلى ${k.last}.`,
    ),
    "",
  ];
  writeFileSync(join(OUT, book.slug, "llms.txt"), lines.join("\n"));
}

const catalog = {
  name: "مكتبة الحديث",
  language: "ar",
  url: `${SITE}/`,
  hadith: `${SITE}/{slug}/{number}/`,
  kitab: `${SITE}/{slug}/kitab/{id}/`,
  search: `${SITE}/axtar/?q={query}`,
  index: {
    url: `${SITE}/search-index.json`,
    row: ["slug", "number", "excerpt", "unvocalized", "kitab"],
  },
  books: agentBooks.map((book) => ({
    slug: book.slug,
    name: book.name,
    author: book.author,
    hadiths: book.order.length,
    kitabs: book.kitabs.length,
    first: book.order[0],
    last: book.order[book.order.length - 1],
    gaps: gapsOf(book.order),
    url: `${SITE}/${book.slug}/`,
    llms: `${SITE}/${book.slug}/llms.txt`,
  })),
};
writeFileSync(join(OUT, "catalog.json"), JSON.stringify(catalog));

writeFileSync(
  join(OUT, "llms.txt"),
  [
    "# مكتبة الحديث",
    "",
    "> مكتبة حديث عربية. كل حديث في صفحة مستقلة: الرقم، والكتاب، والباب، والمتن. عشرة كتب، بلا ترجمة.",
    "",
    "خذ المتن من صفحة الحديث نفسها ولا تؤلّف نصًا. الرقم الذي لا صفحة له غير موجود في هذه الطبعة.",
    `الحديث: ${SITE}/{slug}/{number}/`,
    `الكتاب الداخلي: ${SITE}/{slug}/kitab/{id}/`,
    `البحث: ${SITE}/axtar/?q={query}`,
    "في كل صفحة حديث بيانات Article بصيغة JSON-LD.",
    "",
    "## الكتب",
    "",
    ...agentBooks.map(
      (book) =>
        `- [${book.name}](${SITE}/${book.slug}/llms.txt): ${book.author}. ${book.order.length} حديثًا في ${book.kitabs.length} كتابًا.`,
    ),
    "",
    "## Optional",
    "",
    `- [فهرس البحث](${SITE}/search-index.json): صفوف \`[slug, number, excerpt, unvocalized, kitab]\`.`,
    `- [وصف الكتب](${SITE}/catalog.json): بيانات الآلة للكتب والعناوين.`,
    `- [خريطة الموقع](${SITE}/sitemap.xml): كل الصفحات.`,
    "",
  ].join("\n"),
);

console.log(JSON.stringify({ pages, kitabs: kitabs.length, out: OUT }));
