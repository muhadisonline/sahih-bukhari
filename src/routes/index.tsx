import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { arDigits, westernDigits } from "@/lib/digits";

const BOOKS = [
  { to: "/buxari", name: "صحيح البخاري" },
  { href: "https://muhadisonline.github.io/sahih-bukhari/muslim/", name: "صحيح مسلم" },
  { href: "https://muhadisonline.github.io/sahih-bukhari/abudawud/", name: "سنن أبي داود" },
  { href: "https://muhadisonline.github.io/sahih-bukhari/tirmidhi/", name: "جامع الترمذي" },
  { href: "https://muhadisonline.github.io/sahih-bukhari/nasai/", name: "سنن النسائي" },
  { href: "https://muhadisonline.github.io/sahih-bukhari/ibnmajah/", name: "سنن ابن ماجه" },
  { href: "https://muhadisonline.github.io/sahih-bukhari/malik/", name: "موطأ مالك" },
  { href: "https://muhadisonline.github.io/sahih-bukhari/darimi/", name: "سنن الدارمي" },
  { href: "https://muhadisonline.github.io/sahih-bukhari/adab/", name: "الأدب المفرد" },
  { href: "https://muhadisonline.github.io/sahih-bukhari/riyad/", name: "رياض الصالحين" },
] as const;

