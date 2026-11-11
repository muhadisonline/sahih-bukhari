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
      <span className="text-xs text-accent">{arDigits(i)}</span>
      <span className="mt-1 font-ar text-2xl leading-snug">{name}</span>
      <span className="text-sm text-muted">{author}</span>
      <span className="mt-auto pt-3 text-sm">{arDigits(n)} حديثًا</span>
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
    <Shell>
      <header className="text-center">
        <p className="font-ar text-2xl">بسم الله الرحمن الرحيم</p>
        <h1 className="mt-1 font-ar text-5xl leading-tight">الكتب الستة</h1>
        <div className="mx-auto mt-3 h-0.5 w-12 bg-accent" />
        <p className="mt-3 text-sm text-muted">{arDigits(6)} كتب · {arDigits(30051)} حديثًا</p>
        <form action="/axtar" className="mx-auto mt-5 flex w-full max-w-xl gap-2" role="search">
          <label className="sr-only" htmlFor="hq">
            بحث في الأحاديث
          </label>
          <input
            id="hq"
            name="q"
            placeholder="رقم الحديث أو كلمة من المتن"
            className="h-11 w-full border border-line bg-paper px-3 text-sm"
          />
          <button type="submit" className="h-11 shrink-0 bg-accent px-4 text-sm text-paper">
            بحث
          </button>
        </form>
      </header>
      <ol className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BOOKS.map((b, i) => (
          <li key={b.name}>
            {"to" in b ? (
              <Link to={b.to} className="flex min-h-36 flex-col border border-line bg-white p-5 hover:border-accent">
                <Card name={b.name} author={b.author} n={b.n} i={i + 1} />
              </Link>
            ) : (
              <a href={b.href} className="flex min-h-36 flex-col border border-line bg-white p-5 hover:border-accent">
                <Card name={b.name} author={b.author} n={b.n} i={i + 1} />
              </a>
            )}
          </li>
        ))}
      </ol>
    </Shell>
  );
}