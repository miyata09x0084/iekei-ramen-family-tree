import type { Shop } from "@/data/shops";
import { shopLabel } from "@/lib/shop-page";

/** 画像の出典。Google の規約上、画像は保存せずこの URL から都度読み込む */
const EXTERIOR_SOURCE = "画像: Google ストリートビュー";

/**
 * 外観画像（Google ストリートビュー Static API）の URL。キーが無ければ null で、画面は何も出さない。
 * source=outdoor で店内のパノラマを避け、return_error_code=true で画像が無いときは灰色の代替画像でなく 404 にする
 * （画面側は 404 を受けて図ごと隠す）。640 は横幅の上限。
 */
export function exteriorImageUrl(shop: Shop, apiKey: string | undefined): string | null {
  if (!apiKey) return null;
  const { location, heading, pano } = shop.exterior;
  const params = new URLSearchParams({ size: "640x400", source: "outdoor", return_error_code: "true" });
  if (pano) params.set("pano", pano);
  else params.set("location", location);
  if (heading !== undefined) params.set("heading", String(heading));
  params.set("key", apiKey);
  return `https://maps.googleapis.com/maps/api/streetview?${params}`;
}

/** 画像の出典に、店の状態に応じた注記を添える。閉店した店は今の建物が別の店や更地でも誤解されないようにする */
export function exteriorCaption(shop: Shop): string {
  if (shop.status === "closed") return `${EXTERIOR_SOURCE}（かつてお店があった場所の、今の様子）`;
  if (shop.status === "main-closed") return `${EXTERIOR_SOURCE}（名前を受け継いだお店）`;
  return EXTERIOR_SOURCE;
}

export function exteriorAlt(shop: Shop): string {
  return `${shopLabel(shop)}の外観`;
}
