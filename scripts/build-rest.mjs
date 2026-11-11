import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { brotliDecompressSync } from "node:zlib";

const OUT = process.argv[2] || "/tmp/bukhari-pages";
const BASE = "/sahih-bukhari";
const ORIGIN = "https://muhadisonline.github.io";
const SITE = ORIGIN + BASE;
const RAW = "https://raw.githubusercontent.com/mmuxax-bot/mektebe/main/api/_hadith/books";

const BOOKS = [
  { id: "1727", shards: 25, slug: "muslim", name: "صحيح مسلم", author: "مسلم بن الحجاج", edition: "ترقيم محمد فؤاد عبد الباقي، القاهرة ١٣٧٤هـ." },
  { id: "117359", shards: 18, slug: "abudawud", name: "سنن أبي داود", author: "أبو داود السجستاني", edition: "دار الرسالة، تحقيق شعيب الأرنؤوط، ١٤٣٠هـ." },
  { id: "1363", shards: 15, slug: "tirmidhi", name: "جامع الترمذي", author: "محمد بن عيسى الترمذي", edition: "دار الرسالة، تحقيق شعيب الأرنؤوط وآخرين، ١٤٣٠هـ." },
  { id: "1339", shards: 20, slug: "nasai", name: "سنن النسائي", author: "أحمد بن شعيب النسائي", edition: "دار الرسالة، ١٤٣٩هـ. ترقيم عبد الفتاح أبو غدة." },
  { id: "1194", shards: 15, slug: "ibnmajah", name: "سنن ابن ماجه", author: "محمد بن يزيد ابن ماجه", edition: "تحقيق عصام موسى هادي، ١٤٣٥هـ. ترقيم محمد فؤاد عبد الباقي." },
];

const AR = "٠١٢٣٤٥٦٧٨٩";
const ar = (n) => String(n).replace(/\d/g, (d) => AR[Number(d)]);
const AMP = "&" + "amp;";
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, AMP)
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
const href = (path) => `${BASE}${path}`;
const abs = (path) => `${SITE}${path}`;

