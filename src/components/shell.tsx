import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { westernDigits } from "@/lib/digits";

export function Shell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = westernDigits(String(new FormData(e.currentTarget).get("q") ?? "").trim());
    navigate({ to: "/axtar", search: { q } });
  }

  function onJump(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const no = Number(westernDigits(String(new FormData(e.currentTarget).get("no") ?? "").trim()));
    if (Number.isInteger(no) && no > 0) {
      setOpen(false);
      navigate({ to: "/buxari/$no", params: { no: String(no) } });
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-5 py-3">
          <Link to="/" className="flex min-h-11 items-center gap-3">
            <span className="flex size-9 items-center justify-center bg-accent font-ar text-xl text-paper">ب</span>
            <span className="font-ar text-xl leading-none">صحيح البخاري</span>
          </Link>
          <div className="ms-auto flex items-center gap-2">
            <form onSubmit={onSearch} className="hidden w-full max-w-sm items-center gap-2 sm:flex" role="search">
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
            <Link to="/axtar" search={{ q: "" }} className="flex h-11 items-center px-1 text-sm text-accent sm:hidden">
              بحث
            </Link>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="no-panel"
              aria-label="رقم الحديث"
              onClick={() => setOpen((v) => !v)}
              className={`flex size-11 items-center justify-center border text-sm ${open ? "border-accent bg-accent text-paper" : "border-line text-ink"}`}
            >
              ١٢٣
            </button>
          </div>
        </div>
        {open && (
          <form id="no-panel" onSubmit={onJump} className="border-t border-line">
            <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-5 py-3">
              <label className="sr-only" htmlFor="no-head">
                رقم الحديث
              </label>
              <input
                id="no-head"
                name="no"
                inputMode="numeric"
                autoFocus
                placeholder="رقم الحديث"
                className="h-11 w-full border border-line bg-paper px-3 text-sm text-ink placeholder:text-muted"
              />
              <button type="submit" className="h-11 shrink-0 bg-accent px-4 text-sm text-paper">
                افتح
              </button>
            </div>
          </form>
        )}
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
