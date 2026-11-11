import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { arDigits } from "@/lib/digits";
import { getKitabIndex } from "@/lib/hadith-api";

export const Route = createFileRoute("/")({
  loader: () => getKitabIndex(),
  head: () => ({
    meta: [
      { title: "صحيح البخاري" },
      {
        name: "description",
        content:
          "صحيح البخاري: ستة وتسعون كتابًا و٧٣٤٩ حديثًا. كل حديث في صفحة مستقلة. ترقيم محمد فؤاد عبد الباقي.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const kitabs = Route.useLoaderData();
  const total = kitabs.reduce((n, k) => n + k.count, 0);

  return (
    <Shell>
      <p className="text-sm text-accent">الكتب الستة</p>
      <h1 className="mt-3 font-ar text-5xl leading-tight">صحيح البخاري</h1>
      <p className="mt-4 max-w-xl text-base leading-loose text-muted">
        للإمام محمد بن إسماعيل البخاري. كل حديث في صفحة مستقلة: الرقم، والكتاب، والباب، والمتن.
      </p>
      <p className="mt-4 text-sm text-ink">
        {arDigits(kitabs.length)} كتابًا · {arDigits(total)} حديثًا
      </p>

      <h2 className="mt-14 font-ar text-2xl">الكتب</h2>
      <ol className="mt-2">
        {kitabs.map((k) => (
          <li key={k.i} className="border-b border-line">
            <Link
              to="/buxari/kitab/$id"
              params={{ id: String(k.i) }}
              className="flex min-h-14 items-baseline gap-4 py-3"
            >
              <span className="w-8 shrink-0 text-sm text-muted">{arDigits(k.i)}</span>
              <span className="font-ar text-xl leading-relaxed">{k.short}</span>
              <span className="ms-auto shrink-0 text-sm text-muted">{arDigits(k.count)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </Shell>
  );
}
