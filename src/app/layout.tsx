import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Shippori_Mincho, Yuji_Syuku, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const yuji = Yuji_Syuku({ weight: "400", subsets: ["latin"], variable: "--font-yuji", display: "swap", preload: false });
const shippori = Shippori_Mincho({ weight: ["500", "700"], subsets: ["latin"], variable: "--font-shippori", display: "swap", preload: false });
const zenKaku = Zen_Kaku_Gothic_New({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-zen-kaku", display: "swap", preload: false });

export const metadata: Metadata = {
  title: "家系ラーメン家系図",
  description: "関東・東海・関西の家系ラーメン45店の修行系譜を、縦書き屋号の系図として可視化する家系図",
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
      <body>{children}</body>
    </html>
  );
}
