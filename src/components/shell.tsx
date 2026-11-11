import { Link, useNavigate } from "@tanstack/react-router";
import type { FormEvent, ReactNode } from "react";
import { westernDigits } from "@/lib/digits";

export function Shell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = westernDigits(String(new FormData(e.currentTarget).get("q") ?? "").trim());
    navigate({ to: "/axtar", search: { q } });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-5 py-3">
          <Link to="/" className="flex min-h-11 items-center gap-3">
            <span className="flex size-9 items-center justify-center bg-accent font-ar text-xl text-paper">ب</span>
            <span className="font-ar text-xl leading-none">صحيح البخاري</span>
          </Link>
          <form onSubmit={onSearch} className="ms-auto hidden w-full max-w-sm items-center gap-2 sm:flex" role="search">
            <label className="sr-only" htmlFor="q-head">
              بحث في الأحاديث
            </label>
            <input
              id="q-head"
              name="q"
              placeholder="رقم الحديث أو كلمة"
              className="h-11 w-full border border-line bg-paper px-3 text-sm text-ink placeholder:text-muted"
            />
            <button type="submit" className="h-11 shrink-0 bg-accent px-4 text-sm text-paper">
              بحث
            </button>
          </form>
          <Link to="/axtar" search={{ q: "" }} className="ms-auto flex h-11 items-center text-sm text-accent sm:hidden">
            بحث
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">{children}</main>
      <footer className="border-t border-line">
        <p className="mx-auto max-w-3xl px-5 py-8 text-sm leading-loose text-muted">
          الطبعة السلطانية (بولاق، ١٣١١ هـ)، دار طوق النجاة. الترقيم ترقيم محمد فؤاد عبد الباقي. المتن بالعربية كما هو.
        </p>
      </footer>
    </div>
  );
}
