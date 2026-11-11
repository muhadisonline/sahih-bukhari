import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { brotliDecompressSync } from "node:zlib";
import { join } from "node:path";

const id = process.argv[2] || "1727";
const slug = process.argv[3] || "muslim";
const SRC = process.argv[4] || "/tmp/hd/books";
const OUT = new URL(`../src/data/${slug}/`, import.meta.url).pathname;

const AR = "٠١٢٣٤٥٦٧٨٩";
const ar = (n) => String(n).replace(/\d/g, (d) => AR[Number(d)]);

function expand(s) {
  return String(s)
    .replace(/\uFDFA/g, "صلى الله عليه وسلم")
    .replace(/\uFDFB/g, "جل جلاله")
    .replace(/\uFDFD/g, "بسم الله الرحمن الرحيم")
    .replace(/\uFD40/g, "رحمه الله")
    .replace(/\uFD41/g, "رضي الله عنه")
    .replace(/\uFD42/g, "رضي الله عنها")
    .replace(/\uFD43/g, "رضي الله عنهما")
    .replace(/\uFD44/g, "رضي الله عنهم")
    .replace(/\uFD45/g, "رضي الله عنهن")
    .replace(/\uFD47/g, "عليه السلام")
    .replace(/\uFD48/g, "عليهما السلام")
    .replace(/\uFD49/g, "عليهم السلام")
    .replace(/\uFD4A/g, "عليه الصلاة والسلام");
}

function plain(s) {
  return expand(s)
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function norm(s) {
  let t = plain(s)
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه");
  let out = "";
  for (const ch of t) {
    if (ch === " " || /\p{L}|\p{N}/u.test(ch)) out += ch;
    else out += " ";
  }
  return out.replace(/\s+/g, " ").trim();
}

const rows = [];
for (const name of readdirSync(SRC).filter((f) => new RegExp(`^h${id}_\\d+\\.js$`).test(f)).sort((a, b) => Number(a.split("_")[1]) - Number(b.split("_")[1]))) {
  const src = readFileSync(join(SRC, name), "utf8");
  const b64 = src.match(/"([A-Za-z0-9+/=]+)"/)[1];
  rows.push(...JSON.parse(brotliDecompressSync(Buffer.from(b64, "base64")).toString("utf8")));
}

const groups = new Map();
for (const r of rows) {
  if (!groups.has(r[3])) groups.set(r[3], []);
  groups.get(r[3]).push(r);
}
const nums = [...groups.keys()].sort((a, b) => a - b);

const kitabs = [];
let cur = null;
let bab = null;
const records = [];

for (const no of nums) {
  const list = groups.get(no);
  const r = list[0];
  const title = plain(r[0] || "كتاب");
  const babTitle = plain(r[1] || "");
  if (!cur || cur.title !== title) {
    cur = { i: kitabs.length + 1, title, short: title, first: no, last: no, count: 0, babs: [] };
    kitabs.push(cur);
    bab = null;
  }
  if (!bab || bab.title !== babTitle) {
    bab = { title: babTitle, first: no, last: no, nums: [] };
    cur.babs.push(bab);
  }
  bab.last = no;
  bab.nums.push(no);
  cur.last = no;
  cur.count++;

  const seen = new Set();
  const texts = [];
  for (const row of list) {
    const t = expand(String(row[5] || "")).replace(/\s+\n/g, "\n").trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    texts.push(t);
  }
  const f = [];
  const meta = r[7] && r[7].f;
  if (Array.isArray(meta)) {
    for (const item of meta) {
      if (!item || !item[1]) continue;
      const kind = item[0] === "basmala" || item[0] === "bab" || item[0] === "kitab" || item[0] === "text" ? item[0] : "text";
      if (kind === "text" && item[1].length > 4000) continue;
      f.push({ kind, text: expand(item[1]).trim() });
    }
  }
  records.push({
    no,
    ar: ar(no),
    ki: cur.i,
    bi: cur.babs.length,
    k: title,
    b: babTitle,
    t: texts.join("\n\n"),
    q: norm(texts.join(" ")),
    f,
    g: expand(String(r[4] || "")).trim(),
  });
}

mkdirSync(join(OUT, "shards"), { recursive: true });
mkdirSync(join(OUT, "kitab"), { recursive: true });
const SHARD = 300;
const maxNo = nums[nums.length - 1];
const shardCount = Math.ceil(maxNo / SHARD);
for (let s = 0; s < shardCount; s++) {
  const part = {};
  for (const rec of records) if (Math.floor((rec.no - 1) / SHARD) === s) part[rec.no] = rec;
  if (!Object.keys(part).length) continue;
  writeFileSync(join(OUT, "shards", `${s}.json`), JSON.stringify(part));
}
const shards = shardCount;
for (const k of kitabs) writeFileSync(join(OUT, "kitab", `${k.i}.json`), JSON.stringify(k));
writeFileSync(join(OUT, "kitabs.json"), JSON.stringify(kitabs.map(({ babs, ...k }) => k)));
writeFileSync(join(OUT, "order.json"), JSON.stringify(nums));
const ids = Array.from({ length: shards }, (_, i) => i);
const shardLines = ids.map((i) => `  ${i}: () => import("./shards/${i}.json"),`).join("\n");
const kitabLines = kitabs.map((k) => `  ${k.i}: () => import("./kitab/${k.i}.json"),`).join("\n");
writeFileSync(
  join(OUT, "loaders.ts"),
  `// Generated from Shamela ${id} (${slug}). Do not edit.
export const SHARD_IDS = [${ids.join(",")}] as const;
export const shardLoaders: Record<number, () => Promise<{ default: Record<string, unknown> }>> = {
${shardLines}
};
export const kitabLoaders: Record<number, () => Promise<{ default: unknown }>> = {
${kitabLines}
};
`,
);
console.log(JSON.stringify({ hadiths: records.length, kitabs: kitabs.length, shards, first: kitabs[0].title, last: kitabs.at(-1).title }));
