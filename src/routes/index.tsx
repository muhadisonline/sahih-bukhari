import { createFileRoute, Link } from "@tanstack/react-router";
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
      <span className="font-ar text-lg text-gold">{arDigits(i)}</span>
      <span className="mt-1 font-ar text-3xl leading-snug">{name}</span>
      <span className="text-sm text-muted">{author}</span>
      <span className="mt-auto w-full border-t border-line pt-3 text-sm text-accent">{arDigits(n)} حديثًا</span>
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
  return (
    <Shell wide>
      <header className="text-center">
        <p className="text-xs tracking-[0.22em] text-gold">مكتبة الحديث الشريف</p>
        <p className="mt-3 font-ar text-3xl">بسم الله الرحمن الرحيم</p>
        <h1 className="mt-1 font-ar text-6xl leading-tight">الكتب الستة</h1>
        <div className="mx-auto mt-4 size-2 rotate-45 bg-gold" />
        <p className="mt-4 flex justify-center gap-6 text-sm text-muted">
          <span>٦ كتب</span>
          <span>٣٠٬٠٥١ حديثًا</span>
          <span>المتن العربي</span>
        </p>
        <form action="/axtar" className="mx-auto mt-6 flex w-full max-w-xl gap-2 border border-[#c6a15a] bg-white p-1.5 shadow-lg" role="search">
          <label className="sr-only" htmlFor="hq">
            بحث في الأحاديث
          </label>
          <input
            id="hq"
            name="q"
            placeholder="رقم الحديث أو كلمة من المتن"
            className="h-11 w-full border-0 bg-transparent px-3 text-sm"
          />
          <button type="submit" className="h-11 shrink-0 bg-accent px-4 text-sm text-[#f6f1e7]">
            بحث
          </button>
        </form>
      </header>
      <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BOOKS.map((b, i) => {
          const cls =
            "flex min-h-44 flex-col border border-[#c6a15a] bg-[#fffdf8] p-6 shadow-[inset_0_0_0_5px_#fffdf8,inset_0_0_0_6px_rgba(198,161,90,.55)] transition hover:-translate-y-0.5";
          return (
            <li key={b.name}>
              {"to" in b ? (
                <Link to={b.to} className={cls}>
                  <Card name={b.name} author={b.author} n={b.n} i={i + 1} />
                </Link>
              ) : (
                <a href={b.href} className={cls}>
                  <Card name={b.name} author={b.author} n={b.n} i={i + 1} />
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </Shell>
  );
}