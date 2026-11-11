import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { brotliDecompressSync } from "node:zlib";
import { join } from "node:path";

const SRC = "/tmp/hd/books";
const OUT = new URL("../src/data/muslim/", import.meta.url).pathname;

const AR = "٠١٢٣٤٥٦٧٨٩";
const ar = (n) => String(n).replace(/\d/g, (d) => AR[Number(d)]);

function plain(s) {
  return String(s)
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
for (const name of readdirSync(SRC).filter((f) => /^h1727_\d+\.js$/.test(f)).sort((a, b) => Number(a.slice(6, -3)) - Number(b.slice(6, -3)))) {
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
    const t = String(row[5] || "").replace(/\s+\n/g, "\n").trim();
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
      f.push({ kind, text: item[1].trim() });
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
  });
}

mkdirSync(join(OUT, "shards"), { recursive: true });
mkdirSync(join(OUT, "kitab"), { recursive: true });
const SHARD = 300;
let shards = 0;
for (let i = 0; i < records.length; i += SHARD) {
  const part = {};
  for (const rec of records.slice(i, i + SHARD)) part[rec.no] = rec;
  writeFileSync(join(OUT, "shards", `${shards}.json`), JSON.stringify(part));
  shards++;
}
for (const k of kitabs) writeFileSync(join(OUT, "kitab", `${k.i}.json`), JSON.stringify(k));
writeFileSync(join(OUT, "kitabs.json"), JSON.stringify(kitabs.map(({ babs, ...k }) => k)));
writeFileSync(join(OUT, "order.json"), JSON.stringify(nums));
const ids = Array.from({ length: shards }, (_, i) => i);
const shardLines = ids.map((i) => `  ${i}: () => import("./shards/${i}.json"),`).join("\n");
const kitabLines = kitabs.map((k) => `  ${k.i}: () => import("./kitab/${k.i}.json"),`).join("\n");
writeFileSync(
  join(OUT, "loaders.ts"),
  `// Generated from Sahih Muslim (Shamela 1727 / Fuad numbering). Do not edit.
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
