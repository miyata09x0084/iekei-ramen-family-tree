import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// 静的出力（output: "export"）でもビルド時に out/sitemap.xml として書き出す
export const dynamic = "force-static";

// lastModified は付けない。更新のたびに直す作業を生まないため
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/privacy` },
  ];
}
