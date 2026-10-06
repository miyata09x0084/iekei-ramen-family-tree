"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { LINEAGES, SOURCE_KIND_LABEL, STATUS_LABEL, mapUrl, type Shop } from "@/data/shops";
import { CERTAINTY_LABEL, certaintyOf, sortSources } from "@/lib/certainty";
import type { PlacedShop } from "@/lib/layout";
import { disciplesOf, generationLabel, masterOf, relationLabel } from "@/lib/relations";
import { shopLabel, shopPath } from "@/lib/shop-page";
import { track } from "@/lib/track";

interface Props {
  shop: PlacedShop | null;
  nodes: PlacedShop[];
  onSelect: (id: string) => void;
  onClose: () => void;
}

/** 新しいタブで開く外部リンク。読み上げには「（新しいタブ）」を添え、矢印は装飾として隠す */
function ExternalLink({ href, label, className, onClick, children }: {
  href: string; label: string; className?: string; onClick: () => void; children: ReactNode;
}) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} aria-label={`${label}（新しいタブ）`}>
      {children}<span aria-hidden="true">↗</span>
    </a>
  );
}

function RelChip({ shop, onSelect }: { shop: Shop; onSelect: (id: string) => void }) {
  return (
    <button type="button" className="chip" style={{ "--c": LINEAGES[shop.lineage].color } as CSSProperties} onClick={() => onSelect(shop.id)}>
      <span className="dot" />
      {shopLabel(shop)}
    </button>
  );
}

export function DetailPanel({ shop: current, nodes, onSelect, onClose }: Props) {
  // 閉じるスライドアニメーションの間も直前の内容を残す（レンダー中の state 調整パターン）
  const [last, setLast] = useState<PlacedShop | null>(current);
  if (current && current !== last) setLast(current);
  const shop = current ?? last;
  const open = !!current;
  const master = shop ? masterOf(shop, nodes) : null;
  const kids = shop ? disciplesOf(shop, nodes) : [];
  const gen = shop ? generationLabel(shop.gen) : "";
  const edge = shop ? relationLabel(shop) : "";
  const certainty = shop ? certaintyOf(shop.sources) : "unverified";

  return (
    <aside className={`panel${open ? " open" : ""}`} id="panel" aria-live="polite" inert={!open}>
      <button className="btn close" type="button" onClick={onClose}>閉じる</button>
      {shop && (
        <>
          <p className="p-lineage">
            <span className="dot" style={{ "--c": LINEAGES[shop.lineage].color } as CSSProperties} />
            <span>{LINEAGES[shop.lineage].label}</span>
          </p>
          <h2><span>{shop.name}</span><span>{shop.sub}</span></h2>
          <Link className="pagelink" href={shopPath(shop.id)}>このお店のページ（貼って共有できる URL）</Link>
          <dl className="facts">
            <dt>場所</dt><dd>{shop.pref}・{shop.city}</dd>
            <dt>できた年</dt><dd>{shop.founded}年{shop.approx ? "頃" : ""}</dd>
            <dt>世代</dt><dd>{gen}</dd>
            <dt>師匠との関係</dt><dd>{edge}</dd>
            <dt>営業</dt><dd><span className={`badge ${shop.status === "open" ? "open" : "closed"}`}>{STATUS_LABEL[shop.status]}</span></dd>
            <dt>確かさ</dt><dd><span className={`badge certainty ${certainty}`}>{CERTAINTY_LABEL[certainty]}</span></dd>
          </dl>
          <p className="note">{shop.note}</p>
          <ExternalLink className="btn maplink" href={mapUrl(shop)} label="Google マップで開く"
            onClick={() => track({ name: "map_open", shop_id: shop.id })}>
            Google マップで開く
          </ExternalLink>
          <h3>師匠（修行したお店）</h3>
          <div className="rel">{master ? <RelChip shop={master} onSelect={onSelect} /> : <span className="none">なし</span>}</div>
          <h3>弟子（ここで修行して独立したお店）</h3>
          <div className="rel">{kids.length ? kids.map((k) => <RelChip key={k.id} shop={k} onSelect={onSelect} />) : <span className="none">なし</span>}</div>
          <h3>出典（もとにした記事）</h3>
          <ul className="sources">
            {sortSources(shop.sources).map((src) => (
              <li key={src.url}>
                <span className={`kind ${src.kind}`}>{SOURCE_KIND_LABEL[src.kind]}</span>
                <ExternalLink href={src.url} label={src.title} onClick={() => track({ name: "source_open", shop_id: shop.id })}>
                  {src.title}
                </ExternalLink>
                {src.note && <span className="src-note">{src.note}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  );
}
