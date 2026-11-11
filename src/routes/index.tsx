import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent } from "react";
import { Shell } from "@/components/shell";
import { getKitabIndex } from "@/lib/hadith-api";

export const Route = createFileRoute("/")({
  loader: () => getKitabIndex(),
  head: () => ({
    meta: [
      { title: "Səhih əl-Buxari — صحيح البخاري" },
      {
        name: "description",
        content:
          "Səhih əl-Buxari (صحيح البخاري): 96 kitab, 7349 hədis. Hər hədisin ayrıca səhifəsi. Fuad Əbdülbaqi nömrələməsi, ərəbcə mətn.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const kitabs = Route.useLoaderData();
  const navigate = useNavigate();
  const total = kitabs.reduce((n, k) => n + k.count, 0);

  function onJump(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const no = Number(String(new FormData(e.currentTarget).get("no") ?? "").trim());
    if (Number.isInteger(no) && no > 0) {
      navigate({ to: "/buxari/$no", params: { no: String(no) } });
    }
  }

  return (
    <Shell>
      <p className="text-sm text-accent">Kütübü-sittə</p>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">Səhih əl-Buxari</h1>
      <p className="mt-2 font-ar text-3xl leading-relaxed">صحيح البخاري</p>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
        İmam Məhəmməd ibn İsmail əl-Buxari. Hər hədis bir səhifədir — nömrə, kitab, bab və ərəbcə mətn.
      </p>
      <p className="mt-4 text-sm text-ink">
        {kitabs.length} kitab · {String(total).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} hədis
      </p>

      <form onSubmit={onJump} className="mt-8 flex flex-col gap-2 border border-line p-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-2 text-sm">
          Hədis nömrəsi
          <input
            name="no"
            inputMode="numeric"
            placeholder="məsələn 1"
            className="h-11 border border-line bg-paper px-3 text-ink placeholder:text-muted"
          />
        </label>
        <button type="submit" className="h-11 bg-accent px-5 text-sm text-paper">
          Aç
        </button>
      </form>

      <h2 className="mt-12 text-lg font-semibold">Kitablar</h2>
      <ol className="mt-2">
        {kitabs.map((k) => (
          <li key={k.i} className="border-b border-line">
            <Link
              to="/buxari/kitab/$id"
              params={{ id: String(k.i) }}
              className="flex min-h-14 items-baseline justify-between gap-4 py-3"
            >
              <span className="font-ar text-xl leading-relaxed">{k.title}</span>
              <span className="shrink-0 text-sm text-muted">{k.count}</span>
            </Link>
          </li>
        ))}
      </ol>
    </Shell>
  );
}
