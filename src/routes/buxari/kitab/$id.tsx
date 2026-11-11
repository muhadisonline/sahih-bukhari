import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { arDigits } from "@/lib/digits";
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
      { title: loaderData?.seoTitle ?? "كتاب — صحيح البخاري" },
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
      <h1 className="font-ar text-3xl">الكتاب غير موجود</h1>
      <Link to="/" className="mt-6 inline-flex h-11 items-center text-accent">
        العودة إلى الكتب
      </Link>
    </Shell>
  );
}

function KitabView() {
  const data = Route.useLoaderData();
  return (
    <Shell>
      <nav className="text-sm text-muted">
        <Link to="/" className="font-ar text-lg text-accent">
          صحيح البخاري
        </Link>
      </nav>
      <h1 className="mt-4 font-ar text-3xl leading-relaxed">{data.title}</h1>
      <p className="mt-2 text-sm text-muted">
        {arDigits(data.count)} حديثًا · {arDigits(data.first)}–{arDigits(data.last)}
      </p>
      <ol className="mt-8">
        {data.babs.map((bab) => (
          <li key={`${bab.first}-${bab.title}`} className="border-b border-line py-3">
            <h2 className="font-ar text-xl leading-relaxed">{bab.title}</h2>
            <p className="text-sm text-muted">
              {arDigits(bab.first)}–{arDigits(bab.last)}
            </p>
          </li>
        ))}
      </ol>
      <section className="mt-14 border-t border-line pt-8">
        <h2 className="text-sm text-muted">أرقام الأحاديث</h2>
        <div className="mt-6 flex flex-col gap-6">
          {data.babs.map((bab) => (
            <div key={`n-${bab.first}-${bab.title}`}>
              <h3 className="font-ar text-base leading-relaxed text-muted">{bab.title}</h3>
              <ul className="mt-1 grid grid-cols-4 sm:grid-cols-8">
                {bab.nums.map((n) => (
                  <li key={n}>
                    <Link
                      to="/buxari/$no"
                      params={{ no: String(n) }}
                      className="flex h-11 items-center justify-center text-sm text-ink hover:text-accent"
                    >
                      {arDigits(n)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}
