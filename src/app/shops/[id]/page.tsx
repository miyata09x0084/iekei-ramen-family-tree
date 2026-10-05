import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { LINEAGES, NODES, SHOP_BY_ID, SOURCES_CHECKED_AT, SOURCE_KIND_LABEL, STATUS_LABEL, mapUrl, type Shop } from "@/data/shops";
import { lineagePath } from "@/lib/ancestry";
import { CERTAINTY_LABEL, certaintyOf, sortSources } from "@/lib/certainty";
import { disciplesOf, generationLabel, masterOf, relationLabel } from "@/lib/relations";
import { correctionIssueUrl, generationOf, keizuPath, shopDescription, shopLabel, shopPath, shopTitle } from "@/lib/shop-page";
import { openGraphBase } from "@/lib/site";

// 系譜の見出しに使う総本山。validate.ts が「ちょうど 1 店」を保証している
const ROOT = NODES.find((n) => n.lineage === "root")!;

// 全店ぶんを静的出力する。一覧にない id は 404（dynamicParams = false）
export const dynamicParams = false;
export function generateStaticParams() {
  return NODES.map(({ id }) => ({ id }));
}

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const shop = SHOP_BY_ID.get(id);
  if (!shop) return {}; // dynamicParams = false なので到達しない。型の絞り込みのため
  const title = shopTitle(shop);
  const description = shopDescription(shop, SHOP_BY_ID);
  return {
    title,
    description,
    alternates: { canonical: shopPath(id) },
    // 画像はサイト全体の 1 枚。openGraph は layout とマージされないので共通部分を展開する
    openGraph: { ...openGraphBase(), title, description, url: shopPath(id) },
  };
}

/** 別の店舗ページへのリンク。系統の色の丸を添える */
function ShopLink({ shop }: { shop: Shop }) {
  return (
    <Link className="chip" style={{ "--c": LINEAGES[shop.lineage].color } as CSSProperties} href={shopPath(shop.id)}>
      <span className="dot" />
      {shopLabel(shop)}
    </Link>
  );
}

export default async function ShopPage({ params }: Props) {
  const { id } = await params;
  const shop = SHOP_BY_ID.get(id);
  if (!shop) notFound();

  const path = lineagePath(shop.id, SHOP_BY_ID);
  const master = masterOf(shop, NODES);
  const kids = disciplesOf(shop, NODES);
  const certainty = certaintyOf(shop.sources);
  const isCapital = shop.lineage === "capital";

  return (
    <main className="doc shop">
      <p className="p-lineage">
        <span className="dot" style={{ "--c": LINEAGES[shop.lineage].color } as CSSProperties} />
        <span>{LINEAGES[shop.lineage].label}</span>
      </p>
      <h1><span>{shop.name}</span>{shop.sub && <small>{shop.sub}</small>}</h1>
      <dl className="facts">
        <dt>場所</dt><dd>{shop.pref}・{shop.city}</dd>
        <dt>できた年</dt><dd>{shop.founded}年{shop.approx ? "頃" : ""}</dd>
        <dt>世代</dt><dd>{generationLabel(generationOf(shop, SHOP_BY_ID))}</dd>
        <dt>師匠との関係</dt><dd>{relationLabel(shop)}</dd>
        <dt>営業</dt><dd><span className={`badge ${shop.status === "open" ? "open" : "closed"}`}>{STATUS_LABEL[shop.status]}</span></dd>
        <dt>確かさ</dt><dd><span className={`badge certainty ${certainty}`}>{CERTAINTY_LABEL[certainty]}</span></dd>
      </dl>
      <p className="note">{shop.note}</p>
      <p>
        <a className="btn maplink" href={mapUrl(shop)} target="_blank" rel="noopener noreferrer" aria-label="Google マップで開く（新しいタブ）">
          Google マップで開く<span aria-hidden="true">↗</span>
        </a>
      </p>

      <h2>{ROOT.name}までのつながり</h2>
      {isCapital ? (
        <p>会社が開いたお店で、修行のつながりはありません。</p>
      ) : path.length === 1 ? (
        <p>家系ラーメンの始まりのお店で、師匠はいません。</p>
      ) : (
        <ol className="lineage-path" aria-label={`${ROOT.name}から${shop.name}までのつながり`}>
          {path.map((s, i) => (
            <li key={s.id}>
              {i > 0 && <span className="arrow" aria-hidden="true">→</span>}
              {s.id === shop.id
                ? <span className="here" aria-current="page">{s.name}</span>
                : <Link href={shopPath(s.id)}>{s.name}</Link>}
            </li>
          ))}
        </ol>
      )}

      <h2>師匠（修行したお店）</h2>
      <div className="rel">{master ? <ShopLink shop={master} /> : <span className="none">なし</span>}</div>
      <h2>弟子（ここで修行して独立したお店）</h2>
      <div className="rel">{kids.length ? kids.map((k) => <ShopLink key={k.id} shop={k} />) : <span className="none">なし</span>}</div>

      <h2>出典（もとにした記事）</h2>
      <ul className="sources">
        {sortSources(shop.sources).map((src) => (
          <li key={src.url}>
            <span className={`kind ${src.kind}`}>{SOURCE_KIND_LABEL[src.kind]}</span>
            <a href={src.url} target="_blank" rel="noopener noreferrer" aria-label={`${src.title}（新しいタブ）`}>
              {src.title}<span aria-hidden="true">↗</span>
            </a>
            {src.note && <span className="src-note">{src.note}</span>}
          </li>
        ))}
      </ul>
      <p className="checked">出典を確かめた日: <time dateTime={SOURCES_CHECKED_AT}>{SOURCES_CHECKED_AT.replace(/-/g, "/")}</time></p>

      <nav className="shop-links" aria-label="このページから">
        <Link className="btn" href={keizuPath(shop.id)}>系図でこのお店を見る</Link>
        <Link className="btn" href="/shops">お店の一覧</Link>
        <a className="btn" href={correctionIssueUrl(shop)} target="_blank" rel="noopener noreferrer" aria-label="この情報を直す（GitHub、新しいタブ）">
          この情報を直す<span aria-hidden="true">↗</span>
        </a>
      </nav>
    </main>
  );
}
