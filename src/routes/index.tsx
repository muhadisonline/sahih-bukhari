import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { arDigits } from "@/lib/digits";
const BOOKS = [
  { to: "/buxari", name: "صحيح البخاري", author: "محمد بن إسماعيل البخاري", n: 7349 },
  { href: "https://muhadisonline.github.io/sahih-bukhari/muslim/", name: "صحيح مسلم", author: "مسلم بن الحجاج", n: 3031 },
  { href: "https://muhadisonline.github.io/sahih-bukhari/abudawud/", name: "سنن أبي داود", author: "أبو داود السجستاني", n: 5273 },
  { href: "https://muhadisonline.github.io/sahih-bukhari/tirmidhi/", name: "جامع الترمذي", author: "محمد بن عيسى الترمذي", n: 4300 },
  { href: "https://muhadisonline.github.io/sahih-bukhari/nasai/", name: "سنن النسائي", author: "أحمد بن شعيب النسائي", n: 5758 },
  { href: "https://muhadisonline.github.io/sahih-bukhari/ibnmajah/", name: "سنن ابن ماجه", author: "محمد بن يزيد ابن ماجه", n: 4340 },
] as const;

const NUM = ["١", "٢", "٣", "٤", "٥", "٦"];

function Card({
  name,
  author,
  n,
  i,
}: {
  name: string;
  author: string;
  n: number;
  i: number;
}) {
  return (
    <>
      <span className="pointer-events-none absolute end-3 top-0 font-ar text-7xl leading-none text-ink/10 transition group-hover:text-paper/10">
        {NUM[i]}
      </span>
      <span className="relative mt-auto font-ar text-3xl leading-snug">{name}</span>
      <span className="relative text-sm text-muted group-hover:text-paper/70">{author}</span>
      <span className="relative mt-4 text-sm group-hover:text-paper/70">{arDigits(n)} حديثًا</span>
    </>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "الكتب الستة" },
      { name: "description", content: "صحيح البخاري وصحيح مسلم وسنن أبي داود وجامع الترمذي وسنن النسائي وسنن ابن ماجه." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const [daily, setDaily] = useState<{ slug: string; no: number; text: string; book: string } | null>(null);

  useEffect(() => {
    const now = new Date();
    const start = Date.UTC(now.getFullYear(), 0, 1);
    const day = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - start) / 86400000);
    fetch("/daily.json")
      .then((r) => r.json())
      .then((rows: [string, number, string, string][]) => {
        const h = rows[day % rows.length];
        if (h) setDaily({ slug: h[0], no: h[1], text: h[2], book: h[3] });
      })
      .catch(() => {});
  }, []);

  const dailyHref = daily
    ? daily.slug === "buxari"
      ? null
      : `https://muhadisonline.github.io/sahih-bukhari/${daily.slug}/${daily.no}/`
    : null;

  return (
    <Shell wide>
      <section className="pt-4">
        <p className="text-sm text-muted">مكتبة الحديث</p>
        <h1 className="mt-2 font-ar text-7xl leading-none sm:text-8xl">الكتب الستة</h1>
        <p className="mt-4 max-w-md text-muted">ثلاثون ألف حديث. كل واحد في صفحة، بالمتن العربي.</p>
        <form action="/axtar" className="mt-6 flex w-full max-w-lg items-center border-b border-ink" role="search">
          <label className="sr-only" htmlFor="hq">
            بحث في الأحاديث
          </label>
          <input id="hq" name="q" placeholder="رقم الحديث أو كلمة من المتن" className="h-12 w-full border-0 bg-transparent text-sm" />
          <button type="submit" className="h-12 shrink-0 bg-transparent px-1 text-sm">
            بحث
          </button>
        </form>
      </section>
      {daily ? (
        daily.slug === "buxari" ? (
          <Link to="/buxari/$no" params={{ no: String(daily.no) }} className="mt-8 block bg-ink p-6 text-paper">
            <span className="text-sm text-paper/60">حديث اليوم</span>
            <p className="mt-3 font-ar text-2xl leading-relaxed">{daily.text}</p>
            <span className="mt-4 block text-sm text-paper/60">
              {daily.book} · الحديث {arDigits(daily.no)}
            </span>
          </Link>
        ) : (
          <a href={dailyHref ?? "#"} className="mt-8 block bg-ink p-6 text-paper">
            <span className="text-sm text-paper/60">حديث اليوم</span>
            <p className="mt-3 font-ar text-2xl leading-relaxed">{daily.text}</p>
            <span className="mt-4 block text-sm text-paper/60">
              {daily.book} · الحديث {arDigits(daily.no)}
            </span>
          </a>
        )
      ) : null}
      <ol className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BOOKS.map((b, i) => {
          const cls =
            "group relative flex min-h-64 flex-col overflow-hidden border border-ink/10 bg-white p-5 transition hover:bg-ink hover:text-paper";
          return (
            <li key={b.name}>
              {"to" in b ? (
                <Link to={b.to} className={cls}>
                  <Card name={b.name} author={b.author} n={b.n} i={i} />
                </Link>
              ) : (
                <a href={b.href} className={cls}>
                  <Card name={b.name} author={b.author} n={b.n} i={i} />
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </Shell>
  );
}