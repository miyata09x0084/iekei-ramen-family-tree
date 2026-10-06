"use client";

import { useState, type CSSProperties } from "react";
import { LINEAGES, type Shop } from "@/data/shops";
import { cardSourceOf } from "@/lib/source-card";

interface Props {
  shop: Shop;
  // 出典を開いたときの計測（詳細パネルだけが渡す。店舗ページは server component なので渡さない）
  onOpen?: () => void;
}

/**
 * 出典カード（CONTEXT.md）。店舗ページと詳細パネルの上部に 1 枠。
 * 画像を持つ出典の先頭 1 件を「出典」の札つきで出し、押すと出典へ飛ぶ。画像は記事のもので、店の写真とは名乗らない。
 * 画像を持つ出典がない店と、画像が取れなくなった店は、系統色と系統名の面を出す。
 * 呼び出し側は key={shop.id} を付けて、店が変わったら読み込み失敗の状態を捨てる。
 */
export function SourceCard({ shop, onOpen }: Props) {
  const source = cardSourceOf(shop.sources);
  const [failed, setFailed] = useState(false);
  const lineage = LINEAGES[shop.lineage];

  if (!source?.image || failed) {
    // 系統名は本文の p-lineage が読み上げるので、面は装飾として隠す
    return (
      <div className="source-card placeholder" style={{ "--c": lineage.color } as CSSProperties} aria-hidden="true">
        <span>{lineage.label}</span>
      </div>
    );
  }
  return (
    <a className="source-card" href={source.url} target="_blank" rel="noopener noreferrer" onClick={onOpen}
      aria-label={`出典 ${source.title}（新しいタブ）`}>
      {/* 出典サーバーの画像をそのまま参照する（ホットリンク。複製しない）。静的エクスポートで next/image の最適化は効かず、外部ドメインの設定も要るので素の img にする */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={source.image} alt="" loading="lazy" onError={() => setFailed(true)} />
      <span className="caption"><span className="label">出典</span><span className="title">{source.title}</span></span>
    </a>
  );
}
