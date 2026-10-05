import { NODES } from "@/data/shops";

/** 正とする URL。metadataBase・sitemap・robots・Search Console の登録先はすべてここから作る */
export const SITE_URL = "https://iekei-ramen-family-tree.vercel.app";
export const SITE_NAME = "家系ラーメン家系図";

/** 検索結果とリンクのカードに出る説明文。店数は収録データから数え、店を足したときの直し忘れを防ぐ */
export function siteDescription(): string {
  return `関東の家系ラーメン${NODES.length}店が、どのお店で修行して生まれたかを、家系図のように見られるサイトです。`;
}

/** OGP 画像の題字の下に出す 1 行。画像の系図に描く店（資本系を除く）の数と合わせる */
export function siteTagline(): string {
  const inKeizu = NODES.filter((n) => n.lineage !== "capital").length;
  return `吉村家から始まる ${inKeizu} 店の系図`;
}

/** OGP 画像の場所と大きさ。画像は src/app/og.png/route.tsx がビルド時に描く */
export const OG_IMAGE = { url: "/og.png", width: 1200, height: 630 };
