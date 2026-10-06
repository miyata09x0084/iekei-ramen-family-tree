import type { Shop } from "@/data/shops";
import { lineagePath } from "@/lib/ancestry";
import { REPO_URL } from "@/lib/site";

/** 店舗ページの URL。1 店を指して引用するときはこのパスを貼る */
export function shopPath(id: string): string {
  return `/shops/${id}`;
}

/** 系図（/）をその店が選択済みの状態で開く URL。Keizu.tsx が SHOP_QUERY を読む。引用には shopPath を使う */
export const SHOP_QUERY = "shop";
export function keizuPath(id: string): string {
  return `/?${SHOP_QUERY}=${id}`;
}

/** 屋号（補足）。補足が空なら屋号だけ。画面に店名を出すときはこれで揃える */
export function shopLabel(shop: Shop): string {
  return shop.sub ? `${shop.name}（${shop.sub}）` : shop.name;
}

/** 店舗ページの題名。layout.tsx のテンプレートでサイト名が後ろに付く */
export function shopTitle(shop: Shop): string {
  return `${shopLabel(shop)}の系譜と師匠・弟子`;
}

/** 検索結果とリンクのカードに出る説明文。系譜から組み立てるので、師匠や年を直せば説明文も追従する */
export function shopDescription(shop: Shop, byId: Map<string, Shop>): string {
  const year = `${shop.founded}年${shop.approx ? "頃" : ""}`;
  if (shop.lineage === "capital") {
    return `${shop.name}は、${year}に${shop.city}で始まった、会社が広げたお店（資本系）。出典を載せています。`;
  }
  if (shop.lineage === "root") {
    return `${shop.name}は、${year}に${shop.city}で開いた、家系ラーメンの始まりのお店。弟子と出典を載せています。`;
  }
  const path = lineagePath(shop.id, byId);
  const master = path[path.length - 2];
  const how =
    shop.edge === "inspired" ? `${master.name}に影響を受けて` :
    shop.edge === "disputed" ? `${master.name}で修行したと言われ（諸説あり）` :
    `${master.name}で修行して`;
  return `${shop.name}は、${how}${year}に${shop.city}で開いたお店。${path[0].name}までのつながりと、師匠・弟子・出典を載せています。`;
}

/** 世代。総本山が 0 で、師匠の数だけ増える（系図の配置で付く gen と同じ値）。資本系は null */
export function generationOf(shop: Shop, byId: Map<string, Shop>): number | null {
  if (shop.lineage === "capital") return null;
  return lineagePath(shop.id, byId).length - 1;
}

/**
 * 訂正を知らせる issue の新規作成 URL。題名に屋号を入れておき、1 クリックで立てられるようにする。
 * フォーム（.github/ISSUE_TEMPLATE/correction.yml）を指定しないと選択画面に飛ばされ、題名が消える
 */
export function correctionIssueUrl(shop: Shop): string {
  const params = new URLSearchParams({ template: "correction.yml", title: `${shopLabel(shop)}の情報の訂正` });
  return `${REPO_URL}/issues/new?${params}`;
}
