import { NODES } from "@/data/shops";

/** 正とする URL。metadataBase・sitemap・robots・Search Console の登録先はすべてここから作る */
export const SITE_URL = "https://iekei-ramen-family-tree.vercel.app";
export const SITE_NAME = "家系ラーメン家系図";

/** 店数は収録データから数える。店を足したときに文言の直し忘れを防ぐ */
export function siteDescription(): string {
  return `関東の家系ラーメン${NODES.length}店の修行系譜を、縦書き屋号の系図として可視化する家系図`;
}
