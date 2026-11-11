import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent } from "react";
import { Shell } from "@/components/shell";
import { searchHadith } from "@/lib/hadith-api";

type Search = { q: string };

export const Route = createFileRoute("/axtar")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: search.q == null ? "" : String(search.q).slice(0, 120),
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ deps }) => searchHadith({ data: deps.q }),
  head: ({ match }) => ({
    meta: [
      {
        title: match.search.q ? `Axtarış: ${match.search.q} — Səhih əl-Buxari` : "Axtarış — Səhih əl-Buxari",
      },
      {
        name: "description",
        content: "Səhih əl-Buxaridə nömrə və ya ərəbcə mətn ilə axtarış.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const hits = Route.useLoaderData();
  const navigate = useNavigate();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = String(new FormData(e.currentTarget).get("q") ?? "");
    navigate({ to: "/axtar", search: { q: next } });
  }

  return (
    <Shell>
      <h1 className="text-3xl font-semibold">Axtarış</h1>
      <p className="mt-2 text-sm text-muted">Nömrə (məsələn 1) və ya ərəbcə söz.</p>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-2 sm:flex-row" role="search">
        <label className="sr-only" htmlFor="q-page">
          Sorğu
        </label>
        <input
          key={q}
          id="q-page"
          name="q"
          defaultValue={q}
          className="h-11 flex-1 border border-line bg-paper px-3 text-ink placeholder:text-muted"
          placeholder="إنما الأعمال və ya 1"
        />
        <button type="submit" className="h-11 bg-accent px-5 text-sm text-paper">
          Axtar
        </button>
      </form>
      {q && (
        <p className="mt-6 text-sm text-muted">
          {hits.length ? `${hits.length} nəticə` : "Uyğun hədis tapılmadı"}
          {hits.length >= 40 ? " — ilk 40 göstərilir" : ""}
        </p>
      )}
      <ul className="mt-4 flex flex-col">
        {hits.map((hit) => (
          <li key={hit.no} className="border-b border-line py-4">
            <Link to="/buxari/$no" params={{ no: String(hit.no) }} className="block">
              <span className="text-sm text-accent">Hədis {hit.no}</span>
              <span className="mt-1 block font-ar text-lg leading-relaxed" lang="ar" dir="rtl">
                {hit.k}
              </span>
              <span className="mt-2 block font-ar text-base leading-relaxed text-ink" lang="ar" dir="rtl">
                {hit.snippet}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
