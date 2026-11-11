import { createFileRoute } from "@tanstack/react-router";
import orderJson from "@/data/bukhari/order.json";
import kitabsJson from "@/data/bukhari/kitabs.json";

const order = orderJson as number[];
const kitabs = kitabsJson as { i: number }[];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const locs = [
          `${origin}/`,
          ...kitabs.map((k) => `${origin}/buxari/kitab/${k.i}`),
          ...order.map((n) => `${origin}/buxari/${n}`),
        ];
        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          locs.map((loc) => `<url><loc>${loc}</loc></url>`).join("\n") +
          `\n</urlset>\n`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
