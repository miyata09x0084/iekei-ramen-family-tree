import type { ExteriorLocation, Shop } from "@/data/shops";
import { shopLabel } from "@/lib/shop-page";

/** 画像の出典。Google の規約上、画像は保存せずこの URL から都度読み込む */
const EXTERIOR_SOURCE = "画像: Google ストリートビュー";

const STREET_VIEW_API = "https://maps.googleapis.com/maps/api/streetview";

/**
 * 外観画像の位置を Street View Static API のパラメータにする。pano があれば住所より優先。
 * source=outdoor で店内のパノラマを避ける。画像と metadata（scripts/check-exterior.mts）で同じ地点を指すよう、ここで一本化する
 */
export function exteriorParams(exterior: ExteriorLocation): URLSearchParams {
  const params = new URLSearchParams({ source: "outdoor" });
  if (exterior.pano) params.set("pano", exterior.pano);
  else params.set("location", exterior.location);
  if (exterior.heading !== undefined) params.set("heading", String(exterior.heading));
  return params;
}

/**
 * 外観画像の URL。キーが無ければ null で、画面は何も出さない。
 * return_error_code=true で画像が無いときは灰色の代替画像でなく 404 にする（画面側は 404 を受けて図ごと隠す）。640 は横幅の上限。
 */
export function exteriorImageUrl(exterior: ExteriorLocation, apiKey: string | undefined): string | null {
  if (!apiKey) return null;
  const params = exteriorParams(exterior);
  params.set("size", "640x400");
  params.set("return_error_code", "true");
  params.set("key", apiKey);
  return `${STREET_VIEW_API}?${params}`;
}

/** 画像があるかを無料で確かめる metadata の URL。枠を消費しない */
export function exteriorMetadataUrl(exterior: ExteriorLocation, apiKey: string): string {
  const params = exteriorParams(exterior);
  params.set("key", apiKey);
  return `${STREET_VIEW_API}/metadata?${params}`;
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
