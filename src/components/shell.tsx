import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { westernDigits } from "@/lib/digits";

const SIZE_KEY = "bukhari-size";

function readSize() {
  const n = Number(localStorage.getItem(SIZE_KEY) ?? "0");
  return n >= 0 && n <= 3 ? n : 0;
}

export function Shell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState(0);

  useEffect(() => {
    const n = readSize();
    setSize(n);
    document.documentElement.setAttribute("data-size", String(n));
  }, []);

  function setTextSize(next: number) {
    const n = Math.max(0, Math.min(3, next));
    setSize(n);
    localStorage.setItem(SIZE_KEY, String(n));
    document.documentElement.setAttribute("data-size", String(n));
  }

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = westernDigits(String(new FormData(e.currentTarget).get("q") ?? "").trim());
    navigate({ to: "/axtar", search: { q } });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 bg-[#0e3d2e] text-[#f6f1e7] shadow-[inset_0_3px_0_#c6a15a]">
        <div className={`mx-auto flex w-full items-center gap-3 px-5 py-3 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
          <Link to="/" className="flex min-h-11 items-center gap-3">
            <span className="flex size-9 items-center justify-center border border-[#c6a15a] font-ar text-xl text-[#e8d7a8]">ك</span>
            <span className="font-ar text-lg leading-none">الكتب الستة</span>
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
                className="h-11 w-full border-0 bg-[#f7f1e6] px-3 text-sm text-ink placeholder:text-muted"
              />
              <button type="submit" className="h-11 shrink-0 bg-[#c6a15a] px-4 text-sm text-[#1a1612]">
                بحث
              </button>
            </form>
            <Link to="/axtar" search={{ q: "" }} className="flex h-11 items-center text-sm text-[#e8d7a8] sm:hidden">
              بحث
            </Link>
            <div className="relative">
              <button
                type="button"
                aria-label="حجم الخط"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="flex size-11 items-center justify-center border border-[#c6a15a]/50 text-[#f6f1e7]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
                </svg>
              </button>
              {open && (
                <div className="absolute end-0 top-full z-20 mt-2 flex items-center gap-2 border border-line bg-paper px-3 py-2 text-sm">
                  <span className="text-muted">حجم الخط</span>
                  <button type="button" aria-label="أصغر" className="flex size-11 items-center justify-center border border-line" onClick={() => setTextSize(size - 1)}>
                    −
                  </button>
                  <button type="button" aria-label="أكبر" className="flex size-11 items-center justify-center border border-line" onClick={() => setTextSize(size + 1)}>
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className={`mx-auto w-full flex-1 px-5 py-8 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>{children}</main>
      <footer className="border-t-[3px] border-[#c6a15a] bg-[#0e3d2e] text-[#efe7d6]">
        <div className={`mx-auto px-5 py-6 text-sm leading-relaxed ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
          <nav className="flex flex-wrap gap-x-5">
            <Link to="/buxari">البخاري</Link>
            <a href="https://muhadisonline.github.io/sahih-bukhari/muslim/">مسلم</a>
            <a href="https://muhadisonline.github.io/sahih-bukhari/abudawud/">أبو داود</a>
            <a href="https://muhadisonline.github.io/sahih-bukhari/tirmidhi/">الترمذي</a>
            <a href="https://muhadisonline.github.io/sahih-bukhari/nasai/">النسائي</a>
            <a href="https://muhadisonline.github.io/sahih-bukhari/ibnmajah/">ابن ماجه</a>
          </nav>
          <p className="mt-1 text-[#cbbfa8]">المتن بالعربية كما ورد في طبعاته، دون ترجمة.</p>
        </div>
      </footer>
    </div>
  );
}
