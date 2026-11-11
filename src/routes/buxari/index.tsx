import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { arDigits } from "@/lib/digits";
import { getKitabIndex } from "@/lib/hadith-api";

export const Route = createFileRoute("/buxari/")({
  loader: () => getKitabIndex(),
  head: () => ({
    meta: [
      { title: "صحيح البخاري" },
      { name: "description", content: "صحيح البخاري: ستة وتسعون كتابًا و٧٣٤٩ حديثًا." },
    ],
  }),
  component: BukhariHome,
});

function BukhariHome() {
  const kitabs = Route.useLoaderData();
  const total = kitabs.reduce((n, k) => n + k.count, 0);
  return (
    <Shell>
      <nav className="text-sm text-muted">
        <Link to="/" className="text-accent">
          الكتب الستة
        </Link>
      </nav>
      <h1 className="mt-3 font-ar text-4xl leading-tight">صحيح البخاري</h1>
      <p className="mt-3 text-sm text-ink">
        {arDigits(kitabs.length)} كتابًا · {arDigits(total)} حديثًا
      </p>
      <ol className="mt-8">
        {kitabs.map((k) => (
          <li key={k.i} className="border-b border-line">
            <Link to="/buxari/kitab/$id" params={{ id: String(k.i) }} className="flex min-h-14 items-baseline gap-4 py-3">
              <span className="w-8 shrink-0 text-sm text-muted">{arDigits(k.i)}</span>
              <span className="font-ar text-lg leading-relaxed">{k.short}</span>
              <span className="ms-auto shrink-0 text-sm text-muted">{arDigits(k.count)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </Shell>
  );
}
