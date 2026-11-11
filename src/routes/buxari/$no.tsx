import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { getHadith } from "@/lib/hadith-api";
import type { HadithPage } from "@/lib/hadith-types";

export const Route = createFileRoute("/buxari/$no")({
  loader: async ({ params }): Promise<HadithPage> => {
    const no = Number(params.no);
    if (!Number.isInteger(no)) throw notFound();
    const page = await getHadith({ data: no });
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.seoTitle ?? "صحيح البخاري" },
      { name: "description", content: loaderData?.seoDesc ?? "" },
      { name: "robots", content: "index, follow" },
    ],
    links: loaderData ? [{ rel: "canonical", href: loaderData.path }] : [],
  }),
  notFoundComponent: MissingHadith,
  component: HadithView,
});

function MissingHadith() {
  return (
    <Shell>
      <h1 className="font-ar text-3xl">هذا الرقم غير موجود</h1>
      <p className="mt-3 max-w-md leading-loose text-muted">
        في ترقيم محمد فؤاد عبد الباقي تُركت بعض الأرقام فارغة. عُد إلى الكتب وتابع منها.
      </p>
      <Link to="/" className="mt-6 inline-flex h-11 items-center text-accent">
        العودة إلى الكتب
      </Link>
    </Shell>
  );
}

function HadithView() {
  const data = Route.useLoaderData();
  const [copied, setCopied] = useState(false);
  const babInFront = data.f.some((item) => item.kind === "bab");
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.seoTitle,
    inLanguage: "ar",
    isPartOf: {
      "@type": "Book",
      name: "صحيح البخاري",
      inLanguage: "ar",
      author: { "@type": "Person", name: "محمد بن إسماعيل البخاري" },
    },
    position: data.no,
    articleBody: data.t,
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "صحيح البخاري", item: "/" },
      { "@type": "ListItem", position: 2, name: data.k, item: `/buxari/kitab/${data.ki}` },
      { "@type": "ListItem", position: 3, name: `الحديث ${data.ar}`, item: data.path },
    ],
  };

  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs).replace(/</g, "\\u003c") }} />
      <nav className="flex flex-wrap items-baseline gap-2 text-sm text-muted" aria-label="المسار">
        <Link to="/" className="font-ar text-lg text-accent">
          صحيح البخاري
        </Link>
        <span aria-hidden="true">/</span>
        <Link to="/buxari/kitab/$id" params={{ id: String(data.ki) }} className="font-ar text-lg text-accent">
          {data.k}
        </Link>
      </nav>

      <article className="mt-8">
        {data.f.map((item, i) => {
          if (item.kind === "basmala") {
            return (
              <p key={i} className="text-center font-ar text-3xl">
                {item.text}
              </p>
            );
          }
          if (item.kind === "kitab") return null;
          if (item.kind === "bab") {
            return (
              <h1 key={i} className="mt-6 font-ar text-2xl leading-relaxed">
                <span className="mb-3 block text-sm text-accent">الحديث {data.ar}</span>
                {item.text}
              </h1>
            );
          }
          return (
            <p key={i} className="mt-4 font-ar text-xl leading-relaxed text-muted">
              {item.text}
            </p>
          );
        })}
        {!babInFront && (
          <h1 className="mt-6 font-ar text-2xl leading-relaxed">
            <span className="mb-3 block text-sm text-accent">الحديث {data.ar}</span>
            {data.b}
          </h1>
        )}
        <p className="hadith-body mt-8 whitespace-pre-wrap">{data.t}</p>
        {(data.g || data.bg || data.s) && (
          <p className="mt-8 border-t border-line pt-4 text-sm leading-loose text-muted">
            {data.bg ? <span>ترقيم البغا {data.bg}</span> : null}
            {data.g ? <span>{data.bg ? " · " : ""}{data.g}</span> : null}
            {data.s ? <span className="mt-1 block">{data.s}</span> : null}
          </p>
        )}
      </article>

      <nav className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6" aria-label="الأحاديث المجاورة">
        {data.prev ? (
          <Link to="/buxari/$no" params={{ no: String(data.prev) }} className="inline-flex h-11 items-center text-accent">
            السابق
          </Link>
        ) : (
          <span />
        )}
        <button
          type="button"
          className="inline-flex h-11 items-center border border-line px-4 text-sm"
          onClick={() => {
            void navigator.clipboard?.writeText(data.t).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            });
          }}
        >
          {copied ? "تم النسخ" : "انسخ المتن"}
        </button>
        {data.next ? (
          <Link to="/buxari/$no" params={{ no: String(data.next) }} className="inline-flex h-11 items-center text-accent">
            التالي
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </Shell>
  );
}
