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
      <p className="text-sm text-accent">مكتبة الحديث</p>
      <h1 className="mt-3 font-ar text-4xl leading-tight">الكتب الستة</h1>
      <ol className="mt-6">
        {BOOKS.map((b) => (
          <li key={b.name} className="border-b border-line">
            {"to" in b ? (
              <Link to={b.to} className="flex min-h-16 items-baseline gap-4 py-3">
                <span>
                  <span className="block font-ar text-2xl leading-relaxed">{b.name}</span>
                  <span className="text-sm text-muted">{b.author}</span>
                </span>
                {b.n ? <span className="ms-auto text-sm text-muted">{arDigits(b.n)} حديثًا</span> : null}
              </Link>
            ) : (
              <a href={b.href} className="flex min-h-16 items-baseline gap-4 py-3">
                <span>
                  <span className="block font-ar text-2xl leading-relaxed">{b.name}</span>
                  <span className="text-sm text-muted">{b.author}</span>
                </span>
              </a>
            )}
          </li>
        ))}
      </ol>
    </Shell>
  );
}
