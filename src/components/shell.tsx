import { Link, useNavigate } from "@tanstack/react-router";
import type { FormEvent, ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    navigate({ to: "/axtar", search: { q } });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-paper">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-5 py-3">
          <Link to="/" className="flex min-h-11 items-center gap-3">
            <span className="flex size-9 items-center justify-center bg-accent font-ar text-xl text-paper">ب</span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold">Səhih əl-Buxari</span>
              <span className="block font-ar text-sm text-muted">صحيح البخاري</span>
            </span>
          </Link>
          <form onSubmit={onSearch} className="ml-auto hidden w-full max-w-sm items-center gap-2 sm:flex" role="search">
            <label className="sr-only" htmlFor="q-head">
              Hədis axtar
            </label>
            <input
              id="q-head"
              name="q"
              placeholder="Nömrə və ya ərəbcə mətn"
              className="h-11 w-full border border-line bg-paper px-3 text-sm text-ink placeholder:text-muted"
            />
            <button type="submit" className="h-11 shrink-0 bg-accent px-4 text-sm text-paper">
              Axtar
            </button>
          </form>
          <Link to="/axtar" search={{ q: "" }} className="ml-auto flex h-11 items-center text-sm text-accent sm:hidden">
            Axtar
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">{children}</main>
      <footer className="border-t border-line">
        <p className="mx-auto max-w-3xl px-5 py-6 text-sm leading-relaxed text-muted">
          Çap: Sultaniyyə (Bulaq, 1311 h.) — Dar Tavq ən-Nəcat. Nömrə Məhəmməd Fuad Əbdülbaqinin
          nömrələməsidir. Mətn ərəbcədir, tərcümə olunmur.
        </p>
      </footer>
    </div>
  );
}
