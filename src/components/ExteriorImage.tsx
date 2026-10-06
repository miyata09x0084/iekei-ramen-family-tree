"use client";
import { useState } from "react";
import type { Shop } from "@/data/shops";
import { exteriorAlt, exteriorCaption, exteriorImageUrl } from "@/lib/exterior";

/** ビルド時に埋め込む。未設定なら外観画像は出さない（ローカルやキー無しのプレビューでも壊れない） */
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * 店の外観画像（Google ストリートビュー）と画像の出典。店舗ページと詳細パネルの両方で使う。
 * 読み込みに失敗したら図ごと隠す。失敗は「その場所に画像が無い（404）」か「キーの制限・無料枠の超過（403）」で、
 * どちらも見た人に説明することはないので同じ扱いにする。
 */
export function ExteriorImage({ shop }: { shop: Shop }) {
  // 詳細パネルは店を切り替えても同じ部品が使い回されるので、失敗を店の id で覚えて次の店には持ち越さない
  const [failedId, setFailedId] = useState<string | null>(null);
  const src = exteriorImageUrl(shop, API_KEY);
  if (!src || failedId === shop.id) return null;
  return (
    <figure className="exterior">
      {/* eslint-disable-next-line @next/next/no-img-element -- 静的出力で画像の最適化はしないので next/image の利点が無い */}
      <img src={src} alt={exteriorAlt(shop)} width={640} height={400} loading="lazy" onError={() => setFailedId(shop.id)} />
      <figcaption>{exteriorCaption(shop)}</figcaption>
    </figure>
  );
}
