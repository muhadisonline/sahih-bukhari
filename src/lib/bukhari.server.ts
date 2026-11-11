import orderJson from "@/data/bukhari/order.json";
import kitabsJson from "@/data/bukhari/kitabs.json";
import { kitabLoaders, shardLoaders } from "@/data/bukhari/loaders";
import type { HadithPage, KitabIndexItem, KitabPage, SearchHit } from "@/lib/hadith-types";

type Front = { kind: string; text: string };

type Stored = {
  no: number;
  ar: string;
  ki: number;
  bi: number;
  k: string;
  b: string;
  t: string;
  q: string;
  f?: Front[];
  bg?: string;
  g?: string;
  s?: string;
};

const order = orderJson as number[];
const indexOf = new Map<number, number>();
for (let i = 0; i < order.length; i++) indexOf.set(order[i], i);

const shardCache = new Map<number, Record<string, Stored>>();

function norm(s: string) {
  return s
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

function clip(s: string, n: number) {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…";
}

function quoteOf(text: string) {
  const i = text.indexOf("«");
  const j = i >= 0 ? text.indexOf("»", i + 1) : -1;
  const raw = i >= 0 && j > i ? text.slice(i + 1, j) : text;
  return clip(raw, 72);
}

async function loadShard(id: number) {
  const hit = shardCache.get(id);
  if (hit) return hit;
  const loader = shardLoaders[id];
  if (!loader) return null;
  const mod = (await loader()) as { default: Record<string, Stored> };
  shardCache.set(id, mod.default);
  return mod.default;
}

function pageOf(h: Stored, prev: number | null, next: number | null): HadithPage {
  const quote = quoteOf(h.t);
  const seoTitle = `الحديث ${h.ar} — ${quote} | صحيح البخاري`;
  const seoDesc = clip(`الحديث ${h.ar} من صحيح البخاري، ${h.k}، ${h.b}. ${h.t}`, 240);
  return {
    no: h.no,
    ar: h.ar,
    ki: h.ki,
    k: h.k,
    b: h.b,
    t: h.t,
    f: h.f ?? [],
    bg: h.bg ?? "",
    g: h.g ?? "",
    s: h.s ?? "",
    prev,
    next,
    seoTitle,
    seoDesc,
    path: `/buxari/${h.no}`,
  };
}

export async function loadHadith(raw: number): Promise<HadithPage | null> {
  const no = Number(raw);
  if (!Number.isInteger(no) || no < 1) return null;
  const shard = await loadShard(Math.floor((no - 1) / 300));
  const h = shard?.[String(no)];
  if (!h) return null;
  const i = indexOf.get(no);
  if (i == null) return null;
  return pageOf(h, i > 0 ? order[i - 1] : null, i + 1 < order.length ? order[i + 1] : null);
}

export async function loadKitab(raw: number): Promise<KitabPage | null> {
  const id = Number(raw);
  const loader = kitabLoaders[id];
  if (!loader) return null;
  const mod = (await loader()) as { default: Omit<KitabPage, "seoTitle" | "seoDesc" | "path"> };
  const k = mod.default;
  return {
    ...k,
    seoTitle: `${k.title} — صحيح البخاري`,
    seoDesc: clip(`${k.title} من صحيح البخاري. ${k.count} حديثًا، من ${k.first} إلى ${k.last}.`, 220),
    path: `/buxari/kitab/${k.i}`,
  };
}

export function loadKitabIndex(): KitabIndexItem[] {
  return kitabsJson as KitabIndexItem[];
}

export async function findHadith(raw: string): Promise<SearchHit[]> {
  const q = String(raw ?? "").trim().slice(0, 120);
  if (!q) return [];
  if (/^\d+$/.test(q)) {
    const no = Number(q);
    const one = await loadShard(Math.floor((no - 1) / 300));
    const h = one?.[String(no)];
    if (!h) return [];
    return [{ no: h.no, ar: h.ar, k: h.k, b: h.b, snippet: clip(h.t, 180) }];
  }
  const nq = norm(q);
  if (nq.length < 2) return [];
  const hits: SearchHit[] = [];
  const ids = Object.keys(shardLoaders)
    .map(Number)
    .sort((a, b) => a - b);
  await Promise.all(ids.map((id) => loadShard(id)));
  for (const id of ids) {
    const shard = shardCache.get(id);
    if (!shard) continue;
    for (const h of Object.values(shard)) {
      if (h.q.includes(nq) || norm(h.b).includes(nq) || norm(h.k).includes(nq)) {
        hits.push({ no: h.no, ar: h.ar, k: h.k, b: h.b, snippet: clip(h.t, 180) });
        if (hits.length >= 40) return hits;
      }
    }
  }
  return hits;
}