function Icon({ d, fill = false }: { d: string; fill?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"} strokeWidth="1.7" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const bookPath = "M5 5h6.2A2.8 2.8 0 0 1 14 7.8V19a2.2 2.2 0 0 0-2.2-2.2H5zM19 5h-6.2A2.8 2.8 0 0 0 10 7.8V19a2.2 2.2 0 0 1 2.2-2.2H19z";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مُحَدِّث — موسوعة الحديث النبوي" },
      { name: "description", content: "اقرأ الأحاديث النبوية، وابحث عنها، وتعرّف على مصادرها." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [daily, setDaily] = useState<{ slug: string; no: number; text: string; book: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState(0);

  useEffect(() => {
    const n = Number(localStorage.getItem("bukhari-size") ?? "0");
    const next = n >= 0 && n <= 3 ? n : 0;
    setSize(next);
    document.documentElement.setAttribute("data-size", String(next));
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

  function setTextSize(next: number) {
    const n = Math.max(0, Math.min(3, next));
    setSize(n);
    localStorage.setItem("bukhari-size", String(n));
    document.documentElement.setAttribute("data-size", String(n));
  }

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = westernDigits(String(new FormData(e.currentTarget).get("q") ?? "").trim());
    navigate({ to: "/axtar", search: { q } });
  }

  const dailyInner = (
    <>
      <span className="text-sm text-[#1c4536]">حديث اليوم</span>
      <p className="mt-1 font-ar text-2xl leading-relaxed text-[#1a3d30]">{daily?.text ?? "«إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ»"}</p>
      <span className="mt-1 block text-sm text-[#6e675f]">
        {daily ? `${daily.book} · الحديث ${arDigits(daily.no)}` : "صحيح البخاري · الحديث ١"}
      </span>
    </>
  );

  return (
    <div
      className="min-h-screen text-[#1c3f32]"
      style={{
        backgroundColor: "#f3eee6",
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><g fill='none' stroke='%231c4536' stroke-opacity='.16' stroke-width='.7'><path d='M80 22l8 50 50 8-50 8-8 50-8-50-50-8 50-8z'/></g></svg>\")",
        backgroundSize: "170px 170px",
      }}
    >
      <header className="px-3 pt-3">
        <div className="mx-auto flex min-h-14 w-full max-w-5xl items-center gap-1 rounded-full bg-[#1c4536] px-2 text-[#f6f1e7]">
          <Link to="/" className="px-3 text-2xl font-semibold leading-none text-[#f6f1e7]">
            مُحَدِّث
          </Link>
          <nav className="ms-auto flex items-center gap-1" aria-label="التنقل">
            <Link to="/axtar" search={{ q: "" }} aria-label="بحث" className="inline-flex size-10 items-center justify-center">
              <Icon d="M15.5 14.5 19 18M11 16.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z" />
            </Link>
            <Link to="/axtar" search={{ q: "" }} className="hidden items-center gap-1.5 px-2 sm:inline-flex">
              <span>المواضيع</span>
            </Link>
            <a href="#kutub" className="hidden items-center gap-1.5 px-2 md:inline-flex">
              كتب الحديث
            </a>
            <Link to="/axtar" search={{ q: "" }} className="hidden items-center gap-1.5 px-2 sm:inline-flex">
              الأحاديث
            </Link>
            <Link to="/" className="inline-flex items-center gap-1.5 rounded-full bg-[#f4efe6] px-3 py-2 text-[#1c3f32]">
              الرئيسية
            </Link>
          </nav>
          <div className="relative">
            <button type="button" aria-label="حجم الخط" className="inline-flex size-10 items-center justify-center" onClick={() => setOpen((v) => !v)}>
              <Icon d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 3v2M12 19v2M3 12h2M19 12h2" />
            </button>
            {open && (
              <div className="absolute end-0 top-full z-20 mt-2 flex items-center gap-2 rounded-xl bg-[#f6f1e7] px-2 py-1 text-[#1c3f32]">
                <button type="button" aria-label="أصغر" className="size-10" onClick={() => setTextSize(size - 1)}>−</button>
                <button type="button" aria-label="أكبر" className="size-10" onClick={() => setTextSize(size + 1)}>+</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pb-2 pt-10 text-center">
        <h1 className="text-6xl font-semibold leading-none text-[#1a3d30] sm:text-8xl">مُحَدِّث</h1>
        <p className="mt-3 font-ar text-3xl text-[#1a3d30]">موسوعة الحديث النبوي</p>
        <div className="mx-auto mt-4 flex w-48 items-center gap-3" aria-hidden="true">
          <i className="h-px flex-1 bg-[#cfc6b8]" />
          <b className="size-1.5 rotate-45 bg-[#1c4536]" />
          <i className="h-px flex-1 bg-[#cfc6b8]" />
        </div>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-[#3d4a43]">اقرأ الأحاديث النبوية، وابحث عنها، وتعرّف على مصادرها</p>
        <form onSubmit={onSearch} className="mx-auto mt-6 flex h-14 w-full max-w-xl items-center gap-2 rounded-full border border-[#efe8dc] bg-[#fbf8f4] px-4 shadow-sm" role="search">
          <label className="sr-only" htmlFor="hq">بحث في الأحاديث</label>
          <Icon d="M15.5 14.5 19 18M11 16.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z" />
          <input id="hq" name="q" placeholder="ابحث في الأحاديث النبوية ..." className="h-full w-full border-0 bg-transparent text-[#1c3f32] outline-none placeholder:text-[#9a9288]" />
        </form>
        {daily?.slug === "buxari" ? (
          <Link to="/buxari/$no" params={{ no: String(daily.no) }} className="mx-auto mt-4 block max-w-xl rounded-2xl border border-[#e7e0d4] bg-[#faf6f0] px-5 py-4">
            {dailyInner}
          </Link>
        ) : (
          <a href={daily ? `https://muhadisonline.github.io/sahih-bukhari/${daily.slug}/${daily.no}/` : "/buxari/1"} className="mx-auto mt-4 block max-w-xl rounded-2xl border border-[#e7e0d4] bg-[#faf6f0] px-5 py-4">
            {dailyInner}
          </a>
        )}
      </section>

      <Section title="مميزات مُحَدِّث">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["سرعة في البحث", "M13 2 4 14h7l-1 8 9-12h-7z", true],
            ["محتوى موثوق", "M12 3.5 19 6.2v5.4c0 4.2-2.8 7.2-7 8.9-4.2-1.7-7-4.7-7-8.9V6.2z", false],
            ["مصادر متنوعة", bookPath, false],
            ["واجهة بسيطة", "M5 7h14M5 12h14M5 17h14", false],
          ].map(([label, d, fill]) => (
            <li key={label as string} className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-[#e8e1d6] bg-[#faf7f2] text-center">
              <span className="text-[#1c4536]">
                <Icon d={d as string} fill={Boolean(fill)} />
              </span>
              <span>{label as string}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="أقسام الموسوعة">
        <ul className="grid gap-3 md:grid-cols-3">
          {[
            ["كتب الحديث", "#kutub"],
            ["الأحاديث الصحيحة", "#kutub"],
            ["الضعيفة", "/axtar"],
            ["الموضوعات", "/axtar"],
            ["الصحابة والتابعين", "/axtar"],
            ["مصطلح الحديث", "/axtar"],
          ].map(([label, href]) => (
            <li key={label}>
              {href.startsWith("#") ? (
                <a href={href} className="flex min-h-16 items-center gap-3 rounded-2xl border border-[#e8e1d6] bg-[#faf7f2] px-4">
                  <span className="text-[#1c4536]"><Icon d={bookPath} /></span>
                  <span>{label}</span>
                  <span className="ms-auto text-[#8a837a]">‹</span>
                </a>
              ) : (
                <Link to="/axtar" search={{ q: "" }} className="flex min-h-16 items-center gap-3 rounded-2xl border border-[#e8e1d6] bg-[#faf7f2] px-4">
                  <span className="text-[#1c4536]"><Icon d={bookPath} /></span>
                  <span>{label}</span>
                  <span className="ms-auto text-[#8a837a]">‹</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="مؤلفات الحديث" id="kutub">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {BOOKS.map((b) => {
            const card = (
              <span className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-[#e8e1d6] bg-[#faf7f2] px-2 text-center font-ar text-xl">
                <Icon d={bookPath} />
                {b.name}
              </span>
            );
            return (
              <li key={b.name}>
                {"to" in b ? <Link to={b.to}>{card}</Link> : <a href={b.href}>{card}</a>}
              </li>
            );
          })}
        </ul>
      </Section>

      <footer className="mt-14 bg-[#143528] px-4 py-10 text-center text-[#f6f1e7]">
        <div className="mx-auto flex w-48 items-center gap-3" aria-hidden="true">
          <i className="h-px flex-1 bg-[#f6f1e7]/50" />
          <b className="size-1.5 rotate-45 bg-[#f6f1e7]" />
          <i className="h-px flex-1 bg-[#f6f1e7]/50" />
        </div>
        <p className="mt-4 font-ar text-2xl">السنة النبوية .. نور يهدي إلى الحق</p>
      </footer>
    </div>
  );
}

function Section({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  return (
    <section id={id} className="mx-auto mt-12 w-full max-w-5xl px-4">
      <h2 className="flex items-center justify-center gap-4 text-center font-ar text-3xl font-normal text-[#1a3d30]">
        <i className="h-px w-24 bg-[#d5cdc0]" aria-hidden="true" />
        {title}
        <i className="h-px w-24 bg-[#d5cdc0]" aria-hidden="true" />
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
