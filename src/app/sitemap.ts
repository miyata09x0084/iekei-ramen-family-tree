import type { MetadataRoute } from "next";
import { NODES } from "@/data/shops";
import { shopPath } from "@/lib/shop-page";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

// lastModified は付けない。更新のたびに直す作業を生まないため
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/shops` },
    ...NODES.map((n) => ({ url: `${SITE_URL}${shopPath(n.id)}` })),
    { url: `${SITE_URL}/privacy` },
  ];
}
