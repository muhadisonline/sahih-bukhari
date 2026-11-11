import { createServerFn } from "@tanstack/react-start";
import type { HadithPage, KitabIndexItem, KitabPage, SearchHit } from "@/lib/hadith-types";

export const getHadith = createServerFn({ method: "GET" })
  .validator((raw: number) => raw)
  .handler(async ({ data }): Promise<HadithPage | null> => {
    const { loadHadith } = await import("./bukhari.server");
    return loadHadith(data);
  });

export const getKitab = createServerFn({ method: "GET" })
  .validator((raw: number) => raw)
  .handler(async ({ data }): Promise<KitabPage | null> => {
    const { loadKitab } = await import("./bukhari.server");
    return loadKitab(data);
  });

export const getKitabIndex = createServerFn({ method: "GET" }).handler(async (): Promise<KitabIndexItem[]> => {
  const { loadKitabIndex } = await import("./bukhari.server");
  return loadKitabIndex();
});

export const searchHadith = createServerFn({ method: "GET" })
  .validator((raw: string) => String(raw ?? "").slice(0, 120))
  .handler(async ({ data }): Promise<SearchHit[]> => {
    const { findHadith } = await import("./bukhari.server");
    return findHadith(data);
  });
