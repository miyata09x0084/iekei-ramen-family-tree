import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// 静的出力（output: "export"）でもビルド時に out/robots.txt として書き出す
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
