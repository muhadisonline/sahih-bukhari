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
      <h1 className="mt-4 font-ar text-3xl leading-snug">{data.title}</h1>
      <p className="mt-2 text-sm text-muted">{arDigits(data.count)} حديثًا</p>
      <div className="mt-6">
        {data.babs.map((bab) => (
          <section key={`${bab.first}-${bab.title}`} className="mt-6">
            <h2 className="mt-8 text-center font-ar text-lg leading-relaxed text-accent">{bab.title}</h2>
            <ul className="mt-1">
              {bab.items.map((item) => (
                <li key={item.no} className="border-b border-line">
                  <Link
                    to="/buxari/$no"
                    params={{ no: String(item.no) }}
                    className="flex min-h-12 items-baseline gap-3 py-2"
                  >
                    <span className="w-10 shrink-0 text-sm text-accent">{item.ar}</span>
                    <span className="font-ar text-base leading-relaxed">{item.title}</span>
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