function clip(s, n) {
  const t = String(s).replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…";
}
function plain(s) {
  return String(s)
    .replace(/\uFDFA/g, "صلى الله عليه وسلم")
    .replace(/\uFDFB/g, "جل جلاله")
    .replace(/\uFDFF/g, "صلى الله عليه وسلم")
    .replace(/\uFD40/g, "رحمه الله")
    .replace(/\uFD41/g, "رضي الله عنه")
    .replace(/\uFD42/g, "رضي الله عنها")
    .replace(/\uFD43/g, "رضي الله عنهما")
    .replace(/\uFD44/g, "رضي الله عنهم")
    .replace(/\uFD45/g, "رضي الله عنهن")
    .replace(/\uFD47/g, "عليه السلام")
    .replace(/\uFD48/g, "عليهما السلام")
    .replace(/\uFD49/g, "عليهم السلام")
    .replace(/\uFD4A/g, "عليه الصلاة والسلام")
    .replace(/\uFD4D/g, "عز وجل")
    .replace(/\uFD4E/g, "جل جلاله");
}
function shortTitle(text) {
  let raw = plain(text);
  const marks = [
    ["«", "»"],
    ["“", "”"],
    ['"', '"'],
  ];
  for (const [a, b] of marks) {
    const i = raw.indexOf(a);
    const j = i >= 0 ? raw.indexOf(b, i + 1) : -1;
    if (i >= 0 && j > i + 8) {
      raw = raw.slice(i + 1, j);
      break;
    }
  }
  raw = raw.replace(/صلى الله عليه وسلم/g, "").replace(/رضي الله عنه[ماهن]*/g, "");
  return clip(raw, 52);
}
function norm(s) {
  return plain(s)
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

const font =
  "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap";

function shell({ title, desc, path, body, extra = "" }) {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(abs(path))}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="article">
<meta property="og:locale" content="ar_AR">
<meta property="og:url" content="${esc(abs(path))}">
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
  function get() { var n = Number(localStorage.getItem(key) || "0"); return n >= 0 && n <= 3 ? n : 0; }
  function apply(n) { document.documentElement.setAttribute("data-size", String(n)); localStorage.setItem(key, String(n)); }
  var gear = document.getElementById("gear");
  var panel = document.getElementById("set-panel");
  gear.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = panel.style.display === "none";
    panel.style.display = open ? "flex" : "none";
    gear.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.addEventListener("click", function () { panel.style.display = "none"; gear.setAttribute("aria-expanded", "false"); });
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

async function pool(items, limit, fn) {
  const q = items.slice();
  const workers = Array.from({ length: limit }, async () => {
    while (q.length) await fn(q.shift());
  });
  await Promise.all(workers);
}

async function loadBook(book) {
  const parts = new Array(book.shards);
  await pool(
    Array.from({ length: book.shards }, (_, i) => i),
    6,
    async (i) => {
      const url = `${RAW}/h${book.id}_${i}.js`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${url} ${res.status}`);
      const js = await res.text();
      const b64 = js.match(/export default "([^"]+)"/)[1];
      parts[i] = JSON.parse(brotliDecompressSync(Buffer.from(b64, "base64")).toString("utf8"));
    },
  );
  return parts.flat();
}

function hadithPage(book, h, prev, next) {
  const quote = shortTitle(h.t);
  const title = `الحديث ${h.ar} — ${quote} | ${book.name}`;
  const desc = clip(`الحديث ${h.ar} من ${book.name}، ${h.k}، ${h.b}. ${h.t}`, 240);
  const front = (h.f || [])
    .map((item) => {
      if (item.kind === "basmala") return `<p class="basmala">${esc(item.text)}</p>`;
      if (item.kind === "kitab") return "";
      if (item.kind === "bab") return `<h1 class="bab"><span class="no">الحديث ${esc(h.ar)}</span>${esc(item.text)}</h1>`;
      return `<p class="front">${esc(item.text)}</p>`;
    })
    .join("\n");
  const babInFront = (h.f || []).some((item) => item.kind === "bab");
  const heading = babInFront ? "" : `<h1 class="bab"><span class="no">الحديث ${esc(h.ar)}</span>${esc(h.b)}</h1>`;
  const grade = h.grade ? `<p class="note">${esc(h.grade)}</p>` : `<p class="note">${esc(book.edition)}</p>`;
  return shell({
    title,
    desc,
    path: `/${book.slug}/${h.no}/`,
    body: `<nav class="crumbs"><a href="${href(`/${book.slug}/`)}">${esc(book.name)}</a><span>/</span><a href="${href(`/${book.slug}/kitab/${h.ki}/`)}">${esc(clip(h.k, 80))}</a></nav>
<article>
${front}
${heading}
<p class="matn" id="matn">${esc(h.t)}</p>
${grade}
</article>
<nav class="pager">
  ${prev ? `<a href="${href(`/${book.slug}/${prev}/`)}">السابق</a>` : "<span></span>"}
  <button class="btn ghost" type="button" id="copy">انسخ المتن</button>
  ${next ? `<a href="${href(`/${book.slug}/${next}/`)}">التالي</a>` : "<span></span>"}
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

const extraRows = [];
const counts = [{ slug: "buxari", name: "صحيح البخاري", author: "محمد بن إسماعيل البخاري", books: 96, hadith: 7349 }];
const siteUrls = [];

for (const book of BOOKS) {
  const rows = await loadBook(book);
  const hadiths = [];
  const seen = new Set();
  for (const row of rows) {
    const no = Number(row[3]);
    if (!Number.isInteger(no) || no < 1 || seen.has(no)) continue;
    seen.add(no);
    const meta = row[7] && typeof row[7] === "object" ? row[7] : {};
    const f = Array.isArray(meta.f) ? meta.f.map((pair) => ({ kind: pair[0], text: plain(pair[1]) })) : [];
    hadiths.push({
      no,
      ar: ar(no),
      k: plain(row[0] || book.name),
      b: plain(row[1] || ""),
      t: plain(row[5] || ""),
      grade: plain(row[4] || ""),
      f,
    });
  }
  const kitabs = [];
  let cur = null;
  let bab = null;
  for (const h of hadiths) {
    if (!cur || cur.title !== h.k) {
      cur = { i: kitabs.length + 1, title: h.k, babs: [], count: 0 };
      kitabs.push(cur);
      bab = null;
    }
    if (!bab || bab.title !== h.b) {
      bab = { title: h.b, items: [] };
      cur.babs.push(bab);
    }
    h.ki = cur.i;
    bab.items.push(h);
    cur.count++;
  }
  let pages = 0;
  for (let i = 0; i < hadiths.length; i++) {
    const h = hadiths[i];
    const prev = i > 0 ? hadiths[i - 1].no : null;
    const next = i + 1 < hadiths.length ? hadiths[i + 1].no : null;
    put(`${book.slug}/${h.no}/index.html`, hadithPage(book, h, prev, next));
    extraRows.push([book.slug, h.no, clip(h.t, 140), norm(h.t), clip(h.k, 80)]);
    siteUrls.push(`${SITE}/${book.slug}/${h.no}/`);
    pages++;
  }
  put(
    `${book.slug}/index.html`,
    shell({
      title: book.name,
      desc: clip(`${book.name}. ${kitabs.length} كتابًا و${pages} حديثًا.`, 220),
      path: `/${book.slug}/`,
      body: `<nav class="crumbs"><a href="${href("/")}">الكتب الستة</a></nav>
<h1 class="title" style="font-size:2.1rem">${esc(book.name)}</h1>
<p class="meta">${esc(book.author)} · ${ar(kitabs.length)} كتابًا · ${ar(pages)} حديثًا</p>
<ol class="books">
${kitabs
  .map(
    (k) =>
      `<li><a href="${href(`/${book.slug}/kitab/${k.i}/`)}"><span class="idx">${ar(k.i)}</span><span class="name">${esc(clip(k.title, 90))}</span><span class="count">${ar(k.count)}</span></a></li>`,
  )
  .join("\n")}
</ol>`,
    }),
  );
  siteUrls.push(`${SITE}/${book.slug}/`);
  for (const k of kitabs) {
    const body = `<nav class="crumbs"><a href="${href("/")}">الكتب الستة</a><span>/</span><a href="${href(`/${book.slug}/`)}">${esc(book.name)}</a></nav>
<h1 class="title" style="font-size:1.7rem">${esc(clip(k.title, 120))}</h1>
<p class="meta">${ar(k.count)} حديثًا</p>
${k.babs
  .map((bab) => {
    const lines = bab.items
      .map(
        (h) =>
          `<a class="entry" href="${href(`/${book.slug}/${h.no}/`)}"><span class="n">${esc(h.ar)}</span><span class="ttl">${esc(shortTitle(h.t))}</span></a>`,
      )
      .join("");
    return `<h2 class="bab-label">${esc(clip(bab.title, 90))}</h2>${lines}`;
  })
  .join("\n")}`;
    put(
      `${book.slug}/kitab/${k.i}/index.html`,
      shell({
        title: `${clip(k.title, 80)} — ${book.name}`,
        desc: clip(`${k.title} من ${book.name}. ${k.count} حديثًا.`, 220),
        path: `/${book.slug}/kitab/${k.i}/`,
        body,
      }),
    );
    siteUrls.push(`${SITE}/${book.slug}/kitab/${k.i}/`);
  }
  counts.push({ slug: book.slug, name: book.name, author: book.author, books: kitabs.length, hadith: pages });
  console.log(book.slug, pages, "kitabs", kitabs.length);
}

const indexPath = join(OUT, "search-index.json");
const prev = JSON.parse(readFileSync(indexPath, "utf8"));
writeFileSync(indexPath, JSON.stringify(prev.concat(extraRows)));

put(
  "index.html",
  shell({
    title: "الكتب الستة",
    desc: "صحيح البخاري وصحيح مسلم وسنن أبي داود وجامع الترمذي وسنن النسائي وسنن ابن ماجه. كل حديث في صفحة.",
    path: "/",
    body: `<p class="kicker">مكتبة الحديث</p>
<h1 class="title">الكتب الستة</h1>
<ol class="six">
${counts
  .map(
    (b) => `<li><a href="${href(`/${b.slug}/`)}"><span><span class="nm">${esc(b.name)}</span><span class="au">${esc(b.author)}</span></span><span class="ct">${ar(b.hadith)} حديثًا</span></a></li>`,
  )
  .join("\n")}
</ol>`,
  }),
);

const mapPath = join(OUT, "sitemap.xml");
let xml = readFileSync(mapPath, "utf8");
const extra = siteUrls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n");
xml = xml.replace("</urlset>", `${extra}\n</urlset>\n`);
writeFileSync(mapPath, xml);
console.log(JSON.stringify(counts));
