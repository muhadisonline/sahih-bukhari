import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { getKitab } from "@/lib/hadith-api";

export const Route = createFileRoute("/buxari/kitab/$id")({
  loader: async ({ params }) => {
    const id = Number(params.id);
    if (!Number.isInteger(id)) throw notFound();
    const page = await getKitab({ data: id });
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.seoTitle ?? "Kitab — Səhih əl-Buxari" },
      { name: "description", content: loaderData?.seoDesc ?? "" },
    ],
    links: loaderData ? [{ rel: "canonical", href: loaderData.path }] : [],
  }),
  notFoundComponent: MissingKitab,
  component: KitabView,
});

function MissingKitab() {
  return (
    <Shell>
      <h1 className="text-2xl font-semibold">Kitab tapılmadı</h1>
      <Link to="/" className="mt-6 inline-flex h-11 items-center text-accent">
        Siyahıya qayıt
      </Link>
    </Shell>
  );
}

function KitabView() {
  const data = Route.useLoaderData();
  return (
    <Shell>
      <nav className="text-sm text-muted">
        <Link to="/" className="text-accent">
          Səhih əl-Buxari
        </Link>
      </nav>
      <h1 className="mt-4 font-ar text-3xl leading-relaxed" lang="ar" dir="rtl">
        {data.title}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {data.count} hədis · {data.first}–{data.last}
      </p>
      <div className="mt-8 flex flex-col gap-8">
        {data.babs.map((bab) => (
          <section key={`${bab.first}-${bab.title}`}>
            <h2 className="font-ar text-xl leading-relaxed" lang="ar" dir="rtl">
              {bab.title}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-1">
              {bab.nums.map((n) => (
                <li key={n}>
                  <Link
                    to="/buxari/$no"
                    params={{ no: String(n) }}
                    className="inline-flex h-11 min-w-11 items-center justify-center px-2 text-ink hover:text-accent"
                  >
                    {n}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Shell>
  );
}
