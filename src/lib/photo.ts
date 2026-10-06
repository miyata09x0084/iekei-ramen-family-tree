import type { Photo, Shop } from "@/data/shops";
import { shopLabel } from "@/lib/shop-page";

/** どんぶり写真を持つ店。photo が付いている店だけを表示の対象にする */
export type ShopWithPhoto = Shop & { photo: Photo };

export function hasPhoto(shop: Shop): shop is ShopWithPhoto {
  return shop.photo !== undefined;
}

/** 写真ファイルの URL。実体は public/shops/<id>.jpg */
export function photoSrc(shop: ShopWithPhoto): string {
  return `/shops/${shop.id}.jpg`;
}

/** 代替テキスト。「屋号（補足）のメニュー名」。店名を出すときは shopLabel で揃える */
export function photoAlt(shop: ShopWithPhoto): string {
  return `${shopLabel(shop)}の${shop.photo.menu}`;
}

/** 写真の下の説明。メニュー名と撮影日だけを添える（撮影者や店の状態は書かない） */
export function photoCaption(shop: ShopWithPhoto): string {
  return `${shop.photo.menu}（${shop.photo.takenAt.replace(/-/g, "/")} 撮影）`;
}
