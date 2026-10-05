import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { LINEAGES, NODES, type LineageKey } from "@/data/shops";
import { shopPath } from "@/lib/shop-page";

export const metadata: Metadata = {
  title: "お店の一覧",
  description: `収録している家系ラーメン${NODES.length}店を系統ごとに並べた一覧。各店のページで、吉村家までのつながり・師匠・弟子・出典が読めます。`,
  alternates: { canonical: "/shops" },
};

export default function ShopsIndex() {
  const groups = (Object.keys(LINEAGES) as LineageKey[])
    .map((key) => ({ key, ...LINEAGES[key], shops: NODES.filter((n) => n.lineage === key).sort((a, b) => a.founded - b.founded) }))
    .filter((g) => g.shops.length);

  return (
    <main className="doc shop-index">
      <h1>お店の一覧</h1>
      <p>系統ごとに、できた年の順で並べています。お店の名前を押すと、吉村家までのつながり・師匠・弟子・出典が読めます。</p>
      {groups.map((g) => (
        <section key={g.key}>
          <h2><span className="dot" style={{ "--c": g.color } as CSSProperties} />{g.label}</h2>
          <ul className="shop-list">
            {g.shops.map((s) => (
              <li key={s.id}>
                <Link href={shopPath(s.id)}>{s.name}{s.sub ? `（${s.sub}）` : ""}</Link>
                <span className="meta">{s.founded}年{s.approx ? "頃" : ""}・{s.city}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <Link className="back" href="/">← 家系図に戻る</Link>
    </main>
  );
}
