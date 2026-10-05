"use client";

import { useState, type CSSProperties } from "react";
import { LINEAGES, STATUS_LABEL, mapUrl, type Shop } from "@/data/shops";
import type { PlacedShop } from "@/lib/layout";
import { disciplesOf, generationLabel, masterOf, relationLabel } from "@/lib/relations";
import { track } from "@/lib/track";

interface Props {
  shop: PlacedShop | null;
  nodes: PlacedShop[];
  onSelect: (id: string) => void;
  onClose: () => void;
}

function RelChip({ shop, onSelect }: { shop: Shop; onSelect: (id: string) => void }) {
  return (
    <button type="button" className="chip" style={{ "--c": LINEAGES[shop.lineage].color } as CSSProperties} onClick={() => onSelect(shop.id)}>
      <span className="dot" />
      {shop.name}{shop.sub ? `（${shop.sub}）` : ""}
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
          <dl className="facts">
            <dt>所在地</dt><dd>{shop.pref}・{shop.city}</dd>
            <dt>創業</dt><dd>{shop.founded}年{shop.approx ? "頃" : ""}</dd>
            <dt>世代</dt><dd>{gen}</dd>
            <dt>関係</dt><dd>{edge}</dd>
            <dt>状態</dt><dd><span className={`badge ${shop.status === "open" ? "open" : "closed"}`}>{STATUS_LABEL[shop.status]}</span></dd>
          </dl>
          <p className="note">{shop.note}</p>
          <a className="btn maplink" href={mapUrl(shop)} target="_blank" rel="noopener noreferrer"
            onClick={() => track({ name: "map_open", shop_id: shop.id })} aria-label="Google マップで開く（新しいタブ）">
            Google マップで開く<span aria-hidden="true">↗</span>
          </a>
          <h3>師匠</h3>
          <div className="rel">{master ? <RelChip shop={master} onSelect={onSelect} /> : <span className="none">なし</span>}</div>
          <h3>弟子・暖簾分け</h3>
          <div className="rel">{kids.length ? kids.map((k) => <RelChip key={k.id} shop={k} onSelect={onSelect} />) : <span className="none">なし</span>}</div>
          <h3>出典</h3>
          <ul className="sources">
            {shop.sources.map((src) => (
              <li key={src.url}>
                <a href={src.url} target="_blank" rel="noopener noreferrer"
                  onClick={() => track({ name: "source_open", shop_id: shop.id })}
                  aria-label={`${src.title}（新しいタブ）`}>
                  {src.title}<span aria-hidden="true">↗</span>
                </a>
                {src.note && <span className="src-note">{src.note}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  );
}
