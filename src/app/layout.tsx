import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Shippori_Mincho, Yuji_Syuku, Zen_Kaku_Gothic_New } from "next/font/google";
import { SITE_NAME, SITE_URL, openGraphBase, siteDescription } from "@/lib/site";
import "./globals.css";

const yuji = Yuji_Syuku({ weight: "400", subsets: ["latin"], variable: "--font-yuji", display: "swap", preload: false });
const shippori = Shippori_Mincho({ weight: ["500", "700"], subsets: ["latin"], variable: "--font-shippori", display: "swap", preload: false });
const zenKaku = Zen_Kaku_Gothic_New({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-zen-kaku", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: siteDescription(),
  // twitter:image は指定しなければ og:image と同じものが入る
  openGraph: openGraphBase(),
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2B1B12",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className={`${yuji.variable} ${shippori.variable} ${zenKaku.variable}`}>
      <body>
        {children}
        {/* 測定 ID 未設定（ローカル等）では計測しない */}
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
      </body>
    </html>
  );
}
